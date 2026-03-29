# Chaaya · छाया

**Chaaya** (Nepali for *shadow*) is a mental health check-in app built for the hackathon theme of Mental Health. It gives users a calm, beautiful space to pause, reflect on how they're feeling, and track emotional patterns over time.

## What It Does

- **Mood Check-in via Orb** — Hold the glowing orb on the home screen to trigger a check-in. The app reads how long and how intentionally you hold it as a signal of your emotional engagement.
- **Guided Check-in Flow** — After triggering, you're walked through a short emotional check-in (mood, energy, notes).
- **Insights View** — Swipe up or tap the arrow to see your past check-ins and emotional trends over time.
- **Personalized Onboarding** — New users set up a profile with their name and a color tint preference that personalizes the whole UI.
- **Weather-aware themes** — The app syncs with local weather to shift between "solar" and ambient visual modes.
- **Profile Panel** — View and edit your profile or sign out.

The UI features animated floating particles, a bioluminescent texture background, and smooth framer-motion transitions — designed to feel peaceful and grounding.

## Tech Stack

- **React 19** with TypeScript
- **Vite** (bundler)
- **Tailwind CSS v4** (styling)
- **Framer Motion** (animations)
- **TanStack Query** (data fetching/caching)
- **Wouter** (routing)
- **shadcn/ui + Radix UI** (component primitives)
- **pnpm** (package manager, monorepo workspace)

## Prerequisites

- **Node.js** v18 or higher
- **pnpm** v8 or higher

Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

## How to Run

### 1. Clone / Download the project

Make sure you have the full `Aasha-Mindful-Space2.0` folder.

### 2. Install dependencies

From the **project root** (`Aasha-Mindful-Space2.0/`):

```bash
cd ~/Downloads/Aasha-Mindful-Space2.0
rm -rf node_modules
rm -rf artifacts/aasha/node_modules
pnpm install
```

> **Note for Apple Silicon Macs (M1/M2/M3):** If you see an error about `@rollup/rollup-darwin-arm64`, it means the workspace config was set up for a Linux server. The fix is already applied in this repo — just delete `node_modules` and re-run `pnpm install` as above.

### 3. Start the dev server

```bash
cd artifacts/aasha
pnpm dev
```

The app will be available at **http://localhost:5173**

### 4. Build for production (optional)

```bash
pnpm build
```

Output goes to `artifacts/aasha/dist/public/`.

## Project Structure

```
Aasha-Mindful-Space2.0/
├── artifacts/
│   └── aasha/               # Main React frontend app
│       ├── src/
│       │   ├── components/  # UI components (Orb, CheckinFlow, InsightsView, etc.)
│       │   ├── hooks/       # Custom hooks (session, profile, weather)
│       │   ├── pages/       # Route pages (Home, NotFound)
│       │   └── lib/         # Utilities
│       ├── vite.config.ts
│       └── package.json
├── lib/                     # Shared libraries / API clients
├── scripts/                 # Build/utility scripts
├── pnpm-workspace.yaml      # Monorepo workspace config
└── package.json
```

## Troubleshooting

**Error: Cannot find module @rollup/rollup-darwin-arm64**
Run from the project root:
```bash
rm -rf node_modules artifacts/aasha/node_modules
pnpm install
```

**Port 5173 already in use**
Change the port in `artifacts/aasha/vite.config.ts` under `server.port`, or kill the process using that port:
```bash
lsof -ti:5173 | xargs kill
```
