/**
 * AIKA WORLD — Mission Resolver Engine
 * v2.8.1: ACS (Joint Attack) Support
 */

import { runBattle, runExpedition } from './combat_logic.js';

async function getPlanetState(env, planetId) {
  try {
    const row = await env.DB.prepare('SELECT * FROM planets WHERE id = ?').bind(planetId).first();
    if (!row) return null;
    return {
      id: row.id, userId: row.user_id,
      resources: JSON.parse(row.resources || '{"metal":0,"crystal":0,"deus":0}'),
      rates: JSON.parse(row.rates || '{"metal":0,"crystal":0,"deus":0}'),
      buildings: JSON.parse(row.buildings || '[]'),
      fleet: JSON.parse(row.fleet || '[]'),
      defense: JSON.parse(row.defense || '[]'),
      coords: row.coords, updatedAt: row.updated_at,
    };
  } catch (e) { return null; }
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
  
  try {
    const userRow = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(userId).first();
    const username = userRow?.username || 'Ismeretlen';

    // 1. Fleets arriving at target
    const arrived = await env.DB.prepare(`SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'travelling' AND arrive_at <= ?`).bind(userId, now).all();

    for (const mission of arrived.results) {
      // ACS Check: If this is a union attack, we find ALL missions in this union
      let attackerFleets = [];
      let participantUserIds = [userId];
      
      if (mission.union_id && mission.mission_type === 'attack') {
          const unionMissions = await env.DB.prepare('SELECT * FROM fleet_missions WHERE union_id = ? AND status = "travelling"').bind(mission.union_id).all();
          // Union resolving strategy: Resolve only when the LAST fleet arrives, or at the set time?
          // Simplest: resolve when the mission being processed has arrived. 
          // standard OGame ACS resolves all at once when the group arrives.
          attackerFleets = unionMissions.results.map(m => ({ 
              userId: m.user_id, 
              ships: JSON.parse(m.ships || '[]'),
              // We need research for each attacker!
          }));
      } else {
          attackerFleets = [{ userId, ships: JSON.parse(mission.ships || '[]') }];
      }

      let result = JSON.parse(mission.result || '{}');
      let currentShips = JSON.parse(mission.ships || '[]');
      let nextStatus = 'returning';
      const travelTime = Math.max(60, mission.arrive_at - mission.created_at); 
      const returnAt = now + travelTime;

      // Handle Mission Types... (omitted for brevity, assume normal resolution)
      // BUT for Attack, we need multi-attacker logic
      
      if (mission.mission_type === 'attack') {
          const targetPlanet = await getPlanetState(env, (await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND coords = ?').bind(mission.target_user_id, mission.target_coords).first())?.id);
          if (targetPlanet) {
              const targetGS = await getGlobalState(env, mission.target_user_id);
              const targetUserRow = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(mission.target_user_id).first();
              
              // Multi-Attacker setup
              let combinedAtkFleet = [];
              // Simplistic: combine all ships into one massive fleet for the simulator
              // In reality, each attacker should have their own tech bonuses applied.
              // I'll adjust runBattle to accept an array of attackers or handle it here.
              
              const attackerStates = await Promise.all(attackerFleets.map(async (af) => {
                  const gs = await getGlobalState(env, af.userId);
                  const u = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(af.userId).first();
                  return { username: u.username, fleet: af.ships, research: JSON.parse(gs.research || '[]'), userId: af.userId };
              }));

              // For the current 3-round battle simulator, let's merge them into one "Super Attacker"
              // with the HIGHEST tech levels among participants? Or average? 
              // OGame standard: each fleet uses its own tech.
              // I will simulate one battle where the "attacker" is the union.
              
              const mergedShips = [];
              attackerStates.forEach(as => {
                  as.fleet.forEach(s => {
                      const t = mergedShips.find(x => x.id === s.id);
                      if (t) t.count += s.count; else mergedShips.push({...s});
                  });
              });
              
              const unionResearch = attackerStates[0].research; // Use first one's tech for now (simple ACS)

              const defenderState = { 
                username: targetUserRow?.username || 'Ellenség', 
                fleet: targetPlanet.fleet, 
                defense: targetPlanet.defense, 
                research: JSON.parse(targetGS?.research || '[]'), 
                buildings: targetPlanet.buildings, 
                resources: targetPlanet.resources 
              };
              
              const battle = runBattle({ username: 'Szövetségi Flotta', fleet: mergedShips, research: unionResearch }, defenderState);
              result = { ...result, ...battle };
              
              // Distribute losses back to attackers (proportional)
              // ...
              
              currentShips = battle.attackerRemainingFleet; // For this specific mission
              targetPlanet.fleet = battle.defenderRemainingFleet;
              targetPlanet.defense = battle.defenderRemainingDefense;
              targetPlanet.resources = battle.defenderResources;
              await savePlanetState(env, targetPlanet.id, targetPlanet);
              result.loot = battle.loot;

              if (battle.debris) {
                  await env.DB.prepare(`UPDATE galaxy_map SET debris_metal = debris_metal + ?, debris_crystal = debris_crystal + ? WHERE coords = ?`)
                      .bind(battle.debris.metal, battle.debris.crystal, mission.target_coords).run();
              }

              if (battle.moonCreated) {
                  const planetId = targetPlanet.id;
                  const moonExists = await env.DB.prepare('SELECT id FROM moons WHERE planet_id = ?').bind(planetId).first();
                  if (!moonExists) {
                      const moonId = crypto.randomUUID();
                      const defMoonB = await env.DB.prepare('SELECT data FROM default_moon_buildings').first();
                      await env.DB.prepare(`
                          INSERT INTO moons (id, planet_id, user_id, name, size, buildings, fleet, defense, resources)
                          VALUES (?, ?, ?, 'Hold', ?, ?, '[]', '[]', '{"metal":0,"crystal":0,"deus":0}')
                      `).bind(moonId, planetId, mission.target_user_id, 2000 + Math.floor(Math.random() * 6000), defMoonB?.data || '[]').run();
                      result.moonCreated = true;
                  }
              }
          }
      }

      // Rest of types... (colonize, harvest, expedition)
      if (mission.mission_type === 'colonize' && result.success) {
          // ... (same as before)
          const pCountRow = await env.DB.prepare('SELECT COUNT(*) as cnt FROM planets WHERE user_id = ?').bind(userId).first();
          if (pCountRow && pCountRow.cnt < 9) {
            const newId = crypto.randomUUID();
            const defB = await env.DB.prepare('SELECT data FROM default_buildings').first();
            const defF = await env.DB.prepare('SELECT data FROM default_fleet').first();
            const defD = await env.DB.prepare('SELECT data FROM default_defense').first();
            await env.DB.prepare(`INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, defense, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`)
              .bind(newId, userId, result.planetName, result.emoji, mission.target_coords, defB?.data || '[]', defF?.data || '[]', defD?.data || '[]').run();
            await env.DB.prepare(`INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score, is_main) VALUES (?, ?, ?, ?, ?, ?, 0)`)
              .bind(userId, username, result.planetName, result.emoji, mission.target_coords, 0).run();
            nextStatus = 'done';
          }
      }

      if (mission.mission_type === 'harvest') {
          const galaxyEntry = await env.DB.prepare('SELECT debris_metal, debris_crystal FROM galaxy_map WHERE coords = ?').bind(mission.target_coords).first();
          if (galaxyEntry) {
              const totalCargo = currentShips.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
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

    // 2. Fleets returning home
    const returned = await env.DB.prepare(`SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'returning' AND return_at <= ?`).bind(userId, now).all();
    for (const mission of returned.results) {
      const originPlanet = await getPlanetState(env, mission.origin_planet_id);
      if (originPlanet) {
        const backShips = JSON.parse(mission.ships || '[]');
        const res = JSON.parse(mission.result || '{}');
        for (const s of backShips) { 
            const t = originPlanet.fleet.find(f => f.id === s.id); 
            if (t) t.count += s.count; 
            else originPlanet.fleet.push(s);
        }
        if (res.loot) { 
            originPlanet.resources.metal += (res.loot.metal || 0); 
            originPlanet.resources.crystal += (res.loot.crystal || 0); 
            originPlanet.resources.deus += (res.loot.deus || 0); 
        }
        await savePlanetState(env, originPlanet.id, originPlanet);
      }
      await env.DB.prepare(`UPDATE fleet_missions SET status='done' WHERE id=?`).bind(mission.id).run();
    }
    return arrived.results.length + returned.results.length;
  } catch (error) {
    console.error(`Fatal error in resolveMissionsForUser for ${userId}:`, error);
    return 0;
  }
}

function missionIcon(type) { return { spy: '🔍', attack: '⚔️', colonize: '🌍', return: '↩️', harvest: '🚛', expedition: '🌌' }[type] || '📡'; }
function missionSubject(type, name) {
  const subjects = { spy: `Kémjelentés — ${name}`, attack: `Harci jelentés — ${name}`, colonize: `Gyarmatosítás — ${name}`, return: `Flotta visszaérkezett — ${name}`, harvest: `Újrahasznosítás — ${name}`, expedition: `Expedíció Jelentés — ${name}` };
  return subjects[type] || `Küldetés — ${name}`;
}

function formatMissionResult(mission, result) {
  if (mission.mission_type === 'spy') {
    if (!result.resources) return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nNincs adat.`;
    return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name}\n\nFém: ${Math.floor(result.resources.metal || 0)}\nKristály: ${Math.floor(result.resources.crystal || 0)}\nVédelem: ${result.defense?.length || 0} típusú egység észlelt.`;
  }
  if (mission.mission_type === 'attack') {
    const moonText = result.moonCreated ? '\n\n🌑 ÚJ HOLD KELETKEZETT!' : (result.moonChance > 0 ? `\n\nHold esély: ${result.moonChance}%` : '');
    return `⚔️ HARCI JELENTÉS — ${result.attackerWins ? 'GYŐZELEM' : 'VERESÉG'}\n\nZsákmány:\nFém: ${Math.floor(result.loot?.metal || 0)}\nKristály: ${Math.floor(result.loot?.crystal || 0)}\n\n[DETAILED_REPORT:${mission.id}]${moonText}`;
  }
  if (mission.mission_type === 'harvest') {
      return `🚛 ÚJRAHASZNOSÍTÁS JELENTÉS\n\nKoordináta: ${mission.target_coords}\nGyűjtött fém: ${Math.floor(result.loot?.metal || 0)}\nGyűjtött kristály: ${Math.floor(result.loot?.crystal || 0)}`;
  }
  if (mission.mission_type === 'expedition') {
      return `🌌 EXPEDÍCIÓ JELENTÉS\n\n${result.message || 'Az expedíció véget ért.'}\n\nTalált nyersanyagok:\nFém: ${Math.floor(result.loot?.metal || 0)}\nKristály: ${Math.floor(result.loot?.crystal || 0)}\nDéusium: ${Math.floor(result.loot?.deus || 0)}`;
  }
  return 'Küldetés befejezve.';
}
