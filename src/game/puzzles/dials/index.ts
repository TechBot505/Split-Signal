import { z } from "zod";
import type { PuzzleModule, Role, SolveStep } from "../types";
import { generate } from "./generate";
import { POSITIONS, type DialsAction, type DialsState, type DialsViewA, type DialsViewB } from "./types";

export type { DialsAction, DialsState, DialsViewA, DialsViewB } from "./types";

const actionSchema: z.ZodType<DialsAction> = z.union([
  z.object({ rotate: z.number().int(), dir: z.union([z.literal(1), z.literal(-1)]) }),
  z.object({ lock: z.literal(true) }),
]);

const aligned = (s: DialsState): boolean => s.positions.every((p, i) => p === s.targets[i]);

export const dialsPuzzle: PuzzleModule<DialsState, DialsViewA, DialsViewB, DialsAction> = {
  id: "dials",
  name: "Alignment Dials",
  briefing: {
    A: "You turn the dials. Tell B where each points; rotate to B's targets, then lock in.",
    B: "You hold the target bearings. Read each clue so A can line every dial up.",
  },
  generate,
  viewA: (s) => ({
    difficulty: s.difficulty,
    positions: s.positions,
    positionCount: POSITIONS,
    solved: s.solved,
  }),
  viewB: (s) => ({
    difficulty: s.difficulty,
    dialCount: s.targets.length,
    clues: s.clues,
    solved: s.solved,
  }),
  canAct: (_s, role: Role) => role === "A",
  apply: (s, role, action) => {
    if (role !== "A" || s.solved) return { state: s, outcome: "invalid" };
    if ("rotate" in action) {
      if (action.rotate < 0 || action.rotate >= s.positions.length) return { state: s, outcome: "invalid" };
      const positions = [...s.positions];
      positions[action.rotate] = (positions[action.rotate] + action.dir + POSITIONS) % POSITIONS;
      return { state: { ...s, positions }, outcome: "progress" };
    }
    if (aligned(s)) return { state: { ...s, solved: true }, outcome: "solved" };
    return { state: s, outcome: "strike", message: "Dials misaligned." };
  },
  actionSchema,
  solve: (s) => {
    const steps: SolveStep<DialsAction>[] = [];
    s.targets.forEach((target, dial) => {
      const clicks = (target - s.positions[dial] + POSITIONS) % POSITIONS;
      for (let k = 0; k < clicks; k++) steps.push({ role: "A", action: { rotate: dial, dir: 1 } });
    });
    steps.push({ role: "A", action: { lock: true } });
    return steps;
  },
  hint: () => "Line up every dial to B's bearings before you lock — one wrong dial strikes.",
};
