/**
 * Auth routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { signJWT, verifyJWT, hashPassword, verifyPassword } from '../utils/jwt.js';

export async function handleAuth(request, env, url) {
  const path = url.pathname;

  // ── REGISTER ──────────────────────────────────────────────
  if (path === '/api/auth/register' && request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }

    const { username, email, password } = body;
    if (!username || !email || !password) return jsonError(400, 'Minden mező kitöltése kötelező', request);
    if (username.length < 3 || username.length > 20) return jsonError(400, 'Felhasználónév 3–20 karakter legyen', request);
    if (!/^[a-zA-Z0-9_\-]+$/.test(username)) return jsonError(400, 'Felhasználónév csak betűt, számot, _, - tartalmazhat', request);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError(400, 'Érvénytelen email cím', request);
    if (password.length < 6) return jsonError(400, 'Jelszó min. 6 karakter legyen', request);

    // Check uniqueness
    const existing = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email.toLowerCase(), username.toLowerCase()).first();
    if (existing) return jsonError(409, 'Ez az email vagy felhasználónév már foglalt', request);

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Load defaults
    const defBuildings = await env.DB.prepare('SELECT data FROM default_buildings LIMIT 1').first();
    const defResearch  = await env.DB.prepare('SELECT data FROM default_research LIMIT 1').first();
    const defFleet     = await env.DB.prepare('SELECT data FROM default_fleet LIMIT 1').first();

    const defaultPlanets = JSON.stringify([
      { name: `${username}'s Prime`, emoji: '🌍', coords: `[1:${Math.ceil(Math.random()*9)}:${Math.ceil(Math.random()*15)}]` }
    ]);

    await env.DB.batch([
      env.DB.prepare('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)')
        .bind(userId, username, email.toLowerCase(), passwordHash),
      env.DB.prepare(`INSERT INTO game_state (user_id, buildings, research, fleet, planets) VALUES (?, ?, ?, ?, ?)`)
        .bind(userId, defBuildings?.data || '[]', defResearch?.data || '[]', defFleet?.data || '[]', defaultPlanets),
      env.DB.prepare('INSERT INTO rankings (user_id, username, score) VALUES (?, ?, 0)')
        .bind(userId, username),
    ]);

    const token = await signJWT({ sub: userId, username }, env.JWT_SECRET);
    return jsonResponse({ ok: true, token, username, userId }, 201, request);
  }

  // ── LOGIN ─────────────────────────────────────────────────
  if (path === '/api/auth/login' && request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }

    const { email, password } = body;
    if (!email || !password) return jsonError(400, 'Email és jelszó megadása kötelező', request);

    const user = await env.DB.prepare(
      'SELECT id, username, email, password FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (!user) return jsonError(401, 'Hibás email vagy jelszó', request);

    const valid = await verifyPassword(password, user.password);
    if (!valid) return jsonError(401, 'Hibás email vagy jelszó', request);

    await env.DB.prepare('UPDATE users SET last_login = unixepoch() WHERE id = ?').bind(user.id).run();

    const token = await signJWT({ sub: user.id, username: user.username }, env.JWT_SECRET);
    return jsonResponse({ ok: true, token, username: user.username, userId: user.id }, 200, request);
  }

  // ── ME (token refresh / profile) ─────────────────────────
  if (path === '/api/auth/me' && request.method === 'GET') {
    const authResult = await verifyJWT(request, env);
    if (!authResult.ok) return jsonError(401, authResult.error, request);
    const { sub: userId, username } = authResult.user;
    const user = await env.DB.prepare('SELECT id, username, email, created_at, last_login FROM users WHERE id = ?').bind(userId).first();
    if (!user) return jsonError(404, 'User not found', request);
    return jsonResponse({ ok: true, user }, 200, request);
  }

  return jsonError(404, 'Auth endpoint not found', request);
}
