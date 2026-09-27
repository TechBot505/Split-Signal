import { createRng, type Rng } from "../../rng";
import type { Difficulty } from "../types";
import { SYMBOLS, type KeypadState, type Symbol } from "./types";

const ROWS = 7;
const COLS: Record<Difficulty, number> = { 1: 5, 2: 5, 3: 6, 4: 6, 5: 6 };
/** [min, max] button symbols a decoy column may share (never all 4). */
const OVERLAP: Record<Difficulty, [number, number]> = {
  1: [0, 1],
  2: [1, 2],
  3: [1, 2],
  4: [2, 3],
  5: [3, 3],
};

/** Fill `into` up to ROWS with distinct symbols drawn from `pool`. */
function fill(into: Symbol[], pool: Symbol[], rng: Rng): void {
  const bag = rng.shuffle(pool);
  let i = 0;
  while (into.length < ROWS && i < bag.length) {
    if (!into.includes(bag[i])) into.push(bag[i]);
    i++;
  }
}

function keyColumn(buttons: Symbol[], decoyPool: Symbol[], rng: Rng): { column: Symbol[]; order: number[] } {
  // Place the 4 button symbols at 4 distinct rows, then fill the rest with decoys.
  const rows: (Symbol | null)[] = Array.from({ length: ROWS }, () => null);
  const slots = rng.sample(Array.from({ length: ROWS }, (_, i) => i), 4);
  slots.forEach((row, k) => (rows[row] = buttons[k]));
  const decoys = rng.shuffle(decoyPool);
  let di = 0;
  for (let r = 0; r < ROWS; r++) if (rows[r] === null) rows[r] = decoys[di++];
  const column = rows as Symbol[];
  const order = column.map((sym) => buttons.indexOf(sym)).filter((i) => i >= 0);
  return { column, order };
}

function decoyColumn(buttons: Symbol[], decoyPool: Symbol[], overlap: number, rng: Rng): Symbol[] {
  const shared = rng.sample(buttons, Math.min(overlap, 3));
  const column = [...shared];
  fill(column, decoyPool, rng);
  return rng.shuffle(column);
}

export function generate(seed: string, difficulty: Difficulty): KeypadState {
  const rng = createRng(seed, "keypad");
  const buttons = rng.sample(SYMBOLS, 4);
  const decoyPool = SYMBOLS.filter((s) => !buttons.includes(s));
  const cols = COLS[difficulty];
  const keyColumnIndex = rng.int(0, cols - 1);
  const [lo, hi] = OVERLAP[difficulty];

  const columns: Symbol[][] = [];
  let order: number[] = [];
  for (let c = 0; c < cols; c++) {
    if (c === keyColumnIndex) {
      const key = keyColumn(buttons, decoyPool, rng);
      columns.push(key.column);
      order = key.order;
    } else {
      columns.push(decoyColumn(buttons, decoyPool, rng.int(lo, hi), rng));
    }
  }
  return { difficulty, buttons, columns, keyColumnIndex, order, progress: 0, solved: false };
}
