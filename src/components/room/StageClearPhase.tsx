"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import type { RoomView } from "@/game/types";
import { RoleBadge } from "@/components/hud";
import { gameRole } from "./constants";
import { playSound } from "@/lib/sound";
import { haptic } from "@/lib/haptics";

export interface StageClearPhaseProps {
  view: RoomView;
}

/** 2.5s interstitial: solved stage confirmation + the upcoming role swap. */
export function StageClearPhase({ view }: StageClearPhaseProps) {
  const reduce = useReducedMotion();
  const run = view.run;
  const clearedNumber = (run?.stageIndex ?? 0) + 1;
  const idx = view.players.findIndex((p) => p.id === view.you);
  const nextStageIndex = (run?.stageIndex ?? 0) + 1;
  const nextRole = gameRole(idx === nextStageIndex % 2 ? "A" : "B");

  useEffect(() => {
    playSound("solve");
    haptic("success");
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={reduce ? undefined : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="grid h-24 w-24 place-items-center rounded-full bg-accent/12 text-accent glow-accent"
      >
        <Check size={52} strokeWidth={2.5} aria-hidden />
      </motion.div>

      <div className="flex flex-col gap-1">
        <span className="label-mono text-accent">Stage {clearedNumber} cleared</span>
        <h1 className="text-display text-3xl">Nice work</h1>
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="label-mono">You&apos;re now the</span>
        <RoleBadge role={nextRole} />
      </motion.div>
    </div>
  );
}
