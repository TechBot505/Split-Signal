import { createRng } from "../../rng";
import type { Difficulty } from "../types";
import { buildClues } from "./clues";
import { countSolutions } from "./solver";
import {
  type BadgeColor,
  type CrewItem,
  type GridState,
  ITEMS,
  SLOTS,
} from "./types";

const BADGES: BadgeColor[] = ["red", "green", "blue", "amber"];

function shuffledSolution(rng: import("../../rng").Rng): CrewItem[] {
  // Avoid the identity order so the secret solution never equals the public
  // roster array (which would surface in both views).
  let sol = rng.shuffle(ITEMS);
  while (sol.every((item, i) => item === ITEMS[i])) sol = rng.shuffle(ITEMS);
  return sol;
}

/** Deterministic logic-grid instance with a verified unique combined solution. */
export function genGrid(seed: string, d: Difficulty): GridState {
  const base = createRng(seed, "grid");
  const sol = shuffledSolution(base);
  const badges = d >= 3 ? base.shuffle(BADGES) : null;

  let cluesA = [] as ReturnType<typeof buildClues>["cluesA"];
  let cluesB = [] as ReturnType<typeof buildClues>["cluesB"];
  // Bounded attempts with independent sub-streams; the minimal-set property
  // makes success the norm, but this guards every seed defensively.
  for (let attempt = 0; attempt < 8; attempt++) {
    const rng = createRng(seed, "grid", `split-${attempt}`);
    const built = buildClues(rng, sol, badges, d);
    const combined = [...built.cluesA, ...built.cluesB];
    if (
      built.cluesA.length > 0 &&
      built.cluesB.length > 0 &&
      countSolutions(combined) === 1 &&
      countSolutions(built.cluesA) > 1 &&
      countSolutions(built.cluesB) > 1
    ) {
      cluesA = built.cluesA;
      cluesB = built.cluesB;
      break;
    }
    cluesA = built.cluesA;
    cluesB = built.cluesB;
  }

  return {
    d,
    items: ITEMS,
    slotCount: SLOTS,
    badges,
    solution: sol,
    cluesA,
    cluesB,
    board: Array<CrewItem | null>(SLOTS).fill(null),
    solved: false,
  };
}
