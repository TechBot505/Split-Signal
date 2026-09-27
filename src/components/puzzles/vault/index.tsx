"use client";

import { Delete } from "lucide-react";
import { motion } from "motion/react";
import { Card, Chip } from "@/components/ui";
import type { VaultAction, VaultViewA, VaultViewB } from "@/game/puzzles/vault/types";
import { cn } from "@/lib/cn";
import { PartnerStrip, Slot } from "../_shared";
import type { PuzzleViewProps } from "../types";

function Riddles({ riddles, eyebrow }: { riddles: string[]; eyebrow: string }) {
  return (
    <Card inset className="flex flex-col gap-1.5">
      <span className="label-mono">{eyebrow}</span>
      <ul className="flex flex-col gap-1">
        {riddles.map((r, i) => (
          <li key={i} className="text-sm text-fg">
            • {r}
          </li>
        ))}
      </ul>
    </Card>
  );
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "enter"];

export function VaultA({ view, canAct, send, disabled }: PuzzleViewProps<VaultViewA, VaultAction>) {
  const locked = !canAct || !!disabled;
  const slots = Array.from({ length: view.codeLen }, (_, i) => view.entered[i]);

  const onKey = (k: string) => {
    if (locked) return;
    if (k === "clear") send({ type: "clear" });
    else if (k === "enter") send({ type: "enter" });
    else send({ type: "digit", value: Number(k) });
  };

  return (
    <div className="flex flex-col gap-4">
      <Riddles riddles={view.riddles} eyebrow="Your riddles (digits 1–2)" />
      <div className="flex justify-center gap-2">
        {slots.map((d, i) => (
          <Slot key={i} char={d === undefined ? "" : String(d)} active={d !== undefined} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {KEYS.map((k) => {
          const isEnter = k === "enter";
          const isClear = k === "clear";
          return (
            <motion.button
              key={k}
              type="button"
              whileTap={locked ? undefined : { scale: 0.96 }}
              disabled={locked}
              aria-label={isClear ? "Clear" : isEnter ? "Enter" : `Digit ${k}`}
              onClick={() => onKey(k)}
              className={cn(
                "flex h-12 items-center justify-center rounded-(--radius-input) font-mono text-xl transition-colors",
                isEnter && "bg-accent text-accent-fg glow-accent",
                isClear && "bg-surface-2 text-warn hairline",
                !isEnter && !isClear && "bg-surface-2 text-fg hairline",
                locked && "pointer-events-none opacity-50",
              )}
            >
              {isClear ? <Delete size={20} aria-hidden /> : isEnter ? "↵" : k}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function VaultB({ view }: PuzzleViewProps<VaultViewB, VaultAction>) {
  return (
    <div className="flex flex-col gap-4">
      <PartnerStrip />
      <Riddles riddles={view.riddles} eyebrow="Your riddles (digits 3–4)" />
      {view.checksum !== null && (
        <Chip tone="accent" className="self-start">
          Checksum: all digits sum to {view.checksum}
        </Chip>
      )}
    </div>
  );
}
