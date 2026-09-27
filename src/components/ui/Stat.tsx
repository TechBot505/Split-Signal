import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface StatProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "accent" | "warn" | "fail";
  className?: string;
}

const VALUE_TONE = {
  default: "text-fg",
  accent: "text-accent",
  warn: "text-warn",
  fail: "text-fail",
} as const;

/** Labeled readout: mono micro-label above a large value. */
export function Stat({ label, value, hint, tone = "default", className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="label-mono">{label}</span>
      <span className={cn("font-mono text-2xl tabular-nums", VALUE_TONE[tone])}>{value}</span>
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}
