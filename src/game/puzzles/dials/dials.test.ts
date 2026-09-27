import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { dialsPuzzle } from "./index";
import type { DialsState } from "./types";

runConformance(dialsPuzzle, {
  forbiddenIn: (state, role: Role) => {
    const s = state as DialsState;
    if (role === "A")
      // A must never see the target positions or B's clue lines.
      return [s.targets.join("-"), JSON.stringify(s.clues)];
    // B must never see A's live positions or the raw targets.
    return [s.positions.join("-"), s.targets.join("-")];
  },
  wrongAction: (state) => {
    // Fresh positions are guaranteed misaligned, so locking immediately strikes.
    void state;
    return { role: "A", action: { lock: true } };
  },
});

describe("dials rules", () => {
  it("generation offsets every dial from its target", () => {
    for (let i = 0; i < 40; i++) {
      const s = dialsPuzzle.generate(`off-${i}`, 4);
      expect(s.positions.some((p, k) => p !== s.targets[k])).toBe(true);
    }
  });

  it("rotating to targets then locking solves", () => {
    let s = dialsPuzzle.generate("unit-1", 3);
    let outcome = "progress";
    for (const step of dialsPuzzle.solve(s)) {
      const r = dialsPuzzle.apply(s, step.role, step.action);
      s = r.state;
      outcome = r.outcome;
    }
    expect(outcome).toBe("solved");
  });

  it("rotation wraps around 8 positions", () => {
    const s = dialsPuzzle.generate("unit-2", 3);
    const cur = { ...s, positions: [...s.positions] };
    cur.positions[0] = 7;
    const r = dialsPuzzle.apply(cur, "A", { rotate: 0, dir: 1 });
    expect(r.state.positions[0]).toBe(0);
  });

  it("locking while misaligned strikes without changing positions", () => {
    const s = dialsPuzzle.generate("unit-3", 3);
    const r = dialsPuzzle.apply(s, "A", { lock: true });
    expect(r.outcome).toBe("strike");
    expect(r.state.positions).toEqual(s.positions);
  });

  it("out-of-range rotate is invalid", () => {
    const s = dialsPuzzle.generate("unit-4", 3);
    expect(dialsPuzzle.apply(s, "A", { rotate: 99, dir: 1 }).outcome).toBe("invalid");
  });

  it("uses four dials at difficulty >= 3", () => {
    expect(dialsPuzzle.generate("dc", 3).targets.length).toBe(4);
    expect(dialsPuzzle.generate("dc", 2).targets.length).toBe(3);
  });

  it("dial 1 always has an absolute (non-relative) clue", () => {
    for (let i = 0; i < 20; i++) {
      const s = dialsPuzzle.generate(`abs-${i}`, 5);
      expect(s.clues[0].style === "relative").toBe(false);
    }
  });
});
