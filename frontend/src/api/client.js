/**
 * Typed API client — wraps fetch with auth headers + error handling
 */

const BASE = '/api';

function getToken() {
  return localStorage.getItem('aika_token');
}

async function request(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  register: (username, email, password) =>
    request('POST', '/auth/register', { username, email, password }, false),
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }, false),
  me: () => request('GET', '/auth/me'),

  // Game
  getState: () => request('GET', '/game/state'),
  syncState: () => request('POST', '/game/sync'),
  upgradeBuilding: (buildingId) => request('POST', '/game/upgrade', { buildingId }),
  startResearch: (researchId) => request('POST', '/game/research', { researchId }),
  buildFleet: (shipId, amount) => request('POST', '/game/fleet/build', { shipId, amount }),
  getQueue: () => request('GET', '/game/queue'),

  // Rankings
  getRankings: (page = 1) => request('GET', `/rankings?page=${page}`),
};
