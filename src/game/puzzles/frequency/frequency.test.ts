import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { describe as describeWave, frequencyPuzzle } from "./index";
import type { FrequencyState } from "./types";

runConformance(frequencyPuzzle, {
  wrongAction: () => ({ role: "B", action: { type: "confirm" } }),
  forbiddenIn: (state, role) => {
    const s = state as FrequencyState;
    // A must never see the target params or its description.
    if (role === "A") return [s.targetKey, "target", "description", ...s.description];
    // B must never see A's live settings.
    return [s.currentKey, "current"];
  },
});

describe("frequency rules", () => {
  it("verbal description uniquely identifies params (bijection)", () => {
    const seen = new Set<string>();
    for (let a = 1; a <= 5; a++)
      for (let f = 1; f <= 5; f++)
        for (let p = 0; p <= 3; p++) {
          const key = describeWave({ amplitude: a, frequency: f, phase: p }, true).join(" / ");
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
    expect(seen.size).toBe(5 * 5 * 4);
  });

  it("confirm strikes on mismatch, solves on match", () => {
    const s = frequencyPuzzle.generate("rules", 3);
    expect(frequencyPuzzle.apply(s, "B", { type: "confirm" }).outcome).toBe("strike");
    let cur = s;
    for (const knob of s.knobs) {
      cur = frequencyPuzzle.apply(cur, "A", { type: "set", knob, value: s.target[knob] }).state;
    }
    expect(frequencyPuzzle.apply(cur, "B", { type: "confirm" }).outcome).toBe("solved");
  });

  it("wrong role or out-of-range set is invalid, not a strike", () => {
    const s = frequencyPuzzle.generate("rules", 2);
    expect(frequencyPuzzle.apply(s, "B", { type: "set", knob: "amplitude", value: 3 }).outcome).toBe("invalid");
    expect(frequencyPuzzle.apply(s, "A", { type: "set", knob: "amplitude", value: 9 }).outcome).toBe("invalid");
    expect(frequencyPuzzle.apply(s, "A", { type: "confirm" }).outcome).toBe("invalid");
  });

  it("B only gets a verbal description at d>=4", () => {
    const low = frequencyPuzzle.viewB(frequencyPuzzle.generate("v", 3));
    const high = frequencyPuzzle.viewB(frequencyPuzzle.generate("v", 4));
    expect(low.target).not.toBeNull();
    expect(low.description).toBeNull();
    expect(high.target).toBeNull();
    expect(high.description).not.toBeNull();
  });

  it("phase knob only appears at d>=3", () => {
    expect(frequencyPuzzle.generate("k", 2).knobs).not.toContain<Role | string>("phase");
    expect(frequencyPuzzle.generate("k", 3).knobs).toContain("phase");
  });
});
