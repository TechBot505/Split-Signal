"use client";

import type { ClueStyle, DialsAction, DialsViewB } from "@/game/puzzles/dials/types";
import { Chip } from "@/components/ui";
import type { PuzzleViewProps } from "../types";
import { PartnerStrip, PuzzlePanel } from "../shared";

const STYLE_LABEL: Record<ClueStyle, string> = { compass: "Compass", clock: "Clock", relative: "Relative" };

/** Small compass rose illustration for the advisor header. */
function CompassRose() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden>
      <circle cx="32" cy="32" r="28" className="fill-surface-2 stroke-hairline" />
      {Array.from({ length: 8 }, (_, i) => {
        const rad = (i * 45 - 90) * (Math.PI / 180);
        return <line key={i} x1={32 + 20 * Math.cos(rad)} y1={32 + 20 * Math.sin(rad)} x2={32 + 26 * Math.cos(rad)} y2={32 + 26 * Math.sin(rad)} className="stroke-faint" strokeWidth="1.5" />;
      })}
      <path d="M32 10 37 32 32 28 27 32Z" fill="#3CF2D6" />
      <path d="M32 54 27 32 32 36 37 32Z" className="fill-faint" />
      <text x="32" y="9" textAnchor="middle" className="fill-accent" style={{ fontSize: 7, fontFamily: "var(--font-mono)" }}>N</text>
    </svg>
  );
}

/** Advisor: the target bearings for each dial. */
export function DialsB({ view }: PuzzleViewProps<DialsViewB, DialsAction>) {
  return (
    <PuzzlePanel eyebrow="Target bearings" right={<span className="label-mono">{view.dialCount} dials</span>}>
      <PartnerStrip />
      <div className="flex items-center gap-3 rounded-(--radius-card) bg-surface-1 p-3 hairline">
        <CompassRose />
        <p className="text-xs text-muted">
          Read each bearing so your partner can line up every dial. North is straight up (12 o&apos;clock).
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {view.clues.map((clue, i) => (
          <li key={i} className="flex items-center gap-3 rounded-(--radius-card) bg-surface-1 p-3 hairline">
            <span className="font-mono text-sm text-accent">{clue.dial + 1}</span>
            <span className="flex-1 text-sm text-fg">{clue.text}</span>
            <Chip tone={clue.style === "relative" ? "warn" : "accent"} size="sm">
              {STYLE_LABEL[clue.style]}
            </Chip>
          </li>
        ))}
      </ol>
    </PuzzlePanel>
  );
}
