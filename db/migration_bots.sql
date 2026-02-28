-- AIKA WORLD — Bot migration
-- Run: wrangler d1 execute aika-world-db --file=db/migration_bots.sql --remote
ALTER TABLE users ADD COLUMN is_bot INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_bot ON users(is_bot);
