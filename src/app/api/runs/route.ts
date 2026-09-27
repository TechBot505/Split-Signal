/**
 * POST /api/runs — called ONLY by the realtime worker when a run ends.
 *
 * Auth: the `x-realtime-secret` header must equal REALTIME_SECRET (timing-safe
 * compare). Stores the finished run and its seats. Idempotent: the run id is
 * deterministic (engine runIdFor), so a retried POST upserts the same rows.
 * Seats whose token was previously claimed auto-link to their owner at POST time.
 */
import type { NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { runPlayers, runs, userTokens } from "@/lib/db/schema";
import { realtimeSecret } from "@/lib/server/env";
import { badRequest, clientIp, dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/ratelimit";
import { checkSecret } from "@/lib/server/secret";
import { runRecordSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!checkSecret(req.headers.get("x-realtime-secret"), realtimeSecret())) {
    return unauthorized();
  }
  if (!rateLimit(`api:runs:${clientIp(req)}`, 120, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const body = await req.json().catch(() => null);
  const parsed = runRecordSchema.safeParse(body);
  if (!parsed.success) return badRequest();
  const rec = parsed.data;

  await db
    .insert(runs)
    .values({
      id: rec.id,
      code: rec.code,
      mode: rec.mode,
      seed: rec.seed,
      dailyKey: rec.dailyKey ?? null,
      escaped: rec.escaped,
      stagesCleared: rec.stagesCleared,
      total: rec.total,
      timeLeftMs: rec.timeLeftMs,
      strikes: rec.strikes,
      hintsUsed: rec.hintsUsed,
      score: rec.score,
      startedAt: new Date(rec.startedAt),
      endedAt: new Date(rec.endedAt),
    })
    // Idempotent on id: a retried POST refreshes end state but never duplicates.
    .onConflictDoUpdate({
      target: runs.id,
      set: {
        escaped: rec.escaped,
        stagesCleared: rec.stagesCleared,
        timeLeftMs: rec.timeLeftMs,
        strikes: rec.strikes,
        hintsUsed: rec.hintsUsed,
        score: rec.score,
        endedAt: new Date(rec.endedAt),
      },
    });

  // Auto-link: any seat whose token was previously claimed maps straight to its
  // owner, so runs recorded after the first claim need no re-claim.
  const hashes = rec.players.map((p) => p.tokenHash).filter((h) => h.length > 0);
  const owners = new Map<string, string>();
  if (hashes.length > 0) {
    const rows = await db
      .select({ tokenHash: userTokens.tokenHash, userId: userTokens.userId })
      .from(userTokens)
      .where(inArray(userTokens.tokenHash, hashes));
    for (const r of rows) owners.set(r.tokenHash, r.userId);
  }

  for (const p of rec.players) {
    const userId = owners.get(p.tokenHash) ?? null;
    await db
      .insert(runPlayers)
      .values({
        runId: rec.id,
        seat: p.seat,
        userId,
        name: p.name,
        avatar: p.avatar,
        tokenHash: p.tokenHash,
      })
      // Idempotent per seat; a retried POST refreshes display fields but leaves an
      // already-claimed user_id to the claim/link flow (only sets it when linkable).
      .onConflictDoUpdate({
        target: [runPlayers.runId, runPlayers.seat],
        set: { name: p.name, avatar: p.avatar, tokenHash: p.tokenHash },
      });
  }

  return ok({ id: rec.id, players: rec.players.length });
}
