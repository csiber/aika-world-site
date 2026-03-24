/**
 * Notifications routes (all protected)
 * POST /api/notifications/subscribe   — save push subscription
 * GET  /api/notifications             — list last 50 notifications
 * POST /api/notifications/read        — mark all as read
 * POST /api/notifications/read/:id    — mark single as read
 */

import { jsonResponse, jsonError } from '../utils/response.js';

/**
 * Create a notification for a user.
 * Can be imported and called from other modules (e.g. mission_resolver).
 */
export async function createNotification(env, userId, type, title, body) {
  try {
    await env.DB.prepare(
      `INSERT INTO notifications (id, user_id, type, title, body, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    ).bind(crypto.randomUUID(), userId, type, title, body, Date.now()).run();
  } catch (e) {
    console.error('Failed to create notification:', e);
  }
}

export async function handleNotifications(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // Ensure tables exist (inline migration)
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, endpoint TEXT NOT NULL,
      p256dh_key TEXT NOT NULL, auth_key TEXT NOT NULL, created_at INTEGER NOT NULL
    )`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL,
      title TEXT NOT NULL, body TEXT NOT NULL, is_read INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )`).run();
  } catch (_) { /* tables already exist */ }

  // POST /api/notifications/subscribe — save push subscription
  if (path === '/api/notifications/subscribe' && method === 'POST') {
    try {
      const { endpoint, keys } = await request.json();
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return jsonError(400, 'Missing subscription data', request);
      }

      // Upsert: delete old subscription for same endpoint, then insert
      await env.DB.prepare('DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?')
        .bind(userId, endpoint).run();

      const id = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh_key, auth_key, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, userId, endpoint, keys.p256dh, keys.auth, Date.now()).run();

      return jsonResponse({ ok: true }, 200, request);
    } catch (e) {
      return jsonError(400, 'Invalid subscription data', request);
    }
  }

  // GET /api/notifications — list last 50 notifications
  if (path === '/api/notifications' && method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).bind(userId).all();
    return jsonResponse({ ok: true, notifications: rows.results }, 200, request);
  }

  // POST /api/notifications/read/:id — mark single as read
  const readOneMatch = path.match(/^\/api\/notifications\/read\/([^/]+)$/);
  if (readOneMatch && method === 'POST') {
    const id = readOneMatch[1];
    await env.DB.prepare(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();
    return jsonResponse({ ok: true }, 200, request);
  }

  // POST /api/notifications/read — mark all as read
  if (path === '/api/notifications/read' && method === 'POST') {
    await env.DB.prepare(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0'
    ).bind(userId).run();
    return jsonResponse({ ok: true }, 200, request);
  }

  return jsonError(404, 'Notifications endpoint not found', request);
}
