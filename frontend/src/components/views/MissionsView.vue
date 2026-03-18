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
              <span class="m-icon">{{ missionIcon(m.mission_type) }}</span>
              <div class="m-type-label">{{ typeLabel(m.mission_type) }}</div>
              <div v-if="m.is_intercepted === 1" class="m-intercepted-badge">ELFOGVA</div>
              <div v-if="m.status === 'battle_pending'" class="m-status-badge battle_pending" @click="openBattle(m)" style="cursor:pointer;">
                ⚔️ CSATA FOLYAMATBAN — Kattints!
              </div>
              <div v-else class="m-status-badge" :class="m.status">{{ statusLabel(m.status) }}</div>
            </div>

            <div class="m-route">
              <div class="m-origin">
                <div class="label">Indulás</div>
                <div class="val">{{ getPlanetName(m.origin_planet_id) }}</div>
              </div>
              <div class="m-arrow">➔</div>
              <div class="m-target">
                <div class="label">{{ m.mission_type === 'intercept' ? 'Elfogási pont' : 'Célpont' }}</div>
                <div class="val">{{ m.target_name }} {{ m.target_coords }}</div>
              </div>
            </div>
            <div v-if="m.intercept_coords" class="m-intercept-info">
              <span class="intercept-label">Elfogási pont:</span>
              <span class="intercept-coords">{{ m.intercept_coords }}</span>
            </div>

            <div class="m-ships">
              <div v-for="s in parseShips(m.ships)" :key="s.id" class="ship-tag">
                {{ s.icon }} {{ s.count }}
              </div>
            </div>

            <div class="m-footer">
              <div v-if="m.status === 'battle_pending'" class="m-timer">
                <button class="btn-battle" @click="openBattle(m)">Csata megnyitása</button>
              </div>
              <template v-else>
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
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';
import { audio } from '@/utils/botAudio.js';

const router = useRouter();

const game = useGameStore();
const L    = useLangStore();
const missions = ref([]);
const loading  = ref(false);
const busy     = ref(null);

const typeLabel = (t) => ({ spy: 'Kémkedés', attack: 'Támadás', colonize: 'Gyarmatosítás', harvest: 'Újrahasznosítás', expedition: 'Expedíció', intercept: 'Elfogás' }[t] || t);
const statusLabel = (s) => ({ travelling: 'Úton', returning: 'Visszatérés', done: 'Befejezve', battle_pending: 'CSATA FOLYAMATBAN' }[s] || s);
const missionIcon = (t) => ({ spy: '🔍', attack: '⚔️', colonize: '🌍', harvest: '🚛', expedition: '🌌', intercept: '🎯' }[t] || '🚀');

function getBattleId(m) {
  if (m.status !== 'battle_pending') return null;
  try { const r = JSON.parse(m.result || '{}'); return r.tacticalBattleId || null; } catch { return null; }
}

function openBattle(m) {
  const bid = getBattleId(m);
  if (bid) router.push(`/tactical/${bid}`);
}

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
.mission-card.battle_pending { border-color: var(--accent2); background: rgba(255,58,122,0.05); animation: battle-pulse 2s ease-in-out infinite; }
.mission-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--accent); }
.mission-card.returning::before { background: var(--accent3); }
.mission-card.battle_pending::before { background: var(--accent2); }
@keyframes battle-pulse { 0%,100% { box-shadow: 0 0 0 rgba(255,58,122,0); } 50% { box-shadow: 0 0 15px rgba(255,58,122,0.2); } }

.m-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.m-icon { font-size: 20px; }
.m-type-label { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; color: var(--text-bright); text-transform: uppercase; }
.m-status-badge { margin-left: auto; font-size: 9px; padding: 2px 8px; border-radius: 10px; background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid var(--accent); }
.m-status-badge.returning { background: rgba(58,255,122,0.1); color: var(--accent3); border-color: var(--accent3); }
.m-status-badge.battle_pending { background: rgba(255,58,122,0.15); color: var(--accent2); border-color: var(--accent2); font-weight: 700; animation: battle-pulse 2s ease-in-out infinite; }

.btn-battle { background: linear-gradient(135deg, rgba(255,58,122,0.2), rgba(255,58,122,0.05)); border: 1px solid var(--accent2); color: var(--accent2); padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 11px; font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 1px; transition: all 0.2s; }
.btn-battle:hover { background: rgba(255,58,122,0.25); box-shadow: 0 0 12px rgba(255,58,122,0.3); }

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

/* Intercepted badge */
.m-intercepted-badge { font-size: 8px; padding: 2px 8px; border-radius: 10px; background: rgba(255,58,92,0.15); color: #ff3a5c; border: 1px solid rgba(255,58,92,0.3); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; animation: flash-intercepted 1.5s infinite; }
@keyframes flash-intercepted { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Intercept info */
.m-intercept-info { display: flex; align-items: center; gap: 8px; font-size: 10px; padding: 6px 10px; background: rgba(255,58,92,0.05); border: 1px solid rgba(255,58,92,0.15); border-radius: 4px; margin-bottom: 15px; }
.intercept-label { color: var(--text-dim); text-transform: uppercase; font-size: 9px; }
.intercept-coords { color: #ff3a5c; font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; }

@media (max-width: 480px) {
  .missions-grid { grid-template-columns: 1fr; }
}
</style>
