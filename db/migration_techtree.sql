-- AIKA WORLD — Tech Tree Requirements Migration
-- Adds 'req' field to default templates for buildings, research, and fleet.

-- 1. Update default buildings
UPDATE default_buildings SET data = '[
    {"id":"metal_mine","name":"Fémolvasztó","icon":"⚙️","level":1,"baseCost":{"metal":60,"crystal":15},"type":"production"},
    {"id":"crystal_mine","name":"Kristálybánya","icon":"💎","level":1,"baseCost":{"metal":48,"crystal":24},"type":"production","req":{"buildings":{"metal_mine":2}}},
    {"id":"solar","name":"Napelemfarm","icon":"☀️","level":1,"baseCost":{"metal":75,"crystal":30},"type":"production"},
    {"id":"deusium","name":"Déusium Reaktor","icon":"🔮","level":1,"baseCost":{"metal":200,"crystal":100},"type":"production","req":{"buildings":{"solar":3}}},
    {"id":"storage_metal","name":"Fémtároló","icon":"🗄️","level":1,"baseCost":{"metal":100,"crystal":0},"type":"infra"},
    {"id":"storage_crystal","name":"Kristálytároló","icon":"💠","level":1,"baseCost":{"metal":80,"crystal":40},"type":"infra"},
    {"id":"robotics","name":"Robot Gyár","icon":"🤖","level":1,"baseCost":{"metal":400,"crystal":120},"type":"infra","req":{"buildings":{"lab":1}}},
    {"id":"shipyard","name":"Hajógyár","icon":"🏭","level":1,"baseCost":{"metal":400,"crystal":200},"type":"infra","req":{"buildings":{"robotics":2}}},
    {"id":"lab","name":"Kutatólabor","icon":"🔬","level":1,"baseCost":{"metal":200,"crystal":400},"type":"infra"},
    {"id":"defense","name":"Védelmi Rendszer","icon":"🛡️","level":1,"baseCost":{"metal":200,"crystal":150},"type":"infra","req":{"buildings":{"shipyard":1}}}
]';

-- 2. Update default research
UPDATE default_research SET data = '[
    {"id":"combat","name":"Harci Technológia","icon":"⚔️","level":0,"max":20,"desc":"Növeli a flotta tűzerejét szintenként +10%-kal.","req":{"buildings":{"lab":1}}},
    {"id":"drive","name":"Ionhajtómű","icon":"🚀","level":0,"max":15,"desc":"Fejlettebb hajtórendszer, +15% sebesség szintenként.","req":{"buildings":{"lab":2}}},
    {"id":"shield","name":"Pajzstechnológia","icon":"🛡️","level":0,"max":20,"desc":"Pajzserejed +10%-kal nő szintenként.","req":{"research":{"energy_tech":3},"buildings":{"lab":4}}},
    {"id":"astro","name":"Asztrofizika","icon":"🔭","level":0,"max":10,"desc":"Újabb bolygókat gyarmatosíthatsz. Max bolygó: Szint+1.","req":{"research":{"spy":4,"drive":3},"buildings":{"lab":3}}},
    {"id":"energy_tech","name":"Energiatechnológia","icon":"⚡","level":0,"max":20,"desc":"Energiatermelés +8% szintenként.","req":{"buildings":{"lab":1}}},
    {"id":"computer","name":"Számítógép Technológia","icon":"💻","level":0,"max":20,"desc":"+1 flottaslot szintenként.","req":{"buildings":{"lab":1}}},
    {"id":"spy","name":"Kémtechnológia","icon":"🔍","level":0,"max":20,"desc":"Fejlettebb kémjelentések a felderítőktől.","req":{"buildings":{"lab":3}}},
    {"id":"hyper","name":"Hipertér Technológia","icon":"🌀","level":0,"max":15,"desc":"Raktárkapacitás és hatótáv növelése szintenként.","req":{"research":{"energy_tech":5},"buildings":{"lab":7}}},
    {"id":"laser","name":"Lézer Technológia","icon":"🔴","level":0,"max":20,"desc":"Alapja a fejlettebb fegyvereknek. +5% tűzerő.","req":{"research":{"energy_tech":2},"buildings":{"lab":1}}},
    {"id":"plasma","name":"Plazma Technológia","icon":"💥","level":0,"max":10,"desc":"Csúcsfegyver technológia. Szükséges: Lézer 10.","req":{"research":{"laser":10,"energy_tech":8},"buildings":{"lab":4}}}
]';

-- 3. Update default fleet
UPDATE default_fleet SET data = '[
    {"id":"fighter_s","name":"Kis Vadász","icon":"✈️","count":0,"attack":50,"shield":10,"cargo":0,"speed":12500,"cost":{"metal":3000,"crystal":1000},"req":{"buildings":{"shipyard":1}}},
    {"id":"fighter_l","name":"Nagy Vadász","icon":"🛸","count":0,"attack":400,"shield":100,"cargo":0,"speed":8000,"cost":{"metal":25000,"crystal":7500},"req":{"buildings":{"shipyard":2}}},
    {"id":"cruiser","name":"Cirkáló","icon":"🚀","count":0,"attack":800,"shield":400,"cargo":800,"speed":5000,"cost":{"metal":50000,"crystal":15000},"req":{"buildings":{"shipyard":3},"research":{"drive":3}}},
    {"id":"battleship","name":"Csatahajó","icon":"🛰️","count":0,"attack":4000,"shield":2000,"cargo":1500,"speed":3000,"cost":{"metal":150000,"crystal":50000},"req":{"buildings":{"shipyard":4},"research":{"drive":5,"hyper":2}}},
    {"id":"miner","name":"Bányász","icon":"⛏️","count":0,"attack":5,"shield":25,"cargo":5000,"speed":3000,"cost":{"metal":10000,"crystal":20000},"req":{"buildings":{"shipyard":1}}},
    {"id":"colony","name":"Gyarmatosító","icon":"🌍","count":0,"attack":0,"shield":100,"cargo":7500,"speed":2500,"cost":{"metal":10000,"crystal":20000},"req":{"buildings":{"shipyard":2},"research":{"astro":1}}}
]';
