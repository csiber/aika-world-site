# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-02-28

### Added
- **PWA (Progressive Web App):** Integrated `vite-plugin-pwa` for offline caching and installation support.
- **Admin Panel:** Comprehensive dashboard for administrators including:
  - Global game statistics (users, scores, missions).
  - User management table.
  - Resource donation capability (Metal, Crystal, Deusium).
- **Admin Auth:** Added `is_admin` column to the `users` table and updated JWT claims to support administrative roles.
- **Mobile UI:**
  - Fixed bottom navigation bar for mobile devices.
  - Sticky topbar and planet selection bar.
  - Responsive single-column grid for overview and panels.
  - Responsive notification system.

### Changed
- **Navigation:** Updated GameView to dynamically show/hide the Admin tab based on user permissions.
- **Backend:** Updated worker routes to include `/api/admin/*` endpoints and strict authorization checks.

### Fixed
- **Git:** Standardized `.gitignore` to properly ignore `node_modules/` and `dist/` across the project structure.
- **UX:** Improved touch targets and layout for small mobile screens.

## [2.0.0] - Pre-release
- Initial version with Cloudflare Workers + D1 + Vue 3 architecture.
- Basic building, research, and fleet production systems.
- Galactic map and rankings.
