/**
 * Territory / Sector Control routes
 */

import { jsonResponse, jsonError } from '../utils/response.js';

export async function handleGetTerritoryMap(request, env, userId) {
  const url = new URL(request.url);
  const galaxy = parseInt(url.searchParams.get('galaxy') || '1');

  const { results: claims } = await env.DB.prepare(`
    SELECT sc.galaxy, sc.system_num, sc.alliance_id, sc.claim_strength, sc.bonus_type, sc.bonus_value,
           a.name as alliance_name, a.tag as alliance_tag
    FROM sector_claims sc
    JOIN alliances a ON sc.alliance_id = a.id
    WHERE sc.galaxy = ?
  `).bind(galaxy).all();

  const { results: relays } = await env.DB.prepare(`
    SELECT galaxy, system_num, bonus_type, bonus_value
    FROM relay_points
    WHERE galaxy = ?
  `).bind(galaxy).all();

  return jsonResponse({ ok: true, claims, relays }, 200, request);
}

export async function handleGetAllianceTerritory(request, env, userId) {
  const membership = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
  if (!membership) return jsonResponse({ ok: true, territory: [], total_systems: 0 }, 200, request);

  const { results: territory } = await env.DB.prepare(`
    SELECT sc.galaxy, sc.system_num, sc.claim_strength, sc.bonus_type, sc.bonus_value
    FROM sector_claims sc
    WHERE sc.alliance_id = ?
  `).bind(membership.alliance_id).all();

  return jsonResponse({ ok: true, territory, total_systems: territory.length }, 200, request);
}

export async function handleRecalcSectorControl(env) {
  // Get all distinct galaxy:system combinations that have planets
  const { results: systems } = await env.DB.prepare(`
    SELECT DISTINCT
      CAST(substr(g.coords, 2, instr(g.coords, ':') - 2) AS INTEGER) as galaxy,
      CAST(substr(g.coords, instr(g.coords, ':') + 1, instr(substr(g.coords, instr(g.coords, ':') + 1), ':') - 1) AS INTEGER) as system_num
    FROM galaxy_map g
  `).all();

  for (const sys of systems) {
    // Count planets per alliance in this system
    const { results: alliancePlanets } = await env.DB.prepare(`
      SELECT am.alliance_id, COUNT(*) as planet_count
      FROM galaxy_map g
      JOIN alliance_members am ON g.user_id = am.user_id
      WHERE CAST(substr(g.coords, 2, instr(g.coords, ':') - 2) AS INTEGER) = ?
        AND CAST(substr(g.coords, instr(g.coords, ':') + 1, instr(substr(g.coords, instr(g.coords, ':') + 1), ':') - 1) AS INTEGER) = ?
      GROUP BY am.alliance_id
      ORDER BY planet_count DESC
    `).bind(sys.galaxy, sys.system_num).all();

    // Count total occupied slots in this system
    const totalRow = await env.DB.prepare(`
      SELECT COUNT(*) as total
      FROM galaxy_map g
      WHERE CAST(substr(g.coords, 2, instr(g.coords, ':') - 2) AS INTEGER) = ?
        AND CAST(substr(g.coords, instr(g.coords, ':') + 1, instr(substr(g.coords, instr(g.coords, ':') + 1), ':') - 1) AS INTEGER) = ?
    `).bind(sys.galaxy, sys.system_num).first();

    const totalOccupied = totalRow?.total || 0;
    const topAlliance = alliancePlanets[0];

    if (topAlliance && totalOccupied > 0 && topAlliance.planet_count >= 4 && (topAlliance.planet_count / totalOccupied) > 0.5) {
      // Alliance qualifies for claim
      const claimStrength = Math.min(5, Math.floor(topAlliance.planet_count / 2));
      const bonusValue = Math.min(0.25, 0.05 * claimStrength);

      await env.DB.prepare(`
        INSERT INTO sector_claims (id, galaxy, system_num, alliance_id, claim_strength, bonus_type, bonus_value, claimed_at)
        VALUES (?, ?, ?, ?, ?, 'standard', ?, unixepoch())
        ON CONFLICT(galaxy, system_num) DO UPDATE SET
          alliance_id = excluded.alliance_id,
          claim_strength = excluded.claim_strength,
          bonus_value = excluded.bonus_value,
          claimed_at = unixepoch()
      `).bind(
        `${sys.galaxy}:${sys.system_num}`,
        sys.galaxy, sys.system_num, topAlliance.alliance_id,
        claimStrength, bonusValue
      ).run();
    } else {
      // No alliance qualifies — remove claim
      await env.DB.prepare('DELETE FROM sector_claims WHERE galaxy = ? AND system_num = ?')
        .bind(sys.galaxy, sys.system_num).run();
    }
  }

  // Update alliance territory_count
  const { results: alliances } = await env.DB.prepare('SELECT id FROM alliances').all();
  for (const a of alliances) {
    const countRow = await env.DB.prepare('SELECT COUNT(*) as cnt FROM sector_claims WHERE alliance_id = ?').bind(a.id).first();
    try {
      await env.DB.prepare('UPDATE alliances SET territory_count = ? WHERE id = ?').bind(countRow?.cnt || 0, a.id).run();
    } catch (_) { /* column may not exist yet */ }
  }
}
