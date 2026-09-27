"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface TimerProps {
  /** Absolute deadline (server epoch ms). */
  deadline: number;
  /** clientNow + serverOffset ≈ serverNow. */
  serverOffset?: number;
  paused?: boolean;
  /** Frozen remaining ms to display while paused. */
  pausedRemainingMs?: number;
  className?: string;
}

function fmt(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Big mono countdown; warns amber <60s, critical red <15s, dims when paused. */
export function Timer({ deadline, serverOffset = 0, paused, pausedRemainingMs, className }: TimerProps) {
  const compute = () => deadline - (Date.now() + serverOffset);
  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    if (paused) return;
    setRemaining(compute());
    const id = window.setInterval(() => setRemaining(compute()), 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline, serverOffset, paused]);

  const shown = paused && pausedRemainingMs != null ? pausedRemainingMs : remaining;
  const critical = shown < 15000;
  const warn = shown < 60000;

  return (
    <span
      role="timer"
      aria-live="off"
      className={cn(
        "font-mono text-4xl font-semibold tabular-nums tracking-tight",
        paused ? "text-faint" : critical ? "text-fail" : warn ? "text-warn" : "text-fg",
        className
      )}
      style={
        !paused && warn ? { animation: `blink ${critical ? 0.6 : 1}s ease-in-out infinite` } : undefined
      }
    >
      {fmt(shown)}
    </span>
  );
}
