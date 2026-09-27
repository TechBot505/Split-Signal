import type { Difficulty } from "../types";

/** Movement directions. */
export type Dir = "U" | "D" | "L" | "R";

export interface Cell {
  r: number;
  c: number;
}

export interface Landmark {
  r: number;
  c: number;
  glyph: string;
}

/**
 * Perfect maze. `open` is a bitmask per cell of which sides are passages:
 * U=1, D=2, L=4, R=8 (symmetric between neighbours).
 */
export interface MazeState {
  d: Difficulty;
  size: number;
  open: number[][];
  pos: Cell;
  exit: Cell;
  landmarks: Landmark[];
  solved: boolean;
}

/** A (operator) sees only an empty grid: their dot + landmark glyphs. */
export interface MazeViewA {
  size: number;
  pos: Cell;
  landmarks: Landmark[];
  d: Difficulty;
}

/**
 * B (advisor) sees the full walls + exit + landmarks. At d<=3 B also sees A's
 * live position; at d>=4 B does NOT (A must describe landmarks passed).
 */
export interface MazeViewB {
  size: number;
  open: number[][];
  exit: Cell;
  landmarks: Landmark[];
  pos: Cell | null;
  d: Difficulty;
}

export interface MazeAction {
  move: Dir;
}

export const BIT: Record<Dir, number> = { U: 1, D: 2, L: 4, R: 8 };
export const OPP: Record<Dir, Dir> = { U: "D", D: "U", L: "R", R: "L" };
export const DR: Record<Dir, number> = { U: -1, D: 1, L: 0, R: 0 };
export const DC: Record<Dir, number> = { U: 0, D: 0, L: -1, R: 1 };
export const DIRS: Dir[] = ["U", "D", "L", "R"];
