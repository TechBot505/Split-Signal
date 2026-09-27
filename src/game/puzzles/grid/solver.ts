import { type Clue, type CrewItem, ITEMS } from "./types";

/** All 24 permutations of the four crew items (slot -> item). */
export function allPerms(): CrewItem[][] {
  const out: CrewItem[][] = [];
  const recur = (rest: CrewItem[], acc: CrewItem[]): void => {
    if (rest.length === 0) {
      out.push([...acc]);
      return;
    }
    for (let i = 0; i < rest.length; i++) {
      const next = [...rest.slice(0, i), ...rest.slice(i + 1)];
      recur(next, [...acc, rest[i]]);
    }
  };
  recur(ITEMS, []);
  return out;
}

const PERMS = allPerms();

function slotOf(perm: CrewItem[], item: CrewItem): number {
  return perm.indexOf(item);
}

/** Whether a permutation (slot -> item) satisfies a single clue. */
export function satisfies(perm: CrewItem[], clue: Clue): boolean {
  switch (clue.kind) {
    case "pos":
    case "badge":
      return perm[clue.slot] === clue.item;
    case "notpos":
      return perm[clue.slot] !== clue.item;
    case "leftof":
      return slotOf(perm, clue.a) < slotOf(perm, clue.b);
    case "immleft":
      return slotOf(perm, clue.a) + 1 === slotOf(perm, clue.b);
    case "adj":
      return Math.abs(slotOf(perm, clue.a) - slotOf(perm, clue.b)) === 1;
    case "notadj":
      return Math.abs(slotOf(perm, clue.a) - slotOf(perm, clue.b)) !== 1;
    case "end": {
      const s = slotOf(perm, clue.item);
      return s === 0 || s === ITEMS.length - 1;
    }
  }
}

/** Count permutations consistent with every clue. */
export function countSolutions(clues: Clue[]): number {
  let n = 0;
  for (const perm of PERMS) {
    if (clues.every((c) => satisfies(perm, c))) n++;
  }
  return n;
}
