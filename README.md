# AIKA World v2.4.0 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.4.0)
- **🔒 Security Hardening**: Strict server-side validation for all inputs. Prevented negative unit construction and out-of-bounds galaxy navigation.
- **⏱️ Precise Resource Sync**: Implemented server-time offset tracking to align client-side resource ticking with the source of truth, eliminating jumping numbers.
- **🎯 Daily Quests**: Randomized daily objectives with resource rewards.
- **🪐 3D Planet Visualization**: Immersive rotating planet spheres.
...
## Changelog

### v2.4.0
- **Security**: Added robust validation to building, fleet, defense, and mission endpoints.
- **Sync Refinement**: Server now returns `serverTime` on all game endpoints; client adjusts resource accumulation based on clock drift.
- **Backend Refactoring**: Consistently use `updateFromResponse` in the frontend store to handle state updates.

### v2.3.3
- **Daily Quests**: Added daily objective system.
...
