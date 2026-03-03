/**
 * Game routes (all protected — user injected by middleware)
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

function buildTime(level, roboticsLevel = 1) {
  const base = Math.floor((level * 90) + 30);
  const reduction = Math.max(0.2, 1 - (roboticsLevel - 1) * 0.07);
  return Math.floor(base * reduction);
}

function researchTime(level, labLevel = 1) {
  const base = (level + 1) * 120;
  const reduction = Math.max(0.2, 1 - (labLevel - 1) * 0.07);
  return Math.floor(base * reduction);
}

function fleetBuildTime(amount, shipCostTotal, shipyardLevel = 1) {
  const base = Math.floor(3600 * amount * 0.5);
  const reduction = Math.max(0.15, 1 - (shipyardLevel - 1) * 0.08);
  return Math.floor(base * reduction);
}

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

function recalcRates(buildings, research) {
  const metalMine   = buildings.find(b => b.id === 'metal_mine')?.level   || 1;
  const crystalMine = buildings.find(b => b.id === 'crystal_mine')?.level || 1;
  const solar       = buildings.find(b => b.id === 'solar')?.level        || 1;
  const deusium     = buildings.find(b => b.id === 'deusium')?.level      || 1;

  const energyTech  = research?.find(r => r.id === 'energy_tech')?.level  || 0;
  const energyBonus = 1 + energyTech * 0.08;

  const energyProd  = Math.floor(20 * Math.pow(1.12, solar - 1) * energyBonus);
  const metalDemand = Math.floor(metalMine   * 8);
  const crystalDemand = Math.floor(crystalMine * 6);
  const deusDemand  = Math.floor(deusium * 3);
  const totalDemand = metalDemand + crystalDemand + deusDemand;

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

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getFullState(env, userId) {
  const gsRow = await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(userId).first();
  if (!gsRow) return null;

  const { results: pRows } = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ?').bind(userId).all();
  const planets = pRows.map(p => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    coords: p.coords,
    resources: JSON.parse(p.resources),
    rates: JSON.parse(p.rates),
    buildings: JSON.parse(p.buildings),
    fleet: JSON.parse(p.fleet),
    isMain: p.is_main === 1,
    updatedAt: p.updated_at
  }));

  let activePlanetId = gsRow.active_planet_id;
  let activePlanet = planets.find(p => p.id === activePlanetId) || planets[0];

  return {
    research: JSON.parse(gsRow.research),
    score: gsRow.score,
    planets,
    activePlanet
  };
}

async function saveFullState(env, userId, fullState) {
  // 1. Update game_state
  await env.DB.prepare('UPDATE game_state SET research=?, score=?, updated_at=unixepoch() WHERE user_id=?')
    .bind(JSON.stringify(fullState.research), fullState.score, userId).run();

  // 2. Update each planet
  for (const p of fullState.planets) {
    await env.DB.prepare(`
      UPDATE planets SET resources=?, rates=?, buildings=?, fleet=?, updated_at=?
      WHERE id=?
    `).bind(
      JSON.stringify(p.resources), JSON.stringify(p.rates),
      JSON.stringify(p.buildings), JSON.stringify(p.fleet),
      p.updatedAt, p.id
    ).run();
  }
}

async function processQueue(env, userId, fullState) {
  const now = Math.floor(Date.now() / 1000);
  const finished = await env.DB.prepare(
    'SELECT * FROM build_queue WHERE user_id = ? AND finish_at <= ?'
  ).bind(userId, now).all();
  
  if (!finished.results.length) return fullState;

  for (const item of finished.results) {
    if (item.item_type === 'building') {
      const planet = fullState.planets.find(p => p.id === item.planet_id) || fullState.activePlanet;
      const b = planet.buildings.find(x => x.id === item.item_id);
      if (b) {
        b.level = item.target_level;
        planet.rates = recalcRates(planet.buildings, fullState.research);
        fullState.score += 50;
      }
    } else if (item.item_type === 'research') {
      const r = fullState.research.find(x => x.id === item.item_id);
      if (r) {
        r.level = item.target_level;
        // Recalc rates for ALL planets if energy tech finished
        if (item.item_id === 'energy_tech') {
          for (const p of fullState.planets) {
            p.rates = recalcRates(p.buildings, fullState.research);
          }
        }
        fullState.score += 100;
      }
    } else if (item.item_type === 'fleet') {
      const planet = fullState.planets.find(p => p.id === item.planet_id) || fullState.activePlanet;
      const f = planet.fleet.find(x => x.id === item.item_id);
      if (f) { f.count += item.target_level; fullState.score += 20 * item.target_level; }
    }
  }

  await env.DB.batch(
    finished.results.map(r => env.DB.prepare('DELETE FROM build_queue WHERE id = ?').bind(r.id))
  );
  return fullState;
}

function accrueAllResources(fullState) {
  const now = Math.floor(Date.now() / 1000);
  for (const p of fullState.planets) {
    const elapsed = Math.min(now - p.updatedAt, 3600 * 8);
    if (elapsed > 0) {
      const storage = calcStorage(p.buildings, fullState.research);
      const rt = p.rates;
      const res = p.resources;
      p.resources.metal   = Math.min(storage.metal,   res.metal   + (rt.metal   / 3600) * elapsed);
      p.resources.crystal = Math.min(storage.crystal, res.crystal + (rt.crystal / 3600) * elapsed);
      p.resources.energy  = Math.min(storage.energy,  res.energy  + (rt.energy  / 3600) * elapsed);
      p.resources.deus    = Math.min(storage.deus,    res.deus    + (rt.deus    / 3600) * elapsed);
      p.updatedAt = now;
    }
  }
  return fullState;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleGame(request, env, url, user) {
  const userId = user.sub;
  const path   = url.pathname;
  const method = request.method;

  let fullState = await getFullState(env, userId);
  if (!fullState) return jsonError(404, 'Game state not found', request);

  fullState = accrueAllResources(fullState);
  fullState = await processQueue(env, userId, fullState);

  // ── GET /api/game/state ───────────────────────────────────
  if (path === '/api/game/state' && method === 'GET') {
    await saveFullState(env, userId, fullState);
    const storage = calcStorage(fullState.activePlanet.buildings, fullState.research);
    const queue   = await env.DB.prepare(
      'SELECT * FROM build_queue WHERE user_id = ? ORDER BY finish_at ASC'
    ).bind(userId).all();

    // Map planets for summary (to keep response size small)
    const planetsSummary = fullState.planets.map(p => ({
        id: p.id, name: p.name, emoji: p.emoji, coords: p.coords, isMain: p.isMain
    }));

    return jsonResponse({ 
        ok: true, 
        state: { 
            research: fullState.research, 
            score: fullState.score, 
            activePlanet: fullState.activePlanet,
            planets: planetsSummary
        }, 
        queue: queue.results, 
        storage 
    }, 200, request);
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

  // ── POST /api/game/upgrade ───────────────────────────────
  if (path === '/api/game/upgrade' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { buildingId } = body;

    const b = fullState.activePlanet.buildings.find(x => x.id === buildingId);
    if (!b) return jsonError(404, 'Building not found', request);

    const roboticsLevel = fullState.activePlanet.buildings.find(x => x.id === 'robotics')?.level || 1;
    const maxQueue = roboticsLevel >= 5 ? 3 : 2;
    const activeBuilds = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM build_queue WHERE user_id = ? AND item_type = ?'
    ).bind(userId, 'building').first();
    if (activeBuilds.cnt >= maxQueue) {
      return jsonError(400, `Maximum ${maxQueue} épület fejleszthető egyszerre`, request);
    }

    const cost = buildCost(b);
    if (fullState.activePlanet.resources.metal < cost.metal || fullState.activePlanet.resources.crystal < cost.crystal) {
      return jsonError(400, 'Nincs elég nyersanyag', request);
    }

    fullState.activePlanet.resources.metal   -= cost.metal;
    fullState.activePlanet.resources.crystal -= cost.crystal;
    const seconds  = buildTime(b.level, roboticsLevel);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.prepare(`INSERT INTO build_queue (id, user_id, planet_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, ?, 'building', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, fullState.activePlanet.id, buildingId, `${b.icon} ${b.name} → Szint ${b.level + 1}`, b.level + 1, finishAt).run();

    await saveFullState(env, userId, fullState);
    return jsonResponse({ ok: true, finishAt, cost, seconds, state: fullState }, 200, request);
  }

  // ── POST /api/game/fleet/build ───────────────────────────
  if (path === '/api/game/fleet/build' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { shipId, amount = 1 } = body;

    const ship = fullState.activePlanet.fleet.find(x => x.id === shipId);
    if (!ship) return jsonError(404, 'Ship type not found', request);

    const shipyardLevel = fullState.activePlanet.buildings.find(b => b.id === 'shipyard')?.level || 1;
    const totalCost = { metal: ship.cost.metal * amount, crystal: ship.cost.crystal * amount };
    
    if (fullState.activePlanet.resources.metal < totalCost.metal || fullState.activePlanet.resources.crystal < totalCost.crystal) {
      return jsonError(400, 'Nincs elég nyersanyag', request);
    }

    fullState.activePlanet.resources.metal   -= totalCost.metal;
    fullState.activePlanet.resources.crystal -= totalCost.crystal;
    const seconds  = fleetBuildTime(amount, totalCost, shipyardLevel);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.prepare(`INSERT INTO build_queue (id, user_id, planet_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, ?, 'fleet', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, fullState.activePlanet.id, shipId, `${ship.icon} ${ship.name} ×${amount}`, amount, finishAt).run();

    await saveFullState(env, userId, fullState);
    return jsonResponse({ ok: true, finishAt, cost: totalCost, state: fullState }, 200, request);
  }

  // ── POST /api/game/sync ──────────────────────────────────
  if (path === '/api/game/sync' && method === 'POST') {
    await saveFullState(env, userId, fullState);
    await env.DB.prepare('UPDATE rankings SET score=?, updated_at=unixepoch() WHERE user_id=?').bind(fullState.score, userId).run();
    return jsonResponse({ ok: true, state: fullState }, 200, request);
  }

  return jsonError(404, 'Game endpoint not found', request);
}
