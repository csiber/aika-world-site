import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { api } from '@/api/client.js';

const BUILD_PRIORITY = [
  'robotics',      // Gyorsabb építkezés mindennek az alapja
  'metal_mine', 
  'crystal_mine', 
  'solar', 
  'deusium', 
  'lab',           // Kutatás előfeltétele
  'shipyard',      // Flotta előfeltétele
  'storage_metal', 
  'storage_crystal'
];

export const useBotStore = defineStore('bot', () => {
  const active          = ref(false);
  const status          = ref('idle'); 
  const lastAction      = ref('');
  const log             = ref([]);

  const todayTimeMs     = ref(0);
  const todayActions    = ref(0);
  const sessionStartMs  = ref(0);
  const sessionElapsedMs = ref(0);

  const settings = ref({
    dailyTimeLimitMin:   360,
    sessionTimeLimitMin: 180,
    dailyActionLimit:    500,
    autoBuild:    true,
    autoResearch: true,
    autoFleet:    true,
    autoExpedition: true,
    minExpeditionFleet: 10,
  });

  let decideTimer  = null;
  let timeAccTimer = null;

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
      
      // Merge settings but keep new defaults if they are higher
      if (data.settings) {
        Object.keys(settings.value).forEach(key => {
          if (data.settings[key] !== undefined) {
            // If it's a numeric limit, take the higher of the two to prevent accidental downgrades
            if (typeof settings.value[key] === 'number' && key.includes('Limit')) {
              settings.value[key] = Math.max(settings.value[key], data.settings[key]);
            } else {
              settings.value[key] = data.settings[key];
            }
          }
        });
      }
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

  function addLog(msg, type = 'info') {
    const ts = new Date().toLocaleTimeString('hu', { hour: '2-digit', minute: '2-digit' });
    log.value.unshift({ ts, msg, type });
    if (log.value.length > 50) log.value.length = 50;
    lastAction.value = msg;
  }

  function checkLimits() {
    if (todayTimeMs.value >= settings.value.dailyTimeLimitMin * 60000) {
      addLog('⏱️ Napi időlimit elérve (2.0)', 'warn');
      _stop('exhausted');
      return false;
    }
    if (todayActions.value >= settings.value.dailyActionLimit) {
      addLog('🎯 Napi akciólimit elérve (2.0)', 'warn');
      _stop('exhausted');
      return false;
    }
    if (Date.now() - sessionStartMs.value >= settings.value.sessionTimeLimitMin * 60000) {
      addLog('⏰ Session időlimit elérve', 'warn');
      _stop('idle');
      return false;
    }
    return true;
  }

  async function decideTick() {
    if (!active.value) return;
    if (!checkLimits()) return;

    const game = useGameStore();
    await game.syncResources();

    const buildings = game.buildings;
    const research  = game.research;
    const eff       = game.rates.energyEff;
    const resources = game.resources;
    const storage   = game.storage;

    // 1. EMERGENCY: Storage nearly full (>90%)
    if (settings.value.autoBuild) {
      const metalFull = resources.metal / storage.metal > 0.9;
      const crystalFull = resources.crystal / storage.crystal > 0.9;
      
      if (metalFull || crystalFull) {
        const storageId = metalFull ? 'storage_metal' : 'storage_crystal';
        if (!game.queueItemIsActive(storageId)) {
          const b = buildings.find(x => x.id === storageId);
          if (b && game.canAfford(game.getBuildCost(b))) {
            await game.upgradeBuilding(storageId);
            todayActions.value++;
            addLog(`📦 Raktár bővítés: ${b.name} (Kapacitás védelem)`, 'warn');
            return;
          }
        }
      }
    }

    // 2. Energy efficiency < 95% → solar priority
    if (eff !== undefined && eff < 95 && settings.value.autoBuild) {
      if (!game.queueItemIsActive('solar')) {
        const b = buildings.find(x => x.id === 'solar');
        if (b && game.canAfford(game.getBuildCost(b))) {
          await game.upgradeBuilding('solar');
          todayActions.value++;
          addLog(`⚡ Energia korrekció: ${b.name} Szint ${b.level + 1}`, 'energy');
          return;
        }
      }
    }

    // 3. Smart Building (Robotics priority)
    if (settings.value.autoBuild) {
      // Find lowest robotics level first if it exists
      const robotics = buildings.find(b => b.id === 'robotics');
      if (robotics && robotics.level < 5 && !game.queueItemIsActive('robotics')) {
        if (game.canAfford(game.getBuildCost(robotics))) {
          await game.upgradeBuilding('robotics');
          todayActions.value++;
          addLog(`🤖 Robotika prioritás (Szint ${robotics.level + 1})`, 'build');
          return;
        }
      }

      for (const id of BUILD_PRIORITY) {
        if (game.queueItemIsActive(id)) continue;
        const b = buildings.find(x => x.id === id);
        if (!b) continue;
        const cost = game.getBuildCost(b);
        if (game.canAfford(cost)) {
          const ok = await game.upgradeBuilding(id);
          if (ok) {
            todayActions.value++;
            addLog(`🏗️ Építkezés: ${b.icon} ${b.name} (Szint ${b.level + 1})`, 'build');
            return;
          }
        }
      }
    }

    // 4. Auto-Research (Lowest level first)
    if (settings.value.autoResearch) {
      const researchBusy = research.some(r => game.queueItemIsActive(r.id));
      if (!researchBusy) {
        const candidates = research
          .filter(r => !game.queueItemIsActive(r.id))
          .filter(r => game.canAfford(game.getResearchCost(r)))
          .sort((a, b) => a.level - b.level);
        if (candidates.length > 0) {
          const r  = candidates[0];
          const ok = await game.startResearch(r.id);
          if (ok) {
            todayActions.value++;
            addLog(`🔬 Kutatás: ${r.icon} ${r.name} (Szint ${r.level + 1})`, 'research');
            return;
          }
        }
      }
    }

    // 5. Auto-Expedition (Exploring the unknown)
    if (settings.value.autoExpedition) {
      // Assuming state has active missions info
      const activeMissions = game.state?.missions || [];
      const expeditionCount = activeMissions.filter(m => m.mission_type === 'expedition').length;
      
      // Slot logic (simplified: max 3 expeditions at once)
      if (expeditionCount < 3) {
        const fighterS = game.fleet.find(s => s.id === 'fighter_s');
        if (fighterS && fighterS.count >= settings.value.minExpeditionFleet) {
          try {
            // Find random nearby system
            const coords = game.activePlanet.coords || '[1:1:1]';
            const parts = coords.match(/\[(\d+):(\d+):(\d+)\]/);
            if (parts) {
              const [_, g, s, p] = parts;
              const target = `[${g}:${s}:${Math.floor(Math.random() * 15) + 1}]`;
              const ships = [{ id: 'fighter_s', count: settings.value.minExpeditionFleet }];
              
              await api.expedition(target, ships);
              todayActions.value++;
              addLog(`🛰️ Expedíció indítva ide: ${target}`, 'fleet');
              return;
            }
          } catch (e) { console.error('Bot expedition failed', e); }
        }
      }
    }

    addLog('💤 Elemzés: minden optimális.', 'idle');
  }

  function _stop(nextStatus) {
    active.value = false;
    status.value = nextStatus;
    clearInterval(decideTimer);
    clearInterval(timeAccTimer);
    decideTimer  = null;
    timeAccTimer = null;
    saveToStorage();
  }

  function resetStats() {
    todayTimeMs.value = 0;
    todayActions.value = 0;
    status.value = 'idle';
    saveToStorage();
    addLog('♻️ Statisztikák nullázva', 'system');
  }

  function start() {
    if (status.value === 'exhausted' && !confirm('A napi limit elfogyott. Biztosan újraindítod? (A statisztikák törlődnek)')) return;
    if (status.value === 'exhausted') resetStats();

    loadFromStorage();
    
    // CRITICAL FIX: Initialize session start BEFORE checking limits
    sessionStartMs.value = Date.now();
    sessionElapsedMs.value = 0;

    if (!checkLimits()) return;

    active.value         = true;
    status.value         = 'running';

    addLog('🤖 Bot 2.0 AKTIVÁLVA!', 'system');

    decideTimer  = setInterval(decideTick, 30000);
    timeAccTimer = setInterval(() => {
      if (!active.value) return;
      todayTimeMs.value    += 1000;
      sessionElapsedMs.value = Date.now() - sessionStartMs.value;
      if (todayTimeMs.value % 10000 === 0) saveToStorage();
    }, 1000);

    decideTick();
  }

  function stop() {
    addLog('⏹️ Bot 2.0 leállítva', 'system');
    _stop('idle');
  }

  loadFromStorage();

  return {
    active, status, lastAction, log,
    todayTimeMs, todayActions, sessionStartMs, sessionElapsedMs,
    settings,
    start, stop, resetStats,
  };
});
