/**
 * AIKA WORLD — NPC Bot utilities v3 (Smarter Bot AI)
 */

import { resolveMissionsForUser } from './mission_resolver.js';

// ── Bot Personality Types ─────────────────────────────────────────────────
const BOT_PERSONALITIES = {
  aggressive: { attackChance: 0.30, spyChance: 0.15, tradeChance: 0.20, socialChance: 0.10 },
  trader:     { attackChance: 0.05, spyChance: 0.10, tradeChance: 0.50, socialChance: 0.10 },
  builder:    { attackChance: 0.05, spyChance: 0.05, tradeChance: 0.20, socialChance: 0.05 },
};

// ── Personality-Based Message Pools ───────────────────────────────────────
const PERSONALITY_MESSAGES = {
  aggressive: [
    "A flottád gyenge. Jövök az erőforrásaidért.",
    "Az űrben nincs irgalom. Készülj a csatára!",
    "Látom a koordinátáidat. Hamarosan meglátogatlak.",
    "A védelmeid szánalmasak. Könnyű célpont vagy.",
    "Minden bolygó az enyém lesz. A tiéd a következő.",
    "A gyengék elpusztulnak. Te melyik kategóriába esel?",
    "A fegyvereim éhesek. A te flottád lesz a vacsora.",
    "Élvezem a háborút. Remélem, te is, mert jövök.",
    "Az utolsó játékos akit megtámadtam, eltűnt. Te leszel a következő?",
    "Nincs hely az univerzumban kettőnknek. Egyikünknek mennie kell.",
  ],
  trader: [
    "Kristály feleslegem van. Szeretnél üzletet kötni?",
    "A piaci árak most kedvezőek. Érdemes kereskedni!",
    "Fém kell? Jó áron tudok adni nagy tételben.",
    "Nézd meg az ajánlataimat a piacon. Megéri!",
    "Ha deusiumra van szükséged, írj. Kedvezményt adok.",
    "Az okos parancsnok kereskedik, nem háborúzik.",
    "Van egy üzleti ajánlatom, amit nem tudsz visszautasítani.",
    "A piacon most jó lehetőségek vannak. Ne hagyd ki!",
    "Kereskedőként mondom: a béke jövedelmezőbb a háborúnál.",
    "Nagy tételben olcsóbb. Írj, ha érdekel a nagykereskedelem!",
  ],
  builder: [
    "Szép kolóniád van! Én mostanában a kutatásra fókuszálok.",
    "Az építkezés a legjobb befektetés hosszú távon.",
    "Békés szomszéd vagyok. Remélem, te is az leszel.",
    "Tipp: a napenergia a legfontosabb fejlesztés korán.",
    "Üdv, szomszéd! Hogy halad a kolóniád fejlesztése?",
    "A türelem megtérül az űrben. Lassan járj, tovább érsz!",
    "Új kutatást fejeztem be! A tudomány erő.",
    "Az erős gazdaság fontosabb a nagy flottánál.",
    "Barátságos tanács: fejleszd a bányáidat, mielőtt flottát építesz.",
    "Remélem, békésen megférünk egymás mellett a galaxisban!",
  ],
};

// ── Bot Personality Assignments (per-username override) ───────────────────
const BOT_PERSONALITY_MAP = {
  // Elite: mix of aggressive and trader
  'VörösOrion':       'aggressive',
  'KozmikosSas':      'aggressive',
  'NébulaHarcos':     'aggressive',
  'GalaktikusFarkas': 'trader',
  'ÉgiVihar':         'aggressive',
  'StarForge_X':      'trader',
  // Advanced: mix of all three
  'NovaKommandó':     'aggressive',
  'CsillagVadász':    'aggressive',
  'PlazmaŐrző':       'builder',
  'DeusiumLord':      'trader',
  'IronNebula_7':     'trader',
  'AranyCsillag':     'builder',
  'TüzesKomét':       'aggressive',
  'KvazárVadász':     'trader',
  'FénylőFelhő':      'builder',
  // Beginner: mostly builder
  'KristályBirodalom': 'builder',
  'FémImperium':       'builder',
  'SolarDragon':       'builder',
  'VoidWalker':        'builder',
  'CosmicWarrior':     'builder',
  'OrionBrigade':      'builder',
  'ZephyrStorm':       'builder',
  'NeutronFlux':       'builder',
  'PlazmaBrigád':      'trader',
  'QuantumKnight':     'builder',
};

