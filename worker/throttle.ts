/**
 * Per-connection fixed-window message throttle for the realtime Durable Object.
 * Best-effort and in-memory (keyed by connection id); resetting on hibernation
 * is fine. Blunts accidental floods and simple abuse, not a security boundary.
 */

/** At most RATE_LIMIT messages per RATE_WINDOW_MS window, per connection. */
export const RATE_LIMIT = 30;
export const RATE_WINDOW_MS = 5_000;

interface RateWindow {
  resetAt: number;
  count: number;
  warned: boolean;
}

/** Outcome of recording one message: whether to drop it, and if it's the first drop. */
export interface ThrottleHit {
  limited: boolean;
  /** True only for the first dropped message in a window (send one error). */
  firstDrop: boolean;
}

/** Fixed-window throttle keyed by connection id. */
export class MessageThrottle {
  private windows = new Map<string, RateWindow>();

  /** Record a hit for `id` at `now`; reports whether it must be dropped. */
  hit(id: string, now: number): ThrottleHit {
    const win = this.windows.get(id);
    if (!win || now >= win.resetAt) {
      this.windows.set(id, { resetAt: now + RATE_WINDOW_MS, count: 1, warned: false });
      return { limited: false, firstDrop: false };
    }
    win.count += 1;
    if (win.count <= RATE_LIMIT) return { limited: false, firstDrop: false };
    const firstDrop = !win.warned;
    win.warned = true;
    return { limited: true, firstDrop };
  }

  /** Drop a connection's window (call on close). */
  forget(id: string): void {
    this.windows.delete(id);
  }
}
