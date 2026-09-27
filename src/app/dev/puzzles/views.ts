import type { ComponentType } from "react";
import type { PuzzleViewProps } from "@/components/puzzles/types";
import { CipherA, CipherB } from "@/components/puzzles/cipher";
import { DialsA, DialsB } from "@/components/puzzles/dials";
import { FrequencyA, FrequencyB } from "@/components/puzzles/frequency";
import { GaugesA, GaugesB } from "@/components/puzzles/gauges";
import { GridA, GridB } from "@/components/puzzles/grid";
import { KeypadA, KeypadB } from "@/components/puzzles/keypad";
import { MazeA, MazeB } from "@/components/puzzles/maze";
import { MorseA, MorseB } from "@/components/puzzles/morse";
import { SequenceA, SequenceB } from "@/components/puzzles/sequence";
import { SwitchesA, SwitchesB } from "@/components/puzzles/switches";
import { VaultA, VaultB } from "@/components/puzzles/vault";
import { WiresA, WiresB } from "@/components/puzzles/wires";

/** Erased preview-view component type (view/action generics widened). */
export type PreviewView = ComponentType<PuzzleViewProps<unknown, unknown>>;

export interface PreviewPair {
  A: PreviewView;
  B: PreviewView;
}

/** Cast a typed puzzle view to the erased preview component type. */
function pv<V, Act>(C: ComponentType<PuzzleViewProps<V, Act>>): PreviewView {
  return C as unknown as PreviewView;
}

/**
 * Map of puzzle id -> {A, B} view components for the dev preview page.
 * NOTE: a second agent appends the remaining six puzzles' views to this map.
 */
export const PREVIEW_VIEWS: Record<string, PreviewPair> = {
  wires: { A: pv(WiresA), B: pv(WiresB) },
  keypad: { A: pv(KeypadA), B: pv(KeypadB) },
  dials: { A: pv(DialsA), B: pv(DialsB) },
  cipher: { A: pv(CipherA), B: pv(CipherB) },
  maze: { A: pv(MazeA), B: pv(MazeB) },
  sequence: { A: pv(SequenceA), B: pv(SequenceB) },
  gauges: { A: pv(GaugesA), B: pv(GaugesB) },
  grid: { A: pv(GridA), B: pv(GridB) },
  frequency: { A: pv(FrequencyA), B: pv(FrequencyB) },
  switches: { A: pv(SwitchesA), B: pv(SwitchesB) },
  morse: { A: pv(MorseA), B: pv(MorseB) },
  vault: { A: pv(VaultA), B: pv(VaultB) },
};
