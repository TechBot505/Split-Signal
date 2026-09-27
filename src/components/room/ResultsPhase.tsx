"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import type { ClientMessage } from "@/game/protocol";
import type { RoomView } from "@/game/types";
import { Button, Card, CountUp, Stat } from "@/components/ui";
import { ShareButton } from "@/components/share";
import { appUrl } from "@/lib/env";
import { playSound } from "@/lib/sound";
import { haptic } from "@/lib/haptics";
import { useHistoryStore } from "@/lib/store/history";
import { toSummary } from "./resultSummary";
import { MODE_LABEL } from "./constants";

export interface ResultsPhaseProps {
  view: RoomView;
  send: (msg: ClientMessage) => void;
}

function fmtTime(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ResultsPhase({ view, send }: ResultsPhaseProps) {
  const reduce = useReducedMotion();
  const result = view.result;
  const escaped = view.phase === "escaped";
  const saved = useRef(false);

  useEffect(() => {
    playSound(escaped ? "escape" : "fail");
    haptic(escaped ? "success" : "error");
    if (escaped && !reduce) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.3 }, colors: ["#3CF2D6", "#EAF2F7", "#FFB547"] });
    }
  }, [escaped, reduce]);

  // Persist the finished run to local history exactly once (store de-dupes by id).
  useEffect(() => {
    if (!result || saved.current) return;
    saved.current = true;
    const seat = view.players.findIndex((p) => p.id === view.you);
    useHistoryStore.getState().addRun(toSummary(result, seat));
  }, [result, view.players, view.you]);

  if (!result) return null;

  return (
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 py-8">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <span className="label-mono" style={{ color: escaped ? "#3CF2D6" : "#FF5468" }}>
            {view.mode === "daily" ? "Daily bunker" : MODE_LABEL[view.mode]}
          </span>
          <h1
            className={escaped ? "text-display text-5xl text-accent" : "text-display text-5xl text-fail"}
            style={!reduce && !escaped ? { animation: "glitch-shake 0.5s ease-in-out 2" } : undefined}
          >
            {escaped ? "ESCAPED" : "SIGNAL LOST"}
          </h1>
          <p className="text-sm text-muted">
            {result.stagesCleared}/{result.total} stages cleared
          </p>
        </motion.div>

        <Card className="grid grid-cols-2 gap-4">
          <Stat label="Time left" value={<span className="font-mono">{escaped ? fmtTime(result.timeLeftMs) : "—"}</span>} tone={escaped ? "accent" : "default"} />
          <Stat label="Score" value={<CountUp value={escaped ? result.score : 0} />} />
          <Stat label="Strikes" value={`${result.strikes}/3`} tone={result.strikes ? "warn" : "default"} />
          <Stat label="Hints used" value={String(result.hintsUsed)} />
        </Card>

        <Card className="flex flex-col gap-2" inset>
          <span className="label-mono">Stage log</span>
          <ul className="flex flex-col divide-y divide-hairline">
            {view.stages.map((s) => (
              <li key={s.index} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="truncate text-fg">
                  {s.index + 1}. {s.name ?? "Locked"}
                </span>
                <span className={s.solved ? "text-accent" : "text-faint"}>{s.solved ? "Cleared" : "—"}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-2">
          <Button size="lg" fullWidth onClick={() => send({ type: "playAgain" })}>
            Play again
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <ShareButton
              data={{
                escaped,
                timeLeftMs: result.timeLeftMs,
                score: result.score,
                strikes: result.strikes,
                hintsUsed: result.hintsUsed,
                stagesCleared: result.stagesCleared,
                total: result.total,
                players: result.players.map((p) => p.name),
                dailyLabel: result.dailyKey,
                appUrl,
              }}
            />
            <Link href="/play" className="block">
              <Button variant="secondary" fullWidth>
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
