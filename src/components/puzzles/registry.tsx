import type { ComponentType, ReactElement } from "react";
import type { Role } from "@/game/puzzles/types";
import { CipherA, CipherB } from "./cipher";
import { DialsA, DialsB } from "./dials";
import { FrequencyA, FrequencyB } from "./frequency";
import { GaugesA, GaugesB } from "./gauges";
import { GridA, GridB } from "./grid";
import { KeypadA, KeypadB } from "./keypad";
import { MazeA, MazeB } from "./maze";
import { MorseA, MorseB } from "./morse";
import { SequenceA, SequenceB } from "./sequence";
import { SwitchesA, SwitchesB } from "./switches";
import type { PuzzleViewProps } from "./types";
import { VaultA, VaultB } from "./vault";
import { WiresA, WiresB } from "./wires";

/** Erased view component — view/action generics widened to unknown. */
export type AnyPuzzleView = ComponentType<PuzzleViewProps<unknown, unknown>>;

export interface PuzzleViewPair {
  A: AnyPuzzleView;
  B: AnyPuzzleView;
}

/**
 * Erase a concretely-typed puzzle view pair to the registry's `unknown` view
 * type. This is the single type-erasure boundary in the puzzle UI: the engine
 * only ever feeds a view the role-matched projection produced by the same
 * puzzle module, so widening the view/action generics to `unknown` is sound.
 */
function pair<VA, AA, VB, AB>(
  A: ComponentType<PuzzleViewProps<VA, AA>>,
  B: ComponentType<PuzzleViewProps<VB, AB>>,
): PuzzleViewPair {
  return { A: A as unknown as AnyPuzzleView, B: B as unknown as AnyPuzzleView };
}

/** A/B React views for every puzzle id, keyed to match `PUZZLES` in src/game. */
export const PUZZLE_VIEWS: Record<string, PuzzleViewPair> = {
  wires: pair(WiresA, WiresB),
  keypad: pair(KeypadA, KeypadB),
  dials: pair(DialsA, DialsB),
  cipher: pair(CipherA, CipherB),
  maze: pair(MazeA, MazeB),
  sequence: pair(SequenceA, SequenceB),
  gauges: pair(GaugesA, GaugesB),
  grid: pair(GridA, GridB),
  frequency: pair(FrequencyA, FrequencyB),
  switches: pair(SwitchesA, SwitchesB),
  morse: pair(MorseA, MorseB),
  vault: pair(VaultA, VaultB),
};

/**
 * Render the correct puzzle view for a stage. `props.view` is the role-specific
 * projection (viewA/viewB) the server already computed, so no narrowing is
 * needed here — the erased component consumes it as `unknown`.
 */
export function renderPuzzle(
  type: string,
  role: Role,
  props: PuzzleViewProps<unknown, unknown>,
): ReactElement | null {
  const views = PUZZLE_VIEWS[type];
  if (!views) return null;
  const View = role === "A" ? views.A : views.B;
  return <View {...props} />;
}
