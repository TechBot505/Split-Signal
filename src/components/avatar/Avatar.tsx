import {
  normalizeAvatar,
  TONE_COLORS,
  VISOR_COLORS,
  type AvatarConfig,
} from "@/lib/avatar";
import { cn } from "@/lib/cn";

const HELMET: Record<AvatarConfig["shape"], string> = {
  dome: "M50 12 C74 12 84 30 84 54 L84 80 C84 86 80 88 74 88 L26 88 C20 88 16 86 16 80 L16 54 C16 30 26 12 50 12 Z",
  hex: "M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z",
  round: "M50 12 A38 38 0 1 1 49.9 12 Z",
  wedge: "M50 12 L82 26 L82 74 C82 82 76 88 66 88 L34 88 C24 88 18 82 18 74 L18 26 Z",
};

export interface AvatarProps {
  config: AvatarConfig | unknown;
  size?: number;
  className?: string;
  title?: string;
}

/** Deterministic SVG "operator" face driven purely by config. */
export function Avatar({ config, size = 64, className, title }: AvatarProps) {
  const a = normalizeAvatar(config);
  const tone = TONE_COLORS[a.tone];
  const visor = VISOR_COLORS[a.visor];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title ?? "Operator avatar"}
      className={cn("shrink-0", className)}
    >
      {a.antenna !== "none" && (
        <g stroke={tone} strokeWidth="3" strokeLinecap="round" fill="none">
          {a.antenna === "single" && <line x1="50" y1="14" x2="50" y2="2" />}
          {a.antenna === "dual" && (
            <>
              <line x1="38" y1="16" x2="32" y2="3" />
              <line x1="62" y1="16" x2="68" y2="3" />
            </>
          )}
          {a.antenna === "dish" && (
            <>
              <line x1="50" y1="14" x2="50" y2="4" />
              <circle cx="50" cy="3" r="4" fill={visor} stroke="none" />
            </>
          )}
        </g>
      )}
      {a.antenna === "single" && (
        <circle cx="50" cy="2" r="3.5" fill={visor} />
      )}

      <path
        d={HELMET[a.shape]}
        fill={tone}
        stroke="rgba(160,200,255,0.14)"
        strokeWidth="1.5"
      />
      {/* visor */}
      <rect
        x="26"
        y="40"
        width="48"
        height="20"
        rx="10"
        fill={visor}
        opacity="0.92"
      />
      <rect
        x="26"
        y="40"
        width="48"
        height="9"
        rx="6"
        fill="#ffffff"
        opacity="0.18"
      />

      {a.badge !== "none" && (
        <g transform="translate(50 74)">
          <circle r="9" fill="rgba(7,9,12,0.6)" stroke={visor} strokeWidth="1.5" />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontSize="9"
            fontWeight="700"
            fill={visor}
          >
            {a.badge === "alpha"
              ? "A"
              : a.badge === "bravo"
                ? "B"
                : a.badge === "star"
                  ? "★"
                  : "⚡"}
          </text>
        </g>
      )}
    </svg>
  );
}
