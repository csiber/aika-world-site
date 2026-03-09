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
import { handleMarket }   from './routes/market.js';
import { corsHeaders, jsonError } from './utils/response.js';
import { verifyJWT } from './utils/jwt.js';
import { simulateBots } from './utils/bots.js';
import { processWorldEvents } from './utils/events.js';

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
        if (url.pathname.startsWith('/api/market'))     return await handleMarket(request, env, url, user);

        return jsonError(404, 'Not found', request);
      }

      // Static Assets Serving
      let assetResponse;
      try {
        assetResponse = await env.ASSETS.fetch(request);
      } catch (assetErr) {
        console.error('ASSETS fetch error:', assetErr);
        // If ASSETS binding fails, try one more time or return error
        return new Response('Asset Storage Error', { status: 500 });
      }
      
      // If asset found, return it
      if (assetResponse && assetResponse.status !== 404) return assetResponse;

      // If 404 but it's a static file request (css, js, png, etc.), return the 404
      const isStaticAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webmanifest|json)$/) || url.pathname.includes('/assets/');
      if (isStaticAsset) return assetResponse;

      // Fallback to index.html for SPA routing (only for non-API, non-asset requests)
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
