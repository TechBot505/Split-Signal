/** Small display formatters shared across the non-room screens. */

import type { Mode } from "@/game/types";

/** Milliseconds → `m:ss` (clamped at zero). Used for "time left" readouts. */
export function formatTimeLeft(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Milliseconds → `HH:MM:SS` (clamped at zero). Used for the daily reset countdown. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
}

/** ms until the next 00:00 UTC boundary from `now`. */
export function msUntilUtcReset(now: number): number {
  const d = new Date(now);
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0);
  return next - now;
}

const MODE_LABELS: Record<Mode, string> = {
  quick: "Quick",
  standard: "Standard",
  hard: "Hard",
  daily: "Daily",
};

/** Human label for a run mode. */
export function modeLabel(mode: Mode): string {
  return MODE_LABELS[mode] ?? mode;
}

/** Format a UTC date key (YYYY-MM-DD) for display, e.g. "Sep 27". */
export function formatDateKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}
