# How to Run Chaaya Locally

No Replit. Full stack: React frontend + Express API + PostgreSQL in Docker.

---

## Prerequisites

Install these once if you haven't:

- **Node.js** v20+ → https://nodejs.org
- **pnpm** → `npm install -g pnpm`
- **Docker Desktop** → https://www.docker.com/products/docker-desktop (must be running)

---

## 1. Set up your environment file

Open `.env` in the project root and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at https://console.anthropic.com (free tier available).

> **Without a key:** The app still works fully — Asha will use built-in fallback responses instead of AI-generated ones.

---

## 2. Start the database

From the project root (`Aasha-Mindful-Space2.0/`):

```bash
docker compose up -d
```

This starts PostgreSQL and automatically creates the `checkins` table.
Check it's running: `docker compose ps` — you should see `aasha_postgres` as **healthy**.

---

## 3. Install dependencies

```bash
cd ~/Downloads/Aasha-Mindful-Space2.0
rm -rf node_modules artifacts/aasha/node_modules artifacts/api-server/node_modules
pnpm install
```

---

## 4. Run everything

From the project root:

```bash
pnpm dev
```

This starts both at once:
- **Frontend** → http://localhost:5173
- **API Server** → http://localhost:3000

Or run them separately in two terminals:
```bash
# Terminal 1 — API backend
pnpm dev:api

# Terminal 2 — React frontend
pnpm dev:frontend
```

---

## How it all connects

```
Browser (localhost:5173)
    │
    ├── /api/* ──proxy──► Express API (localhost:3000)
    │                          │
    │                          ├── POST /api/checkins   → saves to PostgreSQL
    │                          ├── GET  /api/checkins   → reads from PostgreSQL
    │                          ├── GET  /api/weather    → Open-Meteo (free, no key)
    │                          ├── GET  /api/pulse      → computed from DB
    │                          └── POST /api/insights/* → Anthropic Claude (or fallback)
    │
    └── Everything else → React app
```

---

## Stopping

```bash
# Stop the app: Ctrl+C in the terminal running pnpm dev

# Stop the database:
docker compose down

# Stop AND delete all data:
docker compose down -v
```

---

## Troubleshooting

**`pnpm dev:api` crashes immediately**
→ Make sure Docker is running and the DB is healthy: `docker compose ps`

**`Cannot connect to database` or 400 errors on check-ins**
→ Wait ~5 seconds after `docker compose up -d` and try again (DB takes a moment to start).
→ If it still fails, reset the Docker volume so the table gets created fresh:
```bash
docker compose down -v
docker compose up -d
```
Then restart the API server.

**Check-ins return 400 Bad Request**
→ The app now auto-creates the table on startup, so this should self-heal.
→ If it persists, run `docker compose down -v && docker compose up -d` to reset the DB.

**Weather not showing**
→ Allow location access in the browser. Weather uses Open-Meteo (free, no key needed).

**AI responses are generic**
→ Add your `ANTHROPIC_API_KEY` to `.env` and restart the API server.

**Port 5173 or 3000 already in use**
```bash
lsof -ti:5173 | xargs kill   # free frontend port
lsof -ti:3000 | xargs kill   # free API port
```
