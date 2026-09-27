"use client";

import { COLORS, type SeqColor, type SeqTable, type SequenceAction, type SequenceViewB, tableKey } from "@/game/puzzles/sequence/types";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";
import { PartnerStrip, PuzzlePanel } from "../shared";
import { SEQ_HEX, seqLabel } from "./colors";

function keyLabel(key: string): string {
  const [s, parity] = key.split("-");
  const strikes = `${s} strike${s === "1" ? "" : "s"}`;
  if (parity === undefined) return strikes;
  return `${strikes} · ${parity === "0" ? "even" : "odd"} round`;
}

function Dot({ color }: { color: SeqColor }) {
  return <span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-hairline" style={{ backgroundColor: SEQ_HEX[color] }} />;
}

/** Advisor: colour translation tables; the active one is highlighted. */
export function SequenceB({ view }: PuzzleViewProps<SequenceViewB, SequenceAction>) {
  const activeKey = tableKey(view.strikes, view.round, view.usesParity);
  const keys = Object.keys(view.tables).sort();
  return (
    <PuzzlePanel eyebrow="Translation tables" right={<span className="font-mono text-xs text-muted">Round {view.round}</span>}>
      <PartnerStrip />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {keys.map((key) => {
          const table = view.tables[key] as SeqTable;
          const isActive = key === activeKey;
          return (
            <div key={key} className={cn("rounded-(--radius-card) p-3 hairline transition-colors", isActive ? "bg-accent/10 border border-accent/40" : "bg-surface-1")}>
              <div className="mb-2 flex items-center justify-between">
                <span className={cn("label-mono", isActive && "text-accent")}>{keyLabel(key)}</span>
                {isActive && <span className="font-mono text-[10px] text-accent">ACTIVE</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                {COLORS.map((flash) => (
                  <div key={flash} className="flex items-center gap-2 text-sm">
                    <Dot color={flash} />
                    <span className="w-14 text-muted">{seqLabel(flash)}</span>
                    <span className="text-faint">→</span>
                    <Dot color={table[flash]} />
                    <span className="text-fg">{seqLabel(table[flash])}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-faint">
        {view.usesParity
          ? "The table depends on strikes and whether the round number is odd or even."
          : "Use the table for the current strike count. Translate each flash to a button."}
      </p>
    </PuzzlePanel>
  );
}
