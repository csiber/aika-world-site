-- AIKA WORLD — Debris Fields & Recyclers Migration
-- Adds debris fields to galaxy coordinates and registers the Recycler ship.

ALTER TABLE galaxy_map ADD COLUMN debris_metal   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE galaxy_map ADD COLUMN debris_crystal INTEGER NOT NULL DEFAULT 0;

-- Update default fleet to include Recycler
-- We need to find the current fleet template, add the new ship, and update it.
-- This logic assumes we append to the existing JSON.

UPDATE default_fleet SET data = '[
    {"id":"fighter_s","name":"Kis Vadász","icon":"✈️","count":0,"attack":50,"shield":10,"cargo":0,"speed":12500,"cost":{"metal":3000,"crystal":1000},"req":{"buildings":{"shipyard":1}}},
    {"id":"fighter_l","name":"Nagy Vadász","icon":"🛸","count":0,"attack":400,"shield":100,"cargo":0,"speed":8000,"cost":{"metal":25000,"crystal":7500},"req":{"buildings":{"shipyard":2}}},
    {"id":"cruiser","name":"Cirkáló","icon":"🚀","count":0,"attack":800,"shield":400,"cargo":800,"speed":5000,"cost":{"metal":50000,"crystal":15000},"req":{"buildings":{"shipyard":3},"research":{"drive":3}}},
    {"id":"battleship","name":"Csatahajó","icon":"🛰️","count":0,"attack":4000,"shield":2000,"cargo":1500,"speed":3000,"cost":{"metal":150000,"crystal":50000},"req":{"buildings":{"shipyard":4},"research":{"drive":5,"hyper":2}}},
    {"id":"recycler","name":"Újrahasznosító","icon":"🚛","count":0,"attack":1,"shield":10,"cargo":20000,"speed":2000,"cost":{"metal":10000,"crystal":6000,"deus":2000},"req":{"buildings":{"shipyard":4},"research":{"drive":2}}},
    {"id":"miner","name":"Bányász","icon":"⛏️","count":0,"attack":5,"shield":25,"cargo":5000,"speed":3000,"cost":{"metal":10000,"crystal":20000},"req":{"buildings":{"shipyard":1}}},
    {"id":"colony","name":"Gyarmatosító","icon":"🌍","count":0,"attack":0,"shield":100,"cargo":7500,"speed":2500,"cost":{"metal":10000,"crystal":20000},"req":{"buildings":{"shipyard":2},"research":{"astro":1}}}
]';
