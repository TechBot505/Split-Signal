/**
 * In-process PGlite test database. Spins up a real Postgres engine (WASM) in
 * memory, applies the drizzle migrations, and hands back a drizzle handle that is
 * type-compatible with the production one — so route handlers run against real SQL
 * without Docker or a network Postgres.
 */
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export interface TestDb {
  db: Database;
  client: PGlite;
  close: () => Promise<void>;
}

/** Create a fresh, migrated in-memory database for one test file. */
export async function makeTestDb(): Promise<TestDb> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  return { db, client, close: () => client.close() };
}
