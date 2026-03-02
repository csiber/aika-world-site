-- AIKA WORLD — Multi-planet Economy Migration
-- Separates resources, buildings, and fleet per planet.

-- 1. Create the new planets table
CREATE TABLE IF NOT EXISTS planets (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  emoji         TEXT NOT NULL DEFAULT '🌍',
  coords        TEXT NOT NULL,
  resources     TEXT NOT NULL DEFAULT '{"metal":5000,"crystal":2000,"energy":1000,"deus":100}',
  rates         TEXT NOT NULL DEFAULT '{"metal":60,"crystal":30,"energy":15,"deus":3}',
  buildings     TEXT NOT NULL DEFAULT '[]',
  fleet         TEXT NOT NULL DEFAULT '[]',
  is_main       INTEGER NOT NULL DEFAULT 0,
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(coords)
);

-- 2. Migrate existing data from game_state to the planets table
-- We assume the first planet in the game_state.planets JSON is the main one.
-- This is complex in pure SQL with JSON, so we will create a temporary logic 
-- or rely on the fact that users currently have their main planet coords in galaxy_map too.

INSERT INTO planets (user_id, name, emoji, coords, resources, rates, buildings, fleet, is_main, updated_at)
SELECT 
    gs.user_id,
    COALESCE(gm.planet_name, 'Főbolygó') as name,
    COALESCE(gm.planet_emoji, '🌍') as emoji,
    COALESCE(gm.coords, '[1:1:1]') as coords,
    gs.resources,
    gs.rates,
    gs.buildings,
    gs.fleet,
    1 as is_main,
    gs.updated_at
FROM game_state gs
LEFT JOIN galaxy_map gm ON gs.user_id = gm.user_id AND gm.is_main = 1;

-- 3. Simplify game_state (keep only global things: research, score, and current active planet)
-- We'll add active_planet_id to track which planet the user is looking at.
ALTER TABLE game_state ADD COLUMN active_planet_id TEXT;
-- Update active_planet_id for existing users
UPDATE game_state 
SET active_planet_id = (SELECT id FROM planets WHERE planets.user_id = game_state.user_id LIMIT 1);

-- We keep the old columns for a moment for safety, but they will be ignored by the new code.
-- After successful deployment, we can DROP them: resources, rates, buildings, fleet, planets.
