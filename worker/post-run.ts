/**
 * Persist a finished run by POSTing it to the Next.js app. Token hashes are
 * computed here (crypto.subtle) from each seat's secret token; the engine only
 * ever emits empty hashes. The POST is best-effort: 8s timeout, one retry, and
 * it never throws — a persistence failure must not crash the Durable Object.
 * See SPEC.md "Persistence".
 */
import type { RoomState, RunRecord } from "../src/game/types";

const POST_TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS = 2;

/** Lowercase hex SHA-256 of `text` using the Workers WebCrypto API. */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Fill each record player's tokenHash from the matching seat's token. Record
 * players are ordered by seat (see engine buildRecord), so seat === index.
 */
async function withTokenHashes(state: RoomState, record: RunRecord): Promise<RunRecord> {
  const players = await Promise.all(
    record.players.map(async (p) => {
      const token = state.players[p.seat]?.token;
      return token ? { ...p, tokenHash: await sha256Hex(token) } : p;
    }),
  );
  return { ...record, players };
}

/**
 * POST the finished run to `${appUrl}/api/runs` with the shared secret header.
 * No-op unless both `appUrl` and `secret` are non-empty. Never throws.
 */
export async function postRunRecord(
  appUrl: string | undefined,
  secret: string | undefined,
  state: RoomState,
  record: RunRecord,
): Promise<void> {
  if (!appUrl || !secret) return;
  let body: string;
  try {
    body = JSON.stringify(await withTokenHashes(state, record));
  } catch (err) {
    console.error("postRunRecord: failed to build payload", err);
    return;
  }
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), POST_TIMEOUT_MS);
    try {
      const res = await fetch(`${appUrl}/api/runs`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-realtime-secret": secret },
        body,
        signal: controller.signal,
      });
      if (res.ok) return;
      console.error(`postRunRecord: HTTP ${res.status} on attempt ${attempt}`);
    } catch (err) {
      console.error(`postRunRecord: attempt ${attempt} failed`, err);
    } finally {
      clearTimeout(timer);
    }
  }
}
