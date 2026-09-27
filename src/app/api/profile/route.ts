/**
 * GET/PUT /api/profile — the signed-in user's cloud profile (call-sign + avatar).
 * GET returns null data when no profile row exists yet. PUT upserts it.
 */
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getUserId } from "@/lib/server/auth";
import { badRequest, dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/ratelimit";
import { profileSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:profile:get:${userId}`, 60, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const [row] = await db
    .select({ name: profiles.name, avatar: profiles.avatar, updatedAt: profiles.updatedAt })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return ok({ profile: row ?? null });
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:profile:put:${userId}`, 30, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return badRequest();
  const { name, avatar } = parsed.data;

  await db
    .insert(profiles)
    .values({ userId, name, avatar })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { name, avatar, updatedAt: new Date() },
    });

  return ok({ profile: { name, avatar } });
}
