/**
 * Core engine types for Split Signal. Pure data — JSON-serializable, no DOM/Node.
 * See SPEC.md "Game rules", "Protocol" and "Persistence".
 */
import type { Difficulty, Role } from "./puzzles/types";

/** Run length / countdown preset. Daily is Standard with a fixed daily seed. */
export type Mode = "quick" | "standard" | "hard" | "daily";

/** Room lifecycle phases. */
export type Phase = "lobby" | "briefing" | "stage" | "stageClear" | "escaped" | "failed";

/** Quick pings a player can flash to their partner. */
export type SignalKind = "wait" | "yes" | "no" | "repeat" | "gotit" | "help";

/** Broadcast game events (for toasts / pulses on the client). */
export type EventKind = "solved" | "strike" | "hint" | "escaped" | "failed" | "stageStart";

/** Public player identity. Tokens are NEVER part of this shape. */
export interface Player {
  id: string;
  name: string;
  avatar: Record<string, unknown>;
  connected: boolean;
  ready: boolean;
  joinedAt: number;
}

/** Server-side player record — carries the secret seat token. */
export interface PlayerState extends Player {
  /** Auth token proving seat ownership. Server-side only; never viewed. */
  token: string;
}

/** One stage instance in a run. `state` is the puzzle module's own state. */
export interface StageRuntime {
  type: string;
  difficulty: Difficulty;
  /** Opaque puzzle state (the owning PuzzleModule's S). */
  state: unknown;
  solvedAt?: number;
  strikes: number;
}

/** Live run timing / progress. `deadline` is an absolute epoch-ms target. */
export interface RunState {
  stageIndex: number;
  startedAt: number;
  deadline: number;
  pausedAt?: number;
  pausedTotalMs: number;
  strikes: number;
  hintsLeft: number;
  hintsUsed: number;
  hintText?: string;
}

/** Persisted record emitted when a run ends (server fills token hashes). */
export interface RunRecord {
  id: string;
  code: string;
  mode: Mode;
  seed: string;
  dailyKey?: string;
  escaped: boolean;
  stagesCleared: number;
  total: number;
  timeLeftMs: number;
  strikes: number;
  hintsUsed: number;
  score: number;
  startedAt: number;
  endedAt: number;
  players: { seat: number; name: string; avatar: Record<string, unknown>; tokenHash: string }[];
}

/** The end-of-run record as shown to clients: the secret `seed` is stripped. */
export type ClientRunRecord = Omit<RunRecord, "seed">;

/** Full authoritative room state held by the Durable Object. */
export interface RoomState {
  code: string;
  mode: Mode;
  /** Increments each `playAgain`; feeds the non-daily seed. */
  gameNumber: number;
  seed: string;
  /** Optional server-side generation salt; NEVER included in any RoomView. */
  salt?: string;
  dailyKey?: string;
  createdAt: number;
  phase: Phase;
  /** Ordered by join. players[0] is the host. */
  players: PlayerState[];
  hostId?: string;
  stages: StageRuntime[];
  run?: RunState;
  /** When phase === "stageClear", the epoch-ms at which the next stage starts. */
  stageClearUntil?: number;
  /** Deterministic id for the current run, set when the run starts. */
  runId?: string;
  result?: RunRecord;
}

/** One entry of the RoomView stage summary. Type/name hidden for future stages. */
export interface StageSummary {
  index: number;
  type: string | null;
  name: string | null;
  solved: boolean;
}

/** Per-stage payload inside a RoomView while a run is active. */
export interface RunView {
  stageIndex: number;
  total: number;
  deadline: number;
  pausedAt?: number;
  pausedTotalMs: number;
  strikes: number;
  hintsLeft: number;
  hintsUsed: number;
  hintText?: string;
  stageType: string;
  stageName: string;
  stageDifficulty: Difficulty;
  /** Role-specific puzzle view (viewA or viewB) for THIS player only. */
  puzzleView: unknown;
  stageBriefing: string;
  canAct: boolean;
}

/** Per-player projection of the room. Never contains tokens or the other role's view. */
export interface RoomView {
  code: string;
  phase: Phase;
  you: string;
  /** Your role for the current stage, or null outside a stage. */
  role: Role | null;
  players: Player[];
  mode: Mode;
  run?: RunView;
  stages: StageSummary[];
  result?: ClientRunRecord;
}
