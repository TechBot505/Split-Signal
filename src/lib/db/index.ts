/**
 * Lazy Postgres/Drizzle client. Returns null when DATABASE_URL is unset (or empty)
 * so callers can respond with 503 { reason: 'db_disabled' } instead of crashing.
 *
 * The client is created once and cached. We use postgres-js with `prepare: false`
 * (required for pgbouncer/Neon pooled connections) and `max: 1` so a serverless
 * function instance holds at most one connection.
 *
 * Tests inject an in-process PGlite-backed drizzle handle via `setDbForTests()`,
 * exercising the real SQL engine without a network Postgres. The injected handle
 * short-circuits `getDb()` regardless of DATABASE_URL.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Shared handle type. Both the postgres-js and PGlite drivers extend the same
 * `PgDatabase` base, so this alias accepts either — the production driver and the
 * in-process test driver are interchangeable at the call sites (select/insert/…).
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

let cached: Database | null | undefined;
let injected: Database | null | undefined;

/** Get the shared DB handle, or null when persistence is disabled. */
export function getDb(): Database | null {
  if (injected !== undefined) return injected;
  if (cached !== undefined) return cached;
  // Treat empty strings as unset — guest play must work with zero env.
  const url = process.env.DATABASE_URL || "";
  if (!url) {
    cached = null;
    return cached;
  }
  // max: 1 keeps a single connection per serverless instance; prepare: false is
  // required for transaction-pooled connections (pgbouncer / Neon pooled URL).
  const client = postgres(url, { prepare: false, max: 1 });
  cached = drizzle(client, { schema });
  return cached;
}

/**
 * Test seam: force `getDb()` to return `db` (or null). Pass `undefined` to clear
 * the override and fall back to the DATABASE_URL-driven client. Never used in
 * production code paths.
 */
export function setDbForTests(db: Database | null | undefined): void {
  injected = db;
}

export { schema };
