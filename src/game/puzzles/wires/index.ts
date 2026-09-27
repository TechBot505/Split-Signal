import { z } from "zod";
import type { PuzzleModule, Role } from "../types";
import { generate } from "./generate";
import type { WiresAction, WiresState, WiresViewA, WiresViewB } from "./types";

export type { WiresAction, WiresState, WiresViewA, WiresViewB } from "./types";

const actionSchema: z.ZodType<WiresAction> = z.object({ cut: z.number().int() });

export const wiresPuzzle: PuzzleModule<WiresState, WiresViewA, WiresViewB, WiresAction> = {
  id: "wires",
  name: "Live Wires",
  briefing: {
    A: "You hold the wires. Describe their colors, stripes and LEDs, then cut the one B names.",
    B: "You hold the rulebook. Read the rules in order; the first that matches decides the cut.",
  },
  generate,
  viewA: (s) => ({ difficulty: s.difficulty, wires: s.wires, solved: s.solved }),
  viewB: (s) => ({
    difficulty: s.difficulty,
    wireCount: s.wires.length,
    rules: s.rules,
    solved: s.solved,
  }),
  canAct: (_s, role: Role) => role === "A",
  apply: (s, role, action) => {
    if (role !== "A") return { state: s, outcome: "invalid" };
    const { cut } = action;
    if (cut < 0 || cut >= s.wires.length) return { state: s, outcome: "invalid" };
    if (s.solved) return { state: s, outcome: "invalid" };
    if (cut === s.answer) return { state: { ...s, solved: true }, outcome: "solved" };
    return { state: s, outcome: "strike", message: "Wrong wire!" };
  },
  actionSchema,
  solve: (s) => [{ role: "A", action: { cut: s.answer } }],
  hint: (s) => {
    const first = s.rules[0];
    if (first && "color" in first.condition)
      return `Count the ${first.condition.color} wires before you cut.`;
    return "Read the rulebook top to bottom — the first matching rule wins.";
  },
};
