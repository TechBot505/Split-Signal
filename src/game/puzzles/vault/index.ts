import { z } from "zod";
import { createRng } from "../../rng";
import type { Difficulty, PuzzleModule, Role } from "../types";
import { makeRiddle } from "./riddles";
import type { VaultAction, VaultState, VaultViewA, VaultViewB } from "./types";

const actionSchema: z.ZodType<VaultAction> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("digit"), value: z.number().int() }),
  z.object({ type: z.literal("clear") }),
  z.object({ type: z.literal("enter") }),
]);

function equal(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export const vaultPuzzle: PuzzleModule<VaultState, VaultViewA, VaultViewB, VaultAction> = {
  id: "vault",
  name: "The Vault",
  briefing: {
    A: "You hold the keypad and the first riddles. Get every digit from your partner too, then Enter.",
    B: "Solve your riddles and read the answers to your partner — you can't touch the keypad.",
  },

  generate(seed: string, difficulty: Difficulty): VaultState {
    const rng = createRng(seed, "vault");
    const codeLen = difficulty >= 5 ? 5 : 4;
    const riddles = Array.from({ length: codeLen }, () => makeRiddle(rng));
    const code = riddles.map((r) => r.answer);
    const checksum = code.reduce((a, b) => a + b, 0);
    return {
      difficulty,
      codeLen,
      riddles,
      code,
      split: Math.ceil(codeLen / 2),
      checksum,
      showChecksum: difficulty >= 3,
      entered: [],
      codeKey: `CODE#${code.join("")}`,
      solved: false,
    };
  },

  viewA(state: VaultState): VaultViewA {
    return {
      role: "A",
      riddles: state.riddles.slice(0, state.split).map((r) => r.text),
      entered: [...state.entered],
      codeLen: state.codeLen,
      solved: state.solved,
    };
  },

  viewB(state: VaultState): VaultViewB {
    return {
      role: "B",
      riddles: state.riddles.slice(state.split).map((r) => r.text),
      checksum: state.showChecksum ? state.checksum : null,
      codeLen: state.codeLen,
      solved: state.solved,
    };
  },

  canAct(state: VaultState, role: Role): boolean {
    return role === "A" && !state.solved;
  },

  apply(state, role: Role, action: VaultAction) {
    if (state.solved || role !== "A") return { state, outcome: "invalid" as const };
    if (action.type === "digit") {
      if (action.value < 0 || action.value > 9 || state.entered.length >= state.codeLen) {
        return { state, outcome: "invalid" as const };
      }
      return { state: { ...state, entered: [...state.entered, action.value] }, outcome: "progress" as const };
    }
    if (action.type === "clear") {
      return { state: { ...state, entered: [] }, outcome: "progress" as const };
    }
    if (equal(state.entered, state.code)) {
      return { state: { ...state, solved: true }, outcome: "solved" as const, message: "Vault open." };
    }
    return { state: { ...state, entered: [] }, outcome: "strike" as const, message: "Wrong code." };
  },

  actionSchema,

  solve(state: VaultState) {
    const steps: { role: Role; action: VaultAction }[] = state.code
      .slice(state.entered.length)
      .map((value) => ({ role: "A", action: { type: "digit", value } }));
    steps.push({ role: "A", action: { type: "enter" } });
    return steps;
  },

  hint(): string {
    return "Every digit answers one riddle — trade halves, then A enters the full code.";
  },
};
