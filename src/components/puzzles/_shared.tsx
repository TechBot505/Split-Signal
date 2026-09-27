"use client";

import { Radio } from "lucide-react";
import { cn } from "@/lib/cn";

/** Subtle strip shown to the advisor: this hardware belongs to the partner. */
export function PartnerStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-(--radius-input) bg-surface-2 px-3 py-2 hairline",
        className,
      )}
      role="note"
    >
      <Radio size={14} className="shrink-0 text-accent" aria-hidden />
      <p className="text-xs text-muted">Your partner operates this one — guide them.</p>
    </div>
  );
}

/** Point on an upper-semicircle gauge; t in [0,1] sweeps left→right. */
export function gaugeXY(cx: number, cy: number, r: number, t: number): [number, number] {
  const a = Math.PI * (1 - t);
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

/** SVG polyline path tracing the gauge arc between two fractions. */
export function gaugeArc(
  cx: number,
  cy: number,
  r: number,
  t0: number,
  t1: number,
  steps = 24,
): string {
  const pts: string[] = [];
  const lo = Math.min(t0, t1);
  const hi = Math.max(t0, t1);
  for (let i = 0; i <= steps; i++) {
    const t = lo + ((hi - lo) * i) / steps;
    const [x, y] = gaugeXY(cx, cy, r, t);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

/** Mono readout slot used by keypads / code displays. */
export function Slot({ char, active }: { char: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-12 w-9 items-center justify-center rounded-(--radius-input) font-mono text-lg",
        active ? "bg-accent/12 text-accent glow-accent" : "bg-surface-2 text-fg hairline",
      )}
    >
      {char}
    </div>
  );
}
