<template>
  <div class="missions-layout">
    <div class="panel">
      <div class="panel-header">
        <span class="panel-icon">🚀</span>
        <h3>{{ L.t('missions.title') || 'Flotta Irányítás' }}</h3>
        <button class="btn-refresh" @click="loadMissions" :disabled="loading">↻</button>
      </div>
      <div class="panel-body">
        <div v-if="loading && !missions.length" class="empty-msg">Betöltés...</div>
        <div v-else-if="!missions.length" class="empty-msg">Nincs aktív flotta mozgás.</div>
        
        <div class="missions-grid">
          <div v-for="m in missions" :key="m.id" class="mission-card" :class="m.status">
            <div class="m-header">
              <span class="m-icon">{{ m.mission_type === 'spy' ? '🔍' : (m.mission_type === 'attack' ? '⚔️' : '🌍') }}</span>
              <div class="m-type-label">{{ typeLabel(m.mission_type) }}</div>
              <div class="m-status-badge" :class="m.status">{{ statusLabel(m.status) }}</div>
            </div>

            <div class="m-route">
              <div class="m-origin">
                <div class="label">Indulás</div>
                <div class="val">{{ getPlanetName(m.origin_planet_id) }}</div>
              </div>
              <div class="m-arrow">➔</div>
              <div class="m-target">
                <div class="label">Célpont</div>
                <div class="val">{{ m.target_name }} {{ m.target_coords }}</div>
              </div>
            </div>

            <div class="m-ships">
              <div v-for="s in parseShips(m.ships)" :key="s.id" class="ship-tag">
                {{ s.icon }} {{ s.count }}
              </div>
            </div>

            <div class="m-footer">
              <div class="m-timer">
                <span class="label">{{ m.status === 'travelling' ? 'Érkezés:' : 'Visszaérkezés:' }}</span>
                <span class="time">{{ formatTimeLeft(m.status === 'travelling' ? m.arrive_at : m.return_at) }}</span>
              </div>
              <button 
                v-if="m.status === 'travelling'" 
                class="btn-recall" 
                @click="recall(m.id)"
                :disabled="busy === m.id"
              >
                {{ busy === m.id ? '...' : 'Visszahívás' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';
import { audio } from '@/utils/botAudio.js';

const game = useGameStore();
const L    = useLangStore();
const missions = ref([]);
const loading  = ref(false);
const busy     = ref(null);

const typeLabel = (t) => ({ spy: 'Kémkedés', attack: 'Támadás', colonize: 'Gyarmatosítás' }[t] || t);
const statusLabel = (s) => ({ travelling: 'Úton', returning: 'Visszatérés', done: 'Befejezve' }[s] || s);

function getPlanetName(id) {
  return game.planets.find(p => p.id === id)?.name || 'Ismeretlen';
}

function parseShips(json) {
  try { return JSON.parse(json); } catch { return []; }
}

async function loadMissions() {
  loading.value = true;
  try {
    const data = await api.getMissions();
    missions.value = data.missions || [];
  } catch {}
  loading.value = false;
}

async function recall(id) {
  if (!confirm('Biztosan visszafordítod a flottát?')) return;
  audio.click();
  busy.value = id;
  try {
    await api.recallMission(id);
    game.notify('A flotta visszafordult', 'blue');
    await loadMissions();
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  busy.value = null;
}

function formatTimeLeft(ts) {
  if (!ts) return '';
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'Megérkezett';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

let timer;
onMounted(() => {
  loadMissions();
  timer = setInterval(loadMissions, 5000);
});
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.missions-layout { }
.btn-refresh { background: none; border: 1px solid var(--border); color: var(--text-dim); padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-left: 10px; }

.missions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 15px; margin-top: 10px; }
.mission-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 15px; position: relative; overflow: hidden; }
.mission-card.returning { border-color: var(--accent3); background: rgba(58,255,122,0.03); }
.mission-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--accent); }
.mission-card.returning::before { background: var(--accent3); }

.m-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.m-icon { font-size: 20px; }
.m-type-label { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; color: var(--text-bright); text-transform: uppercase; }
.m-status-badge { margin-left: auto; font-size: 9px; padding: 2px 8px; border-radius: 10px; background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid var(--accent); }
.m-status-badge.returning { background: rgba(58,255,122,0.1); color: var(--accent3); border-color: var(--accent3); }

.m-route { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 4px; }
.m-arrow { color: var(--text-dim); font-size: 18px; }
.label { font-size: 9px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 2px; }
.val { font-size: 11px; color: var(--text-bright); font-weight: 600; }

.m-ships { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; }
.ship-tag { background: rgba(0,0,0,0.5); border: 1px solid var(--border); padding: 2px 6px; border-radius: 3px; font-size: 10px; font-family: 'Orbitron', sans-serif; }

.m-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }
.m-timer { display: flex; flex-direction: column; }
.m-timer .time { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); font-weight: 700; }

.btn-recall { background: none; border: 1px solid var(--accent2); color: var(--accent2); padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; transition: all 0.2s; }
.btn-recall:hover { background: rgba(255,58,122,0.1); }
.btn-recall:disabled { opacity: 0.5; }

@media (max-width: 480px) {
  .missions-grid { grid-template-columns: 1fr; }
}
</style>
