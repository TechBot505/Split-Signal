import { describe, expect, it } from "vitest";
import { apply, createRoom, viewFor } from "@/game/engine";
import type { Mode, RoomState } from "@/game/types";
import { codeFor, driveRun, playerForRole, toStageZero, TOKEN0, TOKEN1 } from "./harness";

const SEEDS = 20;
const MODES: Mode[] = ["quick", "standard", "hard", "daily"];
const DAY = 86_400_000;

/** Assert a completed run escaped and cleared every stage. */
function expectEscaped(final: RoomState): void {
  expect(final.phase).toBe("escaped");
  expect(final.result?.escaped).toBe(true);
  expect(final.result?.stagesCleared).toBe(final.stages.length);
  expect(final.stages.every((s) => s.solvedAt !== undefined)).toBe(true);
}

describe("engine full runs", () => {
  for (const mode of MODES) {
    it(`${mode}: escapes across ${SEEDS} seeds`, () => {
      for (let i = 0; i < SEEDS; i++) {
        // Daily seed is date-derived, so vary the day; others vary by code.
        const now = mode === "daily" ? 1_700_000_000_000 + i * DAY : 1_700_000_000_000;
        const start = toStageZero(mode, codeFor(i), now);
        expectEscaped(driveRun(start, now));
      }
    });
  }

  it("distinct types with the vault finale last", () => {
    const s = toStageZero("hard", codeFor(3), 1_700_000_000_000);
    const types = s.stages.map((x) => x.type);
    expect(new Set(types).size).toBe(types.length);
    expect(types[types.length - 1]).toBe("vault");
  });

  it("difficulty ramps up and ends at the mode's ceiling", () => {
    const s = toStageZero("hard", codeFor(4), 1_700_000_000_000);
    const diffs = s.stages.map((x) => x.difficulty);
    expect(diffs[0]).toBe(2);
    expect(diffs[diffs.length - 1]).toBe(5);
    expect(diffs[0]).toBeLessThan(diffs[diffs.length - 1]);
  });
});

describe("role swap + view isolation", () => {
  it("roles swap every stage (players[idx % 2] is A)", () => {
    const now = 1_700_000_000_000;
    const start = toStageZero("standard", codeFor(1), now);
    const seen: number[] = [];
    driveRun(start, now, (s, idx) => {
      seen.push(idx);
      const p0Role = viewFor(s, "p0", now).role;
      expect(p0Role).toBe(idx % 2 === 0 ? "A" : "B");
    });
    // Every stage was visited exactly once, in order.
    expect(seen).toEqual(s0Range(start.stages.length));
  });

  it("neither role's view leaks the other's puzzle view or any token", () => {
    const now = 1_700_000_000_000;
    for (const mode of MODES) {
      const start = toStageZero(mode, codeFor(9), now);
      driveRun(start, now, (s, idx) => {
        const aPid = playerForRole(s, idx, "A");
        const bPid = playerForRole(s, idx, "B");
        const aView = viewFor(s, aPid, now);
        const bView = viewFor(s, bPid, now);
        const aJson = JSON.stringify(aView.run?.puzzleView);
        const bJson = JSON.stringify(bView.run?.puzzleView);
        expect(aView.role).toBe("A");
        expect(bView.role).toBe("B");
        expect(aJson).not.toBe(bJson);
        expect(aJson.includes(bJson)).toBe(false);
        expect(bJson.includes(aJson)).toBe(false);
        for (const full of [JSON.stringify(aView), JSON.stringify(bView)]) {
          expect(full.includes(TOKEN0)).toBe(false);
          expect(full.includes(TOKEN1)).toBe(false);
          expect(full.includes('"token"')).toBe(false);
        }
      });
    }
  });
});

describe("seed & salt never leak into any view", () => {
  it("view JSON contains neither the seed nor the salt, mid-run or at result", () => {
    const now = 1_700_000_000_000;
    const salt = "S3CR3T_SALT_XYZ";
    // Build a daily room WITH a salt (daily previously surfaced the seed).
    let s = createRoom(codeFor(2), now, salt);
    s = apply(s, "p0", { type: "join", playerId: "p0", token: TOKEN0, name: "Ava", avatar: {} }, now).state;
    s = apply(s, "p1", { type: "join", playerId: "p1", token: TOKEN1, name: "Bo", avatar: {} }, now).state;
    s = apply(s, "p0", { type: "create", mode: "daily" }, now).state;
    s = apply(s, "p0", { type: "start" }, now).state;
    s = apply(s, "p0", { type: "ready" }, now).state;
    s = apply(s, "p1", { type: "ready" }, now).state;
    const seed = s.seed;

    const assertClean = (state: RoomState): void => {
      for (const pid of ["p0", "p1"]) {
        const json = JSON.stringify(viewFor(state, pid, now));
        expect(json.includes(seed)).toBe(false);
        expect(json.includes(salt)).toBe(false);
      }
    };

    const final = driveRun(s, now, assertClean);
    // The terminal view carries the result record — it too must be seed-free.
    expect(final.result).toBeDefined();
    assertClean(final);
  });
});

/** [0, 1, ..., n-1]. */
function s0Range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}
