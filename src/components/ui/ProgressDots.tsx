import { cn } from "@/lib/cn";

export interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
  ariaLabel?: string;
}

/** Compact dot progress indicator (e.g. onboarding / carousels). */
export function ProgressDots({ total, current, className, ariaLabel = "Progress" }: ProgressDotsProps) {
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className={cn("flex items-center gap-1.5", className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-5 bg-accent" : "w-1.5 bg-faint/40"
          )}
        />
      ))}
    </div>
  );
}
