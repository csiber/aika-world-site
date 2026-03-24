/**
 * AIKA World — API Client
 * Uses AikaHub SDK for authentication (Bearer token).
 */
import sdk from '@/sdk.js';

const BASE = '/api';

function getToken() { return sdk.getToken(); }

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(BASE + path, options);

  // If 401, SDK handles redirect to AikaHub login
  if (res.status === 401) {
    sdk.logout();
    return new Promise(() => {}); // never resolves, page navigates away
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
}

export const api = {
  post: (path, body) => request('POST', path, body),
  get: (path) => request('GET', path),

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
  specializePlanet: (planetId, specialization) => request('POST', '/game/specialize', { planetId, specialization }),

  // Missions
  getGalaxy: (galaxy = 1, system = 1) => request('GET', `/galaxy?galaxy=${galaxy}&system=${system}`),
  spy: (targetUserId, targetCoords, targetName, ships) => request('POST', '/missions/spy', { targetUserId, targetCoords, targetName, ships }),
  attack: (targetUserId, targetCoords, targetName, ships) => request('POST', '/missions/attack', { targetUserId, targetCoords, targetName, ships }),
  harvest: (targetCoords, targetName, ships) => request('POST', '/missions/harvest', { targetCoords, targetName, ships }),
  expedition: (targetCoords, ships) => request('POST', '/missions/expedition', { targetCoords, ships }),
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

  // Alliance Wars v2
  declareWar: (targetAllianceId) => request('POST', '/alliance/war/declare', { targetAllianceId }),
  getActiveWars: () => request('GET', '/alliance/war/active'),
  getWarHistory: () => request('GET', '/alliance/war/history'),
  getWarStats: (warId) => request('GET', `/alliance/war/${warId}/stats`),
  surrenderWar: (warId) => request('POST', `/alliance/war/${warId}/surrender`),

  // Profile
  getMyProfile: () => request('GET', '/profile/me'),
  getProfile: (username) => request('GET', `/profile/${username}`),

  // Tactical Battles
  getTacticalBattle: (battleId) => request('GET', `/game/tactical/${battleId}`),
  submitFormation: (battleId, formation) => request('POST', `/game/tactical/${battleId}/formation`, { formation }),
  submitOrders: (battleId, orders) => request('POST', `/game/tactical/${battleId}/orders`, { orders }),
  advanceRound: (battleId) => request('POST', `/game/tactical/${battleId}/advance`),
  autoResolveBattle: (battleId) => request('POST', `/game/tactical/${battleId}/auto-resolve`),

  // Sector Control
  getTerritoryMap: (galaxy) => request('GET', `/territory/map?galaxy=${galaxy}`),
  getAllianceTerritory: () => request('GET', '/territory/alliance'),

  // Fleet Intercept & Phalanx
  getFleetMovements: (galaxy, system) => request('GET', `/game/fleet-movements?galaxy=${galaxy}&system=${system}`),
  scanPhalanx: (galaxy, system) => request('POST', '/game/phalanx/scan', { galaxy, system }),
  interceptFleet: (missionId, ships) => request('POST', `/game/fleet-intercept/${missionId}`, { ships }),

  // Activity Timeline
  getTimeline: (limit = 50) => request('GET', `/game/timeline?limit=${limit}`),
  markTimelineRead: () => request('POST', '/game/timeline/read'),

  // Quests
  getQuests: () => request('GET', '/api/quests'),
  claimQuest: (questId) => request('POST', `/api/quests/claim/${questId}`),

  // Expeditions
  submitExpeditionChoice: (missionId, choice) => request('POST', `/api/expeditions/${missionId}/choose`, { choice }),
  getExpeditionHistory: () => request('GET', '/api/expeditions/history'),

  // Dark Matter Shop
  getShopItems: () => request('GET', '/shop'),
  buyShopItem: (itemKey) => request('POST', '/shop/buy', { itemKey }),

  // Seasonal Events
  getActiveEvent: () => request('GET', '/events/active'),

  // Notifications
  getNotifications: () => request('GET', '/notifications'),
  markNotificationsRead: () => request('POST', '/notifications/read'),
  markNotificationRead: (id) => request('POST', `/notifications/read/${id}`),
  subscribeNotifications: (sub) => request('POST', '/notifications/subscribe', sub),

  // Diplomacy
  proposeTreaty: (targetAllianceId, type) => request('POST', '/diplomacy/propose', { targetAllianceId, type }),
  acceptTreaty: (id) => request('POST', `/diplomacy/${id}/accept`),
  declineTreaty: (id) => request('POST', `/diplomacy/${id}/decline`),
  cancelTreaty: (id) => request('POST', `/diplomacy/${id}/cancel`),
  getActiveTreaties: () => request('GET', '/diplomacy/active'),
  getPendingTreaties: () => request('GET', '/diplomacy/pending'),

  // Alliance Structures
  getAllianceStructures: () => request('GET', '/alliance/structures'),
  buildStructure: (type) => request('POST', '/alliance/structures/build', { type }),
  contributeToStructure: (structureId, metal, crystal, deus) => request('POST', '/alliance/structures/contribute', { structureId, metal, crystal, deus }),
  getStructureContributions: (id) => request('GET', `/alliance/structures/${id}/contributions`),

  // Alliance Donate
  donateAlliance: (metal, crystal, deus) => request('POST', '/alliance/donate', { metal, crystal, deus }),

  // Market
  getMarketOffers: () => request('GET', '/market/list'),
  createMarketOffer: (offerRes, offerAmt, seekRes, seekAmt, planetId) => request('POST', '/market/create', { offerRes, offerAmt, seekRes, seekAmt, planetId }),
  acceptMarketOffer: (offerId, planetId) => request('POST', `/market/accept/${offerId}`, { planetId }),
  cancelMarketOffer: (offerId) => request('POST', `/market/cancel/${offerId}`),
  npcTrade: (giveRes, giveAmt, getRes, planetId) => request('POST', '/market/npc-trade', { giveRes, giveAmt, getRes, planetId }),
};
