/**
 * GET /api/history — the signed-in user's played runs, newest first, each with the
 * full seat list so the client can render a scoreboard without a second request.
 */
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { runPlayers, runs } from "@/lib/db/schema";
import { getUserId } from "@/lib/server/auth";
import { dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RUNS = 50;

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:history:${userId}`, 60, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  // Seats claimed by this user, then the distinct runs behind them, newest first.
  const mySeats = await db
    .select({ runId: runPlayers.runId })
    .from(runPlayers)
    .where(eq(runPlayers.userId, userId));

  const runIds = [...new Set(mySeats.map((s) => s.runId))];
  if (runIds.length === 0) return ok({ runs: [] });

  const rows = await db
    .select()
    .from(runs)
    .where(inArray(runs.id, runIds))
    .orderBy(desc(runs.endedAt))
    .limit(MAX_RUNS);

  const allPlayers = await db
    .select({
      id: runPlayers.id,
      runId: runPlayers.runId,
      seat: runPlayers.seat,
      userId: runPlayers.userId,
      name: runPlayers.name,
      avatar: runPlayers.avatar,
    })
    .from(runPlayers)
    .where(inArray(runPlayers.runId, runIds));

  const byRun = new Map<string, typeof allPlayers>();
  for (const p of allPlayers) {
    const list = byRun.get(p.runId) ?? [];
    list.push(p);
    byRun.set(p.runId, list);
  }

  const result = rows.map((r) => ({
    ...r,
    players: (byRun.get(r.id) ?? []).sort((a, b) => a.seat - b.seat),
  }));

  return ok({ runs: result });
}
