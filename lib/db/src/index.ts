import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Get DATABASE_URL from environment, with fallback for development
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[DB] DATABASE_URL not set - using default development database");
    return "postgresql://aasha:aasha_dev_password@localhost:5433/aasha_db";
  }
  return dbUrl;
};

const connectionString = getDatabaseUrl();
const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

// Auto-create tables if they don't exist (handles fresh Docker volumes)
pool.query(`
  CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    attended_class BOOLEAN NOT NULL,
    ate_well BOOLEAN NOT NULL,
    masking_level INTEGER NOT NULL,
    hold_duration_ms INTEGER NOT NULL,
    interaction_latency_ms REAL NOT NULL,
    is_late_night BOOLEAN NOT NULL DEFAULT false,
    lat REAL,
    lon REAL,
    wake_time TEXT,
    left_room BOOLEAN,
    had_physical_contact BOOLEAN,
    had_cognitive_friction BOOLEAN,
    had_sunlight_exposure BOOLEAN,
    used_substance_coping BOOLEAN,
    completed_task BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_session_id ON checkins(session_id);
  CREATE INDEX IF NOT EXISTS idx_created_at ON checkins(created_at DESC);
`).then(() => {
  console.log("[DB] ✅ Tables ready");
}).catch((err) => {
  console.error("[DB] ❌ Failed to create tables:", err.message);
});

console.log("[DB] ✅ Connected to database");

export { pool, db };
export * from "./schema";
