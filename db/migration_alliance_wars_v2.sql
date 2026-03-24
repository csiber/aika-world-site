-- AIKA WORLD — Alliance Wars v2 Migration
-- Extends alliance_wars with war goals, tracking, and contribution tables.

-- New columns for war goals and duration
ALTER TABLE alliance_wars ADD COLUMN goal_type TEXT DEFAULT 'score';
ALTER TABLE alliance_wars ADD COLUMN goal_target INTEGER DEFAULT 100000;
ALTER TABLE alliance_wars ADD COLUMN ends_at INTEGER;
ALTER TABLE alliance_wars ADD COLUMN winner_id TEXT;

-- War contributions tracking per member
CREATE TABLE IF NOT EXISTS war_contributions (
  id TEXT PRIMARY KEY,
  war_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  alliance_id TEXT NOT NULL,
  damage_dealt INTEGER DEFAULT 0,
  resources_raided INTEGER DEFAULT 0,
  battles_won INTEGER DEFAULT 0,
  updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_war_contrib ON war_contributions(war_id, alliance_id);
CREATE INDEX IF NOT EXISTS idx_war_contrib_user ON war_contributions(war_id, user_id);
