const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Fixed decorative backdrop: faint dot grid + a slow radar sweep gradient +
 * very light noise. Pointer-events off; the radar sweep pauses under
 * prefers-reduced-motion (handled by the global off-switch).
 */
export function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas"
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(rgba(160,200,255,0.06) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        className="absolute left-1/2 top-[-30%] h-[160vmax] w-[160vmax] -translate-x-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, #3cf2d6 14%, transparent) 24deg, transparent 60deg)",
          animation: "radar-sweep 26s linear infinite",
          filter: "blur(6px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-screen"
        style={{ backgroundImage: NOISE }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
