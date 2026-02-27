/**
 * Profile route
 * GET  /api/profile/:username  — nyilvános profil
 * GET  /api/profile/me         — saját profil részletesen
 */

import { jsonResponse, jsonError } from '../utils/response.js';

async function tableExists(env, name) {
  try {
    await env.DB.prepare(`SELECT 1 FROM ${name} LIMIT 1`).first();
    return true;
  } catch { return false; }
}

export async function handleProfile(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  if (method !== 'GET') return jsonError(405, 'Method not allowed', request);

  // ── GET /api/profile/me ──────────────────────────────────
  if (path === '/api/profile/me') {
    const u = await env.DB.prepare('SELECT id, username, created_at FROM users WHERE id = ?').bind(userId).first();
    const r = await env.DB.prepare('SELECT score FROM rankings WHERE user_id = ?').bind(userId).first();
    const state = await env.DB.prepare('SELECT buildings, research, fleet, planets FROM game_state WHERE user_id = ?').bind(userId).first();

    const buildings = JSON.parse(state?.buildings || '[]');
    const research  = JSON.parse(state?.research  || '[]');
    const fleet     = JSON.parse(state?.fleet     || '[]');
    const planets   = JSON.parse(state?.planets   || '[]');

    const rank = await env.DB.prepare(
      'SELECT COUNT(*)+1 as rank FROM rankings WHERE score > (SELECT score FROM rankings WHERE user_id = ?)'
    ).bind(userId).first();

    let membership = null;
    try {
      membership = await env.DB.prepare(
        'SELECT a.name, a.tag, am.role FROM alliance_members am JOIN alliances a ON a.id = am.alliance_id WHERE am.user_id = ?'
      ).bind(userId).first();
    } catch (e) { /* alliance tables not migrated yet */ }

    const queueCount = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM build_queue WHERE user_id = ?'
    ).bind(userId).first();

    return jsonResponse({
      ok: true,
      profile: {
        username: u.username,
        createdAt: u.created_at,
        score: r?.score || 0,
        rank: rank?.rank || null,
        planets: planets.length,
        totalBuildingLevels: buildings.reduce((s, b) => s + b.level, 0),
        totalResearchLevels: research.reduce((s, r) => s + r.level, 0),
        totalShips: fleet.reduce((s, f) => s + f.count, 0),
        alliance: membership ? { name: membership.name, tag: membership.tag, role: membership.role } : null,
        activeQueue: queueCount?.cnt || 0,
      }
    }, 200, request);
  }

  // ── GET /api/profile/:username ───────────────────────────
  const match = path.match(/^\/api\/profile\/(.+)$/);
  if (match) {
    const username = match[1];
    const u = await env.DB.prepare('SELECT id, username, created_at FROM users WHERE username = ?').bind(username).first();
    if (!u) return jsonError(404, 'Játékos nem található', request);

    const r = await env.DB.prepare('SELECT score FROM rankings WHERE user_id = ?').bind(u.id).first();
    const state = await env.DB.prepare('SELECT planets FROM game_state WHERE user_id = ?').bind(u.id).first();
    const planets = JSON.parse(state?.planets || '[]');

    const rank = await env.DB.prepare(
      'SELECT COUNT(*)+1 as rank FROM rankings WHERE score > ?'
    ).bind(r?.score || 0).first();

    let membership = null;
    try {
      membership = await env.DB.prepare(
        'SELECT a.name, a.tag FROM alliance_members am JOIN alliances a ON a.id = am.alliance_id WHERE am.user_id = ?'
      ).bind(u.id).first();
    } catch (e) { /* alliance tables not migrated yet */ }

    return jsonResponse({
      ok: true,
      profile: {
        username: u.username,
        createdAt: u.created_at,
        score: r?.score || 0,
        rank: rank?.rank || null,
        planets: planets.length,
        alliance: membership ? { name: membership.name, tag: membership.tag } : null,
      }
    }, 200, request);
  }

  return jsonError(404, 'Profile endpoint not found', request);
}
