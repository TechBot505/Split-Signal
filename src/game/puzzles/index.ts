/**
 * Puzzle registry + stage planner. Maps every puzzle id to its erased module
 * and turns a run seed into a ramped, distinct-type stage list with the vault
 * finale last. See SPEC.md "Puzzle set".
 */
import { createRng } from "../rng";
import { cipherPuzzle } from "./cipher";
import { dialsPuzzle } from "./dials";
import { frequencyPuzzle } from "./frequency";
import { gaugesPuzzle } from "./gauges";
import { gridPuzzle } from "./grid";
import { keypadPuzzle } from "./keypad";
import { mazePuzzle } from "./maze";
import { morsePuzzle } from "./morse";
import { sequencePuzzle } from "./sequence";
import { switchesPuzzle } from "./switches";
import type { AnyPuzzle, Difficulty, PuzzleModule } from "./types";
import { vaultPuzzle } from "./vault";
import { wiresPuzzle } from "./wires";

/**
 * Erase a puzzle module's concrete generics to AnyPuzzle. The engine only ever
 * feeds a module its own state/action back, so widening to `unknown` is sound.
 * A structural cast is required because Zod's action-schema input type sits in a
 * contravariant position and blocks a direct assignment; going through `unknown`
 * keeps us off `any` while documenting that the widening is intentional.
 */
function erase<S, VA, VB, Act>(m: PuzzleModule<S, VA, VB, Act>): AnyPuzzle {
  return m as unknown as AnyPuzzle;
}

/** All puzzle types by id. `vault` is the reserved finale. */
export const PUZZLES: Record<string, AnyPuzzle> = {
  wires: erase(wiresPuzzle),
  keypad: erase(keypadPuzzle),
  dials: erase(dialsPuzzle),
  cipher: erase(cipherPuzzle),
  maze: erase(mazePuzzle),
  sequence: erase(sequencePuzzle),
  gauges: erase(gaugesPuzzle),
  grid: erase(gridPuzzle),
  frequency: erase(frequencyPuzzle),
  switches: erase(switchesPuzzle),
  morse: erase(morsePuzzle),
  vault: erase(vaultPuzzle),
};

/** The finale puzzle, always played as the last stage. */
export const FINALE = "vault";

/** Non-finale ids, used as the pool for the earlier stages. */
export const REGULAR_TYPES: string[] = Object.keys(PUZZLES).filter((id) => id !== FINALE);

/** Look up a puzzle module by id, or undefined if unknown. */
export function getPuzzle(id: string): AnyPuzzle | undefined {
  return PUZZLES[id];
}

/** One planned stage. */
export interface StagePlan {
  type: string;
  difficulty: Difficulty;
}

/** Difficulty ramp bounds [lo, hi] per mode. Daily mirrors standard. */
const RAMP: Record<string, [Difficulty, Difficulty]> = {
  quick: [1, 3],
  standard: [1, 4],
  hard: [2, 5],
  daily: [1, 4],
};

/** Linear difficulty ramp across `count` stages, clamped to 1..5. */
function rampAt(lo: number, hi: number, count: number, i: number): Difficulty {
  if (count <= 1) return hi as Difficulty;
  const v = Math.round(lo + ((hi - lo) * i) / (count - 1));
  return Math.min(5, Math.max(1, v)) as Difficulty;
}

/**
 * Plan `count` stages: distinct types, difficulty ramping per mode, and the
 * vault finale last. Deterministic given `seed`.
 */
export function pickStages(seed: string, count: number, mode: string): StagePlan[] {
  const [lo, hi] = RAMP[mode] ?? RAMP.standard;
  const rng = createRng(seed, "stages");
  const regulars = rng.sample(REGULAR_TYPES, Math.max(0, count - 1));
  const types = [...regulars, FINALE];
  return types.map((type, i) => ({ type, difficulty: rampAt(lo, hi, count, i) }));
}
