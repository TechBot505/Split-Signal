# Split Signal — Product Spec & Architecture Contract

Two players. Two phones. One bunker. Each phone sees HALF of every puzzle — you only escape by talking.
Co-op, asymmetric-information escape game (Keep Talking × We Were Here), delivered as a mobile-first PWA.
Fully independent project: its own repo, Cloudflare Worker, Neon DB, Clerk app. Shares NO code/infra with Liar Liar.

## Personality & design
Modern, clean, cinematic, a little sci-fi: "calm mission control". Deep graphite canvas, crisp hairlines,
ONE signal accent (electric cyan-teal `#3CF2D6`) + a warning amber `#FFB547` + a failure red `#FF5468`
used only for state. Typography: "Space Grotesk" (display/UI), "JetBrains Mono" (codes, timers, readouts).
Motion: smooth springs, scanline/radar sweeps, signal "pulse" when the partner acts, satisfying click/lock
animations on solve, glitch shake on strike. Puzzle art is pure SVG drawn in code (no image files).
Never generic SaaS; never rainbow. Mobile first (320px+), desktop centers a 480px "device".

## Stack
Next.js 15 (App Router, src/, TS strict) + React 19, Tailwind v4 (CSS-first; use `rounded-(--var)` paren syntax,
NOT brackets), motion (`motion/react`), lucide-react, zustand, zod, clsx, tailwind-merge, canvas-confetti, qrcode, nanoid.
Realtime: Cloudflare Workers + Durable Objects via `partyserver` (server) + `partysocket` (client), Wrangler.
DO binding name `main` (client `party: "main"`), SQLite-backed (`new_sqlite_classes`), hibernation on.
DB: Drizzle + postgres-js (Neon in prod; PGlite socket server locally: `npm run db:local`). Auth: Clerk, OPTIONAL.
Tests: Vitest. Everything must work with ZERO env vars (guest play, local history).

## Ports / scripts
web 3000, realtime `wrangler dev --port 8787`. `npm run dev` runs both (concurrently). `dev:full` adds db.
`NEXT_PUBLIC_REALTIME_HOST` (default `localhost:8787`), `NEXT_PUBLIC_APP_URL`, `REALTIME_SECRET`,
`DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. Treat empty env strings as unset (`||`).

## Directory ownership
```
worker/index.ts           Cloudflare worker + Durable Object (thin adapter over src/game)
wrangler.jsonc
src/game/                 PURE TS (no DOM/Node): types, protocol (zod), rng, codes, engine (reducer), view,
                          run (bunker stage sequencing), scoring, daily
