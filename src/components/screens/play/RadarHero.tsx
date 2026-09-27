"use client";

import { motion, useReducedMotion } from "motion/react";

/** Subtle mission-control radar / split-signal graphic (pure SVG). */
export function RadarHero() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 200 200" className="h-36 w-36" role="img" aria-label="Radar sweep">
      <defs>
        <radialGradient id="ss-radar-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3cf2d6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3cf2d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ss-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3cf2d6" stopOpacity="0" />
          <stop offset="100%" stopColor="#3cf2d6" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {[40, 62, 84].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(160,200,255,0.12)" strokeWidth="1" />
      ))}
      <line x1="16" y1="100" x2="184" y2="100" stroke="rgba(160,200,255,0.1)" strokeWidth="1" />
      <line x1="100" y1="16" x2="100" y2="184" stroke="rgba(160,200,255,0.1)" strokeWidth="1" />

      <motion.g
        style={{ originX: "100px", originY: "100px" }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: "linear" }}
      >
        <path d="M100 100 L100 16 A84 84 0 0 1 172 58 Z" fill="url(#ss-sweep)" />
        <line x1="100" y1="100" x2="100" y2="16" stroke="#3cf2d6" strokeWidth="1.5" strokeOpacity="0.8" />
      </motion.g>

      <circle cx="100" cy="100" r="84" fill="url(#ss-radar-fade)" opacity="0.4" />
      {!reduce && (
        <motion.circle
          cx="140"
          cy="72"
          r="3.5"
          fill="#3cf2d6"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, times: [0, 0.15, 1] }}
        />
      )}
      <circle cx="100" cy="100" r="3" fill="#3cf2d6" />
    </svg>
  );
}
