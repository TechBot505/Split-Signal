"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Button, Card, Chip } from "@/components/ui";
import type {
  MorseAction,
  MorseToken,
  MorseViewA,
  MorseViewB,
  Speed,
} from "@/game/puzzles/morse/types";
import { cn } from "@/lib/cn";
import { PartnerStrip } from "../_shared";
import type { PuzzleViewProps } from "../types";

const SPEED_FACTOR: Record<Speed, number> = { slow: 1.4, medium: 1, fast: 0.75 };

interface Step {
  on: boolean;
  ms: number;
}

function buildSteps(timing: MorseToken[], f: number): Step[] {
  const steps: Step[] = [];
  timing.forEach((tok, i) => {
    if (tok === "dot" || tok === "dash") {
      steps.push({ on: true, ms: (tok === "dot" ? 220 : 660) * f });
      const next = timing[i + 1];
      if (next !== "gap" && next !== "wordgap") steps.push({ on: false, ms: 220 * f });
    } else {
      steps.push({ on: false, ms: (tok === "gap" ? 660 : 1540) * f });
    }
  });
  steps.push({ on: false, ms: 1540 * f }); // rest before the pattern loops
  return steps;
}

function Lamp({ timing, speed }: { timing: MorseToken[]; speed: Speed | null }) {
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(false);
  const [tick, setTick] = useState(0); // bump to restart playback
  const timer = useRef<number | undefined>(undefined);

  const play = useCallback(() => {
    if (reduce) return;
    window.clearTimeout(timer.current);
    const steps = buildSteps(timing, speed ? SPEED_FACTOR[speed] : 1);
    let i = 0;
    const run = () => {
      const step = steps[i % steps.length];
      setLit(step.on);
      timer.current = window.setTimeout(() => {
        i += 1;
        run();
      }, step.ms);
    };
    run();
  }, [timing, speed, reduce]);

  useEffect(() => {
    play();
    return () => window.clearTimeout(timer.current);
  }, [play, tick]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "flex h-28 w-28 items-center justify-center rounded-full transition-all duration-100",
          lit ? "bg-accent shadow-[0_0_40px_-4px_var(--color-accent)]" : "bg-surface-2 hairline",
        )}
        role="img"
        aria-label="Signal lamp"
      >
        {reduce && (
          <span className="px-4 text-center font-mono text-sm text-fg">
            {timing.map((t) => (t === "dot" ? "·" : t === "dash" ? "–" : " / ")).join("")}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={14} />} onClick={() => setTick((t) => t + 1)}>
          Replay
        </Button>
        {speed && <Chip tone="warn" size="sm">{speed}</Chip>}
      </div>
    </div>
  );
}

function Scratchpad() {
  const [buf, setBuf] = useState("");
  const add = (s: string) => setBuf((b) => (b + s).slice(0, 60));
  return (
    <Card inset className="flex flex-col gap-2">
      <span className="label-mono">Scratchpad (local)</span>
      <div className="min-h-8 break-all rounded-(--radius-input) bg-surface-2 px-2 py-1.5 font-mono text-lg text-fg">
        {buf || <span className="text-faint">· –</span>}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => add("·")}>·</Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => add("–")}>–</Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => add(" ")}>gap</Button>
        <Button variant="ghost" size="sm" onClick={() => setBuf("")}>Clear</Button>
      </div>
    </Card>
  );
}

export function MorseA({ view }: PuzzleViewProps<MorseViewA, MorseAction>) {
  return (
    <div className="flex flex-col gap-4">
      <PartnerStrip />
      <Card className="flex flex-col items-center gap-3">
        <Lamp timing={view.timing} speed={view.speed} />
        <span className="label-mono">{view.length} letters</span>
      </Card>
      <Scratchpad />
    </div>
  );
}

export function MorseB({ view, canAct, send, disabled }: PuzzleViewProps<MorseViewB, MorseAction>) {
  const locked = !canAct || !!disabled;
  const letters = Object.keys(view.chart);
  return (
    <div className="flex flex-col gap-4">
      <Card inset>
        <span className="label-mono">Morse chart</span>
        <div className="mt-2 grid grid-cols-4 gap-x-2 gap-y-1 sm:grid-cols-6">
          {letters.map((ch) => (
            <div key={ch} className="flex items-baseline gap-1">
              <span className="font-display text-sm text-fg">{ch}</span>
              <span className="font-mono text-xs text-muted">{view.chart[ch].replace(/\./g, "·").replace(/-/g, "–")}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card inset className="flex flex-col gap-1.5">
        <span className="label-mono">Frequencies</span>
        {view.candidates.map((c, i) => (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => send({ type: "tune", index: i })}
            className={cn(
              "flex min-h-11 items-center justify-between rounded-(--radius-input) px-3 text-left transition-colors",
              view.tuned === i ? "bg-accent/12 text-accent glow-accent" : "bg-surface-2 text-fg hairline",
              locked && "opacity-50",
            )}
          >
            <span className="font-display text-sm">{c.word}</span>
            <span className="font-mono text-xs">{c.frequency}</span>
          </button>
        ))}
      </Card>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={locked || view.tuned < 0}
        onClick={() => send({ type: "transmit" })}
      >
        TRANSMIT
      </Button>
    </div>
  );
}
