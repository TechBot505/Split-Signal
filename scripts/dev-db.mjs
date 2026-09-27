// Local Postgres for development/testing — NO DOCKER REQUIRED.
//
// Starts an embedded PGlite database (a full Postgres compiled to WASM) persisted
// to ./.pglite and exposes it over the real Postgres wire protocol on
// 127.0.0.1:5433 (falling back to 54339 if that port is busy). postgres-js +
// drizzle connect to it exactly like they would to Neon.
//
//   npm run db:local      # start it (leave running)
//   npm run db:migrate    # apply the SQL migrations in drizzle/ (separate shell)
//
// Ctrl-C stops the server and flushes PGlite to disk.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const HOST = "127.0.0.1";
const PRIMARY_PORT = 5433;
const FALLBACK_PORT = 54339;
const DATA_DIR = "./.pglite";

/** Start the socket server, retrying on the fallback port if the primary is busy. */
async function startServer(db) {
  for (const port of [PRIMARY_PORT, FALLBACK_PORT]) {
    const server = new PGLiteSocketServer({ db, host: HOST, port, maxConnections: 16 });
    try {
      await server.start();
      return { server, port };
    } catch (err) {
      const busy = err && (err.code === "EADDRINUSE" || /EADDRINUSE/.test(String(err)));
      if (busy && port === PRIMARY_PORT) {
        console.warn(`Port ${PRIMARY_PORT} is busy — falling back to ${FALLBACK_PORT}.`);
        await server.stop().catch(() => {});
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not bind either the primary or fallback port.");
}

async function main() {
  const db = await PGlite.create({ dataDir: DATA_DIR });
  const { server, port } = await startServer(db);
  const url = `postgres://postgres:postgres@${HOST}:${port}/postgres`;

  console.log("");
  console.log("  Local Postgres (PGlite) is running — no Docker needed.");
  console.log(`  data dir: ${DATA_DIR}`);
  console.log("");
  console.log(`  DATABASE_URL=${url}`);
  console.log("");
  console.log("  Next: apply the schema in another shell with");
  console.log(`    DATABASE_URL="${url}" npm run db:migrate`);
  console.log("");

  const shutdown = async () => {
    console.log("\nStopping local Postgres…");
    await server.stop().catch(() => {});
    await db.close().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("dev-db failed to start:", err);
  process.exit(1);
});
