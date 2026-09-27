/**
 * Shared JSON envelope helpers for API routes. Every route returns either
 * { ok: true, data } or { ok: false, reason } so clients can branch uniformly.
 */
import { NextResponse } from "next/server";

/**
 * Best-effort client IP for rate-limit scoping: the first entry of
 * `x-forwarded-for`, then `x-real-ip`, falling back to "anon". Not trusted for
 * auth — only to give per-caller throttle buckets instead of one global bucket.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "anon";
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(reason: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, reason }, { status });
}

/** 503 used when a route needs the DB but DATABASE_URL is unset. */
export function dbDisabled(): NextResponse {
  return fail("db_disabled", 503);
}

export function unauthorized(): NextResponse {
  return fail("unauthorized", 401);
}

export function rateLimited(): NextResponse {
  return fail("rate_limited", 429);
}

export function badRequest(): NextResponse {
  return fail("bad_request", 400);
}
