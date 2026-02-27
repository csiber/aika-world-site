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
    UPDATE game_state SET resources=?, rates=?, buildings=?, research=?, fleet=?, planets=?, score=?, updated_at=unixepoch()
    WHERE user_id=?
  `).bind(
    JSON.stringify(state.resources), JSON.stringify(state.rates),
    JSON.stringify(state.buildings), JSON.stringify(state.research),
    JSON.stringify(state.fleet), JSON.stringify(state.planets),
    state.score, userId
  ).run();
}

function travelTime(base = 300) {
  // 5-15 minutes travel time
  return base + Math.floor(Math.random() * 600);
}

export async function handleMissions(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // ── GET /api/galaxy ─────────────────────────────────────
  if (path === '/api/galaxy' && method === 'GET') {
    // Get all players' main planets for the galaxy map
    const rows = await env.DB.prepare(`
      SELECT g.user_id, g.username, g.planet_name, g.planet_emoji, g.coords, g.score
      FROM galaxy_map g
      ORDER BY g.score DESC
      LIMIT 200
    `).all();

    // Also get current user's own planets
    const myState = await getState(env, userId);
    const myPlanets = myState?.planets || [];

    return jsonResponse({ ok: true, players: rows.results, myPlanets }, 200, request);
  }

  // ── GET /api/missions ────────────────────────────────────
  if (path === '/api/missions' && method === 'GET') {
    const now = Math.floor(Date.now() / 1000);
    const rows = await env.DB.prepare(
      'SELECT * FROM fleet_missions WHERE user_id = ? AND status != ? ORDER BY arrive_at ASC'
    ).bind(userId, 'done').all();
    return jsonResponse({ ok: true, missions: rows.results }, 200, request);
  }

  // ── POST /api/missions/resolve ───────────────────────────
  if (path === '/api/missions/resolve' && method === 'POST') {
    const now = Math.floor(Date.now() / 1000);
    const arrived = await env.DB.prepare(
      `SELECT * FROM fleet_missions WHERE user_id = ? AND status = 'travelling' AND arrive_at <= ?`
    ).bind(userId, now).all();

    const results = [];
    for (const mission of arrived.results) {
      let result = JSON.parse(mission.result || '{}');
      let newStatus = 'done';

      if (mission.mission_type === 'colonize' && result.success) {
        // Add new planet to state
        const state = await getState(env, userId);
        if (state && state.planets.length < 9) {
          state.planets.push({
            name: result.planetName,
            emoji: result.emoji,
            coords: mission.target_coords,
          });
          state.score += 200;
          await saveState(env, userId, state);
          await env.DB.prepare('UPDATE rankings SET score=?, updated_at=unixepoch() WHERE user_id=?')
            .bind(state.score, userId).run();
          // Remove colony ship
          state.fleet.find(f => f.id === 'colony') && state.fleet.find(f => f.id === 'colony').count--;
        }
      }

      if (mission.mission_type === 'attack' && result.loot) {
        // Give loot to attacker
        const state = await getState(env, userId);
        if (state) {
          state.resources.metal   += result.loot.metal || 0;
          state.resources.crystal += result.loot.crystal || 0;
          state.score += result.scoreGain || 0;
          await saveState(env, userId, state);
        }
      }

      await env.DB.prepare(
        `UPDATE fleet_missions SET status='done' WHERE id=?`
      ).bind(mission.id).run();

      // Send result as in-game message
      const msgBody = formatMissionResult(mission, result);
      await env.DB.prepare(
        'INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        crypto.randomUUID(), userId,
        missionIcon(mission.mission_type) + ' Küldetés',
        missionSubject(mission.mission_type, mission.target_name),
        msgBody, 'combat'
      ).run();

      results.push({ id: mission.id, type: mission.mission_type, result });
    }

    return jsonResponse({ ok: true, resolved: results.length, results }, 200, request);
  }

  // ── POST /api/missions/spy ───────────────────────────────
  if (path === '/api/missions/spy' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, targetCoords, targetName } = body;
    if (!targetCoords) return jsonError(400, 'targetCoords szükséges', request);

    // Check spy tech level
    const state = await getState(env, userId);
    if (!state) return jsonError(404, 'Játékállapot nem található', request);

    const spyTech = state.research.find(r => r.id === 'spy');
    const spyLevel = spyTech?.level || 0;

    // Gather intel on target
    let result = { success: true, spyLevel, coords: targetCoords, name: targetName };

    if (targetUserId) {
      const targetState = await getState(env, targetUserId);
      if (targetState) {
        // Higher spy level = more info
        result.resources = {
          metal:   Math.floor(targetState.resources.metal),
          crystal: Math.floor(targetState.resources.crystal),
        };
        if (spyLevel >= 3) result.resources.energy = Math.floor(targetState.resources.energy);
        if (spyLevel >= 5) result.resources.deus = Math.floor(targetState.resources.deus);
        if (spyLevel >= 7) result.fleet = targetState.fleet.filter(f => f.count > 0).map(f => ({ name: f.name, icon: f.icon, count: f.count }));
        if (spyLevel >= 10) result.buildings = targetState.buildings.map(b => ({ name: b.name, icon: b.icon, level: b.level }));
      }
    } else {
      result.resources = null; // empty system
    }

    const arriveAt = Math.floor(Date.now() / 1000) + travelTime(60);
    await env.DB.prepare(
      `INSERT INTO fleet_missions (id, user_id, target_user_id, mission_type, target_coords, target_name, status, result, arrive_at)
       VALUES (?, ?, ?, 'spy', ?, ?, 'travelling', ?, ?)`
    ).bind(
      crypto.randomUUID(), userId, targetUserId || null,
      targetCoords, targetName || 'Ismeretlen',
      JSON.stringify(result), arriveAt
    ).run();

    return jsonResponse({ ok: true, arriveAt, message: 'Kém úton van!' }, 200, request);
  }

  // ── POST /api/missions/attack ────────────────────────────
  if (path === '/api/missions/attack' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, targetCoords, targetName, ships } = body;
    if (!targetUserId || !targetCoords) return jsonError(400, 'Hiányzó paraméterek', request);

    const state = await getState(env, userId);
    if (!state) return jsonError(404, 'Játékállapot nem található', request);

    // Verify attacker has ships
    const totalShips = (state.fleet || []).reduce((s, f) => s + f.count, 0);
    if (totalShips === 0) return jsonError(400, 'Nincs flottád a támadáshoz!', request);

    // Calculate battle outcome
    const targetState = await getState(env, targetUserId);
    if (!targetState) return jsonError(404, 'Célpont nem található', request);

    const attackPower = state.fleet.reduce((s, f) => s + (f.attack * f.count), 0);
    const defPower    = targetState.fleet.reduce((s, f) => s + (f.shield * f.count), 0) +
                        (targetState.buildings.find(b => b.id === 'defense')?.level || 0) * 500;

    const attackerWins = attackPower > defPower * 0.7; // some randomness baked in
    let loot = { metal: 0, crystal: 0 };
    let scoreGain = 0;

    if (attackerWins) {
      loot.metal   = Math.floor(Math.min(targetState.resources.metal   * 0.5, 50000));
      loot.crystal = Math.floor(Math.min(targetState.resources.crystal * 0.5, 30000));
      scoreGain = 50;

      // Deduct from target
      targetState.resources.metal   -= loot.metal;
      targetState.resources.crystal -= loot.crystal;
      await saveState(env, targetUserId, targetState);

      // Send defeat message to target
      await env.DB.prepare(
        'INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        crypto.randomUUID(), targetUserId,
        `⚔️ ${user.username}`,
        `Támadás: ${user.username} megtámadta bolygódat!`,
        `⚔️ HARCI JELENTÉS\n\nTámadó: ${user.username}\nCél: ${targetName}\n\nEredmény: VERESÉG\n\nElveszített nyersanyag:\n⚙️ Fém: ${loot.metal.toLocaleString('hu')}\n💎 Kristály: ${loot.crystal.toLocaleString('hu')}\n\nErősítsd meg védelmedet!`,
        'combat'
      ).run();
    }

    const result = { attackerWins, loot, attackPower: Math.floor(attackPower), defPower: Math.floor(defPower), scoreGain };
    const arriveAt = Math.floor(Date.now() / 1000) + travelTime(180);

    await env.DB.prepare(
      `INSERT INTO fleet_missions (id, user_id, target_user_id, mission_type, target_coords, target_name, status, result, arrive_at)
       VALUES (?, ?, ?, 'attack', ?, ?, 'travelling', ?, ?)`
    ).bind(
      crypto.randomUUID(), userId, targetUserId,
      targetCoords, targetName || 'Ismeretlen',
      JSON.stringify(result), arriveAt
    ).run();

    return jsonResponse({ ok: true, arriveAt }, 200, request);
  }

  // ── POST /api/missions/colonize ──────────────────────────
  if (path === '/api/missions/colonize' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetCoords, targetName } = body;
    if (!targetCoords) return jsonError(400, 'targetCoords szükséges', request);

    const state = await getState(env, userId);
    if (!state) return jsonError(404, 'Játékállapot nem található', request);

    // Check colony ship
    const colonyShip = state.fleet.find(f => f.id === 'colony');
    if (!colonyShip || colonyShip.count < 1) {
      return jsonError(400, 'Nincs gyarmatosító hajód!', request);
    }

    // Check planet limit (astro research)
    const astro = state.research.find(r => r.id === 'astro');
    const maxPlanets = 1 + (astro?.level || 0);
    if (state.planets.length >= maxPlanets) {
      return jsonError(400, `Maximum ${maxPlanets} bolygód lehet. Kutatd az Asztrofizikát!`, request);
    }

    // Check coords not already occupied
    const existing = await env.DB.prepare(
      'SELECT user_id FROM galaxy_map WHERE coords = ?'
    ).bind(targetCoords).first();
    if (existing) return jsonError(409, 'Ezt a koordinátát már elfoglalták!', request);

    // Deduct colony ship
    colonyShip.count--;
    await saveState(env, userId, state);

    const planetEmojis = ['🌍','🌎','🌏','🪐','🌕','🔵','🟣'];
    const emoji = planetEmojis[Math.floor(Math.random() * planetEmojis.length)];
    const planetName = `${user.username}'s Colony ${state.planets.length + 1}`;

    const result = { success: true, planetName, emoji, coords: targetCoords };
    const arriveAt = Math.floor(Date.now() / 1000) + travelTime(600);

    await env.DB.prepare(
      `INSERT INTO fleet_missions (id, user_id, target_user_id, mission_type, target_coords, target_name, status, result, arrive_at)
       VALUES (?, ?, null, 'colonize', ?, ?, 'travelling', ?, ?)`
    ).bind(
      crypto.randomUUID(), userId,
      targetCoords, targetName || targetCoords,
      JSON.stringify(result), arriveAt
    ).run();

    return jsonResponse({ ok: true, arriveAt, planetName, emoji }, 200, request);
  }

  return jsonError(404, 'Mission endpoint not found', request);
}

