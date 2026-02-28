-- AIKA WORLD — Galaxy map multi-planet migration
-- Adds is_main flag and changes PRIMARY KEY to (user_id, coords)
-- so colonized planets can appear on the galaxy map as separate rows.
-- Run: wrangler d1 execute aika-world-db --file=db/migration_galaxy_colonies.sql --remote

CREATE TABLE galaxy_map_new (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username     TEXT NOT NULL,
  planet_name  TEXT NOT NULL,
  planet_emoji TEXT NOT NULL DEFAULT '🌍',
  coords       TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  is_main      INTEGER NOT NULL DEFAULT 1,
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, coords)
);

INSERT INTO galaxy_map_new (user_id, username, planet_name, planet_emoji, coords, score, is_main, updated_at)
  SELECT user_id, username, planet_name, planet_emoji, coords, score, 1, updated_at
  FROM galaxy_map;

DROP TABLE galaxy_map;
ALTER TABLE galaxy_map_new RENAME TO galaxy_map;

CREATE INDEX IF NOT EXISTS idx_galaxy_map_score ON galaxy_map(score DESC);
CREATE INDEX IF NOT EXISTS idx_galaxy_map_user  ON galaxy_map(user_id);
