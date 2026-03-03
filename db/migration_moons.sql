-- AIKA WORLD — Moons Migration
-- Adds moons table and moon-specific buildings.

CREATE TABLE IF NOT EXISTS moons (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  planet_id   TEXT NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Hold',
  size        INTEGER NOT NULL DEFAULT 5000,
  buildings   TEXT NOT NULL DEFAULT '[]',
  fleet       TEXT NOT NULL DEFAULT '[]',
  defense     TEXT NOT NULL DEFAULT '[]',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(planet_id)
);

-- Register default moon buildings
CREATE TABLE IF NOT EXISTS default_moon_buildings (
  data TEXT NOT NULL
);

INSERT INTO default_moon_buildings (data) VALUES (
  '[
    {"id":"moon_base","name":"Holdbázis","icon":"🌑","level":1,"baseCost":{"metal":20000,"crystal":40000,"deus":20000},"type":"infra","desc":"Helyet biztosít a holdon lévő épületeknek. Minden szint +3 mező."},
    {"id":"sensor_phalanx","name":"Szenzor Phalanx","icon":"📡","level":1,"baseCost":{"metal":20000,"crystal":40000,"deus":20000},"type":"infra","desc":"Lehetővé teszi más flották mozgásának megfigyelését. Hatótáv: Szint^2 - 1."},
    {"id":"jump_gate","name":"Ugrókapu","icon":"🌀","level":1,"baseCost":{"metal":2000000,"crystal":4000000,"deus":2000000},"type":"infra","desc":"Azonnali flotta-áttelepítés a saját holdjaid között."}
  ]'
);
