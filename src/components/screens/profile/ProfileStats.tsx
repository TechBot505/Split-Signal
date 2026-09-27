"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Spinner, Stat } from "@/components/ui";
import { formatTimeLeft } from "@/lib/format";
import { computeStats, mergeRuns } from "@/lib/history";
import { useAuthStore } from "@/lib/store/auth";
import { useHistoryStore } from "@/lib/store/history";

interface CloudStats {
  runs: number;
  escapes: number;
  escapeRate: number;
  bestDailyScore: number;
  avgTimeLeftMs: number;
  fastestEscapeMs: number | null;
}

/** Lifetime stats: cloud aggregate when signed in, else derived from local runs. */
export function ProfileStats() {
  const localRuns = useHistoryStore((s) => s.runs);
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  const [cloud, setCloud] = useState<CloudStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setCloud(null);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok || !active) return;
        const body = (await res.json()) as { data?: { stats?: CloudStats } };
        if (active && body.data?.stats) setCloud(body.data.stats);
      } catch {
        /* fall back to local */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

  const local = useMemo(() => computeStats(mergeRuns(localRuns, [])), [localRuns]);

  const runs = cloud?.runs ?? local.runs;
  const escapes = cloud?.escapes ?? local.escapes;
  const rate = cloud?.escapeRate ?? local.escapeRate;
  const bestLeft =
    cloud !== null ? cloud.avgTimeLeftMs || null : local.bestTimeLeftMs;
  const bestLabel = cloud !== null ? "Avg left" : "Best left";

  return (
    <Card className="grid grid-cols-4 gap-2">
      <Stat label="Runs" value={runs} />
      <Stat label="Escapes" value={escapes} tone="accent" />
      <Stat label="Rate" value={`${rate}%`} />
      <Stat
        label={bestLabel}
        value={bestLeft === null ? (loading ? <Spinner size={14} /> : "—") : formatTimeLeft(bestLeft)}
      />
    </Card>
  );
}
