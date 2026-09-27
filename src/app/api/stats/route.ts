/**
 * GET /api/stats — aggregate lifetime stats for the signed-in user, computed from
 * the runs whose seats they own (run_players.user_id → runs). Everything is derived
 * in TS from the per-run columns, so no extra view is needed.
 *
 * Fields: runs, escapes, escapeRate (0–100), bestDailyScore, avgTimeLeftMs (over
 * escapes), fastestEscapeMs (shortest escape duration, null if none).
 */
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { runPlayers, runs } from "@/lib/db/schema";
import { getUserId } from "@/lib/server/auth";
import { dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:stats:${userId}`, 60, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const mySeats = await db
    .select({ runId: runPlayers.runId })
    .from(runPlayers)
    .where(eq(runPlayers.userId, userId));

  const runIds = [...new Set(mySeats.map((s) => s.runId))];
  if (runIds.length === 0) {
    return ok({
      stats: {
        runs: 0,
        escapes: 0,
        escapeRate: 0,
        bestDailyScore: 0,
        avgTimeLeftMs: 0,
        fastestEscapeMs: null,
      },
    });
  }

  const rows = await db
    .select({
      dailyKey: runs.dailyKey,
      escaped: runs.escaped,
      timeLeftMs: runs.timeLeftMs,
      score: runs.score,
      startedAt: runs.startedAt,
      endedAt: runs.endedAt,
    })
    .from(runs)
    .where(inArray(runs.id, runIds));

  const total = rows.length;
  const escaped = rows.filter((r) => r.escaped);
  const escapes = escaped.length;
  const bestDailyScore = rows
    .filter((r) => r.dailyKey !== null && r.escaped)
    .reduce((max, r) => Math.max(max, r.score), 0);
  const avgTimeLeftMs =
    escapes > 0 ? Math.round(escaped.reduce((sum, r) => sum + r.timeLeftMs, 0) / escapes) : 0;
  const durations = escaped.map((r) => r.endedAt.getTime() - r.startedAt.getTime());
  const fastestEscapeMs = durations.length > 0 ? Math.min(...durations) : null;

  return ok({
    stats: {
      runs: total,
      escapes,
      escapeRate: total > 0 ? Math.round((escapes / total) * 100) : 0,
      bestDailyScore,
      avgTimeLeftMs,
      fastestEscapeMs,
    },
  });
}
