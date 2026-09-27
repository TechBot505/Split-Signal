"use client";

import { prefsSnapshot } from "@/lib/prefs";

/**
 * Thin wrapper over the Vibration API. No-ops when haptics are disabled, on
 * platforms without `navigator.vibrate` (iOS Safari), or during SSR.
 */
export type HapticPattern = "light" | "medium" | "success" | "error" | "signal";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  success: [12, 40, 12],
  error: [40, 30, 40],
  signal: [8, 24, 8],
};

/** Trigger a named haptic pattern when supported and enabled. */
export function haptic(pattern: HapticPattern = "light"): void {
  if (!prefsSnapshot().haptics) return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Vibration can throw if called outside a user gesture; ignore.
  }
}
