# AIKA World v2.1

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Features (v2.1)
- **Real-time Resource Management**: Dynamic production and storage capping.
- **Advanced Building & Research**: Progress through a multi-tier tech tree.
- **Fleet Missions**: Launch spy, attack, or colonize missions across a coordinate-based galaxy map.
- **Strategic Combat**: Research-aware combat calculations and cargo-limited looting.
- **Alliances**: Create or join alliances with real-time chat and hierarchy (Leader/Officer/Member).
- **AIKA AI**: An intelligent assistant providing game insights.
- **Bot Mode**: Optional automation for buildings, research, and fleet production.
- **Multi-language**: Full support for English and Hungarian.
- **Security**: Cloudflare Turnstile CAPTCHA and secure JWT-based authentication.

## Tech Stack
- **Frontend**: Vue 3 (Composition API), Pinia (State Management), Vite.
- **Backend**: Cloudflare Workers (JavaScript).
- **Database**: Cloudflare D1 (SQLite).
- **Auth**: JWT + PBKDF2 Password Hashing.
- **Styling**: Vanilla CSS (Custom properties, Modern UI aesthetic).

## Recent Bug Fixes (v2.1)
- Resolved alliance loading flickers and added retry mechanisms.
- Fixed reactivity issues in client-side resource ticking.
- Implemented distance-based travel time for missions (G:S:P coordinates).
- Cleaned up memory leaks from background timers on component unmount.
- Improved database error handling and state synchronization.

## Development
```bash
# Install dependencies
npm install
cd frontend && npm install

# Run locally
npm run dev:worker
npm run dev:frontend

# Database migration
npm run db:migrate
```

## Deployment
```bash
npm run deploy
```
