# AIKA World v2.2.5 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.2.5)
- **🌿 Advanced Tech Tree**: Implemented a comprehensive prerequisite system. Buildings, research, and fleet units now require specific technological levels or infrastructure to be unlocked.
- **🛡️ Prerequisite UI**: Clear visualization of missing requirements in Building, Research, and Fleet views.
- **🩹 Stability Fixes**: 
    - Resources accrue on every planet in the background.
    - Build queue correctly tracks `planet_id`.
- **🤖 Automated Mission Resolution**: Global automated processing of fleets via Cloudflare Cron Triggers.
- **🚀 Real Fleet Movement**: Dynamic ship tracking across missions and return trips.
- **🪐 Multi-planet Economy**: Independent resource and building management per planet.
...
## Changelog

### v2.2.5
- **Tech Tree**: Defined dependencies for all game items (e.g., Shipyard requires Robotics 2, Battleship requires Drive 5).
- **Backend**: Added server-side validation for prerequisites before any build or research action.
- **Frontend**: Updated `BuildingCard`, `ResearchView`, and `FleetView` to display locked states and requirement lists.

### v2.2.4
- **Bugfix**: Resources now accrue on every planet based on their last update timestamp.
...
