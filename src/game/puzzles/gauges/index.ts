import { z } from "zod";
import type { ApplyResult, PuzzleModule, Role } from "../types";
import { genGauges, searchSolution } from "./generate";
import {
  evalFormula,
  type GaugesAction,
  type GaugesState,
  type GaugesViewA,
  type GaugesViewB,
  inBand,
  NUM_GAUGES,
} from "./types";

const actionSchema: z.ZodType<GaugesAction> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("set"),
    lever: z.number().int().min(0).max(3),
    value: z.number().int().min(0).max(9),
  }),
  z.object({ type: z.literal("engage") }),
]);

export const gaugesPuzzle: PuzzleModule<
  GaugesState,
  GaugesViewA,
  GaugesViewB,
  GaugesAction
> = {
  id: "gauges",
  name: "Reactor Trim",
  briefing: {
    A: "You control the levers. Read values to your partner and Engage when told.",
    B: "You hold the reactor manual: formulas and safe bands. Talk the levers into range.",
  },

  generate: genGauges,

  viewA(state) {
    return { numLevers: state.numLevers, levers: state.levers, d: state.d };
  },

  viewB(state) {
    return {
      numGauges: NUM_GAUGES,
      formulas: state.formulas,
      bands: state.bands,
      d: state.d,
    };
  },

  canAct(state, role) {
    return role === "A" && !state.solved;
  },

  apply(state, role, action): ApplyResult<GaugesState> {
    if (role !== "A" || state.solved) return { state, outcome: "invalid" };
    if (action.type === "set") {
      if (action.lever >= state.numLevers) return { state, outcome: "invalid" };
      const levers = [...state.levers];
      levers[action.lever] = action.value;
      return { state: { ...state, levers }, outcome: "progress" };
    }
    const ok = state.formulas.every((f, g) =>
      inBand(evalFormula(f, state.levers), state.bands[g]),
    );
    if (ok) return { state: { ...state, solved: true }, outcome: "solved" };
    return { state, outcome: "strike", message: "Gauges out of band!" };
  },

  actionSchema,

  solve(state) {
    const target = searchSolution(state);
    const steps: { role: Role; action: GaugesAction }[] = [];
    if (!target) return steps;
    target.forEach((value, lever) => {
      if (state.levers[lever] !== value) {
        steps.push({ role: "A", action: { type: "set", lever, value } });
      }
    });
    steps.push({ role: "A", action: { type: "engage" } });
    return steps;
  },

  hint(state) {
    const target = searchSolution(state);
    if (!target) return "No safe configuration found.";
    return `One safe setting is levers = [${target.join(", ")}].`;
  },
};
