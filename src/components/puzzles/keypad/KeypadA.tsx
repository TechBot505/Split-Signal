"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { KeypadAction, KeypadViewA } from "@/game/puzzles/keypad/types";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";
import { haptic, PartnerStrip, PuzzlePanel } from "../shared";
import { Symbol } from "../symbols";

/** Operator: 2×2 backlit symbol keys pressed in the order B reads. */
export function KeypadA({ view, canAct, send, disabled }: PuzzleViewProps<KeypadViewA, KeypadAction>) {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const lastPressed = useRef<number | null>(null);
  const prevProgress = useRef(0);
  const active = canAct && !disabled && !view.solved;

  useEffect(() => {
    const prev = prevProgress.current;
    if (view.progress > prev && lastPressed.current !== null) {
      setLit((l) => [...l, lastPressed.current as number]);
    } else if (view.progress === 0 && prev > 0) {
      const wrong = lastPressed.current;
      setLit([]);
      if (wrong !== null) setFlash(wrong);
    }
    prevProgress.current = view.progress;
  }, [view.progress]);

  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 420);
    return () => clearTimeout(t);
  }, [flash]);

  function press(i: number) {
    if (!active) return;
    haptic(10);
    lastPressed.current = i;
    send({ press: i });
  }

  return (
    <PuzzlePanel
      eyebrow="Keypad"
      right={<span className="font-mono text-xs text-muted">{view.progress}/4 entered</span>}
    >
      {!canAct && <PartnerStrip />}
      <div className="grid grid-cols-2 gap-3">
        {view.buttons.map((sym, i) => {
          const isLit = view.solved || lit.includes(i);
          const isFlash = flash === i;
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => press(i)}
              disabled={!active}
              whileTap={active && !reduce ? { scale: 0.96 } : undefined}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              aria-label={`Key ${i + 1}: ${sym}`}
              className={cn(
                "flex aspect-square min-h-20 items-center justify-center rounded-(--radius-card) hairline transition-colors",
                isFlash
                  ? "bg-fail/20 text-fail"
                  : isLit
                    ? "bg-accent/15 text-accent glow-accent"
                    : "bg-surface-2 text-fg hover:bg-surface-1",
                !active && !isLit && "opacity-80",
              )}
            >
              <Symbol id={sym} size={44} />
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-faint">
        Name your four symbols to your partner, then press them in the order they read back.
      </p>
    </PuzzlePanel>
  );
}
