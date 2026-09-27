"use client";

import type { CipherAction, CipherViewB } from "@/game/puzzles/cipher/types";
import type { PuzzleViewProps } from "../types";
import { CipherGlyph } from "../glyphs";
import { PartnerStrip, PuzzlePanel } from "../shared";
import { CaesarWheel } from "./CaesarWheel";

/** Advisor: the cipher key (wheel or glyph table) plus candidate words. */
export function CipherB({ view }: PuzzleViewProps<CipherViewB, CipherAction>) {
  return (
    <PuzzlePanel eyebrow={`Cipher key · ${view.mode}`}>
      <PartnerStrip />
      <div className="flex justify-center rounded-(--radius-card) bg-surface-1 p-3 hairline">
        {view.mode === "caesar" && view.shift !== undefined && view.dir !== undefined ? (
          <CaesarWheel shift={view.shift} dir={view.dir} />
        ) : (
          <div className="grid w-full grid-cols-4 gap-1.5 sm:grid-cols-6">
            {(view.table ?? []).map((entry) => (
              <div key={entry.glyph} className="flex flex-col items-center gap-0.5 rounded-(--radius-input) bg-surface-2 p-1.5">
                <CipherGlyph id={entry.glyph} size={22} className="text-accent" />
                <span className="font-mono text-xs text-fg">{entry.letter.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="label-mono">Candidate words</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {view.candidates.map((w) => (
            <span key={w} className="rounded-full bg-surface-2 px-3 py-1 font-mono text-sm text-fg hairline">
              {w}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs text-faint">
        {view.mode === "caesar"
          ? "A reads the letters; find each on the outer ring and read the inner letter to decode."
          : "A describes each glyph; match it in the table to read the decoded letter."}
      </p>
    </PuzzlePanel>
  );
}
