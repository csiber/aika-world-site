-- Phase 1: Create normalized tables alongside JSON columns
-- These run in parallel until migration is verified
-- Run: wrangler d1 execute aika-world-db --file=./db/migration_normalize.sql

CREATE TABLE IF NOT EXISTS planet_buildings (
  planet_id TEXT NOT NULL,
  building_id TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  updated_at INTEGER,
  PRIMARY KEY (planet_id, building_id)
);

CREATE TABLE IF NOT EXISTS planet_fleet (
  planet_id TEXT NOT NULL,
  ship_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  updated_at INTEGER,
  PRIMARY KEY (planet_id, ship_type)
);

CREATE TABLE IF NOT EXISTS planet_resources (
  planet_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  amount REAL DEFAULT 0,
  rate REAL DEFAULT 0,
  updated_at INTEGER,
  PRIMARY KEY (planet_id, resource_type)
);

CREATE TABLE IF NOT EXISTS player_research (
  user_id TEXT NOT NULL,
  tech_id TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  updated_at INTEGER,
  PRIMARY KEY (user_id, tech_id)
);

CREATE INDEX IF NOT EXISTS idx_pb_planet ON planet_buildings(planet_id);
CREATE INDEX IF NOT EXISTS idx_pf_planet ON planet_fleet(planet_id);
CREATE INDEX IF NOT EXISTS idx_pr_planet ON planet_resources(planet_id);
CREATE INDEX IF NOT EXISTS idx_research_user ON player_research(user_id);