src/game/puzzles/         one folder per puzzle type implementing the PuzzleModule contract below + registry
src/components/ui/        primitives
src/components/puzzles/   one React view per puzzle type per role (A view / B view)
src/components/run/       lobby, briefing, stage HUD, timer, strikes, signals, results
src/app/                  routes; src/app/api/* backend
src/lib/                  env, store, realtime client hook, sound, haptics, share, db/, server/
```

## Game rules
- Room: 4-letter code (no I/O). Exactly 2 players. Host creates, partner joins by code/link/QR.
- A RUN = a bunker of N stages (Quick 4, Standard 6, Hard 8) with a shared countdown
  (Quick 6:00, Standard 10:00, Hard 12:00) and 3 strikes. Strike 3 or time 0 → failure. All stages solved → escape.
- Each stage is one puzzle instance of some type at a difficulty that ramps through the run.
- Roles per stage: `A` and `B`. Each role receives only its half (`viewFor(role)`). Roles alternate so each player
  both "operates" (acts) and "advises" (holds the manual/clues) over a run. Some puzzles need actions from both.
- Actions are sent to the server; the server validates with the puzzle's `apply`. Wrong final answers = strike
  (+ small time penalty 15s). Some puzzles also strike on specific wrong moves (e.g. cutting the wrong wire).
- Hints: 2 per run. Using a hint reveals a puzzle-provided hint line to BOTH players and costs 30s.
- Signals: quick pings ("Wait", "Yes", "No", "Repeat", "Got it", "Help") broadcast to partner with a pulse.
- Pause: either player can request pause; both must be connected to resume. Disconnect auto-pauses the run.
- Daily Bunker: seed = `daily:<UTC date>`, Standard difficulty, same for everyone; one ranked attempt per duo per day
  (practice after). Leaderboard ranks escapes by time remaining (then strikes, then hints).
- Scoring: escape score = round((remaining ms + 30s×unused hints − 20s×strikes) / 100), floored at 0, so it reads as points rather than raw milliseconds. Failure records stages cleared.

## PuzzleModule contract (`src/game/puzzles/types.ts`) — THE key contract
```ts
export type Role = "A" | "B";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export interface PuzzleModule<S, VA, VB, Act> {
  id: string;                     // "wires", "keypad", ...
  name: string;                   // display
  briefing: { A: string; B: string };   // one-line role instructions
  /** Deterministic generation from seed + difficulty. Must ALWAYS produce a solvable instance. */
  generate(seed: string, difficulty: Difficulty): S;
  /** Role-specific, serializable view. Must never leak info meant only for the other role. */
  view(state: S, role: Role): Role extends "A" ? VA : VB;   // implement as viewA/viewB below
  viewA(state: S): VA;
  viewB(state: S): VB;
  /** Which role(s) may send actions right now. */
  canAct(state: S, role: Role): boolean;
  /** Validate + apply an action. Returns next state and outcome. Pure. */
  apply(state: S, role: Role, action: Act): { state: S; outcome: "progress" | "solved" | "strike" | "invalid" };
  /** Zod schema for this puzzle's action payload (server validates before apply). */
  actionSchema: import("zod").ZodType<Act>;
  /** Test oracle: returns a sequence of (role, action) that solves the instance. Used by solvability tests + bots. */
  solve(state: S): Array<{ role: Role; action: Act }>;
  hint(state: S): string;
}
```
Every puzzle ships with tests: 200 seeds × all difficulties → `solve()` reaches "solved" via `apply`; a wrong
answer path strikes; `viewA`/`viewB` never contain the other role's secrets (assert specific fields absent);
generation is deterministic per seed.

## Puzzle set (v1: 12 types, all genuinely requiring communication)
1. wires — A sees 3–6 colored wires (colors, stripes, order); B has a rulebook (conditional rules chosen per seed).
   A cuts one wire. Wrong cut = strike.
2. keypad — A sees 4 odd symbols on a keypad; B sees 5–6 columns of symbols; the column containing all 4 defines
   press order. A presses in order.
3. dials — A sees 3 dials with arrows they rotate; B sees target orientations encoded as a clock-time/compass
   description ("first dial points to 4 o'clock"). A locks in.
4. cipher — A sees a scrambled 5-letter word on a rotary wheel; B holds the cipher key (Caesar shift / symbol map)
   and a word list; A enters decoded word.
5. maze — B sees the maze map with exit and walls; A sees only their position (blind) and moves U/D/L/R. Bumping a
   wall = strike (difficulty ≥3) or just blocked (lower).
6. sequence — A sees a light panel flashing a sequence of colors; B has a translation table (color→button per
   strike count/stage); A presses translated buttons (Simon-style, rounds grow).
7. gauges — B sees 3 gauge readings; A sees levers that must be set so each reading hits a target band per B's
   manual formula (e.g., "Pressure = lever1×2 − lever3").
8. grid — logic grid: A holds half the clues, B the other half; both must place 4 items in 4 slots (either can
   place; shared board). Unique solution guaranteed by solver.
9. frequency — A has a tuning slider producing a waveform shape; B sees the target waveform description/image;
   A tunes and B confirms "lock" (both must agree — B presses Confirm).
10. switches — A sees a row of 6–8 switches and indicator LEDs; B sees the truth table/rules for which LEDs must be
    lit; A flips switches (each switch toggles multiple LEDs per hidden wiring that only B sees).
11. morse — A hears/sees a blinking light (short/long) spelling a word; B has the morse chart and a list of words
    with frequencies; B enters the frequency.
12. vault — final-style combo: both halves of a 4-digit code come from answers to mini-riddles; A sees riddles for
    digits 1–2 and a keypad; B sees riddles for 3–4. A types the full code.
Registry `src/game/puzzles/index.ts`: `PUZZLES: Record<id, PuzzleModule>`, plus `pickStages(seed, count)` choosing
distinct types with difficulty ramp and a finale (vault) last.

## Protocol (zod, both sides)
Client→server: join {playerId, token, name, avatar}, create {mode: "quick"|"standard"|"hard"|"daily"},
start, action {stageIndex, payload}, hint, signal {kind}, pause, resume, ready (briefing ack), playAgain, leave, ping.
Server→client: state {view} (per-player RoomView), error {code,message}, signal {from, kind}, event {kind:
"solved"|"strike"|"hint"|"escaped"|"failed", ...}, pong {now}.
RoomView: code, phase ("lobby"|"briefing"|"stage"|"stageClear"|"escaped"|"failed"), you, role (for current stage),
players [{id,name,avatar,connected,ready}], mode, seed(daily only), run {stageIndex, total, deadline, pausedAt?,
strikes, hintsLeft, hintText?, stageType, stageDifficulty, puzzleView (role-specific), stageBriefing}, result?.

## Persistence
Local (zustand persist `ss:*`): profile (id, token, name, avatar), run history (last 50), daily attempts, prefs.
Worker POSTs finished runs to `${NEXT_PUBLIC_APP_URL}/api/runs` with header `x-realtime-secret`. DB tables: users,
profiles, runs (id, code, mode, seed, daily_key, escaped, stages_cleared, total, time_left_ms, strikes, hints_used,
score, started_at, ended_at), run_players (run_id, seat, user_id nullable, name, avatar, token_hash), user_tokens.
Routes: POST /api/runs (secret), GET /api/daily (today's leaderboard top 50), GET /api/history (auth), POST
/api/history/claim (auth), GET/PUT /api/profile (auth), GET /api/health. 503 `db_disabled` without DB.

## Screens
/ (identity: call-sign + avatar), /play (hub: Start run [mode picker], Join code, Daily Bunker card with
countdown to reset + your streak, recent runs), /daily (leaderboard), /how-to-play, /history, /profile,
/room/[code] (lobby → briefing (both ready) → stages → results), sign-in/up (Clerk if enabled).
App shell with sidebar (hamburger top-left) for non-room pages. Room: HUD top (timer mono, strikes as 3 LEDs,
stage dots, hints), role badge ("You: OPERATOR" / "You: ADVISOR") per stage, puzzle area, signal bar bottom.
Results: cinematic "ESCAPED" / "SIGNAL LOST" with stats, per-stage splits, share card, play again.

## Quality gates
typecheck (app + worker), lint, vitest, `next build` all clean. No `any`, no ts-ignore. Files ≤200 lines.
Reduced motion respected. Touch targets ≥44px. Sheets scroll on touch (drag only from grabber). No safe-area
utility combined with Tailwind padding on the same element (use max(…, env()) or wrappers).