// ── In-memory bot grudge tracker (resets on worker restart) ───────────────
// Structure: { botUserId: { targetUserId: timestamp } }
const botGrudges = {};

function recordGrudge(botId, attackerUserId) {
  if (!botGrudges[botId]) botGrudges[botId] = {};
  botGrudges[botId][attackerUserId] = Date.now();
}

function getGrudgeTargets(botId) {
  const grudges = botGrudges[botId];
  if (!grudges) return [];
  const cutoff = Date.now() - 24 * 3600 * 1000; // 24h window
  const active = [];
  for (const [targetId, ts] of Object.entries(grudges)) {
    if (ts > cutoff) active.push(targetId);
    else delete grudges[targetId]; // cleanup expired
  }
  return active;
}

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

// Helper: resolve personality for a bot
function getPersonality(username) {
  return BOT_PERSONALITY_MAP[username] || 'builder';
}

// ── seedBots ───────────────────────────────────────────────────────────────
export async function seedBots(env) {
  let created = 0;
  for (const bot of BOT_DEFINITIONS) {
    const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(bot.username).first();
    if (existing) continue;

    const userId = crypto.randomUUID();
    const planetId = crypto.randomUUID();
    const stats = TIER_STATS[bot.tier];
    const personality = getPersonality(bot.username);

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
      env.DB.prepare(`INSERT INTO users (id, username, email, password, is_admin, is_bot, bot_personality) VALUES (?, ?, ?, '$bot$', 0, 1, ?)`).bind(userId, bot.username, `bot.${userId}@aika.invalid`, personality),
      env.DB.prepare(`INSERT INTO game_state (user_id, score, research, active_planet_id) VALUES (?, ?, ?, ?)`).bind(userId, bot.initialScore, JSON.stringify(research), planetId),
      env.DB.prepare(`INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, is_main) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`).bind(planetId, userId, bot.planet, bot.emoji, bot.coords, JSON.stringify(buildings), JSON.stringify(fleet)),
      env.DB.prepare(`INSERT INTO rankings (user_id, username, score) VALUES (?, ?, ?)`).bind(userId, bot.username, bot.initialScore),
      env.DB.prepare(`INSERT INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score, is_main) VALUES (?, ?, ?, ?, ?, ?, 1)`).bind(userId, bot.username, bot.planet, bot.emoji, bot.coords, bot.initialScore)
    ]);
    created++;
  }
  return { created };
}

// ── Inline migration for bot_personality column ───────────────────────────
async function ensureBotPersonalityColumn(env) {
  try { await env.DB.prepare(`ALTER TABLE users ADD COLUMN bot_personality TEXT DEFAULT 'builder'`).run(); } catch(e) {}
}

