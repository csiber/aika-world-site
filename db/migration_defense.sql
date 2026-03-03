-- AIKA WORLD — Defense Systems Migration
-- Adds 'defense' column to planets and creates default defense units template.

ALTER TABLE planets ADD COLUMN defense TEXT NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS default_defense (
  data TEXT NOT NULL
);

INSERT INTO default_defense (data) VALUES (
  '[
    {"id":"missile_turret","name":"Rakétatorony","icon":"🚀","count":0,"attack":80,"shield":20,"cost":{"metal":2000,"crystal":0},"req":{"buildings":{"shipyard":1}}},
    {"id":"laser_cannon","name":"Lézerágyú","icon":"🚨","count":0,"attack":150,"shield":100,"cost":{"metal":6000,"crystal":2000},"req":{"buildings":{"shipyard":2},"research":{"laser":3}}},
    {"id":"plasma_turret","name":"Plazmaágyú","icon":"💥","count":0,"attack":3000,"shield":2000,"cost":{"metal":50000,"crystal":50000},"req":{"buildings":{"shipyard":4},"research":{"plasma":1}}},
    {"id":"small_shield_dome","name":"Kis Pajzskupola","icon":"🛡️","count":0,"attack":1,"shield":2000,"cost":{"metal":10000,"crystal":10000},"req":{"buildings":{"shipyard":2},"research":{"shield":2}}},
    {"id":"large_shield_dome","name":"Nagy Pajzskupola","icon":"💠","count":0,"attack":1,"shield":10000,"cost":{"metal":50000,"crystal":50000},"req":{"buildings":{"shipyard":6},"research":{"shield":6}}}
  ]'
);
