# Aasha (आशा) — Workspace

## Overview

Aasha is a minimalist mental health & cognitive support app for students and professionals. Built around a "Digital Worry Stone" interaction paradigm — a single glowing orb the user holds to check in. No menus, no nav bars, gesture-only navigation.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Framer Motion, Tailwind CSS)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **AI**: OpenAI via Replit AI Integrations (gpt-5-mini)
- **Build**: esbuild (CJS bundle)

## Artifacts

### `artifacts/aasha` — Frontend (React + Vite)
- Serves at `/` (root)
- Key components:
  - `src/components/Orb.tsx` — The glowing worry stone orb with breath animation
  - `src/components/CheckinFlow.tsx` — 3-step icon-based check-in (class/food/masking)
  - `src/components/SwipeableView.tsx` — Swipe-up gesture container
  - `src/components/panels/GardenPanel.tsx` — Resilience garden (petals)
  - `src/components/panels/NotePanel.tsx` — Asha's AI note + Lighten the Load
  - `src/components/panels/PulsePanel.tsx` — Anonymous campus stress heatmap
  - `src/hooks/use-session.ts` — localStorage session UUID management
  - `src/hooks/use-weather-sync.ts` — Geolocation + weather sync

### `artifacts/api-server` — Express API
- Serves at `/api`
- Routes:
  - `GET /api/healthz` — health check
  - `POST /api/checkins` — submit check-in
  - `GET /api/checkins?sessionId=X` — get check-ins
  - `GET /api/checkins/garden?sessionId=X` — resilience garden data
  - `POST /api/insights` — AI-generated "Note from Asha"
  - `POST /api/insights/email` — AI-drafted professor extension email
  - `GET /api/weather?lat=X&lon=Y` — weather data (requires OPENWEATHER_API_KEY, graceful fallback)
  - `GET /api/pulse` — anonymized community stress pulse

## Database Schema

### `checkins` table
- `id`, `session_id`, `attended_class`, `ate_well`, `masking_level` (1-5)
- `hold_duration_ms`, `interaction_latency_ms` (cognitive load indicators)
- `is_late_night` (auto-detected from time of submission)
- `lat`, `lon`, `created_at`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (auto-provisioned by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy (auto-set by Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI key (auto-set by Replit AI Integrations)
- `OPENWEATHER_API_KEY` — Optional. Weather data. App works without it (graceful fallback).
- `SESSION_SECRET` — Session signing secret

## Key Design Decisions

- **Zero stigma UI**: No clinical forms, no diagnoses. Just a stone, icons, and warmth.
- **Cognitive load tracking**: Hold duration + micro-movement latency = passive stress signal
- **No streaks**: Resilience garden only grows (petals never die). No shame mechanics.
- **Community validation**: Campus Pulse shows anonymized aggregate data to normalize struggle.
- **Solar Warmth mode**: Orb shifts amber/gold when sunlight hours < 4 (simulated light therapy)
- **Gesture-only navigation**: Swipe up to reveal insights. Long press to reset.

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── aasha/              # React+Vite frontend
│   └── api-server/         # Express API server
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-openai-ai-server/  # OpenAI server-side client
└── scripts/                # Utility scripts
```
