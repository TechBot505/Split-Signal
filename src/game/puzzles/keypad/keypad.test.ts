import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { keypadPuzzle } from "./index";
import type { KeypadState } from "./types";

runConformance(keypadPuzzle, {
  forbiddenIn: (state, role: Role) => {
    const s = state as KeypadState;
    if (role === "A")
      // A must never see B's columns or the derived press order.
      return [s.columns.map((c) => c.join("|")).join("/"), s.order.join("-")];
    // B must never see A's four buttons (as A's set) or the press order.
    return [s.buttons.join("|"), s.order.join("-")];
  },
  wrongAction: (state) => {
    const s = state as KeypadState;
    return { role: "A", action: { press: (s.order[0] + 1) % 4 } };
  },
});

const countContainingAll = (s: KeypadState): number =>
  s.columns.filter((col) => s.buttons.every((b) => col.includes(b))).length;

describe("keypad rules", () => {
  it("exactly one column contains all four buttons (uniqueness)", () => {
    for (const d of [1, 2, 3, 4, 5] as const) {
      for (let i = 0; i < 30; i++) {
        const s = keypadPuzzle.generate(`uniq-${i}`, d);
        expect(countContainingAll(s), `d${d} seed ${i}`).toBe(1);
        expect(s.order.length).toBe(4);
      }
    }
  });

  it("pressing in order solves the puzzle", () => {
    let s = keypadPuzzle.generate("unit-1", 4);
    let outcome = "progress";
    for (const press of s.order) {
      const r = keypadPuzzle.apply(s, "A", { press });
      s = r.state;
      outcome = r.outcome;
    }
    expect(outcome).toBe("solved");
    expect(s.solved).toBe(true);
  });

  it("a wrong press strikes and resets progress", () => {
    const s = keypadPuzzle.generate("unit-2", 3);
    const good = keypadPuzzle.apply(s, "A", { press: s.order[0] });
    expect(good.outcome).toBe("progress");
    expect(good.state.progress).toBe(1);
    const wrong = (s.order[1] + 1) % 4 === s.order[1] ? (s.order[1] + 2) % 4 : (s.order[1] + 1) % 4;
    const bad = keypadPuzzle.apply(good.state, "A", { press: wrong });
    expect(bad.outcome).toBe("strike");
    expect(bad.state.progress).toBe(0);
  });

  it("out-of-range press is invalid", () => {
    const s = keypadPuzzle.generate("unit-3", 2);
    expect(keypadPuzzle.apply(s, "A", { press: 9 }).outcome).toBe("invalid");
  });

  it("B cannot act", () => {
    const s = keypadPuzzle.generate("unit-4", 2);
    expect(keypadPuzzle.canAct(s, "B")).toBe(false);
  });

  it("higher difficulty uses six columns", () => {
    expect(keypadPuzzle.generate("cols", 5).columns.length).toBe(6);
    expect(keypadPuzzle.generate("cols", 1).columns.length).toBe(5);
  });
});
