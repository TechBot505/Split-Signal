import type { Condition, Rule, Target, Wire, WireColor } from "./types";

const count = (wires: Wire[], color: WireColor): number =>
  wires.filter((w) => w.color === color).length;

const anyStriped = (wires: Wire[]): boolean => wires.some((w) => w.striped);
const anyLed = (wires: Wire[]): boolean => wires.some((w) => w.led);

/** True if the condition holds for the given wires. */
export function conditionMatches(cond: Condition, wires: Wire[]): boolean {
  switch (cond.kind) {
    case "countGt":
      return count(wires, cond.color) > cond.n;
    case "countEq":
      return count(wires, cond.color) === cond.n;
    case "none":
      return count(wires, cond.color) === 0;
    case "noneAndStriped":
      return count(wires, cond.color) === 0 && anyStriped(wires);
    case "anyStriped":
      return anyStriped(wires);
    case "anyLed":
      return anyLed(wires);
    case "always":
      return true;
  }
}

/** Resolve a target to a wire index, or -1 if no such wire exists. */
export function resolveTarget(target: Target, wires: Wire[]): number {
  switch (target.kind) {
    case "lastOfColor": {
      for (let i = wires.length - 1; i >= 0; i--) if (wires[i].color === target.color) return i;
      return -1;
    }
    case "firstOfColor":
      return wires.findIndex((w) => w.color === target.color);
    case "firstStriped":
      return wires.findIndex((w) => w.striped);
    case "lastStriped": {
      for (let i = wires.length - 1; i >= 0; i--) if (wires[i].striped) return i;
      return -1;
    }
    case "firstLed":
      return wires.findIndex((w) => w.led);
    case "position":
      return wires.length === 0 ? -1 : target.where === "first" ? 0 : wires.length - 1;
  }
}

/**
 * First rule (top to bottom) whose condition matches AND whose target resolves
 * to a real wire wins. The generated fallback `always -> position` guarantees a
 * result, so evaluation is always defined and unambiguous.
 */
export function evaluate(rules: Rule[], wires: Wire[]): number {
  for (const rule of rules) {
    if (!conditionMatches(rule.condition, wires)) continue;
    const idx = resolveTarget(rule.target, wires);
    if (idx !== -1) return idx;
  }
  return wires.length - 1;
}
