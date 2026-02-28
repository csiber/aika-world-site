/**
 * AIKA WORLD — NPC Bot utilities
 * seedBots(env)     — idempotently creates all 25 bot players
 * simulateBots(env) — one hourly tick: grows each bot's score
 */

// ── Bot definitions ────────────────────────────────────────────────────────
// tier growth is applied once per cron tick (hourly)
const BOT_DEFINITIONS = [
  // Elite (6) — score 300k–1.2M, growth +8000–18000/h
  { username: 'VörösOrion',       tier: 'elite',    initialScore: 1200000, growthMin:  8000, growthMax: 18000, planet: 'Vörös Orion Főbolygó',      coords: '[1:1:1]',   emoji: '🔴' },
  { username: 'KozmikosSas',      tier: 'elite',    initialScore:  950000, growthMin:  8000, growthMax: 15000, planet: 'Kozmikus Fészek',            coords: '[1:2:3]',   emoji: '🌌' },
  { username: 'NébulaHarcos',     tier: 'elite',    initialScore:  750000, growthMin:  8000, growthMax: 13000, planet: 'Nebula Erőd',                coords: '[2:1:5]',   emoji: '💜' },
  { username: 'GalaktikusFarkas', tier: 'elite',    initialScore:  600000, growthMin:  8000, growthMax: 11000, planet: 'Farkashold',                 coords: '[2:3:2]',   emoji: '🐺' },
  { username: 'ÉgiVihar',         tier: 'elite',    initialScore:  450000, growthMin:  8000, growthMax: 10000, planet: 'Viharvilág',                 coords: '[3:1:7]',   emoji: '⚡' },
  { username: 'StarForge_X',      tier: 'elite',    initialScore:  300000, growthMin:  8000, growthMax:  9000, planet: 'StarForge Nexus',            coords: '[3:4:1]',   emoji: '⭐' },

  // Advanced (9) — score 50k–300k, growth +2000–6000/h
  { username: 'NovaKommandó',     tier: 'advanced', initialScore:  280000, growthMin:  2000, growthMax:  6000, planet: 'Nova Citadella',             coords: '[1:3:8]',   emoji: '💫' },
  { username: 'CsillagVadász',    tier: 'advanced', initialScore:  220000, growthMin:  2000, growthMax:  5500, planet: 'Vadász Főhadiszállás',       coords: '[2:5:4]',   emoji: '🌟' },
  { username: 'PlazmaŐrző',       tier: 'advanced', initialScore:  180000, growthMin:  2000, growthMax:  5000, planet: 'Plazma Bástya',              coords: '[3:2:9]',   emoji: '🔵' },
  { username: 'DeusiumLord',      tier: 'advanced', initialScore:  150000, growthMin:  2000, growthMax:  4500, planet: 'Déusium Trón',               coords: '[4:1:3]',   emoji: '🔮' },
  { username: 'IronNebula_7',     tier: 'advanced', initialScore:  120000, growthMin:  2000, growthMax:  4000, planet: 'Vas Nebula Alpha',           coords: '[4:3:6]',   emoji: '🌫️' },
  { username: 'AranyCsillag',     tier: 'advanced', initialScore:   90000, growthMin:  2000, growthMax:  3500, planet: 'Arany Naprendszer',          coords: '[5:1:2]',   emoji: '🌠' },
  { username: 'TüzesKomét',       tier: 'advanced', initialScore:   80000, growthMin:  2000, growthMax:  3000, planet: 'Tüzes Pálya',                coords: '[5:4:7]',   emoji: '☄️' },
  { username: 'KvazárVadász',     tier: 'advanced', initialScore:   65000, growthMin:  2000, growthMax:  2500, planet: 'Kvazár Ütközőpont',          coords: '[1:5:10]',  emoji: '🌀' },
  { username: 'FénylőFelhő',      tier: 'advanced', initialScore:   50000, growthMin:  2000, growthMax:  2200, planet: 'Fényfelhő Peremvilág',       coords: '[2:4:11]',  emoji: '☁️' },

  // Beginner (10) — score 2k–50k, growth +200–1500/h
  { username: 'KristályBirodalom', tier: 'beginner', initialScore:  45000, growthMin:   200, growthMax:  1500, planet: 'Kristály Kezdőbolygó',      coords: '[3:5:3]',   emoji: '💎' },
  { username: 'FémImperium',       tier: 'beginner', initialScore:  35000, growthMin:   200, growthMax:  1200, planet: 'Fém Birodalom I.',           coords: '[4:2:8]',   emoji: '⚙️' },
  { username: 'SolarDragon',       tier: 'beginner', initialScore:  25000, growthMin:   200, growthMax:  1000, planet: 'Solar Sárkány Világa',       coords: '[5:3:5]',   emoji: '🐉' },
  { username: 'VoidWalker',        tier: 'beginner', initialScore:  18000, growthMin:   200, growthMax:   800, planet: 'Void Vándor Bázis',          coords: '[1:4:6]',   emoji: '🌑' },
  { username: 'CosmicWarrior',     tier: 'beginner', initialScore:  12000, growthMin:   200, growthMax:   600, planet: 'Kozmikus Harcos Tábor',      coords: '[2:2:12]',  emoji: '⚔️' },
  { username: 'OrionBrigade',      tier: 'beginner', initialScore:   8000, growthMin:   200, growthMax:   500, planet: 'Orion Dandár Bolygó',        coords: '[3:3:9]',   emoji: '🎯' },
  { username: 'ZephyrStorm',       tier: 'beginner', initialScore:   5000, growthMin:   200, growthMax:   400, planet: 'Zefír Viharvilág',           coords: '[4:5:1]',   emoji: '🌪️' },
  { username: 'NeutronFlux',       tier: 'beginner', initialScore:   4000, growthMin:   200, growthMax:   300, planet: 'Neutron Fluxus Állomás',     coords: '[5:2:4]',   emoji: '⚛️' },
  { username: 'PlazmaBrigád',      tier: 'beginner', initialScore:   3000, growthMin:   200, growthMax:   250, planet: 'Plazma Brigád Bázis',        coords: '[1:6:2]',   emoji: '🔥' },
  { username: 'QuantumKnight',     tier: 'beginner', initialScore:   2000, growthMin:   200, growthMax:   200, planet: 'Quantum Lovag Erőd',         coords: '[2:6:7]',   emoji: '🛡️' },
];

