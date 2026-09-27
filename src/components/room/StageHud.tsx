"use client";

import { useState } from "react";
import { Lightbulb, Pause } from "lucide-react";
import type { RunView } from "@/game/types";
import { Button, Card, IconButton, Sheet } from "@/components/ui";
import { StageDots, StrikeLights, Timer } from "@/components/hud";
import { cn } from "@/lib/cn";

export interface StageHudProps {
  run: RunView;
  serverOffset: number;
  paused: boolean;
  onHint: () => void;
  onPause: () => void;
}

/** Top HUD: countdown, strike LEDs, stage progress plus hint + pause controls. */
export function StageHud({ run, serverOffset, paused, onHint, onPause }: StageHudProps) {
  const [confirm, setConfirm] = useState(false);
  const pausedRemainingMs = run.pausedAt !== undefined ? run.deadline - run.pausedAt : undefined;
  const noHints = run.hintsLeft <= 0;

  return (
    <Card className="flex flex-col gap-3" inset>
      <div className="flex items-center justify-between gap-3">
        <Timer deadline={run.deadline} serverOffset={serverOffset} paused={paused} pausedRemainingMs={pausedRemainingMs} />
        <div className="flex flex-col items-end gap-2">
          <StrikeLights strikes={run.strikes} />
          <div className="flex items-center gap-2">
            <IconButton
              label="Pause"
              tone="default"
              disabled={paused}
              onClick={onPause}
              className="!h-9 !w-9"
            >
              <Pause size={15} aria-hidden />
            </IconButton>
            <button
              type="button"
              disabled={noHints || paused}
              onClick={() => setConfirm(true)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                "bg-warn/12 text-warn border border-warn/30 hover:bg-warn/20",
                (noHints || paused) && "pointer-events-none opacity-40",
              )}
            >
              <Lightbulb size={14} aria-hidden />
              {run.hintsLeft} {run.hintsLeft === 1 ? "hint" : "hints"}
            </button>
          </div>
        </div>
      </div>
      <StageDots total={run.total} current={run.stageIndex} />

      <Sheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Use a hint?"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" fullWidth onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={() => {
                onHint();
                setConfirm(false);
              }}
            >
              Use hint
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          This reveals a clue to <span className="text-fg">both players</span> and costs{" "}
          <span className="text-warn">30 seconds</span>. You have {run.hintsLeft} left.
        </p>
      </Sheet>
    </Card>
  );
}
