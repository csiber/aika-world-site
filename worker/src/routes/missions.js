/**
 * Fleet Missions routes
 * v2.6.0: Expeditions (Slot 16)
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { incrementQuest } from './game.js';

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
      const attackerGS = await getGlobalState(env, userId);
      const attackerState = { username: gs.username, fleet: currentShips, research: JSON.parse(attackerGS.research) };
      const targetPlanet = await getPlanetState(env, (await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND coords = ?').bind(mission.target_user_id, mission.target_coords).first())?.id);
      
      if (targetPlanet) {
        const targetGS = await getGlobalState(env, mission.target_user_id);
        const targetUser = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(mission.target_user_id).first();
        const defenderState = { username: targetUser.username, fleet: targetPlanet.fleet, defense: targetPlanet.defense, research: JSON.parse(targetGS.research), buildings: targetPlanet.buildings, resources: targetPlanet.resources };
        
        const battle = runBattle(attackerState, defenderState);
        result = { ...result, ...battle };
        currentShips = battle.attackerRemainingFleet;
        targetPlanet.fleet = battle.defenderRemainingFleet;
        targetPlanet.defense = battle.defenderRemainingDefense;
        targetPlanet.resources = battle.defenderResources;
        await savePlanetState(env, targetPlanet.id, targetPlanet);
        result.loot = battle.loot;

        if (battle.debris) {
            await env.DB.prepare(`UPDATE galaxy_map SET debris_metal = debris_metal + ?, debris_crystal = debris_crystal + ? WHERE coords = ?`)
                .bind(battle.debris.metal, battle.debris.crystal, mission.target_coords).run();
        }
      }
    }

    if (mission.mission_type === 'harvest') {
        const galaxyEntry = await env.DB.prepare('SELECT debris_metal, debris_crystal FROM galaxy_map WHERE coords = ?').bind(mission.target_coords).first();
        if (galaxyEntry) {
            const totalCargo = currentShips.reduce((s, u) => s + (u.cargo * u.count), 0);
            const harvestedMetal   = Math.min(galaxyEntry.debris_metal, totalCargo / 2);
            const harvestedCrystal = Math.min(galaxyEntry.debris_crystal, totalCargo / 2);
            result.loot = { metal: harvestedMetal, crystal: harvestedCrystal };
            await env.DB.prepare('UPDATE galaxy_map SET debris_metal = debris_metal - ?, debris_crystal = debris_crystal - ? WHERE coords = ?')
                .bind(harvestedMetal, harvestedCrystal, mission.target_coords).run();
        }
    }

    if (mission.mission_type === 'expedition') {
        const outcome = runExpedition(currentShips);
        result = { ...result, ...outcome };
        currentShips = outcome.remainingShips;
    }

    await env.DB.prepare(`UPDATE fleet_missions SET status=?, result=?, ships=?, return_at=? WHERE id=?`).bind(nextStatus, JSON.stringify(result), JSON.stringify(currentShips), returnAt, mission.id).run();
    const msgId = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(msgId, userId, missionIcon(mission.mission_type) + ' Küldetés', missionSubject(mission.mission_type, mission.target_name), formatMissionResult(mission, result), 'combat').run();
  }

  const returned = await env.DB.prepare(`SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'returning' AND return_at <= ?`).bind(userId, now).all();
  for (const mission of returned.results) {
    const originPlanet = await getPlanetState(env, mission.origin_planet_id);
    if (originPlanet) {
      const backShips = JSON.parse(mission.ships || '[]');
      const res = JSON.parse(mission.result || '{}');
      for (const s of backShips) { const t = originPlanet.fleet.find(f => f.id === s.id); if (t) t.count += s.count; }
      if (res.loot) { originPlanet.resources.metal += res.loot.metal || 0; originPlanet.resources.crystal += res.loot.crystal || 0; originPlanet.resources.deus += res.loot.deus || 0; }
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

function runExpedition(ships) {
    const roll = Math.random();
    const cargo = ships.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
    const remainingShips = JSON.parse(JSON.stringify(ships));
    let loot = null;
    let message = "";

    if (roll < 0.3) {
        loot = { metal: Math.floor(cargo * 0.4 * Math.random()), crystal: Math.floor(cargo * 0.2 * Math.random()), deus: Math.floor(cargo * 0.05 * Math.random()) };
        message = "A legénység értékes nyersanyagokat talált egy elhagyatott aszteroidán.";
    } else if (roll < 0.5) {
        message = "Az expedíció eseménytelenül telt, de a legénység tapasztaltabb lett.";
    } else if (roll < 0.6) {
        // Find small ship reward
        const bonus = Math.floor(Math.random() * 5) + 1;
        const target = remainingShips.find(s => s.id === 'fighter_s' || s.id === 'miner');
        if (target) { target.count += bonus; message = `Találtunk ${bonus} elhagyatott hajót, amiket sikerült üzembe helyezni.`; }
        else { message = "Találtunk egy régi űrállomást, de nem tudtuk hasznosítani."; }
    } else if (roll < 0.7) {
        const lossPct = 0.1 + Math.random() * 0.2;
        remainingShips.forEach(s => s.count = Math.floor(s.count * (1 - lossPct)));
        message = "Egy kisebb aszteroida-vihar megrongálta a flottát. Veszteségeink vannak.";
    } else if (roll < 0.8) {
        loot = { deus: Math.floor(Math.random() * 500) + 100 };
        message = "Ritka gázfelhőt találtunk, amiből Déusiumot tudtunk kinyern mission.";
    } else {
        message = "A flotta különös rádiójeleket észlelt, de mire a forráshoz értek, már nem találtak semmit.";
    }

    return { loot, message, remainingShips };
}

function runBattle(attacker, defender) {
    const getStats = (units, res, builds = []) => {
        const combat = res?.find(r => r.id === 'combat')?.level || 0;
        const shield = res?.find(r => r.id === 'shield')?.level || 0;
        const laser  = res?.find(r => r.id === 'laser')?.level || 0;
        const plasma = res?.find(r => r.id === 'plasma')?.level || 0;
        const atkBonus = 1 + combat * 0.10 + laser * 0.05 + plasma * 0.12;
        const defBonus = 1 + shield * 0.10;
        const atkTotal = units.reduce((s, u) => s + (u.attack * u.count * atkBonus), 0);
        const defTotal = units.reduce((s, u) => s + (u.shield * u.count * defBonus), 0);
        const defenseBuildingBonus = (builds.find(b => b.id === 'defense')?.level || 0) * 500;
        return { attack: Math.floor(atkTotal), shield: Math.floor(defTotal + defenseBuildingBonus), cargo: units.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0) };
    };

    const initialAtk = getStats(attacker.fleet, attacker.research);
    const initialDef = getStats([...defender.fleet, ...defender.defense], defender.research, defender.buildings);

    const rounds = [];
    let curAtkFleet = JSON.parse(JSON.stringify(attacker.fleet));
    let curDefFleet = JSON.parse(JSON.stringify(defender.fleet));
    let curDefDefense = JSON.parse(JSON.stringify(defender.defense));

    let lostMetal = 0;
    let lostCrystal = 0;

    const shipCosts = { fighter_s: {m:3000, c:1000}, fighter_l: {m:25000, c:7500}, cruiser: {m:50000, c:15000}, battleship: {m:150000, c:50000}, recycler: {m:10000, c:6000}, miner: {m:10000, c:20000}, colony: {m:10000, c:20000} };

    for (let r = 1; r <= 3; r++) {
        const atkStats = getStats(curAtkFleet, attacker.research);
        const defStats = getStats([...curDefFleet, ...curDefDefense], defender.research, defender.buildings);
        rounds.push({ round: r, attackerPower: atkStats.attack, defenderPower: defStats.shield });
        const atkDamage = atkStats.attack;
        const defDamage = defStats.shield / 2;
        const applyLoss = (units, dmg, totalShield) => {
            if (totalShield <= 0) return units.map(u => ({ ...u, count: 0 }));
            const lossPct = Math.min(1, dmg / (totalShield * 1.5 + 1));
            return units.map(u => {
                const countLost = Math.floor(u.count * lossPct);
                const cost = shipCosts[u.id] || {m:0,c:0};
                lostMetal += countLost * cost.m;
                lostCrystal += countLost * cost.c;
                return { ...u, count: u.count - countLost };
            });
        };
        curDefFleet = applyLoss(curDefFleet, atkDamage, defStats.shield);
        curDefDefense = applyLoss(curDefDefense, atkDamage, defStats.shield);
        curAtkFleet = applyLoss(curAtkFleet, defDamage, atkStats.shield || 1000);
        if (atkStats.attack <= 0 || defStats.shield <= 0) break;
    }

    const finalAtkStats = getStats(curAtkFleet, attacker.research);
    const finalDefStats = getStats([...curDefFleet, ...curDefDefense], defender.research, defender.buildings);
    const attackerWins = finalAtkStats.attack > finalDefStats.shield;
    
    let loot = { metal: 0, crystal: 0 };
    let defenderResources = { ...defender.resources };
    if (attackerWins) {
        const finalAtk = getStats(curAtkFleet, attacker.research);
        loot.metal = Math.min(finalAtk.cargo / 2, defenderResources.metal * 0.5);
        loot.crystal = Math.min(finalAtk.cargo / 2, defenderResources.crystal * 0.5);
        defenderResources.metal -= loot.metal;
        defenderResources.crystal -= loot.crystal;
    }

    return {
        attackerWins, attackerName: attacker.username, defenderName: defender.username,
        initialAtkFleet: attacker.fleet, initialDefFleet: defender.fleet, initialDefDefense: defender.defense,
        attackerRemainingFleet: curAtkFleet, defenderRemainingFleet: curDefFleet, defenderRemainingDefense: curDefDefense,
        defenderResources, loot, rounds,
        debris: { metal: Math.floor(lostMetal * 0.3), crystal: Math.floor(lostCrystal * 0.3) }
    };
}

function missionIcon(type) { return { spy: '🔍', attack: '⚔️', colonize: '🌍', return: '↩️', harvest: '🚛', expedition: '🌌' }[type] || '📡'; }
function missionSubject(type, name) {
  const subjects = { spy: `Kémjelentés — ${name}`, attack: `Harci jelentés — ${name}`, colonize: `Gyarmatosítás — ${name}`, return: `Flotta visszaérkezett — ${name}`, harvest: `Újrahasznosítás — ${name}`, expedition: `Expedíció Jelentés — ${name}` };
  return subjects[type] || `Küldetés — ${name}`;
}

function formatMissionResult(mission, result) {
  if (mission.mission_type === 'spy') {
    if (!result.resources) return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nNincs adat.`;
    return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nFém: ${Math.floor(result.resources.metal)}\nKristály: ${Math.floor(result.resources.crystal)}\nVédelem: ${result.defense?.length || 0} típusú egység észlelt.`;
  }
  if (mission.mission_type === 'attack') {
    return `⚔️ HARCI JELENTÉS — ${result.attackerWins ? 'GYŐZELEM' : 'VERESÉG'}\n\nZsákmány:\nFém: ${Math.floor(result.loot.metal)}\nKristály: ${Math.floor(result.loot.crystal)}\n\n[DETAILED_REPORT:${mission.id}]`;
  }
  if (mission.mission_type === 'harvest') {
      return `🚛 ÚJRAHASZNOSÍTÁS JELENTÉS\n\nKoordináta: ${mission.target_coords}\nGyűjtött fém: ${Math.floor(result.loot.metal)}\nGyűjtött kristály: ${Math.floor(result.loot.crystal)}`;
  }
  if (mission.mission_type === 'expedition') {
      return `🌌 EXPEDÍCIÓ JELENTÉS\n\n${result.message}\n\nTalált nyersanyagok:\nFém: ${Math.floor(result.loot?.metal || 0)}\nKristály: ${Math.floor(result.loot?.crystal || 0)}\nDéusium: ${Math.floor(result.loot?.deus || 0)}`;
  }
  return 'Küldetés befejezve.';
}
