import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';

export const useGameStore = defineStore('game', () => {
  const state   = ref(null);
  const queue   = ref([]);
  const storage = ref({ metal: 50000, crystal: 25000, energy: 999999, deus: 5000 });
  const loading = ref(false);
  const error   = ref(null);
  const notifications = ref([]);

  // ── Computed ──────────────────────────────────────────────
  const resources = computed(() => state.value?.resources || {});
  const rates     = computed(() => state.value?.rates || {});
  const buildings = computed(() => state.value?.buildings || []);
  const research  = computed(() => state.value?.research  || []);
  const fleet     = computed(() => state.value?.fleet     || []);
  const planets   = computed(() => state.value?.planets   || []);
  const score     = computed(() => state.value?.score     || 0);

  const prodBuildings  = computed(() => buildings.value.filter(b => b.type === 'production'));
  const infraBuildings = computed(() => buildings.value.filter(b => b.type === 'infra'));

  // Storage fill percentages (0-100)
  const storageFill = computed(() => ({
    metal:   Math.min(100, Math.floor((resources.value.metal   || 0) / (storage.value.metal   || 1) * 100)),
    crystal: Math.min(100, Math.floor((resources.value.crystal || 0) / (storage.value.crystal || 1) * 100)),
    deus:    Math.min(100, Math.floor((resources.value.deus    || 0) / (storage.value.deus    || 1) * 100)),
  }));

  // Energy efficiency warning
  const energyWarning = computed(() => {
    const eff = rates.value.energyEff;
    if (eff === undefined) return null;
    if (eff < 50)  return { level: 'critical', msg: `⚡ Energia kritikusan alacsony (${eff}%)! Termelésed ${100-eff}%-kal csökkent.` };
    if (eff < 80)  return { level: 'warning',  msg: `⚡ Energia hiány (${eff}%) — Fejleszd a Napelemfarmot!` };
    return null;
  });

  // ── Actions ───────────────────────────────────────────────
  async function loadState() {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.getState();
      state.value   = data.state;
      queue.value   = data.queue || [];
      if (data.storage) storage.value = data.storage;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function upgradeBuilding(buildingId) {
    try {
      const data = await api.upgradeBuilding(buildingId);
      state.value = data.state;
      if (data.storage) storage.value = data.storage;
      const b = buildings.value.find(x => x.id === buildingId);
      if (b) {
        queue.value.push({
          item_id: buildingId, item_type: 'building',
          item_name: `${b.icon} ${b.name} → Szint ${b.level + 1}`,
          finish_at: data.finishAt,
        });
      }
      const mins = Math.floor((data.seconds || 0) / 60);
      notify(`⚒️ Fejlesztés megkezdve! (${mins > 0 ? mins + ' perc' : 'kevesebb mint 1 perc'})`, 'blue');
      return true;
    } catch (e) {
      notify(`❌ ${e.message}`, 'red');
      return false;
    }
  }

  async function startResearch(researchId) {
    try {
      const data = await api.startResearch(researchId);
      state.value = data.state;
      const r = research.value.find(x => x.id === researchId);
      if (r) {
        queue.value.push({
          item_id: researchId, item_type: 'research',
          item_name: `🔬 ${r.name} → Szint ${r.level + 1}`,
          finish_at: data.finishAt,
        });
      }
      const mins = Math.floor((data.seconds || 0) / 60);
      notify(`🔬 Kutatás megkezdve! (${mins > 0 ? mins + ' perc' : 'kevesebb mint 1 perc'})`, 'blue');
      return true;
    } catch (e) {
      notify(`❌ ${e.message}`, 'red');
      return false;
    }
  }

  async function buildFleet(shipId, amount) {
    try {
      const data = await api.buildFleet(shipId, amount);
      state.value = data.state;
      const ship = fleet.value.find(x => x.id === shipId);
      if (ship) {
        queue.value.push({
          item_id: shipId, item_type: 'fleet',
          item_name: `${ship.icon} ${ship.name} ×${amount}`,
          finish_at: data.finishAt,
        });
      }
      const hrs = Math.floor((data.seconds || 0) / 3600);
      const mins = Math.floor(((data.seconds || 0) % 3600) / 60);
      const timeStr = hrs > 0 ? `${hrs}ó ${mins}p` : `${mins} perc`;
      notify(`🚀 Hajógyártás megkezdve! (${timeStr})`, 'blue');
      return true;
    } catch (e) {
      notify(`❌ ${e.message}`, 'red');
      return false;
    }
  }

  async function syncResources() {
    try {
      const data = await api.syncState();
      state.value = data.state;
      if (data.storage) storage.value = data.storage;
      const qData = await api.getQueue();
      queue.value = qData.queue || [];
    } catch (e) { /* silent */ }
  }

  async function renamePlanet(planetIdx, name, emoji) {
    try {
      const data = await api.renamePlanet(planetIdx, name, emoji);
      if (state.value) state.value.planets = data.planets;
      notify('✏️ Bolygó sikeresen átnevezve!', 'green');
      return true;
    } catch (e) {
      notify(`❌ ${e.message}`, 'red');
      return false;
    }
  }

  // Client-side resource tick — respects storage cap
  function tickResources() {
    if (!state.value) return;
    const r  = state.value.resources;
    const rt = state.value.rates;
    const s  = storage.value;
    state.value.resources = {
      metal:   Math.min(s.metal,   r.metal   + rt.metal   / 3600),
      crystal: Math.min(s.crystal, r.crystal + rt.crystal / 3600),
      energy:  Math.min(s.energy,  r.energy  + rt.energy  / 3600),
      deus:    Math.min(s.deus,    r.deus    + rt.deus    / 3600),
    };
  }

  let notifId = 0;
  function notify(text, type = 'blue') {
    const id = ++notifId;
    notifications.value.push({ id, text, type });
    setTimeout(() => { notifications.value = notifications.value.filter(n => n.id !== id); }, 3500);
  }

  function queueItemIsActive(itemId) {
    return queue.value.some(q => q.item_id === itemId);
  }

  function getBuildCost(building) {
    const mult = Math.pow(1.5, building.level);
    return {
      metal:   Math.floor(building.baseCost.metal   * mult),
      crystal: Math.floor(building.baseCost.crystal * mult),
    };
  }

  function getResearchCost(r) {
    return {
      metal:   Math.floor(200 * Math.pow(2, r.level)),
      crystal: Math.floor(400 * Math.pow(2, r.level)),
    };
  }

  function canAfford(cost) {
    if (!state.value) return false;
    return state.value.resources.metal   >= cost.metal &&
           state.value.resources.crystal >= cost.crystal;
  }

  return {
    state, queue, storage, loading, error, notifications,
    resources, rates, buildings, research, fleet, planets, score,
    prodBuildings, infraBuildings, storageFill, energyWarning,
    loadState, upgradeBuilding, startResearch, buildFleet, syncResources, renamePlanet,
    tickResources, notify, queueItemIsActive, getBuildCost, getResearchCost, canAfford,
  };
});
