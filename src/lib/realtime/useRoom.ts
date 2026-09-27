"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { realtimeHost } from "@/lib/env";
import type { ClientMessage } from "@/game/protocol";
import type { EventKind, RoomView, SignalKind } from "@/game/types";
import { useProfileStore } from "@/lib/store/profile";
import { ClockOffset } from "./offset";
import { buildJoin, parseServerMessage } from "./messages";

export type RoomStatus = "connecting" | "open" | "reconnecting" | "closed";
export interface RoomSignal {
  from: string;
  kind: SignalKind;
  at: number;
}
export interface RoomEvent {
  kind: EventKind;
  stageIndex?: number;
  message?: string;
  at: number;
}
export type EventListener = (e: RoomEvent) => void;
export interface RoomError {
  code: string;
  message: string;
}

export interface UseRoom {
  view: RoomView | null;
  status: RoomStatus;
  /** Median server clock offset (ms): serverNow ≈ Date.now() + serverOffset. */
  serverOffset: number;
  error: RoomError | null;
  send: (msg: ClientMessage) => void;
  /** Rolling window of the last 5 signals (own + partner), newest last. */
  signals: RoomSignal[];
  /** Subscribe to the game-event stream; returns an unsubscribe fn. */
  onEvent: (fn: EventListener) => () => void;
}

const HEARTBEAT_MS = 15000;
const SIGNAL_WINDOW = 5;

/**
 * Connects to the PartyKit room `code` on the "main" party, (re)sending `join`
 * on every open, heartbeating, tracking clock offset and validating every
 * incoming frame. Guest-safe: a local profile is created on demand.
 */
export function useRoom(code: string | null): UseRoom {
  const [view, setView] = useState<RoomView | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [error, setError] = useState<RoomError | null>(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [signals, setSignals] = useState<RoomSignal[]>([]);

  const socketRef = useRef<PartySocket | null>(null);
  const offsetRef = useRef(new ClockOffset());
  const listenersRef = useRef(new Set<EventListener>());
  const hadOpenRef = useRef(false);

  const send = useCallback((msg: ClientMessage) => {
    const s = socketRef.current;
    if (s && s.readyState === WebSocket.OPEN) s.send(JSON.stringify(msg));
  }, []);

  const onEvent = useCallback((fn: EventListener) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (!code) return;
    hadOpenRef.current = false;
    const socket = new PartySocket({ host: realtimeHost, party: "main", room: code });
    socketRef.current = socket;
    setStatus("connecting");

    const bumpOffset = (serverNow: number) => {
      offsetRef.current.add(serverNow);
      setServerOffset(offsetRef.current.value);
    };

    const handleOpen = () => {
      hadOpenRef.current = true;
      setStatus("open");
      const profile = useProfileStore.getState().ensureProfile();
      socket.send(JSON.stringify(buildJoin(profile)));
      socket.send(JSON.stringify({ type: "ping" } satisfies ClientMessage));
    };
    const handleClose = () => {
      setStatus(hadOpenRef.current ? "reconnecting" : "connecting");
    };
    const handleMessage = (evt: MessageEvent) => {
      if (typeof evt.data !== "string") return;
      const msg = parseServerMessage(evt.data);
      if (!msg) return;
      switch (msg.type) {
        case "state":
          setView(msg.view);
          break;
        case "pong":
          bumpOffset(msg.now);
          break;
        case "error":
          setError({ code: msg.code, message: msg.message });
          break;
        case "signal":
          setSignals((prev) =>
            [...prev, { from: msg.from, kind: msg.kind, at: Date.now() }].slice(-SIGNAL_WINDOW),
          );
          break;
        case "event": {
          const e: RoomEvent = { kind: msg.kind, stageIndex: msg.stageIndex, message: msg.message, at: Date.now() };
          listenersRef.current.forEach((fn) => fn(e));
          break;
        }
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("message", handleMessage);

    const heartbeat = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" } satisfies ClientMessage));
      }
    }, HEARTBEAT_MS);

    return () => {
      clearInterval(heartbeat);
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("message", handleMessage);
      socket.close();
      socketRef.current = null;
      setStatus("closed");
    };
  }, [code]);

  return { view, status, serverOffset, error, send, signals, onEvent };
}
