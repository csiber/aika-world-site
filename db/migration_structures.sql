-- Alliance mega-structures (Space Stations)
CREATE TABLE IF NOT EXISTS alliance_structures (
  id TEXT PRIMARY KEY,
  alliance_id TEXT NOT NULL,
  type TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  hp INTEGER DEFAULT 10000,
  max_hp INTEGER DEFAULT 10000,
  total_metal INTEGER DEFAULT 0,
  total_crystal INTEGER DEFAULT 0,
  total_deus INTEGER DEFAULT 0,
  built_at INTEGER
);

CREATE TABLE IF NOT EXISTS alliance_contributions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  structure_id TEXT NOT NULL,
  metal INTEGER DEFAULT 0,
  crystal INTEGER DEFAULT 0,
  deus INTEGER DEFAULT 0,
  contributed_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_struct_alliance ON alliance_structures(alliance_id);
CREATE INDEX IF NOT EXISTS idx_contrib_struct ON alliance_contributions(structure_id);
