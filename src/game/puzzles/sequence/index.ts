import { z } from "zod";
import type { ApplyResult, PuzzleModule, Role } from "../types";
import { genSequence } from "./generate";
import {
  COLORS,
  type SeqColor,
  type SequenceAction,
  type SequenceState,
  type SequenceViewA,
  type SequenceViewB,
  tableKey,
} from "./types";

const actionSchema: z.ZodType<SequenceAction> = z.object({
  press: z.enum(["red", "green", "blue", "yellow"]),
});

function expectedPress(state: SequenceState): SeqColor {
  const flashed = state.master[state.posInRound];
  const key = tableKey(state.strikes, state.round, state.usesParity);
  return state.tables[key][flashed];
}

export const sequencePuzzle: PuzzleModule<
  SequenceState,
  SequenceViewA,
  SequenceViewB,
  SequenceAction
> = {
  id: "sequence",
  name: "Signal Relay",
  briefing: {
    A: "Watch the light panel flash, then press the buttons your partner translates.",
    B: "You hold the colour translation table. Convert each flash to a button to press.",
  },

  generate: genSequence,

  viewA(state) {
    return {
      round: state.round,
      totalRounds: state.totalRounds,
      flash: state.master.slice(0, state.round),
      strikes: state.strikes,
    };
  },

  viewB(state) {
    return {
      round: state.round,
      totalRounds: state.totalRounds,
      strikes: state.strikes,
      tables: state.tables,
      usesParity: state.usesParity,
    };
  },

  canAct(state, role) {
    return role === "A" && !state.solved;
  },

  apply(state, role, action): ApplyResult<SequenceState> {
    if (role !== "A" || state.solved) return { state, outcome: "invalid" };
    if (action.press !== expectedPress(state)) {
      return {
        state: { ...state, strikes: state.strikes + 1, posInRound: 0 },
        outcome: "strike",
        message: "Wrong button — the sequence resets.",
      };
    }
    const np = state.posInRound + 1;
    if (np >= state.round) {
      if (state.round >= state.totalRounds) {
        return { state: { ...state, solved: true }, outcome: "solved" };
      }
      return {
        state: { ...state, round: state.round + 1, posInRound: 0 },
        outcome: "progress",
      };
    }
    return { state: { ...state, posInRound: np }, outcome: "progress" };
  },

  actionSchema,

  solve(state) {
    const steps: { role: Role; action: SequenceAction }[] = [];
    let round = state.round;
    let pos = state.posInRound;
    // solve() presses correctly, so strikes never change mid-solve.
    while (round <= state.totalRounds) {
      for (let p = pos; p < round; p++) {
        const flashed = state.master[p];
        const key = tableKey(state.strikes, round, state.usesParity);
        steps.push({ role: "A", action: { press: state.tables[key][flashed] } });
      }
      pos = 0;
      round++;
    }
    return steps;
  },

  hint(state) {
    return `The current flash translates to the ${expectedPress(state)} button.`;
  },
};

export { COLORS };
