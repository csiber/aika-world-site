-- AIKA WORLD — Alliance Wars Migration
-- Adds tables for tracking wars between alliances.

CREATE TABLE IF NOT EXISTS alliance_wars (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  attacker_id       TEXT NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  defender_id       TEXT NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'active', -- 'active', 'ended'
  started_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  ended_at          INTEGER,
  attacker_score    INTEGER DEFAULT 0,
  defender_score    INTEGER DEFAULT 0,
  UNIQUE(attacker_id, defender_id, status)
);

-- For ACS (Joint Attacks)
ALTER TABLE fleet_missions ADD COLUMN union_id TEXT; -- Links multiple missions to a single group attack