// ── Game state builder ─────────────────────────────────────────────────────
const TIER_BUILDINGS = {
  elite:    { metal_mine: 18, crystal_mine: 16, solar: 15, deusium: 14, storage_metal: 15, storage_crystal: 14, robotics: 15, shipyard: 18, lab: 16, defense: 15 },
  advanced: { metal_mine: 10, crystal_mine:  9, solar:  8, deusium:  7, storage_metal:  9, storage_crystal:  8, robotics:  8, shipyard: 10, lab:  9, defense:  7 },
  beginner: { metal_mine:  3, crystal_mine:  3, solar:  2, deusium:  2, storage_metal:  3, storage_crystal:  2, robotics:  2, shipyard:  3, lab:  2, defense:  2 },
};

const TIER_RESEARCH = {
  elite:    { combat: 15, drive: 12, shield: 14, astro:  8, energy_tech: 13, computer: 12, spy: 10, hyper: 11, laser: 12, plasma:  8 },
  advanced: { combat:  7, drive:  6, shield:  7, astro:  3, energy_tech:  6, computer:  5, spy:  5, hyper:  5, laser:  6, plasma:  3 },
  beginner: { combat:  2, drive:  2, shield:  2, astro:  1, energy_tech:  2, computer:  1, spy:  1, hyper:  1, laser:  2, plasma:  0 },
};

const TIER_FLEET = {
  elite:    { fighter_s: 5000, fighter_l: 1200, cruiser: 400, battleship: 150, miner: 80, colony: 20 },
  advanced: { fighter_s:  800, fighter_l:  150, cruiser:  50, battleship:  15, miner: 20, colony:  5 },
  beginner: { fighter_s:   50, fighter_l:   10, cruiser:   3, battleship:   0, miner:  5, colony:  1 },
};

