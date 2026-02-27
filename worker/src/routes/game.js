/**
 * Game routes (all protected — user injected by middleware)
 * GET  /api/game/state          — full game state
 * POST /api/game/upgrade        — start building upgrade
 * POST /api/game/research       — start research
 * POST /api/game/fleet/build    — build fleet units
 * GET  /api/game/queue          — active build queue
 * POST /api/game/sync           — sync resources (tick)
 */

import { jsonResponse, jsonError } from '../utils/response.js';

// ── Game formulas ─────────────────────────────────────────────────────────────

function buildCost(building) {
  const mult = Math.pow(1.5, building.level);
  return {
    metal:   Math.floor(building.baseCost.metal   * mult),
    crystal: Math.floor(building.baseCost.crystal * mult),
  };
}

function researchCost(r) {
  return {
    metal:   Math.floor(200 * Math.pow(2, r.level)),
    crystal: Math.floor(400 * Math.pow(2, r.level)),
  };
}

/** Build time in seconds — reduced by Robotics level */
function buildTime(level, roboticsLevel = 1) {
  const base = Math.floor((level * 90) + 30);
  const reduction = Math.max(0.2, 1 - (roboticsLevel - 1) * 0.07); // -7% per level, min 20%
  return Math.floor(base * reduction);
}

/** Research time in seconds — reduced by Lab level */
function researchTime(level, labLevel = 1) {
  const base = (level + 1) * 120;
  const reduction = Math.max(0.2, 1 - (labLevel - 1) * 0.07);
  return Math.floor(base * reduction);
}

/** Fleet build time — reduced by Shipyard level */
function fleetBuildTime(amount, shipCostTotal, shipyardLevel = 1) {
  const base = Math.floor(3600 * amount * 0.5);
  const reduction = Math.max(0.15, 1 - (shipyardLevel - 1) * 0.08);
  return Math.floor(base * reduction);
}

/** Storage capacity — base + storage building levels + Hyper tech */
function calcStorage(buildings, research) {
  const storageMetal   = buildings.find(b => b.id === 'storage_metal')?.level   || 1;
  const storageCrystal = buildings.find(b => b.id === 'storage_crystal')?.level || 1;
  const hyperLevel     = research.find(r => r.id === 'hyper')?.level            || 0;
  const hyperBonus = 1 + hyperLevel * 0.15;
  return {
    metal:   Math.floor(50000 * Math.pow(2, storageMetal - 1)   * hyperBonus),
    crystal: Math.floor(25000 * Math.pow(2, storageCrystal - 1) * hyperBonus),
    energy:  999999,
    deus:    Math.floor(5000  * (1 + hyperLevel * 0.2)),
  };
}

/** Production rates — buildings + research bonuses */
function recalcRates(buildings, research) {
  const metalMine   = buildings.find(b => b.id === 'metal_mine')?.level   || 1;
  const crystalMine = buildings.find(b => b.id === 'crystal_mine')?.level || 1;
  const solar       = buildings.find(b => b.id === 'solar')?.level        || 1;
  const deusium     = buildings.find(b => b.id === 'deusium')?.level      || 1;

  const energyTech  = research?.find(r => r.id === 'energy_tech')?.level  || 0;
  const energyBonus = 1 + energyTech * 0.08;

  // Energy production & demand
  const energyProd  = Math.floor(20 * Math.pow(1.12, solar - 1) * energyBonus);
  const metalDemand = Math.floor(metalMine   * 8);
  const crystalDemand = Math.floor(crystalMine * 6);
  const deusDemand  = Math.floor(deusium * 3);
  const totalDemand = metalDemand + crystalDemand + deusDemand;

  // Energy efficiency (0.5x - 1.0x) — affects all production if energy deficit
  const energyEff = totalDemand > 0 ? Math.min(1, energyProd / totalDemand) : 1;

  return {
    metal:   Math.floor(30 * Math.pow(1.1, metalMine   - 1) * energyEff),
    crystal: Math.floor(20 * Math.pow(1.1, crystalMine - 1) * energyEff),
    energy:  energyProd,
    deus:    Math.floor(2  * Math.pow(1.15, deusium - 1) * energyEff),
    energyProd,
    energyDemand: totalDemand,
    energyEff: Math.round(energyEff * 100),
  };
}

