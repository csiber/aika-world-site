/**
 * AIKA WORLD — Cloudflare Worker API
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
import { corsHeaders, jsonError } from './utils/response.js';
import { verifyJWT } from './utils/jwt.js';
import { simulateBots } from './utils/bots.js';

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(simulateBots(env));
    ctx.waitUntil(resolveAllMissions(env));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      if (url.pathname.startsWith('/api/')) {
        // Public / Special Auth
        if (url.pathname.startsWith('/api/auth/')) {
          return await handleAuth(request, env, url);
        }

        // Admin (Internal auth check in route)
        if (url.pathname.startsWith('/api/admin/')) {
          return await handleAdmin(request, env, url);
        }

        // Protected Routes
        const authResult = await verifyJWT(request, env);
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

        return jsonError(404, 'Not found', request);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) return assetResponse;
      return await env.ASSETS.fetch(new Request(new URL('/', request.url)));
    } catch (err) {
      console.error('Worker error:', err);
      return jsonError(500, 'Internal server error', request);
    }
  },
};
