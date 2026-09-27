/**
 * Server-only environment helpers. These read process.env, so they must never be
 * imported into client bundles.
 *
 * The whole app degrades gracefully: with no env vars set, auth and DB are simply
 * "off" and the game runs in guest/local-only mode. Empty strings count as unset
 * (guest play must work with zero env), so every read goes through `|| ""`.
 */

/** Read an env var, treating an empty string as unset. */
function envVar(key: string): string {
  return process.env[key] || "";
}

/** Auth is enabled only when BOTH Clerk keys are present (non-empty). */
export function isAuthEnabled(): boolean {
  return !!envVar("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") && !!envVar("CLERK_SECRET_KEY");
}

/** Cloud persistence is enabled only when a Postgres connection string is present. */
export function isDbEnabled(): boolean {
  return !!envVar("DATABASE_URL");
}

/** Shared secret the realtime worker uses to authenticate POST /api/runs. */
export function realtimeSecret(): string {
  return envVar("REALTIME_SECRET");
}

/** Whether a realtime host is configured (surfaced by /api/health). */
export function isRealtimeConfigured(): boolean {
  return !!envVar("NEXT_PUBLIC_REALTIME_HOST");
}
