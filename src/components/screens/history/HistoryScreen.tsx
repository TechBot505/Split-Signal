"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, Spinner, Stat } from "@/components/ui";
import { computeStats } from "@/lib/history";
import { formatTimeLeft } from "@/lib/format";
import { useProfileStore } from "@/lib/store/profile";
import { RunRow } from "../RunRow";
import { useMergedHistory } from "./useMergedHistory";

export function HistoryScreen() {
  const { runs, loadingCloud } = useMergedHistory();
  const myName = useProfileStore((s) => s.profile?.name);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = useMemo(() => computeStats(runs), [runs]);

  if (!mounted) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="grid grid-cols-4 gap-2">
        <Stat label="Runs" value={stats.runs} />
        <Stat label="Escapes" value={stats.escapes} tone="accent" />
        <Stat label="Rate" value={`${stats.escapeRate}%`} />
        <Stat
          label="Best left"
          value={stats.bestTimeLeftMs === null ? "—" : formatTimeLeft(stats.bestTimeLeftMs)}
        />
      </Card>

      {runs.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-fg">No runs yet.</p>
          <p className="mt-1 text-xs text-muted">
            Your bunker attempts will appear here.{" "}
            <Link href="/play" className="text-accent hover:underline">
              Start one →
            </Link>
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="label-mono">All runs</span>
            {loadingCloud && <Spinner size={14} className="text-muted" />}
          </div>
          {runs.map((run) => (
            <RunRow key={run.id} run={run} myName={myName} />
          ))}
        </div>
      )}
    </div>
  );
}
