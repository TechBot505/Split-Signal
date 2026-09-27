"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type {
  BadgeColor,
  CrewItem,
  GridAction,
  GridViewA,
} from "@/game/puzzles/grid/types";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";

const TONES: Record<CrewItem, string> = {
  Ava: "#6C8CB5",
  Bo: "#5FA39A",
  Cy: "#8C7FB8",
  Dee: "#B5798C",
};

const BADGES: Record<BadgeColor, string> = {
  red: "#FF5468",
  green: "#3CF2D6",
  blue: "#5B8DEF",
  amber: "#FFB547",
};

function Token({
  item,
  selected,
  onClick,
  disabled,
}: {
  item: CrewItem;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.94 }}
      disabled={disabled}
      onClick={onClick}
      aria-label={item}
      aria-pressed={selected}
      className={cn(
        "flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 font-display text-sm font-semibold text-canvas transition-shadow",
        selected && "glow-accent",
        disabled && "opacity-50",
      )}
      style={{ backgroundColor: TONES[item] }}
    >
      {item}
    </motion.button>
  );
}

export function GridView({ view, canAct, send, disabled }: PuzzleViewProps<GridViewA, GridAction>) {
  const [sel, setSel] = useState<CrewItem | null>(null);
  const locked = !canAct || !!disabled;
  const placed = new Set(view.board.filter(Boolean) as CrewItem[]);
  const bench = view.items.filter((i) => !placed.has(i));

  const onSlot = (slot: number) => {
    if (locked) return;
    const occupant = view.board[slot];
    if (sel) {
      send({ type: "place", item: sel, slot });
      setSel(null);
    } else if (occupant) {
      send({ type: "clear", slot });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card inset className="flex flex-wrap gap-2">
        <span className="label-mono w-full">Crew</span>
        {bench.length === 0 && <span className="text-xs text-faint">All seated</span>}
        {bench.map((i) => (
          <Token key={i} item={i} selected={sel === i} disabled={locked} onClick={() => setSel(sel === i ? null : i)} />
        ))}
      </Card>

      <div className="grid grid-cols-4 gap-2">
        {view.board.map((occupant, slot) => {
          const badge = view.badges?.[slot];
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSlot(slot)}
              disabled={locked}
              aria-label={`Bunk ${slot + 1}${occupant ? `, ${occupant}` : ", empty"}`}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-(--radius-card) bg-surface-1 hairline",
                sel && !locked && "ring-1 ring-accent/40",
              )}
            >
              <span className="label-mono absolute left-1.5 top-1.5">{slot + 1}</span>
              {badge && (
                <span
                  className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: BADGES[badge] }}
                />
              )}
              {occupant ? (
                <span
                  className="flex h-10 min-w-10 items-center justify-center rounded-full px-2 font-display text-sm font-semibold text-canvas"
                  style={{ backgroundColor: TONES[occupant] }}
                >
                  {occupant}
                </span>
              ) : (
                <span className="text-faint">·</span>
              )}
              {occupant && !locked && (
                <X size={12} className="absolute bottom-1.5 right-1.5 text-faint" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <Card inset className="flex flex-col gap-1.5">
        <span className="label-mono">Your clues</span>
        <ul className="flex flex-col gap-1">
          {view.clues.map((c, i) => (
            <li key={i} className="text-sm text-fg">
              • {c}
            </li>
          ))}
        </ul>
      </Card>

      <Button variant="primary" size="lg" fullWidth disabled={locked} onClick={() => send({ type: "submit" })}>
        SUBMIT ASSIGNMENT
      </Button>
    </div>
  );
}

export const GridA = GridView;
export const GridB = GridView;
