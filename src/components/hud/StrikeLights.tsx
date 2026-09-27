"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export interface StrikeLightsProps {
  /** Number of strikes incurred (0–max). */
  strikes: number;
  max?: number;
  className?: string;
}

/** Three LEDs; each lit strike glows red and glitch-shakes as it engages. */
export function StrikeLights({ strikes, max = 3, className }: StrikeLightsProps) {
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="status"
      aria-label={`${strikes} of ${max} strikes`}
    >
      {Array.from({ length: max }, (_, i) => {
        const lit = i < strikes;
        return (
          <motion.span
            key={i}
            animate={lit ? { x: [0, -2, 2, -1, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "h-3 w-3 rounded-full transition-colors",
              lit
                ? "bg-fail shadow-[0_0_10px_-1px_var(--color-fail)]"
                : "bg-surface-2 hairline"
            )}
          />
        );
      })}
    </div>
  );
}
