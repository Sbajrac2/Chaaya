# Aasha (आशा) — Workspace

## Overview

Aasha is a minimalist mental health & cognitive support app for students and professionals. Built around a "Digital Worry Stone" interaction paradigm — a single glowing orb the user holds to check in. No menus, no nav bars, gesture-only navigation. Integrates Chhaya-style behavioral tracking with scientifically grounded bio-validation.

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
  - `src/components/Orb.tsx` — Glowing worry stone orb with 4-7-8 breathing method (Breathe in / Hold / Breathe out text)
  - `src/components/Onboarding.tsx` — First-launch onboarding (name input + tint color picker)
  - `src/components/CheckinFlow.tsx` — 4-step check-in, positive option first (YES left), skip buttons everywhere, hover tooltips with deeper "why" context
  - `src/components/InsightsView.tsx` — 6-tab insight panel (Chhaya/Dashboard/Garden/Asha/Pulse/Focus) with swipe + tap navigation
  - `src/components/Footer.tsx` — Expandable footer: About Aasha, Crisis Resources (988, Crisis Text Line, NAMI, JED, Active Minds, SAMHSA), Research References (11 cited sources)
  - `src/components/panels/ChhayaPanel.tsx` — Chhaya behavioral dashboard (SVG graphs, research-cited signals with "why" analysis, heatmap, calendar, footer)
  - `src/components/panels/DashboardPanel.tsx` — Strengths & weaknesses dashboard (Attendance, Nutrition, Movement, Sleep, Authenticity, Sunlight) with animated progress bars showing score breakdown
  - `src/components/panels/GardenPanel.tsx` — Visual flower garden (SVG flowers per day, tap to see stats)
  - `src/components/panels/NotePanel.tsx` — Asha's AI note with patterns + Lighten the Load (5 email types: extension/absence/office-hours/accommodation/mental-health-day + regenerate)
  - `src/components/panels/PulsePanel.tsx` — Campus Pulse with explanation, interactive dots, share light
  - `src/components/panels/FocusFunnelPanel.tsx` — One-Task Mode with focus timer + quick-focus shortcuts + focus technique tips
  - `src/hooks/use-session.ts` — localStorage session UUID management
  - `src/components/ProfilePanel.tsx` — Slide-in profile panel (edit name/university/city, color picker, sign out with confirmation) + ProfileButton component
  - `src/hooks/use-profile.ts` — localStorage user profile (name, tintHue, university, city)
  - `src/hooks/use-weather-sync.ts` — Geolocation + weather sync

### `artifacts/api-server` — Express API
- Serves at `/api`
- Routes:
  - `GET /api/healthz` — health check
  - `POST /api/checkins` — submit check-in (expanded: 7 new behavioral fields)
  - `GET /api/checkins?sessionId=X` — get check-ins
  - `GET /api/checkins/garden?sessionId=X` — resilience garden data
  - `POST /api/insights` — AI-generated "Note from Asha" (enhanced behavioral analysis)
  - `POST /api/insights/email` — AI-drafted professor extension email
  - `POST /api/insights/bio-validation` — Bio-validation card with scientific body/weather insight + XP
  - `POST /api/insights/focus` — Focus Funnel (AI picks best task for energy/weather)
  - `GET /api/weather?lat=X&lon=Y` — weather data (graceful fallback)
  - `GET /api/pulse` — anonymized community stress pulse

## Database Schema

### `checkins` table
- `id`, `session_id`, `attended_class`, `ate_well`, `masking_level` (1-5)
- `hold_duration_ms`, `interaction_latency_ms` (cognitive load indicators)
- `is_late_night` (auto-detected from time of submission)
- `wake_time` — What time user woke up (text, nullable)
- `left_room` — Whether user left their room (boolean, nullable)
- `had_physical_contact` — Whether user had physical touch today (boolean, nullable)
- `had_cognitive_friction` — Whether user found it hard to start tasks (boolean, nullable)
- `had_sunlight_exposure` — Whether user spent time in natural daylight (boolean, nullable)
- `used_substance_coping` — Whether user relied on caffeine/alcohol (boolean, nullable)
- `completed_task` — Whether user finished at least one intended task (boolean, nullable)
- `lat`, `lon`, `created_at`

## Behavioral Tracking (Chhaya Science)

Each check-in question maps to a published behavioral signal:
1. **Attended class** — Academic behavioral withdrawal (Eisenberg et al., 2009)
2. **Wake time** — Circadian rhythm disruption / social jet lag (Roenneberg et al., 2012)
3. **Left room** — Voluntary isolation, loss of co-regulation (Cacioppo & Hawkley, 2009)
4. **Ate well** — Gut-brain axis / self-neglect (Cryan & Dinan, 2012)
5. **Sunlight exposure** — Actual retinal light vs available light (Lewy et al.)
6. **Physical contact** — Touch deprivation / oxytocin + vagus nerve (Field, 2005)
7. **Cognitive friction** — Activation energy / prefrontal cortex load (Barkley)
8. **Substance coping** — Coping mechanism dependency signal (NIAAA research)
9. **Task completion** — Behavioral momentum (Martell, Addis & Jacobson, 2001)
10. **Masking level** — Emotional dissonance / performance tax (Hochschild, 1983)

Bio-validation cards cite specific neuroscience after each check-in (weather impact on serotonin, circadian disruption, isolation feedback loops, etc.)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (auto-provisioned by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy (auto-set by Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI key (auto-set by Replit AI Integrations)
- `OPENWEATHER_API_KEY` — Optional. Weather data. App works without it (graceful fallback).
- `SESSION_SECRET` — Session signing secret

## Key Design Decisions

- **Zero stigma UI**: No clinical forms, no diagnoses. Just a stone, icons, and warmth.
- **Behavioral over self-report**: Watches what you do, not just what you say. Catches students who mask.
- **Cognitive load tracking**: Hold duration + micro-movement latency = passive stress signal
- **Bio-validation**: After check-in, explains HOW environment/behavior physically affects the brain/body
- **No streaks**: Resilience garden only grows (petals never die). No shame mechanics.
- **Community validation**: Campus Pulse shows anonymized aggregate data to normalize struggle.
- **Solar Warmth mode**: Orb shifts amber/gold when sunlight hours < 4 (simulated light therapy)
- **Gesture-only navigation**: Swipe up to reveal insights. Long press to reset. Tap tabs.
- **Wisdom XP**: Each check-in earns XP. Bonus for completing tasks and getting sunlight.

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
