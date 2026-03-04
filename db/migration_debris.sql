-- AIKA WORLD — Debris Fields & Recyclers Migration
-- Adds debris fields to galaxy coordinates and registers the Recycler ship.

ALTER TABLE galaxy_map ADD COLUMN debris_metal   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE galaxy_map ADD COLUMN debris_crystal INTEGER NOT NULL DEFAULT 0;

-- Update default fleet to include Recycler
-- Recycler: id='recycler', cargo=20000, speed=2000
UPDATE default_fleet SET data = '[
  {"id":"fighter_s","name":"Könnyű Vadász","icon":"🚀","count":0,"attack":50,"shield":10,"cargo":50,"speed":10000,"cost":{"metal":3000,"crystal":1000}},
  {"id":"fighter_l","name":"Nehéz Vadász","icon":"🛸","count":0,"attack":150,"shield":25,"cargo":100,"speed":8000,"cost":{"metal":10000,"crystal":6000}},
  {"id":"miner","name":"Kis Szállító","icon":"🚛","count":0,"attack":5,"shield":5,"cargo":5000,"speed":5000,"cost":{"metal":2000,"crystal":2000}},
  {"id":"cruiser","name":"Cirkáló","icon":"🚢","count":0,"attack":400,"shield":50,"cargo":800,"speed":7000,"cost":{"metal":20000,"crystal":7000,"deus":2000}},
  {"id":"battleship","name":"Csatahajó","icon":"🛰️","count":0,"attack":1000,"shield":200,"cargo":1500,"speed":6000,"cost":{"metal":45000,"crystal":15000}},
  {"id":"recycler","name":"Szemétgyűjtő","icon":"♻️","count":0,"attack":1,"shield":10,"cargo":20000,"speed":2000,"cost":{"metal":10000,"crystal":6000,"deus":2000}},
  {"id":"colony","name":"Gyarmatosító","icon":"🌍","count":0,"attack":0,"shield":100,"cargo":7500,"speed":2500,"cost":{"metal":10000,"crystal":20000}}
]';
