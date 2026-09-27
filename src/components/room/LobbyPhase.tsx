"use client";

import type { ClientMessage } from "@/game/protocol";
import type { Mode, Player, RoomView } from "@/game/types";
import { Avatar } from "@/components/avatar";
import { Button, Card, Segmented } from "@/components/ui";
import { RadarLoader } from "@/components/hud";
import { PhaseLayout } from "./PhaseLayout";
import { InviteControls } from "./InviteControls";
import { MODE_LABEL, MODES, budgetMinutes, stageCount } from "./constants";

export interface LobbyPhaseProps {
  view: RoomView;
  isHost: boolean;
  send: (msg: ClientMessage) => void;
}

/** Filled player slot card. */
function FilledSlot({ player, you }: { player: Player; you: boolean }) {
  return (
    <Card className="flex items-center gap-3">
      <Avatar config={player.avatar} size={40} />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-fg">{player.name || "Operator"}</span>
        <span className="label-mono">{you ? "You" : "Partner"}</span>
      </div>
    </Card>
  );
}

export function LobbyPhase({ view, isHost, send }: LobbyPhaseProps) {
  const you = view.players.find((p) => p.id === view.you);
  const partner = view.players.find((p) => p.id !== view.you);
  const ready = view.players.length === 2;

  const dock = isHost ? (
    <Button size="lg" fullWidth disabled={!ready} onClick={() => send({ type: "start" })}>
      {ready ? "Start mission" : "Waiting for partner…"}
    </Button>
  ) : (
    <Button size="lg" fullWidth disabled>
      Waiting for host to start…
    </Button>
  );

  return (
    <PhaseLayout title={<span className="label-mono text-accent">Bunker lobby</span>} dock={dock}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 pt-2">
          <span className="label-mono">Room code</span>
          <span className="font-mono text-5xl font-semibold tracking-[0.28em] text-fg">{view.code}</span>
          <InviteControls code={view.code} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="label-mono">Operators</span>
          {you && <FilledSlot player={you} you />}
          {partner ? (
            <FilledSlot player={partner} you={false} />
          ) : (
            <Card className="flex items-center gap-3 border-dashed">
              <div className="grid h-10 w-10 place-items-center">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              </div>
              <RadarLoader size={44} />
              <span className="text-sm text-muted">Waiting for your partner…</span>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="label-mono">Mission mode</span>
          {isHost ? (
            <Segmented<Mode>
              ariaLabel="Run mode"
              value={view.mode}
              onChange={(mode) => send({ type: "create", mode })}
              options={MODES.map((m) => ({ value: m, label: MODE_LABEL[m] }))}
            />
          ) : (
            <Card className="text-sm text-fg">{MODE_LABEL[view.mode]}</Card>
          )}
          <p className="text-xs text-faint">
            {stageCount(view.mode)} stages · {budgetMinutes(view.mode)} min · 3 strikes · 2 hints
          </p>
        </div>
      </div>
    </PhaseLayout>
  );
}
