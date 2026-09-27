/**
 * The engine's single message entry point. `apply` dispatches a parsed client
 * message to the right handler and returns the next state plus effects. Ping is
 * handled by the transport (pong), so the engine treats it as a no-op.
 */
import type { ClientMessage } from "../protocol";
import type { RoomState } from "../types";
import { applyAction, applyHint, applyPause, applyResume, applySignal } from "./actions";
import type { Transition } from "./effects";
import { create, handleDisconnect, join, playAgain, ready, start } from "./room";

/** Apply one validated client message on behalf of `playerId`. Never throws. */
export function apply(state: RoomState, playerId: string, msg: ClientMessage, now: number): Transition {
  switch (msg.type) {
    case "join":
      return join(state, msg.playerId, msg.token, msg.name, msg.avatar, now);
    case "create":
      return create(state, playerId, msg.mode, now);
    case "start":
      return start(state, playerId, now);
    case "ready":
      return ready(state, playerId, now);
    case "action":
      return applyAction(state, playerId, msg.stageIndex, msg.payload, now);
    case "hint":
      return applyHint(state, playerId);
    case "signal":
      return applySignal(state, playerId, msg.kind);
    case "pause":
      return applyPause(state, playerId, now);
    case "resume":
      return applyResume(state, playerId, now);
    case "playAgain":
      return playAgain(state, playerId, now);
    case "leave":
      return handleDisconnect(state, playerId, now);
    case "ping":
      return { state, effects: [] };
  }
}
