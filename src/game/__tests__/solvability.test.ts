/**
 * Deterministic solvability stress test. Drives 300 full runs per mode through
 * the real engine using each puzzle's solve() oracle, and separately confirms
 * every puzzle type solves from generate() across all difficulties. This is the
 * in-process reproduction of the E2E "solve() over websocket" agent, minus the
 * network — a Standard stall would surface here as a non-escape or a strike.
 */
import { describe, expect, it } from "vitest";
import { CODE_ALPHABET } from "@/game/codes";
import { PUZZLES } from "@/game/puzzles";
import type { Difficulty } from "@/game/puzzles/types";
import type { Mode } from "@/game/types";
import { driveRun, toStageZero } from "./harness";

const SEEDS = 300;
const MODES: Mode[] = ["quick", "standard", "hard", "daily"];
const DIFFS: Difficulty[] = [1, 2, 3, 4, 5];
const DAY = 86_400_000;
const BASE = 1_700_000_000_000;

/** Distinct valid 4-letter code per i (base-24 over the code alphabet). */
function codeN(i: number): string {
  const A = CODE_ALPHABET;
  return A[i % 24] + A[Math.floor(i / 24) % 24] + A[Math.floor(i / 576) % 24] + A[Math.floor(i / 13824) % 24];
}

describe("engine escapes cleanly across 300 seeds per mode", () => {
  for (const mode of MODES) {
    it(`${mode}: escapes with 0 strikes`, () => {
      for (let i = 0; i < SEEDS; i++) {
        // Daily seed is date-derived, so vary the day; others vary by code.
        const now = mode === "daily" ? BASE + i * DAY : BASE;
        const final = driveRun(toStageZero(mode, codeN(i), now), now);
        expect(final.phase, `${mode} seed ${i}`).toBe("escaped");
        expect(final.result?.escaped, `${mode} seed ${i}`).toBe(true);
        expect(final.result?.strikes, `${mode} seed ${i} took a strike`).toBe(0);
        expect(final.result?.stagesCleared).toBe(final.stages.length);
      }
    });
  }
});

describe("every puzzle solves from generate() across difficulty 1-5 × 300 seeds", () => {
  for (const [id, mod] of Object.entries(PUZZLES)) {
    it(`${id}: solve() reaches solved`, () => {
      for (const d of DIFFS) {
        for (let i = 0; i < SEEDS; i++) {
          let s = mod.generate(`ss-${id}-${i}`, d);
          let last: string = "progress";
          for (const step of mod.solve(s)) {
            const r = mod.apply(s, step.role, step.action);
            expect(r.outcome, `${id} d${d} seed ${i}`).not.toBe("strike");
            expect(r.outcome, `${id} d${d} seed ${i}`).not.toBe("invalid");
            s = r.state;
            last = r.outcome;
          }
          expect(last, `${id} d${d} seed ${i} did not solve`).toBe("solved");
        }
      }
    });
  }
});
