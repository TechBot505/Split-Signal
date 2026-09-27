/**
 * viewFor: the per-player projection of a room. It NEVER includes tokens and
 * NEVER includes the other role's puzzle view — the current player only ever
 * sees viewA OR viewB for the active stage. See SPEC.md "Protocol" (RoomView).
 */
import { getPuzzle } from "../puzzles";
import type { ClientRunRecord, Player, RoomState, RoomView, RunView, StageSummary } from "../types";
import { roleForStage } from "./stage";

/** Strip the server-side token from a player record. */
function publicPlayer(p: RoomState["players"][number]): Player {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    connected: p.connected,
    ready: p.ready,
    joinedAt: p.joinedAt,
  };
}

/** Drop the secret `seed` from a run record before it reaches any client. */
function clientResult(result: RoomState["result"]): ClientRunRecord | undefined {
  if (!result) return undefined;
  const { seed: _seed, ...rest } = result;
  void _seed;
  return rest;
}

/** Highest stage index whose type may be revealed (current + past only). */
function revealedUpTo(state: RoomState): number {
  if (state.run) return state.run.stageIndex;
  return state.phase === "briefing" ? 0 : -1;
}

function stageSummaries(state: RoomState): StageSummary[] {
  const reveal = revealedUpTo(state);
  return state.stages.map((stage, index) => {
    const shown = index <= reveal;
    const mod = shown ? getPuzzle(stage.type) : undefined;
    return {
      index,
      type: shown ? stage.type : null,
      name: mod ? mod.name : null,
      solved: stage.solvedAt !== undefined,
    };
  });
}

/** Build the active-run view for `playerId`, exposing only their own role's half. */
function runView(state: RoomState, playerId: string): { role: "A" | "B" | null; run?: RunView } {
  const run = state.run;
  if (!run || (state.phase !== "stage" && state.phase !== "stageClear")) return { role: null };
  const stage = state.stages[run.stageIndex];
  const mod = getPuzzle(stage.type);
  const role = roleForStage(state, playerId, run.stageIndex);
  if (!mod || !role) return { role };
  const puzzleView = role === "A" ? mod.viewA(stage.state) : mod.viewB(stage.state);
  return {
    role,
    run: {
      stageIndex: run.stageIndex,
      total: state.stages.length,
      deadline: run.deadline,
      pausedAt: run.pausedAt,
      pausedTotalMs: run.pausedTotalMs,
      strikes: run.strikes,
      hintsLeft: run.hintsLeft,
      hintsUsed: run.hintsUsed,
      hintText: run.hintText,
      stageType: stage.type,
      stageName: mod.name,
      stageDifficulty: stage.difficulty,
      puzzleView,
      stageBriefing: mod.briefing[role],
      canAct: mod.canAct(stage.state, role),
    },
  };
}

/**
 * Project the room for one player. `now` is part of the transport contract
 * (parity with apply/tick); deadlines are absolute epoch-ms, so the projection
 * itself does not need it.
 */
export function viewFor(state: RoomState, playerId: string, now: number): RoomView {
  void now;
  const { role, run } = runView(state, playerId);
  return {
    code: state.code,
    phase: state.phase,
    you: playerId,
    role,
    players: state.players.map(publicPlayer),
    mode: state.mode,
    run,
    stages: stageSummaries(state),
    result: clientResult(state.result),
  };
}
