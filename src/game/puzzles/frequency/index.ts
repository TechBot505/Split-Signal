import { z } from "zod";
import { createRng } from "../../rng";
import type { Difficulty, PuzzleModule, Role } from "../types";
import type {
  FrequencyAction,
  FrequencySettings,
  FrequencyState,
  FrequencyViewA,
  FrequencyViewB,
  Knob,
} from "./types";

const AMP_WORDS = ["", "flat", "low", "medium", "tall", "towering"];
const FREQ_WORDS = ["", "one peak", "two peaks", "three peaks", "four peaks", "five peaks"];
const PHASE_WORDS = ["centered", "shifted right", "inverted", "shifted left"];

/** Injective description: amplitude×frequency(×phase) map to distinct phrase lists. */
export function describe(t: FrequencySettings, usePhase: boolean): string[] {
  const out = [`${AMP_WORDS[t.amplitude]} waveform`, `${FREQ_WORDS[t.frequency]} visible`];
  if (usePhase) out.push(PHASE_WORDS[t.phase]);
  return out;
}

function inRange(knob: Knob, value: number): boolean {
  if (knob === "phase") return value >= 0 && value <= 3;
  return value >= 1 && value <= 5;
}

function matches(a: FrequencySettings, b: FrequencySettings, usePhase: boolean): boolean {
  return a.amplitude === b.amplitude && a.frequency === b.frequency && (!usePhase || a.phase === b.phase);
}

const actionSchema: z.ZodType<FrequencyAction> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("set"),
    knob: z.enum(["amplitude", "frequency", "phase"]),
    value: z.number().int(),
  }),
  z.object({ type: z.literal("confirm") }),
]);

export const frequencyPuzzle: PuzzleModule<
  FrequencyState,
  FrequencyViewA,
  FrequencyViewB,
  FrequencyAction
> = {
  id: "frequency",
  name: "Frequency Lock",
  briefing: {
    A: "Tune your knobs until the waveform matches what your partner describes.",
    B: "Describe the target waveform, then press Confirm to check the lock.",
  },

  generate(seed: string, difficulty: Difficulty): FrequencyState {
    const rng = createRng(seed, "frequency");
    const usePhase = difficulty >= 3;
    const verbal = difficulty >= 4;
    const knobs: Knob[] = usePhase ? ["amplitude", "frequency", "phase"] : ["amplitude", "frequency"];
    const current: FrequencySettings = { amplitude: 1, frequency: 1, phase: 0 };
    const target: FrequencySettings = {
      amplitude: rng.int(1, 5),
      frequency: rng.int(1, 5),
      phase: usePhase ? rng.int(0, 3) : 0,
    };
    // Guarantee the target differs from the default so a bare Confirm strikes.
    if (matches(target, current, usePhase)) {
      target.amplitude = current.amplitude === 5 ? 4 : current.amplitude + 1;
    }
    return {
      difficulty,
      knobs,
      usePhase,
      verbal,
      current,
      target,
      description: describe(target, usePhase),
      targetKey: `TGT|${target.amplitude}|${target.frequency}|${target.phase}`,
      currentKey: `CUR|${current.amplitude}|${current.frequency}|${current.phase}`,
      solved: false,
    };
  },

  viewA(state: FrequencyState): FrequencyViewA {
    return {
      role: "A",
      knobs: state.knobs,
      current: { ...state.current },
      ranges: { amplitude: [1, 5], frequency: [1, 5], phase: [0, 3] },
      solved: state.solved,
    };
  },

  viewB(state: FrequencyState): FrequencyViewB {
    return {
      role: "B",
      knobs: state.knobs,
      verbal: state.verbal,
      target: state.verbal ? null : { ...state.target },
      description: state.verbal ? [...state.description] : null,
      solved: state.solved,
    };
  },

  canAct(state: FrequencyState): boolean {
    return !state.solved;
  },

  apply(state, role: Role, action: FrequencyAction) {
    if (state.solved) return { state, outcome: "invalid" as const };
    if (action.type === "set") {
      if (role !== "A" || !state.knobs.includes(action.knob) || !inRange(action.knob, action.value)) {
        return { state, outcome: "invalid" as const };
      }
      return {
        state: { ...state, current: { ...state.current, [action.knob]: action.value } },
        outcome: "progress" as const,
      };
    }
    if (role !== "B") return { state, outcome: "invalid" as const };
    if (matches(state.current, state.target, state.usePhase)) {
      return { state: { ...state, solved: true }, outcome: "solved" as const, message: "Signal locked." };
    }
    return { state, outcome: "strike" as const, message: "Waveforms don't match." };
  },

  actionSchema,

  solve(state: FrequencyState) {
    const steps: { role: Role; action: FrequencyAction }[] = state.knobs.map((knob) => ({
      role: "A",
      action: { type: "set", knob, value: state.target[knob] },
    }));
    steps.push({ role: "B", action: { type: "confirm" } });
    return steps;
  },

  hint(): string {
    return "Match every knob to the described waveform, then B presses Confirm.";
  },
};
