/**
 * GET /api/health — cheap capability probe. Reports which optional integrations are
 * configured. Never touches the DB (just checks env), so it is safe to hit freely.
 */
import { isAuthEnabled, isDbEnabled, isRealtimeConfigured } from "@/lib/server/env";
import { ok } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    ok: true,
    db: isDbEnabled(),
    auth: isAuthEnabled(),
    realtime: isRealtimeConfigured(),
  });
}
