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

async function getFullState(env, userId) {
  // Get global game state (research, score, etc.)
  const gsRow = await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(userId).first();
  if (!gsRow) return null;

  // Get all planets for the user
  const { results: planets } = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ?').all();
  
  // Find active planet (or default to the first one)
  let activePlanetId = gsRow.active_planet_id;
  let activePlanet = planets.find(p => p.id === activePlanetId) || planets[0];

  if (!activePlanet) return null;

  return {
    research: JSON.parse(gsRow.research),
    score: gsRow.score,
    planets: planets.map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      coords: p.coords,
      isMain: p.is_main === 1
    })),
    activePlanet: {
      id: activePlanet.id,
      name: activePlanet.name,
      emoji: activePlanet.emoji,
      coords: activePlanet.coords,
      resources: JSON.parse(activePlanet.resources),
      rates: JSON.parse(activePlanet.rates),
      buildings: JSON.parse(activePlanet.buildings),
      fleet: JSON.parse(activePlanet.fleet),
      updatedAt: activePlanet.updated_at,
    }
  };
}

async function savePlanetState(env, planetId, state) {
  await env.DB.prepare(`
    UPDATE planets
    SET resources=?, rates=?, buildings=?, fleet=?, updated_at=unixepoch()
    WHERE id=?
  `).bind(
    JSON.stringify(state.resources), JSON.stringify(state.rates),
    JSON.stringify(state.buildings), JSON.stringify(state.fleet),
    planetId
  ).run();
}

async function saveGlobalState(env, userId, research, score) {
  await env.DB.prepare('UPDATE game_state SET research=?, score=?, updated_at=unixepoch() WHERE user_id=?')
    .bind(JSON.stringify(research), score, userId).run();
}

async function processQueue(env, userId, fullState) {
  const now = Math.floor(Date.now() / 1000);
  const finished = await env.DB.prepare(
    'SELECT * FROM build_queue WHERE user_id = ? AND finish_at <= ?'
  ).bind(userId, now).all();
  if (!finished.results.length) return fullState;

  for (const item of finished.results) {
    if (item.item_type === 'building') {
      // Building is specific to a planet (note: build_queue needs planet_id update later,
      // but for now we assume the current active planet or the one it was started on)
      const b = fullState.activePlanet.buildings.find(x => x.id === item.item_id);
      if (b) {
        b.level = item.target_level;
        fullState.activePlanet.rates = recalcRates(fullState.activePlanet.buildings, fullState.research);
        fullState.score += 50;
      }
    } else if (item.item_type === 'research') {
      const r = fullState.research.find(x => x.id === item.item_id);
      if (r) {
        r.level = item.target_level;
        if (item.item_id === 'energy_tech') {
          fullState.activePlanet.rates = recalcRates(fullState.activePlanet.buildings, fullState.research);
        }
        fullState.score += 100;
      }
    } else if (item.item_type === 'fleet') {
      const f = fullState.activePlanet.fleet.find(x => x.id === item.item_id);
      if (f) { f.count += item.target_level; fullState.score += 20 * item.target_level; }
    }
  }

  await env.DB.batch(
    finished.results.map(r => env.DB.prepare('DELETE FROM build_queue WHERE id = ?').bind(r.id))
  );
  await env.DB.prepare('UPDATE rankings SET score=?, updated_at=unixepoch() WHERE user_id=?')
    .bind(fullState.score, userId).run();

  return fullState;
}

function accrueResources(planetState) {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = Math.min(now - planetState.updatedAt, 3600 * 8);
  if (elapsed <= 0) return planetState;

  // Need buildings/research to calc storage
  // Note: simplified for this step, using static or passing it
  // But for better logic, storage needs to be recalc'd.
  // Assuming storage cap logic moved inside if possible.
  
  // (Internal state update)
  return planetState;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleGame(request, env, url, user) {
  const userId = user.sub;
  const path   = url.pathname;
  const method = request.method;

  // ── GET /api/game/state ───────────────────────────────────
  if (path === '/api/game/state' && method === 'GET') {
    let fullState = await getFullState(env, userId);
    if (!fullState) return jsonError(404, 'Game state not found', request);

    // Accrue local resources for active planet
    const now = Math.floor(Date.now() / 1000);
    const elapsed = Math.min(now - fullState.activePlanet.updatedAt, 3600 * 8);
    if (elapsed > 0) {
      const storage = calcStorage(fullState.activePlanet.buildings, fullState.research);
      const rates = fullState.activePlanet.rates;
      const res = fullState.activePlanet.resources;
      fullState.activePlanet.resources.metal   = Math.min(storage.metal,   res.metal   + (rates.metal   / 3600) * elapsed);
      fullState.activePlanet.resources.crystal = Math.min(storage.crystal, res.crystal + (rates.crystal / 3600) * elapsed);
      fullState.activePlanet.resources.energy  = Math.min(storage.energy,  res.energy  + (rates.energy  / 3600) * elapsed);
      fullState.activePlanet.resources.deus    = Math.min(storage.deus,    res.deus    + (rates.deus    / 3600) * elapsed);
      fullState.activePlanet.updatedAt = now;
    }

    fullState = await processQueue(env, userId, fullState);
    
    await savePlanetState(env, fullState.activePlanet.id, fullState.activePlanet);
    await saveGlobalState(env, userId, fullState.research, fullState.score);

    const storage = calcStorage(fullState.activePlanet.buildings, fullState.research);
    const queue   = await env.DB.prepare(
      'SELECT * FROM build_queue WHERE user_id = ? ORDER BY finish_at ASC'
    ).bind(userId).all();

    return jsonResponse({ ok: true, state: fullState, queue: queue.results, storage }, 200, request);
  }

  // ── POST /api/game/planet/switch ─────────────────────────
  if (path === '/api/game/planet/switch' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { planetId } = body;
    if (!planetId) return jsonError(400, 'planetId szükséges', request);

    await env.DB.prepare('UPDATE game_state SET active_planet_id = ? WHERE user_id = ?')
      .bind(planetId, userId).run();

    return jsonResponse({ ok: true, activePlanetId: planetId }, 200, request);
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

    // Rankings always up-to-date after sync
    await env.DB.prepare('UPDATE rankings SET score=?, updated_at=unixepoch() WHERE user_id=?')
      .bind(state.score, userId).run();

    try {
      const mainPlanet = state.planets?.[0];
      if (mainPlanet) {
        // Update score on all user planets, name/emoji only on main planet
        await env.DB.prepare('UPDATE galaxy_map SET score=?, updated_at=unixepoch() WHERE user_id=?')
          .bind(state.score, userId).run();
        await env.DB.prepare(
          'UPDATE galaxy_map SET planet_name=?, planet_emoji=?, updated_at=unixepoch() WHERE user_id=? AND is_main=1'
        ).bind(mainPlanet.name, mainPlanet.emoji || '🌍', userId).run();
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

    const renamedPlanet = state.planets[planetIdx];
    try {
      await env.DB.prepare(
        'UPDATE galaxy_map SET planet_name=?, planet_emoji=?, updated_at=unixepoch() WHERE user_id=? AND coords=?'
      ).bind(renamedPlanet.name, renamedPlanet.emoji, userId, renamedPlanet.coords).run();
    } catch (e) { console.warn('galaxy_map rename skipped:', e.message); }

    return jsonResponse({ ok: true, planets: state.planets }, 200, request);
  }

  return jsonError(404, 'Game endpoint not found', request);
}