// ── simulateBots ───────────────────────────────────────────────────────────
export async function simulateBots(env) {
  // Ensure personality column exists
  await ensureBotPersonalityColumn(env);

  const { results: bots } = await env.DB.prepare('SELECT id, username, bot_personality FROM users WHERE is_bot = 1').all();
  const defMap = Object.fromEntries(BOT_DEFINITIONS.map(b => [b.username, b]));

  // Check for recent attacks against bots (for grudge system)
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
  const recentAttacks = await env.DB.prepare(`
    SELECT target_user_id, user_id FROM fleet_missions
    WHERE mission_type = 'attack'
    AND created_at > ?
    AND target_user_id IN (SELECT id FROM users WHERE is_bot = 1)
    AND user_id NOT IN (SELECT id FROM users WHERE is_bot = 1)
  `).bind(oneDayAgo).all();

  // Record grudges from recent player attacks against bots
  for (const atk of (recentAttacks.results || [])) {
    recordGrudge(atk.target_user_id, atk.user_id);
  }

  for (const bot of bots) {
    const def = defMap[bot.username];
    if (!def) continue;

    // Assign personality if null (migration for existing bots)
    const personality = bot.bot_personality || getPersonality(bot.username);
    if (!bot.bot_personality) {
      await env.DB.prepare('UPDATE users SET bot_personality = ? WHERE id = ?').bind(personality, bot.id).run();
    }
    const pStats = BOT_PERSONALITIES[personality] || BOT_PERSONALITIES.builder;

    // 1. Passive Score growth
    const growth = Math.floor(def.growthMin + Math.random() * (def.growthMax - def.growthMin));
    await env.DB.prepare('UPDATE game_state SET score = score + ? WHERE user_id = ?').bind(growth, bot.id).run();
    await env.DB.prepare('UPDATE rankings SET score = score + ? WHERE user_id = ?').bind(growth, bot.id).run();
    await env.DB.prepare('UPDATE galaxy_map SET score = score + ? WHERE user_id = ?').bind(growth, bot.id).run();

    // 2. Resource Simulation (Bots need resources to trade/build)
    const stats = TIER_STATS[def.tier];
    const resGain = stats.buildings * 5000; // Simplified hourly production
    await env.DB.prepare(`
      UPDATE planets SET
        metal = metal + ?,
        crystal = crystal + ?,
        deus = deus + ?
      WHERE user_id = ?
    `).bind(resGain, resGain / 2, resGain / 10, bot.id).run();

    // 3. Active AI logic — personality-driven action selection
    const actionMulti = def.tier === 'elite' ? 3 : (def.tier === 'advanced' ? 2 : 1);

    for (let i = 0; i < actionMulti; i++) {
      const roll = Math.random();
      const combatChance = pStats.attackChance + pStats.spyChance; // Combined mission chance

      if (roll < combatChance) {
        await runBotAI(env, bot, def, personality);
      } else if (roll < combatChance + pStats.tradeChance) {
        await runBotMarketAI(env, bot, def, personality);
      }
      // Remaining chance: do nothing (build/idle handled in runBotAI)

      // 4. Social AI: personality-driven messaging
      if (Math.random() < pStats.socialChance) {
        await runBotSocialAI(env, bot, personality);
      }
    }
  }

  // 5. Market Cleanup
  const sixHoursAgo = Math.floor(Date.now() / 1000) - (6 * 3600);
  await env.DB.prepare(`
    DELETE FROM market_offers
    WHERE status = 'open'
    AND created_at < ?
    AND user_id IN (SELECT id FROM users WHERE is_bot = 1)
  `).bind(sixHoursAgo).run();

  return { updated: bots.length };
}

async function runBotSocialAI(env, bot, personality) {
  // Find a target human who is active
  const target = await env.DB.prepare(`
    SELECT u.id, u.username FROM users u
    JOIN rankings r ON r.user_id = u.id
    WHERE u.is_bot = 0
    ORDER BY RANDOM() LIMIT 1
  `).first();

  if (!target) return;

  // Pick message from personality-specific pool
  const pool = PERSONALITY_MESSAGES[personality] || PERSONALITY_MESSAGES.builder;
  const msg = pool[Math.floor(Math.random() * pool.length)];
  const id = crypto.randomUUID();

  await env.DB.prepare(`
    INSERT INTO messages (id, sender_id, sender_name, receiver_id, content, created_at)
    VALUES (?, ?, ?, ?, ?, unixepoch())
  `).bind(id, bot.id, bot.username, target.id, msg).run();
}

