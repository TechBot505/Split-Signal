import { Card, Chip, Stat } from "@/components/ui";
import { formatTimeLeft } from "@/lib/format";
import { partnerName, type HistoryRun } from "@/lib/history";
import type { RunSummary } from "@/lib/store/types";

function toHistoryRun(r: RunSummary): HistoryRun {
  return { ...r, dailyKey: r.dailyKey, players: r.players.map((p) => ({ ...p })) };
}

/** Your own daily attempt, surfaced above the leaderboard (works offline too). */
export function LocalResultCard({ run, className }: { run: RunSummary; className?: string }) {
  const h = toHistoryRun(run);
  return (
    <Card className={className}>
      <div className="mb-3 flex items-center justify-between">
        <span className="label-mono text-accent">Your run</span>
        <Chip tone={run.escaped ? "accent" : "fail"} size="sm">
          {run.escaped ? "ESCAPED" : "LOST"}
        </Chip>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Time left" value={formatTimeLeft(run.timeLeftMs)} tone="accent" />
        <Stat label="Score" value={run.score.toLocaleString()} />
        <Stat label="Strikes" value={run.strikes} tone={run.strikes > 0 ? "fail" : "default"} />
      </div>
      <p className="mt-3 text-xs text-muted">with {partnerName(h)}</p>
    </Card>
  );
}
