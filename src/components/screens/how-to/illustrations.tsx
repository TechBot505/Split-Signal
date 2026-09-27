import type { ComponentType } from "react";

/** Tiny inline SVGs for the four how-to-play steps. Pure code, accent-tinted. */

const base = "h-full w-full";
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const SplitScreenIcon: ComponentType = () => (
  <svg viewBox="0 0 48 48" className={base} aria-hidden role="img">
    <rect x="6" y="10" width="15" height="28" rx="3" {...stroke} />
    <rect x="27" y="10" width="15" height="28" rx="3" {...stroke} />
    <path d="M24 6v36" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />
    <path d="M10 18h7M10 24h7M31 18h7M31 30h7" {...stroke} />
  </svg>
);

export const TalkIcon: ComponentType = () => (
  <svg viewBox="0 0 48 48" className={base} aria-hidden role="img">
    <path d="M8 12h20a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H16l-6 5v-5H8a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4Z" {...stroke} />
    <path d="M40 20h0M40 24h0M40 28h0" {...stroke} />
    <path d="M36 16c3 4 3 12 0 16" {...stroke} opacity="0.6" />
  </svg>
);

export const ActIcon: ComponentType = () => (
  <svg viewBox="0 0 48 48" className={base} aria-hidden role="img">
    <circle cx="24" cy="24" r="6" {...stroke} />
    <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4" {...stroke} />
  </svg>
);

export const EscapeIcon: ComponentType = () => (
  <svg viewBox="0 0 48 48" className={base} aria-hidden role="img">
    <path d="M14 8h16a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H14" {...stroke} />
    <path d="M32 24h10m0 0-4-4m4 4-4 4" {...stroke} />
    <circle cx="20" cy="24" r="1.6" fill="currentColor" />
  </svg>
);
