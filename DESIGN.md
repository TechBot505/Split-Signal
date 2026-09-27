# Split Signal — Design System

"Calm mission control": deep graphite canvas, hairlines, ONE electric-teal signal accent.
Tailwind v4 CSS-first. Tokens in `@theme inline` (globals.css); use `rounded-(--radius-card)`
paren syntax, never brackets. Never combine a safe-area padding utility with a Tailwind padding
utility on the same box — use `pt-[max(12px,env(safe-area-inset-top))]`.

## Tokens (utilities: bg-/text-/border-<name>)
| Token | Value | Notes |
|---|---|---|
| canvas | #07090C | page bg |
| surface-1 / surface-2 | #0E1217 / #151A21 | panels, raised |
| hairline | rgba(160,200,255,0.08) | 1px borders (`bg-hairline`, `.hairline`) |
| fg / muted / faint | #EAF2F7 / #9AA7B4 / #6B7885 | ≥7:1, ≥7:1, ≥4.5:1 on canvas |
| accent / accent-fg | #3CF2D6 / #04110F | success == accent |
| warn / fail | #FFB547 / #FF5468 | state only |
| radius-input / radius-card | 10px / 14px | chips = `rounded-full` |
| font-display / font-mono | Space Grotesk / JetBrains Mono | via next/font (fonts.ts) |

## Utility classes (src/styles/*.css)
`.label-mono` uppercase mono micro-label (0.14em tracking) · `.text-display` Space Grotesk 600,
-0.02em · `.hairline` / `.hairline-t` 1px border · `.glow-accent` soft accent ring+glow ·
`.no-scrollbar` · `.scanline` animated cinematic overlay. Base: 100dvh, overscroll-none, tap-highlight
off, font-smoothing, accent `:focus-visible`.
Keyframes: `radar-sweep, pulse-ring, blink, glitch-shake, scan`; a `prefers-reduced-motion` block
kills all animation/transition + freezes the scanline. JS (motion) animations gate on `useReducedMotion`.

## Motion conventions
Springs everywhere: buttons `whileTap scale .97` (stiffness 500/damping 30); sheets/drawers
`stiffness 380/damping 38-40`; sliding indicators `450/34`. Enter/exit via `AnimatePresence`.
Timer blinks (amber<60s, red<15s). Backdrop radar sweep 26s; RadarLoader sweep 1.8s.

## Layout
Root `layout.tsx`: fonts on `<html>`, `<Backdrop/>` (fixed, pointer-events none), `<Providers/>`
(ClerkProvider only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set — works with zero env),
`<ServiceWorkerRegistrar/>` (prod). `(app)` group wraps `<AppShell>` + content
`mx-auto w-full max-w-[480px] px-4 pt-6 pb-[max(24px,env(safe-area-inset-bottom))]`.
Metadata/viewport, `manifest.ts`, `icon.svg`, `scripts/gen-icons.mjs` (sharp→PNGs), `public/sw.js`
(network-first nav, cache-first `/_next/static`, skips `/api`).

## Components — `@/components/ui` (barrel index.ts)
- **Button** `{variant:primary|secondary|ghost|danger|danger-outline, size:sm|md|lg, loading, fullWidth,
  leftIcon, rightIcon}` + button attrs. Disabled → surface-2 + faint.
- **IconButton** `{label(req), tone:default|accent|ghost}` 40px round.
- **Input** `{label, hint, error, leftIcon, mono}` + input attrs.
- **CodeInput** `{value, onChange, length=4, onComplete, disabled, autoFocus, ariaLabel}` — mono boxes,
  auto-advance, paste, filters to A–Z minus I/O.
- **Card** `{as, interactive, inset}` surface + hairline, 14px.
- **Chip / Badge** `{tone:neutral|accent|warn|fail, icon, size:sm|md}` pill.
- **Segmented<T>** `{options:{value,label}[], value, onChange, ariaLabel}` sliding accent indicator, ≥44px.
- **Toggle** `{checked, onChange, label, disabled}` switch, ≥44px hit area.
- **Sheet** `{open, onClose, title, footer, children}` bottom-sheet(mobile)/dialog(desktop); drag-to-dismiss
  from grabber/header only (useDragControls, dragListener=false); body scrolls (`min-h-0 flex-1
  overflow-y-auto overscroll-contain touch-pan-y`); Esc + backdrop close.
- **ModalCard** `{open, onClose, tone, title, footer, dismissable}` centered, tone bar on top.
- **Toast** — `toast(msg, tone?)`, `clearToasts()`, `<Toaster/>` (mounted in AppShell). Top-center pill, 2.5s.
- **Spinner** `{size, label}` · **CountUp** `{value, duration, format, mono}` animated number ·
  **Stat** `{label, value, hint, tone}` · **Divider** `{label?}` · **ProgressDots** `{total, current}`.

## Components — `@/components/hud` (for later agents)
- **Timer** `{deadline, serverOffset=0, paused, pausedRemainingMs}` big mono mm:ss; amber<60s, red<15s.
- **StrikeLights** `{strikes, max=3}` LEDs, glitch-shake as each lights red.
- **StageDots** `{total, current}` done/current/upcoming with connecting line.
- **RoleBadge** `{role:operator|advisor}` chip + lucide icon (Wrench / BookOpen).
- **SignalPulse** `{pulseKey, tone, children}` expanding ring on pulseKey change.
- **RadarLoader** `{size, label}` animated sweep waiting indicator.

## Components — `@/components/shell`
- **AppShell** `{children, avatar?}` sticky h-14 top bar (safe-top): hamburger · Wordmark · avatar→/profile;
  hosts Sidebar + Toaster.
- **Sidebar** `{open, onClose}` left drawer (Play, Daily Bunker, How to play, History, Profile); closes on
  Esc/backdrop/route change; focus trap; active item accent bar.
- **PageTitle** `{title, eyebrow?, action?}` mono eyebrow + display h1.
- **Wordmark** — "Split" fg + "Signal" accent + animated signal bars (reduced-motion aware).
- **Backdrop**, **ServiceWorkerRegistrar** (internal).

## Avatars — `@/components/avatar` + `@/lib/avatar`
- **avatar.ts** `AvatarConfig {shape, tone, visor, antenna, badge}`, `avatarSchema` (zod), option arrays,
  `TONE_COLORS`/`VISOR_COLORS`, `randomAvatar(seed?)` (deterministic w/ seed), `normalizeAvatar(unknown)`
  (never throws). 4 shapes · 8 muted tones · 6 visors · 4 antennae · 5 badges.
- **Avatar** `{config, size=64, title, className}` pure-SVG operator helmet/visor face.
- **AvatarBuilder** `{value, onChange}` preview + dimension tabs + option tiles (color swatches) + shuffle.

## Rules honored
No `any`/ts-ignore · every file <200 lines · touch targets ≥44px · reduced motion respected ·
`tsc --noEmit` + own-file lint + `next build` prerender all green.
