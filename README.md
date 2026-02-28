# AIKA World v2.2.0 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.2.0)
- **🤖 NPC Bot Players**: 25 AI opponents (Elite/Advanced/Beginner tiers) populate the rankings and galaxy map. Bots grow hourly via Cloudflare Cron Triggers and retaliate when attacked.
- **⚔️ Fleet Losses in Combat**: Both attacker and defender lose ships proportionally to opponent strength. Losses appear in battle reports.
- **🪐 Colony Planets on Galaxy Map**: Colonized planets appear as separate entries on the galaxy map.
- **🎁 Daily Login Bonus**: First login each day awards free resources (5,000 Metal + 2,500 Crystal + 50 Deus).
- **📊 Live Rankings**: Player scores sync to the leaderboard on every `/api/game/sync` call.
- **📱 Mobile-First Experience**: Fully redesigned responsive interface with bottom navigation.
- **⚡ PWA Integration**: Installable as a Progressive Web App with offline caching.
- **🛡️ Administration Panel**: Dedicated dashboard for admins (stats, user management, resource gifting, bot management).
- **🧠 AIKA AI Assistant**: Intelligent assistant for strategic decisions (powered by OpenRouter).
- **Real-time Resource Management**: Dynamic production and storage capping with 8h offline accumulation.
- **Advanced Building & Research**: Multi-tier tech tree with queue system.
- **Fleet Missions**: Launch spy, attack, or colonize missions across a G:S:P coordinate-based galaxy map.
- **Alliances**: Real-time chat and hierarchy (Leader/Officer/Member).
- **Security**: Cloudflare Turnstile CAPTCHA and JWT-based auth (isAdmin support).

## Tech Stack
- **Frontend**: Vue 3 (Composition API), Pinia, Vite, PWA.
- **Backend**: Cloudflare Workers (JavaScript).
- **Database**: Cloudflare D1 (SQLite).
- **Auth**: JWT + PBKDF2 Password Hashing.
- **Scheduler**: Cloudflare Cron Triggers (hourly bot simulation).
- **Styling**: Vanilla CSS (Custom properties, Modern UI aesthetic).

## Installation

### 1. Prerequisites
- Node.js 18+
- Cloudflare Account

### 2. Setup
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Database Setup
```bash
wrangler d1 execute aika-world-db --file=./db/schema.sql
wrangler d1 execute aika-world-db --file=./db/migration.sql
wrangler d1 execute aika-world-db --file=./db/migration_bots.sql
wrangler d1 execute aika-world-db --file=./db/migration_galaxy_colonies.sql
```

### 4. Secrets
```bash
wrangler secret put JWT_SECRET
wrangler secret put OPENROUTER_API_KEY
```

### 5. Promote Admin
```bash
wrangler d1 execute aika-world-db --command="UPDATE users SET is_admin = 1 WHERE username = 'YOUR_USERNAME';" --remote
```

### 6. Seed NPC Bots
```bash
# After first deploy, call once with an admin JWT:
curl -X POST https://your-domain/api/admin/bots/seed \
  -H "Authorization: Bearer <admin_token>"
```

## Changelog

### v2.2.0
- NPC bot players (25 bots, 3 tiers, hourly score growth via cron)
- Fleet losses in combat for both attacker and defender
- Colony planets visible on galaxy map
- Daily login bonus system
- Rankings sync on every game state sync

### v2.1.0
- Distance-based mission travel time
- Alliance stability improvements and reactivity fixes
- PWA and mobile UI improvements
- Comprehensive bug fixes

## License
MIT
