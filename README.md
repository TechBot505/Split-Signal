# Split Signal

Two players. Two phones. One bunker. **Each phone sees only half of every puzzle — you escape by talking.**

Split Signal is a co-op, asymmetric-information escape game delivered as a mobile-first PWA. One player operates; the other advises from a manual only they can see. Solve every stage before the countdown hits zero or you rack up three strikes.

## Features

- **12 puzzle types**, each genuinely requiring communication:

  | Type | Name | Type | Name |
  |------|------|------|------|
  | `wires` | Live Wires | `gauges` | Reactor Trim |
  | `keypad` | Symbol Keypad | `grid` | Bunk Assignment |
  | `dials` | Alignment Dials | `frequency` | Frequency Lock |
  | `cipher` | Cipher Lock | `switches` | Cross-Wired |
  | `maze` | Blind Corridor | `morse` | Morse Beacon |
  | `sequence` | Signal Relay | `vault` | The Vault (finale) |

- **Modes:** Quick (4 stages / 6:00), Standard (6 / 10:00), Hard (8 / 12:00), and a **Daily Bunker** (Standard difficulty, same seed for everyone, one ranked attempt per duo per day).
- **Roles alternate** each stage — you both operate and advise over a run. 3 strikes, 2 hints, wrong answers cost time.
- **Signals:** quick pings ("Wait", "Yes", "No", "Repeat", "Got it", "Help") broadcast to your partner with a pulse.
- **Daily leaderboard** ranking escapes by time remaining, then strikes, then hints.
- **Optional accounts** (Clerk) for cloud run history and claimable profiles.
- **PWA:** installable, offline shell, mobile-first (320px+); desktop centers a 480px "device".

> Everything works with **zero configuration** — guest play with local history. A database and auth only add the leaderboard and accounts.

## Stack

Next.js 15 (App Router, TS strict) + React 19, Tailwind v4, `motion`, zustand, zod. Realtime over Cloudflare Workers + Durable Objects via `partyserver`/`partysocket`. DB: Drizzle + postgres-js (Neon in prod, embedded PGlite locally). Auth: Clerk (optional). Tests: Vitest.

## Local development

```bash
npm i
cp .env.example .env.local      # all vars optional; empty = guest mode
cp .dev.vars.example .dev.vars  # worker-side secrets for local realtime
npm run dev                     # web on :3000 + realtime worker on :8787
```

That's the full guest experience. To enable the leaderboard/accounts locally, start a database and migrate it:

```bash
npm run db:local                # embedded PGlite Postgres on 127.0.0.1:5433 (no Docker); prints a DATABASE_URL
# in another shell, using the URL it printed:
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5433/postgres" npm run db:migrate
```

`npm run dev:full` runs the db, web, and realtime worker together with the URL pre-wired.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Web (:3000) + realtime worker (:8787) |
| `npm run dev:full` | Adds the local PGlite db to `dev` |
| `npm run build` / `start` | Production Next.js build / serve |
| `npm run rt:deploy` | Deploy the realtime worker (`wrangler deploy`) |
| `npm run db:local` | Start embedded PGlite Postgres |
| `npm run db:migrate` | Apply SQL migrations (needs `DATABASE_URL`) |
| `npm run db:generate` | Generate a Drizzle migration from the schema |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run lint` / `typecheck` / `test` | ESLint / `tsc` (app + worker) / Vitest |

## Deploy

**1. GitHub** — create a new repo and push this project.

**2. Neon (database)** — create a project, copy the **pooled** connection string (host contains `-pooler`), then apply the schema:

```bash
DATABASE_URL="postgresql://…-pooler….neon.tech/db?sslmode=require" npm run db:migrate
```

**3. Clerk (auth)** — create a new application and grab the keys. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the URL vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `…_SIGN_UP_URL=/sign-up`, `…_SIGN_IN_FALLBACK_REDIRECT_URL=/play`, `…_SIGN_UP_FALLBACK_REDIRECT_URL=/play`). Add your production domain in the Clerk dashboard.

**4. Cloudflare (realtime worker)**

```bash
npx wrangler login
npm run rt:deploy
npx wrangler secret put REALTIME_SECRET   # paste `openssl rand -hex 32`
npx wrangler secret put SEED_SALT         # recommended: paste `openssl rand -hex 32`
```

`SEED_SALT` is an optional secret folded into puzzle generation. Because the code is open source and the daily seed is public (`daily:<date>`), without it a player could regenerate their partner's hidden half. Setting a random hex salt on the worker keeps each side's view secret. Leave it unset locally.

Set `NEXT_PUBLIC_APP_URL` to your Vercel URL — either in `wrangler.jsonc` `vars` or the dashboard — then redeploy so the worker can POST finished runs. (Free plan is fine: the DO uses `new_sqlite_classes`.)

**5. Vercel (web app)** — import the repo and set these environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_REALTIME_HOST` | `splitsignal.<subdomain>.workers.dev` (no protocol) |
| `NEXT_PUBLIC_APP_URL` | your Vercel deployment URL |
| `REALTIME_SECRET` | **same** value set on the worker |
| `DATABASE_URL` | Neon pooled connection string |
| Clerk keys + URL vars | as in step 3 |

Deploy, then verify `GET /api/health`.

## Troubleshooting

- **Realtime won't connect / stuck in lobby** → check `NEXT_PUBLIC_REALTIME_HOST` (host only, no `https://`, no trailing slash).
- **Leaderboard empty / runs not saving** → `REALTIME_SECRET` must match on the worker and web app, and the worker's `NEXT_PUBLIC_APP_URL` must point at the live site. API routes return `503 { reason: "db_disabled" }` when `DATABASE_URL` is unset.
- **Clerk redirect loops / wrong landing page** → verify the sign-in/up URL vars and that your production domain is registered in Clerk.

## Project structure

```
src/game/            Pure TS: types, protocol (zod), engine, scoring, daily
src/game/puzzles/    One folder per puzzle type + registry (PUZZLES, pickStages)
src/components/       ui primitives, per-role puzzle views, run HUD
src/app/             Routes; src/app/api/* backend (runs, daily, history, profile, health)
src/lib/             env, store, realtime hook, db/, server/
worker/index.ts      Cloudflare Worker + Durable Object (thin adapter over src/game)
```

See `SPEC.md` for the full product spec and the `PuzzleModule` contract.
