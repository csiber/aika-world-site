const BASE = '/api';

function getToken() { return localStorage.getItem('aika_token'); }

async function request(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
  const res = await fetch(`${BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  register: (username, email, password, tsToken) => request('POST', '/auth/register', { username, email, password, tsToken }, false),
  login: (email, password, tsToken) => request('POST', '/auth/login', { email, password, tsToken }, false),
  me: () => request('GET', '/auth/me'),

  // Game
  getState: () => request('GET', '/game/state'),
  syncState: () => request('POST', '/game/sync'),
  switchPlanet: (planetId) => request('POST', '/game/planet/switch', { planetId }),
  upgradeBuilding: (buildingId) => request('POST', '/game/upgrade', { buildingId }),
  startResearch: (researchId) => request('POST', '/game/research', { researchId }),
  buildFleet: (shipId, amount) => request('POST', '/game/fleet/build', { shipId, amount }),
  buildDefense: (defenseId, amount) => request('POST', '/game/defense/build', { defenseId, amount }),
  getQueue: () => request('GET', '/game/queue'),
  renamePlanet: (planetId, name, emoji) => request('POST', '/game/planet/rename', { planetId, name, emoji }),

  // Rankings
  getRankings: (page = 1) => request('GET', `/rankings?page=${page}`),

  // Messages
  getMessages: () => request('GET', '/messages'),
  markRead: (id) => request('POST', `/messages/${id}/read`),
  deleteMessage: (id) => request('DELETE', `/messages/${id}`),

  // Galaxy & Missions
  getGalaxy: () => request('GET', '/galaxy'),
  getMissions: () => request('GET', '/missions'),
  getMissionReport: (mid) => request('GET', `/missions/report/${mid}`),
  recallMission: (mid) => request('POST', `/missions/recall/${mid}`),
  resolveMissions: () => request('POST', '/missions/resolve'),
  spy: (targetUserId, targetCoords, targetName, ships) => request('POST', '/missions/spy', { targetUserId, targetCoords, targetName, ships }),
  attack: (targetUserId, targetCoords, targetName, ships) => request('POST', '/missions/attack', { targetUserId, targetCoords, targetName, ships }),
  colonize: (targetCoords, targetName) => request('POST', '/missions/colonize', { targetCoords, targetName }),

  // Alliance
  getAlliances: () => request('GET', '/alliance/list'),
  getMyAlliance: () => request('GET', '/alliance/my'),
  getAllianceChat: () => request('GET', '/alliance/chat'),
  createAlliance: (name, tag, description) => request('POST', '/alliance/create', { name, tag, description }),
  inviteToAlliance: (targetUsername) => request('POST', '/alliance/invite', { targetUsername }),
  joinAlliance: (id) => request('POST', `/alliance/join/${id}`),
  leaveAlliance: () => request('POST', '/alliance/leave'),
  kickFromAlliance: (targetUserId) => request('POST', '/alliance/kick', { targetUserId }),
  sendAllianceChat: (message) => request('POST', '/alliance/chat', { message }),
  promoteAllianceMember: (targetUserId, role) => request('POST', '/alliance/promote', { targetUserId, role }),

  // Profile
  getMyProfile: () => request('GET', '/profile/me'),
  getProfile: (username) => request('GET', `/profile/${username}`),
};
