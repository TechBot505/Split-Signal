"use client";

import { BIT, type Dir, type MazeAction, type MazeViewB } from "@/game/puzzles/maze/types";
import type { PuzzleViewProps } from "../types";
import { PartnerStrip, PuzzlePanel } from "../shared";
import { Symbol } from "../symbols";

const SIDES: Array<{ dir: Dir; line: (x: number, y: number, s: number) => [number, number, number, number] }> = [
  { dir: "U", line: (x, y, s) => [x, y, x + s, y] },
  { dir: "D", line: (x, y, s) => [x, y + s, x + s, y + s] },
  { dir: "L", line: (x, y, s) => [x, y, x, y + s] },
  { dir: "R", line: (x, y, s) => [x + s, y, x + s, y + s] },
];

/** Advisor: the full maze map — walls, exit, landmarks, and A's dot (d≤3). */
export function MazeB({ view }: PuzzleViewProps<MazeViewB, MazeAction>) {
  const s = 100 / view.size;
  return (
    <PuzzlePanel eyebrow="Maze map" right={<span className="label-mono">{view.size}×{view.size}</span>}>
      <PartnerStrip />
      <svg viewBox="-2 -2 104 104" className="w-full rounded-(--radius-card) bg-surface-1 p-1 hairline" role="img" aria-label="Full maze map">
        <rect x={view.exit.c * s} y={view.exit.r * s} width={s} height={s} fill="#3CF2D6" fillOpacity="0.14" />
        {view.open.map((row, r) =>
          row.map((mask, c) =>
            SIDES.filter((side) => (mask & BIT[side.dir]) === 0).map((side, k) => {
              const [x1, y1, x2, y2] = side.line(c * s, r * s, s);
              return <line key={`${r}-${c}-${k}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9AA7B4" strokeWidth="0.9" strokeLinecap="round" />;
            }),
          ),
        )}
        {view.landmarks.map((lm, i) => (
          <g key={i} transform={`translate(${lm.c * s + s / 2 - 3.5} ${lm.r * s + s / 2 - 3.5}) scale(${s / 34})`} className="text-accent">
            <Symbol id={lm.glyph} size={24} />
          </g>
        ))}
        <circle cx={view.exit.c * s + s / 2} cy={view.exit.r * s + s / 2} r={s / 5} fill="none" stroke="#3CF2D6" strokeWidth="1" />
        {view.pos && (
          <circle cx={view.pos.c * s + s / 2} cy={view.pos.r * s + s / 2} r={s / 3.4} fill="#FFB547" />
        )}
      </svg>
      <p className="text-xs text-faint">
        {view.pos
          ? "The amber dot is your partner. Guide them wall by wall to the exit."
          : "You can't see your partner — have them describe the glyphs they pass."}
      </p>
    </PuzzlePanel>
  );
}
