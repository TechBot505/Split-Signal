/**
 * Zod schemas for API request bodies. Kept separate so routes stay small and the
 * shapes can be reused/tested.
 *
 * The incoming run record mirrors RunRecord in src/game/types.ts. Avatars are
 * opaque blobs stored as jsonb, so they are validated permissively here (an object
 * of unknown values) rather than pinned to a rigid shape — the profile endpoint,
 * which the client owns, validates the strict avatar schema instead.
 */
import { z } from "zod";
import { avatarSchema } from "@/lib/avatar";

/**
 * Bounded avatar blob stored as jsonb: at most 24 keys, each value a string
 * (≤64 chars), number, or boolean. Kept permissive in shape (the client owns the
 * strict avatarSchema) but bounded in size so a hostile worker POST can't bloat it.
 */
const boundedAvatar = z
  .record(z.string().max(64), z.union([z.string().max(64), z.number(), z.boolean()]))
  .refine((o) => Object.keys(o).length <= 24, { message: "too_many_avatar_keys" });

/** Run modes accepted by POST /api/runs (mirrors Mode in src/game/types.ts). */
export const modeSchema = z.enum(["quick", "standard", "hard", "daily"]);

export const runPlayerRecordSchema = z.object({
  seat: z.number().int().min(0),
  name: z.string().min(1).max(16),
  avatar: boundedAvatar,
  tokenHash: z.string().min(1),
});

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/** Full finished-run payload POSTed by the realtime worker. */
export const runRecordSchema = z
  .object({
    id: z.string().min(1).max(128),
    code: z.string().min(1).max(16),
    mode: modeSchema,
    seed: z.string().min(1).max(128),
    dailyKey: z.string().min(1).max(32).optional(),
    escaped: z.boolean(),
    stagesCleared: z.number().int().min(0),
    total: z.number().int().min(0),
    timeLeftMs: z.number().int().min(0),
    strikes: z.number().int().min(0),
    hintsUsed: z.number().int().min(0),
    score: z.number().int().min(0),
    startedAt: z.number().int().positive(),
    endedAt: z.number().int().positive(),
    players: z.array(runPlayerRecordSchema).min(1).max(2),
  })
  .refine((r) => r.endedAt >= r.startedAt && r.endedAt - r.startedAt <= TWO_HOURS_MS, {
    message: "bad_run_duration",
  });

export type RunRecordInput = z.infer<typeof runRecordSchema>;

export const claimSchema = z.object({
  tokens: z.array(z.string().min(1).max(64)).min(1).max(200),
});

/** Profile body. `avatar` uses the shared strict avatarSchema from src/lib/avatar. */
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(16),
  avatar: avatarSchema,
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** YYYY-MM-DD date query for the daily leaderboard. */
export const dailyDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
