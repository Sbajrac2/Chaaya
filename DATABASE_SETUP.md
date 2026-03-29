# 🗄️ Aasha Database Setup Guide

## Quick Start (3 steps)

### Step 1: Start PostgreSQL with Docker
```bash
cd ~/Downloads/Aasha-Mindful-Space2.0
docker-compose up -d postgres
```

Wait 3-5 seconds for PostgreSQL to be ready. You should see: `✓ Container aasha_postgres Started`

### Step 2: Run Database Migrations
In a new terminal:
```bash
cd ~/Downloads/Aasha-Mindful-Space2.0/lib/db
pnpm push
```

This creates the database schema (tables for check-ins, etc.)

### Step 3: Run All Services (3 terminals)

**Terminal 1 - API Server:**
```bash
cd ~/Downloads/Aasha-Mindful-Space2.0/artifacts/api-server
pnpm dev
```
✓ Should print: `🚀 API Server running at http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd ~/Downloads/Aasha-Mindful-Space2.0/artifacts/aasha
pnpm dev
```
✓ Should print: `Local: http://localhost:5173/`

**Terminal 3 - Keep running (optional monitoring):**
```bash
docker-compose logs -f postgres
```

---

## ✅ Verify Everything Works

1. Open http://localhost:5173
2. Hold the orb for 10 seconds
3. Complete the check-in flow
4. **Check the Terminal 1 logs** - you should see:
   ```
   [API] ✅ Check-in saved to database for session ...
   ```
5. Swipe up to see the Garden/Dashboard/Insights
6. Data should now persist! 🌻

---

## 📊 Database Details

| Property | Value |
|----------|-------|
| **Type** | PostgreSQL 16 Alpine |
| **Host** | localhost |
| **Port** | 5432 |
| **User** | aasha |
| **Password** | aasha_dev_password |
| **Database** | aasha_db |
| **Connection** | `postgresql://aasha:aasha_dev_password@localhost:5432/aasha_db` |

---

## 🛠 Troubleshooting

### Error: "docker: command not found"
Install Docker Desktop: https://www.docker.com/products/docker-desktop

### Error: "database "aasha_db" does not exist"
Run migrations:
```bash
cd lib/db && pnpm push
```

### Port 5432 already in use
Stop the container:
```bash
docker-compose down
docker system prune
```

### API shows "ECONNREFUSED"
Make sure:
1. PostgreSQL is running: `docker-compose ps`
2. DATABASE_URL is set in `artifacts/api-server/.env`
3. Migrations have run: `cd lib/db && pnpm push`

### Data not appearing after check-in
1. Check Terminal 1 logs for `[API] ✅ Check-in saved`
2. Verify DB connection: `psql postgresql://aasha:aasha_dev_password@localhost:5432/aasha_db`
3. Restart both API server and frontend

---

## 🗑️ Clean Up

Stop all services:
```bash
# Kill terminals with Ctrl+C
# Then stop Docker:
docker-compose down
```

Remove all data and start fresh:
```bash
docker-compose down -v
docker system prune -a
```

---

## 📝 What's Connected Now

- **Frontend** (http://localhost:5173) → sends check-in data to API
- **API** (http://localhost:3000) → stores data in PostgreSQL database
- **Database** (PostgreSQL) → persists all check-ins, calculations, trends
- **Orb tracking** → captures duration & latency, saves to DB
- **Garden panel** → reads from DB, displays flower petals
- **Dashboard** → reads from DB, shows charts
- **Insights/Chhaya** → analyzes DB data with warm messages
