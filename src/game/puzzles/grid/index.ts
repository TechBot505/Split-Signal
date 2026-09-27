import { z } from "zod";
import type { ApplyResult, PuzzleModule, Role } from "../types";
import { genGrid } from "./generate";
import {
  type CrewItem,
  type GridAction,
  type GridState,
  type GridViewA,
  type GridViewB,
} from "./types";

const actionSchema: z.ZodType<GridAction> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("place"),
    item: z.enum(["Ava", "Bo", "Cy", "Dee"]),
    slot: z.number().int().min(0).max(3),
  }),
  z.object({ type: z.literal("clear"), slot: z.number().int().min(0).max(3) }),
  z.object({ type: z.literal("submit") }),
]);

function boardView(state: GridState, clues: string[]): GridViewA {
  return {
    items: state.items,
    slotCount: state.slotCount,
    badges: state.badges,
    board: state.board,
    clues,
  };
}

export const gridPuzzle: PuzzleModule<
  GridState,
  GridViewA,
  GridViewB,
  GridAction
> = {
  id: "grid",
  name: "Bunk Assignment",
  briefing: {
    A: "You hold half the clues. Share them and place crew on the shared board.",
    B: "You hold the other half. Combine both sets to seat all four crew, then submit.",
  },

  generate: genGrid,

  viewA(state) {
    return boardView(state, state.cluesA.map((c) => c.text));
  },

  viewB(state) {
    return boardView(state, state.cluesB.map((c) => c.text));
  },

  canAct(state, role) {
    return (role === "A" || role === "B") && !state.solved;
  },

  apply(state, _role, action): ApplyResult<GridState> {
    if (state.solved) return { state, outcome: "invalid" };
    if (action.type === "place") {
      const board: (CrewItem | null)[] = state.board.map((x) =>
        x === action.item ? null : x,
      );
      board[action.slot] = action.item;
      return { state: { ...state, board }, outcome: "progress" };
    }
    if (action.type === "clear") {
      const board = [...state.board];
      board[action.slot] = null;
      return { state: { ...state, board }, outcome: "progress" };
    }
    const correct = state.board.every((x, i) => x === state.solution[i]);
    if (correct) return { state: { ...state, solved: true }, outcome: "solved" };
    return { state, outcome: "strike", message: "Wrong arrangement!" };
  },

  actionSchema,

  solve(state) {
    const steps: { role: Role; action: GridAction }[] = [];
    state.solution.forEach((item, slot) => {
      if (state.board[slot] !== item) {
        steps.push({ role: "A", action: { type: "place", item, slot } });
      }
    });
    steps.push({ role: "A", action: { type: "submit" } });
    return steps;
  },

  hint(state) {
    return `${state.solution[0]} belongs in bunk 1.`;
  },
};
