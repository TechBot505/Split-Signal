/**
 * drizzle-kit configuration (generate / migrate / studio).
 *
 * drizzle-kit does not reliably auto-load .env.local, so we load it explicitly.
 * process.loadEnvFile exists on Node >= 20.12 (this repo requires >= 20.9, so the
 * optional chaining makes it a safe no-op on older runtimes). It THROWS when the
 * file is missing, hence the try/catch; env already set in the shell still wins.
 */
import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // No .env.local (e.g. CI, or DATABASE_URL provided directly) — fine.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
