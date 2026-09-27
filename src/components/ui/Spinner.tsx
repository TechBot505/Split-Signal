import { cn } from "@/lib/cn";

export interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

/** Minimal ring spinner; inherits currentColor. */
export function Spinner({ size = 18, className, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      style={{ width: size, height: size }}
    />
  );
}
