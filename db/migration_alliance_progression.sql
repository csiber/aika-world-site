-- AIKA WORLD — Alliance Progression Migration
-- Adds level, exp, and resource bank (vault) to alliances.

ALTER TABLE alliances ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE alliances ADD COLUMN exp   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE alliances ADD COLUMN vault TEXT NOT NULL DEFAULT '{"metal":0,"crystal":0,"deus":0}';
