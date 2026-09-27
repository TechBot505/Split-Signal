"use client";

import { animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface CountUpProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  mono?: boolean;
}

/** Animates a number from its previous value to the current one. */
export function CountUp({ value, duration = 0.9, format, className, mono = true }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration]);

  const text = format ? format(display) : Math.round(display).toLocaleString();
  return <span className={cn(mono && "font-mono tabular-nums", className)}>{text}</span>;
}
