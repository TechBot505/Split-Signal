import type { Rng } from "../../rng";

export interface Riddle {
  text: string;
  /** deterministic answer, always 0-9. */
  answer: number;
}

const POLYGONS: [string, number][] = [
  ["a triangle", 3],
  ["a square", 4],
  ["a pentagon", 5],
  ["a hexagon", 6],
  ["a heptagon", 7],
  ["an octagon", 8],
];

const PRIME_AFTER: Record<number, number> = { 1: 2, 2: 3, 3: 5, 4: 5, 5: 7, 6: 7 };

/** Simple template riddles whose answers are always a single digit 0-9. */
const TEMPLATES: ((rng: Rng) => Riddle)[] = [
  (rng) => {
    const [name, sides] = rng.pick(POLYGONS);
    const k = rng.int(0, sides);
    return {
      text: k === 0 ? `the number of sides on ${name}` : `the number of sides on ${name} minus ${k}`,
      answer: sides - k,
    };
  },
  (rng) => {
    const n = rng.int(1, 6);
    return { text: `the smallest prime greater than ${n}`, answer: PRIME_AFTER[n] };
  },
  (rng) => {
    const k = rng.int(0, 5);
    return { text: `the last digit of the days in a week plus ${k}`, answer: (7 + k) % 10 };
  },
  (rng) => {
    const k = rng.int(0, 5);
    return { text: `the number of fingers on one hand minus ${k}`, answer: 5 - k };
  },
  (rng) => {
    const half = rng.int(0, 9);
    return { text: `half of ${half * 2}`, answer: half };
  },
];

export function makeRiddle(rng: Rng): Riddle {
  return rng.pick(TEMPLATES)(rng);
}
