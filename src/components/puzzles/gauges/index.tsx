"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type {
  Band,
  Formula,
  GaugesAction,
  GaugesViewA,
  GaugesViewB,
} from "@/game/puzzles/gauges/types";
import { cn } from "@/lib/cn";
import { PartnerStrip, gaugeArc, gaugeXY } from "../_shared";
import type { PuzzleViewProps } from "../types";

const NOTCHES = Array.from({ length: 10 }, (_, i) => 9 - i); // 9..0 top→bottom

function Lever({
  index,
  value,
  disabled,
  onChange,
}: {
  index: number;
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  const H = 132;
  const pad = 12;
  const notchY = (v: number) => pad + ((9 - v) / 9) * (H - pad * 2);
  const set = (v: number) => onChange(Math.min(9, Math.max(0, v)));
  const fromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    set(Math.round((1 - (e.clientY - r.top) / r.height) * 9));
  };
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        aria-label={`Lever ${index + 1} up`}
        disabled={disabled || value >= 9}
        onClick={() => set(value + 1)}
        className="!h-11 w-full !px-0"
      >
        <ChevronUp size={16} aria-hidden />
      </Button>
      <svg
        viewBox={`0 0 40 ${H}`}
        className="w-full touch-none"
        style={{ height: H }}
        onPointerDown={fromPointer}
        role="slider"
        aria-label={`Lever ${index + 1}`}
        aria-valuemin={0}
        aria-valuemax={9}
        aria-valuenow={value}
      >
        <line x1={20} y1={pad} x2={20} y2={H - pad} className="stroke-hairline" strokeWidth={2} />
        {NOTCHES.map((v) => (
          <line
            key={v}
            x1={13}
            x2={27}
            y1={notchY(v)}
            y2={notchY(v)}
            className="stroke-hairline"
            strokeWidth={1}
          />
        ))}
        <rect
          x={6}
          y={notchY(value) - 9}
          width={28}
          height={18}
          rx={5}
          className="fill-[var(--color-surface-2)] stroke-accent"
          strokeWidth={1.5}
        />
        <line
          x1={12}
          x2={28}
          y1={notchY(value)}
          y2={notchY(value)}
          className="stroke-accent"
          strokeWidth={2}
        />
      </svg>
      <span className="font-mono text-sm text-accent">{value}</span>
      <Button
        variant="secondary"
        size="sm"
        aria-label={`Lever ${index + 1} down`}
        disabled={disabled || value <= 0}
        onClick={() => set(value - 1)}
        className="!h-11 w-full !px-0"
      >
        <ChevronDown size={16} aria-hidden />
      </Button>
      <span className="label-mono">L{index + 1}</span>
    </div>
  );
}

export function GaugesA({ view, canAct, send, disabled }: PuzzleViewProps<GaugesViewA, GaugesAction>) {
  const locked = !canAct || !!disabled;
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex gap-2">
        {view.levers.slice(0, view.numLevers).map((v, i) => (
          <Lever
            key={i}
            index={i}
            value={v}
            disabled={locked}
            onChange={(nv) => send({ type: "set", lever: i, value: nv })}
          />
        ))}
      </Card>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={locked}
        onClick={() => send({ type: "engage" })}
      >
        ENGAGE
      </Button>
    </div>
  );
}

function formulaText(f: Formula, g: number): string {
  const terms = f.coef
    .map((c, i) => (c === 0 ? "" : `${c === 1 ? "" : `${c}×`}L${i + 1}`))
    .filter(Boolean);
  if (f.c0) terms.push(String(f.c0));
  return `G${g + 1} = ${terms.join(" + ")}`;
}

function Dial({ formula, band, g }: { formula: Formula; band: Band; g: number }) {
  const min = formula.c0;
  const max = formula.c0 + formula.coef.reduce((a, c) => a + c * 9, 0);
  const span = Math.max(1, max - min);
  const t0 = Math.max(0, Math.min(1, (band[0] - min) / span));
  const t1 = Math.max(0, Math.min(1, (band[1] - min) / span));
  const [lx, ly] = gaugeXY(50, 52, 40, t0);
  const [hx, hy] = gaugeXY(50, 52, 40, t1);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 64" className="w-full">
        <path d={gaugeArc(50, 52, 40, 0, 1)} className="fill-none stroke-hairline" strokeWidth={6} />
        <path
          d={gaugeArc(50, 52, 40, t0, t1)}
          className="fill-none stroke-accent"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle cx={lx} cy={ly} r={2.5} className="fill-accent" />
        <circle cx={hx} cy={hy} r={2.5} className="fill-accent" />
      </svg>
      <span className="font-mono text-xs text-accent">
        {band[0]}–{band[1]}
      </span>
      <span className="label-mono mt-0.5">G{g + 1}</span>
    </div>
  );
}

export function GaugesB({ view }: PuzzleViewProps<GaugesViewB, GaugesAction>) {
  return (
    <div className="flex flex-col gap-4">
      <PartnerStrip />
      <Card className="grid grid-cols-3 gap-2">
        {view.formulas.map((f, g) => (
          <Dial key={g} formula={f} band={view.bands[g]} g={g} />
        ))}
      </Card>
      <Card inset className="flex flex-col gap-1.5">
        <span className="label-mono">Reactor manual</span>
        {view.formulas.map((f, g) => (
          <code key={g} className={cn("font-mono text-sm text-fg")}>
            {formulaText(f, g)}
          </code>
        ))}
      </Card>
    </div>
  );
}
