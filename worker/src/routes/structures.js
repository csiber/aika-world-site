/**
 * AIKA WORLD — Alliance Structures (Space Stations)
 * Types: defense, trade, research
 */

import { jsonResponse, jsonError } from '../utils/response.js';

const STRUCTURE_DEFS = {
  defense: {
    name: 'Védelmi Bástya',
    nameEn: 'Defense Bastion',
    required: { metal: 500000, crystal: 300000, deus: 0 },
    bonus: '-15% incoming attack damage',
  },
  trade: {
    name: 'Kereskedelmi Központ',
    nameEn: 'Trade Hub',
    required: { metal: 300000, crystal: 500000, deus: 0 },
    bonus: '+20% market capacity',
  },
  research: {
    name: 'Kutatási Nexus',
    nameEn: 'Research Nexus',
    required: { metal: 200000, crystal: 200000, deus: 100000 },
    bonus: '+10% research speed',
  },
};

async function getMembership(env, userId) {
  return env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
}

export async function handleStructures(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // ── GET /api/alliance/structures ──────────────────────
  if (path === '/api/alliance/structures' && method === 'GET') {
    const membership = await getMembership(env, userId);
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);

    const { results: structures } = await env.DB.prepare(
      'SELECT * FROM alliance_structures WHERE alliance_id = ?'
    ).bind(membership.alliance_id).all();

    // Enrich with contribution totals
    const enriched = await Promise.all(structures.map(async (s) => {
      const totals = await env.DB.prepare(`
        SELECT COALESCE(SUM(metal), 0) as total_metal,
               COALESCE(SUM(crystal), 0) as total_crystal,
               COALESCE(SUM(deus), 0) as total_deus
        FROM alliance_contributions WHERE structure_id = ?
      `).bind(s.id).first();

      const def = STRUCTURE_DEFS[s.type];
      const req = def?.required || { metal: 0, crystal: 0, deus: 0 };
      const isActive = (totals.total_metal >= req.metal) &&
                       (totals.total_crystal >= req.crystal) &&
                       (totals.total_deus >= req.deus);

      return {
        ...s,
        contributions: { metal: totals.total_metal, crystal: totals.total_crystal, deus: totals.total_deus },
        required: req,
        isActive,
        def,
      };
    }));

    // Also return what types can still be built
    const builtTypes = structures.map(s => s.type);
    const buildable = Object.keys(STRUCTURE_DEFS).filter(t => !builtTypes.includes(t));

    return jsonResponse({ ok: true, structures: enriched, buildable }, 200, request);
  }

  // ── POST /api/alliance/structures/build ───────────────
  if (path === '/api/alliance/structures/build' && method === 'POST') {
    const membership = await getMembership(env, userId);
    if (!membership || (membership.role !== 'leader' && membership.role !== 'officer'))
      return jsonError(403, 'Csak vezetők és tisztek kezdeményezhetnek építést', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { type } = body;

    if (!STRUCTURE_DEFS[type]) return jsonError(400, 'Érvénytelen struktúra típus', request);

    // Check if already exists
    const existing = await env.DB.prepare(
      'SELECT id FROM alliance_structures WHERE alliance_id = ? AND type = ?'
    ).bind(membership.alliance_id, type).first();
    if (existing) return jsonError(400, 'Ez a struktúra már létezik', request);

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await env.DB.prepare(`
      INSERT INTO alliance_structures (id, alliance_id, type, level, hp, max_hp, total_metal, total_crystal, total_deus, built_at)
      VALUES (?, ?, ?, 0, 10000, 10000, 0, 0, 0, NULL)
    `).bind(id, membership.alliance_id, type).run();

    return jsonResponse({ ok: true, id, type }, 200, request);
  }

  // ── POST /api/alliance/structures/contribute ──────────
  if (path === '/api/alliance/structures/contribute' && method === 'POST') {
    const membership = await getMembership(env, userId);
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { structureId, metal = 0, crystal = 0, deus = 0 } = body;

    if (metal < 0 || crystal < 0 || deus < 0) return jsonError(400, 'Érvénytelen mennyiség', request);
    if (metal + crystal + deus <= 0) return jsonError(400, 'Legalább egy nyersanyagot add meg', request);

    // Verify structure belongs to user's alliance
    const structure = await env.DB.prepare(
      'SELECT * FROM alliance_structures WHERE id = ? AND alliance_id = ?'
    ).bind(structureId, membership.alliance_id).first();
    if (!structure) return jsonError(404, 'Struktúra nem található', request);

    // Check if already fully built
    const def = STRUCTURE_DEFS[structure.type];
    const currentTotals = await env.DB.prepare(`
      SELECT COALESCE(SUM(metal), 0) as total_metal,
             COALESCE(SUM(crystal), 0) as total_crystal,
             COALESCE(SUM(deus), 0) as total_deus
      FROM alliance_contributions WHERE structure_id = ?
    `).bind(structureId).first();

    const req = def?.required || { metal: 0, crystal: 0, deus: 0 };
    if (currentTotals.total_metal >= req.metal && currentTotals.total_crystal >= req.crystal && currentTotals.total_deus >= req.deus) {
      return jsonError(400, 'Ez a struktúra már teljesen felépült', request);
    }

    // Cap contributions to what's needed
    const actualMetal = Math.min(metal, Math.max(0, req.metal - currentTotals.total_metal));
    const actualCrystal = Math.min(crystal, Math.max(0, req.crystal - currentTotals.total_crystal));
    const actualDeus = Math.min(deus, Math.max(0, req.deus - currentTotals.total_deus));

    if (actualMetal + actualCrystal + actualDeus <= 0) return jsonError(400, 'Nincs szükség több nyersanyagra', request);

    // Deduct from player's active planet
    const gs = await env.DB.prepare('SELECT active_planet_id FROM game_state WHERE user_id = ?').bind(userId).first();
    const planetRow = await env.DB.prepare('SELECT resources FROM planets WHERE id = ?').bind(gs.active_planet_id).first();
    if (!planetRow) return jsonError(404, 'Bolygó nem található', request);

    const res = JSON.parse(planetRow.resources);
    if (res.metal < actualMetal || res.crystal < actualCrystal || res.deus < actualDeus)
      return jsonError(400, 'Nincs elég nyersanyagod', request);

    res.metal -= actualMetal;
    res.crystal -= actualCrystal;
    res.deus -= actualDeus;
    await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?')
      .bind(JSON.stringify(res), gs.active_planet_id).run();

    // Record contribution
    const now = Math.floor(Date.now() / 1000);
    const contribId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO alliance_contributions (id, user_id, structure_id, metal, crystal, deus, contributed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(contribId, userId, structureId, actualMetal, actualCrystal, actualDeus, now).run();

    // Update structure totals
    await env.DB.prepare(`
      UPDATE alliance_structures SET total_metal = total_metal + ?, total_crystal = total_crystal + ?, total_deus = total_deus + ? WHERE id = ?
    `).bind(actualMetal, actualCrystal, actualDeus, structureId).run();

    // Check if thresholds are now met → set level=1, built_at=now
    const newTotals = {
      metal: currentTotals.total_metal + actualMetal,
      crystal: currentTotals.total_crystal + actualCrystal,
      deus: currentTotals.total_deus + actualDeus,
    };
    if (newTotals.metal >= req.metal && newTotals.crystal >= req.crystal && newTotals.deus >= req.deus && structure.level < 1) {
      await env.DB.prepare('UPDATE alliance_structures SET level = 1, built_at = ? WHERE id = ?')
        .bind(now, structureId).run();
    }

    return jsonResponse({
      ok: true,
      contributed: { metal: actualMetal, crystal: actualCrystal, deus: actualDeus },
    }, 200, request);
  }

  // ── GET /api/alliance/structures/:id/contributions ──
  const contribMatch = path.match(/^\/api\/alliance\/structures\/([^/]+)\/contributions$/);
  if (contribMatch && method === 'GET') {
    const membership = await getMembership(env, userId);
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);

    const structureId = contribMatch[1];

    // Verify structure belongs to user's alliance
    const structure = await env.DB.prepare(
      'SELECT * FROM alliance_structures WHERE id = ? AND alliance_id = ?'
    ).bind(structureId, membership.alliance_id).first();
    if (!structure) return jsonError(404, 'Struktúra nem található', request);

    const { results: contributions } = await env.DB.prepare(`
      SELECT ac.user_id, ac.metal, ac.crystal, ac.deus, ac.contributed_at, u.username
      FROM alliance_contributions ac
      LEFT JOIN game_state u ON u.user_id = ac.user_id
      WHERE ac.structure_id = ?
      ORDER BY (ac.metal + ac.crystal + ac.deus) DESC
    `).bind(structureId).all();

    // Aggregate per user
    const byUser = {};
    for (const c of contributions) {
      if (!byUser[c.user_id]) {
        byUser[c.user_id] = { user_id: c.user_id, username: c.username || 'Unknown', metal: 0, crystal: 0, deus: 0 };
      }
      byUser[c.user_id].metal += c.metal;
      byUser[c.user_id].crystal += c.crystal;
      byUser[c.user_id].deus += c.deus;
    }

    const ranked = Object.values(byUser).sort((a, b) => (b.metal + b.crystal + b.deus) - (a.metal + a.crystal + a.deus));
    return jsonResponse({ ok: true, contributions: ranked }, 200, request);
  }

  return jsonError(404, 'Structures endpoint not found', request);
}

