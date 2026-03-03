/**
 * Game routes (all protected — user injected by middleware)
 * Refactored for v2.4.0: Security audit + State Sync refinement
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

function recalcRates(buildings, research, allianceLevel = 1) {
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
  const allianceBonus = 1 + (allianceLevel - 1) * 0.01;

  return {
    metal:   Math.floor(30 * Math.pow(1.1, metalMine   - 1) * energyEff * allianceBonus),
    crystal: Math.floor(20 * Math.pow(1.1, crystalMine - 1) * energyEff * allianceBonus),
    energy:  energyProd,
    deus:    Math.floor(2  * Math.pow(1.15, deusium - 1) * energyEff * allianceBonus),
    energyProd,
    energyDemand: totalDemand,
    energyEff: Math.round(energyEff * 100),
  };
}

// ── Prerequisites Logic ───────────────────────────────────────────────────────

function checkPrerequisites(item, allBuildings, allResearch) {
  if (!item.req) return { ok: true };
  const missing = [];
  if (item.req.buildings) {
    for (const [id, reqLevel] of Object.entries(item.req.buildings)) {
      const b = allBuildings.find(x => x.id === id);
      if (!b || b.level < reqLevel) missing.push(`${b?.name || id} Szint ${reqLevel}`);
    }
  }
  if (item.req.research) {
    for (const [id, reqLevel] of Object.entries(item.req.research)) {
      const r = allResearch.find(x => x.id === id);
      if (!r || r.level < reqLevel) missing.push(`${r?.name || id} Szint ${reqLevel}`);
    }
  }
  return missing.length === 0 ? { ok: true } : { ok: false, missing };
}

async function mergeTemplates(env, state) {
  const defBuildings = JSON.parse((await env.DB.prepare('SELECT data FROM default_buildings').first()).data);
  const defResearch  = JSON.parse((await env.DB.prepare('SELECT data FROM default_research').first()).data);
  const defFleet     = JSON.parse((await env.DB.prepare('SELECT data FROM default_fleet').first()).data);
  const defDefense   = JSON.parse((await env.DB.prepare('SELECT data FROM default_defense').first() || {data:'[]'}).data);

  state.research.forEach(r => { const t = defResearch.find(x => x.id === r.id); if (t) r.req = t.req; });
  state.planets.forEach(p => {
    p.buildings.forEach(b => { const t = defBuildings.find(x => x.id === b.id); if (t) b.req = t.req; });
    p.fleet.forEach(f => { const t = defFleet.find(x => x.id === f.id); if (t) f.req = t.req; });
    if (!p.defense) p.defense = JSON.parse(JSON.stringify(defDefense));
    p.defense.forEach(d => { const t = defDefense.find(x => x.id === d.id); if (t) d.req = t.req; });
  });
  if (state.activePlanet) {
      if (!state.activePlanet.defense) state.activePlanet.defense = JSON.parse(JSON.stringify(defDefense));
      state.activePlanet.defense.forEach(d => { const t = defDefense.find(x => x.id === d.id); if (t) d.req = t.req; });
  }
  return state;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getFullState(env, userId) {
  const gsRow = await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(userId).first();
  if (!gsRow) return null;
  const membership = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
  let allianceLevel = 1;
  if (membership) {
    const alliance = await env.DB.prepare('SELECT level FROM alliances WHERE id = ?').bind(membership.alliance_id).first();
    if (alliance) allianceLevel = alliance.level;
  }
  const { results: pRows } = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ?').bind(userId).all();
  const planets = pRows.map(p => ({
    id: p.id, name: p.name, emoji: p.emoji, coords: p.coords, updatedAt: p.updated_at,
    resources: JSON.parse(p.resources), rates: JSON.parse(p.rates), buildings: JSON.parse(p.buildings), fleet: JSON.parse(p.fleet), defense: JSON.parse(p.defense || '[]'), isMain: p.is_main === 1
  }));
  let activePlanetId = gsRow.active_planet_id;
  let activePlanet = planets.find(p => p.id === activePlanetId) || planets[0];
  let state = { research: JSON.parse(gsRow.research), score: gsRow.score, allianceLevel, planets, activePlanet };
  return await mergeTemplates(env, state);
}

async function saveFullState(env, userId, fullState) {
  const cleanResearch = fullState.research.map(r => { const {req, ...rest} = r; return rest; });
  await env.DB.prepare('UPDATE game_state SET research=?, score=?, updated_at=unixepoch() WHERE user_id=?').bind(JSON.stringify(cleanResearch), fullState.score, userId).run();
  for (const p of fullState.planets) {
    const cleanBuildings = p.buildings.map(b => { const {req, ...rest} = b; return rest; });
    const cleanFleet     = p.fleet.map(f => { const {req, ...rest} = f; return rest; });
    const cleanDefense   = (p.defense || []).map(d => { const {req, ...rest} = d; return rest; });
    await env.DB.prepare(`UPDATE planets SET resources=?, rates=?, buildings=?, fleet=?, defense=?, updated_at=? WHERE id=?`)
      .bind(JSON.stringify(p.resources), JSON.stringify(p.rates), JSON.stringify(cleanBuildings), JSON.stringify(cleanFleet), JSON.stringify(cleanDefense), p.updatedAt, p.id).run();
  }
}

async function processQueue(env, userId, fullState) {
  const now = Math.floor(Date.now() / 1000);
  const finished = await env.DB.prepare('SELECT * FROM build_queue WHERE user_id = ? AND finish_at <= ?').bind(userId, now).all();
  if (!finished.results.length) return fullState;
  for (const item of finished.results) {
    const planet = fullState.planets.find(p => p.id === item.planet_id) || fullState.activePlanet;
    if (item.item_type === 'building') {
      const b = planet.buildings.find(x => x.id === item.item_id);
      if (b) { b.level = item.target_level; planet.rates = recalcRates(planet.buildings, fullState.research, fullState.allianceLevel); fullState.score += 50; }
    } else if (item.item_type === 'research') {
      const r = fullState.research.find(x => x.id === item.item_id);
      if (r) { r.level = item.target_level; if (item.item_id === 'energy_tech') { for (const p of fullState.planets) { p.rates = recalcRates(p.buildings, fullState.research, fullState.allianceLevel); } } fullState.score += 100; }
    } else if (item.item_type === 'fleet') {
      const f = planet.fleet.find(x => x.id === item.item_id);
      if (f) { f.count += item.target_level; fullState.score += 20 * item.target_level; }
    } else if (item.item_type === 'defense') {
      const d = planet.defense.find(x => x.id === item.item_id);
      if (d) { d.count += item.target_level; fullState.score += 10 * item.target_level; }
    }
  }
  await env.DB.batch(finished.results.map(r => env.DB.prepare('DELETE FROM build_queue WHERE id = ?').bind(r.id)));
  return fullState;
}

function accrueAllResources(fullState) {
  const now = Math.floor(Date.now() / 1000);
  for (const p of fullState.planets) {
    const elapsed = Math.min(now - p.updatedAt, 3600 * 8);
    if (elapsed > 0) {
      const storage = calcStorage(p.buildings, fullState.research);
      const rt = p.rates; const res = p.resources;
      p.resources.metal   = Math.min(storage.metal,   res.metal   + (rt.metal   / 3600) * elapsed);
      p.resources.crystal = Math.min(storage.crystal, res.crystal + (rt.crystal / 3600) * elapsed);
      p.resources.energy  = Math.min(storage.energy,  res.energy  + (rt.energy  / 3600) * elapsed);
      p.resources.deus    = Math.min(storage.deus,    res.deus    + (rt.deus    / 3600) * elapsed);
      p.updatedAt = now;
    }
  }
  return fullState;
}

// ── Quest Helpers ─────────────────────────────────────────────────────────────

async function ensureDailyQuests(env, userId) {
  const now = Math.floor(Date.now() / 1000);
  const existing = await env.DB.prepare('SELECT id FROM user_quests WHERE user_id = ? AND expires_at > ?').bind(userId, now).first();
  if (existing) return;
  const pool = [
    { type: 'upgrade', target: null, req: 2, reward: 5000, deus: 50 },
    { type: 'build', target: 'fighter_s', req: 10, reward: 8000, deus: 20 },
    { type: 'build', target: 'miner', req: 5, reward: 10000, deus: 30 },
    { type: 'mission', target: 'spy', req: 3, reward: 4000, deus: 100 },
    { type: 'mission', target: 'attack', req: 1, reward: 15000, deus: 200 },
    { type: 'donate', target: null, req: 1, reward: 12000, deus: 50 },
  ];
  const expiresAt = Math.floor(new Date().setHours(23,59,59,999) / 1000);
  const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
  for (const q of shuffled) {
    await env.DB.prepare(`INSERT INTO user_quests (user_id, quest_type, target_id, required, reward_metal, reward_deus, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(userId, q.type, q.target, q.req, q.reward, q.deus, expiresAt).run();
  }
}

export async function incrementQuest(env, userId, type, targetId = null, amount = 1) {
  const now = Math.floor(Date.now() / 1000);
  if (targetId) {
    await env.DB.prepare('UPDATE user_quests SET current = current + ? WHERE user_id = ? AND quest_type = ? AND target_id = ? AND expires_at > ? AND is_claimed = 0').bind(amount, userId, type, targetId, now).run();
  } else {
    await env.DB.prepare('UPDATE user_quests SET current = current + ? WHERE user_id = ? AND quest_type = ? AND expires_at > ? AND is_claimed = 0').bind(amount, userId, type, now).run();
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleGame(request, env, url, user) {
  const userId = user.sub;
  const path   = url.pathname;
  const method = request.method;

  await ensureDailyQuests(env, userId);
  let fullState = await getFullState(env, userId);
  if (!fullState) return jsonError(404, 'Game state not found', request);
  fullState = accrueAllResources(fullState);
  fullState = await processQueue(env, userId, fullState);

  // v2.4.0 Sync logic: Include server time for precise client ticking
  const responseData = (base) => ({ ...base, serverTime: Math.floor(Date.now() / 1000) });

  if (path === '/api/game/quests' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM user_quests WHERE user_id = ? AND expires_at > ?').bind(userId, Math.floor(Date.now() / 1000)).all();
    return jsonResponse(responseData({ ok: true, quests: results }), 200, request);
  }

  if (path.startsWith('/api/game/quests/claim/') && method === 'POST') {
    const qid = path.split('/').pop();
    const q = await env.DB.prepare('SELECT * FROM user_quests WHERE id = ? AND user_id = ?').bind(qid, userId).first();
    if (!q || q.is_claimed || q.current < q.required) return jsonError(400, 'Nem igényelhető jutalom', request);
    await env.DB.prepare('UPDATE user_quests SET is_claimed = 1 WHERE id = ?').bind(qid).run();
    fullState.activePlanet.resources.metal += q.reward_metal; fullState.activePlanet.resources.deus += q.reward_deus;
    await saveFullState(env, userId, fullState);
    return jsonResponse(responseData({ ok: true, reward: { metal: q.reward_metal, deus: q.reward_deus } }), 200, request);
  }

  if (path === '/api/game/state' && method === 'GET') {
    await saveFullState(env, userId, fullState);
    const storage = calcStorage(fullState.activePlanet.buildings, fullState.research);
    const queue   = await env.DB.prepare('SELECT * FROM build_queue WHERE user_id = ? ORDER BY finish_at ASC').bind(userId).all();
    const planetsSummary = fullState.planets.map(p => ({ id: p.id, name: p.name, emoji: p.emoji, coords: p.coords, isMain: p.isMain }));
    return jsonResponse(responseData({ ok: true, state: { research: fullState.research, score: fullState.score, allianceLevel: fullState.allianceLevel, activePlanet: fullState.activePlanet, planets: planetsSummary }, queue: queue.results, storage }), 200, request);
  }

  if (path === '/api/game/defense/build' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { defenseId, amount = 1 } = body;
    if (amount < 1 || amount > 10000) return jsonError(400, 'Érvénytelen mennyiség', request);

    const def = fullState.activePlanet.defense.find(x => x.id === defenseId);
    if (!def) return jsonError(404, 'Defense type not found', request);
    const preCheck = checkPrerequisites(def, fullState.activePlanet.buildings, fullState.research);
    if (!preCheck.ok) return jsonError(400, `Előfeltételek hiányoznak: ${preCheck.missing.join(', ')}`, request);
    const totalCost = { metal: def.cost.metal * amount, crystal: def.cost.crystal * amount };
    if (fullState.activePlanet.resources.metal < totalCost.metal || fullState.activePlanet.resources.crystal < totalCost.crystal) return jsonError(400, 'Nincs elég nyersanyag', request);
    fullState.activePlanet.resources.metal -= totalCost.metal; fullState.activePlanet.resources.crystal -= totalCost.crystal;
    const seconds = fleetBuildTime(amount, totalCost, fullState.activePlanet.buildings.find(b => b.id === 'shipyard')?.level || 1);
    const finishAt = Math.floor(Date.now() / 1000) + seconds;
    await env.DB.prepare(`INSERT INTO build_queue (id, user_id, planet_id, item_id, item_type, item_name, target_level, finish_at) VALUES (?, ?, ?, ?, 'defense', ?, ?, ?)`).bind(crypto.randomUUID(), userId, fullState.activePlanet.id, defenseId, `${def.icon} ${def.name} ×${amount}`, amount, finishAt).run();
    await saveFullState(env, userId, fullState);
    return jsonResponse(responseData({ ok: true, finishAt, cost: totalCost, state: fullState }), 200, request);
  }

  if (path === '/api/game/planet/switch' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { planetId } = body;
    if (!planetId) return jsonError(400, 'planetId required', request);
    await env.DB.prepare('UPDATE game_state SET active_planet_id = ? WHERE user_id = ?').bind(planetId, userId).run();
    return jsonResponse(responseData({ ok: true, activePlanetId: planetId }), 200, request);
  }

  if (path === '/api/game/upgrade' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { buildingId } = body;
    const b = fullState.activePlanet.buildings.find(x => x.id === buildingId);
    if (!b) return jsonError(404, 'Building not found', request);
    const preCheck = checkPrerequisites(b, fullState.activePlanet.buildings, fullState.research);
    if (!preCheck.ok) return jsonError(400, `Előfeltételek hiányoznak: ${preCheck.missing.join(', ')}`, request);
    const cost = buildCost(b);
    if (fullState.activePlanet.resources.metal < cost.metal || fullState.activePlanet.resources.crystal < cost.crystal) return jsonError(400, 'Nincs elég nyersanyag', request);
    fullState.activePlanet.resources.metal -= cost.metal; fullState.activePlanet.resources.crystal -= cost.crystal;
    const seconds = buildTime(b.level, fullState.activePlanet.buildings.find(x => x.id === 'robotics')?.level || 1); const finishAt = Math.floor(Date.now() / 1000) + seconds;
    await env.DB.prepare(`INSERT INTO build_queue (id, user_id, planet_id, item_id, item_type, item_name, target_level, finish_at) VALUES (?, ?, ?, ?, 'building', ?, ?, ?)`).bind(crypto.randomUUID(), userId, fullState.activePlanet.id, buildingId, `${b.icon} ${b.name} → Szint ${b.level + 1}`, b.level + 1, finishAt).run();
    await saveFullState(env, userId, fullState);
    await incrementQuest(env, userId, 'upgrade');
    return jsonResponse(responseData({ ok: true, finishAt, cost, seconds, state: fullState }), 200, request);
  }

  if (path === '/api/game/research' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { researchId } = body;
    const r = fullState.research.find(x => x.id === researchId);
    if (!r) return jsonError(404, 'Research not found', request);
    const preCheck = checkPrerequisites(r, fullState.activePlanet.buildings, fullState.research);
    if (!preCheck.ok) return jsonError(400, `Előfeltételek hiányoznak: ${preCheck.missing.join(', ')}`, request);
    const cost = researchCost(r);
    if (fullState.activePlanet.resources.metal < cost.metal || fullState.activePlanet.resources.crystal < cost.crystal) return jsonError(400, 'Nincs elég nyersanyag', request);
    fullState.activePlanet.resources.metal -= cost.metal; fullState.activePlanet.resources.crystal -= cost.crystal;
    const seconds = researchTime(r.level, fullState.activePlanet.buildings.find(x => x.id === 'lab')?.level || 1); const finishAt = Math.floor(Date.now() / 1000) + seconds;
    await env.DB.prepare(`INSERT INTO build_queue (id, user_id, planet_id, item_id, item_type, item_name, target_level, finish_at) VALUES (?, ?, ?, ?, 'research', ?, ?, ?)`).bind(crypto.randomUUID(), userId, fullState.activePlanet.id, researchId, `🔬 ${r.name} → Szint ${r.level + 1}`, r.level + 1, finishAt).run();
    await saveFullState(env, userId, fullState);
    return jsonResponse(responseData({ ok: true, finishAt, cost, seconds, state: fullState }), 200, request);
  }

  if (path === '/api/game/fleet/build' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { shipId, amount = 1 } = body;
    if (amount < 1 || amount > 10000) return jsonError(400, 'Invalid amount', request);
    const ship = fullState.activePlanet.fleet.find(x => x.id === shipId);
    if (!ship) return jsonError(404, 'Ship type not found', request);
    const preCheck = checkPrerequisites(ship, fullState.activePlanet.buildings, fullState.research);
    if (!preCheck.ok) return jsonError(400, `Előfeltételek hiányoznak: ${preCheck.missing.join(', ')}`, request);
    const totalCost = { metal: ship.cost.metal * amount, crystal: ship.cost.crystal * amount };
    if (fullState.activePlanet.resources.metal < totalCost.metal || fullState.activePlanet.resources.crystal < totalCost.crystal) return jsonError(400, 'Nincs elég nyersanyag', request);
    fullState.activePlanet.resources.metal -= totalCost.metal; fullState.activePlanet.resources.crystal -= totalCost.crystal;
    const seconds = fleetBuildTime(amount, totalCost, fullState.activePlanet.buildings.find(b => b.id === 'shipyard')?.level || 1); const finishAt = Math.floor(Date.now() / 1000) + seconds;
    await env.DB.prepare(`INSERT INTO build_queue (id, user_id, planet_id, item_id, item_type, item_name, target_level, finish_at) VALUES (?, ?, ?, ?, 'fleet', ?, ?, ?)`).bind(crypto.randomUUID(), userId, fullState.activePlanet.id, shipId, `${ship.icon} ${ship.name} ×${amount}`, amount, finishAt).run();
    await saveFullState(env, userId, fullState);
    await incrementQuest(env, userId, 'build', shipId, amount);
    return jsonResponse(responseData({ ok: true, finishAt, cost: totalCost, state: fullState }), 200, request);
  }

  if (path === '/api/game/sync' && method === 'POST') {
    await saveFullState(env, userId, fullState);
    await env.DB.prepare('UPDATE rankings SET score=?, updated_at=unixepoch() WHERE user_id=?').bind(fullState.score, userId).run();
    return jsonResponse(responseData({ ok: true, state: fullState }), 200, request);
  }

  return jsonError(404, 'Game endpoint not found', request);
}
