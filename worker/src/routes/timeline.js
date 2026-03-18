/**
 * AIKA WORLD — Activity Timeline Routes
 */

import { jsonResponse, jsonError } from '../utils/response.js';

export async function handleTimeline(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // ── GET /api/game/timeline?limit=50 ────────────────────
  if (path === '/api/game/timeline' && method === 'GET') {
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

    const { results: events } = await env.DB.prepare(
      'SELECT * FROM activity_timeline WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(userId, limit).all();

    // Get last_timeline_read from game_state
    let lastRead = 0;
    try {
      const gs = await env.DB.prepare('SELECT last_timeline_read FROM game_state WHERE user_id = ?').bind(userId).first();
      lastRead = gs?.last_timeline_read || 0;
    } catch (_) { /* column may not exist yet */ }

    const unreadCount = events.filter(e => e.created_at > lastRead).length;

    return jsonResponse({ ok: true, events, unread_count: unreadCount, last_read: lastRead }, 200, request);
  }

  // ── POST /api/game/timeline/read ────────────────────────
  if (path === '/api/game/timeline/read' && method === 'POST') {
    const now = Math.floor(Date.now() / 1000);

    // Ensure column exists
    try {
      await env.DB.prepare('ALTER TABLE game_state ADD COLUMN last_timeline_read INTEGER DEFAULT 0').run();
    } catch (_) { /* already exists */ }

    await env.DB.prepare('UPDATE game_state SET last_timeline_read = ? WHERE user_id = ?').bind(now, userId).run();

    return jsonResponse({ ok: true, last_read: now }, 200, request);
  }

  return jsonError(404, 'Timeline endpoint not found', request);
}
