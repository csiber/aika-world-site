/**
 * AIKA WORLD — Cloudflare Worker API
 */

import { handleAuth }     from './routes/auth.js';
import { handleGame }     from './routes/game.js';
import { handleRankings } from './routes/rankings.js';
import { handleMessages } from './routes/messages.js';
import { handleAikaChat } from './routes/aika.js';
import { handleMissions } from './routes/missions.js';
import { handleAlliance } from './routes/alliance.js';
import { handleProfile }  from './routes/profile.js';
import { corsHeaders, jsonError } from './utils/response.js';
import { verifyJWT } from './utils/jwt.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      if (url.pathname.startsWith('/api/')) {
        if (url.pathname.startsWith('/api/auth/')) {
          return await handleAuth(request, env, url);
        }

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

      const html = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
      return new Response(html.body, {
        headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return jsonError(500, 'Internal server error', request);
    }
  },
};
