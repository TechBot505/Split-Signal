import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { ledsFor, switchesPuzzle } from "./index";
import type { SwitchesState } from "./types";

runConformance(switchesPuzzle, {
  wrongAction: () => ({ role: "A", action: { type: "submit" } }),
  forbiddenIn: (state, role) => {
    const s = state as SwitchesState;
    // A must never see the wiring, the target, or the intended solution.
    if (role === "A") return [s.targetKey, s.wiringKey, s.solutionKey, "wiring", "target", "solution"];
    // B must never see A's live switch/LED state.
    return ["switches", "leds"];
  },
});

describe("switches rules", () => {
  it("switch count ramps 6->8 with difficulty", () => {
    expect(switchesPuzzle.generate("n", 1).n).toBe(6);
    expect(switchesPuzzle.generate("n", 3).n).toBe(7);
    expect(switchesPuzzle.generate("n", 5).n).toBe(8);
  });

  it("target is always reachable and lights at least one LED", () => {
    for (let d = 1 as const; d <= 5; d++) {
      for (let i = 0; i < 50; i++) {
        const s = switchesPuzzle.generate(`reach-${i}`, d as 1 | 2 | 3 | 4 | 5);
        expect(s.target.some(Boolean)).toBe(true);
        expect(ledsFor(s.wiring, s.solution, s.m)).toEqual(s.target);
      }
    }
  });

  it("every switch toggles a non-empty subset of LEDs", () => {
    const s = switchesPuzzle.generate("wiring", 4);
    for (const row of s.wiring) expect(row.some(Boolean)).toBe(true);
  });

  it("submitting the wrong pattern strikes, correct solves", () => {
    const s = switchesPuzzle.generate("submit", 2);
    expect(switchesPuzzle.apply(s, "A", { type: "submit" }).outcome).toBe("strike");
    let cur = s;
    let outcome = "progress";
    for (const step of switchesPuzzle.solve(s)) {
      const r = switchesPuzzle.apply(cur, step.role, step.action);
      cur = r.state;
      outcome = r.outcome;
    }
    expect(outcome).toBe("solved");
  });

  it("B cannot act; flip out of range is invalid", () => {
    const s = switchesPuzzle.generate("act", 2);
    expect(switchesPuzzle.canAct(s, "B" as Role)).toBe(false);
    expect(switchesPuzzle.apply(s, "A", { type: "flip", index: 99 }).outcome).toBe("invalid");
  });
});
