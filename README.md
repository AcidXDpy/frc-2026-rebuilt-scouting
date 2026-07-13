# REBUILT FRC Scouting

A production-oriented, mobile-first scouting system for the 2026 FRC game concept **REBUILT**. Fuel, Hub, Tower, climb levels, validations, quick notes, and point values are config-driven through `GameConfig`, so strategy leads can adjust the app when rules or event interpretations change.

## Features

- Next.js 14 App Router, React, TypeScript, TailwindCSS, shadcn-style components
- Prisma schema for Postgres/Supabase
- Role-ready auth model: `ADMIN`, `STRATEGY_LEAD`, `SCOUT`, `VIEWER`
- Offline-first match and pit scouting using `localStorage` plus an IndexedDB sync outbox
- Mobile match scouting: tap counters, sliders, toggles, quick notes, cycle timer, validation
- Pit scouting: drivetrain, dimensions, mechanisms, climb, auto paths, reliability, repair notes, archetypes
- Team database with event metrics, history, strengths/weaknesses, and strategy notes
- Analytics: OPR-style estimate, EPA-like rating, phase scoring, accuracy, cycles, climb success, reliability, confidence intervals
- Picklist builder with weighted formula, tiers, exclusions, notes, and manual reordering
- Match strategy planner with predicted score, alliance win probability, role suggestions, risks, and saved local plans
- Data quality review for suspicious entries, impossible values, missing data, and confidence
- ML Lab for feature importance, model leaderboard, KNN similar-team search, anomaly detection, what-if simulation, alliance optimization, and model drift checks
- CSV export/import helpers and optional Blue Alliance API route

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

The UI ships with realistic sample data for a 2026 REBUILT event. Match and pit scouting saves locally immediately, so the app is usable at a field even before a hosted database is configured.

## Postgres / Supabase Setup

1. Create a Supabase project or any PostgreSQL database.
2. Copy the connection string into `.env`:

```bash
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
TBA_API_KEY="optional-blue-alliance-key"
```

3. Push schema and seed sample data:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Game Configuration

The default 2026 config lives in `lib/game-config.ts` and is mirrored by the Prisma `GameConfig` model. The admin screen lets you validate config JSON locally. In production, persist edits to `GameConfig` and load it per event.

Configurable values include:

- Fuel scoring labels and max attempts
- Auto and teleop Fuel point values
- Tower climb levels and points
- Rating scales
- Validation limits
- Intake sources
- Quick note buttons
- Robot archetypes

## Advanced Stats

Stats are implemented in `lib/stats.ts`, `lib/advanced-metrics.ts`, and `lib/models/*`.

- Per-match normalization separates auto, teleop, and endgame value.
- EPA-like rating blends defense-adjusted scoring, endgame value, and reliability.
- Elo-style strength rating is derived from EPA-like value and consistency.
- Reliability score penalizes disabled/tipped/connection/breakdown flags.
- Confidence scales with sample size and generates a simple confidence interval.
- Match prediction uses alliance phase totals, reliability, defensive impact, and role diversity synergy.
- Advanced team metrics include adjusted EPA, reliability-adjusted EPA, OPR CSV, ceiling/floor, volatility, boom/bust risk, foul risk, breakdown risk, climb probability, scout agreement, and archetype clustering.
- The model folder is intentionally "fake ML, real math": each model returns a prediction, confidence, positive factors, negative factors, explanation text, and feature weights. The UI can later swap these explainable formulas for trained models without changing page contracts.
- Current models include Bayesian team strength, Elo-style rating, Monte Carlo match simulation, logistic win probability, alliance synergy, picklist value, defensive matchup, reliability, and upset risk.
- Picklist score uses:

```txt
PickValue =
  0.30 * adjustedEPA
  + 0.18 * reliability
  + 0.14 * autoValue
  + 0.12 * climbValue
  + 0.10 * defenseValue
  + 0.08 * consistency
  + 0.08 * synergy
  - 0.10 * riskPenalty
```

The Analytics, Picklist, Strategy, and Quality pages use the FMA District Championship sample dataset plus imported OPR values. Generated baseline scouting data has intentional variation in cycles, reliability flags, scout agreement, and confidence so rankings do not collapse into identical rows.

## Data Flow

- `lib/sample-data.ts`: realistic event, teams, matches, pit entries, and match scouting entries
- `lib/offline-store.ts`: browser storage and IndexedDB outbox for offline scouting
- `lib/ml/*`: feature engineering, pseudo-trained model evaluation, anomaly detection, KNN similarity, what-if simulation, and alliance optimization
- `scripts/scrape-statbotics.mjs`: optional public Statbotics JSON import helper. Run `pnpm data:statbotics 2026mrcmp` when the API is available, then review the generated `data/imports/*` files before wiring them into seed data.
- `app/api/scouting/match/route.ts`: typed validation endpoint ready to connect to Prisma
- `app/api/tba/event/[key]/route.ts`: optional TBA schedule import route
- `prisma/schema.prisma`: production database models
- `prisma/seed.ts`: sample 2026 event seed

## Deployment

1. Set env vars in Vercel or your hosting platform.
2. Use Supabase or managed Postgres for `DATABASE_URL`.
3. Run Prisma migrations or `prisma db push` during setup.
4. Deploy with:

```bash
npm run build
npm run start
```

For real auth, connect Supabase Auth or NextAuth and map claims to `User.role`. Keep the scout UI offline-first by posting queued IndexedDB records to `/api/scouting/match` whenever the browser regains connectivity.
