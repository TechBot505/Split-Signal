import type { Difficulty } from "../types";

export interface SwitchesState {
  difficulty: Difficulty;
  /** number of switches (6..8) */
  n: number;
  /** number of LEDs (5..6) */
  m: number;
  /** wiring[switch][led]: true => that switch toggles that LED (B-only). */
  wiring: boolean[][];
  /** required LED pattern (B-only). */
  target: boolean[];
  /** A's current switch positions. */
  switches: boolean[];
  /** an intended switch combo reaching the target (oracle-only, secret). */
  solution: boolean[];
  /** sentinel encodings used only by the leak-check oracle. */
  targetKey: string;
  wiringKey: string;
  solutionKey: string;
  solved: boolean;
}

export type SwitchesAction = { type: "flip"; index: number } | { type: "submit" };

export interface SwitchesViewA {
  role: "A";
  /** current switch positions (operator sees these). */
  switches: boolean[];
  /** live LED states derived from wiring + switches. */
  leds: boolean[];
  n: number;
  m: number;
  solved: boolean;
}

export interface SwitchesViewB {
  role: "B";
  /** hidden wiring diagram (advisor holds this). */
  wiring: boolean[][];
  /** required LED pattern. */
  target: boolean[];
  n: number;
  m: number;
  solved: boolean;
}
