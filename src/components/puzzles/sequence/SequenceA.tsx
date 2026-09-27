"use client";

import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { COLORS, type SeqColor, type SequenceAction, type SequenceViewA } from "@/game/puzzles/sequence/types";
import { Button, ProgressDots } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";
import { haptic, PartnerStrip, PuzzlePanel } from "../shared";
import { SEQ_HEX, seqLabel } from "./colors";

/** Operator: watch the flash, then press the buttons B translates. */
export function SequenceA({ view, canAct, send, disabled }: PuzzleViewProps<SequenceViewA, SequenceAction>) {
  const active = canAct && !disabled;
  const [lit, setLit] = useState<SeqColor | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pressed, setPressed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(true);
    view.flash.forEach((color, i) => {
      timers.current.push(setTimeout(() => { setLit(color); haptic(8); }, i * 620 + 60));
      timers.current.push(setTimeout(() => setLit(null), i * 620 + 460));
    });
    timers.current.push(setTimeout(() => setPlaying(false), view.flash.length * 620 + 120));
  }, [view.flash]);

  // Auto-play on new round; reset the local press counter on round/strike change.
  useEffect(() => { setPressed(0); play(); }, [view.round, play]);
  useEffect(() => { setPressed(0); }, [view.strikes]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function press(color: SeqColor) {
    if (!active || playing) return;
    haptic(10);
    setPressed((p) => Math.min(p + 1, view.round));
    send({ press: color });
  }

  return (
    <PuzzlePanel eyebrow="Signal relay" right={<ProgressDots total={view.totalRounds} current={view.round - 1} ariaLabel="Round" />}>
      {!canAct && <PartnerStrip />}
      <div className="grid grid-cols-4 gap-2 rounded-(--radius-card) bg-surface-1 p-3 hairline">
        {COLORS.map((color) => (
          <div key={color} className="aspect-square rounded-(--radius-input) transition-all duration-150"
            style={{ backgroundColor: SEQ_HEX[color], opacity: lit === color ? 1 : 0.18, boxShadow: lit === color ? `0 0 20px -2px ${SEQ_HEX[color]}` : "none" }}
            aria-hidden />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">Round {view.round}/{view.totalRounds}</span>
        <div className="flex gap-1">
          {Array.from({ length: view.round }, (_, i) => (
            <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < pressed ? "bg-accent" : "bg-faint/40")} />
          ))}
        </div>
        <Button size="sm" variant="secondary" leftIcon={<Play className="h-3.5 w-3.5" />} disabled={playing} onClick={play}>
          Replay
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {COLORS.map((color) => (
          <button key={color} type="button" disabled={!active || playing} onClick={() => press(color)}
            aria-label={`Press ${seqLabel(color)}`}
            className="flex h-14 items-center justify-center rounded-(--radius-input) font-display font-semibold text-canvas transition-transform active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: SEQ_HEX[color] }}>
            {seqLabel(color)}
          </button>
        ))}
      </div>
      <p className="text-xs text-faint">Watch the flashes, read them to your partner, then press the buttons they translate.</p>
    </PuzzlePanel>
  );
}
