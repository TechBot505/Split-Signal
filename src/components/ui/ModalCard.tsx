"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ModalTone = "neutral" | "accent" | "warn" | "fail";

export interface ModalCardProps {
  open: boolean;
  onClose?: () => void;
  tone?: ModalTone;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  dismissable?: boolean;
}

const TONE_BAR: Record<ModalTone, string> = {
  neutral: "bg-faint/40",
  accent: "bg-accent",
  warn: "bg-warn",
  fail: "bg-fail",
};

/** Centered modal card with a tone accent bar on top. */
export function ModalCard({
  open,
  onClose,
  tone = "neutral",
  title,
  children,
  footer,
  className,
  dismissable = true,
}: ModalCardProps) {
  useEffect(() => {
    if (!open || !dismissable || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissable, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissable ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={cn(
              "relative w-full max-w-[380px] overflow-hidden rounded-(--radius-card) bg-surface-1 hairline",
              className
            )}
          >
            <span className={cn("block h-1 w-full", TONE_BAR[tone])} />
            <div className="p-5">
              {title && <h2 className="mb-2 text-lg text-display">{title}</h2>}
              <div className="text-sm text-muted">{children}</div>
              {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
