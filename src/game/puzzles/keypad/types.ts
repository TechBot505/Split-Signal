import type { Difficulty } from "../types";

/** ~27 abstract symbol ids. The UI draws each; the module only ever uses the id. */
export const SYMBOLS = [
  "omega", "trident", "spiral", "eye", "star-hollow", "star-filled", "moon", "sun",
  "bolt", "leaf", "anchor", "crown", "key", "flame", "drop", "gear",
  "wave", "arrow-up", "arrow-down", "cross", "ring", "diamond", "hexagon", "helix",
  "atom", "prism", "rune",
] as const;
export type Symbol = (typeof SYMBOLS)[number];

export interface KeypadState {
  difficulty: Difficulty;
  /** The 4 symbols on A's buttons, indexed by button (0..3). */
  buttons: Symbol[];
  /** B's grid: `columns[c][row]`, 7 rows each. Exactly one column holds all 4 buttons. */
  columns: Symbol[][];
  /** Which column is the key. Secret from both raw views. */
  keyColumnIndex: number;
  /** Correct press order as button indices (top-to-bottom in the key column). Secret. */
  order: number[];
  /** How many correct presses so far (resets to 0 on a wrong press). */
  progress: number;
  solved: boolean;
}

/** A sees the four buttons and their own progress. */
export interface KeypadViewA {
  difficulty: Difficulty;
  buttons: Symbol[];
  progress: number;
  solved: boolean;
}

/** B sees the columns only — never A's buttons, the key column or the order. */
export interface KeypadViewB {
  difficulty: Difficulty;
  columns: Symbol[][];
  solved: boolean;
}

/** A presses a button by index. */
export interface KeypadAction {
  press: number;
}
