CREATE TABLE IF NOT EXISTS dm_shop (
  id TEXT PRIMARY KEY,
  item_key TEXT UNIQUE NOT NULL,
  name_key TEXT NOT NULL,
  description_key TEXT NOT NULL,
  cost_dm INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  effect_json TEXT DEFAULT '{}',
  max_purchases INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dm_purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_key TEXT NOT NULL,
  purchased_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dm_purchases_user ON dm_purchases(user_id, item_key);

-- Seed shop items
INSERT OR IGNORE INTO dm_shop (id, item_key, name_key, description_key, cost_dm, item_type, effect_json, max_purchases) VALUES
  ('1', 'skin_fighter_gold', 'shop.skin_fighter_gold', 'shop.skin_fighter_gold_desc', 50, 'cosmetic', '{"type":"skin","target":"fighter_s","value":"gold"}', 0),
  ('2', 'skin_battleship_red', 'shop.skin_battleship_red', 'shop.skin_battleship_red_desc', 100, 'cosmetic', '{"type":"skin","target":"battleship","value":"crimson"}', 0),
  ('3', 'skin_cruiser_neon', 'shop.skin_cruiser_neon', 'shop.skin_cruiser_neon_desc', 75, 'cosmetic', '{"type":"skin","target":"cruiser","value":"neon"}', 0),
  ('4', 'planet_rename', 'shop.planet_rename', 'shop.planet_rename_desc', 10, 'utility', '{"type":"rename"}', 0),
  ('5', 'planet_emoji', 'shop.planet_emoji', 'shop.planet_emoji_desc', 5, 'utility', '{"type":"emoji"}', 0),
  ('6', 'extra_queue_slot', 'shop.extra_queue', 'shop.extra_queue_desc', 500, 'upgrade', '{"type":"queue_slot","value":1}', 2),
  ('7', 'speed_boost', 'shop.speed_boost', 'shop.speed_boost_desc', 100, 'consumable', '{"type":"speed","value":0.25,"duration":3600000}', 0),
  ('8', 'badge_pioneer', 'shop.badge_pioneer', 'shop.badge_pioneer_desc', 20, 'cosmetic', '{"type":"badge","value":"pioneer"}', 1),
  ('9', 'badge_warlord', 'shop.badge_warlord', 'shop.badge_warlord_desc', 50, 'cosmetic', '{"type":"badge","value":"warlord"}', 1),
  ('10', 'badge_explorer', 'shop.badge_explorer', 'shop.badge_explorer_desc', 30, 'cosmetic', '{"type":"badge","value":"explorer"}', 1);
