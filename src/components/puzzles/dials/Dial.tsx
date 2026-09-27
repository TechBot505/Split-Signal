"use client";

import { Minus, Plus } from "lucide-react";
import { useRef } from "react";
import { IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { haptic } from "../shared";

const POSITIONS = 8;
const STEP = 360 / POSITIONS;

export interface DialProps {
  index: number;
  position: number;
  active: boolean;
  onRotate: (dir: 1 | -1) => void;
}

/** One rotary dial: 8 ticks, a pointer, +/− buttons and drag-to-rotate. */
export function Dial({ index, position, active, onRotate }: DialProps) {
  const accum = useRef(0);
  const last = useRef<number | null>(null);

  function angleAt(e: React.PointerEvent<SVGSVGElement>): number {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * (180 / Math.PI);
  }
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!active || last.current === null) return;
    const a = angleAt(e);
    let d = a - last.current;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    accum.current += d;
    last.current = a;
    while (accum.current >= STEP) { accum.current -= STEP; onRotate(1); haptic(8); }
    while (accum.current <= -STEP) { accum.current += STEP; onRotate(-1); haptic(8); }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="label-mono">Dial {index + 1}</span>
      <svg
        viewBox="0 0 100 100"
        className={cn("h-24 w-24 touch-none select-none", active ? "cursor-grab active:cursor-grabbing" : "opacity-80")}
        onPointerDown={(e) => { if (!active) return; e.currentTarget.setPointerCapture(e.pointerId); last.current = angleAt(e); }}
        onPointerMove={onMove}
        onPointerUp={() => { last.current = null; }}
        role="img"
        aria-label={`Dial ${index + 1} at position ${position + 1} of ${POSITIONS}`}
      >
        <circle cx="50" cy="50" r="46" className="fill-surface-2 stroke-hairline" />
        {Array.from({ length: POSITIONS }, (_, i) => {
          const rad = (i * STEP - 90) * (Math.PI / 180);
          const x1 = 50 + 40 * Math.cos(rad), y1 = 50 + 40 * Math.sin(rad);
          const x2 = 50 + 44 * Math.cos(rad), y2 = 50 + 44 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={i === position ? "stroke-accent" : "stroke-faint"} strokeWidth="2" strokeLinecap="round" />;
        })}
        <g transform={`rotate(${position * STEP} 50 50)`}>
          <line x1="50" y1="50" x2="50" y2="16" stroke="#3CF2D6" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="16" r="3" fill="#3CF2D6" />
        </g>
        <circle cx="50" cy="50" r="5" className="fill-surface-1 stroke-hairline" />
      </svg>
      <div className="flex items-center gap-2">
        <IconButton label={`Rotate dial ${index + 1} counter-clockwise`} onClick={() => { onRotate(-1); haptic(10); }} disabled={!active}>
          <Minus className="h-4 w-4" />
        </IconButton>
        <span className="w-6 text-center font-mono text-sm text-fg">{position + 1}</span>
        <IconButton label={`Rotate dial ${index + 1} clockwise`} onClick={() => { onRotate(1); haptic(10); }} disabled={!active}>
          <Plus className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
