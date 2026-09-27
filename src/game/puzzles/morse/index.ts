import { z } from "zod";
import { createRng } from "../../rng";
import type { Rng } from "../../rng";
import type { Difficulty, PuzzleModule, Role } from "../types";
import { MORSE, WORD_FAMILIES } from "./data";
import type {
  Candidate,
  MorseAction,
  MorseState,
  MorseToken,
  MorseViewA,
  MorseViewB,
  Speed,
} from "./types";

/** Turn a word into a blink pattern: symbols per letter, a "gap" between letters. */
export function timingFor(word: string): MorseToken[] {
  const letters = word.toUpperCase().split("");
  const out: MorseToken[] = [];
  letters.forEach((ch, i) => {
    for (const sym of MORSE[ch]) out.push(sym === "." ? "dot" : "dash");
    if (i < letters.length - 1) out.push("gap");
  });
  return out;
}

const SPEED_BY_DIFF: Record<number, Speed> = { 3: "slow", 4: "medium", 5: "fast" };

/** Distinct "N.NNN MHz" strings. */
function frequencies(rng: Rng, count: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  while (out.length < count) {
    const f = `${rng.int(3, 29)}.${String(rng.int(0, 999)).padStart(3, "0")} MHz`;
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
  }
  return out;
}

const actionSchema: z.ZodType<MorseAction> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("tune"), index: z.number().int() }),
  z.object({ type: z.literal("transmit") }),
]);

export const morsePuzzle: PuzzleModule<MorseState, MorseViewA, MorseViewB, MorseAction> = {
  id: "morse",
  name: "Morse Beacon",
  briefing: {
    A: "Read the blinking lamp aloud — short blinks and long blinks.",
    B: "Decode it with the chart, tune the matching word's frequency, then Transmit.",
  },

  generate(seed: string, difficulty: Difficulty): MorseState {
    const rng = createRng(seed, "morse");
    const family = rng.pick(WORD_FAMILIES);
    const word = rng.pick(family);
    const others = WORD_FAMILIES.flat().filter((w) => !family.includes(w));
    const count = rng.int(10, 16);
    // Include the whole prefix-sharing family, then fill with decoys from elsewhere.
    const pool = [...family, ...rng.shuffle(others)].slice(0, count);
    const words = rng.shuffle(pool);
    const freqs = frequencies(rng, words.length);
    const candidates: Candidate[] = words.map((w, i) => ({ word: w, frequency: freqs[i] }));
    const correctIndex = words.indexOf(word);
    return {
      difficulty,
      timing: timingFor(word),
      length: word.length,
      speed: SPEED_BY_DIFF[difficulty] ?? null,
      candidates,
      correctIndex,
      tuned: -1,
      answerKey: `ANS#${correctIndex}`,
      solved: false,
    };
  },

  viewA(state: MorseState): MorseViewA {
    return {
      role: "A",
      timing: [...state.timing],
      length: state.length,
      speed: state.speed,
      solved: state.solved,
    };
  },

  viewB(state: MorseState): MorseViewB {
    return {
      role: "B",
      chart: MORSE,
      candidates: state.candidates.map((c) => ({ ...c })),
      tuned: state.tuned,
      solved: state.solved,
    };
  },

  canAct(state: MorseState, role: Role): boolean {
    return role === "B" && !state.solved;
  },

  apply(state, role: Role, action: MorseAction) {
    if (state.solved || role !== "B") return { state, outcome: "invalid" as const };
    if (action.type === "tune") {
      if (action.index < 0 || action.index >= state.candidates.length) {
        return { state, outcome: "invalid" as const };
      }
      return { state: { ...state, tuned: action.index }, outcome: "progress" as const };
    }
    if (state.tuned === state.correctIndex) {
      return { state: { ...state, solved: true }, outcome: "solved" as const, message: "Word transmitted." };
    }
    return { state, outcome: "strike" as const, message: "Wrong frequency." };
  },

  actionSchema,

  solve(state: MorseState) {
    return [
      { role: "B" as Role, action: { type: "tune", index: state.correctIndex } as MorseAction },
      { role: "B" as Role, action: { type: "transmit" } as MorseAction },
    ];
  },

  hint(): string {
    return "Prefixes match — nail every dot and dash before choosing the frequency.";
  },
};
