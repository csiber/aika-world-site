# AIKA World v2.7.1 — Full-Stack Cloudflare Workers + Vue 3 + D1 (STABLE)

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Key Improvements (v2.7.1)
- **🔐 Auth Hotfix**: Restored backward compatibility for older password hashing formats, resolving 401 Unauthorized issues for existing accounts.
- **🚀 Instant Mission Resolution**: Fleets are now resolved in real-time during any game interaction.
- **⚔️ Advanced Combat Engine**: Non-linear damage distribution and improved tech bonuses.
- **🎨 UI Stability**: Fixed the Topbar layout using CSS Grid.
...
## Changelog

### v2.7.1 (Hotfix)
- **Security**: Updated `verifyPassword` to support both `pbkdf2:hex` and `base64` hash formats, ensuring existing users can log in after the v2.6.3 logic update.

### v2.7.0 (Stable Milestone)
- **Backend Refactor**: Standalone combat and mission resolution modules.
- **Real-time**: Implemented active mission resolution on every state fetch.
...
