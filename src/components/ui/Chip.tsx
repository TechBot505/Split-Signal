import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipTone = "neutral" | "accent" | "warn" | "fail";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
  icon?: ReactNode;
  size?: "sm" | "md";
}

const TONES: Record<ChipTone, string> = {
  neutral: "bg-surface-2 text-muted hairline",
  accent: "bg-accent/12 text-accent border border-accent/30",
  warn: "bg-warn/12 text-warn border border-warn/30",
  fail: "bg-fail/12 text-fail border border-fail/30",
};

/** Pill-shaped status chip / badge. */
export function Chip({
  tone = "neutral",
  icon,
  size = "md",
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONES[tone],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

/** Alias — Badge is the same primitive. */
export const Badge = Chip;
