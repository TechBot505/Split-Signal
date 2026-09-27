/**
 * Room lifecycle: creation, seating (join / reconnect), briefing readiness,
 * starting a run, replay, and disconnect handling. See SPEC.md "Game rules".
 */
import { dateKeyUTC } from "../daily";
import { getPuzzle, pickStages } from "../puzzles";
import type { RoomState, RunState } from "../types";
import { HINTS_PER_RUN, MODE_CONFIG, seedFor } from "./config";
import { fail, type Transition } from "./effects";
import { runIdFor } from "./score";
import { isPaused } from "./stage";

/** A fresh room in the lobby. Mode defaults to standard until `create` sets it. */
export function createRoom(code: string, now: number, salt?: string): RoomState {
  return {
    code,
    mode: "standard",
    gameNumber: 0,
    seed: seedFor("standard", code, 0, now),
    salt: salt || undefined,
    createdAt: now,
    phase: "lobby",
    players: [],
    stages: [],
  };
}

/** Generation seed for stage `i`, folding in the optional secret salt. */
function stageSeed(seed: string, i: number, salt?: string): string {
  return salt ? `${salt}|${seed}#${i}` : `${seed}#${i}`;
}

function refreshSeed(state: RoomState, now: number): void {
  state.seed = seedFor(state.mode, state.code, state.gameNumber, now);
  state.dailyKey = state.mode === "daily" ? dateKeyUTC(now) : undefined;
}

/** Seat a player, reconnect an existing seat, or reject a full/second-token seat. */
export function join(
  state: RoomState,
  playerId: string,
  token: string,
  name: string,
  avatar: Record<string, unknown>,
  now: number,
): Transition {
  const existing = state.players.find((p) => p.id === playerId);
  if (existing) {
    if (existing.token !== token) return fail(state, playerId, "seat_taken", "That seat is taken.");
    existing.connected = true;
    existing.name = name;
    existing.avatar = avatar;
    return { state, effects: [{ t: "broadcast" }] };
  }
  if (state.players.length >= 2) return fail(state, playerId, "room_full", "This room is full.");
  state.players.push({ id: playerId, name, avatar, connected: true, ready: false, joinedAt: now, token });
  if (!state.hostId) state.hostId = playerId;
  return { state, effects: [{ t: "broadcast" }] };
}

/** Host sets the run mode while still in the lobby. */
export function create(state: RoomState, playerId: string, mode: RoomState["mode"], now: number): Transition {
  if (state.phase !== "lobby") return fail(state, playerId, "invalid_action", "Already started.");
  if (playerId !== state.hostId) return fail(state, playerId, "not_host", "Only the host can set the mode.");
  state.mode = mode;
  refreshSeed(state, now);
  return { state, effects: [{ t: "broadcast" }] };
}

/** Host starts the run: plan + generate all stages, move to briefing. */
export function start(state: RoomState, playerId: string, now: number): Transition {
  if (state.phase !== "lobby") return fail(state, playerId, "invalid_action", "Already started.");
  if (playerId !== state.hostId) return fail(state, playerId, "not_host", "Only the host can start.");
  if (state.players.length !== 2) return fail(state, playerId, "need_two", "Two players are required.");
  refreshSeed(state, now);
  const cfg = MODE_CONFIG[state.mode];
  state.stages = pickStages(state.seed, cfg.stages, state.mode).map((plan, i) => {
    const mod = getPuzzle(plan.type);
    if (!mod) throw new Error(`unknown puzzle ${plan.type}`);
    return {
      type: plan.type,
      difficulty: plan.difficulty,
      state: mod.generate(stageSeed(state.seed, i, state.salt), plan.difficulty),
      strikes: 0,
    };
  });
  state.players.forEach((p) => (p.ready = false));
  state.phase = "briefing";
  return { state, effects: [{ t: "broadcast" }] };
}

/** Begin stage 0 once both players have acked the briefing. */
function beginStages(state: RoomState, now: number): Transition {
  const run: RunState = {
    stageIndex: 0,
    startedAt: now,
    deadline: now + MODE_CONFIG[state.mode].budgetMs,
    pausedTotalMs: 0,
    strikes: 0,
    hintsLeft: HINTS_PER_RUN,
    hintsUsed: 0,
  };
  state.run = run;
  state.runId = runIdFor(state.seed, now);
  state.phase = "stage";
  return {
    state,
    effects: [
      { t: "event", kind: "stageStart", stageIndex: 0 },
      { t: "broadcast" },
      { t: "schedule", at: run.deadline },
    ],
  };
}

/** Briefing acknowledgement; both ready → the run begins. */
export function ready(state: RoomState, playerId: string, now: number): Transition {
  if (state.phase !== "briefing") return fail(state, playerId, "invalid_action", "Not in briefing.");
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return fail(state, playerId, "not_in_room", "You are not seated in this room.");
  p.ready = true;
  if (state.players.length === 2 && state.players.every((x) => x.ready)) return beginStages(state, now);
  return { state, effects: [{ t: "broadcast" }] };
}

/** Return to the lobby with the same players and a fresh seed for a new game. */
export function playAgain(state: RoomState, playerId: string, now: number): Transition {
  if (state.phase !== "escaped" && state.phase !== "failed") {
    return fail(state, playerId, "invalid_action", "The run is still going.");
  }
  state.gameNumber += 1;
  refreshSeed(state, now);
  state.stages = [];
  state.run = undefined;
  state.result = undefined;
  state.runId = undefined;
  state.stageClearUntil = undefined;
  state.phase = "lobby";
  state.players.forEach((p) => (p.ready = false));
  return { state, effects: [{ t: "broadcast" }] };
}

/** A socket dropped (or the player left): mark offline and auto-pause a stage. */
export function handleDisconnect(state: RoomState, playerId: string, now: number): Transition {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return { state, effects: [] };
  p.connected = false;
  const run = state.run;
  if (state.phase === "stage" && run && !isPaused(run)) run.pausedAt = now;
  return { state, effects: [{ t: "broadcast" }] };
}
