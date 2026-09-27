"use client";

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const N = 26;

export interface CaesarWheelProps {
  shift: number;
  dir: 1 | -1;
}

/**
 * Alphabet wheel: outer ring = the letters A reads (ciphertext); inner ring =
 * the decoded letter directly beneath it. Rotating by the shift lines them up.
 */
export function CaesarWheel({ shift, dir }: CaesarWheelProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="h-44 w-44" aria-label={`Caesar wheel, shift ${shift}`}>
        <circle cx="50" cy="50" r="48" className="fill-surface-2 stroke-hairline" />
        <circle cx="50" cy="50" r="30" className="fill-surface-1 stroke-hairline" />
        {A.split("").map((_, p) => {
          const ang = (p * (360 / N) - 90) * (Math.PI / 180);
          const cipher = A[p];
          const plain = A[(p - shift * dir + N * 2) % N];
          const ox = 50 + 40 * Math.cos(ang), oy = 50 + 40 * Math.sin(ang);
          const ix = 50 + 22 * Math.cos(ang), iy = 50 + 22 * Math.sin(ang);
          return (
            <g key={p}>
              <text x={ox} y={oy + 1.6} textAnchor="middle" className="fill-muted" style={{ fontSize: 4.6, fontFamily: "var(--font-mono)" }}>{cipher}</text>
              <text x={ix} y={iy + 1.6} textAnchor="middle" className="fill-accent" style={{ fontSize: 4.6, fontFamily: "var(--font-mono)" }}>{plain}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-2">
        <span className="label-mono">Shift</span>
        <span className="font-mono text-lg text-accent">{dir === 1 ? "+" : "−"}{shift}</span>
        <span className="text-xs text-muted">({dir === 1 ? "forward" : "back"})</span>
      </div>
    </div>
  );
}
