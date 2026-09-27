/**
 * Integration tests for the persistence API routes. They run the real route
 * handlers against an in-process PGlite Postgres (via the setDbForTests seam) and
 * mock getUserId (the auth seam) to simulate signed-in / signed-out callers.
 *
 * Coverage: POST /api/runs (secret auth, idempotency, auto-link via user_tokens),
 * GET /api/daily (escaped-only, ranking, attempts), POST /api/history/claim,
 * GET /api/history, GET/PUT /api/profile, GET /api/stats.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { sql } from "drizzle-orm";

// Mock the auth seam BEFORE importing the routes that consume it.
vi.mock("@/lib/server/auth", () => ({ getUserId: vi.fn() }));

import { getUserId } from "@/lib/server/auth";
import { setDbForTests, type Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sha256Hex } from "@/lib/server/hash";
import { resetRateLimits } from "@/lib/server/ratelimit";
import { makeTestDb, type TestDb } from "@/lib/db/__tests__/testDb";

import { POST as runsPOST } from "@/app/api/runs/route";
import { GET as dailyGET } from "@/app/api/daily/route";
import { POST as claimPOST } from "@/app/api/history/claim/route";
import { GET as historyGET } from "@/app/api/history/route";
import { GET as profileGET, PUT as profilePUT } from "@/app/api/profile/route";
import { GET as statsGET } from "@/app/api/stats/route";

const SECRET = "test-realtime-secret";
const USER = "user_test_1";
const getUserIdMock = vi.mocked(getUserId);

let tdb: TestDb;

function jsonReq(url: string, body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function putReq(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const AVATAR = { shape: "dome", tone: "steel", visor: "teal", antenna: "single", badge: "none" };

function runRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "run_alpha",
    code: "WXYZ",
    mode: "standard",
    seed: "seed-1",
    escaped: true,
    stagesCleared: 6,
    total: 6,
    timeLeftMs: 120_000,
    strikes: 1,
    hintsUsed: 1,
    score: 150_000,
    startedAt: 1_700_000_000_000,
    endedAt: 1_700_000_100_000,
    players: [
      { seat: 0, name: "Ada", avatar: AVATAR, tokenHash: sha256Hex("token-a") },
      { seat: 1, name: "Boi", avatar: AVATAR, tokenHash: sha256Hex("token-b") },
    ],
    ...overrides,
  };
}

/** A daily run helper for leaderboard ordering tests. */
function dailyRun(id: string, score: number, timeLeftMs: number, escaped = true) {
  return runRecord({ id, mode: "daily", dailyKey: "2026-09-27", score, timeLeftMs, escaped });
}

beforeAll(async () => {
  process.env.REALTIME_SECRET = SECRET;
  tdb = await makeTestDb();
  setDbForTests(tdb.db);
});

afterAll(async () => {
  setDbForTests(undefined);
  await tdb.close();
});

beforeEach(async () => {
  resetRateLimits();
  getUserIdMock.mockReset();
  const db: Database = tdb.db;
  await db.execute(
    sql.raw("TRUNCATE run_players, runs, user_tokens, profiles, users RESTART IDENTITY CASCADE"),
  );
  await db.insert(users).values({ id: USER }).onConflictDoNothing();
});

