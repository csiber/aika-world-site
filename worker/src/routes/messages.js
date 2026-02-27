/**
 * Messages routes (all protected)
 * GET    /api/messages          — get all messages for user
 * POST   /api/messages/:id/read — mark message as read
 * DELETE /api/messages/:id      — delete a message
 * GET    /api/messages/unread   — unread count
 */

import { jsonResponse, jsonError } from '../utils/response.js';

export async function handleMessages(request, env, url, user) {
  const userId = user.sub;
  const path = url.pathname;
  const method = request.method;

  // GET /api/messages/unread
  if (path === '/api/messages/unread' && method === 'GET') {
    const row = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE user_id = ? AND is_read = 0'
    ).bind(userId).first();
    return jsonResponse({ ok: true, count: row?.count || 0 }, 200, request);
  }

  // GET /api/messages
  if (path === '/api/messages' && method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
    ).bind(userId).all();
    return jsonResponse({ ok: true, messages: rows.results }, 200, request);
  }

  // POST /api/messages/:id/read
  const readMatch = path.match(/^\/api\/messages\/([^/]+)\/read$/);
  if (readMatch && method === 'POST') {
    const id = readMatch[1];
    await env.DB.prepare(
      'UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();
    return jsonResponse({ ok: true }, 200, request);
  }

  // DELETE /api/messages/:id
  const deleteMatch = path.match(/^\/api\/messages\/([^/]+)$/);
  if (deleteMatch && method === 'DELETE') {
    const id = deleteMatch[1];
    await env.DB.prepare(
      'DELETE FROM messages WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();
    return jsonResponse({ ok: true }, 200, request);
  }

  return jsonError(404, 'Messages endpoint not found', request);
}
