# AIKA World v2.9.3 — Full-Stack Cloudflare Workers + Vue 3 + D1 (STABLE)

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Key Improvements (v2.9.3)
- **🔐 Auth Stability**: Fixed critical login and registration issues by synchronizing Cloudflare Turnstile sitekeys across all views and correcting the server-side verification secret.
- **🔍 SEO & Social Ready**: Enhanced search engine optimization with professional meta tags and CINEMATIC OpenGraph support.
- **🎨 Design Polish**: Subtle, high-tech UI with refined borders and better background integration.
- **⚔️ Alliance Wars**: Declare war on rival alliances and track scores in real-time.

...
## Changelog

### v2.9.3 (Auth Fix)
- **Fix**: Synchronized Turnstile sitekeys in `LoginView` and `RegisterView`.
- **Fix**: Corrected `TURNSTILE_SECRET` in `wrangler.toml` to prevent 500 errors during authentication.

### v2.9.2
- **SEO**: Meta tags and social media optimization.
...
