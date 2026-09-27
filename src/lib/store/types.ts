/**
 * Shared types for the client-side zustand stores. Kept in one place so screens
 * (built separately) and the cloud-sync plumbing agree on the exact shapes.
 */
import type { Mode } from "@/game/types";
import type { AvatarConfig } from "@/lib/avatar";

/** Locally-stored player identity. `token` is a secret used to reclaim a seat. */
export interface Profile {
  id: string;
  /** Secret seat token (nanoid 21). Minted once, never rotated. */
  token: string;
  name: string;
  avatar: AvatarConfig;
  createdAt: number;
  /** epoch ms of the last local edit. Drives cloud-sync conflict resolution
   *  (newer side wins). */
  updatedAt: number;
}

/** One player's line in a past run's local summary. */
export interface RunSummaryPlayer {
  seat: number;
  name: string;
  avatar: AvatarConfig;
  /** True for the local player's own seat. */
  isYou: boolean;
}

/** A finished run recorded to local history (last 50 kept). Mirrors RunRecord. */
export interface RunSummary {
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
  /** epoch ms the run ended (endedAt). */
  playedAt: number;
  players: RunSummaryPlayer[];
}

/** Sound + haptic preferences (default ON). */
export interface Prefs {
  sound: boolean;
  haptics: boolean;
}
