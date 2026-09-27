"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Pinned footer that stays visible below the scrollable body. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Bottom sheet on mobile, centered dialog on desktop.
 * Drag-to-dismiss is armed ONLY from the grabber/header (dragListener=false),
 * so the scrollable body never hijacks touch scrolling.
 */
export function Sheet({ open, onClose, title, children, footer, className }: SheetProps) {
  const controls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const startDrag = (e: PointerEvent) => controls.start(e);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose();
            }}
            className={cn(
              "relative flex max-h-[88dvh] w-full flex-col rounded-t-2xl bg-surface-1 hairline sm:max-h-[80dvh] sm:max-w-[440px] sm:rounded-2xl",
              className
            )}
          >
            <div
              onPointerDown={startDrag}
              className="flex shrink-0 cursor-grab touch-none flex-col items-center gap-2 px-4 pb-2 pt-3 active:cursor-grabbing"
            >
              <span className="h-1.5 w-10 rounded-full bg-faint/50" />
              {title && (
                <h2 className="w-full text-center text-base text-display">{title}</h2>
              )}
            </div>
            <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 pb-4">
              {children}
            </div>
            {footer && (
              <div className="shrink-0 hairline-t px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
