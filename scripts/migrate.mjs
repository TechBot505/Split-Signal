// Apply the generated SQL migrations in drizzle/ to the database at DATABASE_URL.
//
// This is the recommended way to set up the schema for BOTH the local PGlite dev
// database (npm run db:local) and production Neon — drizzle-kit push does not
// reliably drive the PGlite socket bridge, and this migrator is deterministic and
// idempotent (it records applied migrations in a __drizzle_migrations table, so
// re-running only applies what is new).
//
//   DATABASE_URL="postgres://…" npm run db:migrate
//
// It uses drizzle-orm's postgres-js migrator, reading drizzle/*.sql in the order
// recorded in drizzle/meta/_journal.json.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Start the local DB (npm run db:local) or set your Neon URL.");
    process.exit(1);
  }

  // max: 1 + prepare: false mirror the app's runtime client and are required for
  // pgbouncer/Neon pooled URLs (and harmless against the local PGlite bridge).
  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    const db = drizzle(sql);
    console.log("Applying migrations from ./drizzle …");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
