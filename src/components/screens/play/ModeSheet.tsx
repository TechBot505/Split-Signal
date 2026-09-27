"use client";

import { Loader2 } from "lucide-react";
import { Sheet } from "@/components/ui";
import { MODE_CONFIG } from "@/game/engine";
import type { Mode } from "@/game/types";
import { cn } from "@/lib/cn";

type PlayMode = Exclude<Mode, "daily">;

interface ModeOption {
  mode: PlayMode;
  label: string;
  descriptor: string;
  level: 1 | 2 | 3;
}

const OPTIONS: ModeOption[] = [
  { mode: "quick", label: "Quick", descriptor: "A fast sprint to warm up.", level: 1 },
  { mode: "standard", label: "Standard", descriptor: "The full bunker experience.", level: 2 },
  { mode: "hard", label: "Hard", descriptor: "More stages, tighter clock.", level: 3 },
];

function minutes(ms: number): string {
  return `${Math.round(ms / 60000)} min`;
}

function Meter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-0.5" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-1 rounded-full", i <= level ? "bg-accent" : "bg-faint/30")}
          style={{ height: `${4 + i * 4}px` }}
        />
      ))}
    </span>
  );
}

export interface ModeSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (mode: PlayMode) => void;
  pending: Mode | null;
}

/** Bottom sheet listing the three run modes as selectable rows. */
export function ModeSheet({ open, onClose, onSelect, pending }: ModeSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Start a run">
      <div className="flex flex-col gap-2 pt-1">
        {OPTIONS.map((opt) => {
          const cfg = MODE_CONFIG[opt.mode];
          const busy = pending === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              disabled={pending !== null}
              onClick={() => onSelect(opt.mode)}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-(--radius-card) bg-surface-2 p-3 text-left hairline transition-colors",
                "hover:bg-surface-1 disabled:opacity-60",
                busy && "glow-accent"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base text-display text-fg">{opt.label}</span>
                  <Meter level={opt.level} />
                </div>
                <p className="mt-0.5 text-xs text-muted">{opt.descriptor}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 font-mono text-xs text-muted">
                {busy ? (
                  <Loader2 size={18} className="animate-spin text-accent" aria-label="Creating room" />
                ) : (
                  <>
                    <span className="text-accent">{cfg.stages} stages</span>
                    <span>{minutes(cfg.budgetMs)}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
