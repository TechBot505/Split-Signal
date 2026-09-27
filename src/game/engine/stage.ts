/**
 * Stage lifecycle: starting the run, advancing between stages, applying strikes
 * and solves, finishing the run, and the time-driven `tick`. Roles swap each
 * stage — for stage i, players[i % 2] is role A.
 */
import { getPuzzle } from "../puzzles";
import type { Role } from "../puzzles/types";
import type { RoomState, RunState } from "../types";
import { MAX_STRIKES, STAGE_CLEAR_MS, STRIKE_PENALTY_MS } from "./config";
import type { Effect, Transition } from "./effects";
import { buildRecord } from "./score";

/** The role a player holds on a given stage (null if not seated). */
export function roleForStage(state: RoomState, playerId: string, stageIndex: number): Role | null {
  const idx = state.players.findIndex((p) => p.id === playerId);
  if (idx < 0) return null;
  return idx === stageIndex % 2 ? "A" : "B";
}

/** True while the run's shared countdown is frozen. */
export function isPaused(run: RunState): boolean {
  return run.pausedAt !== undefined;
}

/** Both seats currently connected? */
export function bothConnected(state: RoomState): boolean {
  return state.players.length === 2 && state.players.every((p) => p.connected);
}

/** Finish the run: set the terminal phase, stamp the record, emit runOver. */
export function finishRun(state: RoomState, run: RunState, now: number, escaped: boolean): Transition {
  state.phase = escaped ? "escaped" : "failed";
  const record = buildRecord(state, run, now, escaped);
  state.result = record;
  return {
    state,
    effects: [
      { t: "event", kind: escaped ? "escaped" : "failed", stageIndex: run.stageIndex },
      { t: "broadcast" },
      { t: "runOver", record },
    ],
  };
}

/** Move to the next stage (or finish with an escape after the finale). */
export function advanceStage(state: RoomState, now: number): Transition {
  const run = state.run;
  if (!run) return { state, effects: [] };
  const last = state.stages.length - 1;
  if (run.stageIndex >= last) return finishRun(state, run, now, true);
  run.stageIndex += 1;
  run.hintText = undefined;
  state.phase = "stage";
  state.stageClearUntil = undefined;
  return {
    state,
    effects: [
      { t: "event", kind: "stageStart", stageIndex: run.stageIndex },
      { t: "broadcast" },
      { t: "schedule", at: run.deadline },
    ],
  };
}

/** Enter stage 0 once both players are ready. Sets the shared countdown. */
export function handleStrike(
  state: RoomState,
  run: RunState,
  now: number,
  message?: string,
): Transition {
  run.strikes += 1;
  state.stages[run.stageIndex].strikes += 1;
  run.deadline -= STRIKE_PENALTY_MS;
  const strikeEvent: Effect = { t: "event", kind: "strike", stageIndex: run.stageIndex, message };
  if (run.strikes >= MAX_STRIKES) {
    const done = finishRun(state, run, now, false);
    return { state, effects: [strikeEvent, ...done.effects] };
  }
  return { state, effects: [strikeEvent, { t: "broadcast" }, { t: "schedule", at: run.deadline }] };
}

/** A stage solved: pause 2.5s on the "stageClear" screen, then advance. */
export function handleSolve(state: RoomState, run: RunState, now: number): Transition {
  state.stages[run.stageIndex].solvedAt = now;
  const solvedEvent: Effect = { t: "event", kind: "solved", stageIndex: run.stageIndex };
  const last = state.stages.length - 1;
  if (run.stageIndex >= last) {
    const done = finishRun(state, run, now, true);
    return { state, effects: [solvedEvent, ...done.effects] };
  }
  state.phase = "stageClear";
  state.stageClearUntil = now + STAGE_CLEAR_MS;
  return {
    state,
    effects: [solvedEvent, { t: "broadcast" }, { t: "schedule", at: state.stageClearUntil }],
  };
}

/** Time-driven transitions: countdown expiry and the stageClear timer. */
export function tick(state: RoomState, now: number): Transition {
  const run = state.run;
  if (state.phase === "stage" && run && !isPaused(run) && now >= run.deadline) {
    return finishRun(state, run, now, false);
  }
  if (state.phase === "stageClear" && state.stageClearUntil !== undefined && now >= state.stageClearUntil) {
    return advanceStage(state, now);
  }
  return { state, effects: [] };
}

/** Guard: the puzzle module for the current stage, if any. */
export function currentPuzzle(state: RoomState) {
  const run = state.run;
  if (!run) return undefined;
  const stage = state.stages[run.stageIndex];
  return stage ? getPuzzle(stage.type) : undefined;
}