function buildBotGameState(bot) {
  const bl = TIER_BUILDINGS[bot.tier];
  const rl = TIER_RESEARCH[bot.tier];
  const fl = TIER_FLEET[bot.tier];

  const buildings = [
    { id: 'metal_mine',      name: 'Fémolvasztó',       icon: '⚙️',  level: bl.metal_mine,      baseCost: { metal:  60, crystal:  15 }, type: 'production' },
    { id: 'crystal_mine',    name: 'Kristálybánya',      icon: '💎',  level: bl.crystal_mine,    baseCost: { metal:  48, crystal:  24 }, type: 'production' },
    { id: 'solar',           name: 'Napelemfarm',        icon: '☀️',  level: bl.solar,           baseCost: { metal:  75, crystal:  30 }, type: 'production' },
    { id: 'deusium',         name: 'Déusium Reaktor',    icon: '🔮',  level: bl.deusium,         baseCost: { metal: 200, crystal: 100 }, type: 'production' },
    { id: 'storage_metal',   name: 'Fémtároló',          icon: '🗄️',  level: bl.storage_metal,   baseCost: { metal: 100, crystal:   0 }, type: 'infra' },
    { id: 'storage_crystal', name: 'Kristálytároló',     icon: '💠',  level: bl.storage_crystal, baseCost: { metal:  80, crystal:  40 }, type: 'infra' },
    { id: 'robotics',        name: 'Robot Gyár',         icon: '🤖',  level: bl.robotics,        baseCost: { metal: 400, crystal: 120 }, type: 'infra' },
    { id: 'shipyard',        name: 'Hajógyár',           icon: '🏭',  level: bl.shipyard,        baseCost: { metal: 400, crystal: 200 }, type: 'infra' },
    { id: 'lab',             name: 'Kutatólabor',        icon: '🔬',  level: bl.lab,             baseCost: { metal: 200, crystal: 400 }, type: 'infra' },
    { id: 'defense',         name: 'Védelmi Rendszer',   icon: '🛡️',  level: bl.defense,         baseCost: { metal: 200, crystal: 150 }, type: 'infra' },
  ];

  const research = [
    { id: 'combat',      name: 'Harci Technológia',        icon: '⚔️',  level: rl.combat,      max: 20 },
    { id: 'drive',       name: 'Ionhajtómű',               icon: '🚀',  level: rl.drive,       max: 15 },
    { id: 'shield',      name: 'Pajzstechnológia',          icon: '🛡️',  level: rl.shield,      max: 20 },
    { id: 'astro',       name: 'Asztrofizika',              icon: '🔭',  level: rl.astro,       max: 10 },
    { id: 'energy_tech', name: 'Energiatechnológia',        icon: '⚡',  level: rl.energy_tech, max: 20 },
    { id: 'computer',    name: 'Számítógép Technológia',    icon: '💻',  level: rl.computer,    max: 20 },
    { id: 'spy',         name: 'Kémtechnológia',            icon: '🔍',  level: rl.spy,         max: 20 },
    { id: 'hyper',       name: 'Hipertér Technológia',      icon: '🌀',  level: rl.hyper,       max: 15 },
    { id: 'laser',       name: 'Lézer Technológia',         icon: '🔴',  level: rl.laser,       max: 20 },
    { id: 'plasma',      name: 'Plazma Technológia',        icon: '💥',  level: rl.plasma,      max: 10 },
  ];

  const fleet = [
    { id: 'fighter_s',  name: 'Kis Vadász',     icon: '✈️',  count: fl.fighter_s,  attack:    50, shield:    10, cargo:    0, speed: 12500, cost: { metal:   3000, crystal:  1000 } },
    { id: 'fighter_l',  name: 'Nagy Vadász',    icon: '🛸',  count: fl.fighter_l,  attack:   400, shield:   100, cargo:    0, speed:  8000, cost: { metal:  25000, crystal:  7500 } },
    { id: 'cruiser',    name: 'Cirkáló',        icon: '🚀',  count: fl.cruiser,    attack:   800, shield:   400, cargo:  800, speed:  5000, cost: { metal:  50000, crystal: 15000 } },
    { id: 'battleship', name: 'Csatahajó',      icon: '🛰️',  count: fl.battleship, attack:  4000, shield:  2000, cargo: 1500, speed:  3000, cost: { metal: 150000, crystal: 50000 } },
    { id: 'miner',      name: 'Bányász',        icon: '⛏️',  count: fl.miner,      attack:     5, shield:    25, cargo: 5000, speed:  3000, cost: { metal:  10000, crystal: 20000 } },
    { id: 'colony',     name: 'Gyarmatosító',   icon: '🌍',  count: fl.colony,     attack:     0, shield:   100, cargo: 7500, speed:  2500, cost: { metal:  10000, crystal: 20000 } },
  ];

  const resources = {
    metal:   Math.floor(bot.initialScore * 0.30),
    crystal: Math.floor(bot.initialScore * 0.20),
    energy:  Math.floor(bot.initialScore * 0.05),
    deus:    Math.floor(bot.initialScore * 0.01),
  };

  const planets = [{ name: bot.planet, emoji: bot.emoji, coords: bot.coords }];

  return { buildings, research, fleet, resources, planets, score: bot.initialScore };
}

