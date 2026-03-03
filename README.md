# AIKA World v2.2.4 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.2.4)
- **🩹 Critical Bugfixes**: 
    - Fixed resource production to run on all planets in the background.
    - Fixed build queue to correctly assign finished items to their respective planets using `planet_id`.
- **🤖 Automated Mission Resolution**: Cloudflare Worker Cron Triggers now automatically process all arriving and returning fleets for all players every hour.
- **🚀 Real Fleet Movement**: Ships are physically moved between planets. Launching a mission subtracts units from the origin, and survivors return after resolution.
- **🛰️ Mission Control**: Dashboard on Overview to track active fleets, their status, and arrival times.
- **🪐 Multi-planet Economy**: Resources, buildings, and fleets are stored per planet.
...
## Changelog

### v2.2.4
- **Bugfix**: Resources now accrue on every planet based on their last update timestamp, regardless of which planet is currently active.
- **Bugfix**: Added `planet_id` to `build_queue` to ensure buildings and ships are delivered to the correct planet even if the user switches planets during production.
- **Backend**: Refactored `handleGame` to process state for the entire empire (all planets) in one cycle.

### v2.2.3
- **Automation**: Refactored mission resolution logic to support global automated processing via scheduled events.
...
