import { createRng, type Rng } from "../../rng";
import type { Difficulty } from "../types";
import { CLOCK, COMPASS, POSITIONS, type Clue, type DialsState } from "./types";

const DIAL_COUNT: Record<Difficulty, number> = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 4 };
const RELATIVE_P: Record<Difficulty, number> = { 1: 0, 2: 0, 3: 0.34, 4: 0.5, 5: 0.6 };

function absoluteClue(dial: number, target: number, d: Difficulty, rng: Rng): Clue {
  const useClock = d >= 2 && rng.chance(0.5);
  if (useClock) return { dial, style: "clock", text: `Dial ${dial + 1} points to ${CLOCK[target]}.` };
  return { dial, style: "compass", text: `Dial ${dial + 1} faces ${COMPASS[target]}.` };
}

function relativeClue(dial: number, ref: number, targets: number[]): Clue {
  const offset = (targets[dial] - targets[ref] + POSITIONS) % POSITIONS;
  const text =
    offset === 0
      ? `Dial ${dial + 1} matches dial ${ref + 1}.`
      : `Dial ${dial + 1} is ${offset} click${offset === 1 ? "" : "s"} clockwise from dial ${ref + 1}.`;
  return { dial, style: "relative", text };
}

export function generate(seed: string, difficulty: Difficulty): DialsState {
  const rng = createRng(seed, "dials");
  const n = DIAL_COUNT[difficulty];
  const targets = Array.from({ length: n }, () => rng.int(0, POSITIONS - 1));
  // Offset every position by a non-zero amount so the fresh state is never solved.
  const positions = targets.map((t) => (t + rng.int(1, POSITIONS - 1)) % POSITIONS);

  const clues: Clue[] = [];
  const absoluteDials: number[] = [];
  const relP = RELATIVE_P[difficulty];
  for (let i = 0; i < n; i++) {
    const canRelate = i > 0 && absoluteDials.length > 0;
    if (canRelate && rng.chance(relP)) {
      clues.push(relativeClue(i, rng.pick(absoluteDials), targets));
    } else {
      clues.push(absoluteClue(i, targets[i], difficulty, rng));
      absoluteDials.push(i);
    }
  }
  return { difficulty, positions, targets, clues, solved: false };
}
