# AIKA World v2.7.2 — Full-Stack Cloudflare Workers + Vue 3 + D1 (STABLE)

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Key Improvements (v2.7.2)
- **🔐 Password Management**: Users can now securely change their passwords from the Profile view.
- **🛠️ Backend Stability**: Resolved 500 Internal Server Errors by fixing missing data bindings in the game state engine.
- **🚀 Instant Mission Resolution**: Fleets are resolved in real-time as you play.
- **⚔️ Advanced Combat Engine**: Redesigned battle simulator with non-linear damage.
...
## Changelog

### v2.7.2 (Stablity & Security)
- **Fix**: Resolved 500 errors on `/api/game/state` and `/api/game/sync` by correctly fetching usernames and ensuring robust state hydration.
- **API**: Re-implemented the missing `GET /api/game/queue` endpoint.
- **Security**: Added `POST /api/auth/change-password` and a new UI section in `ProfileView` for account management.

### v2.7.1
- **Hotfix**: Legacy password hash support.
...
