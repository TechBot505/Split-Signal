/**
 * Estimates the client→server clock offset so countdowns render against the
 * server's absolute `deadline`. Each `pong` carries the server `now`; we keep
 * the median of recent (serverNow − clientNow) samples to shrug off jitter.
 *
 *   serverTimeNow ≈ Date.now() + offset
 *   remainingMs   = deadline − (Date.now() + offset)
 *
 * NOTE: Split Signal's `state` frame (RoomView) does NOT carry a server clock,
 * so offset samples come from `pong` only — we ping on open and every 15s.
 */
export class ClockOffset {
  private samples: number[] = [];
  private readonly max: number;

  constructor(max = 9) {
    this.max = max;
  }

  /** Record a sample from a server `now` timestamp received just now. */
  add(serverNow: number): void {
    this.samples.push(serverNow - Date.now());
    if (this.samples.length > this.max) this.samples.shift();
  }

  /** Median offset in ms (0 until the first sample arrives). */
  get value(): number {
    if (this.samples.length === 0) return 0;
    const sorted = [...this.samples].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }
}
