import { jsonResponse, jsonError } from '../utils/response.js';
import { verifyJWT } from '../utils/jwt.js';
import { seedBots, simulateBots, listBots } from '../utils/bots.js';

export async function handleAdmin(request, env, url) {
  const authResult = await verifyJWT(request, env);
  if (!authResult.ok) return jsonError(401, authResult.error, request);
  
  // Strict admin check
  if (!authResult.user.isAdmin) {
    return jsonError(403, 'Hozzáférés megtagadva: Admin jogosultság szükséges.', request);
  }

  const path = url.pathname;
  const method = request.method;

  // GET /api/admin/stats - Global game stats
  if (path === '/api/admin/stats' && method === 'GET') {
    try {
      const { results: users } = await env.DB.prepare('SELECT COUNT(*) as count FROM users').all();
      const { results: scores } = await env.DB.prepare('SELECT SUM(score) as sum FROM game_state').all();
      const { results: missions } = await env.DB.prepare('SELECT COUNT(*) as count FROM fleet_missions WHERE status = "travelling"').all();
      
      return jsonResponse({
        ok: true,
        stats: {
          users: users[0].count,
          totalScore: scores[0].sum || 0,
          activeMissions: missions[0].count
        }
      }, 200, request);
    } catch (err) {
      console.error('Admin stats error:', err);
      return jsonError(500, 'Hiba a statisztikák lekérésekor', request);
    }
  }

  // GET /api/admin/licenses - Mock for compatibility
  if (path === '/api/admin/licenses' && method === 'GET') {
    return jsonResponse({ ok: true, licenses: [] }, 200, request);
  }

  // GET /api/admin/plugins - Mock for compatibility
  if (path === '/api/admin/plugins' && method === 'GET') {
    return jsonResponse({ ok: true, plugins: [] }, 200, request);
  }

  // GET /api/admin/tickets - Mock for compatibility
  if (path === '/api/admin/tickets' && method === 'GET') {
    return jsonResponse({ ok: true, tickets: [] }, 200, request);
  }

  // GET /api/admin/emails - Mock for compatibility
  if (path === '/api/admin/emails' && method === 'GET') {
    return jsonResponse({ ok: true, emails: [] }, 200, request);
  }

  // GET /api/admin/activity - Mock for compatibility
  if (path === '/api/admin/activity' && method === 'GET') {
    return jsonResponse({ ok: true, activity: [] }, 200, request);
  }

  // GET /api/admin/users - List users with basic info
  if (path === '/api/admin/users' && method === 'GET') {
    const users = await env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.is_admin, u.created_at, g.score 
      FROM users u
      LEFT JOIN game_state g ON u.id = g.user_id
      ORDER BY u.created_at DESC
      LIMIT 100
    `).all();
    return jsonResponse({ ok: true, users: users.results }, 200, request);
  }

  // POST /api/admin/update-resources - Give resources to a user (planet-aware)
  if (path === '/api/admin/update-resources' && method === 'POST') {
    const { targetUserId, metal = 0, crystal = 0, deus = 0 } = await request.json();
    
    // Find user's active planet
    const gs = await env.DB.prepare('SELECT active_planet_id FROM game_state WHERE user_id = ?').bind(targetUserId).first();
    if (!gs) return jsonError(404, 'User not found', request);
    
    const planet = await env.DB.prepare('SELECT * FROM planets WHERE id = ?').bind(gs.active_planet_id).first();
    if (!planet) return jsonError(404, 'Planet not found', request);
    
    const res = JSON.parse(planet.resources);
    res.metal += metal;
    res.crystal += crystal;
    res.deus += deus;
    
    await env.DB.prepare('UPDATE planets SET resources = ? WHERE id = ?')
      .bind(JSON.stringify(res), planet.id)
      .run();
      
    return jsonResponse({ ok: true, message: 'Resources updated on active planet' }, 200, request);
  }

  // Bot routes
  if (path === '/api/admin/bots/seed' && method === 'POST') {
    const result = await seedBots(env);
    return jsonResponse({ ok: true, ...result }, 200, request);
  }
  if (path === '/api/admin/bots/simulate' && method === 'POST') {
    const result = await simulateBots(env);
    return jsonResponse({ ok: true, ...result }, 200, request);
  }
  if (path === '/api/admin/bots/list' && method === 'GET') {
    const bots = await listBots(env);
    return jsonResponse({ ok: true, bots }, 200, request);
  }

  return jsonError(404, 'Admin endpoint not found', request);
}
