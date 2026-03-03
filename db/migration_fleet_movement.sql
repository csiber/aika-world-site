-- AIKA WORLD — Real Fleet Movement Migration
-- Adds origin_planet_id and ships to fleet_missions to track units.

ALTER TABLE fleet_missions ADD COLUMN origin_planet_id TEXT REFERENCES planets(id);
ALTER TABLE fleet_missions ADD COLUMN ships TEXT NOT NULL DEFAULT '[]';
-- Status can be: 'travelling', 'returning', 'done'

-- Update existing missions (optional, usually empty during dev)
UPDATE fleet_missions SET origin_planet_id = (SELECT id FROM planets WHERE user_id = fleet_missions.user_id AND is_main = 1) WHERE origin_planet_id IS NULL;
