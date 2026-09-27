import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Card, Chip } from "@/components/ui";
import { formatTimeLeft, modeLabel } from "@/lib/format";
import { partnerName, type HistoryRun } from "@/lib/history";

export interface RunRowProps {
  run: HistoryRun;
  myName?: string;
}

/** One tappable run summary row → /history/[id]. Shared by hub + history list. */
export function RunRow({ run, myName }: RunRowProps) {
  const partner = partnerName(run, myName);
  const avatars = run.players.slice(0, 2);
  return (
    <Link href={`/history/${run.id}`} className="block">
      <Card interactive inset className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {avatars.map((p) => (
            <span key={p.seat} className="rounded-full ring-1 ring-canvas">
              <Avatar config={p.avatar} size={28} title={p.name} />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Chip tone={run.escaped ? "accent" : "fail"} size="sm">
              {run.escaped ? "ESCAPED" : "LOST"}
            </Chip>
            <span className="label-mono">{modeLabel(run.mode)}</span>
          </div>
          <p className="mt-1 truncate text-xs text-muted">with {partner}</p>
        </div>
        <div className="text-right">
          <span className="label-mono">Time left</span>
          <p className="font-mono text-sm tabular-nums text-fg">{formatTimeLeft(run.timeLeftMs)}</p>
        </div>
      </Card>
    </Link>
  );
}
