/**
 * Scoring and the persisted run record. Score rewards remaining time and unused
 * hints and penalises strikes (SPEC.md "Scoring"). Failures score 0 but still
 * record how far the duo got.
 */
import { hashSeed } from "../rng";
import type { RoomState, RunRecord, RunState } from "../types";
import { HINT_PENALTY_MS, STRIKE_PENALTY_MS } from "./config";

/**
 * Escape score in points: (remaining ms + 30s×unused hints − 20s×strikes),
 * floored at 0, then divided by 100 and rounded so scores read as human-sized
 * point totals rather than raw milliseconds (SPEC.md "Scoring").
 */
export function scoreRun(timeLeftMs: number, hintsLeft: number, strikes: number): number {
  const ms = Math.max(0, timeLeftMs + HINT_PENALTY_MS * hintsLeft - 20_000 * strikes);
  return Math.round(ms / 100);
}

/** Deterministic run id from the seed and start time. */
export function runIdFor(seed: string, startedAt: number): string {
  return `run_${hashSeed(`${seed}:${startedAt}`).toString(36)}`;
}

/** Count of stages solved so far. */
export function stagesCleared(state: RoomState): number {
  return state.stages.filter((s) => s.solvedAt !== undefined).length;
}

/** Build the end-of-run record. Token hashes are filled in by the server. */
export function buildRecord(state: RoomState, run: RunState, now: number, escaped: boolean): RunRecord {
  const timeLeftMs = escaped ? Math.max(0, run.deadline - now) : 0;
  const score = escaped ? scoreRun(timeLeftMs, run.hintsLeft, run.strikes) : 0;
  return {
    id: state.runId ?? runIdFor(state.seed, run.startedAt),
    code: state.code,
    mode: state.mode,
    seed: state.seed,
    dailyKey: state.dailyKey,
    escaped,
    stagesCleared: stagesCleared(state),
    total: state.stages.length,
    timeLeftMs,
    strikes: run.strikes,
    hintsUsed: run.hintsUsed,
    score,
    startedAt: run.startedAt,
    endedAt: now,
    players: state.players.map((p, seat) => ({
      seat,
      name: p.name,
      avatar: p.avatar,
      tokenHash: "",
    })),
  };
}

// Re-export so callers importing scoring also see the strike penalty knob.
export { STRIKE_PENALTY_MS };
