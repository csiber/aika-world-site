-- Add resources/rates columns to moons table
ALTER TABLE moons ADD COLUMN resources TEXT DEFAULT '{"metal":0,"crystal":0,"deus":0,"energy":0}';
ALTER TABLE moons ADD COLUMN rates TEXT DEFAULT '{"metal":0,"crystal":0,"deus":0,"energy":0}';
