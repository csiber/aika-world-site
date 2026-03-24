/**
 * AIKA WORLD — Seasonal Events Routes
 */
import { jsonResponse, jsonError } from '../utils/response.js';
import { getActiveEvent, getEventLeaderboard } from '../utils/events.js';
import { verifyJWT } from '../utils/jwt.js';

export async function handleEvents(request, env, url, user) {
  const path = url.pathname;
  const method = request.method;

  // GET /api/events/active — current active event + leaderboard
  if (path === '/api/events/active' && method === 'GET') {
    try {
      const event = await getActiveEvent(env);
      if (!event) {
        return jsonResponse({ ok: true, event: null, leaderboard: [] }, 200, request);
      }

      const leaderboard = await getEventLeaderboard(env, event.id);

      // Get user's own score
      const { results: myScore } = await env.DB.prepare(
        'SELECT score FROM event_scores WHERE event_id = ? AND user_id = ?'
      ).bind(event.id, user.sub).all();

      return jsonResponse({
        ok: true,
        event: {
          id: event.id,
          type: event.type_id,
          meta: event.meta,
          expiresAt: event.expires_at,
          data: event.data,
        },
        leaderboard,
        myScore: myScore.length ? myScore[0].score : 0,
      }, 200, request);
    } catch (err) {
      console.error('Events active error:', err);
      return jsonError(500, 'Failed to load events', request);
    }
  }

  return jsonError(404, 'Events endpoint not found', request);
}

export async function handleAdminEvents(request, env, url) {
  // Verify admin auth (same pattern as admin.js)
  const authResult = await verifyJWT(request, env);
  if (!authResult.ok) return jsonError(401, authResult.error, request);
  if (!authResult.user.isAdmin) return jsonError(403, 'Admin access required', request);

  const path = url.pathname;
  const method = request.method;

  // POST /api/admin/events/start — start a seasonal event
  if (path === '/api/admin/events/start' && method === 'POST') {
    try {
      const { type } = await request.json();
      if (!type) return jsonError(400, 'Event type is required', request);

      const { startSeasonalEvent } = await import('../utils/events.js');
      const event = await startSeasonalEvent(env, type);
      if (!event) return jsonError(400, 'Invalid event type', request);

      return jsonResponse({ ok: true, event }, 200, request);
    } catch (err) {
      console.error('Admin event start error:', err);
      return jsonError(500, 'Failed to start event', request);
    }
  }

  return jsonError(404, 'Admin events endpoint not found', request);
}
