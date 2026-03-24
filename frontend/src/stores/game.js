import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';
import { useLangStore } from '@/stores/lang.js';
import { audio } from '@/utils/botAudio.js';
import { sfx } from '@/audio/sounds.js';

export const useGameStore = defineStore('game', () => {
  const state   = ref(null);
  const queue   = ref([]);
  const storage = ref({ metal: 50000, crystal: 25000, energy: 999999, deus: 5000 });
  const loading = ref(false);
  const error   = ref(null);
  const notifications = ref([]);
  const serverTimeOffset = ref(0);
  const activeBattle = ref(null);
  const sectorClaims = ref([]);
  const fleetSightings = ref([]);
  const activityTimeline = ref([]);
  const unreadTimelineCount = ref(0);
  const lastTimelineRead = ref(0);

  // ── Computed ──────────────────────────────────────────────
  const activePlanet = computed(() => state.value?.activePlanet || {});
  const resources    = computed(() => activePlanet.value.resources || {});
  const rates        = computed(() => activePlanet.value.rates || {});
  const buildings    = computed(() => activePlanet.value.buildings || []);
  const fleet        = computed(() => activePlanet.value.fleet     || []);
  const defense      = computed(() => activePlanet.value.defense   || []);
  
  const research     = computed(() => state.value?.research    || []);
  const planets      = computed(() => state.value?.planets     || []);
  const score        = computed(() => state.value?.score       || 0);
  const darkMatter   = computed(() => state.value?.dark_matter || 0);

  const prodBuildings  = computed(() => buildings.value.filter(b => b.type === 'production'));
  const infraBuildings = computed(() => buildings.value.filter(b => b.type === 'infra'));

  const storageFill = computed(() => ({
    metal:   Math.min(100, Math.floor((resources.value.metal   || 0) / (storage.value.metal   || 1) * 100)),
    crystal: Math.min(100, Math.floor((resources.value.crystal || 0) / (storage.value.crystal || 1) * 100)),
    deus:    Math.min(100, Math.floor((resources.value.deus    || 0) / (storage.value.deus    || 1) * 100)),
  }));

  const energyWarning = computed(() => {
    const eff = rates.value.energyEff;
    if (eff === undefined) return null;
    if (eff < 50) return { level: 'critical', eff };
    if (eff < 80) return { level: 'warning',  eff };
    return null;
  });

  // ── Internal Helpers ──────────────────────────────────────
  function updateFromResponse(data) {
    if (data.state) {
        // Check for new planets
        const oldPlanets = state.value?.planets?.length || 0;
        const newPlanets = data.state.planets?.length || 0;
        if (newPlanets > oldPlanets && oldPlanets > 0) {
            notify('🪐 Új bolygó csatlakozott a birodalomhoz!', 'green');
            audio.success();
        }
        state.value = data.state;
    }
    if (data.queue) queue.value = data.queue;
    if (data.storage) storage.value = data.storage;
    if (data.serverTime) {
        serverTimeOffset.value = data.serverTime - Math.floor(Date.now() / 1000);
    }
  }

  // ── Actions ───────────────────────────────────────────────
  async function loadState() {
    audio.init();
    loading.value = true;
    error.value = null;
    try {
      const data = await api.getState();
      updateFromResponse(data);
    } catch (e) { error.value = e.message; }
    finally { loading.value = false; }
  }

  async function switchPlanet(planetId) {
    loading.value = true;
    try {
      await api.switchPlanet(planetId);
      audio.click();
      await loadState();
      return true;
    } catch (e) {
      audio.error();
      notify(`❌ ${e.message}`, 'red');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function upgradeBuilding(buildingId) {
    try {
      const data = await api.upgradeBuilding(buildingId);
      updateFromResponse(data);
      audio.build();
      notify('Építkezés elindítva', 'blue');
      return true;
    } catch (e) { audio.error(); notify(`❌ ${e.message}`, 'red'); return false; }
  }

  async function startResearch(researchId) {
    try {
      const data = await api.startResearch(researchId);
      updateFromResponse(data);
      audio.build();
      notify('Kutatás elindítva', 'blue');
      return true;
    } catch (e) { audio.error(); notify(`❌ ${e.message}`, 'red'); return false; }
  }

  async function buildFleet(shipId, amount) {
    try {
      const data = await api.buildFleet(shipId, amount);
      updateFromResponse(data);
      audio.build();
      sfx.fleetLaunch();
      notify('Hajóépítés elindítva', 'blue');
      return true;
    } catch (e) { audio.error(); notify(`❌ ${e.message}`, 'red'); return false; }
  }

  async function buildDefense(defenseId, amount) {
    try {
      const data = await api.buildDefense(defenseId, amount);
      updateFromResponse(data);
      audio.build();
      notify('Védelem építése elindítva', 'blue');
      return true;
    } catch (e) { audio.error(); notify(`❌ ${e.message}`, 'red'); return false; }
  }

  async function syncResources() {
    try {
      const oldQueueIds = new Set(queue.value.map(q => q.item_id || q.id));
      const data = await api.syncState();
      updateFromResponse(data);
      const qData = await api.getQueue();
      const newQueue = qData.queue || [];
      // Detect completed queue items and play completion sound
      if (oldQueueIds.size > 0) {
        const newQueueIds = new Set(newQueue.map(q => q.item_id || q.id));
        const completed = [...oldQueueIds].filter(id => !newQueueIds.has(id));
        if (completed.length > 0) sfx.buildComplete();
      }
      queue.value = newQueue;
    } catch (e) {}
  }

  async function renamePlanet(planetId, name, emoji) {
    try {
      const data = await api.renamePlanet(planetId, name, emoji);
      if (state.value) state.value.planets = data.planets;
      audio.success();
      return true;
    } catch (e) { audio.error(); notify(`❌ ${e.message}`, 'red'); return false; }
  }

  function tickResources() {
    if (!state.value || !state.value.activePlanet) return;
    const r  = state.value.activePlanet.resources;
    const rt = state.value.activePlanet.rates;
    const s  = storage.value;
    state.value.activePlanet.resources = {
      ...r,
      metal:   Math.min(s.metal,   (r.metal   || 0) + (rt.metal   || 0) / 3600),
      crystal: Math.min(s.crystal, (r.crystal || 0) + (rt.crystal || 0) / 3600),
      energy:  Math.min(s.energy,  (r.energy  || 0) + (rt.energy  || 0) / 3600),
      deus:    Math.min(s.deus,    (r.deus    || 0) + (rt.deus    || 0) / 3600),
    };
  }

  let notifId = 0;
  function notify(text, type = 'blue') {
    const id = ++notifId;
    notifications.value.push({ id, text, type });
    if (type === 'green') audio.success();
    setTimeout(() => { notifications.value = notifications.value.filter(n => n.id !== id); }, 3500);
  }

  function queueItemIsActive(itemId) {
    return queue.value.some(q => q.item_id === itemId);
  }

  function getBuildCost(building) {
    const mult = Math.pow(1.5, building.level);
    return { metal: Math.floor(building.baseCost.metal * mult), crystal: Math.floor(building.baseCost.crystal * mult) };
  }

  function getResearchCost(r) {
    return { metal: Math.floor(200 * Math.pow(2, r.level)), crystal: Math.floor(400 * Math.pow(2, r.level)) };
  }

  function canAfford(cost) {
    if (!state.value || !state.value.activePlanet) return false;
    return state.value.activePlanet.resources.metal >= cost.metal && state.value.activePlanet.resources.crystal >= cost.crystal;
  }

  // ── RTS Phase 1 Actions ──────────────────────────────────
  async function loadBattle(battleId) {
    try {
      const data = await api.getTacticalBattle(battleId);
      activeBattle.value = data.battle || null;
      return data;
    } catch (e) { notify(`❌ ${e.message}`, 'red'); return null; }
  }

  async function loadTerritory(galaxy) {
    try {
      const data = await api.getTerritoryMap(galaxy);
      sectorClaims.value = data.claims || [];
      return data;
    } catch (e) { return null; }
  }

  async function loadFleetMovements(galaxy, system) {
    try {
      const data = await api.getFleetMovements(galaxy, system);
      fleetSightings.value = data.fleets || data.sightings || [];
      return data;
    } catch (e) { notify(`❌ ${e.message}`, 'red'); return null; }
  }

  async function loadTimeline(limit = 50) {
    try {
      const data = await api.getTimeline(limit);
      const oldCount = unreadTimelineCount.value;
      activityTimeline.value = data.events || [];
      unreadTimelineCount.value = data.unread_count || 0;
      lastTimelineRead.value = data.last_read || 0;

      // Browser notification for new events (if tab not focused)
      if (data.unread_count > oldCount && oldCount >= 0 && document.hidden) {
        const newest = activityTimeline.value[0];
        if (newest && Notification.permission === 'granted') {
          try {
            new Notification('Aika World', { body: newest.title, icon: '/favicon.ico' });
          } catch (_) {}
        }
      }

      return data;
    } catch (e) { return null; }
  }

  async function markTimelineRead() {
    try {
      const data = await api.markTimelineRead();
      unreadTimelineCount.value = 0;
      lastTimelineRead.value = data.last_read || Math.floor(Date.now() / 1000);
      return true;
    } catch (e) { return false; }
  }

  return {
    state, queue, storage, loading, error, notifications,
    activePlanet, resources, rates, buildings, research, fleet, defense, planets, score, darkMatter,
    prodBuildings, infraBuildings, storageFill, energyWarning,
    activeBattle, sectorClaims, fleetSightings, activityTimeline, unreadTimelineCount, lastTimelineRead,
    loadState, switchPlanet, upgradeBuilding, startResearch, buildFleet, buildDefense, syncResources, renamePlanet,
    tickResources, notify, queueItemIsActive, getBuildCost, getResearchCost, canAfford,
    loadBattle, loadTerritory, loadFleetMovements, loadTimeline, markTimelineRead,
  };
});
