/**
 * Cloudflare Worker + Durable Object realtime transport for Split Signal.
 *
 * A THIN adapter: all game logic lives in the pure engine (src/game). The DO
 * drives the engine with `apply` / `tick` / `handleDisconnect` and runs the
 * returned effects (broadcast, schedule, error, signal, event, runOver).
 *
 * Hibernation-safe: the playerId↔connection binding lives in the connection's
 * `state` attachment and the room state in DO storage, so both survive
 * hibernation. `this.state` is a lazy cache; the room code is `this.name`.
 */
import { type Connection, routePartykitRequest, Server, type WSMessage } from "partyserver";
import { parseClientMessage, type ServerMessage } from "../src/game/protocol";
import { apply, createRoom, type Effect, handleDisconnect, tick, viewFor } from "../src/game/engine";
import type { RoomState } from "../src/game/types";
import { postRunRecord } from "./post-run";
import { MessageThrottle } from "./throttle";

const MAX_MESSAGE_BYTES = 4096;
const STORAGE_KEY = "room";

interface Env {
  /** Public app origin the server POSTs finished runs to. Empty = disabled. */
  NEXT_PUBLIC_APP_URL?: string;
  /** Shared secret for the /api/runs POST. Empty = persistence disabled. */
  REALTIME_SECRET?: string;
  /** Optional secret salt mixed into puzzle generation. Empty = unset. */
  SEED_SALT?: string;
  main: DurableObjectNamespace;
}

/** Per-connection attachment binding a socket to its seat's playerId. */
interface ConnState {
  playerId: string;
}

export class SplitSignalRoom extends Server<Env> {
  static options = { hibernate: true };
  private state: RoomState | null = null;
  private throttle = new MessageThrottle();

  async onStart(): Promise<void> {
    try {
      const saved = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
      if (saved) this.state = saved;
    } catch (err) {
      console.error("onStart failed", err);
    }
  }

  async onMessage(conn: Connection<ConnState>, message: WSMessage): Promise<void> {
    if (typeof message !== "string" || message.length > MAX_MESSAGE_BYTES) return;
    const now = Date.now();
    const gate = this.throttle.hit(conn.id, now); // per-connection fixed-window throttle
    if (gate.firstDrop) conn.send(JSON.stringify({ type: "error", code: "rate_limited", message: "Slow down." } satisfies ServerMessage));
    if (gate.limited) return;
    let raw: unknown;
    try {
      raw = JSON.parse(message);
    } catch {
      return;
    }
    const parsed = parseClientMessage(raw);
    if (!parsed.success) return;
    const msg = parsed.data;
    // Ping is a transport-level liveness check; the engine treats it as a no-op.
    if (msg.type === "ping") {
      conn.send(JSON.stringify({ type: "pong", now } satisfies ServerMessage));
      return;
    }
    try {
      const state = await this.ensureState(now);
      if (msg.type === "join") {
        const result = apply(state, msg.playerId, msg, now);
        // Only bind the seat once the join is accepted (no error effect).
        if (!result.effects.some((e) => e.t === "error")) conn.setState({ playerId: msg.playerId });
        this.state = result.state;
        await this.runEffects(result.state, result.effects, now, conn);
        return;
      }
      const playerId = conn.state?.playerId;
      if (!playerId) return;
      const result = apply(state, playerId, msg, now);
      this.state = result.state;
      await this.runEffects(result.state, result.effects, now, conn);
    } catch (err) {
      console.error("onMessage failed", err);
    }
  }

  async onClose(conn: Connection<ConnState>): Promise<void> {
    this.throttle.forget(conn.id);
    const playerId = conn.state?.playerId;
    // Ignore if the player still holds another live socket (reconnect race).
    if (!playerId || this.connForPlayer(playerId, conn.id)) return;
    const now = Date.now();
    try {
      const state = await this.ensureState(now);
      const result = handleDisconnect(state, playerId, now);
      this.state = result.state;
      await this.runEffects(result.state, result.effects, now);
    } catch (err) {
      console.error("onClose failed", err);
    }
  }

  async onAlarm(): Promise<void> {
    const now = Date.now();
    try {
      const state = await this.ensureState(now);
      const result = tick(state, now);
      this.state = result.state;
      await this.runEffects(result.state, result.effects, now);
    } catch (err) {
      console.error("onAlarm failed", err);
    }
  }

  /** Lazily restore or create the room state (code = this.name). */
  private async ensureState(now: number): Promise<RoomState> {
    if (this.state) return this.state;
    const saved = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
    this.state = saved ?? createRoom(this.name, now, this.env.SEED_SALT || undefined);
    return this.state;
  }

  /** Find a live connection for `playerId`, optionally excluding one id. */
  private connForPlayer(playerId: string, exclude?: string): Connection<ConnState> | undefined {
    for (const c of this.getConnections<ConnState>()) {
      if (c.id !== exclude && c.state?.playerId === playerId) return c;
    }
    return undefined;
  }

  /** Perform the I/O the pure engine asked for. Persists state when it changed. */
  private async runEffects(
    state: RoomState,
    effects: Effect[],
    now: number,
    sender?: Connection<ConnState>,
  ): Promise<void> {
    let dirty = false;
    for (const e of effects) {
      switch (e.t) {
        case "broadcast":
          this.broadcastState(state, now);
          dirty = true;
          break;
        case "schedule":
          await this.scheduleAlarm(e.at);
          break;
        case "error":
          this.sendTo(e.to, { type: "error", code: e.code, message: e.message }, sender);
          break;
        case "signal":
          // Signals and events fan out to both players (partner sees the pulse).
          this.broadcast(JSON.stringify({ type: "signal", from: e.from, kind: e.kind } satisfies ServerMessage));
          break;
        case "event":
          this.broadcast(JSON.stringify({ type: "event", kind: e.kind, stageIndex: e.stageIndex, message: e.message } satisfies ServerMessage));
          break;
        case "runOver":
          dirty = true;
          await postRunRecord(this.env.NEXT_PUBLIC_APP_URL, this.env.REALTIME_SECRET, state, e.record);
          break;
      }
    }
    if (dirty) await this.ctx.storage.put(STORAGE_KEY, state);
  }

  /** Send each connected player their own role-specific projection. */
  private broadcastState(state: RoomState, now: number): void {
    for (const conn of this.getConnections<ConnState>()) {
      const playerId = conn.state?.playerId;
      if (!playerId) continue;
      conn.send(JSON.stringify({ type: "state", view: viewFor(state, playerId, now) } satisfies ServerMessage));
    }
  }

  /** Send a message to one player, falling back to the originating socket. */
  private sendTo(playerId: string, msg: ServerMessage, fallback?: Connection<ConnState>): void {
    const conn = this.connForPlayer(playerId) ?? fallback;
    conn?.send(JSON.stringify(msg));
  }

  /** Arm the alarm at `at`, keeping the earliest pending time. */
  private async scheduleAlarm(at: number): Promise<void> {
    const existing = await this.ctx.storage.getAlarm();
    if (existing === null || at < existing) await this.ctx.storage.setAlarm(at);
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (await routePartykitRequest(request, env)) ?? new Response("Not Found", { status: 404 });
  },
};

export default worker;
