import { z } from "zod";
import type { ApplyResult, PuzzleModule, Role } from "../types";
import { bfsMoves, genMaze } from "./generate";
import {
  BIT,
  DC,
  DR,
  type MazeAction,
  type MazeState,
  type MazeViewA,
  type MazeViewB,
} from "./types";

const actionSchema: z.ZodType<MazeAction> = z.object({
  move: z.enum(["U", "D", "L", "R"]),
});

export const mazePuzzle: PuzzleModule<
  MazeState,
  MazeViewA,
  MazeViewB,
  MazeAction
> = {
  id: "maze",
  name: "Blind Corridor",
  briefing: {
    A: "Move through the dark. Call out the glyphs you pass; your partner has the map.",
    B: "You hold the maze map. Guide the operator to the exit, wall by wall.",
  },

  generate: genMaze,

  viewA(state) {
    return {
      size: state.size,
      pos: state.pos,
      landmarks: state.landmarks,
      d: state.d,
    };
  },

  viewB(state) {
    return {
      size: state.size,
      open: state.open,
      exit: state.exit,
      landmarks: state.landmarks,
      pos: state.d <= 3 ? state.pos : null,
      d: state.d,
    };
  },

  canAct(state, role) {
    return role === "A" && !state.solved;
  },

  apply(state, role, action): ApplyResult<MazeState> {
    if (role !== "A" || state.solved) return { state, outcome: "invalid" };
    const { pos, size, open, exit, d } = state;
    const nr = pos.r + DR[action.move];
    const nc = pos.c + DC[action.move];
    const inBounds = nr >= 0 && nr < size && nc >= 0 && nc < size;
    const canGo = inBounds && (open[pos.r][pos.c] & BIT[action.move]) !== 0;
    if (!canGo) {
      if (d >= 3) return { state, outcome: "strike", message: "You hit a wall!" };
      return { state, outcome: "progress", message: "Blocked by a wall." };
    }
    const solved = nr === exit.r && nc === exit.c;
    return {
      state: { ...state, pos: { r: nr, c: nc }, solved },
      outcome: solved ? "solved" : "progress",
    };
  },

  actionSchema,

  solve(state) {
    return bfsMoves(state).map((move) => ({
      role: "A" as Role,
      action: { move },
    }));
  },

  hint(state) {
    const moves = bfsMoves(state);
    if (moves.length === 0) return "You are already at the exit.";
    return `From here the shortest path starts by moving ${moves[0]}.`;
  },
};
