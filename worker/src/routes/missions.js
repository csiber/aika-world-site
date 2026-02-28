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

function calcTravelTime(fromCoords, targetCoords, state, baseSeconds = 300) {
  const driveLevel = state.research?.find(r => r.id === 'drive')?.level || 0;
  const driveBonus = 1 + driveLevel * 0.15;
  
  // Calculate distance based on coordinate segments [G:S:P]
  const parse = (c) => c.match(/\d+/g).map(Number);
  const [g1, s1, p1] = parse(fromCoords || '[1:1:1]');
  const [g2, s2, p2] = parse(targetCoords);
  
  let dist = 0;
  if (g1 !== g2) dist = Math.abs(g1 - g2) * 2000;
  else if (s1 !== s2) dist = Math.abs(s1 - s2) * 200;
  else dist = Math.abs(p1 - p2) * 20;

  const time = Math.floor((baseSeconds + dist / 10) / driveBonus);
  return Math.max(60, time);
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
          // Register colony on the galaxy map
          await env.DB.prepare(
            `INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score, is_main)
             VALUES (?, ?, ?, ?, ?, ?, 0)`
          ).bind(userId, user.username, result.planetName, result.emoji, mission.target_coords, state.score).run();
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
        // Bot retaliation — bot sends a message back to the attacker
        if (mission.target_user_id) {
          const botTarget = await env.DB.prepare(
            'SELECT is_bot, username FROM users WHERE id = ?'
          ).bind(mission.target_user_id).first();
          if (botTarget?.is_bot) {
            await env.DB.prepare(
              'INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(
              crypto.randomUUID(), userId,
              `⚔️ ${botTarget.username}`,
              `${botTarget.username} üzenete`,
              botRetaliationMessage(botTarget.username, result.attackerWins),
              'combat'
            ).run();
          }
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

    const fromCoords = state.planets[0]?.coords || '[1:1:1]';
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(fromCoords, targetCoords, state, 60);
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

    // Research-aware combat calculation
    function calcPower(fleet, research, side) {
      const combatLevel = research?.find(r => r.id === 'combat')?.level || 0;
      const laserLevel  = research?.find(r => r.id === 'laser')?.level  || 0;
      const plasmaLevel = research?.find(r => r.id === 'plasma')?.level || 0;
      const shieldLevel = research?.find(r => r.id === 'shield')?.level || 0;
      const attackBonus = 1 + combatLevel * 0.10 + laserLevel * 0.05 + plasmaLevel * 0.12;
      const shieldBonus = 1 + shieldLevel * 0.10;
      const attack = fleet.reduce((s, f) => s + (f.attack * f.count * attackBonus), 0);
      const shield = fleet.reduce((s, f) => s + (f.shield * f.count * shieldBonus), 0);
      const cargo  = fleet.reduce((s, f) => s + (f.cargo  * f.count), 0);
      return { attack: Math.floor(attack), shield: Math.floor(shield), cargo };
    }

    const atkPow = calcPower(state.fleet, state.research, 'attacker');
    const defFleetPow = calcPower(targetState.fleet, targetState.research, 'defender');
    const defBuildingBonus = (targetState.buildings?.find(b => b.id === 'defense')?.level || 0) * 500;
    const attackPower = atkPow.attack;
    const defPower    = defFleetPow.shield + defBuildingBonus;

    const rand = 0.85 + Math.random() * 0.3; // 0.85-1.15 randomness
    const attackerWins = attackPower * rand > defPower;

    // Fleet losses — both sides take losses proportional to opponent's strength
    const attackerLossPct = attackerWins
      ? Math.min(0.40, 0.05 + (defPower / Math.max(1, attackPower)) * 0.30)
      : Math.min(0.85, 0.30 + (defPower / Math.max(1, attackPower)) * 0.50);
    const defenderLossPct = attackerWins
      ? Math.min(0.85, 0.35 + (attackPower / Math.max(1, defPower)) * 0.40)
      : Math.min(0.25, 0.03 + (attackPower / Math.max(1, defPower)) * 0.20);

    const attackerLosses = applyFleetLosses(state.fleet, attackerLossPct);
    const defenderLosses = applyFleetLosses(targetState.fleet, defenderLossPct);

    // Persist fleet losses immediately (targeted update — no updated_at reset)
    await env.DB.prepare('UPDATE game_state SET fleet=? WHERE user_id=?')
      .bind(JSON.stringify(state.fleet), userId).run();
    await env.DB.prepare('UPDATE game_state SET fleet=? WHERE user_id=?')
      .bind(JSON.stringify(targetState.fleet), targetUserId).run();

    let loot = { metal: 0, crystal: 0 };
    let scoreGain = 0;

    if (attackerWins) {
      // Loot limited by attacker's cargo capacity
      const maxLoot = atkPow.cargo;
      const rawMetal   = Math.floor(targetState.resources.metal   * 0.5);
      const rawCrystal = Math.floor(targetState.resources.crystal * 0.5);
      const totalRaw   = rawMetal + rawCrystal;
      const cargoRatio = totalRaw > 0 ? Math.min(1, maxLoot / totalRaw) : 0;
      loot.metal   = Math.floor(rawMetal   * cargoRatio);
      loot.crystal = Math.floor(rawCrystal * cargoRatio);
      scoreGain = 50;

      // Deduct from target
      targetState.resources.metal   -= loot.metal;
      targetState.resources.crystal -= loot.crystal;
      await saveState(env, targetUserId, targetState);
    }

    // Defender message (includes fleet losses)
    const defLossText = defenderLosses.length
      ? `\n\nElveszített flotta:\n${defenderLosses.map(l => `${l.icon} ${l.name}: -${l.lost}`).join('\n')}`
      : '';
    const defenderMsgBody = attackerWins
      ? `⚔️ HARCI JELENTÉS\n\nTámadó: ${user.username}\nCél: ${targetName}\n\nEredmény: VERESÉG\n\nElveszített nyersanyag:\n⚙️ Fém: ${loot.metal.toLocaleString('hu')}\n💎 Kristály: ${loot.crystal.toLocaleString('hu')}${defLossText}\n\nErősítsd meg védelmedet!`
      : `⚔️ HARCI JELENTÉS\n\nTámadó: ${user.username} megtámadta bolygódat!\n\nEredmény: VÉDELMED TARTOTT! ✅${defLossText}`;

    await env.DB.prepare(
      'INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      crypto.randomUUID(), targetUserId,
      `⚔️ ${user.username}`,
      `Támadás: ${user.username} megtámadta bolygódat!`,
      defenderMsgBody, 'combat'
    ).run();

    const result = {
      attackerWins, loot,
      attackPower: Math.floor(attackPower), defPower: Math.floor(defPower),
      scoreGain, cargoUsed: loot.metal + loot.crystal, cargoTotal: atkPow.cargo,
      attackerLosses, defenderLosses,
    };
    const fromCoords = state.planets[0]?.coords || '[1:1:1]';
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(fromCoords, targetCoords, state, 180);

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
    const fromCoords = state.planets[0]?.coords || '[1:1:1]';
    const arriveAt = Math.floor(Date.now() / 1000) + calcTravelTime(fromCoords, targetCoords, state, 600);

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
    let report = `⚔️ HARCI JELENTÉS\n\nCél: ${mission.target_name} ${mission.target_coords}\n\nTámadóerő: ${r.attackPower?.toLocaleString('hu')}\nVédelmi erő: ${r.defPower?.toLocaleString('hu')}\n\nEredmény: ${r.attackerWins ? '✅ GYŐZELEM' : '❌ VERESÉG'}\n\n`;
    report += r.attackerWins
      ? `Zsákmány:\n⚙️ Fém: ${r.loot?.metal?.toLocaleString('hu')}\n💎 Kristály: ${r.loot?.crystal?.toLocaleString('hu')}\n`
      : `Flottád visszavonult.\n`;
    if (r.attackerLosses?.length) {
      report += `\nSaját veszteségek:\n${r.attackerLosses.map(l => `${l.icon} ${l.name}: -${l.lost}`).join('\n')}\n`;
    }
    return report;
  }

  if (mission.mission_type === 'colonize') {
    return result.success
      ? `🌍 GYARMATOSÍTÁS SIKERES\n\nÚj bolygó: ${result.planetName}\nKoordináták: ${mission.target_coords}\nEmoji: ${result.emoji}\n\nBolygód hozzáadva a birodalmadhoz!`
      : `🌍 GYARMATOSÍTÁS SIKERTELEN\n\nCél: ${mission.target_coords}\n\nA koordinátát időközben elfoglalták.`;
  }

  return 'Küldetés befejezve.';
}

