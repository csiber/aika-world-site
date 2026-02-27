/**
 * Alliance routes
 * POST /api/alliance/create       — szövetség létrehozása
 * POST /api/alliance/invite       — meghívó küldése
 * POST /api/alliance/join/:id     — meghívó elfogadása
 * POST /api/alliance/leave        — kilépés
 * POST /api/alliance/kick         — tag kirúgása (csak vezető)
 * GET  /api/alliance/my           — saját szövetség info
 * GET  /api/alliance/list         — összes szövetség listája
 * POST /api/alliance/chat         — üzenet küldése szövetségi chaten
 * GET  /api/alliance/chat         — szövetségi chat üzenetek
 */

import { jsonResponse, jsonError } from '../utils/response.js';

async function tableExists(env, name) {
  try {
    await env.DB.prepare(`SELECT 1 FROM ${name} LIMIT 1`).first();
    return true;
  } catch { return false; }
}

export async function handleAlliance(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // Check if tables exist (migration might not have run yet)
  const tablesReady = await tableExists(env, 'alliances');
  if (!tablesReady) {
    if (path === '/api/alliance/my' && method === 'GET') {
      return jsonResponse({ ok: true, alliance: null }, 200, request);
    }
    return jsonError(503, 'Szövetség funkció még nem érhető el. Futtasd a migration.sql-t!', request);
  }

  // ── GET /api/alliance/list ───────────────────────────────
  if (path === '/api/alliance/list' && method === 'GET') {
    const rows = await env.DB.prepare(`
      SELECT a.id, a.name, a.tag, a.description, a.leader_id,
             u.username as leader_name,
             COUNT(am.user_id) as member_count,
             COALESCE(SUM(r.score),0) as total_score
      FROM alliances a
      JOIN users u ON u.id = a.leader_id
      LEFT JOIN alliance_members am ON am.alliance_id = a.id
      LEFT JOIN rankings r ON r.user_id = am.user_id
      GROUP BY a.id
      ORDER BY total_score DESC
      LIMIT 50
    `).all();
    return jsonResponse({ ok: true, alliances: rows.results }, 200, request);
  }

  // ── GET /api/alliance/my ─────────────────────────────────
  if (path === '/api/alliance/my' && method === 'GET') {
    const membership = await env.DB.prepare(
      'SELECT alliance_id, role FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();

    if (!membership) return jsonResponse({ ok: true, alliance: null }, 200, request);

    const alliance = await env.DB.prepare(
      'SELECT * FROM alliances WHERE id = ?'
    ).bind(membership.alliance_id).first();

    const members = await env.DB.prepare(`
      SELECT am.user_id, am.role, u.username, COALESCE(r.score,0) as score
      FROM alliance_members am
      JOIN users u ON u.id = am.user_id
      LEFT JOIN rankings r ON r.user_id = am.user_id
      WHERE am.alliance_id = ?
      ORDER BY r.score DESC
    `).bind(membership.alliance_id).all();

    return jsonResponse({ ok: true, alliance, members: members.results, myRole: membership.role }, 200, request);
  }

  // ── GET /api/alliance/chat ───────────────────────────────
  if (path === '/api/alliance/chat' && method === 'GET') {
    const membership = await env.DB.prepare(
      'SELECT alliance_id FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);

    const msgs = await env.DB.prepare(
      'SELECT * FROM alliance_chat WHERE alliance_id = ? ORDER BY created_at DESC LIMIT 50'
    ).bind(membership.alliance_id).all();

    return jsonResponse({ ok: true, messages: msgs.results.reverse() }, 200, request);
  }

  // ── POST /api/alliance/create ────────────────────────────
  if (path === '/api/alliance/create' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { name, tag, description } = body;

    if (!name || name.length < 3 || name.length > 40) return jsonError(400, 'Név 3-40 karakter legyen', request);
    if (!tag  || !/^[A-Z0-9]{2,5}$/.test(tag)) return jsonError(400, 'Tag: 2-5 nagybetű/szám (pl. AIKA)', request);

    // Check not already in alliance
    const existing = await env.DB.prepare(
      'SELECT alliance_id FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (existing) return jsonError(409, 'Már tagja vagy egy szövetségnek', request);

    // Check name/tag uniqueness
    const taken = await env.DB.prepare(
      'SELECT id FROM alliances WHERE name = ? OR tag = ?'
    ).bind(name, tag).first();
    if (taken) return jsonError(409, 'Ez a név vagy tag már foglalt', request);

    const allianceId = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO alliances (id, name, tag, description, leader_id) VALUES (?, ?, ?, ?, ?)')
        .bind(allianceId, name, tag.toUpperCase(), description || '', userId),
      env.DB.prepare('INSERT INTO alliance_members (alliance_id, user_id, role) VALUES (?, ?, ?)')
        .bind(allianceId, userId, 'leader'),
    ]);

    return jsonResponse({ ok: true, allianceId, message: `[${tag}] ${name} szövetség létrehozva!` }, 201, request);
  }

  // ── POST /api/alliance/invite ────────────────────────────
  if (path === '/api/alliance/invite' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUsername } = body;

    const membership = await env.DB.prepare(
      'SELECT alliance_id, role FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);
    if (!['leader','officer'].includes(membership.role)) return jsonError(403, 'Csak vezető vagy tiszt hívhat meg', request);

    const target = await env.DB.prepare('SELECT id, username FROM users WHERE username = ?').bind(targetUsername).first();
    if (!target) return jsonError(404, 'Játékos nem található', request);

    const alreadyMember = await env.DB.prepare(
      'SELECT alliance_id FROM alliance_members WHERE user_id = ?'
    ).bind(target.id).first();
    if (alreadyMember) return jsonError(409, 'Ez a játékos már tagja egy szövetségnek', request);

    const alliance = await env.DB.prepare('SELECT name, tag FROM alliances WHERE id = ?').bind(membership.alliance_id).first();

    // Send invite as message
    await env.DB.prepare(
      'INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      crypto.randomUUID(), target.id,
      `🤝 ${user.username}`,
      `Szövetség meghívó: [${alliance.tag}] ${alliance.name}`,
      `Meghívtak a(z) [${alliance.tag}] ${alliance.name} szövetségbe!\n\nMeghívó: ${user.username}\n\nCsatlakozáshoz: Szövetség menü → Csatlakozás ID-vel: ${membership.alliance_id}`,
      'alliance'
    ).run();

    return jsonResponse({ ok: true, message: `Meghívó elküldve: ${targetUsername}` }, 200, request);
  }

  // ── POST /api/alliance/join/:id ──────────────────────────
  const joinMatch = path.match(/^\/api\/alliance\/join\/(.+)$/);
  if (joinMatch && method === 'POST') {
    const allianceId = joinMatch[1];

    const existing = await env.DB.prepare(
      'SELECT alliance_id FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (existing) return jsonError(409, 'Már tagja vagy egy szövetségnek', request);

    const alliance = await env.DB.prepare('SELECT * FROM alliances WHERE id = ?').bind(allianceId).first();
    if (!alliance) return jsonError(404, 'Szövetség nem található', request);

    const memberCount = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM alliance_members WHERE alliance_id = ?'
    ).bind(allianceId).first();
    if (memberCount.cnt >= 50) return jsonError(400, 'A szövetség tele van (max 50 tag)', request);

    await env.DB.prepare('INSERT INTO alliance_members (alliance_id, user_id, role) VALUES (?, ?, ?)')
      .bind(allianceId, userId, 'member').run();

    // Notify alliance leader
    await env.DB.prepare(
      'INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      crypto.randomUUID(), alliance.leader_id,
      '🤝 Rendszer',
      `Új tag csatlakozott: ${user.username}`,
      `${user.username} csatlakozott a [${alliance.tag}] ${alliance.name} szövetséghez!`,
      'alliance'
    ).run();

    return jsonResponse({ ok: true, message: `Csatlakoztál: [${alliance.tag}] ${alliance.name}` }, 200, request);
  }

  // ── POST /api/alliance/leave ─────────────────────────────
  if (path === '/api/alliance/leave' && method === 'POST') {
    const membership = await env.DB.prepare(
      'SELECT alliance_id, role FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (!membership) return jsonError(400, 'Nem vagy szövetség tagja', request);

    if (membership.role === 'leader') {
      // Transfer leadership or disband
      const nextMember = await env.DB.prepare(
        'SELECT user_id FROM alliance_members WHERE alliance_id = ? AND user_id != ? LIMIT 1'
      ).bind(membership.alliance_id, userId).first();

      if (nextMember) {
        await env.DB.batch([
          env.DB.prepare('UPDATE alliances SET leader_id = ? WHERE id = ?')
            .bind(nextMember.user_id, membership.alliance_id),
          env.DB.prepare('UPDATE alliance_members SET role = ? WHERE user_id = ? AND alliance_id = ?')
            .bind('leader', nextMember.user_id, membership.alliance_id),
          env.DB.prepare('DELETE FROM alliance_members WHERE user_id = ?').bind(userId),
        ]);
      } else {
        // Disband — only member left
        await env.DB.batch([
          env.DB.prepare('DELETE FROM alliance_chat WHERE alliance_id = ?').bind(membership.alliance_id),
          env.DB.prepare('DELETE FROM alliance_members WHERE alliance_id = ?').bind(membership.alliance_id),
          env.DB.prepare('DELETE FROM alliances WHERE id = ?').bind(membership.alliance_id),
        ]);
      }
    } else {
      await env.DB.prepare('DELETE FROM alliance_members WHERE user_id = ?').bind(userId).run();
    }

    return jsonResponse({ ok: true, message: 'Kilépve a szövetségből' }, 200, request);
  }

  // ── POST /api/alliance/kick ──────────────────────────────
  if (path === '/api/alliance/kick' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId } = body;

    const membership = await env.DB.prepare(
      'SELECT alliance_id, role FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (!membership || !['leader','officer'].includes(membership.role))
      return jsonError(403, 'Csak vezető vagy tiszt rúghat ki tagot', request);

    const target = await env.DB.prepare(
      'SELECT role FROM alliance_members WHERE user_id = ? AND alliance_id = ?'
    ).bind(targetUserId, membership.alliance_id).first();
    if (!target) return jsonError(404, 'Tag nem található', request);
    if (target.role === 'leader') return jsonError(403, 'A vezető nem rúgható ki', request);

    await env.DB.prepare('DELETE FROM alliance_members WHERE user_id = ? AND alliance_id = ?')
      .bind(targetUserId, membership.alliance_id).run();

    return jsonResponse({ ok: true }, 200, request);
  }

  // ── POST /api/alliance/chat ──────────────────────────────
  if (path === '/api/alliance/chat' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { message } = body;
    if (!message || message.length > 300) return jsonError(400, 'Üzenet 1-300 karakter legyen', request);

    const membership = await env.DB.prepare(
      'SELECT alliance_id FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);

    await env.DB.prepare(
      'INSERT INTO alliance_chat (id, alliance_id, user_id, username, message) VALUES (?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), membership.alliance_id, userId, user.username, message).run();

    return jsonResponse({ ok: true }, 200, request);
  }

  // ── POST /api/alliance/promote ───────────────────────────
  if (path === '/api/alliance/promote' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, role } = body;
    if (!['officer','member'].includes(role)) return jsonError(400, 'Érvénytelen rang', request);

    const membership = await env.DB.prepare(
      'SELECT alliance_id, role FROM alliance_members WHERE user_id = ?'
    ).bind(userId).first();
    if (!membership || membership.role !== 'leader') return jsonError(403, 'Csak vezető módosíthat rangot', request);

    await env.DB.prepare(
      'UPDATE alliance_members SET role = ? WHERE user_id = ? AND alliance_id = ?'
    ).bind(role, targetUserId, membership.alliance_id).run();

    return jsonResponse({ ok: true }, 200, request);
  }

  return jsonError(404, 'Alliance endpoint not found', request);
}
