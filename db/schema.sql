-- ============================================================
-- AIKA COLONY — Cloudflare D1 Schema
-- Run: wrangler d1 execute aika-colony-db --file=./db/schema.sql
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  username    TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password    TEXT NOT NULL,  -- bcrypt hash
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login  INTEGER
);

-- Game state per user
CREATE TABLE IF NOT EXISTS game_state (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score         INTEGER NOT NULL DEFAULT 0,
  resources     TEXT NOT NULL DEFAULT '{"metal":5000,"crystal":2000,"energy":1000,"deus":100}',
  rates         TEXT NOT NULL DEFAULT '{"metal":60,"crystal":30,"energy":15,"deus":3}',
  buildings     TEXT NOT NULL DEFAULT '[]',
  research      TEXT NOT NULL DEFAULT '[]',
  fleet         TEXT NOT NULL DEFAULT '[]',
  planets       TEXT NOT NULL DEFAULT '[]',
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Build queue (active constructions)
CREATE TABLE IF NOT EXISTS build_queue (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL,       -- building/research/fleet id
  item_type   TEXT NOT NULL,       -- 'building' | 'research' | 'fleet'
  item_name   TEXT NOT NULL,
  target_level INTEGER NOT NULL,
  finish_at   INTEGER NOT NULL,    -- unix timestamp when done
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Rankings cache (updated every 5 min via game_state.score)
CREATE TABLE IF NOT EXISTS rankings (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  score       INTEGER NOT NULL DEFAULT 0,
  rank        INTEGER,
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_build_queue_user ON build_queue(user_id, finish_at);
CREATE INDEX IF NOT EXISTS idx_rankings_score ON rankings(score DESC);

-- ============================================================
-- Seed default buildings template (used when new user registers)
-- ============================================================
CREATE TABLE IF NOT EXISTS default_buildings (
  data TEXT NOT NULL
);

DELETE FROM default_buildings;
INSERT INTO default_buildings(data) VALUES (
  '[
    {"id":"metal_mine","name":"Fémolvasztó","icon":"⚙️","level":1,"baseCost":{"metal":60,"crystal":15},"type":"production"},
    {"id":"crystal_mine","name":"Kristálybánya","icon":"💎","level":1,"baseCost":{"metal":48,"crystal":24},"type":"production"},
    {"id":"solar","name":"Napelemfarm","icon":"☀️","level":1,"baseCost":{"metal":75,"crystal":30},"type":"production"},
    {"id":"deusium","name":"Déusium Reaktor","icon":"🔮","level":1,"baseCost":{"metal":200,"crystal":100},"type":"production"},
    {"id":"storage_metal","name":"Fémtároló","icon":"🗄️","level":1,"baseCost":{"metal":100,"crystal":0},"type":"infra"},
    {"id":"storage_crystal","name":"Kristálytároló","icon":"💠","level":1,"baseCost":{"metal":80,"crystal":40},"type":"infra"},
    {"id":"robotics","name":"Robot Gyár","icon":"🤖","level":1,"baseCost":{"metal":400,"crystal":120},"type":"infra"},
    {"id":"shipyard","name":"Hajógyár","icon":"🏭","level":1,"baseCost":{"metal":400,"crystal":200},"type":"infra"},
    {"id":"lab","name":"Kutatólabor","icon":"🔬","level":1,"baseCost":{"metal":200,"crystal":400},"type":"infra"},
    {"id":"defense","name":"Védelmi Rendszer","icon":"🛡️","level":1,"baseCost":{"metal":200,"crystal":150},"type":"infra"}
  ]'
);

CREATE TABLE IF NOT EXISTS default_research (
  data TEXT NOT NULL
);

DELETE FROM default_research;
INSERT INTO default_research(data) VALUES (
  '[
    {"id":"combat","name":"Harci Technológia","icon":"⚔️","level":0,"max":20,"desc":"Növeli a flotta tűzerejét szintenként +10%-kal."},
    {"id":"drive","name":"Ionhajtómű","icon":"🚀","level":0,"max":15,"desc":"Fejlettebb hajtórendszer, +15% sebesség szintenként."},
    {"id":"shield","name":"Pajzstechnológia","icon":"🛡️","level":0,"max":20,"desc":"Pajzserejed +10%-kal nő szintenként."},
    {"id":"astro","name":"Asztrofizika","icon":"🔭","level":0,"max":10,"desc":"Újabb bolygókat gyarmatosíthatsz. Max bolygó: Szint+1."},
    {"id":"energy_tech","name":"Energiatechnológia","icon":"⚡","level":0,"max":20,"desc":"Energiatermelés +8% szintenként."},
    {"id":"computer","name":"Számítógép Technológia","icon":"💻","level":0,"max":20,"desc":"+1 flottaslot szintenként."},
    {"id":"spy","name":"Kémtechnológia","icon":"🔍","level":0,"max":20,"desc":"Fejlettebb kémjelentések a felderítőktől."},
    {"id":"hyper","name":"Hipertér Technológia","icon":"🌀","level":0,"max":15,"desc":"Raktárkapacitás és hatótáv növelése szintenként."},
    {"id":"laser","name":"Lézer Technológia","icon":"🔴","level":0,"max":20,"desc":"Alapja a fejlettebb fegyvereknek. +5% tűzerő."},
    {"id":"plasma","name":"Plazma Technológia","icon":"💥","level":0,"max":10,"desc":"Csúcsfegyver technológia. Szükséges: Lézer 10."}
  ]'
);

CREATE TABLE IF NOT EXISTS default_fleet (
  data TEXT NOT NULL
);

DELETE FROM default_fleet;
INSERT INTO default_fleet(data) VALUES (
  '[
    {"id":"fighter_s","name":"Kis Vadász","icon":"✈️","count":0,"attack":50,"shield":10,"cargo":0,"speed":12500,"cost":{"metal":3000,"crystal":1000}},
    {"id":"fighter_l","name":"Nagy Vadász","icon":"🛸","count":0,"attack":400,"shield":100,"cargo":0,"speed":8000,"cost":{"metal":25000,"crystal":7500}},
    {"id":"cruiser","name":"Cirkáló","icon":"🚀","count":0,"attack":800,"shield":400,"cargo":800,"speed":5000,"cost":{"metal":50000,"crystal":15000}},
    {"id":"battleship","name":"Csatahajó","icon":"🛰️","count":0,"attack":4000,"shield":2000,"cargo":1500,"speed":3000,"cost":{"metal":150000,"crystal":50000}},
    {"id":"miner","name":"Bányász","icon":"⛏️","count":0,"attack":5,"shield":25,"cargo":5000,"speed":3000,"cost":{"metal":10000,"crystal":20000}},
    {"id":"colony","name":"Gyarmatosító","icon":"🌍","count":0,"attack":0,"shield":100,"cargo":7500,"speed":2500,"cost":{"metal":10000,"crystal":20000}}
  ]'
);
