"use client";

import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { PUZZLES } from "@/game/puzzles";
import type { Difficulty } from "@/game/puzzles/types";
import { Segmented } from "@/components/ui";
import { PREVIEW_VIEWS } from "./views";

const DIFFS: Difficulty[] = [1, 2, 3, 4, 5];
const noop = () => {};

/** Dev-only gallery: renders each puzzle's A and B views side by side. */
export default function PuzzlePreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_DEV_PAGES !== "1") {
    notFound();
  }

  const ids = Object.keys(PREVIEW_VIEWS).filter((id) => PUZZLES[id]);
  const [id, setId] = useState(ids[0] ?? "wires");
  const [difficulty, setDifficulty] = useState<Difficulty>(2);

  const { A, B } = PREVIEW_VIEWS[id];
  const mod = PUZZLES[id];
  const state = useMemo(() => mod.generate("preview", difficulty), [mod, difficulty]);
  const viewA = useMemo(() => mod.viewA(state), [mod, state]);
  const viewB = useMemo(() => mod.viewB(state), [mod, state]);

  return (
    <main className="mx-auto flex w-full max-w-[1024px] flex-col gap-4 px-4 py-6">
      <h1 className="text-display text-2xl">Puzzle preview</h1>
      <Segmented
        ariaLabel="Puzzle"
        value={id}
        onChange={setId}
        options={ids.map((p) => ({ value: p, label: p }))}
      />
      <Segmented
        ariaLabel="Difficulty"
        value={String(difficulty)}
        onChange={(v) => setDifficulty(Number(v) as Difficulty)}
        options={DIFFS.map((d) => ({ value: String(d), label: `D${d}` }))}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-2">
          <span className="label-mono text-accent">Operator (A)</span>
          <div className="mx-auto w-full max-w-[480px]">
            <A view={viewA} role="A" canAct={mod.canAct(state, "A")} send={noop} />
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <span className="label-mono text-accent">Advisor (B)</span>
          <div className="mx-auto w-full max-w-[480px]">
            <B view={viewB} role="B" canAct={mod.canAct(state, "B")} send={noop} />
          </div>
        </section>
      </div>
    </main>
  );
}
