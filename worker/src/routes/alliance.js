/**
 * Alliance routes
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { incrementQuest } from './game.js';

export async function handleAlliance(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/alliance/list' && method === 'GET') {
    const { results } = await env.DB.prepare(`
      SELECT a.*, u.username as leader_name,
      (SELECT COUNT(*) FROM alliance_members WHERE alliance_id = a.id) as member_count,
      (SELECT SUM(score) FROM rankings WHERE user_id IN (SELECT user_id FROM alliance_members WHERE alliance_id = a.id)) as total_score
      FROM alliances a
      JOIN users u ON a.leader_id = u.id
    `).all();
    return jsonResponse({ ok: true, alliances: results }, 200, request);
  }

  if (path === '/api/alliance/my' && method === 'GET') {
    const membership = await env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!membership) return jsonResponse({ ok: true, inAlliance: false }, 200, request);

    const alliance = await env.DB.prepare('SELECT * FROM alliances WHERE id = ?').bind(membership.alliance_id).first();
    const { results: members } = await env.DB.prepare(`
      SELECT u.id as user_id, u.username, m.role, r.score
      FROM alliance_members m
      JOIN users u ON m.user_id = u.id
      JOIN rankings r ON u.id = r.user_id
      WHERE m.alliance_id = ?
    `).bind(membership.alliance_id).all();

    return jsonResponse({ ok: true, inAlliance: true, alliance, members, myRole: membership.role }, 200, request);
  }

  if (path === '/api/alliance/create' && method === 'POST') {
    const existing = await env.DB.prepare('SELECT 1 FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (existing) return jsonError(400, 'Már tagja vagy egy szövetségnek', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { name, tag, description } = body;
    if (!name || !tag) return jsonError(400, 'Név és Tag szükséges', request);

    const allianceId = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO alliances (id, name, tag, description, leader_id) VALUES (?, ?, ?, ?, ?)').bind(allianceId, name, tag.toUpperCase(), description || '', userId),
      env.DB.prepare('INSERT INTO alliance_members (alliance_id, user_id, role) VALUES (?, ?, ? )').bind(allianceId, userId, 'leader')
    ]);

    return jsonResponse({ ok: true, allianceId }, 200, request);
  }

  if (path === '/api/alliance/invite' && method === 'POST') {
    const membership = await env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) return jsonError(403, 'Nincs jogosultságod', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUsername } = body;
    const targetUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(targetUsername).first();
    if (!targetUser) return jsonError(404, 'Felhasználó nem található', request);

    const alreadyMember = await env.DB.prepare('SELECT 1 FROM alliance_members WHERE user_id = ?').bind(targetUser.id).first();
    if (alreadyMember) return jsonError(400, 'A felhasználó már tagja egy szövetségnek', request);

    await env.DB.prepare('INSERT OR IGNORE INTO alliance_invites (alliance_id, user_id) VALUES (?, ?)')
      .bind(membership.alliance_id, targetUser.id).run();

    return jsonResponse({ ok: true }, 200, request);
  }

  if (path.startsWith('/api/alliance/join/') && method === 'POST') {
    const allianceId = path.split('/').pop();
    const existing = await env.DB.prepare('SELECT 1 FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (existing) return jsonError(400, 'Már tagja vagy egy szövetségnek', request);

    await env.DB.prepare('INSERT INTO alliance_members (alliance_id, user_id, role) VALUES (?, ?, "member")')
      .bind(allianceId, userId).run();
    await env.DB.prepare('DELETE FROM alliance_invites WHERE user_id = ?').bind(userId).run();

    return jsonResponse({ ok: true }, 200, request);
  }

  if (path === '/api/alliance/leave' && method === 'POST') {
    const membership = await env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!membership) return jsonError(400, 'Nem vagy szövetség tagja', request);
    if (membership.role === 'leader') return jsonError(400, 'Vezér nem léphet ki (előbb add át a vezetést vagy töröld a szövetséget)', request);

    await env.DB.prepare('DELETE FROM alliance_members WHERE user_id = ?').bind(userId).run();
    return jsonResponse({ ok: true }, 200, request);
  }

  if (path === '/api/alliance/kick' && method === 'POST') {
    const membership = await env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) return jsonError(403, 'Nincs jogosultságod', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId } = body;
    const targetMember = await env.DB.prepare('SELECT role FROM alliance_members WHERE user_id = ? AND alliance_id = ?').bind(targetUserId, membership.alliance_id).first();
    
    if (!targetMember) return jsonError(404, 'Tag nem található', request);
    if (membership.role === 'officer' && targetMember.role !== 'member') return jsonError(403, 'Csak sima tagokat rúghatsz ki', request);

    await env.DB.prepare('DELETE FROM alliance_members WHERE user_id = ? AND alliance_id = ?').bind(targetUserId, membership.alliance_id).run();
    return jsonResponse({ ok: true }, 200, request);
  }

  if (path === '/api/alliance/promote' && method === 'POST') {
    const membership = await env.DB.prepare('SELECT alliance_id, role FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!membership || membership.role !== 'leader') return jsonError(403, 'Csak a vezér léptethet elő', request);

    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { targetUserId, role } = body;
    if (!['member', 'officer'].includes(role)) return jsonError(400, 'Érvénytelen rang', request);

    await env.DB.prepare('UPDATE alliance_members SET role = ? WHERE user_id = ? AND alliance_id = ?')
      .bind(role, targetUserId, membership.alliance_id).run();

    return jsonResponse({ ok: true }, 200, request);
  }

  if (path === '/api/alliance/donate' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { metal = 0, crystal = 0, deus = 0 } = body;
    const amount = Math.max(0, metal) + Math.max(0, crystal) + Math.max(0, deus);
    if (amount <= 0) return jsonError(400, 'Érvénytelen mennyiség', request);

    const membership = await env.DB.prepare('SELECT alliance_id FROM alliance_members WHERE user_id = ?').bind(userId).first();
    if (!membership) return jsonError(403, 'Nem vagy szövetség tagja', request);

    const gs = await env.DB.prepare('SELECT active_planet_id FROM game_state WHERE user_id = ?').bind(userId).first();
    const planetRow = await env.DB.prepare('SELECT resources FROM planets WHERE id = ?').bind(gs.active_planet_id).first();
    if (!planetRow) return jsonError(404, 'Bolygó nem található', request);

    const res = JSON.parse(planetRow.resources);
    if (res.metal < metal || res.crystal < crystal || res.deus < deus) return jsonError(400, 'Nincs elég nyersanyagod ezen a bolygón', request);

    res.metal -= metal; res.crystal -= crystal; res.deus -= deus;
    await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?').bind(JSON.stringify(res), gs.active_planet_id).run();

    const alliance = await env.DB.prepare('SELECT * FROM alliances WHERE id = ?').bind(membership.alliance_id).first();
    const vault = JSON.parse(alliance.vault || '{"metal":0,"crystal":0,"deus":0}');
    vault.metal += metal; vault.crystal += crystal; vault.deus += deus;

    let newExp = alliance.exp + Math.floor((metal + crystal * 2 + deus * 10) / 100);
    let newLevel = alliance.level;
    while (newExp >= newLevel * 1000) { newExp -= newLevel * 1000; newLevel++; }

    await env.DB.prepare('UPDATE alliances SET level = ?, exp = ?, vault = ? WHERE id = ?').bind(newLevel, newExp, JSON.stringify(vault), alliance.id).run();
    await incrementQuest(env, userId, 'donate');
    return jsonResponse({ ok: true, level: newLevel, exp: newExp, vault }, 200, request);
  }

  return jsonError(404, 'Alliance endpoint not found', request);
}
