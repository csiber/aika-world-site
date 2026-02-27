/**
 * AIKA COLONY — Cloudflare Worker
 * Serves the single-page game application
 */

// The HTML is inlined at build time via wrangler's __STATIC_CONTENT binding.
// For a simple deploy without KV, we import it directly.
import HTML from './index.html';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve the main app for all routes (SPA pattern)
    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  },
};
