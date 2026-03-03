import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';
import { useLangStore } from '@/stores/lang.js';
import { audio } from '@/utils/botAudio.js';

export const useGameStore = defineStore('game', () => {
  const state   = ref(null);
  const queue   = ref([]);
  const storage = ref({ metal: 50000, crystal: 25000, energy: 999999, deus: 5000 });
  const loading = ref(false);
  const error   = ref(null);
  const notifications = ref([]);
  const serverTimeOffset = ref(0);

  // ── Computed ──────────────────────────────────────────────
  const activePlanet = computed(() => state.value?.activePlanet || {});
  const resources    = computed(() => activePlanet.value.resources || {});
  const rates        = computed(() => activePlanet.value.rates || {});
  const buildings    = computed(() => activePlanet.value.buildings || []);
  const fleet        = computed(() => activePlanet.value.fleet     || []);
  const defense      = computed(() => activePlanet.value.defense   || []);
  
  const research     = computed(() => state.value?.research  || []);
  const planets      = computed(() => state.value?.planets   || []);
  const score        = computed(() => state.value?.score     || 0);

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
        // v2.7.4: If the number of planets changed, we might need a full reload or notification
        const oldPlanetCount = state.value?.planets?.length || 0;
        const newPlanetCount = data.state.planets?.length || 0;
        if (newPlanetCount > oldPlanetCount && oldPlanetCount > 0) {
            notify('Új bolygó vált elérhetővé a birodalmadban!', 'green');
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
      const data = await api.syncState();
      updateFromResponse(data);
      const qData = await api.getQueue();
      queue.value = qData.queue || [];
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

  return {
    state, queue, storage, loading, error, notifications,
    activePlanet, resources, rates, buildings, research, fleet, defense, planets, score,
    prodBuildings, infraBuildings, storageFill, energyWarning,
    loadState, switchPlanet, upgradeBuilding, startResearch, buildFleet, buildDefense, syncResources, renamePlanet,
    tickResources, notify, queueItemIsActive, getBuildCost, getResearchCost, canAfford,
  };
});
