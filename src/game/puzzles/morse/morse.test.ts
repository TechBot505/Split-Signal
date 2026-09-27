import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import { morsePuzzle, timingFor } from "./index";
import { MORSE, WORD_FAMILIES } from "./data";
import type { MorseState } from "./types";

runConformance(morsePuzzle, {
  wrongAction: () => ({ role: "B", action: { type: "transmit" } }),
  forbiddenIn: (state, role) => {
    const s = state as MorseState;
    // A must never see any word letters or the candidate list.
    if (role === "A") return [s.candidates[s.correctIndex].word, "candidates", "chart"];
    // B must never see which candidate is correct, nor the blink pattern.
    return [s.answerKey, "correctIndex", "timing"];
  },
});

describe("morse rules", () => {
  it("candidate list is 10-16 words, includes the answer + prefix decoys", () => {
    for (let i = 0; i < 40; i++) {
      const s = morsePuzzle.generate(`c-${i}`, 3);
      expect(s.candidates.length).toBeGreaterThanOrEqual(10);
      expect(s.candidates.length).toBeLessThanOrEqual(16);
      const answer = s.candidates[s.correctIndex].word;
      const family = WORD_FAMILIES.find((f) => f.includes(answer))!;
      const words = s.candidates.map((c) => c.word);
      // every prefix-sharing sibling present in the pool is a decoy
      expect(family.filter((w) => words.includes(w)).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("frequencies are unique per instance", () => {
    const s = morsePuzzle.generate("freq", 2);
    const freqs = s.candidates.map((c) => c.frequency);
    expect(new Set(freqs).size).toBe(freqs.length);
  });

  it("A's timing never contains letters, only tokens", () => {
    const s = morsePuzzle.generate("tok", 4);
    for (const t of s.timing) expect(["dot", "dash", "gap", "wordgap"]).toContain(t);
  });

  it("timing round-trips the chart", () => {
    expect(timingFor("SOS")).toEqual(["dot", "dot", "dot", "gap", "dash", "dash", "dash", "gap", "dot", "dot", "dot"]);
    expect(Object.keys(MORSE).length).toBe(26);
  });

  it("transmit strikes on wrong tune, solves on correct", () => {
    const s = morsePuzzle.generate("tx", 2);
    expect(morsePuzzle.apply(s, "B", { type: "transmit" }).outcome).toBe("strike");
    const tuned = morsePuzzle.apply(s, "B", { type: "tune", index: s.correctIndex }).state;
    expect(morsePuzzle.apply(tuned, "B", { type: "transmit" }).outcome).toBe("solved");
  });

  it("speed hint only appears at d>=3; A cannot act", () => {
    expect(morsePuzzle.generate("sp", 2).speed).toBeNull();
    expect(morsePuzzle.generate("sp", 3).speed).not.toBeNull();
    expect(morsePuzzle.canAct(morsePuzzle.generate("sp", 3), "A")).toBe(false);
  });
});
