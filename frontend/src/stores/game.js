import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client.js';

export const useGameStore = defineStore('game', () => {
  const state = ref(null);
  const queue = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const notifications = ref([]);

  // ── Computed ──────────────────────────────────────────────
  const resources = computed(() => state.value?.resources || {});
  const rates     = computed(() => state.value?.rates || {});
  const buildings = computed(() => state.value?.buildings || []);
  const research  = computed(() => state.value?.research || []);
  const fleet     = computed(() => state.value?.fleet || []);
  const planets   = computed(() => state.value?.planets || []);
  const score     = computed(() => state.value?.score || 0);

  const prodBuildings  = computed(() => buildings.value.filter(b => b.type === 'production'));
  const infraBuildings = computed(() => buildings.value.filter(b => b.type === 'infra'));

  // ── Actions ───────────────────────────────────────────────
  async function loadState() {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.getState();
      state.value = data.state;
      queue.value = data.queue || [];
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
      // Add to local queue immediately
      const b = buildings.value.find(x => x.id === buildingId);
      if (b) {
        queue.value.push({
          item_id: buildingId,
          item_type: 'building',
          item_name: `${b.icon} ${b.name} → Szint ${b.level + 1}`,
          finish_at: data.finishAt,
        });
      }
      notify(`⚒️ Fejlesztés megkezdve!`, 'blue');
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
          item_id: researchId,
          item_type: 'research',
          item_name: `🔬 ${r.name} → Szint ${r.level + 1}`,
          finish_at: data.finishAt,
        });
      }
      notify(`🔬 Kutatás megkezdve!`, 'blue');
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
          item_id: shipId,
          item_type: 'fleet',
          item_name: `${ship.icon} ${ship.name} ×${amount}`,
          finish_at: data.finishAt,
        });
      }
      notify(`🚀 Hajógyártás megkezdve!`, 'blue');
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
      // Refresh queue from server to catch finished items
      const qData = await api.getQueue();
      queue.value = qData.queue || [];
    } catch (e) { /* silent */ }
  }

  // ── Local resource tick (client-side interpolation) ───────
  function tickResources() {
    if (!state.value) return;
    const r = state.value.resources;
    const rt = state.value.rates;
    state.value.resources = {
      metal:   r.metal   + rt.metal   / 3600,
      crystal: r.crystal + rt.crystal / 3600,
      energy:  r.energy  + rt.energy  / 3600,
      deus:    r.deus    + rt.deus    / 3600,
    };
  }

  // ── Notifications ─────────────────────────────────────────
  let notifId = 0;
  function notify(text, type = 'blue') {
    const id = ++notifId;
    notifications.value.push({ id, text, type });
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    }, 3500);
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

  function queueItemIsActive(itemId) {
    return queue.value.some(q => q.item_id === itemId);
  }

  function getBuildCost(building) {
    const mult = Math.pow(1.5, building.level);
    return {
      metal:   Math.floor(building.baseCost.metal * mult),
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
    return state.value.resources.metal >= cost.metal &&
           state.value.resources.crystal >= cost.crystal;
  }

  return {
    state, queue, loading, error, notifications,
    resources, rates, buildings, research, fleet, planets, score,
    prodBuildings, infraBuildings,
    loadState, upgradeBuilding, startResearch, buildFleet, syncResources, renamePlanet,
    tickResources, notify, queueItemIsActive, getBuildCost, getResearchCost, canAfford,
  };
});
