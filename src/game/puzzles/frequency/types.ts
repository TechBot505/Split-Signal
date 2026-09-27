import type { Difficulty } from "../types";

export type Knob = "amplitude" | "frequency" | "phase";

/** A's tunable settings. amplitude 1-5, frequency 1-5, phase 0-3. */
export interface FrequencySettings {
  amplitude: number;
  frequency: number;
  phase: number;
}

export interface FrequencyState {
  difficulty: Difficulty;
  /** Active knobs: [amplitude, frequency] or (+phase at d>=3). */
  knobs: Knob[];
  usePhase: boolean;
  /** d>=4: B only gets the verbal description, not the numeric target. */
  verbal: boolean;
  /** A's live settings (secret from B — B must ask). */
  current: FrequencySettings;
  /** Target waveform (secret from A). */
  target: FrequencySettings;
  /** Verbal description of the target, uniquely identifying it. */
  description: string[];
  /** Sentinel encodings used only by the leak-check oracle. */
  targetKey: string;
  currentKey: string;
  solved: boolean;
}

export type FrequencyAction =
  | { type: "set"; knob: Knob; value: number }
  | { type: "confirm" };

export interface FrequencyViewA {
  role: "A";
  knobs: Knob[];
  current: FrequencySettings;
  ranges: {
    amplitude: [number, number];
    frequency: [number, number];
    phase: [number, number];
  };
  solved: boolean;
}

export interface FrequencyViewB {
  role: "B";
  knobs: Knob[];
  verbal: boolean;
  /** Numeric target (d<4) or null when verbal-only. */
  target: FrequencySettings | null;
  /** Verbal description (d>=4) or null. */
  description: string[] | null;
  solved: boolean;
}
