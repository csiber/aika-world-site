/**
 * Fleet Missions routes
 * POST /api/missions/spy      — kémkedés
 * POST /api/missions/attack   — támadás
 * POST /api/missions/colonize — gyarmatosítás
 * GET  /api/missions          — aktív küldetések listája
 * POST /api/missions/resolve  — befejezett küldetések feldolgozása
 * GET  /api/galaxy            — galaxis térkép (valódi játékosok)
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
    coords: row.coords,
    updatedAt: row.updated_at,
  };
}

async function savePlanetState(env, planetId, state) {
  await env.DB.prepare(`
    UPDATE planets SET resources=?, rates=?, buildings=?, fleet=?, updated_at=unixepoch()
    WHERE id=?
  `).bind(
    JSON.stringify(state.resources), JSON.stringify(state.rates),
    JSON.stringify(state.buildings), JSON.stringify(state.fleet),
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

  const time = Math.floor((baseSeconds + dist / 10) / driveBonus);
  return Math.max(60, time);
}

// ── Automated Resolution ──────────────────────────────────────────────────────

export async function resolveAllMissions(env) {
  const { results: users } = await env.DB.prepare('SELECT DISTINCT user_id FROM fleet_missions WHERE status != "done"').all();
  let count = 0;
  for (const u of users) {
    count += await resolveMissionsForUser(env, u.user_id);
  }
  return count;
}

export async function resolveMissionsForUser(env, userId) {
  const now = Math.floor(Date.now() / 1000);
  const gs = await getGlobalState(env, userId);
  if (!gs) return 0;

  // 1. Process fleets arriving at target
  const arrived = await env.DB.prepare(
    `SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'travelling' AND arrive_at <= ?`
  ).bind(userId, now).all();

  for (const mission of arrived.results) {
    let result = JSON.parse(mission.result || '{}');
    let currentShips = JSON.parse(mission.ships || '[]');
    let nextStatus = 'returning';
    
    // Calculate travel time for return trip
    const travelTime = mission.arrive_at - mission.created_at; 
    const returnAt = now + travelTime;

    if (mission.mission_type === 'colonize' && result.success) {
      const planetCount = (await env.DB.prepare('SELECT COUNT(*) as cnt FROM planets WHERE user_id = ?').bind(userId).first()).cnt;
      if (planetCount < 9) {
        const newId = crypto.randomUUID();
        const defaultBuildings = await env.DB.prepare('SELECT data FROM default_buildings').first();
        const defaultFleet = await env.DB.prepare('SELECT data FROM default_fleet').first();
        
        await env.DB.prepare(`
          INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())
        `).bind(newId, userId, result.planetName, result.emoji, mission.target_coords, defaultBuildings.data, defaultFleet.data).run();
        
        const username = (await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(userId).first()).username;
        await env.DB.prepare(`INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score, is_main)
           VALUES (?, ?, ?, ?, ?, ?, 0)`).bind(userId, username, result.planetName, result.emoji, mission.target_coords, gs.score).run();
        
        nextStatus = 'done'; // Colonizers don't return
      }
    }

    if (mission.mission_type === 'attack') {
      const attackerState = { fleet: currentShips, research: JSON.parse(gs.research) };
      const targetPlanet = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ? AND coords = ?')
        .bind(mission.target_user_id, mission.target_coords).first();
      
      if (targetPlanet) {
        const targetUser = await env.DB.prepare('SELECT * FROM game_state WHERE user_id = ?').bind(mission.target_user_id).first();
        const defenderState = { fleet: JSON.parse(targetPlanet.fleet), research: JSON.parse(targetUser.research), buildings: JSON.parse(targetPlanet.buildings) };
        
        const battleResult = runBattle(attackerState, defenderState);
        result = { ...result, ...battleResult };
        currentShips = battleResult.attackerRemainingFleet;
        
        await env.DB.prepare('UPDATE planets SET fleet=?, resources=? WHERE id=?')
          .bind(JSON.stringify(battleResult.defenderRemainingFleet), JSON.stringify(battleResult.defenderResources), targetPlanet.id).run();
          
        result.loot = battleResult.loot;
      }
    }

    await env.DB.prepare(
      `UPDATE fleet_missions SET status=?, result=?, ships=?, return_at=? WHERE id=?`
    ).bind(nextStatus, JSON.stringify(result), JSON.stringify(currentShips), returnAt, mission.id).run();

    await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, missionIcon(mission.mission_type) + ' Küldetés', missionSubject(mission.mission_type, mission.target_name), formatMissionResult(mission, result), 'combat').run();
  }

  // 2. Process fleets returning home
  const returned = await env.DB.prepare(
    `SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'returning' AND return_at <= ?`
  ).bind(userId, now).all();

  for (const mission of returned.results) {
    const originPlanet = await getPlanetState(env, mission.origin_planet_id);
    if (originPlanet) {
      const backShips = JSON.parse(mission.ships || '[]');
      const result = JSON.parse(mission.result || '{}');
      
      for (const s of backShips) {
        const target = originPlanet.fleet.find(f => f.id === s.id);
        if (target) target.count += s.count;
      }
      
      if (result.loot) {
        originPlanet.resources.metal += result.loot.metal || 0;
        originPlanet.resources.crystal += result.loot.crystal || 0;
      }
      
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
    const rows = await env.DB.prepare(`
      SELECT g.user_id, g.username, g.planet_name, g.planet_emoji, g.coords, g.score
      FROM galaxy_map g
      ORDER BY g.score DESC
      LIMIT 200
    `).all();

    const { results: myPlanets } = await env.DB.prepare('SELECT id, name, emoji, coords FROM planets WHERE user_id = ?').bind(userId).all();
    return jsonResponse({ ok: true, players: rows.results, myPlanets }, 200, request);
  }

  if (path === '/api/missions' && method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT * FROM fleet_missions WHERE user_id = ? AND status != ? ORDER BY arrive_at ASC'
    ).bind(userId, 'done').all();
    return jsonResponse({ ok: true, missions: rows.results }, 200, request);
  }

  if (path === '/api/missions/resolve' && method === 'POST') {
    const count = await resolveMissionsForUser(env, userId);
    return jsonResponse({ ok: true, resolved: count }, 200, request);
  }

  if (path === '/api/missions/spy' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, targetCoords, targetName, ships } = body;
    
    const planet = await getPlanetState(env, activePlanetId);
    if (!planet) return jsonError(404, 'Bolygó nem található', request);

    const { fleet: newFleet, sentShips } = extractShips(planet.fleet, ships);
    if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);
    planet.fleet = newFleet;
    await savePlanetState(env, planet.id, planet);

    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 60);
    
    let result = { success: true };
    if (targetUserId) {
        const targetPlanet = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ? AND coords = ?').bind(targetUserId, targetCoords).first();
        if (targetPlanet) {
            result.resources = JSON.parse(targetPlanet.resources);
            result.fleet = JSON.parse(targetPlanet.fleet).filter(f => f.count > 0);
        }
    }

    await env.DB.prepare(
      `INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at)
       VALUES (?, ?, ?, ?, 'spy', ?, ?, 'travelling', ?, ?, ?, unixepoch())`
    ).bind(crypto.randomUUID(), userId, planet.id, targetUserId || null, targetCoords, targetName || 'Ismeretlen', JSON.stringify(sentShips), JSON.stringify(result), arriveAt).run();

    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/attack' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, targetCoords, targetName, ships } = body;
    
    const planet = await getPlanetState(env, activePlanetId);
    if (!planet) return jsonError(404, 'Bolygó nem található', request);

    const { fleet: newFleet, sentShips } = extractShips(planet.fleet, ships);
    if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);
    planet.fleet = newFleet;
    await savePlanetState(env, planet.id, planet);

    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 180);

    await env.DB.prepare(
      `INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at)
       VALUES (?, ?, ?, ?, 'attack', ?, ?, 'travelling', ?, ?, unixepoch())`
    ).bind(crypto.randomUUID(), userId, planet.id, targetUserId, targetCoords, targetName || 'Ismeretlen', JSON.stringify(sentShips), arriveAt).run();

    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  if (path === '/api/missions/colonize' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetCoords } = body;
    
    const planet = await getPlanetState(env, activePlanetId);
    const colShip = planet.fleet.find(f => f.id === 'colony');
    if (!colShip || colShip.count < 1) return jsonError(400, 'Nincs gyarmatosító hajód');
    
    colShip.count--;
    await savePlanetState(env, planet.id, planet);

    const planetName = `${user.username} új gyarmata`;
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(planet.coords, targetCoords, JSON.parse(gs.research), 600);

    await env.DB.prepare(
      `INSERT INTO fleet_missions (id, user_id, origin_planet_id, mission_type, target_coords, target_name, status, ships, result, arrive_at, created_at)
       VALUES (?, ?, ?, 'colonize', ?, ?, 'travelling', ?, ?, ?, unixepoch())`
    ).bind(crypto.randomUUID(), userId, planet.id, targetCoords, planetName, JSON.stringify([{id:'colony', count:1}]), JSON.stringify({success:true, planetName, emoji:'🪐'}), arriveAt).run();

    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  return jsonError(404, 'Mission endpoint not found', request);
}

// ── Helpers ───────────────────────────────────────────────

function extractShips(currentFleet, requestedShips) {
  const sentShips = [];
  const newFleet = JSON.parse(JSON.stringify(currentFleet));
  
  if (!requestedShips) {
      newFleet.forEach(f => {
          if (f.count > 0) {
              sentShips.push({ ...f, count: f.count });
              f.count = 0;
          }
      });
  } else {
      for (const req of requestedShips) {
          const target = newFleet.find(f => f.id === req.id);
          if (target && target.count >= req.count) {
              target.count -= req.count;
              sentShips.push({ ...target, count: req.count });
          }
      }
  }
  return { fleet: newFleet, sentShips };
}

function runBattle(attacker, defender) {
    const calcPower = (fleet, research, buildings = []) => {
        const combatLevel = research?.find(r => r.id === 'combat')?.level || 0;
        const shieldLevel = research?.find(r => r.id === 'shield')?.level || 0;
        const attackBonus = 1 + combatLevel * 0.10;
        const shieldBonus = 1 + shieldLevel * 0.10;
        const attack = fleet.reduce((s, f) => s + (f.attack * f.count * attackBonus), 0);
        const shield = fleet.reduce((s, f) => s + (f.shield * f.count * shieldBonus), 0);
        const cargo  = fleet.reduce((s, f) => s + (f.cargo  * f.count), 0);
        const defenseBonus = (buildings.find(b => b.id === 'defense')?.level || 0) * 500;
        return { attack, shield: shield + defenseBonus, cargo };
    };

    const atkPow = calcPower(attacker.fleet, attacker.research);
    const defPow = calcPower(defender.fleet, defender.research, defender.buildings);

    const attackerWins = atkPow.attack > defPow.shield;
    
    const applyLosses = (fleet, lossPct) => {
        return fleet.map(f => ({ ...f, count: Math.floor(f.count * (1 - lossPct)) }));
    };

    const attackerLossPct = attackerWins ? 0.2 : 0.8;
    const defenderLossPct = attackerWins ? 0.9 : 0.1;

    const attackerRemainingFleet = applyLosses(attacker.fleet, attackerLossPct);
    const defenderRemainingFleet = applyLosses(defender.fleet, defenderLossPct);

    let loot = { metal: 0, crystal: 0 };
    let defenderResources = { ...defender.resources };

    if (attackerWins) {
        loot.metal = Math.min(atkPow.cargo / 2, defenderResources.metal * 0.5);
        loot.crystal = Math.min(atkPow.cargo / 2, defenderResources.crystal * 0.5);
        defenderResources.metal -= loot.metal;
        defenderResources.crystal -= loot.crystal;
    }

    return { attackerWins, attackerRemainingFleet, defenderRemainingFleet, defenderResources, loot };
}

function missionIcon(type) { return { spy: '🔍', attack: '⚔️', colonize: '🌍', return: '↩️' }[type] || '📡'; }
function missionSubject(type, name) {
  const subjects = { spy: `Kémjelentés — ${name}`, attack: `Harci jelentés — ${name}`, colonize: `Gyarmatosítás — ${name}`, return: `Flotta visszaérkezett — ${name}` };
  return subjects[type] || `Küldetés — ${name}`;
}

function formatMissionResult(mission, result) {
  if (mission.mission_type === 'spy') {
    if (!result.resources) return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nNincs adat.`;
    return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nFém: ${Math.floor(result.resources.metal)}\nKristály: ${Math.floor(result.resources.crystal)}`;
  }
  if (mission.mission_type === 'attack') {
    return `⚔️ HARCI JELENTÉS\n\nEredmény: ${result.attackerWins ? 'GYŐZELEM' : 'VERESÉG'}\nZsákmány:\nFém: ${Math.floor(result.loot.metal)}\nKristály: ${Math.floor(result.loot.crystal)}`;
  }
  return 'Küldetés befejezve.';
}
