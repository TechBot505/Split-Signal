import type { Difficulty } from "../types";

export type CrewItem = "Ava" | "Bo" | "Cy" | "Dee";
export type BadgeColor = "red" | "green" | "blue" | "amber";

export const ITEMS: CrewItem[] = ["Ava", "Bo", "Cy", "Dee"];
export const SLOTS = 4;

/**
 * A positional clue over a slot->item arrangement. `text` is the player-facing
 * sentence; the structured fields drive the brute-force solver.
 */
export type Clue =
  | { kind: "pos"; item: CrewItem; slot: number; text: string }
  | { kind: "notpos"; item: CrewItem; slot: number; text: string }
  | { kind: "leftof"; a: CrewItem; b: CrewItem; text: string }
  | { kind: "immleft"; a: CrewItem; b: CrewItem; text: string }
  | { kind: "adj"; a: CrewItem; b: CrewItem; text: string }
  | { kind: "notadj"; a: CrewItem; b: CrewItem; text: string }
  | { kind: "end"; item: CrewItem; text: string }
  | { kind: "badge"; item: CrewItem; slot: number; text: string };

export interface GridState {
  d: Difficulty;
  items: CrewItem[];
  slotCount: number;
  /** slot -> badge colour; public bunk labels (d>=3) or null. */
  badges: BadgeColor[] | null;
  /** slot -> item. Secret solution. */
  solution: CrewItem[];
  cluesA: Clue[];
  cluesB: Clue[];
  board: (CrewItem | null)[];
  solved: boolean;
}

/** Both roles share the board; each holds only their own clue text. */
export interface GridViewA {
  items: CrewItem[];
  slotCount: number;
  badges: BadgeColor[] | null;
  board: (CrewItem | null)[];
  clues: string[];
}

export type GridViewB = GridViewA;

export type GridAction =
  | { type: "place"; item: CrewItem; slot: number }
  | { type: "clear"; slot: number }
  | { type: "submit" };
