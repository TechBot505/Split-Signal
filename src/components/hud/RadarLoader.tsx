import { cn } from "@/lib/cn";

export interface RadarLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

/** Animated radar sweep — a waiting indicator that fits the mission-control theme. */
export function RadarLoader({ size = 72, label, className }: RadarLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)} role="status" aria-label={label ?? "Waiting"}>
      <div
        className="relative grid place-items-center rounded-full bg-surface-1 hairline"
        style={{ width: size, height: size }}
      >
        <span className="absolute inset-2 rounded-full border border-hairline" />
        <span className="absolute inset-[38%] rounded-full border border-hairline" />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--color-accent) 55%, transparent) 55deg, transparent 90deg)",
            animation: "radar-sweep 1.8s linear infinite",
          }}
        />
        <span className="h-1.5 w-1.5 rounded-full bg-accent glow-accent" />
      </div>
      {label && <span className="label-mono">{label}</span>}
    </div>
  );
}
