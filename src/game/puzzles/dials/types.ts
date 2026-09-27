import type { Difficulty } from "../types";

/** Each dial has 8 discrete positions (0..7) at 45° increments, 0 = up. */
export const POSITIONS = 8;

/** Position -> compass bearing (position 0 = north, clockwise). */
export const COMPASS = [
  "north", "north-east", "east", "south-east",
  "south", "south-west", "west", "north-west",
] as const;

/** Position -> clock face label (angle-accurate at 45° steps). */
export const CLOCK = [
  "12 o'clock", "1:30", "3 o'clock", "4:30",
  "6 o'clock", "7:30", "9 o'clock", "10:30",
] as const;

export type ClueStyle = "compass" | "clock" | "relative";

/** One line of B's manual. `text` is what B reads aloud. */
export interface Clue {
  dial: number;
  style: ClueStyle;
  text: string;
}

export interface DialsState {
  difficulty: Difficulty;
  /** A's current dial positions (mutable). */
  positions: number[];
  /** The solution positions. Secret from both raw views. */
  targets: number[];
  /** B's indirect target descriptions. */
  clues: Clue[];
  solved: boolean;
}

/** A sees only the current positions. */
export interface DialsViewA {
  difficulty: Difficulty;
  positions: number[];
  positionCount: number;
  solved: boolean;
}

/** B sees only the clue lines. */
export interface DialsViewB {
  difficulty: Difficulty;
  dialCount: number;
  clues: Clue[];
  solved: boolean;
}

/** A rotates one dial one click, or locks the whole set in. */
export type DialsAction = { rotate: number; dir: 1 | -1 } | { lock: true };
