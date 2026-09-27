"use client";

import { useCallback, useEffect, useState } from "react";
import { HISTORY_REFRESH_EVENT } from "@/components/auth/CloudSync";
import { mergeRuns, type CloudRun, type HistoryRun } from "@/lib/history";
import { useAuthStore } from "@/lib/store/auth";
import { useHistoryStore } from "@/lib/store/history";

export interface MergedHistory {
  runs: HistoryRun[];
  /** True while a cloud fetch is in flight (local data still renders). */
  loadingCloud: boolean;
}

/**
 * Local run history merged with the signed-in user's cloud runs. Cloud is fetched
 * ONLY when auth is loaded and signed in (guest stays fully local), and refetched
 * whenever CloudSync signals a refresh.
 */
export function useMergedHistory(): MergedHistory {
  const localRuns = useHistoryStore((s) => s.runs);
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  const [cloud, setCloud] = useState<CloudRun[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);

  const fetchCloud = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setCloud([]);
      return;
    }
    setLoadingCloud(true);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) return;
      const body = (await res.json()) as { data?: { runs?: CloudRun[] } };
      setCloud(body.data?.runs ?? []);
    } catch {
      /* best-effort: local history still shows */
    } finally {
      setLoadingCloud(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    void fetchCloud();
    const onRefresh = () => void fetchCloud();
    window.addEventListener(HISTORY_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(HISTORY_REFRESH_EVENT, onRefresh);
  }, [fetchCloud]);

  return { runs: mergeRuns(localRuns, cloud), loadingCloud };
}
