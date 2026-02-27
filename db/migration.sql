-- ============================================================
-- AIKA WORLD — Migration: Alliances + egyéb új táblák
-- wrangler d1 execute aika-world-db --file=./db/migration.sql
-- ============================================================

-- Szövetségek
CREATE TABLE IF NOT EXISTS alliances (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT NOT NULL UNIQUE,
  tag         TEXT NOT NULL UNIQUE,  -- 2-5 char, pl. "AIKA"
  description TEXT NOT NULL DEFAULT '',
  leader_id   TEXT NOT NULL REFERENCES users(id),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Szövetség tagok
CREATE TABLE IF NOT EXISTS alliance_members (
  alliance_id TEXT NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',  -- 'leader' | 'officer' | 'member'
  joined_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (alliance_id, user_id)
);

-- Szövetségi chat
CREATE TABLE IF NOT EXISTS alliance_chat (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  alliance_id TEXT NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  username    TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_alliance_members_user ON alliance_members(user_id);
CREATE INDEX IF NOT EXISTS idx_alliance_chat ON alliance_chat(alliance_id, created_at DESC);

-- Fleet missions (ha még nincs)
CREATE TABLE IF NOT EXISTS fleet_missions (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id TEXT,
  mission_type   TEXT NOT NULL,
  target_coords  TEXT NOT NULL,
  target_name    TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'travelling',
  result         TEXT,
  arrive_at      INTEGER NOT NULL,
  return_at      INTEGER,
  created_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Galaxy map (ha még nincs)
CREATE TABLE IF NOT EXISTS galaxy_map (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username     TEXT NOT NULL,
  planet_name  TEXT NOT NULL,
  planet_emoji TEXT NOT NULL DEFAULT '🌍',
  coords       TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_missions_user  ON fleet_missions(user_id, arrive_at);
CREATE INDEX IF NOT EXISTS idx_galaxy_coords  ON galaxy_map(coords);

-- Meglévő userek betöltése galaxy_map-be (ha üres)
INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score)
SELECT u.id, u.username, u.username || '''s Prime', '🌍', '[1:1:1]', COALESCE(r.score, 0)
FROM users u LEFT JOIN rankings r ON r.user_id = u.id;
