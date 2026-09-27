import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { mazePuzzle } from "./index";
import type { MazeState } from "./types";

runConformance(mazePuzzle, {
  forbiddenIn: (state, role) => {
    const s = state as MazeState;
    if (role === "A") return [JSON.stringify(s.open), JSON.stringify(s.exit)];
    // At d>=4 B must not see A's live position.
    return s.d >= 4 ? [JSON.stringify(s.pos)] : [];
  },
  // Wall bumps only strike at d>=3, and the harness generates at d2.
  wrongAction: (state) => {
    const s = state as MazeState;
    if (s.d >= 3) return { role: "A" as Role, action: { move: "L" } };
    return null;
  },
});

describe("maze rules", () => {
  it("sizes ramp from 5x5 to 8x8", () => {
    expect(mazePuzzle.generate("s", 1).size).toBe(5);
    expect(mazePuzzle.generate("s", 5).size).toBe(8);
  });

  it("bumping a wall at d1-2 is a blocked progress, not a strike", () => {
    // From start (0,0), either U or L always leaves the grid = a wall.
    const s = mazePuzzle.generate("bump", 1);
    const r = mazePuzzle.apply(s, "A", { move: "U" });
    expect(r.outcome).toBe("progress");
    expect(r.message).toBeDefined();
    expect(r.state.pos).toEqual({ r: 0, c: 0 });
  });

  it("bumping a wall at d>=3 strikes", () => {
    const s = mazePuzzle.generate("bump", 3);
    const r = mazePuzzle.apply(s, "A", { move: "U" });
    expect(r.outcome).toBe("strike");
  });

  it("reaching the exit solves; solve() walks the shortest path", () => {
    let s = mazePuzzle.generate("walk", 4);
    const steps = mazePuzzle.solve(s);
    expect(steps.length).toBeGreaterThan(0);
    let last = "progress";
    for (const step of steps) {
      const r = mazePuzzle.apply(s, step.role, step.action);
      s = r.state;
      last = r.outcome;
    }
    expect(last).toBe("solved");
    expect(s.pos).toEqual(s.exit);
  });

  it("B only acts never; A cannot act once solved", () => {
    const s = mazePuzzle.generate("act", 2);
    expect(mazePuzzle.canAct(s, "B")).toBe(false);
    expect(mazePuzzle.canAct(s, "A")).toBe(true);
    expect(mazePuzzle.apply(s, "B", { move: "R" }).outcome).toBe("invalid");
  });

  it("viewA hides walls+exit; viewB hides A position only at d>=4", () => {
    const lo = mazePuzzle.generate("v", 2);
    const b3 = JSON.stringify(mazePuzzle.viewB(lo));
    expect(b3).toContain('"pos"');
    const hi = mazePuzzle.generate("v", 5);
    expect(mazePuzzle.viewB(hi).pos).toBeNull();
    const a = JSON.stringify(mazePuzzle.viewA(hi));
    expect(a).not.toContain(JSON.stringify(hi.exit));
  });
});
