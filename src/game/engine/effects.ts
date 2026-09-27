/**
 * Side effects an engine transition asks the transport (Durable Object) to
 * perform. The engine itself is pure: it returns effects, it never performs I/O.
 */
import type { EventKind, RoomState, RunRecord, SignalKind } from "../types";

export type Effect =
  /** Re-project the room to every connected player and send `state`. */
  | { t: "broadcast" }
  /** Ask the transport to call `tick` at epoch-ms `at` (e.g. deadline). */
  | { t: "schedule"; at: number }
  /** Send an `error` only to player `to`. */
  | { t: "error"; to: string; code: string; message: string }
  /** Relay a quick signal ping from `from` to the partner. */
  | { t: "signal"; from: string; kind: SignalKind }
  /** Broadcast a game event (solved/strike/hint/…). */
  | { t: "event"; kind: EventKind; stageIndex?: number; message?: string }
  /** The run finished; persist `record`. */
  | { t: "runOver"; record: RunRecord };

/** Standard engine return: the next state plus the effects to run. */
export interface Transition {
  state: RoomState;
  effects: Effect[];
}

/** Convenience: an error-only transition that leaves state unchanged. */
export function fail(state: RoomState, to: string, code: string, message: string): Transition {
  return { state, effects: [{ t: "error", to, code, message }] };
}
