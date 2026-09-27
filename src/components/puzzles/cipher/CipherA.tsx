"use client";

import { Delete } from "lucide-react";
import { GLYPHS, type CipherAction, type CipherViewA } from "@/game/puzzles/cipher/types";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";
import { CipherGlyph } from "../glyphs";
import { haptic, PartnerStrip, PuzzlePanel } from "../shared";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

/** Operator: read the glyphs to B, then type the decoded word. */
export function CipherA({ view, canAct, send, disabled }: PuzzleViewProps<CipherViewA, CipherAction>) {
  const active = canAct && !disabled && !view.solved;
  const full = view.typed.length >= view.wordLength;

  function key(ch: string) {
    if (!active || full) return;
    haptic(8);
    send({ type: ch });
  }

  return (
    <PuzzlePanel eyebrow={`Cipher · ${view.mode}`}>
      {!canAct && <PartnerStrip />}
      {/* glyph strip */}
      <div className="flex flex-wrap justify-center gap-2 rounded-(--radius-card) bg-surface-1 p-3 hairline">
        {view.glyphs.map((g, i) => {
          const canon = (GLYPHS as readonly string[]).indexOf(g);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-(--radius-input) bg-surface-2 text-accent">
                <CipherGlyph id={g} size={28} />
              </div>
              {view.mode === "caesar" && canon >= 0 && (
                <span className="font-mono text-[11px] text-faint">{String.fromCharCode(65 + canon)}</span>
              )}
            </div>
          );
        })}
      </div>
      {/* input slots */}
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: view.wordLength }, (_, i) => (
          <div key={i} className={cn("flex h-11 w-9 items-center justify-center rounded-(--radius-input) border font-mono text-lg", view.typed[i] ? "border-accent/40 bg-surface-2 text-fg" : "border-hairline bg-surface-1 text-faint")}>
            {view.typed[i]?.toUpperCase() ?? ""}
          </div>
        ))}
      </div>
      {/* keyboard */}
      <div className="flex flex-col gap-1.5">
        {ROWS.map((row) => (
          <div key={row} className="flex justify-center gap-1">
            {[...row].map((ch) => (
              <button key={ch} type="button" disabled={!active || full} onClick={() => key(ch)}
                className="h-11 min-w-8 flex-1 rounded-(--radius-input) bg-surface-2 font-mono text-sm text-fg transition-colors hover:bg-surface-1 disabled:opacity-50">
                {ch.toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" leftIcon={<Delete className="h-4 w-4" />} disabled={!active || view.typed.length === 0}
          onClick={() => { haptic(8); send({ backspace: true }); }}>
          Delete
        </Button>
        <Button variant="primary" fullWidth disabled={!active || !full}
          onClick={() => { haptic(20); send({ submit: true }); }}>
          Submit
        </Button>
      </div>
    </PuzzlePanel>
  );
}
