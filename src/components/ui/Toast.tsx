"use client";

import { AnimatePresence, motion } from "motion/react";
import { create } from "zustand";
import { cn } from "@/lib/cn";

export type ToastTone = "neutral" | "accent" | "warn" | "fail";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastItem[];
  push: (t: ToastItem) => void;
  remove: (id: number) => void;
  clear: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts, t] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

let counter = 0;
const DURATION = 2500;

/** Show a transient top-center toast. */
export function toast(message: string, tone: ToastTone = "neutral") {
  const id = ++counter;
  useToastStore.getState().push({ id, message, tone });
  if (typeof window !== "undefined") {
    window.setTimeout(() => useToastStore.getState().remove(id), DURATION);
  }
}

/** Dismiss all visible toasts immediately. */
export function clearToasts() {
  useToastStore.getState().clear();
}

const TONES: Record<ToastTone, string> = {
  neutral: "bg-surface-2 text-fg hairline",
  accent: "bg-accent/15 text-accent border border-accent/40",
  warn: "bg-warn/15 text-warn border border-warn/40",
  fail: "bg-fail/15 text-fail border border-fail/40",
};

/** Mount once near the app root to render toasts. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(12px,env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className={cn(
              "pointer-events-auto rounded-full px-4 py-2 text-sm font-medium shadow-lg backdrop-blur",
              TONES[t.tone]
            )}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
