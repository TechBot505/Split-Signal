/**
 * Server-side identity helper.
 *
 * getUserId() returns the current Clerk user id, or null when auth is disabled or
 * the caller is signed out. Clerk is imported dynamically so the package is never
 * pulled into a request path when auth is off (zero-env guest mode).
 *
 * When both auth AND the DB are enabled, we lazily upsert the users row so that
 * foreign keys (profiles.user_id, run_players.user_id) always resolve.
 */
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isAuthEnabled, isDbEnabled } from "./env";

/** Resolve the signed-in Clerk user id, or null. Never throws. */
export async function getUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;
  try {
    // Dynamic import keeps @clerk/nextjs out of the bundle when auth is disabled.
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return null;
    await ensureUserRow(userId);
    return userId;
  } catch {
    return null;
  }
}

/** Insert the users row if missing (no-op when DB is disabled). */
async function ensureUserRow(userId: string): Promise<void> {
  if (!isDbEnabled()) return;
  const db = getDb();
  if (!db) return;
  await db.insert(users).values({ id: userId }).onConflictDoNothing();
}