async function runBotMarketAI(env, bot, def, personality) {
    const botPlanet = await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND is_main = 1').bind(bot.id).first();
    if (!botPlanet) return;

    const pStats = BOT_PERSONALITIES[personality] || BOT_PERSONALITIES.builder;

    // Check existing open offers by this bot
    const count = await env.DB.prepare('SELECT COUNT(*) as c FROM market_offers WHERE user_id = ? AND status = "open"').bind(bot.id).first();
    const currentOffers = count?.c || 0;

    // Personality-based market limits and behavior
    const maxOffers = personality === 'trader' ? 8 : (personality === 'aggressive' ? 4 : 3);

    // Builder bots mostly buy (accept), rarely create sell offers
    // Trader bots create more offers and accept faster
    // Aggressive bots occasionally dump at low prices
    let createChance;
    if (personality === 'trader') createChance = 0.8;
    else if (personality === 'builder') createChance = 0.3;
    else if (personality === 'aggressive') createChance = 0.5;
    else createChance = 0.5;

    const action = currentOffers < maxOffers ? (Math.random() < createChance ? 'create' : 'accept') : 'accept';

    if (action === 'create') {
        const resTypes = ['metal', 'crystal', 'deus'];
        const offerRes = resTypes[Math.floor(Math.random() * resTypes.length)];
        // Pick a different resource to seek
        const otherRes = resTypes.filter(r => r !== offerRes);
        const seekRes  = otherRes[Math.floor(Math.random() * otherRes.length)];

        let offerAmt, ratio;

        if (personality === 'aggressive' && Math.random() < 0.25) {
            // Aggressive: dump resources at low prices to crash market
            offerAmt = 30000 + Math.floor(Math.random() * 80000);
            ratio = 0.3 + Math.random() * 0.3; // Very low ratio = cheap dump
        } else if (personality === 'trader') {
            // Trader: competitive prices, larger volumes
            offerAmt = 20000 + Math.floor(Math.random() * 80000);
            ratio = 0.8 + Math.random() * 0.4; // Fair to slightly favorable
        } else {
            // Builder: small amounts, standard prices
            offerAmt = 5000 + Math.floor(Math.random() * 25000);
            ratio = 0.7 + Math.random() * 0.6;
        }

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
            // Personality-based acceptance thresholds
            let maxRatio;
            if (personality === 'trader') maxRatio = 1.8; // Pickier, knows market value
            else if (personality === 'builder') maxRatio = 3.0; // Desperate for resources, accepts worse deals
            else maxRatio = 2.0; // Aggressive: moderate

            if (ratio <= maxRatio) {
                await env.DB.prepare("UPDATE market_offers SET status = 'done' WHERE id = ?").bind(offer.id).run();
            }
        }
    }
}

