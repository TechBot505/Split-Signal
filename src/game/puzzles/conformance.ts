import { describe, expect, it } from "vitest";
import type { AnyPuzzle, Difficulty, Role } from "./types";

/**
 * Shared conformance suite every puzzle test file calls:
 *   runConformance(myPuzzle, { secretsOf: { A: (vB) => [...], B: (vA) => [...] }, wrong: ... })
 * - determinism, solvability across seeds × difficulties, invalid actions never throw,
 * - a wrong move path produces a strike (if `wrongAction` provided),
 * - views never leak the other role's secrets (caller lists forbidden serialized substrings).
 */
export interface ConformanceOptions {
  seeds?: number;
  /** Returns strings that MUST NOT appear in JSON.stringify(view of `role`) for this state. */
  forbiddenIn?: (state: unknown, role: Role) => string[];
  /** Produces an action that should strike from a fresh state (optional). */
  wrongAction?: (state: unknown) => { role: Role; action: unknown } | null;
}

const DIFFS: Difficulty[] = [1, 2, 3, 4, 5];

export function runConformance(p: AnyPuzzle, opts: ConformanceOptions = {}): void {
  const seeds = opts.seeds ?? 200;
  describe(`${p.id} conformance`, () => {
    it("is deterministic per seed", () => {
      for (const d of DIFFS) {
        expect(JSON.stringify(p.generate("det", d))).toBe(JSON.stringify(p.generate("det", d)));
      }
    });

    it(`is solvable for ${seeds} seeds × all difficulties via solve()+apply()`, () => {
      for (const d of DIFFS) {
        for (let i = 0; i < seeds; i++) {
          let s = p.generate(`seed-${i}`, d);
          const steps = p.solve(s);
          let last = "progress";
          for (const step of steps) {
            expect(p.actionSchema.safeParse(step.action).success).toBe(true);
            const r = p.apply(s, step.role, step.action);
            expect(r.outcome, `${p.id} d${d} seed-${i}`).not.toBe("strike");
            expect(r.outcome).not.toBe("invalid");
            s = r.state;
            last = r.outcome;
          }
          expect(last, `${p.id} d${d} seed-${i} not solved`).toBe("solved");
        }
      }
    });

    it("never throws on garbage input", () => {
      const s = p.generate("garbage", 3);
      for (const bad of [null, 42, "x", {}, { foo: 1 }, []]) {
        for (const role of ["A", "B"] as Role[]) {
          if (p.actionSchema.safeParse(bad).success) {
            expect(() => p.apply(s, role, bad)).not.toThrow();
          }
        }
      }
    });

    if (opts.wrongAction) {
      it("wrong move strikes", () => {
        const s = p.generate("wrong", 2);
        const w = opts.wrongAction!(s);
        if (!w) return;
        expect(p.apply(s, w.role, w.action).outcome).toBe("strike");
      });
    }

    if (opts.forbiddenIn) {
      it("views do not leak the other role's secrets", () => {
        for (const d of DIFFS) {
          for (let i = 0; i < 40; i++) {
            const s = p.generate(`leak-${i}`, d);
            for (const role of ["A", "B"] as Role[]) {
              const json = JSON.stringify(role === "A" ? p.viewA(s) : p.viewB(s));
              for (const secret of opts.forbiddenIn!(s, role)) {
                expect(json.includes(secret), `${p.id} ${role} leaks ${secret}`).toBe(false);
              }
            }
          }
        }
      });
    }
  });
}
