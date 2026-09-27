import { createRng, type Rng } from "../../rng";
import type { Difficulty } from "../types";
import { evaluate } from "./rules";
import { WIRE_COLORS, type Rule, type Wire, type WireColor, type WiresState } from "./types";

const WIRE_COUNT: Record<Difficulty, number> = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 6 };
const RULE_COUNT: Record<Difficulty, number> = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4 };

function makeWires(rng: Rng, d: Difficulty): Wire[] {
  const n = WIRE_COUNT[d];
  const stripeP = d >= 2 ? 0.35 : 0;
  const ledP = d >= 4 ? 0.3 : 0;
  return Array.from({ length: n }, () => ({
    color: rng.pick(WIRE_COLORS),
    striped: rng.chance(stripeP),
    led: rng.chance(ledP),
  }));
}

type Template = (rng: Rng) => Rule;

function colorRule(rng: Rng): Rule {
  const c: WireColor = rng.pick(WIRE_COLORS);
  if (rng.chance(0.5))
    return {
      condition: { kind: "countGt", color: c, n: 1 },
      target: { kind: "lastOfColor", color: c },
      text: `If there is more than one ${c} wire, cut the last ${c} wire.`,
    };
  return {
    condition: { kind: "countEq", color: c, n: 1 },
    target: { kind: "firstOfColor", color: c },
    text: `If there is exactly one ${c} wire, cut the first ${c} wire.`,
  };
}

const noneRule = (rng: Rng): Rule => {
  const c: WireColor = rng.pick(WIRE_COLORS);
  return {
    condition: { kind: "none", color: c },
    target: { kind: "position", where: "last" },
    text: `If there are no ${c} wires, cut the last wire.`,
  };
};

const stripedRule = (rng: Rng): Rule => {
  const c: WireColor = rng.pick(WIRE_COLORS);
  if (rng.chance(0.5))
    return {
      condition: { kind: "noneAndStriped", color: c },
      target: { kind: "firstStriped" },
      text: `If there are no ${c} wires and a striped wire exists, cut the first striped wire.`,
    };
  return {
    condition: { kind: "anyStriped" },
    target: { kind: "lastStriped" },
    text: `If any wire is striped, cut the last striped wire.`,
  };
};

const ledRule = (): Rule => ({
  condition: { kind: "anyLed" },
  target: { kind: "firstLed" },
  text: `If any wire has a lit LED, cut the first wire with a lit LED.`,
});

function makeRules(rng: Rng, d: Difficulty): Rule[] {
  const pool: Template[] = [colorRule, colorRule, noneRule];
  if (d >= 2) pool.push(stripedRule);
  if (d >= 4) pool.push(ledRule);
  const rules: Rule[] = [];
  for (let i = 0; i < RULE_COUNT[d]; i++) rules.push(rng.pick(pool)(rng));
  const where = rng.chance(0.5) ? "first" : "last";
  rules.push({
    condition: { kind: "always" },
    target: { kind: "position", where },
    text: `Otherwise, cut the ${where} wire.`,
  });
  return rules;
}

export function generate(seed: string, difficulty: Difficulty): WiresState {
  const rng = createRng(seed, "wires");
  const wires = makeWires(rng, difficulty);
  const rules = makeRules(rng, difficulty);
  return { difficulty, wires, rules, answer: evaluate(rules, wires), solved: false };
}
