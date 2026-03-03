/**
 * AIKA WORLD — Auth routes (Login / Register / Me)
 * v2.5.3: Security patch for Turnstile validation
 */
import { jsonResponse, jsonError } from '../utils/response.js';
import { signJWT, hashPassword, verifyPassword } from '../utils/jwt.js';

// Helper: Validate Cloudflare Turnstile CAPTCHA token
async function verifyTurnstile(token, ip, turnstileSecret) {
  if (!token) return { success: false, error: 'CAPTCHA token hiányzik' };

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: turnstileSecret,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await res.json();
    console.log('Turnstile verification outcome:', data);
    return data;
  } catch (err) {
    console.error('Turnstile fetch error:', err);
    return { success: false, error: 'Hiba a CAPTCHA validálása közben' };
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleAuth(request, env, url) {
  const path = url.pathname;
  const method = request.method;
  const turnstileSecret = env.TURNSTILE_SECRET;
  const clientIp = request.headers.get('CF-Connecting-IP');

  // ── POST /api/auth/register ─────────────────────────────
  if (path === '/api/auth/register' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { username, email, password, captcha } = body;

    const captchaRes = await verifyTurnstile(captcha, clientIp, turnstileSecret);
    if (!captchaRes.success) {
      return jsonError(400, `CAPTCHA hiba: ${captchaRes['error-codes']?.[0] || 'Ismeretlen hiba'}`, request);
    }
    
    if (!username || !email || !password) return jsonError(400, 'Minden mező kitöltése kötelező', request);
    if (password.length < 6) return jsonError(400, 'A jelszónak legalább 6 karakter hosszúnak kell lennie', request);

    try {
      const existingUser = await env.DB.prepare('SELECT id FROM users WHERE username = ? OR email = ?').bind(username, email).first();
      if (existingUser) return jsonError(409, 'Felhasználónév vagy email cím már foglalt', request);
      
      const hashedPassword = await hashPassword(password);
      const userId = crypto.randomUUID();
      const planetId = crypto.randomUUID();
      
      const defBuildings = await env.DB.prepare('SELECT data FROM default_buildings').first();
      const defResearch  = await env.DB.prepare('SELECT data FROM default_research').first();
      const defFleet     = await env.DB.prepare('SELECT data FROM default_fleet').first();
      const defDefense   = await env.DB.prepare('SELECT data FROM default_defense').first();

      await env.DB.batch([
        env.DB.prepare('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)').bind(userId, username, email, hashedPassword),
        env.DB.prepare('INSERT INTO game_state (user_id, research, active_planet_id) VALUES (?, ?, ?)').bind(userId, defResearch.data, planetId),
        env.DB.prepare('INSERT INTO planets (id, user_id, name, emoji, coords, buildings, fleet, defense, is_main) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)').bind(planetId, userId, `${username} Főbolygó`, '🌍', '[1:1:1]', defBuildings.data, defFleet.data, defDefense.data),
        env.DB.prepare('INSERT INTO rankings (user_id, username) VALUES (?, ?)').bind(userId, username),
        env.DB.prepare('INSERT OR IGNORE INTO galaxy_map (user_id, username, planet_name, planet_emoji, coords, is_main) VALUES (?, ?, ?, ?, ?, 1)').bind(userId, username, `${username} Főbolygó`, '🌍', '[1:1:1]')
      ]);

      const token = await signJWT({ sub: userId, username, isAdmin: 0 }, env.JWT_SECRET);
      return jsonResponse({ ok: true, token, username }, 200, request);

    } catch (err) {
      console.error('Registration error:', err);
      return jsonError(500, 'Belső hiba a regisztráció során.', request);
    }
  }

  // ── POST /api/auth/login ────────────────────────────────
  if (path === '/api/auth/login' && method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return jsonError(400, 'Invalid JSON', request); }
    const { email, password, captcha } = body;
    
    const captchaRes = await verifyTurnstile(captcha, clientIp, turnstileSecret);
    if (!captchaRes.success) {
      return jsonError(400, `CAPTCHA hiba: ${captchaRes['error-codes']?.[0] || 'Ismeretlen hiba'}`, request);
    }

    if (!email || !password) return jsonError(400, 'Email és jelszó megadása kötelező', request);

    try {
      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
      if (!user) return jsonError(401, 'Hibás email vagy jelszó', request);
      
      const isMatch = await verifyPassword(password, user.password);
      if (!isMatch) return jsonError(401, 'Hibás email vagy jelszó', request);
      
      const now = Math.floor(Date.now() / 1000);
      const lastLoginDay = Math.floor(user.last_login / 86400);
      const currentDay = Math.floor(now / 86400);

      // Daily Bonus logic
      if (currentDay > lastLoginDay) {
        const activePlanet = await env.DB.prepare('SELECT id FROM planets WHERE user_id = ? AND is_main = 1').bind(user.id).first();
        if (activePlanet) {
          const bonus = { metal: 5000, crystal: 2500, deus: 50 };
          await env.DB.prepare('UPDATE planets SET resources = json_set(resources, "$.metal", json_extract(resources, "$.metal") + ?, "$.crystal", json_extract(resources, "$.crystal") + ?, "$.deus", json_extract(resources, "$.deus") + ?) WHERE id = ?')
            .bind(bonus.metal, bonus.crystal, bonus.deus, activePlanet.id).run();
          await env.DB.prepare('INSERT INTO messages (id, user_id, from_name, subject, body, msg_type) VALUES (?, ?, ?, ?, ?, ?)')
            .bind(crypto.randomUUID(), user.id, 'AIKA System', 'Napi Bónusz',
              `Üdvözlünk vissza, ${user.username}!\n\n⚙️ Fém: +${bonus.metal.toLocaleString('hu')}\n💎 Kristály: +${bonus.crystal.toLocaleString('hu')}\n🔮 Déusium: +${bonus.deus}\n\nHolnap is visszatérsz?`,
              'system').run();
        }
      }
      
      await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?').bind(now, user.id).run();
      const token = await signJWT({ sub: user.id, username: user.username, isAdmin: user.is_admin }, env.JWT_SECRET);
      return jsonResponse({ ok: true, token, username: user.username }, 200, request);

    } catch (err) {
      console.error('Login error:', err);
      return jsonError(500, 'Belső hiba a bejelentkezés során.', request);
    }
  }

  // ── GET /api/auth/me ────────────────────────────────────
  if (path === '/api/auth/me' && method === 'GET') {
    try {
      const authResult = await verifyJWT(request, env);
      if (!authResult.ok) return jsonError(401, authResult.error, request);
      return jsonResponse({ ok: true, user: authResult.user }, 200, request);
    } catch (error) {
      console.error('Me endpoint error:', error);
      return jsonError(500, 'Profil betöltése sikertelen. Kérjük, próbálja újra később.', request);
    }
  }

  return jsonError(404, 'Auth endpoint not found', request);
}
