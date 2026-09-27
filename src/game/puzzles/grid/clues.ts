import type { Rng } from "../../rng";
import type { Difficulty } from "../types";
import { countSolutions } from "./solver";
import { type BadgeColor, type Clue, type CrewItem, ITEMS } from "./types";

const bunk = (slot: number): string => `bunk ${slot + 1}`;

/** Every clue that is TRUE for the given solution. */
function candidates(
  sol: CrewItem[],
  badges: BadgeColor[] | null,
  d: Difficulty,
): Clue[] {
  const slotOf = (item: CrewItem): number => sol.indexOf(item);
  const out: Clue[] = [];
  for (const item of ITEMS) {
    const s = slotOf(item);
    out.push({ kind: "pos", item, slot: s, text: `${item} is in ${bunk(s)}` });
    for (let k = 0; k < ITEMS.length; k++) {
      if (k !== s)
        out.push({ kind: "notpos", item, slot: k, text: `${item} is not in ${bunk(k)}` });
    }
    if (s === 0 || s === ITEMS.length - 1)
      out.push({ kind: "end", item, text: `${item} is at one of the ends` });
  }
  for (const a of ITEMS) {
    for (const b of ITEMS) {
      if (a === b) continue;
      const sa = slotOf(a);
      const sb = slotOf(b);
      if (sa < sb)
        out.push({ kind: "leftof", a, b, text: `${a} is somewhere left of ${b}` });
      if (sa + 1 === sb)
        out.push({ kind: "immleft", a, b, text: `${a} is immediately left of ${b}` });
      if (Math.abs(sa - sb) === 1 && a < b)
        out.push({ kind: "adj", a, b, text: `${a} is next to ${b}` });
      if (Math.abs(sa - sb) !== 1 && a < b)
        out.push({ kind: "notadj", a, b, text: `${a} is not next to ${b}` });
    }
  }
  if (badges && d >= 3) {
    for (const item of ITEMS) {
      const s = slotOf(item);
      out.push({ kind: "badge", item, slot: s, text: `${item} is in the ${badges[s]} bunk` });
    }
  }
  return out;
}

const sig = (c: Clue): string =>
  `${c.kind}:${"item" in c ? c.item : ""}:${"a" in c ? `${c.a}-${c.b}` : ""}:${"slot" in c ? c.slot : ""}`;

/**
 * Build clues splitting into A/B halves such that COMBINED they have a unique
 * solution while NEITHER half alone does. Guaranteed by reducing to a MINIMAL
 * unique set (every clue necessary), so any non-empty split yields two proper
 * subsets — each necessarily non-unique.
 */
export function buildClues(
  rng: Rng,
  sol: CrewItem[],
  badges: BadgeColor[] | null,
  d: Difficulty,
): { cluesA: Clue[]; cluesB: Clue[] } {
  const seen = new Set<string>();
  const pool = rng
    .shuffle(candidates(sol, badges, d))
    .filter((c) => (seen.has(sig(c)) ? false : (seen.add(sig(c)), true)));

  const chosen: Clue[] = [];
  let count = 24;
  for (const c of pool) {
    if (count === 1) break;
    const next = countSolutions([...chosen, c]);
    if (next < count) {
      chosen.push(c);
      count = next;
    }
  }

  let minimal = [...chosen];
  for (const c of [...minimal]) {
    const without = minimal.filter((x) => x !== c);
    if (countSolutions(without) === 1) minimal = without;
  }

  const ordered = rng.shuffle(minimal);
  const cluesA: Clue[] = [];
  const cluesB: Clue[] = [];
  ordered.forEach((c, i) => (i % 2 === 0 ? cluesA : cluesB).push(c));
  return { cluesA, cluesB };
}
