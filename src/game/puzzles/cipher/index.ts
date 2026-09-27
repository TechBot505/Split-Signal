import { z } from "zod";
import type { PuzzleModule, Role, SolveStep } from "../types";
import { generate } from "./generate";
import type { CipherAction, CipherState, CipherViewA, CipherViewB } from "./types";

export type { CipherAction, CipherState, CipherViewA, CipherViewB } from "./types";

const actionSchema: z.ZodType<CipherAction> = z.union([
  z.object({ type: z.string().regex(/^[a-z]$/) }),
  z.object({ backspace: z.literal(true) }),
  z.object({ submit: z.literal(true) }),
]);

export const cipherPuzzle: PuzzleModule<CipherState, CipherViewA, CipherViewB, CipherAction> = {
  id: "cipher",
  name: "Cipher Lock",
  briefing: {
    A: "You see an encrypted word and a keyboard. Read the glyphs to B and type the decoded word.",
    B: "You hold the cipher key and the word list. Guide A to the one word that fits.",
  },
  generate,
  viewA: (s) => ({
    difficulty: s.difficulty,
    mode: s.mode,
    glyphs: s.glyphs,
    wordLength: s.word.length,
    typed: s.typed,
    solved: s.solved,
  }),
  viewB: (s) => ({
    difficulty: s.difficulty,
    mode: s.mode,
    shift: s.shift,
    dir: s.dir,
    table: s.table,
    candidates: s.candidates,
    solved: s.solved,
  }),
  canAct: (_s, role: Role) => role === "A",
  apply: (s, role, action) => {
    if (role !== "A" || s.solved) return { state: s, outcome: "invalid" };
    if ("type" in action) {
      if (s.typed.length >= s.word.length) return { state: s, outcome: "invalid" };
      return { state: { ...s, typed: s.typed + action.type }, outcome: "progress" };
    }
    if ("backspace" in action) {
      return { state: { ...s, typed: s.typed.slice(0, -1) }, outcome: "progress" };
    }
    if (s.typed === s.word) return { state: { ...s, solved: true }, outcome: "solved" };
    return { state: { ...s, typed: "" }, outcome: "strike", message: "Wrong word." };
  },
  actionSchema,
  solve: (s) => {
    const steps: SolveStep<CipherAction>[] = [...s.word].map((ch) => ({
      role: "A" as const,
      action: { type: ch },
    }));
    steps.push({ role: "A", action: { submit: true } });
    return steps;
  },
  hint: (s) =>
    s.mode === "caesar"
      ? "Ask B for the shift, then count each glyph back to its letter."
      : "Read the glyphs to B one by one and map each to a letter.",
};
