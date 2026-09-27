import { describe, expect, it } from "vitest";
import { createRng } from "../../rng";
import { runConformance } from "../conformance";
import { makeRiddle } from "./riddles";
import { vaultPuzzle } from "./index";
import type { VaultState } from "./types";

runConformance(vaultPuzzle, {
  wrongAction: () => ({ role: "A", action: { type: "enter" } }),
  // The code must never appear in either view. Riddle-split secrecy is checked
  // structurally below (substring checks are unsafe: one riddle's text can be a
  // prefix of another's, e.g. "...a hexagon" vs "...a hexagon minus 2").
  forbiddenIn: (state) => [(state as VaultState).codeKey],
});

describe("vault rules", () => {
  it("every riddle answer is a single digit 0-9", () => {
    for (let i = 0; i < 500; i++) {
      const r = makeRiddle(createRng(`r-${i}`, "probe"));
      expect(r.answer).toBeGreaterThanOrEqual(0);
      expect(r.answer).toBeLessThanOrEqual(9);
      expect(Number.isInteger(r.answer)).toBe(true);
    }
  });

  it("code length is 4, or 5 at d5; checksum matches", () => {
    expect(vaultPuzzle.generate("len", 4).codeLen).toBe(4);
    const s = vaultPuzzle.generate("len", 5);
    expect(s.codeLen).toBe(5);
    expect(s.checksum).toBe(s.code.reduce((a, b) => a + b, 0));
  });

  it("views split riddles by role; neither exposes the code or answers", () => {
    for (let d = 1; d <= 5; d++) {
      for (let i = 0; i < 40; i++) {
        const s = vaultPuzzle.generate(`split-${i}`, d as 1 | 2 | 3 | 4 | 5);
        const a = vaultPuzzle.viewA(s);
        const b = vaultPuzzle.viewB(s);
        expect(a.riddles).toEqual(s.riddles.slice(0, s.split).map((r) => r.text));
        expect(b.riddles).toEqual(s.riddles.slice(s.split).map((r) => r.text));
        const ja = JSON.stringify(a);
        const jb = JSON.stringify(b);
        expect(ja.includes(s.codeKey)).toBe(false);
        expect(jb.includes(s.codeKey)).toBe(false);
        expect(ja.includes('"answer"')).toBe(false);
        expect(jb.includes('"answer"')).toBe(false);
      }
    }
  });

  it("checksum clue only shown to B at d>=3", () => {
    expect(vaultPuzzle.viewB(vaultPuzzle.generate("cs", 2)).checksum).toBeNull();
    expect(vaultPuzzle.viewB(vaultPuzzle.generate("cs", 3)).checksum).not.toBeNull();
  });

  it("wrong enter strikes and clears; B cannot act", () => {
    const s = vaultPuzzle.generate("enter", 2);
    expect(vaultPuzzle.canAct(s, "B")).toBe(false);
    const bad = vaultPuzzle.apply(s, "A", { type: "digit", value: (s.code[0] + 1) % 10 });
    const res = vaultPuzzle.apply(bad.state, "A", { type: "enter" });
    expect(res.outcome).toBe("strike");
    expect(res.state.entered).toEqual([]);
  });
});
