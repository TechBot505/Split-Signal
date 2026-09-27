"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Pencil, Play } from "lucide-react";
import { PageTitle } from "@/components/shell";
import { Button, Card, Spinner, toast } from "@/components/ui";
import { createRoom } from "@/lib/realtime";
import type { Mode } from "@/game/types";
import { dailyStreak, mergeRuns } from "@/lib/history";
import { useProfileStore } from "@/lib/store/profile";
import { useHistoryStore } from "@/lib/store/history";
import { useStoreHydrated } from "@/lib/store/useStoreHydrated";
import { RadarHero } from "./RadarHero";
import { ModeSheet } from "./ModeSheet";
import { JoinCard } from "./JoinCard";
import { DailyCard } from "./DailyCard";
import { RunRow } from "../RunRow";

const RECENT_LIMIT = 4;

export function PlayScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useProfileStore((s) => s.profile);
  const localRuns = useHistoryStore((s) => s.runs);
  const hydrated = useStoreHydrated();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [pending, setPending] = useState<Mode | null>(null);

  useEffect(() => {
    if (hydrated && (!profile || profile.name.trim().length === 0)) router.replace("/");
  }, [hydrated, profile, router]);

  const runs = useMemo(() => mergeRuns(localRuns, []), [localRuns]);
  const streak = useMemo(() => dailyStreak(runs, Date.now()), [runs]);
  const recent = runs.slice(0, RECENT_LIMIT);
  const initialCode = params.get("code") ?? "";

  if (!hydrated || !profile || profile.name.trim().length === 0) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner size={26} className="text-accent" />
      </div>
    );
  }

  const startRun = async (mode: Mode) => {
    if (pending) return;
    setPending(mode);
    try {
      const { code } = await createRoom(mode);
      router.push(`/room/${code}`);
    } catch {
      toast("Couldn't reach the station. Try again.", "fail");
      setPending(null);
      setSheetOpen(false);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Station online"
        title={`Hey ${profile.name}`}
        action={
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-xs text-muted hairline hover:text-fg"
          >
            <Pencil size={13} aria-hidden />
            Edit look
          </Link>
        }
      />

      <div className="flex flex-col gap-4">
        <Card className="flex flex-col items-center gap-4 py-6 text-center">
          <RadarHero />
          <div>
            <p className="text-lg text-display text-fg">Ready when you are</p>
            <p className="mt-1 text-sm text-muted">Two phones, one bunker. Grab a partner.</p>
          </div>
          <Button
            size="lg"
            fullWidth
            leftIcon={<Play size={18} />}
            loading={pending !== null && pending !== "daily"}
            onClick={() => setSheetOpen(true)}
          >
            Start a run
          </Button>
        </Card>

        <JoinCard initialCode={initialCode} />

        <DailyCard streak={streak} pending={pending === "daily"} onPlay={() => startRun("daily")} />

        {recent.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="label-mono">Recent runs</h2>
              <Link href="/history" className="text-xs text-accent hover:underline">
                View all
              </Link>
            </div>
            {recent.map((run) => (
              <RunRow key={run.id} run={run} myName={profile.name} />
            ))}
          </section>
        )}
      </div>

      <ModeSheet
        open={sheetOpen}
        onClose={() => !pending && setSheetOpen(false)}
        onSelect={startRun}
        pending={pending}
      />
    </>
  );
}
