"use client";

import { Lock } from "lucide-react";
import type { DialsAction, DialsViewA } from "@/game/puzzles/dials/types";
import { Button } from "@/components/ui";
import type { PuzzleViewProps } from "../types";
import { haptic, PartnerStrip, PuzzlePanel } from "../shared";
import { Dial } from "./Dial";

/** Operator: rotate every dial to B's bearings, then lock in. */
export function DialsA({ view, canAct, send, disabled }: PuzzleViewProps<DialsViewA, DialsAction>) {
  const active = canAct && !disabled && !view.solved;

  return (
    <PuzzlePanel eyebrow="Alignment dials">
      {!canAct && <PartnerStrip />}
      <div className="flex flex-wrap items-start justify-center gap-4 rounded-(--radius-card) bg-surface-1 p-4 hairline">
        {view.positions.map((pos, i) => (
          <Dial
            key={i}
            index={i}
            position={pos}
            active={active}
            onRotate={(dir) => send({ rotate: i, dir })}
          />
        ))}
      </div>
      <Button
        variant="primary"
        fullWidth
        size="lg"
        leftIcon={<Lock className="h-4 w-4" />}
        disabled={!active}
        onClick={() => { haptic(20); send({ lock: true }); }}
      >
        Lock in
      </Button>
      <p className="text-xs text-faint">
        Turn each dial to the bearing your partner reads. Lock in only when every dial is set.
      </p>
    </PuzzlePanel>
  );
}
