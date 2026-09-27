"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

/** Segmented control with a spring-sliding accent indicator (≥44px targets). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: SegmentedProps<T>) {
  const groupId = useId();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-full gap-1 rounded-(--radius-input) bg-surface-1 p-1 hairline",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex min-h-11 flex-1 items-center justify-center rounded-[10px] px-3 text-sm font-medium transition-colors",
              active ? "text-accent-fg" : "text-muted hover:text-fg"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={{ type: "spring", stiffness: 450, damping: 34 }}
                className="absolute inset-0 rounded-[10px] bg-accent"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
