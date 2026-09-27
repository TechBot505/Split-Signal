/** Per-mode run configuration: stage count, shared countdown budget and seed. */
import { dailySeed } from "../daily";
import type { Mode } from "../types";

export interface ModeConfig {
  stages: number;
  /** Shared countdown in milliseconds. */
  budgetMs: number;
}

export const MODE_CONFIG: Record<Mode, ModeConfig> = {
  quick: { stages: 4, budgetMs: 6 * 60_000 },
  standard: { stages: 6, budgetMs: 10 * 60_000 },
  hard: { stages: 8, budgetMs: 12 * 60_000 },
  daily: { stages: 6, budgetMs: 10 * 60_000 },
};

/** Time penalties and pacing, all in milliseconds. */
export const STRIKE_PENALTY_MS = 15_000;
export const HINT_PENALTY_MS = 30_000;
export const STAGE_CLEAR_MS = 2_500;
export const MAX_STRIKES = 3;
export const HINTS_PER_RUN = 2;

/** The seed driving generation for a room's current game. */
export function seedFor(mode: Mode, code: string, gameNumber: number, now: number): string {
  return mode === "daily" ? dailySeed(now) : `${code}:${gameNumber}`;
}
