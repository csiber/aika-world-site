import { jsonResponse, jsonError } from '../utils/response.js';
import { verifyJWT } from '../utils/jwt.js';

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
    const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const totalScore = await env.DB.prepare('SELECT SUM(score) as sum FROM game_state').first();
    const activeMissions = await env.DB.prepare('SELECT COUNT(*) as count FROM fleet_missions WHERE status = "travelling"').first();
    
    return jsonResponse({
      ok: true,
      stats: {
        users: userCount.count,
        totalScore: totalScore.sum,
        missions: activeMissions.count
      }
    }, 200, request);
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

  // POST /api/admin/update-resources - Give resources to a user
  if (path === '/api/admin/update-resources' && method === 'POST') {
    const { targetUserId, metal, crystal, deus } = await request.json();
    
    const state = await env.DB.prepare('SELECT resources FROM game_state WHERE user_id = ?').bind(targetUserId).first();
    if (!state) return jsonError(404, 'User not found', request);
    
    const res = JSON.parse(state.resources);
    if (metal) res.metal += metal;
    if (crystal) res.crystal += crystal;
    if (deus) res.deus += deus;
    
    await env.DB.prepare('UPDATE game_state SET resources = ? WHERE user_id = ?')
      .bind(JSON.stringify(res), targetUserId)
      .run();
      
    return jsonResponse({ ok: true, message: 'Resources updated' }, 200, request);
  }

  return jsonError(404, 'Admin endpoint not found', request);
}
