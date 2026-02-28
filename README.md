# AIKA World v2.1.0 — Full-Stack Cloudflare Workers + Vue 3 + D1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.1.0)
- **📱 Mobile-First Experience**: Fully redesigned responsive interface with bottom navigation.
- **⚡ PWA Integration**: Installable as a Progressive Web App with offline caching.
- **🛡️ Administration Panel**: Dedicated dashboard for admins (stats, user management, resource gifting).
- **🤖 AIKA AI Assistant**: Intelligent assistant for strategic decisions.
- **Real-time Resource Management**: Dynamic production and storage capping.
- **Advanced Building & Research**: Multi-tier tech tree with queue system.
- **Fleet Missions**: Launch spy, attack, or colonize missions across a G:S:P coordinate-based galaxy map.
- **Alliances**: Real-time chat and hierarchy (Leader/Officer/Member).
- **Security**: Cloudflare Turnstile CAPTCHA and JWT-based auth (isAdmin support).

## Tech Stack
- **Frontend**: Vue 3 (Composition API), Pinia, Vite, PWA.
- **Backend**: Cloudflare Workers (JavaScript).
- **Database**: Cloudflare D1 (SQLite).
- **Auth**: JWT + PBKDF2 Password Hashing.
- **Styling**: Vanilla CSS (Custom properties, Modern UI aesthetic).

## Recent Bug Fixes & Improvements (v2.1.0)
- Resolved alliance loading flickers and added retry mechanisms.
- Fixed reactivity issues in client-side resource ticking.
- Implemented distance-based travel time for missions.
- Cleaned up memory leaks from background timers on component unmount.
- Improved database error handling and state synchronization.

## Installation

### 1. Prerequisites
- Node.js 18+
- Cloudflare Account

### 2. Setup
```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..
```

### 3. Database Setup
```bash
# Create database
npm run db:create

# Initialize schema and admin migration
wrangler d1 execute aika-world-db --file=./db/schema.sql
wrangler d1 execute aika-world-db --file=./db/migration.sql
```

### 4. Promote Admin
Run the following command to promote your first admin:
```bash
wrangler d1 execute aika-world-db --command="UPDATE users SET is_admin = 1 WHERE username = 'YOUR_USERNAME';"
```

## License
MIT
