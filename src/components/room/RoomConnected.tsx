"use client";

import { useEffect } from "react";
import { useRoom } from "@/lib/realtime";
import { toast } from "@/components/ui";
import { RadarLoader } from "@/components/hud";
import { RoomHeader } from "./RoomHeader";
import { RoomError } from "./RoomError";
import { LobbyPhase } from "./LobbyPhase";
import { BriefingPhase } from "./BriefingPhase";
import { StagePhase } from "./StagePhase";
import { StageClearPhase } from "./StageClearPhase";
import { ResultsPhase } from "./ResultsPhase";
import { PausedOverlay } from "./PausedOverlay";

export interface RoomConnectedProps {
  code: string;
}

/** Error codes that make the room unusable and warrant a full-screen error. */
const FATAL = new Set(["room_full", "seat_taken", "not_in_room", "kicked"]);

/** Connects to the room and renders the active phase. Profile is guaranteed set. */
export function RoomConnected({ code }: RoomConnectedProps) {
  const { view, status, serverOffset, error, send, signals, onEvent } = useRoom(code);

  // Surface recoverable errors (bad move, no hints, …) as transient toasts.
  useEffect(() => {
    if (error && !FATAL.has(error.code)) toast(error.message, "warn");
  }, [error]);

  if (error && FATAL.has(error.code)) return <RoomError code={error.code} message={error.message} />;

  const leave = () => send({ type: "leave" });

  if (!view) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <RoomHeader code={code} onLeave={leave} />
        <div className="grid min-h-0 flex-1 place-items-center">
          <RadarLoader label={status === "reconnecting" ? "Reconnecting…" : "Connecting…"} />
        </div>
      </div>
    );
  }

  const isHost = view.players[0]?.id === view.you;
  const paused = view.phase === "stage" && view.run?.pausedAt !== undefined;
  const bothConnected = view.players.length === 2 && view.players.every((p) => p.connected);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <RoomHeader code={view.code} onLeave={leave} />
      <div className="flex min-h-0 flex-1 flex-col">
        {view.phase === "lobby" && <LobbyPhase view={view} isHost={isHost} send={send} />}
        {view.phase === "briefing" && <BriefingPhase view={view} send={send} />}
        {view.phase === "stage" && (
          <StagePhase view={view} serverOffset={serverOffset} signals={signals} send={send} subscribe={onEvent} />
        )}
        {view.phase === "stageClear" && <StageClearPhase view={view} />}
        {(view.phase === "escaped" || view.phase === "failed") && <ResultsPhase view={view} send={send} />}
      </div>

      <PausedOverlay open={!!paused} bothConnected={bothConnected} onResume={() => send({ type: "resume" })} />
    </div>
  );
}
