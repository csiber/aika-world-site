CREATE TABLE IF NOT EXISTS event_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_event_scores ON event_scores(event_id, score DESC);
