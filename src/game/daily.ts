/**
 * Daily Bunker date keys. The daily seed is `daily:<UTC date>` so every duo
 * worldwide plays the same bunker on a given UTC day. `now` is injected epoch
 * milliseconds — never Date.now() — so the key is deterministic and testable.
 */

/** UTC calendar day for `now` (epoch ms) as `YYYY-MM-DD`. */
export function dateKeyUTC(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** The full daily seed for a given moment, e.g. `daily:2026-09-27`. */
export function dailySeed(now: number): string {
  return `daily:${dateKeyUTC(now)}`;
}
