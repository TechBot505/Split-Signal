import type { Difficulty } from "../types";

/** Six wire colors used across the puzzle. UI maps these ids to real colors. */
export const WIRE_COLORS = ["red", "blue", "yellow", "green", "white", "black"] as const;
export type WireColor = (typeof WIRE_COLORS)[number];

/** A single wire A can see (color, optional stripe, optional lit LED on its port). */
export interface Wire {
  color: WireColor;
  striped: boolean;
  led: boolean;
}

/** Condition half of a rulebook entry (only B sees these). */
export type Condition =
  | { kind: "countGt"; color: WireColor; n: number }
  | { kind: "countEq"; color: WireColor; n: number }
  | { kind: "none"; color: WireColor }
  | { kind: "noneAndStriped"; color: WireColor }
  | { kind: "anyStriped" }
  | { kind: "anyLed" }
  | { kind: "always" };

/** Target half of a rulebook entry — which wire to cut when the condition matches. */
export type Target =
  | { kind: "lastOfColor"; color: WireColor }
  | { kind: "firstOfColor"; color: WireColor }
  | { kind: "firstStriped" }
  | { kind: "lastStriped" }
  | { kind: "firstLed" }
  | { kind: "position"; where: "first" | "last" };

/** One ordered rulebook entry with a rendered line for B's manual. */
export interface Rule {
  condition: Condition;
  target: Target;
  text: string;
}

/** Full puzzle state (JSON-serializable). */
export interface WiresState {
  difficulty: Difficulty;
  wires: Wire[];
  rules: Rule[];
  /** Index the rulebook resolves to. Secret from A. */
  answer: number;
  solved: boolean;
}

/** A sees the physical wires only. */
export interface WiresViewA {
  difficulty: Difficulty;
  wires: Wire[];
  solved: boolean;
}

/** B sees the rulebook only (never the actual wires). */
export interface WiresViewB {
  difficulty: Difficulty;
  wireCount: number;
  rules: Rule[];
  solved: boolean;
}

/** A cuts a single wire by index. */
export interface WiresAction {
  cut: number;
}
