import { createRng } from "../../rng";
import type { Difficulty } from "../types";
import {
  type Band,
  evalFormula,
  type Formula,
  type GaugesState,
  inBand,
  NUM_GAUGES,
} from "./types";

/**
 * Deterministic gauges instance. A known solution `sol` (each lever 3-9) is
 * chosen first, so at least one solution always exists. Bands are narrow (width
 * <= 2) around the reading at `sol`; because every lever contributes >= 3, the
 * all-zero start is always out of band (an immediate Engage strikes). At d>=4
 * gauges share levers (coupled), so they cannot be solved one at a time.
 */
export function genGauges(seed: string, d: Difficulty): GaugesState {
  const rng = createRng(seed, "gauges");
  const numLevers = d >= 4 ? 4 : 3;
  const coupled = d >= 4;
  const sol = Array.from({ length: numLevers }, () => rng.int(3, 9));

  const formulas: Formula[] = [];
  for (let g = 0; g < NUM_GAUGES; g++) {
    const coef = Array<number>(numLevers).fill(0);
    if (coupled) {
      const i = g % numLevers;
      const j = (g + 1) % numLevers;
      coef[i] = rng.int(1, 3);
      coef[j] = rng.int(1, 3);
    } else {
      coef[g % numLevers] = rng.int(1, 3);
    }
    formulas.push({ coef, c0: rng.int(0, 6) });
  }

  const bands: Band[] = formulas.map((f) => {
    const v = evalFormula(f, sol);
    const w = rng.int(0, 2);
    return [v - w, v + w] as Band;
  });

  return {
    d,
    numLevers,
    levers: Array<number>(numLevers).fill(0),
    formulas,
    bands,
    solved: false,
  };
}

/** Brute-force search over 0-9 per lever for an assignment satisfying all bands. */
export function searchSolution(state: GaugesState): number[] | null {
  const n = state.numLevers;
  const assign = Array<number>(n).fill(0);
  const total = 10 ** n;
  for (let code = 0; code < total; code++) {
    let x = code;
    for (let i = 0; i < n; i++) {
      assign[i] = x % 10;
      x = Math.floor(x / 10);
    }
    if (state.formulas.every((f, g) => inBand(evalFormula(f, assign), state.bands[g]))) {
      return [...assign];
    }
  }
  return null;
}
