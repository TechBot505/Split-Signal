import type { Difficulty } from "../types";

export type SeqColor = "red" | "green" | "blue" | "yellow";

/** Maps a flashed colour -> the button A must press, per lookup key. */
export type SeqTable = Record<SeqColor, SeqColor>;

/** Keyed by `${strikes}` or (d>=3) `${strikes}-${roundParity}`. */
export type SeqTables = Record<string, SeqTable>;

export interface SequenceState {
  d: Difficulty;
  master: SeqColor[];
  totalRounds: number;
  /** 1-indexed current round; round r flashes master.slice(0, r). */
  round: number;
  posInRound: number;
  strikes: number;
  tables: SeqTables;
  usesParity: boolean;
  solved: boolean;
}

/** A (operator) sees the flashing lights only. */
export interface SequenceViewA {
  round: number;
  totalRounds: number;
  flash: SeqColor[];
  strikes: number;
}

/** B (advisor) holds the translation tables only, never the flashes. */
export interface SequenceViewB {
  round: number;
  totalRounds: number;
  strikes: number;
  tables: SeqTables;
  usesParity: boolean;
}

export interface SequenceAction {
  press: SeqColor;
}

export const COLORS: SeqColor[] = ["red", "green", "blue", "yellow"];

/** Which table applies right now, given strikes/round. */
export function tableKey(
  strikes: number,
  round: number,
  usesParity: boolean,
): string {
  const s = Math.min(strikes, 2);
  return usesParity ? `${s}-${round % 2}` : `${s}`;
}
