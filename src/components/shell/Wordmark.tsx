"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const BARS = [0.4, 0.75, 1, 0.6];

/** "Split Signal" wordmark — "Signal" in accent with animated signal bars. */
export function Wordmark({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-display text-lg font-semibold", className)}>
      <span className="text-fg">Split</span>
      <span className="text-accent">Signal</span>
      <span className="ml-0.5 flex h-4 items-end gap-0.5" aria-hidden>
        {BARS.map((h, i) => (
          <motion.span
            key={i}
            className="w-0.5 rounded-full bg-accent"
            style={{ height: `${h * 100}%` }}
            animate={reduce ? undefined : { scaleY: [h, 1, h * 0.6, h] }}
            transition={
              reduce
                ? undefined
                : { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }
            }
          />
        ))}
      </span>
    </span>
  );
}
