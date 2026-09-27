import { describe, expect, it } from "vitest";
import { scoreRun } from "./score";

describe("scoreRun", () => {
  it("returns points = round(ms score / 100)", () => {
    // 10:54 left (654,000ms) + 1 unused hint (30,000ms) → 6,840 points.
    expect(scoreRun(654_000, 1, 0)).toBe(6_840);
  });

  it("adds 300 points per unused hint and subtracts 200 per strike", () => {
    expect(scoreRun(0, 2, 0)).toBe(600);
    expect(scoreRun(100_000, 0, 1)).toBe(800);
  });

  it("floors at 0 when penalties exceed the ms score", () => {
    expect(scoreRun(0, 0, 3)).toBe(0);
  });
});
