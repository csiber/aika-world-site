# AIKA World v2.3.1 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.3.1)
- **🤖 NPC Bots v2 (Active Intelligence)**: Bots are no longer just targets. They now actively monitor the galaxy and can launch spy or attack missions against human players every hour.
- **🤝 Alliance Progression**: Level up your alliance through donations to unlock passive production bonuses for all members.
- **🚀 Fleet Command Center**: Real-time mission tracking and recall functionality.
- **🌌 Massive Universe**: Explore 9 Galaxies and 499 Systems.
...
## Changelog

### v2.3.1
- **AIKA v2**: Implemented active bot AI. Bots now build fleets and launch automated missions against human players via Cloudflare Cron Triggers.
- **Bot Logic**: Added `runBotAI` utility to handle target selection, mission type randomization, and ship allocation for NPC players.
- **Missions**: Bot missions are now fully integrated into the global resolution system.

### v2.3.0
- **Alliance Overhaul**: Implemented level, exp, and vault systems.
...