// ── Helpers ───────────────────────────────────────────────
function missionIcon(type) {
  return { spy: '🔍', attack: '⚔️', colonize: '🌍' }[type] || '📡';
}

function missionSubject(type, name) {
  const subjects = {
    spy:      `Kémjelentés — ${name}`,
    attack:   `Harci jelentés — ${name}`,
    colonize: `Gyarmatosítás — ${name}`,
  };
  return subjects[type] || `Küldetés — ${name}`;
}

function formatMissionResult(mission, result) {
  if (mission.mission_type === 'spy') {
    if (!result.resources) return `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name} ${mission.target_coords}\n\nÜres rendszer, nincs mit kémkedni.`;
    let report = `🔍 KÉM JELENTÉS\n\nCél: ${mission.target_name} ${mission.target_coords}\n\nNyersanyagok:\n`;
    if (result.resources.metal   !== undefined) report += `⚙️ Fém: ${result.resources.metal.toLocaleString('hu')}\n`;
    if (result.resources.crystal !== undefined) report += `💎 Kristály: ${result.resources.crystal.toLocaleString('hu')}\n`;
    if (result.resources.energy  !== undefined) report += `⚡ Energia: ${result.resources.energy.toLocaleString('hu')}\n`;
    if (result.resources.deus    !== undefined) report += `🔮 Déusium: ${result.resources.deus.toLocaleString('hu')}\n`;
    if (result.fleet) {
      report += `\nFlotta:\n`;
      result.fleet.forEach(f => report += `${f.icon} ${f.name}: ${f.count}\n`);
    }
    return report;
  }

  if (mission.mission_type === 'attack') {
    const r = result;
    return `⚔️ HARCI JELENTÉS\n\nCél: ${mission.target_name} ${mission.target_coords}\n\nTámadóerő: ${r.attackPower?.toLocaleString('hu')}\nVédelmi erő: ${r.defPower?.toLocaleString('hu')}\n\nEredmény: ${r.attackerWins ? '✅ GYŐZELEM' : '❌ VERESÉG'}\n\n${r.attackerWins ? `Zsákmány:\n⚙️ Fém: ${r.loot?.metal?.toLocaleString('hu')}\n💎 Kristály: ${r.loot?.crystal?.toLocaleString('hu')}` : 'Flottád visszavonult.'}`;
  }

  if (mission.mission_type === 'colonize') {
    return result.success
      ? `🌍 GYARMATOSÍTÁS SIKERES\n\nÚj bolygó: ${result.planetName}\nKoordináták: ${mission.target_coords}\nEmoji: ${result.emoji}\n\nBolygód hozzáadva a birodalmadhoz!`
      : `🌍 GYARMATOSÍTÁS SIKERTELEN\n\nCél: ${mission.target_coords}\n\nA koordinátát időközben elfoglalták.`;
  }

  return 'Küldetés befejezve.';
}
