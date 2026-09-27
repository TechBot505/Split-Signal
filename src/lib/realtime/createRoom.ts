"use client";

import PartySocket from "partysocket";
import { nanoid } from "nanoid";
import { realtimeHost } from "@/lib/env";
import { generate as generateCode } from "@/game/codes";
import { createRng } from "@/game/rng";
import type { Mode } from "@/game/types";
import type { Profile } from "@/lib/store/types";
import { useProfileStore } from "@/lib/store/profile";
import { buildJoin, parseServerMessage } from "./messages";

const CREATE_TIMEOUT_MS = 8000;
/** Server error codes that mean "try a fresh code". */
const RETRYABLE = new Set(["room_full", "room_exists"]);

export interface CreateRoomResult {
  code: string;
}

/** A fresh unambiguous 4-letter room code. */
function freshCode(): string {
  return generateCode(createRng(nanoid()));
}

/**
 * Generate a room code, connect and perform the join→create handshake. On a
 * retryable rejection (room already taken) we retry with a new code up to
 * `maxRetries`. Resolves with the created code; the caller then navigates to
 * /room/[code] where `useRoom` reconnects and resumes the host seat.
 */
export async function createRoom(mode: Mode, maxRetries = 5): Promise<CreateRoomResult> {
  const profile = useProfileStore.getState().ensureProfile();
  let lastError = "unknown";
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = freshCode();
    try {
      await attemptCreate(code, mode, profile);
      return { code };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      if (!RETRYABLE.has(lastError)) throw e;
    }
  }
  throw new Error(`Could not create a room after ${maxRetries} tries (${lastError})`);
}

/** One create attempt against a specific code. Resolves once we become host. */
function attemptCreate(code: string, mode: Mode, profile: Profile): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const socket = new PartySocket({ host: realtimeHost, party: "main", room: code });
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("message", onMessage);
      socket.close();
    };
    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (err) reject(err);
      else resolve();
    };

    const timer = setTimeout(() => done(new Error("timeout")), CREATE_TIMEOUT_MS);

    const onOpen = () => {
      socket.send(JSON.stringify(buildJoin(profile)));
      socket.send(JSON.stringify({ type: "create", mode }));
    };
    const onMessage = (evt: MessageEvent) => {
      if (typeof evt.data !== "string") return;
      const msg = parseServerMessage(evt.data);
      if (!msg) return;
      if (msg.type === "error") done(new Error(msg.code));
      else if (msg.type === "state" && msg.view.phase === "lobby" && msg.view.players[0]?.id === profile.id) {
        done();
      }
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("message", onMessage);
  });
}
