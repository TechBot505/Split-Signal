"use client";

import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Fire a short haptic tick, guarded for SSR and unsupported devices. */
export function haptic(ms = 10): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(ms);
  } catch {
    /* ignore — vibration is best-effort */
  }
}

/**
 * Subtle strip shown on a view whose player is NOT the operator: it signals
 * that the partner acts and this player should read/guide.
 */
export function PartnerStrip({
  label = "Your partner operates this one — guide them",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-(--radius-input) bg-surface-1 px-3 py-2 hairline"
      role="note"
    >
      <BookOpen aria-hidden className="h-4 w-4 shrink-0 text-accent" />
      <span className="text-xs leading-tight text-muted">{label}</span>
    </div>
  );
}

/** Standard puzzle panel: mono eyebrow + tactile dark surface body. */
export function PuzzlePanel({
  eyebrow,
  right,
  children,
  className,
}: {
  eyebrow: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="label-mono">{eyebrow}</span>
        {right}
      </div>
      {children}
    </section>
  );
}
