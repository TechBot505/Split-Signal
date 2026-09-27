"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { dateKeyUTC } from "@/game/daily";
import { formatCountdown, formatDateKey, msUntilUtcReset } from "@/lib/format";

export interface DailyCardProps {
  streak: number;
  onPlay: () => void;
  pending: boolean;
}

/** Daily Bunker promo: date, live UTC-reset countdown, streak, play + leaderboard. */
export function DailyCard({ streak, onPlay, pending }: DailyCardProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateLabel = now === null ? "—" : formatDateKey(dateKeyUTC(now));
  const countdown = now === null ? "--:--:--" : formatCountdown(msUntilUtcReset(now));

  return (
    <Card className="scanline flex flex-col gap-4 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="label-mono text-accent">Daily Bunker</span>
          <p className="mt-1 text-sm text-fg">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 hairline">
          <Flame size={14} className={streak > 0 ? "text-warn" : "text-faint"} aria-hidden />
          <span className="font-mono text-xs text-fg">{streak}</span>
          <span className="label-mono">day{streak === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="label-mono">Resets in</span>
        <span className="font-mono text-lg tabular-nums text-fg" aria-live="off">
          {countdown}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button className="flex-1" loading={pending} onClick={onPlay}>
          Play daily
        </Button>
        <Link
          href="/daily"
          className="inline-flex min-h-11 items-center gap-1 rounded-(--radius-input) px-3 text-sm text-accent hover:bg-surface-2"
        >
          Leaderboard
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
