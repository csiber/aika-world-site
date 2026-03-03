# AIKA World v2.2.3 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.2.3)
- **🤖 Automated Mission Resolution**: Cloudflare Worker Cron Triggers now automatically process all arriving and returning fleets for all players every hour (no manual refresh needed).
- **🚀 Real Fleet Movement**: Ships are physically moved between planets. Launching a mission subtracts units from the origin, and survivors return after resolution.
- **🛰️ Mission Control**: Dashboard on Overview to track active fleets, their status, and arrival times.
- **⚙️ Fleet Selection UI**: Detailed ship selection for spy and attack missions.
- **🪐 Multi-planet Economy**: Resources, buildings, and fleets are stored per planet.
- **🗺️ Roadmap (todo.md)**: Structured development phases.
...
## Changelog

### v2.2.3
- **Automation**: Refactored mission resolution logic to support global automated processing via scheduled events.
- **Scheduled Handler**: Integrated `resolveAllMissions` into the Cloudflare Worker cron job.
- **Bugfixes**: Improved planet creation logic for successful colonizations.

### v2.2.2
- **Real Fleet Movement**: Implemented unit tracking for missions, return trips, and loot transportation.
...
