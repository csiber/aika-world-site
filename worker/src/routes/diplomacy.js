/**
 * AIKA WORLD — Diplomacy routes
 * Treaty types: nap, trade, vassalage
 */

import { jsonResponse, jsonError } from '../utils/response.js';

const VALID_TYPES = ['nap', 'trade', 'vassalage'];
const NAP_COOLDOWN_MS = 48 * 60 * 60; // 48 hours in seconds

async function getMembership(env, userId) {
  return env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
}

export async function handleDiplomacy(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // ── POST /api/diplomacy/propose ───────────────────────
  if (path === '/api/diplomacy/propose' && method === 'POST') {
    const membership = await getMembership(env, userId);
    if (!membership || membership.role !== 'leader') return jsonError(403, 'Csak a szövetség vezetője javasolhat szerződést', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetAllianceId, type } = body;

    if (!VALID_TYPES.includes(type)) return jsonError(400, 'Érvénytelen szerződés típus', request);
    if (targetAllianceId === membership.alliance_id) return jsonError(400, 'Nem köthetsz szerződést saját magaddal', request);

    const target = await env.DB.prepare('SELECT id, name FROM alliances WHERE id = ?').bind(targetAllianceId).first();
    if (!target) return jsonError(404, 'Cél szövetség nem található', request);

    // Check for existing active/pending treaty of same type
    const existing = await env.DB.prepare(`
      SELECT id FROM diplomacy
      WHERE ((alliance_a_id = ? AND alliance_b_id = ?) OR (alliance_a_id = ? AND alliance_b_id = ?))
        AND type = ? AND status IN ('pending', 'active')
    `).bind(membership.alliance_id, targetAllianceId, targetAllianceId, membership.alliance_id, type).first();
    if (existing) return jsonError(400, 'Már létezik ilyen típusú szerződés ezzel a szövetséggel', request);

    // Check cooldown
    const now = Math.floor(Date.now() / 1000);
    const cooldownCheck = await env.DB.prepare(`
      SELECT cooldown_until FROM diplomacy
      WHERE ((alliance_a_id = ? AND alliance_b_id = ?) OR (alliance_a_id = ? AND alliance_b_id = ?))
        AND type = ? AND cooldown_until > ?
      ORDER BY cooldown_until DESC LIMIT 1
    `).bind(membership.alliance_id, targetAllianceId, targetAllianceId, membership.alliance_id, type, now).first();
    if (cooldownCheck) return jsonError(400, `Lehűlési idő aktív. Várd meg: ${new Date(cooldownCheck.cooldown_until * 1000).toLocaleString('hu')}`, request);

    const id = crypto.randomUUID();
    const terms = type === 'trade' ? JSON.stringify({ feeReduction: 0.15 }) :
                  type === 'vassalage' ? JSON.stringify({ taxRate: 0.10 }) : '{}';

    await env.DB.prepare(`
      INSERT INTO diplomacy (id, type, alliance_a_id, alliance_b_id, terms_json, proposed_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(id, type, membership.alliance_id, targetAllianceId, terms, userId, now).run();

    // Notify target leader
    const targetLeader = await env.DB.prepare('SELECT leader_id FROM alliances WHERE id = ?').bind(targetAllianceId).first();
    const myAlliance = await env.DB.prepare('SELECT name FROM alliances WHERE id = ?').bind(membership.alliance_id).first();
    if (targetLeader) {
      const typeNames = { nap: 'Megnemtámadási Egyezmény', trade: 'Kereskedelmi Szerződés', vassalage: 'Vazallus Szerződés' };
      await env.DB.prepare('INSERT INTO messages (user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?)')
        .bind(targetLeader.leader_id, 'Diplomácia', 'Új szerződésjavaslat!',
          `A(z) ${myAlliance.name} szövetség ${typeNames[type]} javaslatot küldött.`, 'system').run();
    }

    return jsonResponse({ ok: true, id }, 200, request);
  }

  // ── POST /api/diplomacy/:id/accept ────────────────────
  if (path.match(/^\/api\/diplomacy\/[^/]+\/accept$/) && method === 'POST') {
    const treatyId = path.split('/')[3];
    const treaty = await env.DB.prepare('SELECT * FROM diplomacy WHERE id = ? AND status = "pending"').bind(treatyId).first();
    if (!treaty) return jsonError(404, 'Szerződés nem található vagy már nem függőben', request);

    const membership = await getMembership(env, userId);
    if (!membership || membership.role !== 'leader') return jsonError(403, 'Csak a cél szövetség vezetője fogadhatja el', request);
    if (membership.alliance_id !== treaty.alliance_b_id) return jsonError(403, 'Nem te vagy a cél szövetség vezetője', request);

    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare('UPDATE diplomacy SET status = "active", created_at = ? WHERE id = ?').bind(now, treatyId).run();

    // Notify proposer
    const proposerMembership = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(treaty.proposed_by).first();
    const targetAlliance = await env.DB.prepare('SELECT name FROM alliances WHERE id = ?').bind(treaty.alliance_b_id).first();
    await env.DB.prepare('INSERT INTO messages (user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?)')
      .bind(treaty.proposed_by, 'Diplomácia', 'Szerződés elfogadva!',
        `A(z) ${targetAlliance?.name || 'ismeretlen'} szövetség elfogadta a szerződést.`, 'system').run();

    return jsonResponse({ ok: true }, 200, request);
  }

  // ── POST /api/diplomacy/:id/decline ───────────────────
  if (path.match(/^\/api\/diplomacy\/[^/]+\/decline$/) && method === 'POST') {
    const treatyId = path.split('/')[3];
    const treaty = await env.DB.prepare('SELECT * FROM diplomacy WHERE id = ? AND status = "pending"').bind(treatyId).first();
    if (!treaty) return jsonError(404, 'Szerződés nem található', request);

    const membership = await getMembership(env, userId);
    if (!membership || membership.role !== 'leader') return jsonError(403, 'Nincs jogosultságod', request);
    if (membership.alliance_id !== treaty.alliance_b_id) return jsonError(403, 'Nem te vagy a cél szövetség vezetője', request);

    await env.DB.prepare('UPDATE diplomacy SET status = "declined" WHERE id = ?').bind(treatyId).run();

    await env.DB.prepare('INSERT INTO messages (user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?)')
      .bind(treaty.proposed_by, 'Diplomácia', 'Szerződés elutasítva',
        'A cél szövetség elutasította a szerződésjavaslatot.', 'system').run();

    return jsonResponse({ ok: true }, 200, request);
  }

  // ── POST /api/diplomacy/:id/cancel ────────────────────
  if (path.match(/^\/api\/diplomacy\/[^/]+\/cancel$/) && method === 'POST') {
    const treatyId = path.split('/')[3];
    const treaty = await env.DB.prepare('SELECT * FROM diplomacy WHERE id = ? AND status IN ("pending", "active")').bind(treatyId).first();
    if (!treaty) return jsonError(404, 'Szerződés nem található', request);

    const membership = await getMembership(env, userId);
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);

    // Only proposer's alliance leader (for pending) or either alliance leader (for active) can cancel
    const isAllianceA = membership.alliance_id === treaty.alliance_a_id;
    const isAllianceB = membership.alliance_id === treaty.alliance_b_id;
    if (!isAllianceA && !isAllianceB) return jsonError(403, 'Nem vagy érintett szövetség tagja', request);
    if (membership.role !== 'leader') return jsonError(403, 'Csak a szövetség vezetője mondhatja fel', request);

    if (treaty.status === 'pending' && !isAllianceA) return jsonError(403, 'Csak a javaslattevő vonhatja vissza', request);

    const now = Math.floor(Date.now() / 1000);
    let cooldownUntil = null;

    // NAP cancellation incurs 48h cooldown
    if (treaty.status === 'active' && treaty.type === 'nap') {
      cooldownUntil = now + NAP_COOLDOWN_MS;
    }

    await env.DB.prepare('UPDATE diplomacy SET status = "cancelled", cooldown_until = ? WHERE id = ?')
      .bind(cooldownUntil, treatyId).run();

    // Notify other alliance
    const otherAllianceId = isAllianceA ? treaty.alliance_b_id : treaty.alliance_a_id;
    const otherLeader = await env.DB.prepare('SELECT leader_id FROM alliances WHERE id = ?').bind(otherAllianceId).first();
    const myAlliance = await env.DB.prepare('SELECT name FROM alliances WHERE id = ?').bind(membership.alliance_id).first();
    if (otherLeader) {
      await env.DB.prepare('INSERT INTO messages (user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?)')
        .bind(otherLeader.leader_id, 'Diplomácia', 'Szerződés felmondva!',
          `A(z) ${myAlliance?.name || 'ismeretlen'} szövetség felmondta a szerződést.${cooldownUntil ? ' 48 órás lehűlési idő lépett érvénybe.' : ''}`, 'system').run();
    }

    return jsonResponse({ ok: true, cooldownUntil }, 200, request);
  }

  // ── GET /api/diplomacy/active ─────────────────────────
  if (path === '/api/diplomacy/active' && method === 'GET') {
    const membership = await getMembership(env, userId);
    if (!membership) return jsonResponse({ ok: true, treaties: [] }, 200, request);

    const { results } = await env.DB.prepare(`
      SELECT d.*, a1.name as alliance_a_name, a1.tag as alliance_a_tag,
             a2.name as alliance_b_name, a2.tag as alliance_b_tag
      FROM diplomacy d
      JOIN alliances a1 ON d.alliance_a_id = a1.id
      JOIN alliances a2 ON d.alliance_b_id = a2.id
      WHERE d.status = 'active'
        AND (d.alliance_a_id = ? OR d.alliance_b_id = ?)
      ORDER BY d.created_at DESC
    `).bind(membership.alliance_id, membership.alliance_id).all();

    return jsonResponse({ ok: true, treaties: results }, 200, request);
  }

  // ── GET /api/diplomacy/pending ────────────────────────
  if (path === '/api/diplomacy/pending' && method === 'GET') {
    const membership = await getMembership(env, userId);
    if (!membership) return jsonResponse({ ok: true, incoming: [], outgoing: [] }, 200, request);

    const { results: incoming } = await env.DB.prepare(`
      SELECT d.*, a1.name as alliance_a_name, a1.tag as alliance_a_tag,
             a2.name as alliance_b_name, a2.tag as alliance_b_tag
      FROM diplomacy d
      JOIN alliances a1 ON d.alliance_a_id = a1.id
      JOIN alliances a2 ON d.alliance_b_id = a2.id
      WHERE d.status = 'pending' AND d.alliance_b_id = ?
      ORDER BY d.created_at DESC
    `).bind(membership.alliance_id).all();

    const { results: outgoing } = await env.DB.prepare(`
      SELECT d.*, a1.name as alliance_a_name, a1.tag as alliance_a_tag,
             a2.name as alliance_b_name, a2.tag as alliance_b_tag
      FROM diplomacy d
      JOIN alliances a1 ON d.alliance_a_id = a1.id
      JOIN alliances a2 ON d.alliance_b_id = a2.id
      WHERE d.status = 'pending' AND d.alliance_a_id = ?
      ORDER BY d.created_at DESC
    `).bind(membership.alliance_id).all();

    return jsonResponse({ ok: true, incoming, outgoing }, 200, request);
  }

  return jsonError(404, 'Diplomacy endpoint not found', request);
}

/**
 * Check if two alliances have an active NAP treaty.
 * Used by mission_resolver to block attacks.
 */
export async function hasActiveNAP(env, allianceAId, allianceBId) {
  if (!allianceAId || !allianceBId) return false;
  const treaty = await env.DB.prepare(`
    SELECT id FROM diplomacy
    WHERE type = 'nap' AND status = 'active'
      AND ((alliance_a_id = ? AND alliance_b_id = ?) OR (alliance_a_id = ? AND alliance_b_id = ?))
    LIMIT 1
  `).bind(allianceAId, allianceBId, allianceBId, allianceAId).first();
  return !!treaty;
}

/**
 * Check if two alliances have an active Trade Agreement.
 * Returns the fee reduction multiplier (e.g., 0.15 for 15% reduction).
 */
export async function getTradeDiscount(env, allianceAId, allianceBId) {
  if (!allianceAId || !allianceBId) return 0;
  const treaty = await env.DB.prepare(`
    SELECT terms_json FROM diplomacy
    WHERE type = 'trade' AND status = 'active'
      AND ((alliance_a_id = ? AND alliance_b_id = ?) OR (alliance_a_id = ? AND alliance_b_id = ?))
    LIMIT 1
  `).bind(allianceAId, allianceBId, allianceBId, allianceAId).first();
  if (!treaty) return 0;
  try {
    const terms = JSON.parse(treaty.terms_json);
    return terms.feeReduction || 0;
  } catch { return 0; }
}
