import type { ZodType } from "zod";

/**
 * Split Signal puzzle contract. Every puzzle type implements PuzzleModule.
 * Pure TS only — runs in the Cloudflare worker, the browser and Vitest.
 * See SPEC.md "PuzzleModule contract".
 */

export type Role = "A" | "B";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ApplyOutcome = "progress" | "solved" | "strike" | "invalid";

export interface ApplyResult<S> {
  state: S;
  outcome: ApplyOutcome;
  /** Optional short message shown to both players (e.g. "Wrong wire!"). */
  message?: string;
}

export interface SolveStep<Act> {
  role: Role;
  action: Act;
}

export interface PuzzleModule<S, VA, VB, Act> {
  /** Stable id, e.g. "wires". */
  id: string;
  /** Display name, e.g. "Live Wires". */
  name: string;
  /** One-line instruction per role, shown in the stage briefing. */
  briefing: Record<Role, string>;
  /** Deterministic: same seed + difficulty => identical state. Must ALWAYS be solvable. */
  generate(seed: string, difficulty: Difficulty): S;
  /** Role A's serializable view. Must NOT contain role-B-only secrets (and vice versa). */
  viewA(state: S): VA;
  viewB(state: S): VB;
  /** Whether `role` may act right now. */
  canAct(state: S, role: Role): boolean;
  /** Pure validate+apply. Never throws on bad input — return outcome "invalid". */
  apply(state: S, role: Role, action: Act): ApplyResult<S>;
  /** Zod schema validating the action payload before `apply`. */
  actionSchema: ZodType<Act>;
  /** Oracle: an action sequence that solves the instance from its current state. */
  solve(state: S): SolveStep<Act>[];
  /** Hint text shown to both players when a hint is spent. */
  hint(state: S): string;
}

/**
 * Erased module type used by the registry/engine. Methods are declared with method
 * syntax (bivariant params), so any concrete PuzzleModule<S, VA, VB, Act> is assignable
 * here without `any`. The engine only passes a module's own state back into it.
 */
export type AnyPuzzle = PuzzleModule<unknown, unknown, unknown, unknown>;
