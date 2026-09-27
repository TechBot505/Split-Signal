/**
 * Client-safe environment access. Every value is optional: the app must render
 * and play (guest mode) with ZERO env vars set. Only `NEXT_PUBLIC_*` vars are
 * referenced here so this module is safe to import from client components.
 *
 * Server-only checks (DB, REALTIME_SECRET, Clerk secret key) live in
 * `src/lib/server/*` — never import those here.
 */

/** Realtime transport host (Cloudflare Worker). Defaults to the local dev port. */
export const realtimeHost =
  // `||` (not `??`) so an empty value from a hosting dashboard falls back too.
  process.env.NEXT_PUBLIC_REALTIME_HOST || "localhost:8787";

/** Public app origin, used for invite links / QR codes and share cards. */
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

/** Clerk publishable key, if configured. Auth UI renders only when present. */
export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

/**
 * True when Clerk auth can be initialized on the client. We gate on the
 * publishable key existing; the app degrades to guest play when it does not.
 */
export const isAuthEnabledClient = clerkPublishableKey.length > 0;
