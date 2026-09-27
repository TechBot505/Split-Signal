/**
 * Drizzle (Postgres) schema for Split Signal cloud persistence.
 *
 * All cloud storage is OPTIONAL — the app runs fully without a database (guest
 * play, local-only history). When DATABASE_URL is set these tables back cloud
 * profiles, run history, and the Daily Bunker leaderboard.
 *
 * Avatar blobs are stored as jsonb (opaque AvatarConfig owned by the client).
 * `token_hash` is the sha256 of a player's secret seat token, letting a signed-in
 * user later claim the seats they played (see POST /api/history/claim).
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/** One row per Clerk user. `id` IS the Clerk user id. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Cloud copy of a user's display profile (call-sign + avatar). */
export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatar: jsonb("avatar").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * One finished run (a bunker attempt). `id` is the deterministic run id assigned
 * by the engine (see runIdFor). `daily_key` is the UTC date (YYYY-MM-DD) for
 * daily bunkers, null otherwise; the composite index powers the leaderboard query.
 */
export const runs = pgTable(
  "runs",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    mode: text("mode").notNull(),
    seed: text("seed").notNull(),
    dailyKey: text("daily_key"),
    escaped: boolean("escaped").notNull(),
    stagesCleared: integer("stages_cleared").notNull(),
    total: integer("total").notNull(),
    timeLeftMs: integer("time_left_ms").notNull(),
    strikes: integer("strikes").notNull(),
    hintsUsed: integer("hints_used").notNull(),
    score: integer("score").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("runs_daily_score_idx").on(t.dailyKey, t.score.desc())],
);

/** One seat within a finished run. `user_id` is filled once a user claims it. */
export const runPlayers = pgTable(
  "run_players",
  {
    id: serial("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    seat: integer("seat").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    avatar: jsonb("avatar").notNull(),
    tokenHash: text("token_hash").notNull(),
  },
  (t) => [
    unique("run_players_run_seat_uq").on(t.runId, t.seat),
    index("run_players_token_hash_idx").on(t.tokenHash),
    index("run_players_user_id_idx").on(t.userId),
  ],
);

/**
 * Seat tokens a user has claimed. Lets a finished run auto-link a seat to its
 * owner at POST time (when its token_hash is already known) instead of requiring
 * a later /api/history/claim. The claim endpoint also populates this table.
 */
export const userTokens = pgTable(
  "user_tokens",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique("user_tokens_token_hash_uq").on(t.tokenHash),
    index("user_tokens_user_id_idx").on(t.userId),
  ],
);
