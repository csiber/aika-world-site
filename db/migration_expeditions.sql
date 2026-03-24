CREATE TABLE IF NOT EXISTS expedition_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mission_id TEXT,
  event_type TEXT NOT NULL,
  choice_made TEXT,
  outcome_json TEXT DEFAULT '{}',
  chain_id TEXT,
  chain_step INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expedition_user ON expedition_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_expedition_chain ON expedition_log(user_id, chain_id);
