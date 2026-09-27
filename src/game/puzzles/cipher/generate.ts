import { createRng, type Rng } from "../../rng";
import type { Difficulty } from "../types";
import { ALPHABET, WORDS_BY_LENGTH } from "./words";
import { GLYPHS, type CipherState, type GlyphEntry } from "./types";

const LENGTHS: Record<Difficulty, number[]> = {
  1: [5],
  2: [5, 6],
  3: [5, 6],
  4: [6, 7],
  5: [6, 7],
};

const idx = (letter: string): number => ALPHABET.indexOf(letter);

function pickWord(rng: Rng, len: number): { word: string; candidates: string[] } {
  const pool = WORDS_BY_LENGTH[len];
  const word = rng.pick(pool);
  const decoys = rng.shuffle(pool.filter((w) => w !== word)).slice(0, 7);
  return { word, candidates: rng.shuffle([word, ...decoys]) };
}

function caesar(rng: Rng, word: string): Pick<CipherState, "glyphs" | "shift" | "dir"> {
  const shift = rng.int(1, 25);
  const dir: 1 | -1 = rng.chance(0.5) ? 1 : -1;
  const glyphs = [...word].map((ch) => GLYPHS[(idx(ch) + shift * dir + 26) % 26]);
  return { glyphs, shift, dir };
}

function substitution(rng: Rng, word: string): Pick<CipherState, "glyphs" | "table"> {
  const perm = rng.shuffle(GLYPHS.map((_, i) => i));
  const glyphs = [...word].map((ch) => GLYPHS[perm[idx(ch)]]);
  const table: GlyphEntry[] = [...ALPHABET].map((letter, i) => ({
    glyph: GLYPHS[perm[i]],
    letter,
  }));
  // Sort by glyph so the key order never hints at the plaintext.
  table.sort((a, b) => a.glyph.localeCompare(b.glyph));
  return { glyphs, table };
}

export function generate(seed: string, difficulty: Difficulty): CipherState {
  const rng = createRng(seed, "cipher");
  const len = rng.pick(LENGTHS[difficulty]);
  const { word, candidates } = pickWord(rng, len);
  const base = { difficulty, word, candidates, typed: "", solved: false };
  if (difficulty <= 2) return { ...base, mode: "caesar", ...caesar(rng, word) };
  return { ...base, mode: "substitution", ...substitution(rng, word) };
}
