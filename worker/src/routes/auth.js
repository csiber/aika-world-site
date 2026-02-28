/**
 * Auth routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

import { jsonResponse, jsonError } from '../utils/response.js';
import { signJWT, verifyJWT, hashPassword, verifyPassword } from '../utils/jwt.js';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(token, secret) {
  if (!token) return false;
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function handleAuth(request, env, url) {
  const path = url.pathname;

  // ── REGISTER ──────────────────────────────────────────────
  if (path === '/api/auth/register' && request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }

    const { username, email, password, tsToken } = body;

    const tsOk = await verifyTurnstile(tsToken, env.TURNSTILE_SECRET);
    if (!tsOk) return jsonError(400, 'Biztonsági ellenőrzés sikertelen. Próbáld újra!', request);

    if (!username || !email || !password) return jsonError(400, 'Minden mező kitöltése kötelező', request);
    if (username.length < 3 || username.length > 20) return jsonError(400, 'Felhasználónév 3–20 karakter legyen', request);
    if (!/^[a-zA-Z0-9_\-]+$/.test(username)) return jsonError(400, 'Felhasználónév csak betűt, számot, _, - tartalmazhat', request);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError(400, 'Érvénytelen email cím', request);
    if (password.length < 6) return jsonError(400, 'Jelszó min. 6 karakter legyen', request);

    try {
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

      const firstPlanetCoords = `[1:${Math.ceil(Math.random()*9)}:${Math.ceil(Math.random()*15)}]`;
      const firstPlanetName   = `${username}'s Prime`;
      const defaultPlanets = JSON.stringify([
        { name: firstPlanetName, emoji: '🌍', coords: firstPlanetCoords }
      ]);

      await env.DB.batch([
        env.DB.prepare('INSERT INTO users (id, username, email, password, is_admin) VALUES (?, ?, ?, ?, ?)')
          .bind(userId, username, email.toLowerCase(), passwordHash, 0),
        env.DB.prepare(`INSERT INTO game_state (user_id, buildings, research, fleet, planets) VALUES (?, ?, ?, ?, ?)`)
          .bind(userId, defBuildings?.data || '[]', defResearch?.data || '[]', defFleet?.data || '[]', defaultPlanets),
        env.DB.prepare('INSERT INTO rankings (user_id, username, score) VALUES (?, ?, 0)')
          .bind(userId, username),
        env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(crypto.randomUUID(), userId, '🌐 Rendszer', 'Üdvözöllek az AIKA World-ben!',
            `Szia ${username}!\n\nSikeresen regisztráltál az AIKA World galaktikus terjeszkedési játékba. Kezdj épületeket fejleszteni, kutass technológiákat, és terjeszd ki birodalmad!\n\nJó játékot!`,
            'system'),
        env.DB.prepare('INSERT INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, score) VALUES (?, ?, ?, ?, ?, 0)')
          .bind(userId, username, firstPlanetName, '🌍', firstPlanetCoords),
      ]);

      const token = await signJWT({ sub: userId, username, isAdmin: 0 }, env.JWT_SECRET);
      return jsonResponse({ ok: true, token, username, userId, isAdmin: false }, 201, request);
    } catch (error) {
      console.error('Register error:', error);
      return jsonError(500, 'Regisztráció sikertelen. Kérjük,próbálja újra később.', request);
    }
  }

  // ── LOGIN ─────────────────────────────────────────────────
  if (path === '/api/auth/login' && request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }

    const { email, password, tsToken } = body;

    console.log('Login attempt for:', email);
    if (!env.TURNSTILE_SECRET) console.error('MISSING TURNSTILE_SECRET');
    if (!env.JWT_SECRET) console.error('MISSING JWT_SECRET');

    const tsOk = await verifyTurnstile(tsToken, env.TURNSTILE_SECRET);
    if (!tsOk) {
      console.warn('Turnstile verification failed');
      return jsonError(400, 'Biztonsági ellenőrzés sikertelen. Próbáld újra!', request);
    }

    if (!email || !password) return jsonError(400, 'Email és jelszó megadása kötelező', request);

    try {
      console.log('Querying database for user...');
      const user = await env.DB.prepare(
        'SELECT id, username, email, password, is_admin FROM users WHERE email = ?'
      ).bind(email.toLowerCase()).first();

      if (!user) {
        console.warn('User not found:', email);
        return jsonError(401, 'Hibás email vagy jelszó', request);
      }

      console.log('Verifying password...');
      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        console.warn('Invalid password for:', email);
        return jsonError(401, 'Hibás email vagy jelszó', request);
      }

      // Daily login bonus — check before updating last_login
      const nowSec = Math.floor(Date.now() / 1000);
      const lastLoginDay = user.last_login ? Math.floor(user.last_login / 86400) : -1;
      const todayDay     = Math.floor(nowSec / 86400);
      let dailyBonus = null;
      if (todayDay > lastLoginDay) {
        const bonus = { metal: 5000, crystal: 2500, deus: 50 };
        try {
          const stateRow = await env.DB.prepare('SELECT resources FROM game_state WHERE user_id = ?').bind(user.id).first();
          if (stateRow) {
            const res = JSON.parse(stateRow.resources);
            res.metal   += bonus.metal;
            res.crystal += bonus.crystal;
            res.deus    += bonus.deus;
            await env.DB.prepare('UPDATE game_state SET resources=? WHERE user_id=?')
              .bind(JSON.stringify(res), user.id).run();
            await env.DB.prepare(
              'INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(
              crypto.randomUUID(), user.id,
              '🎁 Rendszer', 'Napi bejelentkezési jutalom!',
              `Üdvözlünk vissza, ${user.username}!\n\n⚙️ Fém: +${bonus.metal.toLocaleString('hu')}\n💎 Kristály: +${bonus.crystal.toLocaleString('hu')}\n🔮 Déusium: +${bonus.deus}\n\nHolnap is visszatérsz?`,
              'system'
            ).run();
            dailyBonus = bonus;
          }
        } catch (e) { console.warn('Daily bonus error:', e.message); }
      }

      console.log('Updating last login...');
      await env.DB.prepare('UPDATE users SET last_login = unixepoch() WHERE id = ?').bind(user.id).run();

      console.log('Signing JWT...');
      const token = await signJWT({ sub: user.id, username: user.username, isAdmin: user.is_admin }, env.JWT_SECRET);

      console.log('Login successful');
      return jsonResponse({ ok: true, token, username: user.username, userId: user.id, isAdmin: !!user.is_admin, dailyBonus }, 200, request);
    } catch (error) {
      console.error('CRITICAL LOGIN ERROR:', error.message, error.stack);
      return jsonError(500, `Szerver hiba: ${error.message}`, request);
    }
  }

  // ── ME (token refresh / profile) ─────────────────────────
  if (path === '/api/auth/me' && request.method === 'GET') {
    const authResult = await verifyJWT(request, env);
    if (!authResult.ok) return jsonError(401, authResult.error, request);
    const { sub: userId } = authResult.user;
    
    try {
      const user = await env.DB.prepare('SELECT id, username, email, is_admin, created_at, last_login FROM users WHERE id = ?').bind(userId).first();
      if (!user) return jsonError(404, 'User not found', request);
      return jsonResponse({ ok: true, user: { ...user, is_admin: !!user.is_admin } }, 200, request);
    } catch (error) {
      console.error('Me endpoint error:', error);
      return jsonError(500, 'Profil betöltése sikertelen. Kérjük, próbálja újra később.', request);
    }
  }

  return jsonError(404, 'Auth endpoint not found', request);
}
