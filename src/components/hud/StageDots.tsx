import { cn } from "@/lib/cn";

export interface StageDotsProps {
  total: number;
  /** Index of the current stage (0-based). */
  current: number;
  className?: string;
}

/** Run progress: done / current / upcoming stages joined by a connecting line. */
export function StageDots({ total, current, className }: StageDotsProps) {
  return (
    <div
      className={cn("flex items-center", className)}
      role="status"
      aria-label={`Stage ${Math.min(current + 1, total)} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <span
              className={cn(
                "grid h-3 w-3 place-items-center rounded-full transition-colors",
                done && "bg-accent",
                active && "bg-accent glow-accent",
                !done && !active && "bg-surface-2 hairline"
              )}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-fg" />}
            </span>
            {i < total - 1 && (
              <span
                className={cn(
                  "mx-1 h-px flex-1 transition-colors",
                  i < current ? "bg-accent/60" : "bg-hairline"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
