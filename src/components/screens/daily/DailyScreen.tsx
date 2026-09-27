"use client";

import { useEffect, useMemo, useState } from "react";
import { RadarLoader } from "@/components/hud";
import { Card } from "@/components/ui";
import { dateKeyUTC } from "@/game/daily";
import { useHistoryStore } from "@/lib/store/history";
import { DateSwitcher } from "./DateSwitcher";
import { LeaderboardRow, type LeaderboardEntry } from "./LeaderboardRow";
import { LocalResultCard } from "./LocalResultCard";

const DAY_MS = 86_400_000;

type Status = "loading" | "ok" | "disabled" | "error";

interface DailyData {
  attempts: number;
  entries: LeaderboardEntry[];
}

function sameDuo(a: string[], b: string[]): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  const setB = new Set(b);
  return a.every((n) => setB.has(n));
}

export function DailyScreen() {
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<DailyData | null>(null);

  const localRuns = useHistoryStore((s) => s.runs);

  const dateKey = useMemo(() => dateKeyUTC(Date.now() - offset * DAY_MS), [offset]);
  const localRun = useMemo(
    () => localRuns.find((r) => r.dailyKey === dateKey),
    [localRuns, dateKey],
  );
  const myDuo = useMemo(
    () => (localRun ? localRun.players.map((p) => p.name) : []),
    [localRun],
  );

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setData(null);
    (async () => {
      try {
        const res = await fetch(`/api/daily?date=${dateKey}`);
        if (!active) return;
        if (res.status === 503) return setStatus("disabled");
        if (!res.ok) return setStatus("error");
        const body = (await res.json()) as { data?: DailyData };
        if (!active) return;
        setData(body.data ?? { attempts: 0, entries: [] });
        setStatus("ok");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [dateKey]);

  return (
    <>
      <DateSwitcher offset={offset} dateKey={dateKey} onChange={setOffset} />

      {localRun && <LocalResultCard run={localRun} className="mb-4" />}

      {status === "loading" && <LoadingSkeleton />}

      {status === "disabled" && (
        <Card className="text-center">
          <p className="text-sm text-fg">Leaderboards light up once the station is online.</p>
          {!localRun && (
            <p className="mt-1 text-xs text-muted">Your daily results are saved on this device.</p>
          )}
        </Card>
      )}

      {status === "error" && (
        <Card className="text-center text-sm text-muted">
          Couldn&apos;t load the leaderboard. Check your connection and try again.
        </Card>
      )}

      {status === "ok" && data && data.entries.length === 0 && (
        <Card className="text-center text-sm text-muted">
          {offset === 0
            ? "No duo has escaped yet today. Be the first."
            : "No duo escaped on this day."}
        </Card>
      )}

      {status === "ok" && data && data.entries.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="label-mono">Top escapes</span>
            <span className="label-mono">{data.attempts} attempts</span>
          </div>
          {data.entries.map((entry) => (
            <LeaderboardRow
              key={entry.rank}
              entry={entry}
              highlighted={sameDuo(entry.names, myDuo)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <RadarLoader label="Scanning the station…" />
    </div>
  );
}
