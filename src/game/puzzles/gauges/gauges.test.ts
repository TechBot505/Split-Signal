import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { gaugesPuzzle } from "./index";
import { evalFormula, type GaugesState, inBand } from "./types";

runConformance(gaugesPuzzle, {
  forbiddenIn: (state, role) => {
    const s = state as GaugesState;
    if (role === "A") {
      // A must never see the manual (formulas) or the target bands.
      return [JSON.stringify(s.formulas), JSON.stringify(s.bands)];
    }
    // B must never see the current lever values.
    return [JSON.stringify(s.levers)];
  },
  // Fresh levers are all zero, guaranteed out of band -> Engage strikes.
  wrongAction: () => ({ role: "A" as Role, action: { type: "engage" } }),
});

describe("gauges rules", () => {
  it("has 3 levers at d<4 and 4 (coupled) at d>=4", () => {
    expect(gaugesPuzzle.generate("n", 2).numLevers).toBe(3);
    const hi = gaugesPuzzle.generate("n", 4);
    expect(hi.numLevers).toBe(4);
    // Coupled: at least one gauge references two levers.
    const coupled = hi.formulas.some(
      (f) => f.coef.filter((c) => c !== 0).length >= 2,
    );
    expect(coupled).toBe(true);
  });

  it("engaging while out of band strikes; setting levers is progress", () => {
    const s = gaugesPuzzle.generate("e", 3);
    expect(gaugesPuzzle.apply(s, "A", { type: "engage" }).outcome).toBe("strike");
    const r = gaugesPuzzle.apply(s, "A", { type: "set", lever: 0, value: 5 });
    expect(r.outcome).toBe("progress");
    expect(r.state.levers[0]).toBe(5);
  });

  it("a generated solution exists and lands every gauge in band", () => {
    for (const d of [1, 3, 4, 5] as const) {
      let s = gaugesPuzzle.generate(`sol-${d}`, d);
      let last = "progress";
      for (const step of gaugesPuzzle.solve(s)) {
        const r = gaugesPuzzle.apply(s, step.role, step.action);
        s = r.state;
        last = r.outcome;
      }
      expect(last).toBe("solved");
      s.formulas.forEach((f, g) =>
        expect(inBand(evalFormula(f, s.levers), s.bands[g])).toBe(true),
      );
    }
  });

  it("B cannot act; out-of-range lever is invalid", () => {
    const s = gaugesPuzzle.generate("b", 2);
    expect(gaugesPuzzle.canAct(s, "B")).toBe(false);
    expect(
      gaugesPuzzle.apply(s, "A", { type: "set", lever: 3, value: 1 }).outcome,
    ).toBe("invalid");
  });
});
