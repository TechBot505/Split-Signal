/**
 * Tiny in-memory fixed-window rate limiter. Best-effort only: state lives in a
 * single process, so it does NOT coordinate across serverless instances. It exists
 * to blunt accidental floods and simple abuse, not as a security boundary.
 */

interface Window {
  /** epoch ms when the current window ends. */
  resetAt: number;
  count: number;
}

const buckets = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** epoch ms when the window resets. */
  resetAt: number;
}

/**
 * Record a hit for `key`. Allows up to `limit` hits per `windowMs`.
 * `now` is injectable for deterministic tests.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    const win: Window = { resetAt: now + windowMs, count: 1 };
    buckets.set(key, win);
    return { ok: true, remaining: limit - 1, resetAt: win.resetAt };
  }
  existing.count += 1;
  const ok = existing.count <= limit;
  return { ok, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

/** Test/maintenance helper: drop all recorded windows. */
export function resetRateLimits(): void {
  buckets.clear();
}
