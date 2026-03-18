/**
 * Fleet Intel routes — Phalanx scanning, fleet movement tracking, fleet intercept
 * Feature 3: Fleet Intercept & Live Galaxy Map
 */

import { jsonResponse, jsonError } from '../utils/response.js';

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

function parseCoords(c) {
  const m = c.match(/\[?(\d+):(\d+):(\d+)\]?/);
  if (!m) return [1, 1, 1];
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

function formatCoords(g, s, p) {
  return `[${g}:${s}:${p}]`;
}

function calcTravelTime(fromCoords, targetCoords, research, baseSeconds = 300) {
  const driveLevel = research?.find(r => r.id === 'drive')?.level || 0;
  const driveBonus = 1 + driveLevel * 0.15;
  const [g1, s1, p1] = parseCoords(fromCoords);
  const [g2, s2, p2] = parseCoords(targetCoords);
  let dist = 0;
  if (g1 !== g2) dist = Math.abs(g1 - g2) * 2000;
  else if (s1 !== s2) dist = Math.abs(s1 - s2) * 200;
  else dist = Math.abs(p1 - p2) * 20;
  return Math.max(60, Math.floor((baseSeconds + dist / 10) / driveBonus));
}

function lerpCoords(originCoords, targetCoords, progress) {
  const [g1, s1, p1] = parseCoords(originCoords);
  const [g2, s2, p2] = parseCoords(targetCoords);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const s = Math.round(s1 + (s2 - s1) * progress);
  const p = Math.round(p1 + (p2 - p1) * progress);
  return formatCoords(Math.max(1, g), Math.max(1, s), Math.max(1, p));
}

// ── GET /api/game/fleet-movements?galaxy=N&system=N ──────────────────────────

export async function handleGetFleetMovements(request, env, url, userId) {
  const galaxy = parseInt(url.searchParams.get('galaxy') || '1');
  const system = parseInt(url.searchParams.get('system') || '1');
  const now = Math.floor(Date.now() / 1000);

  // Get user's alliance for allied fleet detection
  const membership = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
  const allianceId = membership?.alliance_id || null;

  let allianceMembers = [];
  if (allianceId) {
    const { results } = await env.DB.prepare('SELECT user_id FROM alliance_members WHERE alliance_id = ?').bind(allianceId).all();
    allianceMembers = results.map(r => r.user_id);
  }

  // Get fleet sightings for this user (enemy fleets detected via phalanx)
  const { results: sightings } = await env.DB.prepare(
    'SELECT mission_id FROM fleet_sightings WHERE observer_id = ? AND expires_at > ?'
  ).bind(userId, now).all();
  const detectedMissionIds = new Set(sightings.map(s => s.mission_id));

  // Query all travelling fleets that touch this galaxy+system
  const pattern = `[${galaxy}:${system}:%`;
  const { results: missions } = await env.DB.prepare(`
    SELECT fm.*, u.username as owner_name
    FROM fleet_missions fm
    LEFT JOIN users u ON fm.user_id = u.id
    WHERE fm.status = 'travelling'
      AND (fm.origin_coords LIKE ? OR fm.target_coords LIKE ?)
  `).bind(pattern, pattern).all();

  const fleets = [];
  for (const m of missions) {
    const isOwn = m.user_id === userId;
    const isAllied = !isOwn && allianceMembers.includes(m.user_id);
    const isDetected = detectedMissionIds.has(m.id);

    // Fog of war: only show own, allied, or detected fleets
    if (!isOwn && !isAllied && !isDetected) continue;

    const ships = JSON.parse(m.ships || '[]');
    const shipSummary = isOwn
      ? ships.map(s => ({ id: s.id, icon: s.icon, name: s.name, count: s.count }))
      : ships.map(s => ({ id: s.id, count: s.count }));

    fleets.push({
      id: m.id,
      owner_id: m.user_id,
      owner_name: m.owner_name || 'Ismeretlen',
      origin_coords: m.origin_coords || null,
      target_coords: m.target_coords,
      arrive_at: m.arrive_at,
      departed_at: m.created_at,
      ship_summary: shipSummary,
      mission_type: isOwn ? m.mission_type : (isAllied ? m.mission_type : 'unknown'),
      is_own: isOwn,
      is_allied: isAllied,
      is_intercepted: m.is_intercepted === 1,
      intercept_coords: m.intercept_coords || null,
    });
  }

  return jsonResponse({ ok: true, fleets, galaxy, system }, 200, request);
}

// ── POST /api/game/phalanx/scan ──────────────────────────────────────────────

export async function handleScanPhalanx(request, env, userId) {
  let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
  const { galaxy, system } = body;
  if (!galaxy || !system) return jsonError(400, 'Galaxy and system required', request);

  const now = Math.floor(Date.now() / 1000);
  const gs = await getGlobalState(env, userId);
  if (!gs) return jsonError(404, 'Game state not found', request);

  // Check if the user has a sensor_phalanx building on any of their moons
  const { results: moons } = await env.DB.prepare(`
    SELECT m.*, p.coords as parent_coords FROM moons m
    JOIN planets p ON m.planet_id = p.id
    WHERE m.user_id = ?
  `).bind(userId).all();

  let phalanxLevel = 0;
  let phalanxMoonCoords = null;

  for (const moon of moons) {
    const buildings = JSON.parse(moon.buildings || '[]');
    const phalanx = buildings.find(b => b.id === 'sensor_phalanx');
    if (phalanx && phalanx.level > 0) {
      // Check if this moon is in the same galaxy and within range
      const [moonGal, moonSys] = parseCoords(moon.parent_coords);
      if (moonGal === parseInt(galaxy)) {
        const range = phalanx.level * 2;
        if (Math.abs(moonSys - parseInt(system)) <= range) {
          if (phalanx.level > phalanxLevel) {
            phalanxLevel = phalanx.level;
            phalanxMoonCoords = moon.parent_coords;
          }
        }
      }
    }
  }

  // Also check planets for sensor_phalanx (some game configs allow it on planets)
  if (phalanxLevel === 0) {
    const { results: planets } = await env.DB.prepare('SELECT * FROM planets WHERE user_id = ?').bind(userId).all();
    for (const planet of planets) {
      const buildings = JSON.parse(planet.buildings || '[]');
      const phalanx = buildings.find(b => b.id === 'sensor_phalanx');
      if (phalanx && phalanx.level > 0) {
        const [pGal, pSys] = parseCoords(planet.coords);
        if (pGal === parseInt(galaxy)) {
          const range = phalanx.level * 2;
          if (Math.abs(pSys - parseInt(system)) <= range) {
            if (phalanx.level > phalanxLevel) {
              phalanxLevel = phalanx.level;
              phalanxMoonCoords = planet.coords;
            }
          }
        }
      }
    }
  }

  if (phalanxLevel === 0) {
    return jsonError(400, 'Nincs elérhető Szenzor Falanx ebben a hatótávban', request);
  }

  // Query travelling fleets where origin or target matches the scanned system
  const pattern = `[${galaxy}:${system}:%`;
  const { results: missions } = await env.DB.prepare(`
    SELECT fm.*, u.username as owner_name
    FROM fleet_missions fm
    LEFT JOIN users u ON fm.user_id = u.id
    WHERE fm.status = 'travelling'
      AND fm.user_id != ?
      AND (fm.origin_coords LIKE ? OR fm.target_coords LIKE ?)
  `).bind(userId, pattern, pattern).all();

  const detected = [];
  for (const m of missions) {
    const ships = JSON.parse(m.ships || '[]');
    const shipSummary = ships.map(s => ({ id: s.id, icon: s.icon, name: s.name, count: s.count }));

    // Insert into fleet_sightings with expires_at = fleet's arrive_at
    const sightingId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT OR IGNORE INTO fleet_sightings (id, observer_id, mission_id, owner_id, origin_coords, target_coords, ship_summary, arrive_at, detected_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sightingId, userId, m.id, m.user_id,
      m.origin_coords || 'unknown', m.target_coords,
      JSON.stringify(shipSummary), m.arrive_at, now, m.arrive_at
    ).run();

    detected.push({
      id: m.id,
      owner_id: m.user_id,
      owner_name: m.owner_name || 'Ismeretlen',
      origin_coords: m.origin_coords || null,
      target_coords: m.target_coords,
      arrive_at: m.arrive_at,
      departed_at: m.created_at,
      ship_summary: shipSummary,
      mission_type: m.mission_type,
    });
  }

  return jsonResponse({
    ok: true,
    detected,
    phalanxLevel,
    scanFrom: phalanxMoonCoords,
    scannedSystem: `[${galaxy}:${system}]`,
  }, 200, request);
}

// ── POST /api/game/fleet-intercept/:missionId ────────────────────────────────

export async function handleInterceptFleet(request, env, url, userId) {
  const parts = url.pathname.split('/');
  const targetMissionId = parts[parts.length - 1];

  let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
  const { ships } = body;
  if (!ships || !Array.isArray(ships) || ships.length === 0) return jsonError(400, 'Ships required', request);

  const now = Math.floor(Date.now() / 1000);

  // Validate the target mission is in fleet_sightings for this user
  const sighting = await env.DB.prepare(
    'SELECT * FROM fleet_sightings WHERE observer_id = ? AND mission_id = ? AND expires_at > ?'
  ).bind(userId, targetMissionId, now).first();
  if (!sighting) return jsonError(400, 'Nem észlelt flotta — szkenneljen először', request);

  // Load the target mission
  const targetMission = await env.DB.prepare('SELECT * FROM fleet_missions WHERE id = ? AND status = ?').bind(targetMissionId, 'travelling').first();
  if (!targetMission) return jsonError(404, 'A célflotta már nem utazik', request);

  if (targetMission.is_intercepted === 1) return jsonError(400, 'Ez a flotta már elfogás alatt áll', request);

  // Get player's active planet
  const gs = await getGlobalState(env, userId);
  if (!gs) return jsonError(404, 'Game state not found', request);
  const planet = await getPlanetState(env, gs.active_planet_id);
  if (!planet) return jsonError(404, 'Bolygó nem található', request);

  // Extract ships from planet fleet
  const sentShips = [];
  const newFleet = JSON.parse(JSON.stringify(planet.fleet));
  for (const req of ships) {
    const t = newFleet.find(f => f.id === req.id);
    if (t && t.count >= req.count && req.count > 0) {
      t.count -= req.count;
      sentShips.push({ ...t, count: req.count });
    }
  }
  if (sentShips.length === 0) return jsonError(400, 'Nincs küldhető flotta', request);

  // Calculate where the target fleet currently is (linear interpolation)
  const departedAt = targetMission.created_at;
  const arriveAt = targetMission.arrive_at;
  const totalDuration = arriveAt - departedAt;
  const elapsed = now - departedAt;
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration));

  const originCoords = targetMission.origin_coords || targetMission.target_coords;
  const targetCoords = targetMission.target_coords;
  const interceptCoords = lerpCoords(originCoords, targetCoords, progress);

  // Calculate travel time from player's planet to intercept point
  const research = JSON.parse(gs.research || '[]');
  const travelTime = calcTravelTime(planet.coords, interceptCoords, research, 120);
  const interceptArriveAt = now + travelTime;

  // Save updated planet fleet
  planet.fleet = newFleet;
  await savePlanetState(env, planet.id, planet);

  // Create the intercept mission
  const missionId = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO fleet_missions (id, user_id, origin_planet_id, target_user_id, mission_type, target_coords, target_name, status, ships, arrive_at, created_at, origin_coords, intercept_coords)
    VALUES (?, ?, ?, ?, 'intercept', ?, ?, 'travelling', ?, ?, unixepoch(), ?, ?)
  `).bind(
    missionId, userId, planet.id, targetMission.user_id,
    interceptCoords, 'Elfogás',
    JSON.stringify(sentShips), interceptArriveAt,
    planet.coords, interceptCoords
  ).run();

  // Mark the target mission as intercepted
  await env.DB.prepare(`
    UPDATE fleet_missions SET is_intercepted = 1, intercepted_by = ?, intercept_coords = ? WHERE id = ?
  `).bind(missionId, interceptCoords, targetMissionId).run();

  return jsonResponse({
    ok: true,
    missionId,
    interceptCoords,
    arriveAt: interceptArriveAt,
    travelTime,
    ships: sentShips,
  }, 200, request);
}
