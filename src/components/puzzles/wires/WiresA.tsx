"use client";

import { useState } from "react";
import type { WiresAction, WiresViewA } from "@/game/puzzles/wires/types";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";
import { haptic, PartnerStrip, PuzzlePanel } from "../shared";
import { colorLabel } from "./colors";
import { WireRow } from "./WireRow";

/** Operator: sees the physical wires and cuts one (two-tap confirm). */
export function WiresA({ view, canAct, send, disabled }: PuzzleViewProps<WiresViewA, WiresAction>) {
  const [pending, setPending] = useState<number | null>(null);
  const [cutIndex, setCutIndex] = useState<number | null>(null);
  const active = canAct && !disabled && !view.solved;

  function tap(i: number) {
    if (!active) return;
    haptic(10);
    setPending((prev) => (prev === i ? prev : i));
  }
  function confirm(i: number) {
    haptic(20);
    setCutIndex(i);
    setPending(null);
    send({ cut: i });
  }

  return (
    <PuzzlePanel eyebrow="Wire panel">
      {!canAct && <PartnerStrip />}
      <div className="flex flex-col gap-2 rounded-(--radius-card) bg-surface-1 p-3 hairline">
        {view.wires.map((w, i) => {
          const isPending = pending === i;
          return (
            <div key={i} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => tap(i)}
                disabled={!active || cutIndex !== null}
                aria-label={`Cut wire ${i + 1}, ${w.striped ? "striped " : ""}${colorLabel(w.color)}`}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-(--radius-input) px-2 text-left transition-colors",
                  isPending ? "bg-surface-2 glow-accent" : "hover:bg-surface-2",
                  !active && "opacity-70",
                )}
              >
                <span className="w-5 shrink-0 text-center font-mono text-sm text-muted">{i + 1}</span>
                <WireRow wire={w} index={i} cut={cutIndex === i} />
              </button>
              {isPending && (
                <div className="flex items-center gap-2 pl-8">
                  <span className="text-sm text-warn">Cut wire {i + 1}?</span>
                  <Button size="sm" variant="danger" onClick={() => confirm(i)}>
                    Confirm cut
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-faint">
        Describe each wire to your partner. Tap a wire, then confirm to snip it.
      </p>
    </PuzzlePanel>
  );
}
