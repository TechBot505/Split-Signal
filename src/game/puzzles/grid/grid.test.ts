import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { genGrid } from "./generate";
import { gridPuzzle } from "./index";
import { countSolutions } from "./solver";
import type { GridState } from "./types";

runConformance(gridPuzzle, {
  forbiddenIn: (state, _role) => {
    const s = state as GridState;
    // Neither view may leak the solution; each view may only carry its own half.
    return [
      JSON.stringify(s.solution),
      JSON.stringify(_role === "A" ? s.cluesB : s.cluesA),
    ];
  },
  // Submitting the empty board never matches the solution -> strike.
  wrongAction: () => ({ role: "A" as Role, action: { type: "submit" } }),
});

describe("grid rules", () => {
  it("combined clues are unique; neither half alone is", () => {
    for (const d of [1, 2, 3, 4, 5] as const) {
      for (let i = 0; i < 25; i++) {
        const s = genGrid(`u-${d}-${i}`, d);
        expect(countSolutions([...s.cluesA, ...s.cluesB])).toBe(1);
        expect(countSolutions(s.cluesA)).toBeGreaterThan(1);
        expect(countSolutions(s.cluesB)).toBeGreaterThan(1);
        expect(s.cluesA.length).toBeGreaterThan(0);
        expect(s.cluesB.length).toBeGreaterThan(0);
      }
    }
  });

  it("badges appear only at d>=3", () => {
    expect(genGrid("bg", 2).badges).toBeNull();
    expect(genGrid("bg", 3).badges).not.toBeNull();
  });

  it("either role may place; placing moves an item off any prior slot", () => {
    const s = genGrid("place", 2);
    expect(gridPuzzle.canAct(s, "A")).toBe(true);
    expect(gridPuzzle.canAct(s, "B")).toBe(true);
    let n = gridPuzzle.apply(s, "B", { type: "place", item: "Ava", slot: 0 }).state;
    n = gridPuzzle.apply(n, "A", { type: "place", item: "Ava", slot: 2 }).state;
    expect(n.board[0]).toBeNull();
    expect(n.board[2]).toBe("Ava");
  });

  it("a wrong submit strikes; the correct arrangement solves", () => {
    const s = genGrid("sub", 3);
    expect(gridPuzzle.apply(s, "A", { type: "submit" }).outcome).toBe("strike");
    let cur = s;
    let last = "progress";
    for (const step of gridPuzzle.solve(s)) {
      const r = gridPuzzle.apply(cur, step.role, step.action);
      cur = r.state;
      last = r.outcome;
    }
    expect(last).toBe("solved");
    expect(cur.board).toEqual(cur.solution);
  });
});
