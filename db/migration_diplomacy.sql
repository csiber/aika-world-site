-- Diplomacy system: treaties between alliances
CREATE TABLE IF NOT EXISTS diplomacy (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  alliance_a_id TEXT NOT NULL,
  alliance_b_id TEXT NOT NULL,
  terms_json TEXT DEFAULT '{}',
  proposed_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  cooldown_until INTEGER
);

CREATE INDEX IF NOT EXISTS idx_diplo_alliances ON diplomacy(alliance_a_id, alliance_b_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_diplo_unique ON diplomacy(alliance_a_id, alliance_b_id, type, status) WHERE status IN ('pending', 'active');
