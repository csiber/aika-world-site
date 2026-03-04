/**
 * AIKA WORLD — NPC Bot utilities v2 (Active Intelligence)
 */

import { resolveMissionsForUser } from './mission_resolver.js';

// ── Bot definitions ────────────────────────────────────────────────────────
const BOT_DEFINITIONS = [
  { username: 'VörösOrion',       tier: 'elite',    initialScore: 1200000, growthMin:  8000, growthMax: 18000, planet: 'Vörös Orion Főbolygó',      coords: '[1:1:1]',   emoji: '🔴' },
  { username: 'KozmikosSas',      tier: 'elite',    initialScore:  950000, growthMin:  8000, growthMax: 15000, planet: 'Kozmikus Fészek',            coords: '[1:2:3]',   emoji: '🌌' },
  { username: 'NébulaHarcos',     tier: 'elite',    initialScore:  750000, growthMin:  8000, growthMax: 13000, planet: 'Nebula Erőd',                coords: '[2:1:5]',   emoji: '💜' },
  { username: 'GalaktikusFarkas', tier: 'elite',    initialScore:  600000, growthMin:  8000, growthMax: 11000, planet: 'Farkashold',                 coords: '[2:3:2]',   emoji: '🐺' },
  { username: 'ÉgiVihar',         tier: 'elite',    initialScore:  450000, growthMin:  8000, growthMax: 10000, planet: 'Viharvilág',                 coords: '[3:1:7]',   emoji: '⚡' },
  { username: 'StarForge_X',      tier: 'elite',    initialScore:  300000, growthMin:  8000, growthMax:  9000, planet: 'StarForge Nexus',            coords: '[3:4:1]',   emoji: '⭐' },
  { username: 'NovaKommandó',     tier: 'advanced', initialScore:  280000, growthMin:  2000, growthMax:  6000, planet: 'Nova Citadella',             coords: '[1:3:8]',   emoji: '💫' },
  { username: 'CsillagVadász',    tier: 'advanced', initialScore:  220000, growthMin:  2000, growthMax:  5500, planet: 'Vadász Főhadiszállás',       coords: '[2:5:4]',   emoji: '🌟' },
  { username: 'PlazmaŐrző',       tier: 'advanced', initialScore:  180000, growthMin:  2000, growthMax:  5000, planet: 'Plazma Bástya',              coords: '[3:2:9]',   emoji: '🔵' },
  { username: 'DeusiumLord',      tier: 'advanced', initialScore:  150000, growthMin:  2000, growthMax:  4500, planet: 'Déusium Trón',               coords: '[4:1:3]',   emoji: '🔮' },
  { username: 'IronNebula_7',     tier: 'advanced', initialScore:  120000, growthMin:  2000, growthMax:  4000, planet: 'Vas Nebula Alpha',           coords: '[4:3:6]',   emoji: '🌫️' },
  { username: 'AranyCsillag',     tier: 'advanced', initialScore:   90000, growthMin:  2000, growthMax:  3500, planet: 'Arany Naprendszer',          coords: '[5:1:2]',   emoji: '🌠' },
  { username: 'TüzesKomét',       tier: 'advanced', initialScore:   80000, growthMin:  2000, growthMax:  3000, planet: 'Tüzes Pálya',                coords: '[5:4:7]',   emoji: '☄️' },
  { username: 'KvazárVadász',     tier: 'advanced', initialScore:   65000, growthMin:  2000, growthMax:  2500, planet: 'Kvazár Ütközőpont',          coords: '[1:5:10]',  emoji: '🌀' },
  { username: 'FénylőFelhő',      tier: 'advanced', initialScore:   50000, growthMin:  2000, growthMax:  2200, planet: 'Fényfelhő Peremvilág',       coords: '[2:4:11]',  emoji: '☁️' },
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

const TIER_STATS = {
  elite:    { buildings: 18, research: 14, fleet: { fighter_s: 5000, fighter_l: 1200, cruiser: 400, battleship: 150 } },
  advanced: { buildings: 10, research: 7,  fleet: { fighter_s: 800,  fighter_l: 150,  cruiser: 50,  battleship: 15 } },
  beginner: { buildings: 3,  research: 2,  fleet: { fighter_s: 50,   fighter_l: 10,   cruiser: 3,   battleship: 0 } },
};

// ── seedBots ───────────────────────────────────────────────────────────────
export async function seedBots(env) {
  let created = 0;
  for (const bot of BOT_DEFINITIONS) {
    const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(bot.username).first();
    if (existing) continue;

    const userId = crypto.randomUUID();
    const planetId = crypto.randomUUID();
    const stats = TIER_STATS[bot.tier];

    // Build default structures
    const buildings = [
        { id: 'metal_mine', level: stats.buildings, type: 'production' },
        { id: 'crystal_mine', level: stats.buildings - 2, type: 'production' },
        { id: 'solar', level: stats.buildings, type: 'production' },
        { id: 'deusium', level: stats.buildings - 4, type: 'production' },
        { id: 'shipyard', level: stats.buildings, type: 'infra' },
        { id: 'lab', level: stats.buildings, type: 'infra' }
    ];
    const research = [
        { id: 'combat', level: stats.research },
        { id: 'shield', level: stats.research },
        { id: 'drive', level: stats.research }
    ];
    const fleet = [
        { id: 'fighter_s', icon: '✈️', name: 'Kis Vadász', count: stats.fleet.fighter_s, attack: 50, shield: 10, speed: 12500, cargo: 0 },
        { id: 'fighter_l', icon: '🛸', name: 'Nagy Vadász', count: stats.fleet.fighter_l, attack: 400, shield: 100, speed: 8000, cargo: 0 },
        { id: 'cruiser', icon: '🚀', name: 'Cirkáló', count: stats.fleet.cruiser, attack: 800, shield: 400, speed: 5000, cargo: 800 },
        { id: 'battleship', icon: '🛰️', name: 'Csatahajó', count: stats.fleet.battleship, attack: 4000, shield: 2000, speed: 3000, cargo: 1500 }
    ];

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO users (id, username, email, password, is_admin, is_bot) VALUES (?, ?, ?, '$bot$', 0, 1)`).bind(userId, bot.username, `bot.${userId}@aika.invalid`),
      env.DB.prepare(`INSERT INTO game_state (user_id, score, research, active_planet_id) VALUES (?, ?, ?, ?)`).bind(userId, bot.initialScore, JSON.stringify(research), planetId),
      env.DB.prepare(`INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, is_main) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`).bind(planetId, userId, bot.planet, bot.emoji, bot.coords, JSON.stringify(buildings), JSON.stringify(fleet)),
      env.DB.prepare(`INSERT INTO rankings (user_id, username, score) VALUES (?, ?, ?)`).bind(userId, bot.username, bot.initialScore),
      env.DB.prepare(`INSERT INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score, is_main) VALUES (?, ?, ?, ?, ?, ?, 1)`).bind(userId, bot.username, bot.planet, bot.emoji, bot.coords, bot.initialScore)
    ]);
    created++;
  }
  return { created };
}

// ── simulateBots ───────────────────────────────────────────────────────────
export async function simulateBots(env) {
  const { results: bots } = await env.DB.prepare('SELECT id, username FROM users WHERE is_bot = 1').all();
  const defMap = Object.fromEntries(BOT_DEFINITIONS.map(b => [b.username, b]));

  for (const bot of bots) {
    const def = defMap[bot.username];
    if (!def) continue;

    // 1. Passive growth
    const growth = Math.floor(def.growthMin + Math.random() * (def.growthMax - def.growthMin));
    await env.DB.prepare('UPDATE game_state SET score = score + ? WHERE user_id = ?').bind(growth, bot.id).run();
    await env.DB.prepare('UPDATE rankings SET score = score + ? WHERE user_id = ?').bind(growth, bot.id).run();
    await env.DB.prepare('UPDATE galaxy_map SET score = score + ? WHERE user_id = ?').bind(growth, bot.id).run();

    // 2. Active AI logic (5% mission, 40% market)
    const roll = Math.random();
    if (roll < 0.05) {
      await runBotAI(env, bot, def);
    } else if (roll < 0.45) {
      // Bots can now do multiple market actions in one tick
      await runBotMarketAI(env, bot);
      if (Math.random() < 0.3) await runBotMarketAI(env, bot);
    }
  }

  // 3. Market Cleanup (Remove bot offers older than 6 hours)
  const sixHoursAgo = Math.floor(Date.now() / 1000) - (6 * 3600);
  await env.DB.prepare(`
    DELETE FROM market_offers 
    WHERE status = 'open' 
    AND created_at < ? 
    AND user_id IN (SELECT id FROM users WHERE is_bot = 1)
  `).bind(sixHoursAgo).run();

  return { updated: bots.length };
}

async function runBotMarketAI(env, bot) {
    const botPlanet = await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND is_main = 1').bind(bot.id).first();
    if (!botPlanet) return;

    // Check existing open offers by this bot (limit to 5)
    const count = await env.DB.prepare('SELECT COUNT(*) as c FROM market_offers WHERE user_id = ? AND status = "open"').bind(bot.id).first();
    const action = (count?.c || 0) < 5 ? (Math.random() < 0.7 ? 'create' : 'accept') : 'accept';

    if (action === 'create') {
        const resTypes = ['metal', 'crystal', 'deus'];
        const offerRes = resTypes[Math.floor(Math.random() * resTypes.length)];
        const seekRes  = resTypes.find(r => r !== offerRes);
        
        const offerAmt = 10000 + Math.floor(Math.random() * 50000);
        const ratio = 0.7 + Math.random() * 0.6; // Wider range for more variation
        const seekAmt = Math.floor(offerAmt * ratio);

        await env.DB.prepare(`
            INSERT INTO market_offers (user_id, planet_id, offer_res, offer_amt, seek_res, seek_amt, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'open', unixepoch())
        `).bind(bot.id, botPlanet.id, offerRes, offerAmt, seekRes, seekAmt).run();
    } else {
        // Accept a human offer
        const offer = await env.DB.prepare(`
            SELECT o.* FROM market_offers o
            JOIN users u ON u.id = o.user_id
            WHERE o.status = 'open' AND u.is_bot = 0
            ORDER BY RANDOM() LIMIT 1
        `).first();

        if (offer) {
            const ratio = offer.seek_amt / offer.offer_amt;
            // Elite bots are pickier, beginner bots accept anything
            if (ratio <= 2.5) { 
                await env.DB.prepare("UPDATE market_offers SET status = 'done' WHERE id = ?").bind(offer.id).run();
            }
        }
    }
}

async function runBotAI(env, bot, def) {
    const botPlanet = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ? AND is_main = 1').bind(bot.id).first();
    if (!botPlanet) return;

    // Find a human target
    const target = await env.DB.prepare(`
        SELECT g.* FROM galaxy_map g
        JOIN users u ON u.id = g.user_id
        WHERE u.is_bot = 0
        ORDER BY RANDOM() LIMIT 1
    `).first();

    if (!target) return;

    const missionType = Math.random() < 0.7 ? 'spy' : 'attack';
    const ships = JSON.parse(botPlanet.fleet);
    const sentShips = [];

    if (missionType === 'spy') {
        const spyShip = ships.find(s => s.id === 'fighter_s' || s.id === 'spy');
        if (spyShip && spyShip.count > 0) {
            sentShips.push({ ...spyShip, count: 1 });
        }
    } else {
        // Attack with 30% of fleet
        ships.forEach(s => {
            if (s.count > 10) {
                const amt = Math.floor(s.count * 0.3);
                sentShips.push({ ...s, count: amt });
                s.count -= amt;
            }
        });
        if (sentShips.length > 0) {
            await env.DB.prepare('UPDATE planets SET fleet = ? WHERE id = ?').bind(JSON.stringify(ships), botPlanet.id).run();
        }
    }

    if (sentShips.length > 0) {
        const arriveAt = Math.floor(Date.now() / 1000) + 600; // Fixed 10 min for bots
        await env.DB.prepare(`
            INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'travelling', ?, ?, unixepoch())
        `).bind(crypto.randomUUID(), bot.id, botPlanet.id, target.user_id, missionType, target.coords, target.planet_name, JSON.stringify(sentShips), arriveAt).run();
    }
}

export async function listBots(env) {
  return (await env.DB.prepare('SELECT u.username, r.score FROM users u JOIN rankings r ON r.user_id = u.id WHERE u.is_bot = 1 ORDER BY r.score DESC').all()).results;
}
