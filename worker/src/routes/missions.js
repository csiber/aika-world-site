/**
 * Fleet Missions routes
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { incrementQuest } from './game.js';
import { trackQuestProgress } from '../utils/quest_tracker.js';
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

async function calcTravelTimeWithTerritory(env, userId, fromCoords, targetCoords, research, baseSeconds = 300) {
  let time = calcTravelTime(fromCoords, targetCoords, research, baseSeconds);

  const membership = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
  if (!membership) return time;

  const parse = (c) => (c.match(/\d+/g) || [1,1,1]).map(Number);
  const [g1, s1] = parse(fromCoords);
  const [g2, s2] = parse(targetCoords);

  // Check relay points controlled by player's alliance
  const originRelay = await env.DB.prepare(`
    SELECT rp.bonus_value FROM relay_points rp
    JOIN sector_claims sc ON rp.galaxy = sc.galaxy AND rp.system_num = sc.system_num
    WHERE rp.galaxy = ? AND rp.system_num = ? AND sc.alliance_id = ?
  `).bind(g1, s1, membership.alliance_id).first();

  const destRelay = await env.DB.prepare(`
    SELECT rp.bonus_value FROM relay_points rp
    JOIN sector_claims sc ON rp.galaxy = sc.galaxy AND rp.system_num = sc.system_num
    WHERE rp.galaxy = ? AND rp.system_num = ? AND sc.alliance_id = ?
  `).bind(g2, s2, membership.alliance_id).first();

  // Relay bonus: 1.5x speed if either system has a controlled relay
  if (originRelay || destRelay) {
    time = Math.floor(time / 1.5);
  }

  // Sector control bonus: 1.1x speed if both systems are alliance-controlled
  const originClaim = await env.DB.prepare('SELECT 1 FROM sector_claims WHERE galaxy = ? AND system_num = ? AND alliance_id = ?')
    .bind(g1, s1, membership.alliance_id).first();
  const destClaim = await env.DB.prepare('SELECT 1 FROM sector_claims WHERE galaxy = ? AND system_num = ? AND alliance_id = ?')
    .bind(g2, s2, membership.alliance_id).first();

  if (originClaim && destClaim) {
    time = Math.floor(time / 1.1);
  }

  return Math.max(60, time);
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
    const rows = await env.DB.prepare(`
      SELECT g.user_id, g.username, g.planet_name, g.planet_emoji, g.coords, g.score, g.debris_metal, g.debris_crystal,
      EXISTS(SELECT 1 FROM moons m JOIN planets p ON m.planet_id = p.id WHERE p.coords = g.coords) as has_moon,
      am.alliance_id, a.tag as alliance_tag
      FROM galaxy_map g
      LEFT JOIN alliance_members am ON g.user_id = am.user_id
      LEFT JOIN alliances a ON am.alliance_id = a.id
      WHERE g.coords LIKE ?
      ORDER BY g.coords ASC
    `).bind(pattern).all();
    
    // Calculate system control
    const allianceCounts = {};
    rows.results.forEach(r => { if (r.alliance_tag) allianceCounts[r.alliance_tag] = (allianceCounts[r.alliance_tag] || 0) + 1; });
    let controller = null;
    for (const [tag, count] of Object.entries(allianceCounts)) { if (count > 7) controller = tag; }

    const { results: myPlanets } = await env.DB.prepare('SELECT id, name, emoji, coords FROM planets WHERE user_id = ?').bind(userId).all();
    return jsonResponse({ ok: true, players: rows.results, myPlanets, galaxy: parseInt(gal), system: parseInt(sys), controller }, 200, request);
  }

  // ── POST /api/missions/acs/invite ───────────────────────
  if (path === '/api/missions/acs/invite' && method === 'POST') {
      let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
      const { missionId, targetUserId } = body;
      
      const mission = await env.DB.prepare('SELECT * FROM fleet_missions WHERE id = ? AND user_id = ?').bind(missionId, userId).first();
      if (!mission || mission.mission_type !== 'attack') return jsonError(404, 'Misszió nem található', request);
      
      const unionId = mission.union_id || crypto.randomUUID();
      if (!mission.union_id) {
          await env.DB.prepare('UPDATE fleet_missions SET union_id = ? WHERE id = ?').bind(unionId, missionId).run();
      }
      
      // Notify target
      await env.DB.prepare('INSERT INTO messages (user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?)')
        .bind(targetUserId, username, 'ACS Meghívó', `Meghívtak egy közös támadásra! Célpont: ${mission.target_coords}. Union ID: ${unionId}`, 'system').run();
        
      return jsonResponse({ ok: true, unionId }, 200, request);
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
    const arriveAt = Math.floor(Date.now() / 1000) + await calcTravelTimeWithTerritory(env, userId, planet.coords, targetCoords, JSON.parse(gs.research), 60);
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
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at, origin_coords) VALUES (?, ?, ?, ?, 'spy', ?, ?, 'travelling', ?, ?, ?, unixepoch(), ?)`)
      .bind(crypto.randomUUID(), userId, planet.id, targetUserId || null, targetCoords, targetName || 'Ismeretlen', JSON.stringify(sentShips), JSON.stringify(res), arriveAt, planet.coords).run();
    await incrementQuest(env, userId, 'mission', 'spy');
    await trackQuestProgress(env, userId, 'spy', 1);
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
    const arriveAt = Math.floor(Date.now() / 1000) + await calcTravelTimeWithTerritory(env, userId, planet.coords, targetCoords, JSON.parse(gs.research), 180);
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at, origin_coords) VALUES (?, ?, ?, ?, 'attack', ?, ?, 'travelling', ?, ?, unixepoch(), ?)`)
      .bind(crypto.randomUUID(), userId, planet.id, targetUserId, targetCoords, targetName || 'Ismeretlen', JSON.stringify(sentShips), arriveAt, planet.coords).run();
    await incrementQuest(env, userId, 'mission', 'attack');
    await trackQuestProgress(env, userId, 'attack', 1);
    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/harvest' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetCoords, targetName, ships } = body;
    const planet = await getPlanetState(env, activePlanetId);
    const { fleet: newFleet, sentShips } = extractShips(planet.fleet, ships);
    if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);
    planet.fleet = newFleet; await savePlanetState(env, planet.id, planet);
    const arriveAt = Math.floor(Date.now() / 1000) + await calcTravelTimeWithTerritory(env, userId, planet.coords, targetCoords, JSON.parse(gs.research), 120);
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at, origin_coords) VALUES (?, ?, ?, 'harvest', ?, ?, 'travelling', ?, ?, unixepoch(), ?)`)
      .bind(crypto.randomUUID(), userId, planet.id, targetCoords, targetName || 'Törmelékmező', JSON.stringify(sentShips), arriveAt, planet.coords).run();
    await trackQuestProgress(env, userId, 'harvest', 1);
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
    const arriveAt = Math.floor(Date.now() / 1000) + await calcTravelTimeWithTerritory(env, userId, planet.coords, targetCoords, JSON.parse(gs.research), 300);
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at, origin_coords) VALUES (?, ?, ?, 'expedition', ?, 'Mélyűr', 'travelling', ?, ?, unixepoch(), ?)`)
      .bind(crypto.randomUUID(), userId, planet.id, targetCoords, JSON.stringify(sentShips), arriveAt, planet.coords).run();
    await incrementQuest(env, userId, 'mission', 'expedition');
    await trackQuestProgress(env, userId, 'expedition', 1);
    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/colonize' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetCoords } = body;
    
    // v2.7.4: PRE-CHECK coordinate availability
    const occupied = await env.DB.prepare('SELECT 1 FROM galaxy_map WHERE coords = ?').bind(targetCoords).first();
    if (occupied) return jsonError(400, 'Ez a koordináta már foglalt!', request);

    const planet = await getPlanetState(env, activePlanetId);
    const colShip = planet.fleet.find(f => f.id === 'colony');
    if (!colShip || colShip.count < 1) return jsonError(400, 'Nincs gyarmatosító hajód');
    
    colShip.count--; await savePlanetState(env, planet.id, planet);
    const pName = `${user.username} új gyarmata`;
    const arriveAt = Math.floor(Date.now() / 1000) + await calcTravelTimeWithTerritory(env, userId, planet.coords, targetCoords, JSON.parse(gs.research), 600);
    
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at, origin_coords) VALUES (?, ?, ?, 'colonize', ?, ?, 'travelling', ?, ?, ?, unixepoch(), ?)`)
      .bind(crypto.randomUUID(), userId, planet.id, targetCoords, pName, JSON.stringify([{id:'colony', count:1}]), JSON.stringify({success:true, planetName:pName, emoji:'🪐'}), arriveAt, planet.coords).run();
    await incrementQuest(env, userId, 'mission', 'colonize');
    await trackQuestProgress(env, userId, 'colonize', 1);
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
