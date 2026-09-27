import { z } from "zod";
import { createRng } from "../../rng";
import type { Difficulty, PuzzleModule, Role } from "../types";
import type {
  SwitchesAction,
  SwitchesState,
  SwitchesViewA,
  SwitchesViewB,
} from "./types";

/** LED states = XOR of wiring rows for every switch that is ON. */
export function ledsFor(wiring: boolean[][], switches: boolean[], m: number): boolean[] {
  const leds = new Array<boolean>(m).fill(false);
  for (let s = 0; s < switches.length; s++) {
    if (!switches[s]) continue;
    for (let l = 0; l < m; l++) if (wiring[s][l]) leds[l] = !leds[l];
  }
  return leds;
}

function bits(arr: boolean[]): string {
  return arr.map((b) => (b ? "1" : "0")).join("");
}

function equal(a: boolean[], b: boolean[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

const actionSchema: z.ZodType<SwitchesAction> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("flip"), index: z.number().int() }),
  z.object({ type: z.literal("submit") }),
]);

export const switchesPuzzle: PuzzleModule<
  SwitchesState,
  SwitchesViewA,
  SwitchesViewB,
  SwitchesAction
> = {
  id: "switches",
  name: "Cross-Wired",
  briefing: {
    A: "Flip switches to light the LEDs your partner needs, then Submit.",
    B: "Read the wiring diagram and the target pattern out loud — you can't touch the switches.",
  },

  generate(seed: string, difficulty: Difficulty): SwitchesState {
    const rng = createRng(seed, "switches");
    const n = 6 + Math.floor((difficulty - 1) / 2); // 6,6,7,7,8
    const m = rng.int(5, 6);
    const wiring: boolean[][] = [];
    for (let s = 0; s < n; s++) {
      let row: boolean[];
      do {
        row = Array.from({ length: m }, () => rng.chance(0.5));
      } while (!row.some(Boolean)); // each switch toggles a non-empty subset
      wiring.push(row);
    }
    // Pick a random switch combo, then derive a reachable target from it.
    let solution = Array.from({ length: n }, () => rng.chance(0.5));
    let target = ledsFor(wiring, solution, m);
    if (!target.some(Boolean)) {
      // Fall back to a single switch so the target always lights >=1 LED.
      const k = rng.int(0, n - 1);
      solution = Array.from({ length: n }, (_, i) => i === k);
      target = wiring[k].slice();
    }
    return {
      difficulty,
      n,
      m,
      wiring,
      target,
      switches: new Array<boolean>(n).fill(false),
      solution,
      targetKey: `T#${bits(target)}`,
      wiringKey: `W#${wiring.map(bits).join("")}`,
      solutionKey: `S#${bits(solution)}`,
      solved: false,
    };
  },

  viewA(state: SwitchesState): SwitchesViewA {
    return {
      role: "A",
      switches: [...state.switches],
      leds: ledsFor(state.wiring, state.switches, state.m),
      n: state.n,
      m: state.m,
      solved: state.solved,
    };
  },

  viewB(state: SwitchesState): SwitchesViewB {
    return {
      role: "B",
      wiring: state.wiring.map((r) => [...r]),
      target: [...state.target],
      n: state.n,
      m: state.m,
      solved: state.solved,
    };
  },

  canAct(state: SwitchesState, role: Role): boolean {
    return role === "A" && !state.solved;
  },

  apply(state, role: Role, action: SwitchesAction) {
    if (state.solved || role !== "A") return { state, outcome: "invalid" as const };
    if (action.type === "flip") {
      if (action.index < 0 || action.index >= state.n) return { state, outcome: "invalid" as const };
      const switches = [...state.switches];
      switches[action.index] = !switches[action.index];
      return { state: { ...state, switches }, outcome: "progress" as const };
    }
    const leds = ledsFor(state.wiring, state.switches, state.m);
    if (equal(leds, state.target)) {
      return { state: { ...state, solved: true }, outcome: "solved" as const, message: "LEDs matched." };
    }
    return { state, outcome: "strike" as const, message: "Wrong LED pattern." };
  },

  actionSchema,

  solve(state: SwitchesState) {
    const steps: { role: Role; action: SwitchesAction }[] = [];
    state.solution.forEach((on, i) => {
      if (on !== state.switches[i]) steps.push({ role: "A", action: { type: "flip", index: i } });
    });
    steps.push({ role: "A", action: { type: "submit" } });
    return steps;
  },

  hint(): string {
    return "Each switch flips several LEDs at once — B's diagram shows exactly which.";
  },
};
