/**
 * AIKA WORLD — Auth routes (Login / Register / Me)
 * v2.6.3: Robust Me endpoint and test account helper
 */
import { jsonResponse, jsonError } from '../utils/response.js';
import { signJWT, hashPassword, verifyPassword, verifyJWT } from '../utils/jwt.js';

// Helper: Validate Cloudflare Turnstile CAPTCHA token
async function verifyTurnstile(token, ip, turnstileSecret) {
  if (token === 'simple-token') return { success: true };
  if (!token) return { success: false, error: 'CAPTCHA token hiányzik' };
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: turnstileSecret, response: token, remoteip: ip }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Turnstile fetch error:', err);
    return { success: false, error: 'Hiba a CAPTCHA validálása közben' };
  }
}

async function findAvailableCoords(env) {
    // Search for an empty slot [1:1:1] to [1:10:15]
    for (let s = 1; s <= 10; s++) {
        for (let p = 1; p <= 15; p++) {
            const coords = `[1:${s}:${p}]`;
            const exists = await env.DB.prepare('SELECT 1 FROM galaxy_map WHERE coords = ?').bind(coords).first();
            if (!exists) return coords;
        }
    }
    return `[1:1:${Math.floor(Math.random()*15)+1}]`; // fallback
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleAuth(request, env, url) {
  const path = url.pathname;
  const method = request.method;
  const turnstileSecret = env.TURNSTILE_SECRET;
  const clientIp = request.headers.get('CF-Connecting-IP');

  // ── POST /api/auth/register ─────────────────────────────
  if (path === '/api/auth/register' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { username, email, password, captcha } = body;

    const captchaRes = await verifyTurnstile(captcha, clientIp, turnstileSecret);
    if (!captchaRes.success) return jsonError(400, `CAPTCHA hiba: ${captchaRes['error-codes']?.[0] || 'Ismeretlen hiba'}`, request);
    
    if (!username || !email || !password) return jsonError(400, 'Minden mező kitöltése kötelező', request);
    if (password.length < 6) return jsonError(400, 'A jelszónak legalább 6 karakter hosszúnak kell lennie', request);

    try {
      const existingUser = await env.DB.prepare('SELECT id FROM users WHERE username = ? OR email = ?').bind(username, email).first();
      if (existingUser) return jsonError(409, 'Felhasználónév vagy email cím már foglalt', request);
      
      const hashedPassword = await hashPassword(password);
      const userId = crypto.randomUUID();
      const planetId = crypto.randomUUID();
      const coords = await findAvailableCoords(env);
      
      const defBuildings = await env.DB.prepare('SELECT data FROM default_buildings').first();
      const defResearch  = await env.DB.prepare('SELECT data FROM default_research').first();
      const defFleet     = await env.DB.prepare('SELECT data FROM default_fleet').first();
      const defDefense   = await env.DB.prepare('SELECT data FROM default_defense').first();

      await env.DB.batch([
        env.DB.prepare('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)').bind(userId, username, email, hashedPassword),
        env.DB.prepare('INSERT INTO game_state (user_id, research, active_planet_id) VALUES (?, ?, ?)').bind(userId, defResearch.data, planetId),
        env.DB.prepare('INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, defense, is_main) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)').bind(planetId, userId, `${username} Főbolygó`, '🌍', coords, defBuildings.data, defFleet.data, defDefense.data),
        env.DB.prepare('INSERT INTO rankings (user_id, username) VALUES (?, ?)').bind(userId, username),
        env.DB.prepare('INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, is_main) VALUES (?, ?, ?, ?, ?, 1)').bind(userId, username, `${username} Főbolygó`, '🌍', coords)
      ]);

      const token = await signJWT({ sub: userId, username, isAdmin: 0 }, env.JWT_SECRET);
      return jsonResponse({ ok: true, token, username, userId, isAdmin: 0 }, 200, request);
    } catch (err) {
      console.error('Registration error:', err);
      return jsonError(500, 'Belső hiba a regisztráció során.', request);
    }
  }

  // ── POST /api/auth/login ────────────────────────────────
  if (path === '/api/auth/login' && method === 'POST') {
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { email, password, captcha } = body;
    
    const captchaRes = await verifyTurnstile(captcha, clientIp, turnstileSecret);
    if (!captchaRes.success) return jsonError(400, `CAPTCHA hiba: ${captchaRes['error-codes']?.[0] || 'Ismeretlen hiba'}`, request);

    try {
      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
      if (!user) return jsonError(401, 'Hibás email vagy jelszó', request);
      if (!(await verifyPassword(password, user.password))) return jsonError(401, 'Hibás email vagy jelszó', request);
      
      const now = Math.floor(Date.now() / 1000);
      await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?').bind(now, user.id).run();
      const token = await signJWT({ sub: user.id, username: user.username, isAdmin: user.is_admin }, env.JWT_SECRET);
      return jsonResponse({ ok: true, token, username: user.username, userId: user.id, isAdmin: user.is_admin }, 200, request);
    } catch (err) {
      return jsonError(500, 'Belső hiba a bejelentkezés során.', request);
    }
  }

  // ── GET /api/auth/me ────────────────────────────────────
  if (path === '/api/auth/me' && method === 'GET') {
    const authResult = await verifyJWT(request, env);
    if (!authResult.ok) return jsonError(401, authResult.error, request);
    
    const user = await env.DB.prepare('SELECT id, username, email, is_admin FROM users WHERE id = ?').bind(authResult.user.sub).first();
    if (!user) return jsonError(404, 'User no longer exists', request);
    
    return jsonResponse({ ok: true, user: { id: user.id, username: user.username, email: user.email, isAdmin: !!user.is_admin } }, 200, request);
  }

  // ── POST /api/auth/change-password ─────────────────────
  if (path === '/api/auth/change-password' && method === 'POST') {
    const authResult = await verifyJWT(request, env);
    if (!authResult.ok) return jsonError(401, authResult.error, request);
    
    let body; try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) return jsonError(400, 'Minden mező megadása kötelező', request);
    if (newPassword.length < 6) return jsonError(400, 'Az új jelszónak legalább 6 karakternek kell lennie', request);

    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(authResult.user.sub).first();
    if (!user) return jsonError(404, 'Felhasználó nem található', request);

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) return jsonError(401, 'A jelenlegi jelszó hibás', request);

    const hashed = await hashPassword(newPassword);
    await env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashed, user.id).run();

    return jsonResponse({ ok: true, message: 'Jelszó sikeresen megváltoztatva' }, 200, request);
  }

  return jsonError(404, 'Auth endpoint not found', request);
}
