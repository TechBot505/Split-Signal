/**
 * GET /api/daily?date=YYYY-MM-DD — the Daily Bunker leaderboard.
 *
 * Returns the top 50 ESCAPED runs for that daily_key, ranked by score desc then
 * remaining time desc (SPEC.md "Daily Bunker"), each with both players' call-signs
 * and avatars, plus the total number of attempts (escaped or not) that day.
 * `date` defaults to the current UTC day when omitted.
 */
import type { NextRequest } from "next/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { dateKeyUTC } from "@/game/daily";
import { getDb } from "@/lib/db";
import { runPlayers, runs } from "@/lib/db/schema";
import { badRequest, clientIp, dbDisabled, ok, rateLimited } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/ratelimit";
import { dailyDateSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOP_N = 50;

export async function GET(req: NextRequest) {
  if (!rateLimit(`api:daily:${clientIp(req)}`, 120, 60_000).ok) return rateLimited();

  const raw = req.nextUrl.searchParams.get("date");
  const date = raw ?? dateKeyUTC(Date.now());
  if (!dailyDateSchema.safeParse(date).success) return badRequest();

  const db = getDb();
  if (!db) return dbDisabled();

  const top = await db
    .select()
    .from(runs)
    .where(and(eq(runs.dailyKey, date), eq(runs.escaped, true)))
    .orderBy(desc(runs.score), desc(runs.timeLeftMs))
    .limit(TOP_N);

  const [{ attempts }] = await db
    .select({ attempts: count() })
    .from(runs)
    .where(eq(runs.dailyKey, date));

  const runIds = top.map((r) => r.id);
  const seats =
    runIds.length > 0
      ? await db
          .select({
            runId: runPlayers.runId,
            seat: runPlayers.seat,
            name: runPlayers.name,
            avatar: runPlayers.avatar,
          })
          .from(runPlayers)
          .where(inArray(runPlayers.runId, runIds))
      : [];

  const byRun = new Map<string, { name: string; avatar: unknown }[]>();
  for (const s of seats.sort((a, b) => a.seat - b.seat)) {
    const list = byRun.get(s.runId) ?? [];
    list.push({ name: s.name, avatar: s.avatar });
    byRun.set(s.runId, list);
  }

  const entries = top.map((r, i) => {
    const players = byRun.get(r.id) ?? [];
    return {
      rank: i + 1,
      names: players.map((p) => p.name),
      avatars: players.map((p) => p.avatar),
      timeLeftMs: r.timeLeftMs,
      strikes: r.strikes,
      hintsUsed: r.hintsUsed,
      score: r.score,
    };
  });

  return ok({ date, attempts, entries });
}
