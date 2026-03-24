# AIKA World v4.0.0 — The Mega Update

**AIKA World** is a real-time galactic strategy game built on Cloudflare Workers + Vue 3 + D1. The flagship game of the AIKA ecosystem.

## What's New in v4.0.0

### Gameplay
- **Daily/Weekly Quest System** — 20+ quest templates, automatic generation, progress tracking across all actions, resource + Dark Matter rewards
- **Expedition 2.0** — 10 weighted event types (black holes, alien fleets, trading caravans, wormholes), player choices with risk/reward trade-offs, 3-part chain expeditions
- **Planet Specialization** — 4 permanent types: Mining (+30% production), Military (+20% shipyard), Research (+25% tech), Trade (+15% storage)
- **Alliance Wars 2.0** — War declarations with random goals, 7-day duration, contribution tracking, coordinated attacks, surrender system
- **Diplomacy System** — NAP treaties (mutual attack block), trade agreements (-15% market fee), vassalage system, 48h cancellation cooldown
- **Space Stations** — 3 alliance mega-structures: Defense Bastion (-15% damage), Trade Hub (+20% market), Research Nexus (+10% tech speed)
- **Seasonal Events** — Monthly server-wide events: Alien Invasion, Solar Storm, Galactic Market Fair, Dark Matter Storm
- **Dark Matter Economy** — Rare meta-currency earned from quests/expeditions, cosmetic shop with skins, badges, and convenience items

### UI/UX
- **Battle Visualization** — Canvas 2D animated combat with ship formations, laser effects, explosions, and loot animations
- **Interactive Galaxy Map** — Canvas 2D orbital star map with zoom, color-coded planets, debris fields, alliance territory overlay
- **Live Fleet Movement** — Real-time animated fleet dots on the galaxy map with interpolated positions and hover tooltips
- **Procedural Audio** — Ambient space music + 12 UI sound effects (build, research, fleet, combat) via Web Audio API, zero audio files
- **Push Notifications** — In-app notification center with bell icon, unread badges, attack/build/mission alerts
- **Dark Matter Shop** — Dedicated shop view with cosmetic and convenience items

### Technical
- **Smarter Bot AI** — 3 personality types (aggressive/trader/builder), adaptive behavior, grudge system, personality-based market manipulation and messages
- **DB Normalization Phase 1** — Normalized tables created alongside JSON blobs, migration utility available via admin panel

## Key Features
- 9 galaxies with unique resource bonuses
- Real-time fleet management (spy, attack, colonize, harvest, expedition)
- Complex economy (metal, crystal, energy, deus, dark matter)
- Research tree with 10 technologies
- Moon system with Phalanx and Jump Gates
- Alliance system with wars, diplomacy, and mega-structures
- 25 NPC bots with adaptive AI personalities
- PWA support (installable on mobile/desktop)
- Bilingual UI (English / Hungarian)

## Tech Stack
- **Backend**: Cloudflare Workers (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vue 3 (Vite, Pinia, Canvas 2D)
- **Audio**: Web Audio API (procedural synthesis)
- **Storage**: Cloudflare Workers Assets

## Development

```bash
npm run dev:worker      # Local worker + D1
npm run dev:frontend    # Local Vite dev server
npm run build           # Build Vue SPA
npm run deploy          # Build + deploy to Cloudflare
```

## Database Migrations (v4.0.0)

Run these after deploying:
```bash
wrangler d1 execute aika-world-db --file=db/migration_quests_v2.sql
wrangler d1 execute aika-world-db --file=db/migration_expeditions.sql
wrangler d1 execute aika-world-db --file=db/migration_specialization.sql
wrangler d1 execute aika-world-db --file=db/migration_notifications.sql
wrangler d1 execute aika-world-db --file=db/migration_alliance_wars_v2.sql
wrangler d1 execute aika-world-db --file=db/migration_diplomacy.sql
wrangler d1 execute aika-world-db --file=db/migration_structures.sql
wrangler d1 execute aika-world-db --file=db/migration_dm_shop.sql
wrangler d1 execute aika-world-db --file=db/migration_seasonal.sql
wrangler d1 execute aika-world-db --file=db/migration_normalize.sql
```

## Changelog

### v4.0.0 — The Mega Update (2026-03-24)
- 15 major features across gameplay, UI/UX, social, economy, and technical
- See "What's New" section above for full details

### v3.0.5
- Stability fix for `toLocaleString()` error
- Market UI polish

### v3.0.0 — The Strategic Update
- Moons, debris fields, recycler ships
- 9 galaxies with unique bonuses
- PWA support

---

*2026 AIKA*
