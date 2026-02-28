import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameStore } from '@/stores/game.js';

const BUILD_PRIORITY = ['metal_mine', 'crystal_mine', 'solar', 'deusium', 'robotics', 'lab', 'shipyard'];
const FLEET_SHIP     = 'fighter_s';
const FLEET_AMOUNT   = 5;

export const useBotStore = defineStore('bot', () => {
  const active          = ref(false);
  const status          = ref('idle'); // 'idle' | 'running' | 'exhausted'
  const lastAction      = ref('');
  const log             = ref([]);

  const todayTimeMs     = ref(0);
  const todayActions    = ref(0);
  const sessionStartMs  = ref(0);
  const sessionElapsedMs = ref(0);

  const settings = ref({
    dailyTimeLimitMin:   60,
    sessionTimeLimitMin: 30,
    dailyActionLimit:    50,
    autoBuild:    true,
    autoResearch: true,
    autoFleet:    false,
  });

  let decideTimer  = null;
  let timeAccTimer = null;

  // ── Persistence ──────────────────────────────────────────────
  function getDateKey() {
    return `aika_bot_stats_${new Date().toISOString().slice(0, 10)}`;
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(getDateKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      todayTimeMs.value   = data.todayTimeMs   || 0;
      todayActions.value  = data.todayActions  || 0;
      if (data.settings) Object.assign(settings.value, data.settings);
    } catch (_) { /* ignore */ }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(getDateKey(), JSON.stringify({
        todayTimeMs:  todayTimeMs.value,
        todayActions: todayActions.value,
        settings:     settings.value,
      }));
    } catch (_) { /* ignore */ }
  }

  // ── Logging ──────────────────────────────────────────────────
  function addLog(msg, type = 'info') {
    const ts = new Date().toLocaleTimeString('hu', { hour: '2-digit', minute: '2-digit' });
    log.value.unshift({ ts, msg, type });
    if (log.value.length > 30) log.value.length = 30;
    lastAction.value = msg;
  }

  // ── Limit check ──────────────────────────────────────────────
  function checkLimits() {
    if (todayTimeMs.value >= settings.value.dailyTimeLimitMin * 60000) {
      addLog('⏱️ Napi időlimit elérve', 'warn');
      _stop('exhausted');
      return false;
    }
    if (todayActions.value >= settings.value.dailyActionLimit) {
      addLog('🎯 Napi akciólimit elérve', 'warn');
      _stop('exhausted');
      return false;
    }
    if (Date.now() - sessionStartMs.value >= settings.value.sessionTimeLimitMin * 60000) {
      addLog('⏰ Session időlimit elérve — bot leállítva', 'warn');
      _stop('idle');
      return false;
    }
    return true;
  }

  // ── Decision tick (every 30 s) ───────────────────────────────
  async function decideTick() {
    if (!active.value) return;
    if (!checkLimits()) return;

    const game = useGameStore();
    await game.syncResources();

    const buildings = game.buildings;
    const research  = game.research;
    const eff       = game.rates.energyEff;

    // 1. Energy efficiency < 90 % → solar / deusium priority
    if (eff !== undefined && eff < 90 && settings.value.autoBuild) {
      for (const id of ['solar', 'deusium']) {
        if (game.queueItemIsActive(id)) continue;
        const b = buildings.find(x => x.id === id);
        if (!b) continue;
        const cost = game.getBuildCost(b);
        if (!game.canAfford(cost)) continue;
        const ok = await game.upgradeBuilding(id);
        if (ok) {
          todayActions.value++;
          addLog(`⚡ ${b.icon} ${b.name} → Szint ${b.level + 1}`, 'energy');
          saveToStorage();
          return;
        }
      }
    }

    // 2. Auto-build in priority order
    if (settings.value.autoBuild) {
      for (const id of BUILD_PRIORITY) {
        if (game.queueItemIsActive(id)) continue;
        const b = buildings.find(x => x.id === id);
        if (!b) continue;
        const cost = game.getBuildCost(b);
        if (!game.canAfford(cost)) continue;
        const ok = await game.upgradeBuilding(id);
        if (ok) {
          todayActions.value++;
          addLog(`🏗️ ${b.icon} ${b.name} → Szint ${b.level + 1}`, 'build');
          saveToStorage();
          return;
        }
      }
    }

    // 3. Auto-research (only if no research currently in queue)
    if (settings.value.autoResearch) {
      const researchBusy = research.some(r => game.queueItemIsActive(r.id));
      if (!researchBusy) {
        const candidates = research
          .filter(r => r.level < r.max && !game.queueItemIsActive(r.id))
          .filter(r => game.canAfford(game.getResearchCost(r)))
          .sort((a, b) => a.level - b.level);
        if (candidates.length > 0) {
          const r  = candidates[0];
          const ok = await game.startResearch(r.id);
          if (ok) {
            todayActions.value++;
            addLog(`🔬 ${r.icon} ${r.name} → Szint ${r.level + 1}`, 'research');
            saveToStorage();
            return;
          }
        }
      }
    }

    // 4. Auto-fleet
    if (settings.value.autoFleet && !game.queueItemIsActive(FLEET_SHIP)) {
      const ship = game.fleet.find(x => x.id === FLEET_SHIP);
      if (ship) {
        const cost = { metal: ship.cost.metal * FLEET_AMOUNT, crystal: ship.cost.crystal * FLEET_AMOUNT };
        if (game.canAfford(cost)) {
          const ok = await game.buildFleet(FLEET_SHIP, FLEET_AMOUNT);
          if (ok) {
            todayActions.value++;
            addLog(`🚀 ${ship.icon} ${ship.name} ×${FLEET_AMOUNT} gyártás indítva`, 'fleet');
            saveToStorage();
            return;
          }
        }
      }
    }

    // 5. Nothing to do
    addLog('💤 Várakozás...', 'idle');
  }

  // ── Internal stop helper ─────────────────────────────────────
  function _stop(nextStatus) {
    active.value = false;
    status.value = nextStatus;
    clearInterval(decideTimer);
    clearInterval(timeAccTimer);
    decideTimer  = null;
    timeAccTimer = null;
    saveToStorage();
  }

  // ── Public API ───────────────────────────────────────────────
  function start() {
    if (status.value === 'exhausted') return;
    loadFromStorage();

    if (
      todayTimeMs.value  >= settings.value.dailyTimeLimitMin * 60000 ||
      todayActions.value >= settings.value.dailyActionLimit
    ) {
      status.value = 'exhausted';
      return;
    }

    active.value         = true;
    status.value         = 'running';
    sessionStartMs.value = Date.now();
    sessionElapsedMs.value = 0;

    addLog('🤖 Bot aktiválva!', 'system');

    decideTimer  = setInterval(decideTick, 30000);
    timeAccTimer = setInterval(() => {
      if (!active.value) return;
      todayTimeMs.value    += 1000;
      sessionElapsedMs.value = Date.now() - sessionStartMs.value;
      saveToStorage();
    }, 1000);

    decideTick(); // immediate first tick
  }

  function stop() {
    addLog('⏹️ Bot leállítva', 'system');
    _stop('idle');
  }

  // Init
  loadFromStorage();

  return {
    active, status, lastAction, log,
    todayTimeMs, todayActions, sessionStartMs, sessionElapsedMs,
    settings,
    start, stop,
  };
});
