/**
 * AIKA COLONY — Cloudflare Worker API
 * Routes: /api/auth/*, /api/game/*, /api/rankings
 */

import { handleAuth } from './routes/auth.js';
import { handleGame } from './routes/game.js';
import { handleRankings } from './routes/rankings.js';
import { corsHeaders, jsonError } from './utils/response.js';
import { verifyJWT } from './utils/jwt.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      // API routes
      if (url.pathname.startsWith('/api/')) {
        // Public auth routes
        if (url.pathname.startsWith('/api/auth/')) {
          return await handleAuth(request, env, url);
        }

        // Protected routes — require JWT
        const authResult = await verifyJWT(request, env);
        if (!authResult.ok) {
          return jsonError(401, authResult.error, request);
        }
        const user = authResult.user;

        if (url.pathname.startsWith('/api/game')) {
          return await handleGame(request, env, url, user);
        }

        if (url.pathname === '/api/rankings') {
          return await handleRankings(request, env, url, user);
        }

        return jsonError(404, 'Not found', request);
      }

      // Serve the Vue SPA for all non-API routes
      const html = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
      return new Response(html.body, {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return jsonError(500, 'Internal server error', request);
    }
  },
};
