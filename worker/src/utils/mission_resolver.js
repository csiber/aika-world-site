/**
 * AIKA WORLD — Mission Resolver Engine
 * v2.8.1: ACS (Joint Attack) Support
 */

import { runBattle } from './combat_logic.js';
import { logTimelineEvent } from './timeline.js';
import { createTacticalBattle, autoResolveBattle } from './tactical_engine.js';
import { rollExpeditionEvent } from './expedition_templates.js';

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
      // Skip missions that are being intercepted — they are resolved by the intercept mission
      if (mission.is_intercepted === 1 && mission.mission_type !== 'intercept') {
        continue;
      }

      // ── Intercept mission resolution ──
      if (mission.mission_type === 'intercept') {
        await resolveInterceptMission(env, mission, userId, username, now);
        continue;
      }

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
          const targetPlanetRow = await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND coords = ?').bind(mission.target_user_id, mission.target_coords).first();
          const targetPlanet = targetPlanetRow ? await getPlanetState(env, targetPlanetRow.id) : null;
          if (targetPlanet) {
              const targetGS = await getGlobalState(env, mission.target_user_id);
              const targetUserRow = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(mission.target_user_id).first();

              // Multi-Attacker setup
              const attackerStates = await Promise.all(attackerFleets.map(async (af) => {
                  const gs = await getGlobalState(env, af.userId);
                  const u = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(af.userId).first();
                  return { username: u.username, fleet: af.ships, research: JSON.parse(gs.research || '[]'), userId: af.userId };
              }));

              const mergedShips = [];
              attackerStates.forEach(as => {
                  as.fleet.forEach(s => {
                      const t = mergedShips.find(x => x.id === s.id);
                      if (t) t.count += s.count; else mergedShips.push({...s});
                  });
              });

              // ── Tactical Battle: Create battle and set mission to battle_pending ──
              try {
                  const battleId = await createTacticalBattle(
                      env, mission.id, userId, mission.target_user_id,
                      mergedShips, targetPlanet.fleet, targetPlanet.defense,
                      mission.target_coords
                  );

                  // Set mission to battle_pending — it will be resolved when the tactical battle finishes
                  await env.DB.prepare(`UPDATE fleet_missions SET status = 'battle_pending', result = ?, updated_at = unixepoch() WHERE id = ?`)
                      .bind(JSON.stringify({ ...result, tacticalBattleId: battleId }), mission.id).run();

                  // Timeline notification
                  await logTimelineEvent(env, userId, 'battle_started', 'Taktikai csata indult!', `Célpont: ${mission.target_coords} — Készülj a formáció felállítására!`, '⚔️');
                  await logTimelineEvent(env, mission.target_user_id, 'fleet_attacked', 'Támadás érkezik!', `Támadó: ${username} — Koordináták: ${mission.target_coords} — Készülj a védekezésre!`, '⚔️');

                  continue; // Skip normal returning logic — battle_pending will be handled separately
              } catch (tacticalErr) {
                  console.error('Tactical battle creation failed, falling back to instant battle:', tacticalErr);
                  // Fallback: use the old instant battle system
                  const unionResearch = attackerStates[0].research;
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
                  currentShips = battle.attackerRemainingFleet;
                  targetPlanet.fleet = battle.defenderRemainingFleet;
                  targetPlanet.defense = battle.defenderRemainingDefense;
                  targetPlanet.resources = battle.defenderResources;
                  await savePlanetState(env, targetPlanet.id, targetPlanet);
                  result.loot = battle.loot;

                  if (battle.attackerWins) {
                      await logTimelineEvent(env, userId, 'battle_won', 'Csata megnyerve!', `Célpont: ${mission.target_coords} — Zsákmány: ${Math.floor(battle.loot?.metal || 0)} fém, ${Math.floor(battle.loot?.crystal || 0)} kristály`, '🏆');
                  } else {
                      await logTimelineEvent(env, userId, 'battle_lost', 'Csata elveszítve!', `Célpont: ${mission.target_coords} — A flottád megsemmisült.`, '💀');
                  }
                  await logTimelineEvent(env, mission.target_user_id, 'fleet_attacked', 'Támadás a bolygódon!', `Támadó: ${username} — Koordináták: ${mission.target_coords}`, '⚔️');
                  if (battle.attackerWins) {
                      await logTimelineEvent(env, mission.target_user_id, 'battle_lost', 'Védelmed elesett!', `Támadó: ${username} — Zsákmányolva: ${Math.floor(battle.loot?.metal || 0)} fém`, '💀');
                  } else {
                      await logTimelineEvent(env, mission.target_user_id, 'battle_won', 'Támadás visszaverve!', `Támadó: ${username} — A támadó flottája megsemmisült.`, '🏆');
                  }

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
            // Timeline: colony established
            await logTimelineEvent(env, userId, 'colony_established', 'Új kolónia!', `${result.planetName} — Koordináták: ${mission.target_coords}`, '🌍');
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
          // Expedition 2.0: check for active chain, roll event
          let existingChain = null;
          try {
            const lastChain = await env.DB.prepare(
              'SELECT * FROM expedition_log WHERE user_id = ? AND chain_id IS NOT NULL ORDER BY created_at DESC LIMIT 1'
            ).bind(userId).first();
            if (lastChain) {
              const chainDef = (await import('./expedition_templates.js')).CHAIN_EXPEDITIONS.find(c => {
                return c.steps.some(s => s.type === lastChain.event_type);
              });
              if (chainDef && lastChain.chain_step + 1 < chainDef.totalSteps) {
                existingChain = {
                  chainId: lastChain.chain_id,
                  chainStep: lastChain.chain_step + 1,
                  chainDefId: chainDef.id,
                };
              }
            }
          } catch (e) {
            // expedition_log table may not exist yet, ignore
          }

          const event = rollExpeditionEvent(currentShips, userId, existingChain);

          if (event.hasChoice) {
            // Pause mission — awaiting player choice
            nextStatus = 'awaiting_choice';
            result.expeditionEvent = {
              type: event.type,
              choices: event.choices || [],
              chainId: event.chainId || null,
              chainStep: event.chainStep || 0,
              isChain: event.isChain || false,
              chainDefId: event.chainDefId || null,
            };
          } else {
            // Resolve immediately
            const outcome = event.resolve(currentShips);
            result = { ...result, expeditionOutcome: outcome, loot: outcome.loot || {} };

            // Apply ship losses
            if (outcome.shipLoss && Object.keys(outcome.shipLoss).length > 0) {
              for (const s of currentShips) {
                const key = s.type || s.id;
                if (outcome.shipLoss[key]) {
                  s.count = Math.max(0, s.count - outcome.shipLoss[key]);
                }
              }
              currentShips = currentShips.filter(s => s.count > 0);
            }

            // Apply dark matter reward
            if (outcome.darkMatter > 0) {
              try {
                await env.DB.prepare("ALTER TABLE game_state ADD COLUMN dark_matter INTEGER DEFAULT 0").run();
              } catch { /* already exists */ }
              await env.DB.prepare(
                "UPDATE game_state SET dark_matter = COALESCE(dark_matter, 0) + ? WHERE user_id = ?"
              ).bind(outcome.darkMatter, userId).run();
            }

            // Log to expedition_log
            try {
              await env.DB.prepare(
                `INSERT INTO expedition_log (id, user_id, mission_id, event_type, choice_made, outcome_json, chain_id, chain_step, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
              ).bind(
                crypto.randomUUID(), userId, mission.id, event.type, null,
                JSON.stringify(outcome), event.chainId || null, event.chainStep || 0, now
              ).run();
            } catch (e) {
              console.error('Failed to log expedition event:', e);
            }
          }
      }

      await env.DB.prepare(`UPDATE fleet_missions SET status=?, result=?, ships=?, return_at=? WHERE id=?`).bind(nextStatus, JSON.stringify(result), JSON.stringify(currentShips), returnAt, mission.id).run();
      
      const msgId = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(msgId, userId, missionIcon(mission.mission_type) + ' Küldetés', missionSubject(mission.mission_type, mission.target_name), formatMissionResult(mission, result), 'combat').run();
    }

    // 1b. Check battle_pending missions — resolve if tactical battle is done or timed out
    const pending = await env.DB.prepare(`SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'battle_pending'`).bind(userId, now).all();
    for (const mission of pending.results) {
      const mResult = JSON.parse(mission.result || '{}');
      const battleId = mResult.tacticalBattleId;
      if (!battleId) continue;

      const tacticalBattle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
      if (!tacticalBattle) continue;

      // Auto-resolve if timer expired and still in pending_formation
      if (tacticalBattle.status === 'pending_formation' && now >= tacticalBattle.auto_resolve_at) {
        try { await autoResolveBattle(env, battleId); } catch (e) { console.error('Auto-resolve failed:', e); continue; }
      }

      // Check if resolved
      const updatedBattle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
      if (updatedBattle.status !== 'resolved') continue;

      // Battle resolved — apply results like the old system
      const battle = JSON.parse(updatedBattle.result);
      const travelTime = Math.max(60, mission.arrive_at - mission.created_at);
      const returnAt = now + travelTime;

      // Apply loot caps against defender resources
      const targetPlanetRow = await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND coords = ?').bind(mission.target_user_id, mission.target_coords).first();
      const targetPlanet = targetPlanetRow ? await getPlanetState(env, targetPlanetRow.id) : null;

      if (targetPlanet && battle.attackerWins) {
        const cargo = battle.attackerRemainingFleet.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
        battle.loot.metal   = Math.min(cargo / 2.5, targetPlanet.resources.metal * 0.5);
        battle.loot.crystal = Math.min(cargo / 2.5, targetPlanet.resources.crystal * 0.5);
        battle.loot.deus    = Math.min(cargo / 10,  (targetPlanet.resources.deus || 0) * 0.3);
        targetPlanet.resources.metal   -= battle.loot.metal;
        targetPlanet.resources.crystal -= battle.loot.crystal;
        targetPlanet.resources.deus    -= battle.loot.deus;
      }

      if (targetPlanet) {
        targetPlanet.fleet   = battle.defenderRemainingFleet;
        targetPlanet.defense = battle.defenderRemainingDefense;
        await savePlanetState(env, targetPlanet.id, targetPlanet);
      }

      const currentShips = battle.attackerRemainingFleet;
      const fullResult = { ...mResult, ...battle };

      // Timeline events
      if (battle.attackerWins) {
        await logTimelineEvent(env, userId, 'battle_won', 'Taktikai csata megnyerve!', `Célpont: ${mission.target_coords} — Zsákmány: ${Math.floor(battle.loot?.metal || 0)} fém, ${Math.floor(battle.loot?.crystal || 0)} kristály`, '🏆');
      } else {
        await logTimelineEvent(env, userId, 'battle_lost', 'Taktikai csata elveszítve!', `Célpont: ${mission.target_coords}`, '💀');
      }
      await logTimelineEvent(env, mission.target_user_id, battle.attackerWins ? 'battle_lost' : 'battle_won', battle.attackerWins ? 'Védelmed elesett!' : 'Támadás visszaverve!', `Támadó: ${username} — Koordináták: ${mission.target_coords}`, battle.attackerWins ? '💀' : '🏆');

      // Debris
      if (battle.debris) {
        await env.DB.prepare(`UPDATE galaxy_map SET debris_metal = debris_metal + ?, debris_crystal = debris_crystal + ? WHERE coords = ?`)
          .bind(battle.debris.metal, battle.debris.crystal, mission.target_coords).run();
      }

      // Moon creation
      if (battle.moonCreated && targetPlanet) {
        const moonExists = await env.DB.prepare('SELECT id FROM moons WHERE planet_id = ?').bind(targetPlanet.id).first();
        if (!moonExists) {
          const moonId = crypto.randomUUID();
          const defMoonB = await env.DB.prepare('SELECT data FROM default_moon_buildings').first();
          await env.DB.prepare(`
            INSERT INTO moons (id, planet_id, user_id, name, size, buildings, fleet, defense, resources)
            VALUES (?, ?, ?, 'Hold', ?, ?, '[]', '[]', '{"metal":0,"crystal":0,"deus":0}')
          `).bind(moonId, targetPlanet.id, mission.target_user_id, 2000 + Math.floor(Math.random() * 6000), defMoonB?.data || '[]').run();
          fullResult.moonCreated = true;
        }
      }

      await env.DB.prepare(`UPDATE fleet_missions SET status='returning', result=?, ships=?, return_at=? WHERE id=?`)
        .bind(JSON.stringify(fullResult), JSON.stringify(currentShips), returnAt, mission.id).run();

      const msgId = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(msgId, userId, missionIcon('attack') + ' Küldetés', missionSubject('attack', mission.target_name), formatMissionResult(mission, fullResult), 'combat').run();
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
      // Timeline: fleet returned home
      await logTimelineEvent(env, userId, 'fleet_arrived', 'Flottád visszatért!', `Koordináták: ${originPlanet?.coords || 'ismeretlen'} — Típus: ${mission.mission_type}`, '🚀');
      await env.DB.prepare(`UPDATE fleet_missions SET status='done' WHERE id=?`).bind(mission.id).run();
    }
    return arrived.results.length + returned.results.length;
  } catch (error) {
    console.error(`Fatal error in resolveMissionsForUser for ${userId}:`, error);
    return 0;
  }
}

// ── Intercept Resolution ──────────────────────────────────────────────────────

async function resolveInterceptMission(env, mission, userId, username, now) {
  const travelTime = Math.max(60, mission.arrive_at - mission.created_at);
  const returnAt = now + travelTime;
  let interceptorShips = JSON.parse(mission.ships || '[]');
  let result = {};

  const targetMission = await env.DB.prepare(
    'SELECT * FROM fleet_missions WHERE intercepted_by = ? AND is_intercepted = 1'
  ).bind(mission.id).first();

  if (!targetMission) {
    result = { interceptFailed: true, message: 'A célflotta eltűnt mielőtt az elfogás megtörtént volna.' };
    await env.DB.prepare(`UPDATE fleet_missions SET status='returning', result=?, return_at=? WHERE id=?`)
      .bind(JSON.stringify(result), returnAt, mission.id).run();
    const msgId = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(msgId, userId, '🎯 Elfogás', 'Elfogás sikertelen', 'A célflotta eltűnt mielőtt az elfogás megtörtént volna.', 'combat').run();
    return;
  }

  const interceptorGS = await getGlobalState(env, userId);
  const interceptorResearch = JSON.parse(interceptorGS?.research || '[]');
  const targetUserId = targetMission.user_id;
  const targetGS = await getGlobalState(env, targetUserId);
  const targetResearch = JSON.parse(targetGS?.research || '[]');
  const targetUserRow = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(targetUserId).first();
  const targetUsername = targetUserRow?.username || 'Ismeretlen';
  const targetShips = JSON.parse(targetMission.ships || '[]');

  const battle = runBattle(
    { username, fleet: interceptorShips, research: interceptorResearch },
    { username: targetUsername, fleet: targetShips, defense: [], research: targetResearch, buildings: [], resources: { metal: 0, crystal: 0, deus: 0 } }
  );
  result = { ...battle, interceptCoords: mission.intercept_coords };

  if (battle.attackerWins) {
    interceptorShips = battle.attackerRemainingFleet;
    result.loot = battle.loot;
    await env.DB.prepare(`UPDATE fleet_missions SET status='done', result=?, ships='[]' WHERE id=?`)
      .bind(JSON.stringify({ destroyed: true, interceptedBy: username, interceptCoords: mission.intercept_coords }), targetMission.id).run();
    const targetMsgId = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(targetMsgId, targetUserId, '🎯 Elfogás', `Flottád elfogva: ${targetMission.target_name}`,
        `A flottádat elfogták és megsemmisítették útközben!\n\nElfogó: ${username}\nHelyszín: ${mission.intercept_coords}\nCél volt: ${targetMission.target_coords}`, 'combat').run();
    await logTimelineEvent(env, userId, 'intercept_won', 'Elfogás sikeres!', `Célpont: ${targetUsername} — Helyszín: ${mission.intercept_coords}`, '🎯');
    await logTimelineEvent(env, targetUserId, 'fleet_intercepted', 'Flottád elfogva!', `Elfogó: ${username} — Helyszín: ${mission.intercept_coords}`, '🎯');
    await env.DB.prepare(`UPDATE fleet_missions SET status='returning', result=?, ships=?, return_at=? WHERE id=?`)
      .bind(JSON.stringify(result), JSON.stringify(interceptorShips), returnAt, mission.id).run();
  } else {
    await env.DB.prepare(`UPDATE fleet_missions SET is_intercepted = 0, intercepted_by = NULL, intercept_coords = NULL WHERE id=?`)
      .bind(targetMission.id).run();
    await env.DB.prepare(`UPDATE fleet_missions SET ships = ? WHERE id = ?`)
      .bind(JSON.stringify(battle.defenderRemainingFleet), targetMission.id).run();
    await env.DB.prepare(`UPDATE fleet_missions SET status='done', result=?, ships='[]' WHERE id=?`)
      .bind(JSON.stringify(result), mission.id).run();
    await logTimelineEvent(env, userId, 'intercept_lost', 'Elfogás sikertelen!', `Célpont: ${targetUsername} — A flottád megsemmisült.`, '💀');
    await logTimelineEvent(env, targetUserId, 'intercept_survived', 'Elfogási kísérlet visszaverve!', `Támadó: ${username} — Helyszín: ${mission.intercept_coords}`, '🏆');
    const targetMsgId = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(targetMsgId, targetUserId, '🎯 Elfogás', 'Elfogási kísérlet visszaverve',
        `Egy ellenséges flotta megpróbálta elfogni a flottádat, de sikeresen visszaverték!\n\nTámadó: ${username}\nHelyszín: ${mission.intercept_coords}`, 'combat').run();
  }

  if (battle.debris && (battle.debris.metal > 0 || battle.debris.crystal > 0)) {
    const interceptCoords = mission.intercept_coords || mission.target_coords;
    await env.DB.prepare(`UPDATE galaxy_map SET debris_metal = debris_metal + ?, debris_crystal = debris_crystal + ? WHERE coords = ?`)
      .bind(battle.debris.metal, battle.debris.crystal, interceptCoords).run();
  }

  const interceptorResult = battle.attackerWins ? 'GYŐZELEM' : 'VERESÉG';
  const msgId = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(msgId, userId, '🎯 Elfogás', `Elfogás — ${interceptorResult}`,
      `🎯 ELFOGÁS JELENTÉS — ${interceptorResult}\n\nCélpont: ${targetUsername}\nHelyszín: ${mission.intercept_coords}\n\nZsákmány:\nFém: ${Math.floor(result.loot?.metal || 0)}\nKristály: ${Math.floor(result.loot?.crystal || 0)}`, 'combat').run();
}

function missionIcon(type) { return { spy: '🔍', attack: '⚔️', colonize: '🌍', return: '↩️', harvest: '🚛', expedition: '🌌', intercept: '🎯' }[type] || '📡'; }
function missionSubject(type, name) {
  const subjects = { spy: `Kémjelentés — ${name}`, attack: `Harci jelentés — ${name}`, colonize: `Gyarmatosítás — ${name}`, return: `Flotta visszaérkezett — ${name}`, harvest: `Újrahasznosítás — ${name}`, expedition: `Expedíció Jelentés — ${name}`, intercept: `Elfogás jelentés — ${name}` };
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
  if (mission.mission_type === 'intercept') {
    const outcome = result.attackerWins ? 'GYŐZELEM' : 'VERESÉG';
    return `🎯 ELFOGÁS JELENTÉS — ${outcome}\n\nHelyszín: ${result.interceptCoords || 'Ismeretlen'}\n\nZsákmány:\nFém: ${Math.floor(result.loot?.metal || 0)}\nKristály: ${Math.floor(result.loot?.crystal || 0)}`;
  }
  if (mission.mission_type === 'harvest') {
      return `🚛 ÚJRAHASZNOSÍTÁS JELENTÉS\n\nKoordináta: ${mission.target_coords}\nGyűjtött fém: ${Math.floor(result.loot?.metal || 0)}\nGyűjtött kristály: ${Math.floor(result.loot?.crystal || 0)}`;
  }
  if (mission.mission_type === 'expedition') {
      return `🌌 EXPEDÍCIÓ JELENTÉS\n\n${result.message || 'Az expedíció véget ért.'}\n\nTalált nyersanyagok:\nFém: ${Math.floor(result.loot?.metal || 0)}\nKristály: ${Math.floor(result.loot?.crystal || 0)}\nDéusium: ${Math.floor(result.loot?.deus || 0)}`;
  }
  return 'Küldetés befejezve.';
}
