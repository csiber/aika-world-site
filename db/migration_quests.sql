-- AIKA WORLD — Daily Quests Migration
-- Tracks daily progress and rewards.

CREATE TABLE IF NOT EXISTS user_quests (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_type    TEXT NOT NULL, -- 'build', 'upgrade', 'mission', 'donate'
  target_id     TEXT,          -- e.g., 'fighter_s' or NULL for any
  required      INTEGER NOT NULL,
  current       INTEGER NOT NULL DEFAULT 0,
  reward_metal  INTEGER NOT NULL DEFAULT 0,
  reward_deus   INTEGER NOT NULL DEFAULT 0,
  is_claimed    INTEGER NOT NULL DEFAULT 0,
  expires_at    INTEGER NOT NULL,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_user_quests_user ON user_quests(user_id, expires_at);
