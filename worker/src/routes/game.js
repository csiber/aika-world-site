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

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCost(building) {
  const mult = Math.pow(1.5, building.level);
  return {
    metal: Math.floor(building.baseCost.metal * mult),
    crystal: Math.floor(building.baseCost.crystal * mult),
  };
}

function researchCost(research) {
  return {
    metal: Math.floor(200 * Math.pow(2, research.level)),
    crystal: Math.floor(400 * Math.pow(2, research.level)),
  };
}

function buildTime(level, base = 30) {
  return Math.floor((level * 90) + base);
}

async function getState(env, userId) {
  const row = await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(userId).first();
  if (!row) return null;
  return {
    resources: JSON.parse(row.resources),
    rates: JSON.parse(row.rates),
    buildings: JSON.parse(row.buildings),
    research: JSON.parse(row.research),
    fleet: JSON.parse(row.fleet),
    planets: JSON.parse(row.planets),
    score: row.score,
    updatedAt: row.updated_at,
  };
}

async function saveState(env, userId, state) {
  await env.DB.prepare(`
    UPDATE game_state
    SET resources=?, rates=?, buildings=?, research=?, fleet=?, planets=?, score=?, updated_at=unixepoch()
    WHERE user_id=?
  `).bind(
    JSON.stringify(state.resources),
    JSON.stringify(state.rates),
    JSON.stringify(state.buildings),
    JSON.stringify(state.research),
    JSON.stringify(state.fleet),
    JSON.stringify(state.planets),
    state.score,
    userId
  ).run();
}

/** Process finished queue items and apply their effects to state */
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
        // Recalculate rates based on building levels
        state.rates = recalcRates(state.buildings);
        state.score += 50;
      }
    } else if (item.item_type === 'research') {
      const r = state.research.find(x => x.id === item.item_id);
      if (r) { r.level = item.target_level; state.score += 100; }
    } else if (item.item_type === 'fleet') {
      const f = state.fleet.find(x => x.id === item.item_id);
      if (f) { f.count += item.target_level; state.score += 20 * item.target_level; }
    }
  }

  // Delete processed items
  const ids = finished.results.map(r => `'${r.id}'`).join(',');
  await env.DB.prepare(`DELETE FROM build_queue WHERE id IN (${ids})`).run();

  // Update rankings
  await env.DB.prepare('UPDATE rankings SET score=?, updated_at=unixepoch() WHERE user_id=?')
    .bind(state.score, userId).run();

  return state;
}

function recalcRates(buildings) {
  const metalMine    = buildings.find(b => b.id === 'metal_mine');
  const crystalMine  = buildings.find(b => b.id === 'crystal_mine');
  const solar        = buildings.find(b => b.id === 'solar');
  const deusium      = buildings.find(b => b.id === 'deusium');
  return {
    metal:   Math.floor(30 * Math.pow(1.1, (metalMine?.level || 1) - 1)),
    crystal: Math.floor(20 * Math.pow(1.1, (crystalMine?.level || 1) - 1)),
    energy:  Math.floor(10 * Math.pow(1.1, (solar?.level || 1) - 1)),
    deus:    Math.floor(2  * Math.pow(1.15, (deusium?.level || 1) - 1)),
  };
}

/** Add accrued resources since last sync */
function accrueResources(state) {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = Math.min(now - state.updatedAt, 3600 * 8); // max 8h offline gain
  if (elapsed <= 0) return state;
  state.resources.metal   += (state.rates.metal   / 3600) * elapsed;
  state.resources.crystal += (state.rates.crystal / 3600) * elapsed;
  state.resources.energy  += (state.rates.energy  / 3600) * elapsed;
  state.resources.deus    += (state.rates.deus    / 3600) * elapsed;
  return state;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleGame(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // ── GET /api/game/state ───────────────────────────────────
  if (path === '/api/game/state' && method === 'GET') {
    let state = await getState(env, userId);
    if (!state) return jsonError(404, 'Game state not found', request);

    state = accrueResources(state);
    state = await processQueue(env, userId, state);
    await saveState(env, userId, state);

    // Attach active queue
    const queue = await env.DB.prepare(
      'SELECT * FROM build_queue WHERE user_id = ? ORDER BY finish_at ASC'
    ).bind(userId).all();

    return jsonResponse({ ok: true, state, queue: queue.results }, 200, request);
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

    // Check if already in queue
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
    const seconds = buildTime(b.level);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO build_queue (id, user_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, 'building', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, buildingId, `${b.icon} ${b.name} → Szint ${b.level + 1}`, b.level + 1, finishAt),
    ]);

    await saveState(env, userId, state);
    return jsonResponse({ ok: true, finishAt, cost, state }, 200, request);
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

    const inQueue = await env.DB.prepare(
      'SELECT id FROM build_queue WHERE user_id = ? AND item_id = ? AND item_type = ?'
    ).bind(userId, researchId, 'research').first();
    if (inQueue) return jsonError(409, 'Ez a kutatás már folyamatban van', request);

    const cost = researchCost(r);
    if (state.resources.metal < cost.metal || state.resources.crystal < cost.crystal) {
      return jsonError(400, 'Nincs elég nyersanyag', request);
    }

    state.resources.metal   -= cost.metal;
    state.resources.crystal -= cost.crystal;
    const seconds = (r.level + 1) * 120;
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO build_queue (id, user_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, 'research', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, researchId, `🔬 ${r.name} → Szint ${r.level + 1}`, r.level + 1, finishAt),
    ]);

    await saveState(env, userId, state);
    return jsonResponse({ ok: true, finishAt, cost, state }, 200, request);
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

    const totalCost = {
      metal:   ship.cost.metal   * amount,
      crystal: ship.cost.crystal * amount,
    };
    if (state.resources.metal < totalCost.metal || state.resources.crystal < totalCost.crystal) {
      return jsonError(400, 'Nincs elég nyersanyag', request);
    }

    state.resources.metal   -= totalCost.metal;
    state.resources.crystal -= totalCost.crystal;
    const seconds = Math.floor(3600 * amount * 0.5);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO build_queue (id, user_id, item_id, item_type, item_name, target_level, finish_at)
        VALUES (?, ?, ?, 'fleet', ?, ?, ?)`)
        .bind(crypto.randomUUID(), userId, shipId, `${ship.icon} ${ship.name} ×${amount}`, amount, finishAt),
    ]);

    await saveState(env, userId, state);
    return jsonResponse({ ok: true, finishAt, cost: totalCost, state }, 200, request);
  }

  // ── POST /api/game/sync ──────────────────────────────────
  if (path === '/api/game/sync' && method === 'POST') {
    let state = await getState(env, userId);
    state = accrueResources(state);
    state = await processQueue(env, userId, state);
    await saveState(env, userId, state);
    return jsonResponse({ ok: true, state }, 200, request);
  }

  return jsonError(404, 'Game endpoint not found', request);
}
