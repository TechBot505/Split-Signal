"use client";

import { motion } from "motion/react";
import { Button, Card } from "@/components/ui";
import type {
  SwitchesAction,
  SwitchesViewA,
  SwitchesViewB,
} from "@/game/puzzles/switches/types";
import { cn } from "@/lib/cn";
import { PartnerStrip } from "../_shared";
import type { PuzzleViewProps } from "../types";

function Led({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "h-4 w-4 rounded-full transition-colors",
          on ? "bg-accent shadow-[0_0_10px_-1px_var(--color-accent)]" : "bg-surface-2 hairline",
        )}
      />
      <span className="label-mono">{label}</span>
    </div>
  );
}

function LedStrip({ leds }: { leds: boolean[] }) {
  return (
    <Card inset className="flex items-center justify-around">
      {leds.map((on, i) => (
        <Led key={i} on={on} label={String(i + 1)} />
      ))}
    </Card>
  );
}

function FlipSwitch({
  index,
  on,
  disabled,
  onClick,
}: {
  index: number;
  on: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`Switch ${index + 1}`}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "relative flex h-14 w-11 items-end justify-center rounded-(--radius-input) p-1 transition-colors",
          on ? "bg-accent/15 hairline" : "bg-surface-2 hairline",
          disabled && "opacity-50",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "block h-6 w-8 rounded-[6px]",
            on ? "bg-accent" : "bg-[var(--color-faint)]",
          )}
          style={{ alignSelf: on ? "flex-start" : "flex-end" }}
        />
      </button>
      <span className="label-mono">{index + 1}</span>
    </div>
  );
}

export function SwitchesA({ view, canAct, send, disabled }: PuzzleViewProps<SwitchesViewA, SwitchesAction>) {
  const locked = !canAct || !!disabled;
  return (
    <div className="flex flex-col gap-4">
      <LedStrip leds={view.leds} />
      <Card className="flex flex-wrap justify-center gap-3">
        {view.switches.map((on, i) => (
          <FlipSwitch key={i} index={i} on={on} disabled={locked} onClick={() => send({ type: "flip", index: i })} />
        ))}
      </Card>
      <Button variant="primary" size="lg" fullWidth disabled={locked} onClick={() => send({ type: "submit" })}>
        SUBMIT
      </Button>
    </div>
  );
}

export function SwitchesB({ view }: PuzzleViewProps<SwitchesViewB, SwitchesAction>) {
  return (
    <div className="flex flex-col gap-4">
      <PartnerStrip />
      <Card inset className="flex flex-col gap-2">
        <span className="label-mono">Target LEDs</span>
        <div className="flex items-center justify-around">
          {view.target.map((on, i) => (
            <Led key={i} on={on} label={String(i + 1)} />
          ))}
        </div>
      </Card>
      <Card inset>
        <span className="label-mono">Wiring diagram</span>
        <table className="mt-2 w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="label-mono py-1 text-left">SW</th>
              {view.target.map((_, l) => (
                <th key={l} className="label-mono py-1">
                  {l + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.wiring.map((row, s) => (
              <tr key={s} className="hairline-t">
                <td className="py-1.5 text-left font-mono text-sm text-muted">{s + 1}</td>
                {row.map((wired, l) => (
                  <td key={l} className="py-1.5">
                    <span
                      className={cn(
                        "inline-block h-2.5 w-2.5 rounded-full",
                        wired ? "bg-accent" : "bg-surface-2 hairline",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
