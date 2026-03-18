import { getToken } from './storage.js';
import { decodeToken } from './auth.js';

/**
 * Auto-register this app with AikaHub.
 * Only runs if current user is admin. Fire-and-forget.
 * @param {import('./types.js').AikaAppConfig} config
 * @param {string} hubUrl
 */
export function autoRegister(config, hubUrl) {
  try {
    const token = getToken();
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) return;

    const body = {
      key: config.key,
      title: config.title,
      url: window.location.origin,
      desc: config.description,
      icon: config.icon || null,
      theme: config.theme || null,
      access_type: config.access_type || 'free',
      version: config.version || null,
      admin_panel: config.adminPanel || null,
    };

    fetch(`${hubUrl}/api/admin/projects/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).catch(() => {}); // fire-and-forget
  } catch {
    // silent — registration is best-effort
  }
}
