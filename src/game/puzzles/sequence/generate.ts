import { createRng } from "../../rng";
import type { Difficulty } from "../types";
import {
  COLORS,
  type SeqColor,
  type SeqTable,
  type SeqTables,
  type SequenceState,
} from "./types";

/** Rounds ramp 3 (d1) -> 5 (d5). */
function roundsFor(d: Difficulty): number {
  return 3 + Math.floor((d - 1) / 2);
}

function makeTable(rng: import("../../rng").Rng): SeqTable {
  const buttons = rng.shuffle(COLORS);
  const table = {} as SeqTable;
  COLORS.forEach((flash, i) => {
    table[flash] = buttons[i];
  });
  return table;
}

/** Deterministic Simon-style instance. */
export function genSequence(seed: string, d: Difficulty): SequenceState {
  const rng = createRng(seed, "sequence");
  const totalRounds = roundsFor(d);
  const master: SeqColor[] = Array.from({ length: totalRounds }, () =>
    rng.pick(COLORS),
  );
  const usesParity = d >= 3;
  const tables: SeqTables = {};
  for (let s = 0; s <= 2; s++) {
    if (usesParity) {
      tables[`${s}-0`] = makeTable(rng);
      tables[`${s}-1`] = makeTable(rng);
    } else {
      tables[`${s}`] = makeTable(rng);
    }
  }
  return {
    d,
    master,
    totalRounds,
    round: 1,
    posInRound: 0,
    strikes: 0,
    tables,
    usesParity,
    solved: false,
  };
}
