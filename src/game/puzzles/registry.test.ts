import { describe, expect, it } from "vitest";
import { PUZZLES } from "./index";

describe("puzzle registry", () => {
  it("registers exactly 12 puzzles", () => {
    expect(Object.keys(PUZZLES)).toHaveLength(12);
  });

  it("gives every puzzle a unique display name", () => {
    const names = Object.values(PUZZLES).map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
