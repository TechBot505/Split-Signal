import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/cn";
import { formatTimeLeft } from "@/lib/format";

export interface LeaderboardEntry {
  rank: number;
  names: string[];
  avatars: unknown[];
  timeLeftMs: number;
  strikes: number;
  hintsUsed: number;
  score: number;
}

function StrikeDots({ strikes }: { strikes: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${strikes} strikes`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-1.5 rounded-full", i < strikes ? "bg-fail" : "bg-faint/30")}
        />
      ))}
    </span>
  );
}

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  highlighted?: boolean;
}

/** One leaderboard line: rank, overlapped duo avatars, names, time, strikes, score. */
export function LeaderboardRow({ entry, highlighted }: LeaderboardRowProps) {
  const names = entry.names.length > 0 ? entry.names.join(" & ") : "Unknown duo";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-(--radius-card) p-3 hairline",
        highlighted ? "bg-accent/10 border-accent/40 glow-accent" : "bg-surface-1"
      )}
    >
      <span className="w-6 shrink-0 text-center font-mono text-sm text-muted">{entry.rank}</span>
      <div className="flex -space-x-2">
        {entry.avatars.slice(0, 2).map((a, i) => (
          <span key={i} className="rounded-full ring-1 ring-canvas">
            <Avatar config={a} size={28} />
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg">{names}</p>
        <div className="mt-1 flex items-center gap-2">
          <StrikeDots strikes={entry.strikes} />
          <span className="font-mono text-xs text-muted">{formatTimeLeft(entry.timeLeftMs)} left</span>
        </div>
      </div>
      <span className="shrink-0 text-right font-mono text-sm tabular-nums text-accent">
        {entry.score.toLocaleString()}
      </span>
    </div>
  );
}
