/**
 * AIKA WORLD — Auth routes (AikaHub SDK migration)
 *
 * All login/register is handled by AikaHub.
 * This module only handles hub-sync: validating the AikaHub JWT,
 * finding or creating the local game user, and returning a local token.
 *
 * The /api/auth/hub-sync endpoint is kept for backward compatibility,
 * but the main auth flow now comes through the SDK token directly.
 */
import { jsonResponse, jsonError } from '../utils/response.js';
import { signJWT } from '../utils/jwt.js';

/**
 * Decode AikaHub JWT payload (base64-encoded first part).
 * Does NOT verify signature — the Hub already signed it.
 * @param {string} token
 * @returns {object|null}
 */
function decodeHubToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[0];
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function findAvailableCoords(env) {
  for (let s = 1; s <= 10; s++) {
    for (let p = 1; p <= 15; p++) {
      const coords = `[1:${s}:${p}]`;
      const exists = await env.DB.prepare('SELECT 1 FROM galaxy_map WHERE coords = ?').bind(coords).first();
      if (!exists) return coords;
    }
  }
  return `[1:1:${Math.floor(Math.random() * 15) + 1}]`;
}

/**
 * Find or create a local game user from AikaHub user data.
 * @param {object} env
 * @param {object} hubPayload - decoded AikaHub JWT payload { userId, email, nickname, role }
 * @returns {Promise<object>} local user record
 */
async function findOrCreateGameUser(env, hubPayload) {
  const email = (hubPayload.email || '').toLowerCase().trim();
  const nickname = hubPayload.nickname || email.split('@')[0];
  const hubUserId = hubPayload.userId;
  const isAdmin = (hubPayload.role === 'admin' || hubPayload.role === 'superadmin') ? 1 : 0;

  // Try to find by email first, then by hub user ID stored in username match
  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

  if (!user) {
    // Create new game user
    const userId = crypto.randomUUID();
    const planetId = crypto.randomUUID();
    const coords = await findAvailableCoords(env);

    const defBuildings = await env.DB.prepare('SELECT data FROM default_buildings').first();
    const defResearch = await env.DB.prepare('SELECT data FROM default_research').first();
    const defFleet = await env.DB.prepare('SELECT data FROM default_fleet').first();
    const defDefense = await env.DB.prepare('SELECT data FROM default_defense').first();

    await env.DB.batch([
      env.DB.prepare('INSERT INTO users (id, username, email, password, is_admin) VALUES (?, ?, ?, ?, ?)').bind(userId, nickname, email, 'HUB_MANAGED', isAdmin),
      env.DB.prepare('INSERT INTO game_state (user_id, research, active_planet_id) VALUES (?, ?, ?)').bind(userId, defResearch?.data || '{}', planetId),
      env.DB.prepare('INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, defense, is_main) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
        .bind(planetId, userId, `${nickname} F\u{0151}bolyg\u{00F3}`, '\u{1F30D}', coords, defBuildings?.data || '{}', defFleet?.data || '{}', defDefense?.data || '{}'),
      env.DB.prepare('INSERT INTO rankings (user_id, username) VALUES (?, ?)').bind(userId, nickname),
      env.DB.prepare('INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, is_main) VALUES (?, ?, ?, ?, ?, 1)')
        .bind(userId, nickname, `${nickname} F\u{0151}bolyg\u{00F3}`, '\u{1F30D}', coords),
    ]);

    user = { id: userId, username: nickname, email, is_admin: isAdmin };
  } else {
    // Update admin status if changed on Hub
    if (isAdmin !== user.is_admin) {
      await env.DB.prepare('UPDATE users SET is_admin = ? WHERE id = ?').bind(isAdmin, user.id).run();
      user.is_admin = isAdmin;
    }
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?').bind(now, user.id).run();
  }

  return user;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleAuth(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  // ── POST /api/auth/hub-sync ─────────────────────────────
  // Backward-compat: frontend can POST { hub_token, email, nickname }
  if (path === '/api/auth/hub-sync' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { hub_token, email, nickname } = body;
    if (!hub_token || !email) return jsonError(400, 'Missing data', request);

    try {
      const hubPayload = decodeHubToken(hub_token);
      if (!hubPayload || !hubPayload.userId) {
        return jsonError(401, 'Invalid Hub token', request);
      }

      const user = await findOrCreateGameUser(env, {
        userId: hubPayload.userId,
        email: hubPayload.email || email,
        nickname: hubPayload.nickname || nickname || email.split('@')[0],
        role: hubPayload.role || 'user',
      });

      const token = await signJWT({ sub: user.id, username: user.username, isAdmin: user.is_admin }, env.JWT_SECRET);
      return jsonResponse({ ok: true, token, username: user.username, userId: user.id, isAdmin: user.is_admin }, 200, request);
    } catch (err) {
      console.error('Hub sync error:', err);
      return jsonError(500, 'Internal error during Hub sync', request);
    }
  }

  // ── All other /api/auth/* endpoints are removed ─────────
  // Login, register, change-password, and /me are no longer handled locally.
  // Auth is fully managed by AikaHub SDK.
  return jsonError(410, 'This auth endpoint has been removed. Use AikaHub for authentication.', request);
}