describe("POST /api/runs", () => {
  it("rejects without the realtime secret", async () => {
    const res = await runsPOST(jsonReq("http://localhost/api/runs", runRecord()));
    expect(res.status).toBe(401);
  });

  it("stores a run + seats with the secret, and is idempotent", async () => {
    const first = await runsPOST(
      jsonReq("http://localhost/api/runs", runRecord(), { "x-realtime-secret": SECRET }),
    );
    expect(first.status).toBe(200);
    const body = (await first.json()) as { data: { id: string; players: number } };
    expect(body.data.players).toBe(2);

    const second = await runsPOST(
      jsonReq("http://localhost/api/runs", runRecord(), { "x-realtime-secret": SECRET }),
    );
    expect(second.status).toBe(200);

    getUserIdMock.mockResolvedValue(USER);
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-a"] }));
    const hist = await historyGET();
    const histBody = (await hist.json()) as { data: { runs: unknown[] } };
    expect(histBody.data.runs).toHaveLength(1);
  });

  it("auto-links a seat to a user who already claimed that token", async () => {
    getUserIdMock.mockResolvedValue(USER);
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-a"] }));

    const rec = runRecord({ id: "run_beta", code: "MNOP" });
    await runsPOST(jsonReq("http://localhost/api/runs", rec, { "x-realtime-secret": SECRET }));

    const hist = await historyGET();
    const body = (await hist.json()) as { data: { runs: { id: string }[] } };
    expect(body.data.runs.map((r) => r.id)).toEqual(["run_beta"]);
  });

  it("rejects a malformed body with 400", async () => {
    const res = await runsPOST(
      jsonReq("http://localhost/api/runs", { id: "" }, { "x-realtime-secret": SECRET }),
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/daily", () => {
  it("ranks escaped runs by score then time left, and counts attempts", async () => {
    await runsPOST(jsonReq("http://localhost/api/runs", dailyRun("d1", 100_000, 50_000), { "x-realtime-secret": SECRET }));
    await runsPOST(jsonReq("http://localhost/api/runs", dailyRun("d2", 200_000, 10_000), { "x-realtime-secret": SECRET }));
    await runsPOST(jsonReq("http://localhost/api/runs", dailyRun("d3", 200_000, 90_000), { "x-realtime-secret": SECRET }));
    // A failed attempt: counts toward attempts but not the board.
    await runsPOST(jsonReq("http://localhost/api/runs", dailyRun("d4", 0, 0, false), { "x-realtime-secret": SECRET }));

    const res = await dailyGET(new NextRequest("http://localhost/api/daily?date=2026-09-27"));
    const body = (await res.json()) as {
      data: { attempts: number; entries: { rank: number; score: number; timeLeftMs: number; names: string[] }[] };
    };
    expect(body.data.attempts).toBe(4);
    // d3 (200k score, 90k left) > d2 (200k, 10k) > d1 (100k)
    expect(body.data.entries.map((e) => e.score)).toEqual([200_000, 200_000, 100_000]);
    expect(body.data.entries[0].timeLeftMs).toBe(90_000);
    expect(body.data.entries[0].rank).toBe(1);
    expect(body.data.entries[0].names).toEqual(["Ada", "Boi"]);
  });

  it("400s on a malformed date", async () => {
    const res = await dailyGET(new NextRequest("http://localhost/api/daily?date=nope"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/history/claim", () => {
  it("401s when signed out", async () => {
    getUserIdMock.mockResolvedValue(null);
    const res = await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["x"] }));
    expect(res.status).toBe(401);
  });

  it("links seats matching the claimed tokens", async () => {
    await runsPOST(jsonReq("http://localhost/api/runs", runRecord(), { "x-realtime-secret": SECRET }));
    getUserIdMock.mockResolvedValue(USER);
    const res = await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-a"] }));
    const body = (await res.json()) as { data: { claimed: number } };
    expect(body.data.claimed).toBe(1);
  });
});

describe("GET /api/history", () => {
  it("returns only the signed-in user's runs, newest first", async () => {
    await runsPOST(jsonReq("http://localhost/api/runs", runRecord(), { "x-realtime-secret": SECRET }));
    await runsPOST(
      jsonReq(
        "http://localhost/api/runs",
        runRecord({ id: "run_late", code: "EFGH", endedAt: 1_700_000_400_000 }),
        { "x-realtime-secret": SECRET },
      ),
    );
    getUserIdMock.mockResolvedValue(USER);
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-a"] }));

    const res = await historyGET();
    const body = (await res.json()) as { data: { runs: { id: string; players: unknown[] }[] } };
    expect(body.data.runs).toHaveLength(2);
    expect(body.data.runs[0].id).toBe("run_late");
    expect(body.data.runs[0].players.length).toBe(2);
  });

  it("401s when signed out", async () => {
    getUserIdMock.mockResolvedValue(null);
    const res = await historyGET();
    expect(res.status).toBe(401);
  });
});

describe("GET/PUT /api/profile", () => {
  it("returns null before a profile exists, then upserts and reads back", async () => {
    getUserIdMock.mockResolvedValue(USER);

    const empty = await profileGET();
    const emptyBody = (await empty.json()) as { data: { profile: unknown } };
    expect(emptyBody.data.profile).toBeNull();

    const put = await profilePUT(putReq("http://localhost/api/profile", { name: "Ada", avatar: AVATAR }));
    expect(put.status).toBe(200);

    const got = await profileGET();
    const gotBody = (await got.json()) as { data: { profile: { name: string } } };
    expect(gotBody.data.profile.name).toBe("Ada");
  });

  it("rejects an invalid profile (empty name) with 400", async () => {
    getUserIdMock.mockResolvedValue(USER);
    const res = await profilePUT(putReq("http://localhost/api/profile", { name: "", avatar: AVATAR }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/stats", () => {
  it("aggregates the user's owned runs", async () => {
    await runsPOST(jsonReq("http://localhost/api/runs", runRecord(), { "x-realtime-secret": SECRET }));
    await runsPOST(
      jsonReq("http://localhost/api/runs", dailyRun("d_win", 300_000, 200_000), { "x-realtime-secret": SECRET }),
    );
    getUserIdMock.mockResolvedValue(USER);
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-a"] }));

    const res = await statsGET();
    const body = (await res.json()) as {
      data: { stats: { runs: number; escapes: number; escapeRate: number; bestDailyScore: number; avgTimeLeftMs: number; fastestEscapeMs: number | null } };
    };
    expect(body.data.stats.runs).toBe(2);
    expect(body.data.stats.escapes).toBe(2);
    expect(body.data.stats.escapeRate).toBe(100);
    expect(body.data.stats.bestDailyScore).toBe(300_000);
    expect(body.data.stats.avgTimeLeftMs).toBe(160_000);
    expect(body.data.stats.fastestEscapeMs).toBe(100_000);
  });
});
