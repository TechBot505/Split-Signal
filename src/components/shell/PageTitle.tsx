import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PageTitleProps {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

/** Consistent page header: uppercase mono eyebrow + display h1. */
export function PageTitle({ title, eyebrow, action, className }: PageTitleProps) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-3", className)}>
      <div className="flex flex-col gap-1.5">
        {eyebrow && <span className="label-mono text-accent">{eyebrow}</span>}
        <h1 className="text-2xl text-display tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}
