import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
  interactive?: boolean;
  inset?: boolean;
}

/** Surface panel with hairline border and 14px radius. */
export function Card({
  as: Tag = "div",
  interactive,
  inset,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-(--radius-card) bg-surface-1 hairline",
        inset ? "p-3" : "p-4",
        interactive && "transition-colors hover:bg-surface-2 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
