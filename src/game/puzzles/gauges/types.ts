import type { Difficulty } from "../types";

/** A gauge reading: value = c0 + sum(coef[i] * lever[i]). */
export interface Formula {
  coef: number[];
  c0: number;
}

/** Inclusive target band [lo, hi]. */
export type Band = [number, number];

export interface GaugesState {
  d: Difficulty;
  numLevers: number;
  /** Current lever values, 0-9 each. Secret from B. */
  levers: number[];
  /** Formulas + bands are B's manual. Secret from A. */
  formulas: Formula[];
  bands: Band[];
  solved: boolean;
}

/** A (operator) sees the levers + Engage, never the manual. */
export interface GaugesViewA {
  numLevers: number;
  levers: number[];
  d: Difficulty;
}

/** B (advisor) holds the formula manual + target bands, never lever values. */
export interface GaugesViewB {
  numGauges: number;
  formulas: Formula[];
  bands: Band[];
  d: Difficulty;
}

export type GaugesAction =
  | { type: "set"; lever: number; value: number }
  | { type: "engage" };

export const NUM_GAUGES = 3;

export function evalFormula(f: Formula, levers: number[]): number {
  let v = f.c0;
  for (let i = 0; i < f.coef.length; i++) v += f.coef[i] * levers[i];
  return v;
}

export function inBand(value: number, band: Band): boolean {
  return value >= band[0] && value <= band[1];
}