async function runBotAI(env, bot, def, personality) {
    const botPlanet = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ? AND is_main = 1').bind(bot.id).first();
    const gameState = await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(bot.id).first();
    if (!botPlanet || !gameState) return;

    const pStats = BOT_PERSONALITIES[personality] || BOT_PERSONALITIES.builder;
    const roll = Math.random();

    // Personality-weighted action selection
    const attackThreshold = pStats.attackChance / (pStats.attackChance + pStats.spyChance + 0.40);
    const missionThreshold = (pStats.attackChance + pStats.spyChance) / (pStats.attackChance + pStats.spyChance + 0.40);

    // 1. Mission Logic (Attack/Spy)
    if (roll < missionThreshold) {
        // Check grudge targets first — prefer attacking players who attacked us
        const grudgeTargets = getGrudgeTargets(bot.id);
        let target = null;

        if (grudgeTargets.length > 0 && Math.random() < 0.6) {
            // 60% chance to target a grudge player
            const grudgeId = grudgeTargets[Math.floor(Math.random() * grudgeTargets.length)];
            target = await env.DB.prepare(`
                SELECT g.* FROM galaxy_map g WHERE g.user_id = ? LIMIT 1
            `).bind(grudgeId).first();
        }

        if (!target) {
            // Find a random human target
            target = await env.DB.prepare(`
                SELECT g.* FROM galaxy_map g
                JOIN users u ON u.id = g.user_id
                WHERE u.is_bot = 0
                ORDER BY RANDOM() LIMIT 1
            `).first();
        }

        if (!target) return;

        // Adaptive behavior: compare scores
        const botScore = gameState.score || 0;
        const targetScore = target.score || 0;
        const scoreRatio = targetScore / Math.max(botScore, 1);

        let missionType;
        if (scoreRatio > 1.5) {
            // Target is much stronger: spy instead of attack
            missionType = 'spy';
        } else if (scoreRatio < 0.5) {
            // Target is much weaker: more likely to attack
            // Aggressive bots are especially eager
            const attackBoost = personality === 'aggressive' ? 0.40 : 0.20;
            missionType = Math.random() < (0.5 + attackBoost) ? 'attack' : 'spy';
        } else {
            // Normal range: use personality-based ratio
            const attackRatio = pStats.attackChance / (pStats.attackChance + pStats.spyChance);
            missionType = Math.random() < attackRatio ? 'attack' : 'spy';
        }

        const ships = JSON.parse(botPlanet.fleet || '[]');
        const sentShips = [];

        if (missionType === 'spy') {
            const spyShip = ships.find(s => s.id === 'fighter_s' || s.id === 'spy');
            if (spyShip && spyShip.count > 0) {
                sentShips.push({ ...spyShip, count: 1 });
            }
        } else {
            // Attack with fleet portion based on personality
            const baseRatio = personality === 'aggressive' ? 0.4 : 0.25;
            const ratio = baseRatio + (Math.random() * 0.15);
            ships.forEach(s => {
                if (s.count > 5) {
                    const amt = Math.floor(s.count * ratio);
                    if (amt > 0) {
                        sentShips.push({ ...s, count: amt });
                        s.count -= amt;
                    }
                }
            });
            if (sentShips.length > 0) {
                await env.DB.prepare('UPDATE planets SET fleet = ? WHERE id = ?').bind(JSON.stringify(ships), botPlanet.id).run();
            }
        }

        if (sentShips.length > 0) {
            const arriveAt = Math.floor(Date.now() / 1000) + 600;
            await env.DB.prepare(`
                INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'travelling', ?, ?, unixepoch())
            `).bind(crypto.randomUUID(), bot.id, botPlanet.id, target.user_id, missionType, target.coords, target.planet_name, JSON.stringify(sentShips), arriveAt).run();
        }
    }
    // 2. Building Logic (Infrastructure) - builders do this more
    else if (roll < missionThreshold + (personality === 'builder' ? 0.45 : 0.30)) {
        const buildings = JSON.parse(botPlanet.buildings || '[]');
        const targetB = buildings[Math.floor(Math.random() * buildings.length)];
        if (targetB && botPlanet.metal > 5000) {
            targetB.level += 1;
            await env.DB.prepare(`
                UPDATE planets SET buildings = ?, metal = metal - 5000, crystal = crystal - 2500
                WHERE id = ?
            `).bind(JSON.stringify(buildings), botPlanet.id).run();
        }
    }
    // 3. Fleet Replenishment
    else {
        const ships = JSON.parse(botPlanet.fleet || '[]');
        const stats = TIER_STATS[def.tier];

        ships.forEach(s => {
            const max = stats.fleet[s.id] || 0;
            if (s.count < max && botPlanet.metal > 10000) {
                const add = Math.floor((max - s.count) * 0.2) + 5;
                s.count += add;
            }
        });

        await env.DB.prepare('UPDATE planets SET fleet = ? WHERE id = ?').bind(JSON.stringify(ships), botPlanet.id).run();
    }
}

export async function listBots(env) {
  return (await env.DB.prepare('SELECT u.username, u.bot_personality, r.score FROM users u JOIN rankings r ON r.user_id = u.id WHERE u.is_bot = 1 ORDER BY r.score DESC').all()).results;
}
