/**
 * In-stage client actions: puzzle actions, hints, pause/resume and signals.
 * Every handler validates fully and returns a targeted error rather than
 * throwing. See SPEC.md "Game rules".
 */
import { getPuzzle } from "../puzzles";
import type { RoomState, SignalKind } from "../types";
import { HINT_PENALTY_MS } from "./config";
import { fail, type Transition } from "./effects";
import { bothConnected, handleSolve, handleStrike, isPaused, roleForStage } from "./stage";

/** Route a puzzle action through canAct + schema validation + puzzle.apply. */
export function applyAction(
  state: RoomState,
  playerId: string,
  stageIndex: number,
  payload: unknown,
  now: number,
): Transition {
  const run = state.run;
  if (state.phase !== "stage" || !run) return fail(state, playerId, "invalid_action", "No active stage.");
  if (isPaused(run)) return fail(state, playerId, "paused", "The run is paused.");
  if (stageIndex !== run.stageIndex) return fail(state, playerId, "invalid_action", "Wrong stage.");
  const stage = state.stages[run.stageIndex];
  const mod = getPuzzle(stage.type);
  if (!mod) return fail(state, playerId, "invalid_action", "Unknown puzzle.");
  const role = roleForStage(state, playerId, run.stageIndex);
  if (!role) return fail(state, playerId, "not_in_room", "You are not seated in this room.");
  if (!mod.canAct(stage.state, role)) {
    return fail(state, playerId, "invalid_action", "Not your move.");
  }
  const parsed = mod.actionSchema.safeParse(payload);
  if (!parsed.success) return fail(state, playerId, "invalid_action", "Malformed action.");
  const res = mod.apply(stage.state, role, parsed.data);
  // Only commit the new puzzle state once the action is accepted; an 'invalid'
  // outcome must leave stage.state untouched.
  if (res.outcome === "invalid") return fail(state, playerId, "invalid_action", res.message ?? "Rejected.");
  stage.state = res.state;
  if (res.outcome === "strike") return handleStrike(state, run, now, res.message);
  if (res.outcome === "solved") return handleSolve(state, run, now);
  return { state, effects: [{ t: "broadcast" }] };
}

/** Spend a hint: reveal the puzzle's hint to both players, costing 30s. */
export function applyHint(state: RoomState, playerId: string): Transition {
  const run = state.run;
  if (state.phase !== "stage" || !run) return fail(state, playerId, "invalid_action", "No active stage.");
  if (isPaused(run)) return fail(state, playerId, "paused", "The run is paused.");
  if (run.hintsLeft <= 0) return fail(state, playerId, "no_hints", "No hints remaining.");
  const stage = state.stages[run.stageIndex];
  const mod = getPuzzle(stage.type);
  if (!mod) return fail(state, playerId, "invalid_action", "Unknown puzzle.");
  run.hintsLeft -= 1;
  run.hintsUsed += 1;
  run.hintText = mod.hint(stage.state);
  run.deadline -= HINT_PENALTY_MS;
  return {
    state,
    effects: [
      { t: "event", kind: "hint", stageIndex: run.stageIndex, message: run.hintText },
      { t: "broadcast" },
      { t: "schedule", at: run.deadline },
    ],
  };
}

/** Either player may pause during a stage; the shared countdown freezes. */
export function applyPause(state: RoomState, playerId: string, now: number): Transition {
  const run = state.run;
  if (state.phase !== "stage" || !run) return fail(state, playerId, "invalid_action", "Nothing to pause.");
  if (!isPaused(run)) run.pausedAt = now;
  return { state, effects: [{ t: "broadcast" }] };
}

/** Resume only when both seats are connected; shifts the deadline by paused time. */
export function applyResume(state: RoomState, playerId: string, now: number): Transition {
  const run = state.run;
  if (!run || !isPaused(run)) return fail(state, playerId, "not_paused", "The run is not paused.");
  if (!bothConnected(state)) return fail(state, playerId, "partner_offline", "Both players must be connected.");
  const delta = now - (run.pausedAt ?? now);
  run.pausedTotalMs += delta;
  run.deadline += delta;
  run.pausedAt = undefined;
  return { state, effects: [{ t: "broadcast" }, { t: "schedule", at: run.deadline }] };
}

/** Relay a signal ping to the partner (no state change). */
export function applySignal(state: RoomState, playerId: string, kind: SignalKind): Transition {
  return { state, effects: [{ t: "signal", from: playerId, kind }] };
}
