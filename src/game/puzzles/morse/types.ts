import type { Difficulty } from "../types";

export type MorseToken = "dot" | "dash" | "gap" | "wordgap";
export type Speed = "slow" | "medium" | "fast";

export interface Candidate {
  word: string;
  /** e.g. "3.512 MHz" */
  frequency: string;
}

export interface MorseState {
  difficulty: Difficulty;
  /** A's blinking-lamp pattern (no letters). */
  timing: MorseToken[];
  /** number of letters in the word (a harmless hint for A). */
  length: number;
  /** speed hint shown to A at d>=3, else null. */
  speed: Speed | null;
  /** B's candidate list + frequencies (includes the correct word as a decoy). */
  candidates: Candidate[];
  /** index of the correct candidate (secret from B). */
  correctIndex: number;
  /** B's currently tuned frequency index (-1 = untuned). */
  tuned: number;
  /** sentinel encoding used only by the leak-check oracle. */
  answerKey: string;
  solved: boolean;
}

export type MorseAction = { type: "tune"; index: number } | { type: "transmit" };

export interface MorseViewA {
  role: "A";
  timing: MorseToken[];
  length: number;
  speed: Speed | null;
  solved: boolean;
}

export interface MorseViewB {
  role: "B";
  chart: Record<string, string>;
  candidates: Candidate[];
  tuned: number;
  solved: boolean;
}