/** Combat power — takes research levels into account */
export function calcCombatPower(fleet, research) {
  const combatLevel = research?.find(r => r.id === 'combat')?.level  || 0;
  const laserLevel  = research?.find(r => r.id === 'laser')?.level   || 0;
  const plasmaLevel = research?.find(r => r.id === 'plasma')?.level  || 0;
  const shieldLevel = research?.find(r => r.id === 'shield')?.level  || 0;

  const attackBonus = 1 + combatLevel * 0.10 + laserLevel * 0.05 + plasmaLevel * 0.12;
  const shieldBonus = 1 + shieldLevel * 0.10;

  const attack = fleet.reduce((s, f) => s + (f.attack * f.count * attackBonus), 0);
  const shield = fleet.reduce((s, f) => s + (f.shield * f.count * shieldBonus), 0);
  const cargo  = fleet.reduce((s, f) => s + (f.cargo  * f.count), 0);
  const ships  = fleet.reduce((s, f) => s + f.count, 0);

  return { attack: Math.floor(attack), shield: Math.floor(shield), cargo, ships };
}

/** Fleet mission travel time — based on slowest ship + drive tech */
function missionTravelTime(fleet, research, baseSeconds = 300) {
  const driveLevel = research?.find(r => r.id === 'drive')?.level || 0;
  const driveBonus = 1 + driveLevel * 0.15;
  const activShips = fleet.filter(f => f.count > 0);
  const minSpeed = activShips.length > 0
    ? Math.min(...activShips.map(f => f.speed || 5000))
    : 5000;
  const timeReduction = Math.min(0.85, (minSpeed / 10000) * driveBonus);
  return Math.floor(baseSeconds * (1 - timeReduction) + 60);
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getState(env, userId) {
  const row = await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(userId).first();
  if (!row) return null;
  return {
    resources: JSON.parse(row.resources),
    rates:     JSON.parse(row.rates),
    buildings: JSON.parse(row.buildings),
    research:  JSON.parse(row.research),
    fleet:     JSON.parse(row.fleet),
    planets:   JSON.parse(row.planets),
    score:     row.score,
    updatedAt: row.updated_at,
  };
}

async function saveState(env, userId, state) {
  await env.DB.prepare(`
    UPDATE game_state
    SET resources=?, rates=?, buildings=?, research=?, fleet=?, planets=?, score=?, updated_at=unixepoch()
    WHERE user_id=?
  `).bind(
    JSON.stringify(state.resources), JSON.stringify(state.rates),
    JSON.stringify(state.buildings), JSON.stringify(state.research),
    JSON.stringify(state.fleet),     JSON.stringify(state.planets),
    state.score, userId
  ).run();
}

async function processQueue(env, userId, state) {
  const now = Math.floor(Date.now() / 1000);
  const finished = await env.DB.prepare(
    'SELECT * FROM build_queue WHERE user_id = ? AND finish_at <= ?'
  ).bind(userId, now).all();
  if (!finished.results.length) return state;

  for (const item of finished.results) {
    if (item.item_type === 'building') {
      const b = state.buildings.find(x => x.id === item.item_id);
      if (b) {
        b.level = item.target_level;
        state.rates = recalcRates(state.buildings, state.research);
        state.score += 50;
      }
    } else if (item.item_type === 'research') {
      const r = state.research.find(x => x.id === item.item_id);
      if (r) {
        r.level = item.target_level;
        // Recalc rates if energy tech changed
        if (item.item_id === 'energy_tech') {
          state.rates = recalcRates(state.buildings, state.research);
        }
        state.score += 100;
      }
    } else if (item.item_type === 'fleet') {
      const f = state.fleet.find(x => x.id === item.item_id);
      if (f) { f.count += item.target_level; state.score += 20 * item.target_level; }
    }
  }

  const ids = finished.results.map(r => `'${r.id}'`).join(',');
  await env.DB.prepare(`DELETE FROM build_queue WHERE id IN (${ids})`).run();
  await env.DB.prepare('UPDATE rankings SET score=?, updated_at=unixepoch() WHERE user_id=?')
    .bind(state.score, userId).run();

  return state;
}

function accrueResources(state) {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = Math.min(now - state.updatedAt, 3600 * 8);
  if (elapsed <= 0) return state;

  const storage = calcStorage(state.buildings, state.research);

  state.resources.metal   = Math.min(storage.metal,   state.resources.metal   + (state.rates.metal   / 3600) * elapsed);
  state.resources.crystal = Math.min(storage.crystal, state.resources.crystal + (state.rates.crystal / 3600) * elapsed);
  state.resources.energy  = Math.min(storage.energy,  state.resources.energy  + (state.rates.energy  / 3600) * elapsed);
  state.resources.deus    = Math.min(storage.deus,    state.resources.deus    + (state.rates.deus    / 3600) * elapsed);

  return state;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleGame(request, env, url, user) {
  const userId = user.sub;
  const path   = url.pathname;
  const method = request.method;

  // ── GET /api/game/state ───────────────────────────────────
  if (path === '/api/game/state' && method === 'GET') {
    let state = await getState(env, userId);
    if (!state) return jsonError(404, 'Game state not found', request);

    state = accrueResources(state);
    state = await processQueue(env, userId, state);
    await saveState(env, userId, state);

    const storage = calcStorage(state.buildings, state.research);
    const queue   = await env.DB.prepare(
      'SELECT * FROM build_queue WHERE user_id = ? ORDER BY finish_at ASC'
    ).bind(userId).all();

    return jsonResponse({ ok: true, state, queue: queue.results, storage }, 200, request);
  }

  // ── GET /api/game/queue ───────────────────────────────────
  if (path === '/api/game/queue' && method === 'GET') {
    const queue = await env.DB.prepare(
      'SELECT * FROM build_queue WHERE user_id = ? ORDER BY finish_at ASC'
    ).bind(userId).all();
    return jsonResponse({ ok: true, queue: queue.results }, 200, request);
  }

  // ── POST /api/game/upgrade ───────────────────────────────
  if (path === '/api/game/upgrade' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { buildingId } = body;

    let state = await getState(env, userId);
    state = accrueResources(state);
    state = await processQueue(env, userId, state);

    const b = state.buildings.find(x => x.id === buildingId);
    if (!b) return jsonError(404, 'Building not found', request);

    // Queue limit: max 2 concurrent builds (robotics unlocks 3rd slot at level 5)
    const roboticsLevel = state.buildings.find(x => x.id === 'robotics')?.level || 1;
    const maxQueue = roboticsLevel >= 5 ? 3 : 2;
    const activeBuilds = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM build_queue WHERE user_id = ? AND item_type = ?'
    ).bind(userId, 'building').first();
    if (activeBuilds.cnt >= maxQueue) {
      return jsonError(400, `Maximum ${maxQueue} épület fejleszthető egyszerre (Robotika Szint ${roboticsLevel})`, request);
    }

    const inQueue = await env.DB.prepare(
      'SELECT id FROM build_queue WHERE user_id = ? AND item_id = ? AND item_type = ?'
    ).bind(userId, buildingId, 'building').first();
    if (inQueue) return jsonError(409, 'Ez az épület már fejlesztés alatt áll', request);

    const cost = buildCost(b);
    if (state.resources.metal < cost.metal || state.resources.crystal < cost.crystal) {
      return jsonError(400, 'Nincs elég nyersanyag', request);
    }

    state.resources.metal   -= cost.metal;
    state.resources.crystal -= cost.crystal;
    const robotics = state.buildings.find(x => x.id === 'robotics')?.level || 1;
    const seconds  = buildTime(b.level, robotics);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO build_queue (id, user_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, 'building', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, buildingId, `${b.icon} ${b.name} → Szint ${b.level + 1}`, b.level + 1, finishAt),
    ]);

    await saveState(env, userId, state);
    const storage = calcStorage(state.buildings, state.research);
    return jsonResponse({ ok: true, finishAt, cost, seconds, state, storage }, 200, request);
  }

  // ── POST /api/game/research ──────────────────────────────
  if (path === '/api/game/research' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { researchId } = body;

    let state = await getState(env, userId);
    state = accrueResources(state);
    state = await processQueue(env, userId, state);

    const r = state.research.find(x => x.id === researchId);
    if (!r) return jsonError(404, 'Research not found', request);
    if (r.level >= r.max) return jsonError(400, 'Már maximum szinten van', request);

    // Plasma requires Laser 10
    if (researchId === 'plasma') {
      const laserLevel = state.research.find(x => x.id === 'laser')?.level || 0;
      if (laserLevel < 10) return jsonError(400, 'Plazma Technológiához Lézer Technológia Szint 10 szükséges!', request);
    }

    // Only 1 research at a time
    const activeResearch = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM build_queue WHERE user_id = ? AND item_type = ?'
    ).bind(userId, 'research').first();
    if (activeResearch.cnt >= 1) return jsonError(409, 'Már fut egy kutatás', request);

    const cost = researchCost(r);
    if (state.resources.metal < cost.metal || state.resources.crystal < cost.crystal) {
      return jsonError(400, 'Nincs elég nyersanyag', request);
    }

    state.resources.metal   -= cost.metal;
    state.resources.crystal -= cost.crystal;
    const labLevel = state.buildings.find(x => x.id === 'lab')?.level || 1;
    const seconds  = researchTime(r.level, labLevel);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO build_queue (id, user_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, 'research', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, researchId, `🔬 ${r.name} → Szint ${r.level + 1}`, r.level + 1, finishAt),
    ]);

    await saveState(env, userId, state);
    return jsonResponse({ ok: true, finishAt, cost, seconds, state }, 200, request);
  }

  // ── POST /api/game/fleet/build ───────────────────────────
  if (path === '/api/game/fleet/build' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { shipId, amount = 1 } = body;
    if (amount < 1 || amount > 1000) return jsonError(400, 'Érvénytelen mennyiség', request);

    let state = await getState(env, userId);
    state = accrueResources(state);
    state = await processQueue(env, userId, state);

    const ship = state.fleet.find(x => x.id === shipId);
    if (!ship) return jsonError(404, 'Ship type not found', request);

    // Shipyard check — need level 1+ to build, higher level for advanced ships
    const shipyardLevel = state.buildings.find(b => b.id === 'shipyard')?.level || 1;
    const shipTier = { fighter_s: 1, miner: 1, fighter_l: 2, colony: 2, cruiser: 3, battleship: 4 };
    const requiredShipyard = shipTier[shipId] || 1;
    if (shipyardLevel < requiredShipyard) {
      return jsonError(400, `${ship.name} építéséhez Hajógyár Szint ${requiredShipyard} szükséges (jelenlegi: ${shipyardLevel})`, request);
    }

    const totalCost = {
      metal:   ship.cost.metal   * amount,
      crystal: ship.cost.crystal * amount,
    };
    if (state.resources.metal < totalCost.metal || state.resources.crystal < totalCost.crystal) {
      return jsonError(400, 'Nincs elég nyersanyag', request);
    }

    state.resources.metal   -= totalCost.metal;
    state.resources.crystal -= totalCost.crystal;
    const shipyard = state.buildings.find(b => b.id === 'shipyard')?.level || 1;
    const seconds  = fleetBuildTime(amount, totalCost, shipyard);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO build_queue (id, user_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, 'fleet', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, shipId, `${ship.icon} ${ship.name} ×${amount}`, amount, finishAt),
    ]);

    await saveState(env, userId, state);
    return jsonResponse({ ok: true, finishAt, cost: totalCost, seconds, state }, 200, request);
  }

  // ── POST /api/game/sync ──────────────────────────────────
  if (path === '/api/game/sync' && method === 'POST') {
    let state = await getState(env, userId);
    state = accrueResources(state);
    state = await processQueue(env, userId, state);
    await saveState(env, userId, state);

    try {
      const mainPlanet = state.planets?.[0];
      if (mainPlanet) {
        await env.DB.prepare(
          'UPDATE galaxy_map SET planet_name=?, planet_emoji=?, coords=?, score=?, updated_at=unixepoch() WHERE user_id=?'
        ).bind(mainPlanet.name, mainPlanet.emoji || '🌍', mainPlanet.coords, state.score, userId).run();
      }
    } catch (e) { console.warn('galaxy_map update skipped:', e.message); }

    const storage = calcStorage(state.buildings, state.research);
    return jsonResponse({ ok: true, state, storage }, 200, request);
  }

  // ── POST /api/game/planet/rename ─────────────────────────
  if (path === '/api/game/planet/rename' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { planetIdx, name, emoji } = body;
    if (typeof planetIdx !== 'number') return jsonError(400, 'planetIdx szükséges', request);
    if (name && (name.length < 1 || name.length > 30)) return jsonError(400, 'Név 1-30 karakter legyen', request);

    let state = await getState(env, userId);
    if (!state?.planets?.[planetIdx]) return jsonError(404, 'Bolygó nem található', request);

    if (name)  state.planets[planetIdx].name  = name.trim();
    if (emoji) state.planets[planetIdx].emoji = emoji;

    await saveState(env, userId, state);

    if (planetIdx === 0) {
      try {
        await env.DB.prepare(
          'UPDATE galaxy_map SET planet_name=?, planet_emoji=?, updated_at=unixepoch() WHERE user_id=?'
        ).bind(state.planets[0].name, state.planets[0].emoji, userId).run();
      } catch (e) { console.warn('galaxy_map rename skipped:', e.message); }
    }

    return jsonResponse({ ok: true, planets: state.planets }, 200, request);
  }

  return jsonError(404, 'Game endpoint not found', request);
}
