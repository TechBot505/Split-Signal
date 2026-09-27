import { z } from "zod";
import type { PuzzleModule, Role } from "../types";
import { generate } from "./generate";
import type { KeypadAction, KeypadState, KeypadViewA, KeypadViewB } from "./types";

export type { KeypadAction, KeypadState, KeypadViewA, KeypadViewB } from "./types";

const actionSchema: z.ZodType<KeypadAction> = z.object({ press: z.number().int() });

export const keypadPuzzle: PuzzleModule<KeypadState, KeypadViewA, KeypadViewB, KeypadAction> = {
  id: "keypad",
  name: "Symbol Keypad",
  briefing: {
    A: "You have four symbol buttons. Tell B your symbols, then press them in the order B reads.",
    B: "Find the one column containing all four of A's symbols; read them top to bottom.",
  },
  generate,
  viewA: (s) => ({
    difficulty: s.difficulty,
    buttons: s.buttons,
    progress: s.progress,
    solved: s.solved,
  }),
  viewB: (s) => ({ difficulty: s.difficulty, columns: s.columns, solved: s.solved }),
  canAct: (_s, role: Role) => role === "A",
  apply: (s, role, action) => {
    if (role !== "A" || s.solved) return { state: s, outcome: "invalid" };
    const { press } = action;
    if (press < 0 || press >= s.buttons.length) return { state: s, outcome: "invalid" };
    if (press === s.order[s.progress]) {
      const progress = s.progress + 1;
      if (progress >= s.order.length) return { state: { ...s, progress, solved: true }, outcome: "solved" };
      return { state: { ...s, progress }, outcome: "progress" };
    }
    return { state: { ...s, progress: 0 }, outcome: "strike", message: "Wrong button — start over." };
  },
  actionSchema,
  solve: (s) => s.order.map((press) => ({ role: "A" as const, action: { press } })),
  hint: () => "Find the column that contains all four of A's symbols.",
};
