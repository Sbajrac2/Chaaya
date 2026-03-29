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
