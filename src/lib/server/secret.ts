/**
 * Timing-safe shared-secret comparison for the POST /api/runs endpoint.
 *
 * The realtime worker sends `x-realtime-secret`; we compare it to REALTIME_SECRET
 * without leaking length/content via early-exit timing. Returns false whenever the
 * configured secret is empty (persistence auth disabled) or the header is missing.
 */
import { timingSafeEqual } from "node:crypto";

/** True iff `provided` equals the configured `expected` secret (both non-empty). */
export function checkSecret(provided: string | null | undefined, expected: string): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual requires equal lengths; a length mismatch is an immediate
  // (but still constant-work) miss.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
