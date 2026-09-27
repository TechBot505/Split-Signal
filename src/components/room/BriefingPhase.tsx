"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Eye, ShieldAlert, Sparkles } from "lucide-react";
import type { ClientMessage } from "@/game/protocol";
import type { RoomView } from "@/game/types";
import { Button, Card } from "@/components/ui";
import { RoleBadge } from "@/components/hud";
import { PhaseLayout } from "./PhaseLayout";
import { budgetMinutes, gameRole, stageCount } from "./constants";
import { playSound } from "@/lib/sound";

export interface BriefingPhaseProps {
  view: RoomView;
  send: (msg: ClientMessage) => void;
}

/** Post-ready standby countdown (cosmetic; the server flips to stage on both-ready). */
function Standby({ waiting }: { waiting: boolean }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n <= 0) return;
    const t = setTimeout(() => {
      playSound("tick");
      setN((v) => v - 1);
    }, 700);
    return () => clearTimeout(t);
  }, [n]);
  if (waiting && n <= 0) return <p className="text-center text-sm text-muted">Waiting for your partner to ready up…</p>;
  return (
    <div className="grid place-items-center py-2">
      <motion.span key={n} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-5xl font-semibold text-accent">
        {n > 0 ? n : "GO"}
      </motion.span>
    </div>
  );
}

export function BriefingPhase({ view, send }: BriefingPhaseProps) {
  const reduce = useReducedMotion();
  const you = view.players.find((p) => p.id === view.you);
  const partner = view.players.find((p) => p.id !== view.you);
  const idx = view.players.findIndex((p) => p.id === view.you);
  const role = gameRole(idx === 0 ? "A" : "B");

  const dock = you?.ready ? (
    <Standby waiting={!partner?.ready} />
  ) : (
    <Button size="lg" fullWidth onClick={() => send({ type: "ready" })}>
      Ready
    </Button>
  );

  return (
    <PhaseLayout title={<span className="label-mono text-accent">Mission briefing</span>} dock={dock}>
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <h1 className="text-display text-3xl">Into the bunker</h1>
        <Card className="flex flex-col gap-2">
          <span className="label-mono">Run summary</span>
          <p className="text-sm text-fg">
            {stageCount(view.mode)} stages · {budgetMinutes(view.mode)} minute countdown · 3 strikes · 2 shared hints.
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <Eye size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <p className="text-sm text-muted">
              <span className="text-fg">Describe, don&apos;t show.</span> Never turn your screen around — you only escape by talking.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden />
            <p className="text-sm text-muted">Wrong answers cost a strike and time. Three strikes ends the run.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <p className="text-sm text-muted">Roles swap every stage — you&apos;ll both operate and advise.</p>
          </div>
        </Card>

        <Card className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="label-mono">Your stage 1 role</span>
            <span className="text-sm text-muted">{role === "operator" ? "You act on the controls." : "You hold the manual."}</span>
          </div>
          <RoleBadge role={role} />
        </Card>

        <p className="text-center text-xs text-faint">
          {you?.ready ? "You are ready." : "Tap Ready when you understand the mission."}
          {partner?.ready ? " Partner is ready." : " Partner not ready yet."}
        </p>
      </motion.div>
    </PhaseLayout>
  );
}
