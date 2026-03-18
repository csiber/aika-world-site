-- ============================================================
-- AIKA WORLD — RTS Phase 1 Migration
-- Tactical Battles, Sector Claims, Relay Points,
-- Fleet Sightings, Activity Timeline
-- Run: wrangler d1 execute aika-world-db --file=./db/migration_rts.sql
-- ============================================================

-- Tactical Battles
CREATE TABLE IF NOT EXISTS tactical_battles (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL,
  attacker_id TEXT NOT NULL,
  defender_id TEXT NOT NULL,
  attacker_fleet TEXT NOT NULL,
  defender_fleet TEXT NOT NULL,
  attacker_formation TEXT DEFAULT NULL,
  defender_formation TEXT DEFAULT NULL,
  attacker_orders TEXT DEFAULT '[]',
  defender_orders TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending_formation',
  current_round INTEGER NOT NULL DEFAULT 0,
  max_rounds INTEGER NOT NULL DEFAULT 6,
  round_log TEXT NOT NULL DEFAULT '[]',
  result TEXT DEFAULT NULL,
  auto_resolve_at INTEGER NOT NULL,
  planet_coords TEXT DEFAULT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Sector Claims
CREATE TABLE IF NOT EXISTS sector_claims (
  id TEXT PRIMARY KEY,
  galaxy INTEGER NOT NULL,
  system_num INTEGER NOT NULL,
  alliance_id TEXT NOT NULL,
  claim_strength INTEGER NOT NULL DEFAULT 0,
  bonus_type TEXT DEFAULT 'standard',
  bonus_value REAL NOT NULL DEFAULT 0.05,
  claimed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(galaxy, system_num)
);

-- Relay Points (strategic positions in certain systems)
CREATE TABLE IF NOT EXISTS relay_points (
  id TEXT PRIMARY KEY,
  galaxy INTEGER NOT NULL,
  system_num INTEGER NOT NULL,
  bonus_type TEXT NOT NULL DEFAULT 'speed',
  bonus_value REAL NOT NULL DEFAULT 0.50,
  UNIQUE(galaxy, system_num)
);

-- Fleet Sightings (from Sensor Phalanx scans)
CREATE TABLE IF NOT EXISTS fleet_sightings (
  id TEXT PRIMARY KEY,
  observer_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  origin_coords TEXT NOT NULL,
  target_coords TEXT NOT NULL,
  ship_summary TEXT NOT NULL,
  arrive_at INTEGER NOT NULL,
  detected_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL
);

-- Activity Timeline (for offline progress review)
CREATE TABLE IF NOT EXISTS activity_timeline (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT DEFAULT NULL,
  icon TEXT DEFAULT '📋',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_timeline_user ON activity_timeline(user_id, created_at DESC);

-- Fleet missions extensions
ALTER TABLE fleet_missions ADD COLUMN origin_coords TEXT;
ALTER TABLE fleet_missions ADD COLUMN is_intercepted INTEGER DEFAULT 0;
ALTER TABLE fleet_missions ADD COLUMN intercept_coords TEXT DEFAULT NULL;
ALTER TABLE fleet_missions ADD COLUMN intercepted_by TEXT DEFAULT NULL;
