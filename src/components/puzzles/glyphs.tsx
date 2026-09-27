import { GLYPHS } from "@/game/puzzles/cipher/types";

/**
 * Deterministic rune glyphs for the cipher's 26 glyph ids. Rather than hand-draw
 * 26 icons, each id derives a distinct, stable set of strokes from its index on a
 * 3×3 node grid — every glyph shares a central stem for a consistent runic look.
 */
const COLS = [7, 12, 17];
const ROWS = [5, 12, 19];
const NODES: Array<[number, number]> = ROWS.flatMap((y) => COLS.map((x) => [x, y] as [number, number]));

/** Curated branch edges (node index pairs) the generator samples from. */
const EDGES: Array<[number, number]> = [
  [0, 4], [2, 4], [4, 6], [4, 8], [1, 3], [1, 5],
  [3, 7], [5, 7], [0, 1], [1, 2], [6, 7], [7, 8],
  [0, 5], [2, 3], [3, 4], [4, 5],
];

function seg(a: number, b: number): string {
  const [ax, ay] = NODES[a];
  const [bx, by] = NODES[b];
  return `M${ax} ${ay}L${bx} ${by}`;
}

/** Build a rune path string for a glyph index: central stem + 3 sampled branches. */
function runePath(index: number): string {
  let h = (index + 1) * 2654435761;
  const parts = ["M12 4V20"];
  for (let k = 0; k < 3; k++) {
    h = (h ^ (h << 13)) >>> 0;
    parts.push(seg(...EDGES[h % EDGES.length]));
  }
  return parts.join(" ");
}

const PATHS: Record<string, string> = Object.fromEntries(
  GLYPHS.map((id, i) => [id, runePath(i)]),
);

export interface CipherGlyphProps {
  id: string;
  size?: number;
  className?: string;
}

/** Render a cipher glyph by id. */
export function CipherGlyph({ id, size = 28, className }: CipherGlyphProps) {
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
      <path d={PATHS[id] ?? "M12 4V20"} />
    </svg>
  );
}
