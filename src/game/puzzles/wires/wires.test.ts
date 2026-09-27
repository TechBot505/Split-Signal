import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { evaluate } from "./rules";
import { wiresPuzzle } from "./index";
import type { WiresState } from "./types";

runConformance(wiresPuzzle, {
  forbiddenIn: (state, role: Role) => {
    const s = state as WiresState;
    if (role === "A")
      // A must never see the rulebook or the resolved cut index.
      return [JSON.stringify(s.rules), `"answer":${s.answer}`];
    // B must never see A's actual wire colors / stripes / LEDs.
    return [JSON.stringify(s.wires), s.wires.map((w) => w.color).join("|")];
  },
  wrongAction: (state) => {
    const s = state as WiresState;
    const wrong = (s.answer + 1) % s.wires.length;
    return { role: "A", action: { cut: wrong } };
  },
});

describe("wires rules", () => {
  it("cuts the correct wire and marks solved", () => {
    const s = wiresPuzzle.generate("unit-1", 3);
    const r = wiresPuzzle.apply(s, "A", { cut: s.answer });
    expect(r.outcome).toBe("solved");
    expect(r.state.solved).toBe(true);
  });

  it("strikes on a wrong cut but leaves the puzzle unsolved", () => {
    const s = wiresPuzzle.generate("unit-2", 3);
    const wrong = (s.answer + 1) % s.wires.length;
    const r = wiresPuzzle.apply(s, "A", { cut: wrong });
    expect(r.outcome).toBe("strike");
    expect(r.state.solved).toBe(false);
  });

  it("returns invalid for out-of-range indices without throwing", () => {
    const s = wiresPuzzle.generate("unit-3", 2);
    expect(wiresPuzzle.apply(s, "A", { cut: 99 }).outcome).toBe("invalid");
    expect(wiresPuzzle.apply(s, "A", { cut: -1 }).outcome).toBe("invalid");
  });

  it("B cannot act", () => {
    const s = wiresPuzzle.generate("unit-4", 2);
    expect(wiresPuzzle.canAct(s, "B")).toBe(false);
    expect(wiresPuzzle.apply(s, "B", { cut: s.answer }).outcome).toBe("invalid");
  });

  it("evaluate: 'more than one red -> last red' beats the fallback", () => {
    const wires = [
      { color: "red" as const, striped: false, led: false },
      { color: "blue" as const, striped: false, led: false },
      { color: "red" as const, striped: false, led: false },
    ];
    const rules = [
      {
        condition: { kind: "countGt" as const, color: "red" as const, n: 1 },
        target: { kind: "lastOfColor" as const, color: "red" as const },
        text: "",
      },
      {
        condition: { kind: "always" as const },
        target: { kind: "position" as const, where: "first" as const },
        text: "",
      },
    ];
    expect(evaluate(rules, wires)).toBe(2);
  });

  it("evaluate: falls back to last wire when a target cannot resolve", () => {
    const wires = [
      { color: "blue" as const, striped: false, led: false },
      { color: "green" as const, striped: false, led: false },
    ];
    const rules = [
      {
        condition: { kind: "anyStriped" as const },
        target: { kind: "firstStriped" as const },
        text: "",
      },
      {
        condition: { kind: "always" as const },
        target: { kind: "position" as const, where: "last" as const },
        text: "",
      },
    ];
    // No striped wire, so rule 1 cannot resolve; fallback picks the last wire.
    expect(evaluate(rules, wires)).toBe(1);
  });

  it("hint is a short non-empty string", () => {
    const s = wiresPuzzle.generate("unit-5", 4);
    expect(wiresPuzzle.hint(s).length).toBeGreaterThan(0);
  });
});
