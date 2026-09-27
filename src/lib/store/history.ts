import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RunSummary } from "./types";

const HISTORY_CAP = 50;

interface HistoryState {
  runs: RunSummary[];
  /** Prepend a finished run; de-dupes by id and keeps the last 50. */
  addRun: (summary: RunSummary) => void;
  getRun: (id: string) => RunSummary | undefined;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      runs: [],
      addRun: (summary) => {
        const rest = get().runs.filter((r) => r.id !== summary.id);
        set({ runs: [summary, ...rest].slice(0, HISTORY_CAP) });
      },
      getRun: (id) => get().runs.find((r) => r.id === id),
      clear: () => set({ runs: [] }),
    }),
    { name: "ss:history", skipHydration: true },
  ),
);
