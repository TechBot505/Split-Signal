"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Lightbulb } from "lucide-react";
import type { ClientMessage } from "@/game/protocol";
import type { RoomView } from "@/game/types";
import { RoleBadge } from "@/components/hud";
import { renderPuzzle } from "@/components/puzzles/registry";
import { Card } from "@/components/ui";
import { PhaseLayout } from "./PhaseLayout";
import { StageHud } from "./StageHud";
import { SignalBar } from "./SignalBar";
import { SignalIndicator } from "./SignalIndicator";
import { gameRole } from "./constants";
import type { RoomSignal, EventListener } from "@/lib/realtime";
import { playSound } from "@/lib/sound";
import { haptic } from "@/lib/haptics";

export interface StagePhaseProps {
  view: RoomView;
  serverOffset: number;
  signals: RoomSignal[];
  send: (msg: ClientMessage) => void;
  subscribe: (fn: EventListener) => () => void;
}

/** Live stage: HUD, role, puzzle, signal dock, plus strike/signal feedback. */
export function StagePhase({ view, serverOffset, signals, send, subscribe }: StagePhaseProps) {
  const reduce = useReducedMotion();
  const run = view.run;
  const role = view.role;
  const [striking, setStriking] = useState(false);
  const partner = signals.filter((s) => s.from !== view.you).at(-1) ?? null;
  const lastSignalAt = useRef<number>(0);

  // Strike feedback: glitch shake + vignette + buzz.
  useEffect(() => {
    return subscribe((e) => {
      if (e.kind !== "strike") return;
      setStriking(true);
      playSound("strike");
      haptic("error");
      window.setTimeout(() => setStriking(false), 450);
    });
  }, [subscribe]);

  // Incoming partner signal: ping + haptic (once per new signal).
  useEffect(() => {
    if (!partner || partner.at === lastSignalAt.current) return;
    lastSignalAt.current = partner.at;
    playSound("signal");
    haptic("signal");
  }, [partner]);

  if (!run || !role) return null;
  const paused = run.pausedAt !== undefined;

  const puzzle = renderPuzzle(run.stageType, role, {
    view: run.puzzleView,
    role,
    canAct: run.canAct && !paused,
    send: (payload) => send({ type: "action", stageIndex: run.stageIndex, payload }),
  });

  const title = (
    <div className="flex items-center gap-2">
      <RoleBadge role={gameRole(role)} />
      <span className="truncate text-sm font-medium text-fg">{run.stageName}</span>
    </div>
  );

  return (
    <>
      <SignalIndicator signal={partner ? { kind: partner.kind, at: partner.at } : null} />
      <AnimatePresence>
        {striking && !reduce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-30"
            style={{ boxShadow: "inset 0 0 120px 20px rgba(255,84,104,0.55)" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={striking && !reduce ? { x: [0, -4, 4, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <PhaseLayout title={title} dock={<SignalBar send={send} disabled={paused} />}>
          <div className="flex flex-col gap-4">
            <StageHud run={run} serverOffset={serverOffset} paused={paused} onHint={() => send({ type: "hint" })} onPause={() => send({ type: "pause" })} />

            <p className="text-sm text-muted">{run.stageBriefing}</p>

            {run.hintText && (
              <Card className="flex items-start gap-2.5 border-warn/30 bg-warn/10">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden />
                <p className="text-sm text-fg">{run.hintText}</p>
              </Card>
            )}

            <div className="pt-1">
              {puzzle ?? (
                <Card className="text-sm text-fail">
                  Unknown puzzle type “{run.stageType}”. Please report this bug.
                </Card>
              )}
            </div>
          </div>
        </PhaseLayout>
      </motion.div>
    </>
  );
}
