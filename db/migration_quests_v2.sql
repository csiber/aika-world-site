-- migration_quests_v2.sql
-- Extends user_quests table for daily/weekly quest system v2

ALTER TABLE user_quests ADD COLUMN description_key TEXT DEFAULT '';
ALTER TABLE user_quests ADD COLUMN reward_json TEXT DEFAULT '{}';
ALTER TABLE user_quests ADD COLUMN reward_dm INTEGER DEFAULT 0;
ALTER TABLE user_quests ADD COLUMN claimed_at INTEGER;
ALTER TABLE user_quests ADD COLUMN quest_period TEXT DEFAULT 'daily';

CREATE INDEX IF NOT EXISTS idx_quests_expires ON user_quests(expires_at);
CREATE INDEX IF NOT EXISTS idx_quests_user_period ON user_quests(user_id, quest_period, is_claimed);
