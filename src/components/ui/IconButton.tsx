"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends HTMLMotionProps<"button"> {
  /** Accessible label (icon-only button). */
  label: string;
  tone?: "default" | "accent" | "ghost";
}

const TONES: Record<NonNullable<IconButtonProps["tone"]>, string> = {
  default: "bg-surface-2 text-fg hairline hover:bg-surface-1",
  accent: "bg-accent text-accent-fg glow-accent",
  ghost: "bg-transparent text-muted hover:bg-surface-1 hover:text-fg",
};

/** 40px round icon button. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, tone = "default", className, children, disabled, ...props }, ref) {
    return (
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          TONES[tone],
          disabled && "pointer-events-none text-faint",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