// ── Fleet loss helper ──────────────────────────────────────
function applyFleetLosses(fleet, lossPct) {
  const losses = [];
  for (const ship of fleet) {
    if (ship.count > 0 && lossPct > 0) {
      const rand = 0.75 + Math.random() * 0.5; // ±25% randomness per ship type
      const lost = Math.floor(ship.count * Math.min(0.95, lossPct * rand));
      if (lost > 0) {
        ship.count -= lost;
        losses.push({ icon: ship.icon, name: ship.name, lost });
      }
    }
  }
  return losses;
}

// ── Bot retaliation messages ───────────────────────────────
const BOT_WIN_MSGS = [
  'Élvezd a zsákmányt, amíg lehet. Erőim már úton vannak feléd.',
  'Ez csupán egy csata volt. A háború még nem ért véget.',
  'Ügyes manőver. De a birodalmamat nem veszed el ilyen könnyen.',
  'Rajtaütöttél, de a bosszú hideget tálal. Számíts rá.',
];
const BOT_LOSE_MSGS = [
  'Ha azt hitted, hogy megijesztesz — tévedtél. Jöjj vissza, ha mered.',
  'Gyenge kísérlet. Védelmi rendszerem könnyedén elbánt veled.',
  'Legközelebb hozz több hajót. Ez nem volt elég.',
  'Flottád nyomát sem fogják megtalálni. Következő alkalomra felejtsd el ezt a szektort.',
];
function botRetaliationMessage(botName, attackerWon) {
  const pool = attackerWon ? BOT_WIN_MSGS : BOT_LOSE_MSGS;
  const msg  = pool[Math.floor(Math.random() * pool.length)];
  return `📡 TITKOSÍTOTT ÜZENET — Feladó: ${botName}\n\n"${msg}"`;
}
