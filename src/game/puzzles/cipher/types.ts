import type { Difficulty } from "../types";

/** Canonical 26-glyph alphabet (index i renders letter i of ALPHABET). Public — the UI legend. */
export const GLYPHS = [
  "glyph-aleph", "glyph-beth", "glyph-gimel", "glyph-dalet", "glyph-he", "glyph-vav",
  "glyph-zayin", "glyph-heth", "glyph-teth", "glyph-yod", "glyph-kaph", "glyph-lamed",
  "glyph-mem", "glyph-nun", "glyph-samekh", "glyph-ayin", "glyph-pe", "glyph-tsadi",
  "glyph-qoph", "glyph-resh", "glyph-shin", "glyph-tav", "glyph-wynn", "glyph-thorn",
  "glyph-eth", "glyph-yogh",
] as const;

export type CipherMode = "caesar" | "substitution";

/** One entry of B's substitution key. */
export interface GlyphEntry {
  glyph: string;
  letter: string;
}

export interface CipherState {
  difficulty: Difficulty;
  mode: CipherMode;
  /** Plaintext answer. Secret from A. */
  word: string;
  /** The encrypted word A sees, one glyph id per letter. */
  glyphs: string[];
  /** Caesar key (present when mode === "caesar"). Secret from A. */
  shift?: number;
  dir?: 1 | -1;
  /** Substitution key sorted by glyph (present when mode === "substitution"). Secret from A. */
  table?: GlyphEntry[];
  /** 8 candidate words (including the answer). B's clue. Secret from A. */
  candidates: string[];
  /** A's current typed guess (mutable). */
  typed: string;
  solved: boolean;
}

/** A sees the encrypted glyphs and their own typing. */
export interface CipherViewA {
  difficulty: Difficulty;
  mode: CipherMode;
  glyphs: string[];
  wordLength: number;
  typed: string;
  solved: boolean;
}

/** B sees the key and the candidate words — never A's glyph sequence. */
export interface CipherViewB {
  difficulty: Difficulty;
  mode: CipherMode;
  shift?: number;
  dir?: 1 | -1;
  table?: GlyphEntry[];
  candidates: string[];
  solved: boolean;
}

/** A types a letter, deletes one, or submits the guess. */
export type CipherAction = { type: string } | { backspace: true } | { submit: true };
