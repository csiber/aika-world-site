import { getToken } from './storage.js';
import { decodeToken } from './auth.js';

/**
 * Auto-register this app with AikaHub (admin) or send heartbeat (any user).
 * Fire-and-forget.
 * @param {import('./types.js').AikaAppConfig} config
 * @param {string} hubUrl
 */
export function autoRegister(config, hubUrl) {
  try {
    const token = getToken();
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload) return;

    const isAdmin = payload.role === 'admin' || payload.role === 'superadmin';

    if (isAdmin) {
      // Full registration (upserts all metadata)
      fetch(`${hubUrl}/api/admin/projects/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: config.key,
          title: config.title,
          url: window.location.origin,
          desc: config.description,
          icon: config.icon || null,
          theme: config.theme || null,
          access_type: config.access_type || 'free',
          version: config.version || null,
          admin_panel: config.adminPanel || null,
        }),
      }).catch(() => {});
    } else {
      // Heartbeat only (updates last_seen)
      fetch(`${hubUrl}/api/site/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: config.key }),
      }).catch(() => {});
    }
  } catch {
    // silent — registration is best-effort
  }
}
