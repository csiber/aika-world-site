/**
 * Fleet Missions routes
 */

import { jsonResponse, jsonError } from '../utils/response.js';

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getPlanetState(env, planetId) {
  const row = await env.DB.prepare('SELECT * FROM planets WHERE id = ?').bind(planetId).first();
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    resources: JSON.parse(row.resources),
    rates: JSON.parse(row.rates),
    buildings: JSON.parse(row.buildings),
    fleet: JSON.parse(row.fleet),
    defense: JSON.parse(row.defense || '[]'),
    coords: row.coords,
    updatedAt: row.updated_at,
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

export async function resolveMissionsForUser(env, userId) {
  const now = Math.floor(Date.now() / 1000);
  const gs = await getGlobalState(env, userId);
  if (!gs) return 0;

  const arrived = await env.DB.prepare(`SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'travelling' AND arrive_at <= ?`).bind(userId, now).all();

  for (const mission of arrived.results) {
    let result = JSON.parse(mission.result || '{}');
    let currentShips = JSON.parse(mission.ships || '[]');
    let nextStatus = 'returning';
    const travelTime = mission.arrive_at - mission.created_at; 
    const returnAt = now + travelTime;

    if (mission.mission_type === 'colonize' && result.success) {
      const planetCount = (await env.DB.prepare('SELECT COUNT(*) as cnt FROM planets WHERE user_id = ?').bind(userId).first()).cnt;
      if (planetCount < 9) {
        const newId = crypto.randomUUID();
        const defB = JSON.parse((await env.DB.prepare('SELECT data FROM default_buildings').first()).data);
        const defF = JSON.parse((await env.DB.prepare('SELECT data FROM default_fleet').first()).data);
        const defD = JSON.parse((await env.DB.prepare('SELECT data FROM default_defense').first()).data);
        await env.DB.prepare(`INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, defense, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`)
          .bind(newId, userId, result.planetName, result.emoji, mission.target_coords, JSON.stringify(defB), JSON.stringify(defF), JSON.stringify(defD)).run();
        const username = (await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(userId).first()).username;
        await env.DB.prepare(`INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score, is_main) VALUES (?, ?, ?, ?, ?, ?, 0)`)
          .bind(userId, username, result.planetName, result.emoji, mission.target_coords, gs.score).run();
        nextStatus = 'done';
      }
    }

    if (mission.mission_type === 'attack') {
      const attackerState = { fleet: currentShips, research: JSON.parse(gs.research) };
      const targetPlanet = await getPlanetState(env, (await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND coords = ?').bind(mission.target_user_id, mission.target_coords).first())?.id);
      
      if (targetPlanet) {
        const targetGS = await getGlobalState(env, mission.target_user_id);
        const defenderState = { fleet: targetPlanet.fleet, defense: targetPlanet.defense, research: JSON.parse(targetGS.research), buildings: targetPlanet.buildings, resources: targetPlanet.resources };
        const battle = runBattle(attackerState, defenderState);
        result = { ...result, ...battle };
        currentShips = battle.attackerRemainingFleet;
        targetPlanet.fleet = battle.defenderRemainingFleet;
        targetPlanet.defense = battle.defenderRemainingDefense;
        targetPlanet.resources = battle.defenderResources;
        await savePlanetState(env, targetPlanet.id, targetPlanet);
        result.loot = battle.loot;
      }
    }

    await env.DB.prepare(`UPDATE fleet_missions SET status=?, result=?, ships=?, return_at=? WHERE id=?`).bind(nextStatus, JSON.stringify(result), JSON.stringify(currentShips), returnAt, mission.id).run();
    await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, missionIcon(mission.mission_type) + ' Küldetés', missionSubject(mission.mission_type, mission.target_name), formatMissionResult(mission, result), 'combat').run();
  }

  const returned = await env.DB.prepare(`SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'returning' AND return_at <= ?`).bind(userId, now).all();
  for (const mission of returned.results) {
    const originPlanet = await getPlanetState(env, mission.origin_planet_id);
    if (originPlanet) {
      const backShips = JSON.parse(mission.ships || '[]');
      const res = JSON.parse(mission.result || '{}');
      for (const s of backShips) { const t = originPlanet.fleet.find(f => f.id === s.id); if (t) t.count += s.count; }
      if (res.loot) { originPlanet.resources.metal += res.loot.metal || 0; originPlanet.resources.crystal += res.loot.crystal || 0; }
      await savePlanetState(env, originPlanet.id, originPlanet);
    }
    await env.DB.prepare(`UPDATE fleet_missions SET status='done' WHERE id=?`).bind(mission.id).run();
  }
  return arrived.results.length + returned.results.length;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleMissions(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;
  const gs = await getGlobalState(env, userId);
  const activePlanetId = gs?.active_planet_id;

  if (path === '/api/galaxy' && method === 'GET') {
    const rows = await env.DB.prepare(`SELECT user_id, username, planet_name, planet_emoji, coords, score FROM galaxy_map ORDER BY score DESC LIMIT 200`).all();
    const { results: myPlanets } = await env.DB.prepare('SELECT id, name, emoji, coords FROM planets WHERE user_id = ?').bind(userId).all();
    return jsonResponse({ ok: true, players: rows.results, myPlanets }, 200, request);
  }

  if (path === '/api/missions' && method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM fleet_missions WHERE user_id = ? AND status != ? ORDER BY arrive_at ASC').bind(userId, 'done').all();
    return jsonResponse({ ok: true, missions: rows.results }, 200, request);
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
        if (targetP) { res.resources = JSON.parse(targetP.resources); res.fleet = JSON.parse(targetP.fleet).filter(f => f.count > 0); res.defense = JSON.parse(targetP.defense || '[]').filter(d => d.count > 0); }
    }
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at) VALUES (?, ?, ?, ?, 'spy', ?, ?, 'travelling', ?, ?, ?, unixepoch())`)
      .bind(crypto.randomUUID(), userId, planet.id, targetUserId || null, targetCoords, targetName || 'Ismeretlen', JSON.stringify(sentShips), JSON.stringify(res), arriveAt).run();
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
    await env.DB.prepare(`INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at) VALUES (?, ?, ?, 'colonize', ?, ?, 'travelling', ?, ?, ?, unixepoch())`)
      .bind(crypto.randomUUID(), userId, planet.id, targetCoords, pName, JSON.stringify([{id:'colony', count:1}]), JSON.stringify({success:true, planetName:pName, emoji:'🪐'}), arriveAt).run();
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

function runBattle(attacker, defender) {
    const calcPower = (units, research, buildings = []) => {
        const combatLevel = research?.find(r => r.id === 'combat')?.level || 0;
        const shieldLevel = research?.find(r => r.id === 'shield')?.level || 0;
        const laserLevel  = research?.find(r => r.id === 'laser')?.level || 0;
        const atkBonus = 1 + combatLevel * 0.10 + laserLevel * 0.05;
        const defBonus = 1 + shieldLevel * 0.10;
        const attack = units.reduce((s, u) => s + (u.attack * u.count * atkBonus), 0);
        const shield = units.reduce((s, u) => s + (u.shield * u.count * defBonus), 0);
        const cargo  = units.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
        const defenseBonus = (buildings.find(b => b.id === 'defense')?.level || 0) * 500;
        return { attack, shield: shield + defenseBonus, cargo };
    };

    const atkPow = calcPower(attacker.fleet, attacker.research);
    const defPow = calcPower([...defender.fleet, ...(defender.defense || [])], defender.research, defender.buildings);

    const attackerWins = atkPow.attack > defPow.shield;
    const loss = (units, pct) => units.map(u => ({ ...u, count: Math.floor(u.count * (1 - pct)) }));

    const atkLoss = attackerWins ? 0.2 : 0.8;
    const defLoss = attackerWins ? 0.9 : 0.1;

    const attackerRemainingFleet = loss(attacker.fleet, atkLoss);
    const defenderRemainingFleet = loss(defender.fleet, defLoss);
    const defenderRemainingDefense = loss(defender.defense || [], defLoss);

    let loot = { metal: 0, crystal: 0 };
    let defenderResources = { ...defender.resources };
    if (attackerWins) {
        loot.metal = Math.min(atkPow.cargo / 2, defenderResources.metal * 0.5);
        loot.crystal = Math.min(atkPow.cargo / 2, defenderResources.crystal * 0.5);
        defenderResources.metal -= loot.metal;
        defenderResources.crystal -= loot.crystal;
    }

    return { attackerWins, attackerRemainingFleet, defenderRemainingFleet, defenderRemainingDefense, defenderResources, loot };
}

function missionIcon(type) { return { spy: '🔍', attack: '⚔️', colonize: '🌍', return: '↩️' }[type] || '📡'; }
function missionSubject(type, name) {
  const subjects = { spy: `Kémjelentés — ${name}`, attack: `Harci jelentés — ${name}`, colonize: `Gyarmatosítás — ${name}`, return: `Flotta visszaérkezett — ${name}` };
  return subjects[type] || `Küldetés — ${name}`;
}

function formatMissionResult(mission, result) {
  if (mission.mission_type === 'spy') {
    if (!result.resources) return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nNincs adat.`;
    return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nFém: ${Math.floor(result.resources.metal)}\nKristály: ${Math.floor(result.resources.crystal)}\nVédelem: ${result.defense?.length || 0} típusú egység észlelt.`;
  }
  if (mission.mission_type === 'attack') {
    return `⚔️ HARCI JELENTÉS\n\nEredmény: ${result.attackerWins ? 'GYŐZELEM' : 'VERESÉG'}\nZsákmány:\nFém: ${Math.floor(result.loot.metal)}\nKristály: ${Math.floor(result.loot.crystal)}`;
  }
  return 'Küldetés befejezve.';
}
