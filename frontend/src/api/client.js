const BASE = '/api';

function getToken() { return localStorage.getItem('aika_token'); }

async function request(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${getToken()}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(BASE + path, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
}

export const api = {
  post: (path, body) => request('POST', path, body),
  get: (path) => request('GET', path),

  // Auth
  login: (email, password, captcha) => request('POST', '/auth/login', { email, password, captcha }, false),
  register: (username, email, password, captcha) => request('POST', '/auth/register', { username, email, password, captcha }, false),
  getMe: () => request('GET', '/auth/me'),

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

  // Missions
  getGalaxy: (galaxy = 1, system = 1) => request('GET', `/galaxy?galaxy=${galaxy}&system=${system}`),
  spy: (targetUserId, targetCoords, targetName, ships) => request('POST', '/missions/spy', { targetUserId, targetCoords, targetName, ships }),
  attack: (targetUserId, targetCoords, targetName, ships) => request('POST', '/missions/attack', { targetUserId, targetCoords, targetName, ships }),
  harvest: (targetCoords, targetName, ships) => request('POST', '/missions/harvest', { targetCoords, targetName, ships }),
  colonize: (targetCoords, targetName) => request('POST', '/missions/colonize', { targetCoords, targetName }),
  getMissions: () => request('GET', '/missions'),
  getMissionReport: (mid) => request('GET', `/missions/report/${mid}`),
  recallMission: (mid) => request('POST', `/missions/recall/${mid}`),
  resolveMissions: () => request('POST', '/missions/resolve'),

  // Rankings
  getRankings: (page = 1) => request('GET', `/rankings?page=${page}`),

  // Messages
  getMessages: () => request('GET', '/messages'),
  markRead: (id) => request('POST', `/messages/read/${id}`),
  deleteMessage: (id) => request('DELETE', `/messages/${id}`),

  // Alliance
  getAlliances: () => request('GET', '/alliance/list'),
  getMyAlliance: () => request('GET', '/alliance/my'),
  createAlliance: (name, tag, description) => request('POST', '/alliance/create', { name, tag, description }),
  inviteToAlliance: (targetUsername) => request('POST', '/alliance/invite', { targetUsername }),
  joinAlliance: (allianceId) => request('POST', `/alliance/join/${allianceId}`),
  leaveAlliance: () => request('POST', '/alliance/leave'),
  kickAllianceMember: (targetUserId) => request('POST', '/alliance/kick', { targetUserId }),
  promoteAllianceMember: (targetUserId, role) => request('POST', '/alliance/promote', { targetUserId, role }),

  // Profile
  getMyProfile: () => request('GET', '/profile/me'),
  getProfile: (username) => request('GET', `/profile/${username}`),
};
