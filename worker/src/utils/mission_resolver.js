/**
 * AIKA WORLD — Mission Resolver Engine
 * v2.7.0: Decoupled for 10/10 stability
 */

import { runBattle, runExpedition } from './combat_logic.js';

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

export async function resolveMissionsForUser(env, userId) {
  const now = Math.floor(Date.now() / 1000);
  const gs = await getGlobalState(env, userId);
  if (!gs) return 0;

  // 1. Fleets arriving at target
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
    
    // Create message
    const msgId = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(msgId, userId, missionIcon(mission.mission_type) + ' Küldetés', missionSubject(mission.mission_type, mission.target_name), formatMissionResult(mission, result), 'combat').run();
  }

  // 2. Fleets returning home
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

function missionIcon(type) { return { spy: '🔍', attack: '⚔️', colonize: '🌍', return: '↩️', harvest: '🚛', expedition: '🌌' }[type] || '📡'; }
function missionSubject(type, name) {
  const subjects = { spy: `Kémjelentés — ${name}`, attack: `Harci jelentés — ${name}`, colonize: `Gyarmatosítás — ${name}`, return: `Flotta visszaérkezett — ${name}`, harvest: `Újrahasznosítás — ${name}`, expedition: `Expedíció Jelentés — ${name}` };
  return subjects[type] || `Küldetés — ${name}`;
}

function formatMissionResult(mission, result) {
  if (mission.mission_type === 'spy') {
    if (!result.resources) return `🔍 KÉM JELENTÉS

Cél: ${mission.target_name}

Nincs adat.`;
    return `🔍 KÉM JELENTÉS

Cél: ${mission.target_name}

Fém: ${Math.floor(result.resources.metal)}
Kristály: ${Math.floor(result.resources.crystal)}
Védelem: ${result.defense?.length || 0} típusú egység észlelt.`;
  }
  if (mission.mission_type === 'attack') {
    return `⚔️ HARCI JELENTÉS — ${result.attackerWins ? 'GYŐZELEM' : 'VERESÉG'}

Zsákmány:
Fém: ${Math.floor(result.loot.metal)}
Kristály: ${Math.floor(result.loot.crystal)}

[DETAILED_REPORT:${mission.id}]`;
  }
  if (mission.mission_type === 'harvest') {
      return `🚛 ÚJRAHASZNOSÍTÁS JELENTÉS

Koordináta: ${mission.target_coords}
Gyűjtött fém: ${Math.floor(result.loot.metal)}
Gyűjtött kristály: ${Math.floor(result.loot.crystal)}`;
  }
  if (mission.mission_type === 'expedition') {
      return `🌌 EXPEDÍCIÓ JELENTÉS

${result.message}

Talált nyersanyagok:
Fém: ${Math.floor(result.loot?.metal || 0)}
Kristály: ${Math.floor(result.loot?.crystal || 0)}
Déusium: ${Math.floor(result.loot?.deus || 0)}`;
  }
  return 'Küldetés befejezve.';
}