/**
 * Check if an alliance has an active Defense Bastion.
 * Returns true if the structure exists and is fully built.
 */
export async function hasDefenseBastion(env, allianceId) {
  if (!allianceId) return false;
  const structure = await env.DB.prepare(
    'SELECT id FROM alliance_structures WHERE alliance_id = ? AND type = "defense"'
  ).bind(allianceId).first();
  if (!structure) return false;

  const totals = await env.DB.prepare(`
    SELECT COALESCE(SUM(metal), 0) as total_metal,
           COALESCE(SUM(crystal), 0) as total_crystal
    FROM alliance_contributions WHERE structure_id = ?
  `).bind(structure.id).first();

  const req = STRUCTURE_DEFS.defense.required;
  return totals.total_metal >= req.metal && totals.total_crystal >= req.crystal;
}

/**
 * Check if an alliance has an active Research Nexus.
 * Returns the speed bonus multiplier (0.10 for 10%).
 */
export async function getResearchBonus(env, allianceId) {
  if (!allianceId) return 0;
  const structure = await env.DB.prepare(
    'SELECT id FROM alliance_structures WHERE alliance_id = ? AND type = "research"'
  ).bind(allianceId).first();
  if (!structure) return 0;

  const totals = await env.DB.prepare(`
    SELECT COALESCE(SUM(metal), 0) as total_metal,
           COALESCE(SUM(crystal), 0) as total_crystal,
           COALESCE(SUM(deus), 0) as total_deus
    FROM alliance_contributions WHERE structure_id = ?
  `).bind(structure.id).first();

  const req = STRUCTURE_DEFS.research.required;
  if (totals.total_metal >= req.metal && totals.total_crystal >= req.crystal && totals.total_deus >= req.deus) {
    return 0.10;
  }
  return 0;
}

/**
 * Check if an alliance has an active Trade Hub.
 * Returns the capacity bonus multiplier (0.20 for 20%).
 */
export async function getTradeHubBonus(env, allianceId) {
  if (!allianceId) return 0;
  const structure = await env.DB.prepare(
    'SELECT id FROM alliance_structures WHERE alliance_id = ? AND type = "trade"'
  ).bind(allianceId).first();
  if (!structure) return 0;

  const totals = await env.DB.prepare(`
    SELECT COALESCE(SUM(metal), 0) as total_metal,
           COALESCE(SUM(crystal), 0) as total_crystal
    FROM alliance_contributions WHERE structure_id = ?
  `).bind(structure.id).first();

  const req = STRUCTURE_DEFS.trade.required;
  if (totals.total_metal >= req.metal && totals.total_crystal >= req.crystal) {
    return 0.20;
  }
  return 0;
}
