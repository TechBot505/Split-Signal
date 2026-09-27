"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg glow-accent hover:brightness-110",
  secondary: "bg-surface-2 text-fg hairline hover:bg-surface-1",
  ghost: "bg-transparent text-fg hover:bg-surface-1",
  danger: "bg-fail text-canvas hover:brightness-110",
  "danger-outline": "bg-transparent text-fail border border-fail hover:bg-fail/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      ref={ref}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-(--radius-input) font-display font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        SIZES[size],
        VARIANTS[variant],
        fullWidth && "w-full",
        isDisabled && "pointer-events-none bg-surface-2 text-faint shadow-none border-transparent",
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={16} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </motion.button>
  );
});
