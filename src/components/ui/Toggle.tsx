"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Accessible switch with a ≥44px hit area (visual track is smaller). */
export function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn("inline-flex min-h-11 cursor-pointer select-none items-center gap-3", disabled && "cursor-not-allowed opacity-50", className)}
    >
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-accent" : "bg-surface-2 hairline"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "block h-5 w-5 rounded-full bg-canvas shadow",
            checked ? "ml-[22px]" : "ml-0.5"
          )}
        />
      </button>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  );
}
