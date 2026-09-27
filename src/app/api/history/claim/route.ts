/**
 * POST /api/history/claim — a signed-in user claims the seats they played as a guest.
 *
 * Body: { tokens: string[] } (the client's secret seat tokens). We sha256 each and
 * set user_id on any run_players row whose token_hash matches AND is still
 * unclaimed (user_id IS NULL). Returns how many seats were claimed.
 */
import type { NextRequest } from "next/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { runPlayers, userTokens } from "@/lib/db/schema";
import { getUserId } from "@/lib/server/auth";
import { badRequest, dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { hashTokens } from "@/lib/server/hash";
import { rateLimit } from "@/lib/server/ratelimit";
import { claimSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:claim:${userId}`, 30, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const body = await req.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) return badRequest();

  const hashes = hashTokens(parsed.data.tokens);

  // Remember these tokens so future runs (POST /api/runs) auto-link without a
  // re-claim. token_hash is unique, so a token already owned by someone stays put.
  await db
    .insert(userTokens)
    .values(hashes.map((tokenHash) => ({ userId, tokenHash })))
    .onConflictDoNothing({ target: userTokens.tokenHash });

  // Only act on hashes whose user_tokens row actually belongs to this user. The
  // insert above is a no-op for a hash already owned by someone else, so this
  // stops a caller claiming seats for tokens they don't own.
  const owned = await db
    .select({ tokenHash: userTokens.tokenHash })
    .from(userTokens)
    .where(and(inArray(userTokens.tokenHash, hashes), eq(userTokens.userId, userId)));
  const ownedHashes = owned.map((r) => r.tokenHash);
  if (ownedHashes.length === 0) return ok({ claimed: 0 });

  const updated = await db
    .update(runPlayers)
    .set({ userId })
    .where(and(inArray(runPlayers.tokenHash, ownedHashes), isNull(runPlayers.userId)))
    .returning({ id: runPlayers.id });

  return ok({ claimed: updated.length });
}
