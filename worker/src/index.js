/**
 * AIKA WORLD — Cloudflare Worker API
 * Auth is now handled via AikaHub SDK tokens.
 */

import { handleAuth }     from './routes/auth.js';
import { handleGame }     from './routes/game.js';
import { handleRankings } from './routes/rankings.js';
import { handleMessages } from './routes/messages.js';
import { handleAikaChat } from './routes/aika.js';
import { handleMissions, resolveAllMissions } from './routes/missions.js';
import { handleAlliance } from './routes/alliance.js';
import { handleProfile }  from './routes/profile.js';
import { handleAdmin }    from './routes/admin.js';
import { handleMarket }   from './routes/market.js';
import { corsHeaders, jsonError } from './utils/response.js';
import { verifyJWT } from './utils/jwt.js';
import { simulateBots } from './utils/bots.js';
import { processWorldEvents } from './utils/events.js';

/**
 * Decode AikaHub JWT payload (base64-encoded first segment).
 * Falls back to local JWT verification for backward compatibility.
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<{ok: boolean, user?: object, error?: string}>}
 */
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, error: 'Token missing' };
  }

  const token = authHeader.split(' ')[1];
  const parts = token.split('.');

  // Try AikaHub token format first (base64-payload.signature)
  // AikaHub tokens have the user data in the first part
  if (parts.length >= 2) {
    try {
      const payload = JSON.parse(atob(parts[0]));
      if (payload && payload.userId) {
        // AikaHub token — look up the local user by email
        const email = (payload.email || '').toLowerCase().trim();
        if (email) {
          const user = await env.DB.prepare('SELECT id, username, is_admin FROM users WHERE email = ?').bind(email).first();
          if (user) {
            return { ok: true, user: { sub: user.id, username: user.username, isAdmin: user.is_admin } };
          }
        }
        // User not found locally yet — use hub data directly
        // The first API call after login may need to create the user via hub-sync
        return { ok: true, user: { sub: payload.userId, username: payload.nickname || payload.email?.split('@')[0] || 'unknown', isAdmin: (payload.role === 'admin' || payload.role === 'superadmin') ? 1 : 0 } };
      }
    } catch {
      // Not an AikaHub token format, fall through
    }
  }

  // Fallback: try legacy local JWT verification (HS256 signed by JWT_SECRET)
  return await verifyJWT(request, env);
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(simulateBots(env));
    ctx.waitUntil(resolveAllMissions(env));
    ctx.waitUntil(processWorldEvents(env));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      if (url.pathname.startsWith('/api/')) {
        // Auth routes (hub-sync only now)
        if (url.pathname.startsWith('/api/auth/')) {
          return await handleAuth(request, env, url);
        }

        // Admin (Internal auth check in route)
        if (url.pathname.startsWith('/api/admin/')) {
          return await handleAdmin(request, env, url);
        }

        // Protected Routes — authenticate via AikaHub token or legacy JWT
        const authResult = await authenticateRequest(request, env);
        if (!authResult.ok) return jsonError(401, authResult.error, request);
        const user = authResult.user;

        if (url.pathname.startsWith('/api/game'))       return await handleGame(request, env, url, user);
        if (url.pathname === '/api/rankings')           return await handleRankings(request, env, url, user);
        if (url.pathname.startsWith('/api/messages'))   return await handleMessages(request, env, url, user);
        if (url.pathname === '/api/aika-chat')          return await handleAikaChat(request, env, url, user);
        if (url.pathname.startsWith('/api/missions') || url.pathname === '/api/galaxy')
                                                        return await handleMissions(request, env, url, user);
        if (url.pathname.startsWith('/api/alliance'))   return await handleAlliance(request, env, url, user);
        if (url.pathname.startsWith('/api/profile'))    return await handleProfile(request, env, url, user);
        if (url.pathname.startsWith('/api/market'))     return await handleMarket(request, env, url, user);

        return jsonError(404, 'Not found', request);
      }

      // Static Assets Serving
      let assetResponse;
      try {
        assetResponse = await env.ASSETS.fetch(request);
      } catch (assetErr) {
        console.error('ASSETS fetch error:', assetErr);
        return new Response('Asset Storage Error', { status: 500 });
      }

      if (assetResponse && assetResponse.status !== 404) return assetResponse;

      const isStaticAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webmanifest|json)$/) || url.pathname.includes('/assets/');
      if (isStaticAsset) return assetResponse;

      try {
        return await env.ASSETS.fetch(new Request(new URL('/', request.url)));
      } catch (fallbackErr) {
        console.error('SPA fallback error:', fallbackErr);
        return new Response('Frontend Unavailable', { status: 500 });
      }
    } catch (err) {
      console.error('Worker error:', err);
      return jsonError(500, 'Internal server error', request);
    }
  },
};
