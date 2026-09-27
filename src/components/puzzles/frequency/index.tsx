"use client";

import { Minus, Plus } from "lucide-react";
import { Button, Card, IconButton } from "@/components/ui";
import type {
  FrequencyAction,
  FrequencySettings,
  FrequencyViewA,
  FrequencyViewB,
  Knob,
} from "@/game/puzzles/frequency/types";
import { cn } from "@/lib/cn";
import type { PuzzleViewProps } from "../types";

const W = 288;
const H = 96;

/** Sine-ish trace from waveform params. */
function wavePath(s: FrequencySettings): string {
  const mid = H / 2;
  const amp = (s.amplitude / 5) * (mid - 8);
  const phase = (s.phase * Math.PI) / 2;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 3) {
    const y = mid - amp * Math.sin((2 * Math.PI * s.frequency * x) / W + phase);
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function Scope({ settings, label }: { settings: FrequencySettings; label: string }) {
  return (
    <div className="scanline overflow-hidden rounded-(--radius-card) bg-canvas hairline">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${label} waveform`}>
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} className="stroke-hairline" strokeWidth={1} />
        <path
          d={wavePath(settings)}
          className="fill-none stroke-accent"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }}
        />
      </svg>
    </div>
  );
}

function KnobDial({
  knob,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  knob: Knob;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  const frac = (value - min) / Math.max(1, max - min);
  const deg = -135 + frac * 270;
  const step = (d: number) => {
    const nv = value + d;
    if (nv >= min && nv <= max) onChange(nv);
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="label-mono">{knob}</span>
      <svg viewBox="0 0 64 64" className="h-16 w-16">
        <circle cx={32} cy={32} r={26} className="fill-[var(--color-surface-2)] stroke-hairline" strokeWidth={2} />
        <g transform={`rotate(${deg} 32 32)`}>
          <line x1={32} y1={32} x2={32} y2={12} className="stroke-accent" strokeWidth={3} strokeLinecap="round" />
        </g>
        <circle cx={32} cy={32} r={3} className="fill-accent" />
      </svg>
      <span className="font-mono text-sm text-accent">{value}</span>
      <div className="flex gap-1.5">
        <IconButton
          label={`${knob} down`}
          tone="ghost"
          className="!h-11 !w-11"
          onClick={() => step(-1)}
          disabled={disabled || value <= min}
        >
          <Minus size={16} aria-hidden />
        </IconButton>
        <IconButton
          label={`${knob} up`}
          tone="ghost"
          className="!h-11 !w-11"
          onClick={() => step(1)}
          disabled={disabled || value >= max}
        >
          <Plus size={16} aria-hidden />
        </IconButton>
      </div>
    </div>
  );
}

export function FrequencyA({ view, canAct, send, disabled }: PuzzleViewProps<FrequencyViewA, FrequencyAction>) {
  const locked = !canAct || !!disabled;
  return (
    <div className="flex flex-col gap-4">
      <Scope settings={view.current} label="Live" />
      <Card className="flex justify-around gap-2">
        {view.knobs.map((k) => (
          <KnobDial
            key={k}
            knob={k}
            value={view.current[k]}
            min={view.ranges[k][0]}
            max={view.ranges[k][1]}
            disabled={locked}
            onChange={(v) => send({ type: "set", knob: k, value: v })}
          />
        ))}
      </Card>
      <p className="text-xs text-muted">Tune each knob to match your partner&apos;s description; they lock the signal.</p>
    </div>
  );
}

export function FrequencyB({ view, canAct, send, disabled }: PuzzleViewProps<FrequencyViewB, FrequencyAction>) {
  const locked = !canAct || !!disabled;
  return (
    <div className="flex flex-col gap-4">
      {view.target ? (
        <Scope settings={view.target} label="Target" />
      ) : (
        <Card inset className="flex flex-col gap-1.5">
          <span className="label-mono">Target signal</span>
          <ul className="flex flex-col gap-1">
            {(view.description ?? []).map((d, i) => (
              <li key={i} className={cn("font-mono text-sm text-fg")}>
                • {d}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Button variant="primary" size="lg" fullWidth disabled={locked} onClick={() => send({ type: "confirm" })}>
        CONFIRM LOCK
      </Button>
    </div>
  );
}
