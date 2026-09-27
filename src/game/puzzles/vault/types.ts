import type { Difficulty } from "../types";
import type { Riddle } from "./riddles";

export interface VaultState {
  difficulty: Difficulty;
  /** 4 digits (5 at d5). */
  codeLen: number;
  /** riddle per digit; split between roles (secret halves). */
  riddles: Riddle[];
  /** the full code (secret from both operators until derived). */
  code: number[];
  /** index where B's half begins. A owns [0,split), B owns [split,len). */
  split: number;
  /** sum of all digits. */
  checksum: number;
  /** d>=3: B is shown the checksum rule. */
  showChecksum: boolean;
  /** digits entered on the keypad so far. */
  entered: number[];
  /** sentinel encoding used only by the leak-check oracle. */
  codeKey: string;
  solved: boolean;
}

export type VaultAction =
  | { type: "digit"; value: number }
  | { type: "clear" }
  | { type: "enter" };

export interface VaultViewA {
  role: "A";
  /** riddle texts for the first half (no answers). */
  riddles: string[];
  entered: number[];
  codeLen: number;
  solved: boolean;
}

export interface VaultViewB {
  role: "B";
  /** riddle texts for the second half (no answers). */
  riddles: string[];
  /** checksum clue at d>=3, else null. */
  checksum: number | null;
  codeLen: number;
  solved: boolean;
}
