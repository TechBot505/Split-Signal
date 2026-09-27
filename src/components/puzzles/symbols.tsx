import type { ReactNode } from "react";

/**
 * Abstract geometric line glyphs for every keypad symbol id (see
 * game/puzzles/keypad/types.ts SYMBOLS). All drawn on a 24×24 canvas with a
 * consistent 1.75px stroke, no fills — simple, distinct, sci-fi hardware icons.
 */
const PATHS: Record<string, ReactNode> = {
  omega: <path d="M5 19h4c-3-2-4-5-4-8a7 7 0 0 1 14 0c0 3-1 6-4 8h4" />,
  trident: <path d="M12 3v18M6 8v2a6 6 0 0 0 12 0V8M6 8l-2 2M18 8l2 2" />,
  spiral: <path d="M12 12a2 2 0 0 1 2 2 4 4 0 0 1-6 1 6 6 0 0 1 3-8 8 8 0 0 1 8 6" />,
  eye: (
    <>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  "star-hollow": <path d="M12 3l2.5 6 6.5.4-5 4.2 1.7 6.4L12 16.4 6.3 20 8 13.6l-5-4.2 6.5-.4Z" />,
  "star-filled": (
    <path
      d="M12 3l2.5 6 6.5.4-5 4.2 1.7 6.4L12 16.4 6.3 20 8 13.6l-5-4.2 6.5-.4Z"
      fill="currentColor"
    />
  ),
  moon: <path d="M15 3a9 9 0 1 0 4 15A7 7 0 0 1 15 3Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18" />
    </>
  ),
  bolt: <path d="M13 3 5 13h5l-1 8 9-11h-6l1-7Z" />,
  leaf: <path d="M5 19C5 9 12 5 19 5c0 10-7 14-14 14ZM8 16l7-7" />,
  anchor: (
    <>
      <circle cx="12" cy="6" r="2.2" />
      <path d="M12 8v12M6 13a6 6 0 0 0 12 0M5 13h2M17 13h2" />
    </>
  ),
  crown: <path d="M4 8l3 9h10l3-9-5 4-3-6-3 6-5-4Z" />,
  key: (
    <>
      <circle cx="8" cy="9" r="4" />
      <path d="M11 12l8 8M16 17l2 2M18 15l2 2" />
    </>
  ),
  flame: <path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2 0-3 .5-5 1-8Z" />,
  drop: <path d="M12 3c3.5 5 6 8 6 11.5a6 6 0 0 1-12 0C6 11 8.5 8 12 3Z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
    </>
  ),
  wave: <path d="M3 12q3-5 6 0t6 0 6 0M3 17q3-5 6 0t6 0 6 0" />,
  "arrow-up": <path d="M12 20V5M6 11l6-6 6 6" />,
  "arrow-down": <path d="M12 4v15M6 13l6 6 6-6" />,
  cross: <path d="M12 4v16M4 12h16" />,
  ring: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  diamond: <path d="M12 3 21 12 12 21 3 12Z" />,
  hexagon: <path d="M8 4h8l4 8-4 8H8l-4-8Z" />,
  helix: <path d="M8 4c8 4-8 8 8 12M16 4c-8 4 8 8-8 12M8 8h8M8 16h8" />,
  atom: (
    <>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </>
  ),
  prism: <path d="M12 3 21 19H3L12 3ZM12 12l6 4M12 12l-6 4" />,
  rune: <path d="M8 3v18M8 3l7 5-7 5M8 13l7 5" />,
  star: <path d="M12 3l2.5 6 6.5.4-5 4.2 1.7 6.4L12 16.4 6.3 20 8 13.6l-5-4.2 6.5-.4Z" />,
};

export interface SymbolProps {
  id: string;
  size?: number;
  className?: string;
}

/** Render a keypad symbol by id. Falls back to a neutral ring for unknown ids. */
export function Symbol({ id, size = 28, className }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[id] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}
