"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Share2, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button, Card, Spinner, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatTimeLeft, modeLabel } from "@/lib/format";
import { partnerName, type HistoryRun } from "@/lib/history";
import { shareText } from "@/lib/share";
import { useProfileStore } from "@/lib/store/profile";
import { useMergedHistory } from "./useMergedHistory";

function buildShare(run: HistoryRun): string {
  const outcome = run.escaped ? "Escaped" : "Couldn't escape";
  const left = run.escaped ? ` with ${formatTimeLeft(run.timeLeftMs)} left` : "";
  return `${outcome} a ${modeLabel(run.mode)} bunker on Split Signal — ${run.stagesCleared}/${run.total} stages${left}. Two phones, one escape.`;
}

/** Row of per-stage outcome pills. Splits aren't stored locally, so this shows
 *  cleared-vs-not from stagesCleared/total (stated assumption). */
function StageSplits({ run }: { run: HistoryRun }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Stage results">
      {Array.from({ length: run.total }, (_, i) => {
        const cleared = i < run.stagesCleared;
        return (
          <span
            key={i}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center gap-1 rounded-(--radius-input) px-2 font-mono text-xs hairline",
              cleared ? "bg-accent/12 text-accent border-accent/30" : "bg-surface-2 text-faint",
            )}
          >
            {i + 1}
            {cleared ? <Check size={12} aria-hidden /> : <X size={12} aria-hidden />}
          </span>
        );
      })}
    </div>
  );
}

export function RunDetailScreen({ id }: { id: string }) {
  const { runs, loadingCloud } = useMergedHistory();
  const myName = useProfileStore((s) => s.profile?.name);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const run = useMemo(() => runs.find((r) => r.id === id), [runs, id]);

  if (!mounted || (loadingCloud && !run)) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  if (!run) {
    return (
      <Card className="text-center">
        <p className="text-sm text-fg">Run not found.</p>
        <Link href="/history" className="mt-2 inline-block text-xs text-accent hover:underline">
          Back to history
        </Link>
      </Card>
    );
  }

  const partner = partnerName(run, myName);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/history"
        className="inline-flex min-h-9 items-center gap-1.5 self-start text-sm text-muted hover:text-fg"
      >
        <ArrowLeft size={16} aria-hidden />
        History
      </Link>

      <Card className={cn("scanline overflow-hidden text-center", run.escaped ? "glow-accent" : "")}>
        <p className={cn("text-2xl text-display tracking-tight", run.escaped ? "text-accent" : "text-fail")}>
          {run.escaped ? "ESCAPED" : "SIGNAL LOST"}
        </p>
        <p className="mt-1 label-mono">{modeLabel(run.mode)} bunker</p>
      </Card>

      <Card className="grid grid-cols-3 gap-2">
        <Stat label="Time left" value={formatTimeLeft(run.timeLeftMs)} tone="accent" />
        <Stat label="Score" value={run.score.toLocaleString()} />
        <Stat label="Strikes" value={run.strikes} tone={run.strikes > 0 ? "fail" : "default"} />
        <Stat label="Stages" value={`${run.stagesCleared}/${run.total}`} />
        <Stat label="Hints" value={run.hintsUsed} />
        <Stat label="Code" value={run.code} />
      </Card>

      <section className="flex flex-col gap-2">
        <span className="label-mono">Per stage</span>
        <StageSplits run={run} />
      </section>

      <Card className="flex items-center gap-3">
        {run.players.map((p) => (
          <span key={p.seat} className="flex items-center gap-2">
            <Avatar config={p.avatar} size={32} title={p.name} />
            <span className="text-sm text-fg">{p.isYou ? "You" : p.name}</span>
          </span>
        ))}
        {run.players.length < 2 && <span className="text-sm text-muted">with {partner}</span>}
      </Card>

      <Button
        variant="secondary"
        fullWidth
        leftIcon={<Share2 size={16} />}
        onClick={() => void shareText(buildShare(run))}
      >
        Share result
      </Button>
    </div>
  );
}
