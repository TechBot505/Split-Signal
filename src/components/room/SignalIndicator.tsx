"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { SignalKind } from "@/game/types";
import { SIGNALS } from "./constants";

export interface SignalIndicatorProps {
  /** Newest partner signal (kind + timestamp), or null. */
  signal: { kind: SignalKind; at: number } | null;
}

const META = (kind: SignalKind) => SIGNALS.find((s) => s.kind === kind);

/** Floating chip near the top that surfaces the partner's latest signal ~2.5s. */
export function SignalIndicator({ signal }: SignalIndicatorProps) {
  const [shown, setShown] = useState<SignalIndicatorProps["signal"]>(null);

  useEffect(() => {
    if (!signal) return;
    setShown(signal);
    const t = setTimeout(() => setShown(null), 2200);
    return () => clearTimeout(t);
  }, [signal?.at]); // eslint-disable-line react-hooks/exhaustive-deps

  const meta = shown ? META(shown.kind) : undefined;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(96px,calc(env(safe-area-inset-bottom)+92px))] z-40 flex justify-center px-4">
      <AnimatePresence>
        {shown && meta && (
          <motion.div
            key={shown.at}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 480, damping: 30 }}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-medium text-accent shadow-lg backdrop-blur"
          >
            <meta.Icon size={16} aria-hidden />
            <span>
              Partner: <span className="text-fg">{meta.label}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
