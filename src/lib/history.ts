/**
 * Normalization + merge helpers for run history. Local runs (zustand persist) and
 * cloud runs (GET /api/history, only when signed in) are folded into one shape so
 * screens render a single list. Local wins on id collisions (it knows which seat
 * is "you"). Also derives the lifetime stats strip and the daily-escape streak.
 */
import { dateKeyUTC } from "@/game/daily";
import type { Mode } from "@/game/types";
import type { RunSummary } from "@/lib/store/types";

export interface HistoryPlayer {
  seat: number;
  name: string;
  avatar: unknown;
  isYou: boolean;
}

export interface HistoryRun {
  id: string;
  code: string;
  mode: Mode;
  dailyKey?: string;
  escaped: boolean;
  stagesCleared: number;
  total: number;
  timeLeftMs: number;
  strikes: number;
  hintsUsed: number;
  score: number;
  playedAt: number;
  players: HistoryPlayer[];
}

/** Shape of one run row from GET /api/history (Drizzle rows JSON-serialized). */
export interface CloudRun {
  id: string;
  code: string;
  mode: string;
  dailyKey: string | null;
  escaped: boolean;
  stagesCleared: number;
  total: number;
  timeLeftMs: number;
  strikes: number;
  hintsUsed: number;
  score: number;
  endedAt: string;
  players: { seat: number; name: string; avatar: unknown; userId: string | null }[];
}

function fromLocal(r: RunSummary): HistoryRun {
  return {
    id: r.id,
    code: r.code,
    mode: r.mode,
    dailyKey: r.dailyKey,
    escaped: r.escaped,
    stagesCleared: r.stagesCleared,
    total: r.total,
    timeLeftMs: r.timeLeftMs,
    strikes: r.strikes,
    hintsUsed: r.hintsUsed,
    score: r.score,
    playedAt: r.playedAt,
    players: r.players.map((p) => ({ seat: p.seat, name: p.name, avatar: p.avatar, isYou: p.isYou })),
  };
}

function fromCloud(r: CloudRun): HistoryRun {
  return {
    id: r.id,
    code: r.code,
    mode: (r.mode as Mode) ?? "standard",
    dailyKey: r.dailyKey ?? undefined,
    escaped: r.escaped,
    stagesCleared: r.stagesCleared,
    total: r.total,
    timeLeftMs: r.timeLeftMs,
    strikes: r.strikes,
    hintsUsed: r.hintsUsed,
    score: r.score,
    playedAt: Date.parse(r.endedAt) || 0,
    players: r.players
      .slice()
      .sort((a, b) => a.seat - b.seat)
      .map((p) => ({ seat: p.seat, name: p.name, avatar: p.avatar, isYou: false })),
  };
}

/** Merge local + cloud runs by id (local preferred), newest first. */
export function mergeRuns(local: RunSummary[], cloud: CloudRun[]): HistoryRun[] {
  const byId = new Map<string, HistoryRun>();
  for (const c of cloud) byId.set(c.id, fromCloud(c));
  for (const l of local) byId.set(l.id, fromLocal(l)); // local overrides cloud
  return [...byId.values()].sort((a, b) => b.playedAt - a.playedAt);
}

export interface HistoryStats {
  runs: number;
  escapes: number;
  escapeRate: number;
  bestTimeLeftMs: number | null;
}

/** Lifetime totals for the stats strip. */
export function computeStats(runs: HistoryRun[]): HistoryStats {
  const escaped = runs.filter((r) => r.escaped);
  const bestTimeLeftMs = escaped.length > 0 ? Math.max(...escaped.map((r) => r.timeLeftMs)) : null;
  return {
    runs: runs.length,
    escapes: escaped.length,
    escapeRate: runs.length > 0 ? Math.round((escaped.length / runs.length) * 100) : 0,
    bestTimeLeftMs,
  };
}

function prevDayKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Consecutive-day daily-escape streak ending today (or yesterday) in UTC. */
export function dailyStreak(runs: HistoryRun[], now: number): number {
  const keys = new Set(runs.filter((r) => r.escaped && r.dailyKey).map((r) => r.dailyKey as string));
  let cursor = dateKeyUTC(now);
  if (!keys.has(cursor)) {
    cursor = prevDayKey(cursor);
    if (!keys.has(cursor)) return 0;
  }
  let streak = 0;
  while (keys.has(cursor)) {
    streak++;
    cursor = prevDayKey(cursor);
  }
  return streak;
}

/** The partner (non-you) name in a run, falling back to the first differing seat. */
export function partnerName(run: HistoryRun, myName?: string): string {
  const other = run.players.find((p) => !p.isYou) ?? run.players.find((p) => p.name !== myName);
  return other?.name ?? "Partner";
}
