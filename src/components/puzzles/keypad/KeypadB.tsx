"use client";

import { useEffect, useRef, useState } from "react";
import type { KeypadAction, KeypadViewB } from "@/game/puzzles/keypad/types";
import type { PuzzleViewProps } from "../types";
import { PartnerStrip, PuzzlePanel } from "../shared";
import { Symbol } from "../symbols";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

/** Advisor: the symbol codex. Find the column holding all four of A's symbols. */
export function KeypadB({ view }: PuzzleViewProps<KeypadViewB, KeypadAction>) {
  const scroller = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth - el.clientWidth > 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view.columns.length]);

  return (
    <PuzzlePanel eyebrow="Symbol codex">
      <PartnerStrip />
      <div className="relative">
        <div
          ref={scroller}
          className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 no-scrollbar"
        >
          {view.columns.map((col, c) => (
            <div
              key={c}
              className="flex min-w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-(--radius-card) bg-surface-1 p-3 hairline"
            >
              <span className="font-mono text-xs text-accent">{ROMAN[c] ?? c + 1}</span>
              <div className="h-px w-full bg-hairline" />
              {col.map((sym, r) => (
                <div
                  key={r}
                  className="flex h-11 w-11 items-center justify-center rounded-(--radius-input) bg-surface-2 text-fg"
                >
                  <Symbol id={sym} size={26} />
                </div>
              ))}
            </div>
          ))}
        </div>
        {overflowing && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-canvas to-transparent" />
        )}
      </div>
      {overflowing && (
        <p className="label-mono text-faint">Swipe for more columns →</p>
      )}
      <p className="text-xs text-faint">
        Only one column contains all four symbols your partner names. Read that column top to bottom.
      </p>
    </PuzzlePanel>
  );
}
