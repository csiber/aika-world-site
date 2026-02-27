/**
 * Rankings route
 * GET /api/rankings
 */

import { jsonResponse, jsonError } from '../utils/response.js';

export async function handleRankings(request, env, url, user) {
  if (request.method !== 'GET') return jsonError(405, 'Method not allowed', request);

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  const rows = await env.DB.prepare(`
    SELECT r.username, r.score, r.updated_at,
           ROW_NUMBER() OVER (ORDER BY r.score DESC) as rank
    FROM rankings r
    ORDER BY r.score DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  const total = await env.DB.prepare('SELECT COUNT(*) as count FROM rankings').first();

  // Find current user's rank
  const myRank = await env.DB.prepare(`
    SELECT COUNT(*) + 1 as rank FROM rankings WHERE score > (
      SELECT score FROM rankings WHERE user_id = ?
    )
  `).bind(user.sub).first();

  const myRow = await env.DB.prepare(
    'SELECT username, score FROM rankings WHERE user_id = ?'
  ).bind(user.sub).first();

  return jsonResponse({
    ok: true,
    rankings: rows.results,
    total: total?.count || 0,
    page,
    myRank: myRank?.rank || null,
    myScore: myRow?.score || 0,
    myUsername: myRow?.username || user.username,
  }, 200, request);
}