// ── seedBots ───────────────────────────────────────────────────────────────
export async function seedBots(env) {
  let created = 0;
  let skipped = 0;

  for (const bot of BOT_DEFINITIONS) {
    // Idempotent check — skip if username already exists
    const existing = await env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).bind(bot.username).first();

    if (existing) {
      skipped++;
      continue;
    }

    const userId = crypto.randomUUID();
    const state  = buildBotGameState(bot);
    const email  = `bot.${bot.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}@aika.invalid`;

    await env.DB.batch([
      // users
      env.DB.prepare(
        `INSERT INTO users (id, username, email, password, is_admin, is_bot, created_at)
         VALUES (?, ?, ?, '$bot$no_login', 0, 1, unixepoch())`
      ).bind(userId, bot.username, email),

      // game_state
      env.DB.prepare(
        `INSERT INTO game_state (user_id, score, resources, rates, buildings, research, fleet, planets, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`
      ).bind(
        userId,
        bot.initialScore,
        JSON.stringify(state.resources),
        JSON.stringify({ metal: 60, crystal: 30, energy: 15, deus: 3 }),
        JSON.stringify(state.buildings),
        JSON.stringify(state.research),
        JSON.stringify(state.fleet),
        JSON.stringify(state.planets),
      ),

      // rankings
      env.DB.prepare(
        `INSERT INTO rankings (user_id, username, score, updated_at)
         VALUES (?, ?, ?, unixepoch())`
      ).bind(userId, bot.username, bot.initialScore),

      // galaxy_map
      env.DB.prepare(
        `INSERT INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, unixepoch())`
      ).bind(userId, bot.username, bot.planet, bot.emoji, bot.coords, bot.initialScore),
    ]);

    created++;
  }

  return { created, skipped, total: BOT_DEFINITIONS.length };
}

// ── simulateBots ───────────────────────────────────────────────────────────
export async function simulateBots(env) {
  // Build a quick lookup: username → definition
  const defMap = Object.fromEntries(BOT_DEFINITIONS.map(b => [b.username, b]));

  // Fetch all bots with current score
  const { results: bots } = await env.DB.prepare(
    `SELECT u.id, u.username, r.score
     FROM users u
     JOIN rankings r ON r.user_id = u.id
     WHERE u.is_bot = 1`
  ).all();

  if (!bots.length) return { updated: 0 };

  const updates = [];
  for (const bot of bots) {
    const def = defMap[bot.username];
    if (!def) continue;

    const growth = Math.floor(
      def.growthMin + Math.random() * (def.growthMax - def.growthMin)
    );
    const newScore = bot.score + growth;

    updates.push(
      env.DB.prepare('UPDATE rankings   SET score=?, updated_at=unixepoch() WHERE user_id=?').bind(newScore, bot.id),
      env.DB.prepare('UPDATE game_state SET score=?, updated_at=unixepoch() WHERE user_id=?').bind(newScore, bot.id),
      env.DB.prepare('UPDATE galaxy_map SET score=?, updated_at=unixepoch() WHERE user_id=?').bind(newScore, bot.id),
    );
  }

  await env.DB.batch(updates);
  return { updated: bots.length };
}

// ── listBots ───────────────────────────────────────────────────────────────
export async function listBots(env) {
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.username, r.score, r.updated_at
     FROM users u
     JOIN rankings r ON r.user_id = u.id
     WHERE u.is_bot = 1
     ORDER BY r.score DESC`
  ).all();
  return results;
}
