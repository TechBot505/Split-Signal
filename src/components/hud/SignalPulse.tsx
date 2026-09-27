"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SignalPulseProps {
  /** Change this value (e.g. a signal counter) to fire a pulse ring. */
  pulseKey?: number | string;
  tone?: "accent" | "warn";
  className?: string;
  children?: ReactNode;
}

/** Emits an expanding ring around its children whenever pulseKey changes. */
export function SignalPulse({ pulseKey, tone = "accent", className, children }: SignalPulseProps) {
  const [rings, setRings] = useState<number[]>([]);
  const first = useRef(true);
  const id = useRef(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const ringId = ++id.current;
    setRings((r) => [...r, ringId]);
    const t = window.setTimeout(
      () => setRings((r) => r.filter((x) => x !== ringId)),
      900
    );
    return () => window.clearTimeout(t);
  }, [pulseKey]);

  const ringColor = tone === "accent" ? "border-accent" : "border-warn";

  return (
    <span className={cn("relative inline-flex", className)}>
      <AnimatePresence>
        {rings.map((r) => (
          <motion.span
            key={r}
            initial={{ scale: 0.7, opacity: 0.7 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className={cn("pointer-events-none absolute inset-0 rounded-full border-2", ringColor)}
          />
        ))}
      </AnimatePresence>
      {children}
    </span>
  );
}
