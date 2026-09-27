"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Wire } from "@/game/puzzles/wires/types";
import { STRIPE_HEX, WIRE_HEX } from "./colors";

export interface WireRowProps {
  wire: Wire;
  index: number;
  cut: boolean;
}

/** A single glossy horizontal wire with LED port, optional stripe, snip halves. */
export function WireRow({ wire, index, cut }: WireRowProps) {
  const reduce = useReducedMotion();
  const body = WIRE_HEX[wire.color];
  const shift = reduce ? 0 : 26;
  return (
    <svg viewBox="0 0 300 40" className="h-10 w-full" role="img" aria-label={`Wire ${index + 1}`}>
      {/* port plate + LED */}
      <rect x="2" y="10" width="30" height="20" rx="4" className="fill-surface-2" />
      <circle cx="17" cy="20" r="4" fill={wire.led ? "#3CF2D6" : "#1c2530"} />
      {wire.led && <circle cx="17" cy="20" r="7" fill="none" stroke="#3CF2D6" strokeOpacity="0.4" />}
      <rect x="268" y="10" width="30" height="20" rx="4" className="fill-surface-2" />
      {/* left half */}
      <motion.g animate={{ x: cut ? -shift : 0 }} transition={{ type: "spring", stiffness: 320, damping: 22 }}>
        <line x1="32" y1="20" x2={cut ? 150 : 268} y2="20" stroke={body} strokeWidth="9" strokeLinecap="round" />
        <line x1="32" y1="17" x2={cut ? 150 : 268} y2="17" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
        {wire.striped && (
          <line x1="40" y1="20" x2={cut ? 148 : 262} y2="20" stroke={STRIPE_HEX[wire.color]} strokeWidth="9" strokeDasharray="3 10" />
        )}
      </motion.g>
      {/* right half (only distinct once cut) */}
      {cut && (
        <motion.g animate={{ x: shift }} transition={{ type: "spring", stiffness: 320, damping: 22 }}>
          <line x1="150" y1="20" x2="268" y2="20" stroke={body} strokeWidth="9" strokeLinecap="round" />
          <line x1="150" y1="17" x2="268" y2="17" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
          {wire.striped && (
            <line x1="156" y1="20" x2="262" y2="20" stroke={STRIPE_HEX[wire.color]} strokeWidth="9" strokeDasharray="3 10" />
          )}
        </motion.g>
      )}
      {/* sparks */}
      {cut && !reduce && (
        <motion.g initial={{ opacity: 1, scale: 0.4 }} animate={{ opacity: 0, scale: 1.6 }} transition={{ duration: 0.5 }}>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={150} cy={20} r="2" fill="#FFB547" transform={`translate(${(i - 1.5) * 6} ${(i % 2 ? -1 : 1) * 6})`} />
          ))}
        </motion.g>
      )}
    </svg>
  );
}
