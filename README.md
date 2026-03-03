# AIKA World v2.5.3 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.5.3)
- **🔒 Security Patch**: Fixed a critical bug in Cloudflare Turnstile CAPTCHA validation that caused login failures.
- **🎨 Light/Dark Mode**: Switch between a sleek dark theme and a new, high-contrast light theme.
- **🚛 Debris Fields & Recycling**: Harvest wreckage from battles using the new Recycler ship.
...
## Changelog

### v2.5.3
- **Security**: Patched the `verifyTurnstile` helper to correctly pass the `TURNSTILE_SECRET` environment variable, resolving 401/500 errors on login.
- **Logging**: Added detailed server-side logging for CAPTCHA verification outcomes to aid future debugging.

### v2.5.2
- **Theming**: Implemented dynamic Light/Dark mode with a UI switcher.
- **Fix**: Added the missing `/api/game/queue` endpoint.
...
