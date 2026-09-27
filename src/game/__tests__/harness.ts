/**
 * Shared test harness: a scripted 2-player bot that drives a room from the
 * lobby to a terminal phase using each puzzle's own solve() oracle. Not a test
 * file itself (no *.test.ts), so vitest imports it without collecting it.
 */
import { apply, createRoom, tick } from "@/game/engine";
import { CODE_ALPHABET } from "@/game/codes";
import { PUZZLES } from "@/game/puzzles";
import type { Mode, RoomState } from "@/game/types";

export const P0 = "p0";
export const P1 = "p1";
export const TOKEN0 = "SECRET_ALPHA";
export const TOKEN1 = "SECRET_BRAVO";

/** A distinct valid 4-letter code per iteration → a distinct non-daily seed. */
export function codeFor(i: number): string {
  const A = CODE_ALPHABET;
  return A[i % 24] + A[(i * 7) % 24] + A[(i * 13) % 24] + A[(i * 5 + 3) % 24];
}

/** Seat both players, pick the mode, start, and ack the briefing → stage 0. */
export function toStageZero(mode: Mode, code: string, now: number): RoomState {
  let s = createRoom(code, now);
  s = apply(s, P0, { type: "join", playerId: P0, token: TOKEN0, name: "Ava", avatar: {} }, now).state;
  s = apply(s, P1, { type: "join", playerId: P1, token: TOKEN1, name: "Bo", avatar: {} }, now).state;
  s = apply(s, P0, { type: "create", mode }, now).state;
  s = apply(s, P0, { type: "start" }, now).state;
  s = apply(s, P0, { type: "ready" }, now).state;
  s = apply(s, P1, { type: "ready" }, now).state;
  return s;
}

/** The player id holding `role` on stage `idx` (players[idx % 2] is role A). */
export function playerForRole(state: RoomState, idx: number, role: "A" | "B"): string {
  return state.players[(idx + (role === "A" ? 0 : 1)) % 2].id;
}

/** Optional per-stage inspection hook, called once when each stage becomes active. */
export type StageHook = (state: RoomState, idx: number) => void;

/** Drive the bot to a terminal phase, solving every stage via solve()+apply. */
export function driveRun(start: RoomState, startNow: number, hook?: StageHook): RoomState {
  let s = start;
  let now = startNow;
  let guard = 0;
  while ((s.phase === "stage" || s.phase === "stageClear") && guard++ < 1000) {
    if (s.phase === "stageClear") {
      now += 2600;
      s = tick(s, now).state;
      continue;
    }
    const run = s.run;
    if (!run) break;
    const idx = run.stageIndex;
    const stage = s.stages[idx];
    hook?.(s, idx);
    const mod = PUZZLES[stage.type];
    for (const step of mod.solve(stage.state)) {
      const pid = playerForRole(s, idx, step.role);
      s = apply(s, pid, { type: "action", stageIndex: idx, payload: step.action }, now).state;
    }
    // Guard against a stage that failed to solve (would otherwise loop forever).
    if (s.phase === "stage" && s.run?.stageIndex === idx) break;
  }
  return s;
}
