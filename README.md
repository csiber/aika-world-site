# AIKA World v2.5.0 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.5.0)
- **🚛 Debris Fields & Recycling**: Battles now leave behind ship wreckage. Deploy the new **Recycler** ships to harvest these resources from the Galaxy Map.
- **🎯 Daily Quests**: Randomized daily objectives with significant resource rewards.
- **🪐 3D Planet Visualization**: Immersive rotating planet spheres in the Overview dashboard.
- **🤝 Alliance Progression**: Level up your alliance to gain global production bonuses for all members.
...
## Changelog

### v2.5.0
- **Recycling System**: Added `debris_metal` and `debris_crystal` columns to the galaxy map.
- **Combat Update**: Destroyed ships now contribute 30% of their cost to a debris field at the combat coordinates.
- **New Ship**: Added **Recycler** unit with large cargo capacity specifically designed for harvesting.
- **Harvest Mission**: Implemented backend logic for debris collection and transportation back to origin.
- **UI**: Added debris visualization and harvest triggers to the Galaxy View.

### v2.4.0
- **Security**: Added robust validation to all game endpoints.
...
