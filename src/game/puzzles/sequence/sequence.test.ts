import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { sequencePuzzle } from "./index";
import { COLORS, type SeqColor, type SequenceState, tableKey } from "./types";

function expected(s: SequenceState): SeqColor {
  const flashed = s.master[s.posInRound];
  return s.tables[tableKey(s.strikes, s.round, s.usesParity)][flashed];
}

runConformance(sequencePuzzle, {
  forbiddenIn: (state, role) => {
    const s = state as SequenceState;
    if (role === "A") return [JSON.stringify(s.tables)];
    // B must never see the flashing sequence.
    return [JSON.stringify(s.master)];
  },
  wrongAction: (state) => {
    const s = state as SequenceState;
    const bad = COLORS.find((c) => c !== expected(s)) as SeqColor;
    return { role: "A" as Role, action: { press: bad } };
  },
});

describe("sequence rules", () => {
  it("rounds ramp 3 -> 5", () => {
    expect(sequencePuzzle.generate("r", 1).totalRounds).toBe(3);
    expect(sequencePuzzle.generate("r", 5).totalRounds).toBe(5);
  });

  it("uses round parity only at d>=3", () => {
    expect(sequencePuzzle.generate("p", 2).usesParity).toBe(false);
    expect(sequencePuzzle.generate("p", 3).usesParity).toBe(true);
  });

  it("a wrong press strikes and resets the current round", () => {
    let s = sequencePuzzle.generate("w", 3);
    // Clear round 1 (length 1), then land mid-way through round 2.
    s = sequencePuzzle.apply(s, "A", { press: expected(s) }).state;
    expect(s.round).toBe(2);
    s = sequencePuzzle.apply(s, "A", { press: expected(s) }).state;
    expect(s.posInRound).toBe(1);
    const bad = COLORS.find((c) => c !== expected(s)) as SeqColor;
    const r = sequencePuzzle.apply(s, "A", { press: bad });
    expect(r.outcome).toBe("strike");
    expect(r.state.posInRound).toBe(0);
    expect(r.state.strikes).toBe(1);
  });

  it("the lookup key (hence the table) depends on strikes", () => {
    const s = sequencePuzzle.generate("t", 2);
    expect(tableKey(0, s.round, s.usesParity)).not.toBe(
      tableKey(1, s.round, s.usesParity),
    );
    // Every strike level has its own table entry.
    expect(s.tables[tableKey(0, s.round, s.usesParity)]).toBeDefined();
    expect(s.tables[tableKey(1, s.round, s.usesParity)]).toBeDefined();
  });

  it("solve() clears every round to solved", () => {
    let s = sequencePuzzle.generate("solve", 4);
    let last = "progress";
    for (const step of sequencePuzzle.solve(s)) {
      const r = sequencePuzzle.apply(s, step.role, step.action);
      s = r.state;
      last = r.outcome;
    }
    expect(last).toBe("solved");
  });
});
