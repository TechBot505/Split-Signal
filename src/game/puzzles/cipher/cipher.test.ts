import { describe, expect, it } from "vitest";
import { runConformance } from "../conformance";
import type { Role } from "../types";
import { cipherPuzzle } from "./index";
import type { CipherState } from "./types";
import { GLYPHS } from "./types";
import { ALPHABET, WORDS_BY_LENGTH } from "./words";

runConformance(cipherPuzzle, {
  forbiddenIn: (state, role: Role) => {
    const s = state as CipherState;
    if (role === "A") {
      // A must never see the plaintext, the candidate list or the cipher key.
      const key =
        s.mode === "caesar" ? `caesar:${s.shift}:${s.dir}` : JSON.stringify(s.table);
      return [s.word, s.candidates.join("|"), key];
    }
    // B must never see A's glyph sequence.
    return [s.glyphs.join("|")];
  },
  wrongAction: (state) => {
    void state;
    // Submitting with nothing typed can never match the answer.
    return { role: "A", action: { submit: true } };
  },
});

describe("cipher word list", () => {
  it("every word is lowercase a-z and the right length", () => {
    for (const [len, words] of Object.entries(WORDS_BY_LENGTH)) {
      for (const w of words) {
        expect(w.length, w).toBe(Number(len));
        expect(/^[a-z]+$/.test(w), w).toBe(true);
      }
      expect(words.length).toBeGreaterThanOrEqual(8);
    }
  });
});

describe("cipher rules", () => {
  it("candidates always contain the answer and number 8", () => {
    for (let i = 0; i < 40; i++) {
      const s = cipherPuzzle.generate(`cand-${i}`, 4);
      expect(s.candidates).toContain(s.word);
      expect(s.candidates.length).toBe(8);
    }
  });

  it("caesar glyphs decode back to the plaintext with the key", () => {
    const s = cipherPuzzle.generate("caesar-1", 1);
    expect(s.mode).toBe("caesar");
    const shift = s.shift ?? 0;
    const dir = s.dir ?? 1;
    // Reverse the shift on each glyph using the public GLYPHS ordering.
    const decoded = s.glyphs
      .map((g) => {
        const cipherIdx = GLYPHS.indexOf(g as (typeof GLYPHS)[number]);
        return ALPHABET[(cipherIdx - shift * dir + 26) % 26];
      })
      .join("");
    expect(decoded).toBe(s.word);
  });

  it("substitution mode kicks in at difficulty >= 3 with a full table", () => {
    const s = cipherPuzzle.generate("sub-1", 4);
    expect(s.mode).toBe("substitution");
    expect(s.table?.length).toBe(ALPHABET.length);
  });

  it("a wrong submit strikes and clears the typed guess", () => {
    let s = cipherPuzzle.generate("unit-1", 3);
    s = cipherPuzzle.apply(s, "A", { type: "z" }).state;
    const r = cipherPuzzle.apply(s, "A", { submit: true });
    expect(r.outcome).toBe("strike");
    expect(r.state.typed).toBe("");
  });

  it("typing past the word length is invalid; backspace deletes", () => {
    let s = cipherPuzzle.generate("unit-2", 1);
    for (const ch of s.word) s = cipherPuzzle.apply(s, "A", { type: ch }).state;
    expect(cipherPuzzle.apply(s, "A", { type: "a" }).outcome).toBe("invalid");
    const back = cipherPuzzle.apply(s, "A", { backspace: true });
    expect(back.state.typed.length).toBe(s.word.length - 1);
  });

  it("B cannot act", () => {
    const s = cipherPuzzle.generate("unit-3", 2);
    expect(cipherPuzzle.canAct(s, "B")).toBe(false);
  });
});
