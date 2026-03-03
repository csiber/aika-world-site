/**
 * Fleet Missions routes
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { incrementQuest } from './game.js';
import { resolveMissionsForUser } from '../utils/mission_resolver.js';

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getPlanetState(env, planetId) {
  const row = await env.DB.prepare('SELECT * FROM planets WHERE id = ?').bind(planetId).first();
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id,
    resources: JSON.parse(row.resources),
    rates: JSON.parse(row.rates),
    buildings: JSON.parse(row.buildings),
    fleet: JSON.parse(row.fleet),
    defense: JSON.parse(row.defense || '[]'),
    coords: row.coords, updatedAt: row.updated_at,
  };
}

async function savePlanetState(env, planetId, state) {
  await env.DB.prepare(`
    UPDATE planets SET resources=?, rates=?, buildings=?, fleet=?, defense=?, updated_at=unixepoch()
    WHERE id=?
  `).bind(
    JSON.stringify(state.resources), JSON.stringify(state.rates),
    JSON.stringify(state.buildings), JSON.stringify(state.fleet),
    JSON.stringify(state.defense || []),
    planetId
  ).run();
}

async function getGlobalState(env, userId) {
  return await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(userId).first();
}

function calcTravelTime(fromCoords, targetCoords, research, baseSeconds = 300) {
  const driveLevel = research?.find(r => r.id === 'drive')?.level || 0;
  const driveBonus = 1 + driveLevel * 0.15;
  const parse = (c) => (c.match(/\d+/g) || [1,1,1]).map(Number);
  const [g1, s1, p1] = parse(fromCoords);
  const [g2, s2, p2] = parse(targetCoords);
  let dist = 0;
  if (g1 !== g2) dist = Math.abs(g1 - g2) * 2000;
  else if (s1 !== s2) dist = Math.abs(s1 - s2) * 200;
  else dist = Math.abs(p1 - p2) * 20;
  return Math.max(60, Math.floor((baseSeconds + dist / 10) / driveBonus));
}

// ── Automated Resolution ──────────────────────────────────────────────────────

export async function resolveAllMissions(env) {
  const { results: users } = await env.DB.prepare('SELECT DISTINCT user_id FROM fleet_missions WHERE status != "done"').all();
  let count = 0;
  for (const u of users) { count += await resolveMissionsForUser(env, u.user_id); }
  return count;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleMissions(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;
  const gs = await getGlobalState(env, userId);
  const activePlanetId = gs?.active_planet_id;

  if (path === '/api/galaxy' && method === 'GET') {
    const gal = url.searchParams.get('galaxy') || '1';
    const sys = url.searchParams.get('system') || '1';
    const pattern = `[${gal}:${sys}:%`;
    const rows = await env.DB.prepare(`SELECT user_id, username, planet_name, planet_emoji, coords, score, debris_metal, debris_crystal FROM galaxy_map WHERE coords LIKE ? ORDER BY coords ASC`).bind(pattern).all();
    const { results: myPlanets } = await env.DB.prepare('SELECT id, name, emoji, coords FROM planets WHERE user_id = ?').bind(userId).all();
    return jsonResponse({ ok: true, players: rows.results, myPlanets, galaxy: parseInt(gal), system: parseInt(sys) }, 200, request);
  }

  if (path === '/api/missions' && method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM fleet_missions WHERE user_id = ? AND status != ? ORDER BY arrive_at ASC').bind(userId, 'done').all();
    return jsonResponse({ ok: true, missions: rows.results }, 200, request);
  }

  if (path.startsWith('/api/missions/report/') && method === 'GET') {
      const mid = path.split('/').pop();
      const m = await env.DB.prepare('SELECT * FROM fleet_missions WHERE id = ? AND user_id = ?').bind(mid, userId).first();
      if (!m) return jsonError(404, 'Report not found', request);
      return jsonResponse({ ok: true, report: JSON.parse(m.result) }, 200, request);
  }

  if (path.startsWith('/api/missions/recall/') && method === 'POST') {
      const mid = path.split('/').pop();
      const m = await env.DB.prepare('SELECT * FROM fleet_missions WHERE id = ? AND user_id = ?').bind(mid, userId).first();
      if (!m) return jsonError(404, 'Mission not found', request);
      if (m.status !== 'travelling') return jsonError(400, 'Csak úton lévő flotta hívható vissza', request);
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - m.created_at;
      const returnAt = now + elapsed;
      await env.DB.prepare(`UPDATE fleet_missions SET status = 'returning', return_at = ? WHERE id = ?`).bind(returnAt, mid).run();
      return jsonResponse({ ok: true, returnAt }, 200, request);
  }

  if (path === '/api/missions/resolve' && method === 'POST') {
    const count = await resolveMissionsForUser(env, userId);
    return jsonResponse({ ok: true, resolved: count }, 200, request);
  }

  if (path === '/api/missions/spy' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, targetCoords, targetName, ships } = body;
    const planet = await getPlanetState(env, activePlanetId);
    if (!planet) return jsonError(404, 'Bolygó nem található', request);
    const { fleet: newFleet, sentShips } = extractShips(planet.fleet, ships);
    if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);
    planet.fleet = newFleet; await savePlanetState(env, planet.id, planet);
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 60);
    let res = { success: true };
    if (targetUserId) {
        const targetP = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ? AND coords = ?').bind(targetUserId, targetCoords).first();
        if (targetP) { 
            const targetUser = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(targetUserId).first();
            res.targetUsername = targetUser.username;
            res.resources = JSON.parse(targetP.resources); 
            res.fleet = JSON.parse(targetP.fleet).filter(f => f.count > 0); 
            res.defense = JSON.parse(targetP.defense || '[]').filter(d => d.count > 0); 
        }
    }
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at) VALUES (?, ?, ?, ?, 'spy', ?, ?, 'travelling', ?, ?, ?, unixepoch())`)
      .bind(crypto.randomUUID(), userId, planet.id, targetUserId || null, targetCoords, targetName || 'Ismeretlen', JSON.stringify(sentShips), JSON.stringify(res), arriveAt).run();
    await incrementQuest(env, userId, 'mission', 'spy');
    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/attack' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, targetCoords, targetName, ships } = body;
    const planet = await getPlanetState(env, activePlanetId);
    if (!planet) return jsonError(404, 'Bolygó nem található', request);
    const { fleet: newFleet, sentShips } = extractShips(planet.fleet, ships);
    if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);
    planet.fleet = newFleet; await savePlanetState(env, planet.id, planet);
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 180);
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at) VALUES (?, ?, ?, ?, 'attack', ?, ?, 'travelling', ?, ?, unixepoch())`)
      .bind(crypto.randomUUID(), userId, planet.id, targetUserId, targetCoords, targetName || 'Ismeretlen', JSON.stringify(sentShips), arriveAt).run();
    await incrementQuest(env, userId, 'mission', 'attack');
    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/harvest' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetCoords, targetName, ships } = body;
    const planet = await getPlanetState(env, activePlanetId);
    const { fleet: newFleet, sentShips } = extractShips(planet.fleet, ships);
    if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);
    planet.fleet = newFleet; await savePlanetState(env, planet.id, planet);
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 120);
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at) VALUES (?, ?, ?, 'harvest', ?, ?, 'travelling', ?, ?, unixepoch())`)
      .bind(crypto.randomUUID(), userId, planet.id, targetCoords, targetName || 'Törmelékmező', JSON.stringify(sentShips), arriveAt).run();
    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/expedition' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetCoords, ships } = body;
    const planet = await getPlanetState(env, activePlanetId);
    if (!planet) return jsonError(404, 'Planet not found', request);
    const { fleet: newFleet, sentShips } = extractShips(planet.fleet, ships);
    if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);
    planet.fleet = newFleet; await savePlanetState(env, planet.id, planet);
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 300);
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at) VALUES (?, ?, ?, 'expedition', ?, 'Mélyűr', 'travelling', ?, ?, unixepoch())`)
      .bind(crypto.randomUUID(), userId, planet.id, targetCoords, JSON.stringify(sentShips), arriveAt).run();
    await incrementQuest(env, userId, 'mission', 'expedition');
    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/colonize' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetCoords } = body;
    const planet = await getPlanetState(env, activePlanetId);
    const colShip = planet.fleet.find(f => f.id === 'colony');
    if (!colShip || colShip.count < 1) return jsonError(400, 'Nincs gyarmatosító hajód');
    colShip.count--; await savePlanetState(env, planet.id, planet);
    const pName = `${user.username} új gyarmata`;
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 600);
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at) VALUES (?, ?, ?, ?, 'colonize', ?, ?, 'travelling', ?, ?, ?, unixepoch())`)
      .bind(crypto.randomUUID(), userId, planet.id, targetCoords, pName, JSON.stringify([{id:'colony', count:1}]), JSON.stringify({success:true, planetName:pName, emoji:'🪐'}), arriveAt).run();
    await incrementQuest(env, userId, 'mission', 'colonize');
    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  return jsonError(404, 'Mission endpoint not found', request);
}

// ── Helpers ───────────────────────────────────────────────

function extractShips(currentFleet, requestedShips) {
  const sentShips = [];
  const newFleet = JSON.parse(JSON.stringify(currentFleet));
  if (!requestedShips) { newFleet.forEach(f => { if (f.count > 0) { sentShips.push({ ...f, count: f.count }); f.count = 0; } }); }
  else { for (const req of requestedShips) { const t = newFleet.find(f => f.id === req.id); if (t && t.count >= req.count) { t.count -= req.count; sentShips.push({ ...t, count: req.count }); } } }
  return { fleet: newFleet, sentShips };
}
