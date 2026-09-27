"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Dir, MazeAction, MazeViewA } from "@/game/puzzles/maze/types";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";
import { haptic, PartnerStrip, PuzzlePanel } from "../shared";
import { Symbol } from "../symbols";

const DIR_ICON: Record<Dir, typeof ArrowUp> = { U: ArrowUp, D: ArrowDown, L: ArrowLeft, R: ArrowRight };

/** Operator: blind grid — only your dot and the landmarks you pass. */
export function MazeA({ view, canAct, send, disabled }: PuzzleViewProps<MazeViewA, MazeAction>) {
  const reduce = useReducedMotion();
  const active = canAct && !disabled;
  const cell = 100 / view.size;
  const [shake, setShake] = useState(0);
  const posRef = useRef(view.pos);
  posRef.current = view.pos;
  const swipe = useRef<{ x: number; y: number } | null>(null);

  function move(dir: Dir) {
    if (!active) return;
    const before = posRef.current;
    haptic(10);
    send({ move: dir });
    setTimeout(() => {
      const now = posRef.current;
      if (now.r === before.r && now.c === before.c) setShake((s) => s + 1);
    }, 260);
  }

  useEffect(() => { if (shake && !reduce) haptic(24); }, [shake, reduce]);

  function onUp(e: React.PointerEvent) {
    if (!swipe.current || !active) return;
    const dx = e.clientX - swipe.current.x, dy = e.clientY - swipe.current.y;
    swipe.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "R" : "L");
    else move(dy > 0 ? "D" : "U");
  }

  return (
    <PuzzlePanel eyebrow="Corridor">
      {!canAct && <PartnerStrip />}
      <div
        className="mx-auto aspect-square w-full"
        style={{ width: "max(200px, min(100%, calc(100dvh - 430px)))" }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="h-full w-full touch-none rounded-(--radius-card) bg-surface-1 hairline"
          animate={shake && !reduce ? { x: [0, -4, 4, -2, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
          onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={onUp}
          role="img"
          aria-label="Your position in the dark corridor"
        >
          {Array.from({ length: view.size + 1 }, (_, i) => (
            <g key={i}>
              <line x1={i * cell} y1="0" x2={i * cell} y2="100" className="stroke-hairline" strokeWidth="0.4" />
              <line x1="0" y1={i * cell} x2="100" y2={i * cell} className="stroke-hairline" strokeWidth="0.4" />
            </g>
          ))}
          {view.landmarks.map((lm, i) => (
            <g key={i} transform={`translate(${lm.c * cell + cell / 2 - 3.5} ${lm.r * cell + cell / 2 - 3.5}) scale(${cell / 34})`} className="text-faint">
              <Symbol id={lm.glyph} size={24} />
            </g>
          ))}
          <circle cx={view.pos.c * cell + cell / 2} cy={view.pos.r * cell + cell / 2} r={cell / 3.4} fill="#3CF2D6" className="glow-accent" />
        </motion.svg>
      </div>
      <div className="mx-auto grid w-fit grid-cols-3 gap-1.5">
        {(["_", "U", "_", "L", "_", "R", "_", "D", "_"] as const).map((k, i) =>
          k === "_" ? (
            <span key={i} />
          ) : (
            (() => { const Icon = DIR_ICON[k]; return (
              <button key={i} type="button" disabled={!active} onClick={() => move(k)}
                aria-label={`Move ${k}`}
                className={cn("flex h-14 w-14 items-center justify-center rounded-(--radius-input) bg-surface-2 text-fg transition-colors hover:bg-surface-1 disabled:opacity-50")}>
                <Icon className="h-5 w-5" />
              </button>
            ); })()
          ),
        )}
      </div>
      <p className="text-xs text-faint">Call out the glyphs you pass. Swipe the grid or use the pad to move.</p>
    </PuzzlePanel>
  );
}
