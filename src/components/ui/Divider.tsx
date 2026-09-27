import { cn } from "@/lib/cn";

export interface DividerProps {
  label?: string;
  className?: string;
}

/** Hairline divider with an optional centered mono micro-label. */
export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <span className="h-px flex-1 bg-hairline" />
        <span className="label-mono">{label}</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>
    );
  }
  return <hr className={cn("border-0 border-t border-hairline", className)} />;
}
