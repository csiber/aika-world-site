<template>
  <div class="overview-grid">
    <!-- LEFT: Buildings quick -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">🏗️</span><h3>{{ L.t('overview.buildings') }}</h3></div>
      <div class="panel-body scroll-list">
        <div class="section-title">{{ L.t('overview.production') }}</div>
        <BuildingItem v-for="b in prodBuildings" :key="b.id" :building="b" />
        <div class="section-title" style="margin-top:12px;">{{ L.t('overview.infra') }}</div>
        <BuildingItem v-for="b in infraBuildings" :key="b.id" :building="b" />
      </div>
    </div>

    <!-- CENTER: Planet + Queue -->
    <div id="planet-view">
      <!-- Mission Control -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-icon">🚀</span>
          <h3>Flotta Irányítás</h3>
          <button class="btn-primary" @click="resolveMissions" :disabled="resolving" style="margin-left:auto;font-size:8px;padding:2px 6px;">
            {{ resolving ? '...' : 'Frissítés & Feldolgozás' }}
          </button>
        </div>
        <div class="panel-body">
          <div v-if="!missions.length" class="empty-msg">Nincs aktív flotta mozgás.</div>
          <div v-for="m in missions" :key="m.id" class="mission-item" :class="m.status">
            <div class="mission-icon">{{ m.mission_type === 'spy' ? '🔍' : (m.mission_type === 'attack' ? '⚔️' : '🌍') }}</div>
            <div class="mission-info">
              <div class="m-target">{{ m.target_name }} {{ m.target_coords }}</div>
              <div class="m-status">
                <span v-if="m.status === 'travelling'">Úton a cél felé...</span>
                <span v-else-if="m.status === 'returning'">Visszatérés...</span>
                <span class="m-time">{{ formatTimeLeft(m.status === 'travelling' ? m.arrive_at : m.return_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Planet visual -->
      <div class="planet-visual panel">
        <div class="scanner-container">
          <div class="big-planet">{{ activePlanet.emoji || '🌍' }}</div>
          <div class="planet-scanner"></div>
        </div>
        <div class="planet-stats">
          <h2>{{ activePlanet.name }}</h2>
          <div class="planet-coords-big">{{ L.t('overview.coords') }}: {{ activePlanet.coords }}</div>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-label">{{ L.t('overview.buildings') }}</div>
              <div class="stat-value">{{ buildings.length }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ L.t('overview.fleet') }}</div>
              <div class="stat-value">{{ totalShips }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ L.t('overview.production') }}</div>
              <div class="stat-value">{{ rates.metal?.toFixed(0) }}/h</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ L.t('overview.score') }}</div>
              <div class="stat-value">{{ score.toLocaleString('hu') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Build Queue -->
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">⚒️</span><h3>{{ L.t('overview.queue') }}</h3></div>
        <div class="panel-body">
          <div v-if="!queue.length" class="empty-msg">{{ L.t('overview.noQueue') }}</div>
          <QueueItem v-for="q in queue" :key="q.id || q.item_id" :item="q" />
        </div>
      </div>

      <!-- Aika AI chat -->
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">🤖</span><h3>{{ L.t('overview.assistant') }}</h3></div>
        <div class="panel-body">
          <div class="aika-chat">
            <div class="aika-messages">
              <div v-for="(msg, i) in aikaChatLog" :key="i" class="aika-bubble" :class="msg.role">
                <div class="aika-text">{{ msg.text }}</div>
              </div>
              <div v-if="aikaLoading" class="aika-bubble assistant">
                <div class="aika-text aika-typing">● ● ●</div>
              </div>
            </div>
            <div class="aika-input-row">
              <input v-model="aikaInput" class="aika-input" :placeholder="L.t('overview.askAika')" @keydown.enter="sendToAika" :disabled="aikaLoading" />
              <button class="aika-send" @click="sendToAika" :disabled="aikaLoading">{{ L.t('overview.send') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Stats -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">📊</span><h3>{{ L.t('overview.stats') }}</h3></div>
      <div class="panel-body">
        <div class="stat-block">
          <div class="stat-row">
            <span>⚙️ Fém összesen</span>
            <span class="sv metal">{{ Math.floor(resources.metal).toLocaleString('hu') }}</span>
          </div>
          <div class="stat-row">
            <span>💎 Kristály</span>
            <span class="sv crystal">{{ Math.floor(resources.crystal).toLocaleString('hu') }}</span>
          </div>
          <div class="stat-row">
            <span>⚡ Energia</span>
            <span class="sv energy">{{ Math.floor(resources.energy).toLocaleString('hu') }}</span>
          </div>
          <div class="stat-row">
            <span>🔮 Déusium</span>
            <span class="sv deus">{{ Math.floor(resources.deus).toLocaleString('hu') }}</span>
          </div>
        </div>
        <div class="section-title" style="margin-top:12px;">{{ L.t('overview.fleetSummary') }}</div>
        <div class="stat-block">
          <div v-for="ship in fleet" :key="ship.id" class="stat-row">
            <span>{{ ship.icon }} {{ ship.name }}</span>
            <span class="sv">{{ ship.count }}</span>
          </div>
        </div>
        <div class="section-title" style="margin-top:12px;">{{ L.t('overview.defenseSummary') || '🛡️ Védelem' }}</div>
        <div class="stat-block">
          <div v-for="d in game.defense" :key="d.id" class="stat-row">
            <span>{{ d.icon }} {{ d.name }}</span>
            <span class="sv">{{ d.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';
import BuildingItem from '@/components/BuildingItem.vue';
import QueueItem    from '@/components/QueueItem.vue';

const game = useGameStore();
const L    = useLangStore();
const prodBuildings  = computed(() => game.prodBuildings);
const infraBuildings = computed(() => game.infraBuildings);
const buildings = computed(() => game.buildings);
const resources = computed(() => game.resources);
const rates     = computed(() => game.rates);
const fleet     = computed(() => game.fleet);
const score     = computed(() => game.score);
const planets   = computed(() => game.planets);
const queue     = computed(() => game.queue);
const activePlanet = computed(() => game.activePlanet || { name: 'Ismeretlen', coords: '[?:?:?]' });
const totalShips    = computed(() => fleet.value.reduce((s, f) => s + f.count, 0));

const missions  = ref([]);
const resolving = ref(false);

const aikaInput = ref('');
const aikaLoading = ref(false);
const aikaChatLog = ref([
  { role: 'assistant', text: L.t('overview.aikaGreeting') }
]);

async function loadMissions() {
  try {
    const data = await api.getMissions();
    missions.value = data.missions || [];
  } catch {}
}

async function resolveMissions() {
  resolving.value = true;
  try {
    await api.resolveMissions();
    await loadMissions();
    await game.loadState();
    game.notify('Flották állapota frissítve', 'blue');
  } catch (e) {
    game.notify(`❌ ${e.message}`, 'red');
  }
  resolving.value = false;
}

function formatTimeLeft(ts) {
  if (!ts) return '';
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'Megérkezett';
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function sendToAika() {
  const msg = aikaInput.value.trim();
  if (!msg || aikaLoading.value) return;
  aikaInput.value = '';
  aikaChatLog.value.push({ role: 'user', text: msg });
  aikaLoading.value = true;
  try {
    const res = await fetch('/api/aika-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('aika_token')}` },
      body: JSON.stringify({
        message: msg,
        context: {
          resources: game.resources,
          rates: game.rates,
          score: game.score,
          buildingsCount: game.buildings.length,
          fleetTotal: totalShips.value,
          activeMissions: missions.value.length
        }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      aikaChatLog.value.push({ role: 'assistant', text: `⚠️ ${data.error || 'Ismeretlen hiba'}` });
    } else {
      aikaChatLog.value.push({ role: 'assistant', text: data.reply || 'Hiba történt.' });
    }
  } catch (e) {
    aikaChatLog.value.push({ role: 'assistant', text: `⚠️ ${L.t('overview.connError')}` });
  }
  aikaLoading.value = false;
}

onMounted(() => {
  loadMissions();
  const timer = setInterval(loadMissions, 10000);
  onUnmounted(() => clearInterval(timer));
});
</script>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: 220px 1fr 220px;
  gap: 10px;
  min-height: calc(100vh - 140px);
}
.scroll-list { max-height: calc(100vh - 200px); overflow-y: auto; }

.planet-visual {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.planet-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(600px 400px at 70% 50%, rgba(0,100,200,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.scanner-container { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.big-planet {
  font-size: 80px;
  filter: drop-shadow(0 0 30px rgba(0,150,255,0.4));
  animation: float 6s ease-in-out infinite;
}
.planet-scanner {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  box-shadow: 0 0 10px var(--accent);
  opacity: 0.6;
  animation: scanline 4s linear infinite;
  pointer-events: none;
}
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 100%; opacity: 0; } }
.planet-stats h2 { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 900; color: var(--text-bright); margin-bottom: 4px; }
.planet-coords-big { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent); margin-bottom: 12px; letter-spacing: 2px; }
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat-item { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 6px 10px; }
.stat-label { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; }
.stat-value { font-family: 'Orbitron', sans-serif; font-size: 13px; color: var(--text-bright); font-weight: 600; }

#planet-view { display: flex; flex-direction: column; gap: 10px; }

.mission-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 4px; margin-bottom: 6px; }
.mission-item.returning { border-color: var(--accent3); background: rgba(58,255,122,0.05); }
.mission-icon { font-size: 18px; }
.mission-info { flex: 1; }
.m-target { font-size: 11px; color: var(--text-bright); font-weight: 600; }
.m-status { font-size: 10px; color: var(--text-dim); display: flex; justify-content: space-between; margin-top: 2px; }
.m-time { font-family: 'Orbitron', sans-serif; color: var(--accent); }

.empty-msg { font-size: 11px; color: var(--text-dim); padding: 8px 0; }

.aika-chat { background: rgba(0,0,0,0.4); border: 1px solid rgba(0,200,255,0.2); border-radius: 4px; padding: 10px; }
.aika-messages { max-height: 160px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.aika-bubble { }
.aika-bubble.assistant .aika-text { background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.2); border-radius: 4px; padding: 6px 10px; font-size: 11px; color: var(--text); line-height: 1.5; }
.aika-bubble.user .aika-text { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 6px 10px; font-size: 11px; color: var(--text-dim); line-height: 1.5; text-align: right; }
.aika-typing { letter-spacing: 3px; animation: blink 1.2s infinite; }
@keyframes blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
.aika-input-row { display: flex; gap: 6px; margin-top: 6px; }
.aika-input { flex: 1; background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text); padding: 5px 10px; font-size: 11px; border-radius: 3px; font-family: 'Exo 2', sans-serif; outline: none; transition: border-color 0.2s; }
.aika-input:focus { border-color: var(--accent); }
.aika-input:disabled { opacity: 0.5; }
.aika-send { padding: 5px 12px; background: rgba(0,200,255,0.15); border: 1px solid var(--accent); color: var(--accent); border-radius: 3px; cursor: pointer; font-size: 11px; font-family: 'Orbitron', sans-serif; transition: all 0.2s; }
.aika-send:hover { background: rgba(0,200,255,0.3); }
.aika-send:disabled { opacity: 0.4; cursor: not-allowed; }

.stat-block { display: flex; flex-direction: column; gap: 4px; }
.stat-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(26,42,74,0.3); font-size: 11px; color: var(--text); }
.sv { font-family: 'Orbitron', sans-serif; font-size: 10px; }
.sv.metal   { color: var(--metal); }
.sv.crystal { color: var(--crystal); }
.sv.energy  { color: var(--energy); }
.sv.deus    { color: var(--accent); }

@media (max-width: 900px) {
  .overview-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .planet-visual {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  .planet-visual h2 {
    font-size: 16px;
  }
  .planet-coords-big {
    margin-bottom: 8px;
  }
  .stat-grid {
    width: 100%;
    gap: 4px;
  }
  .stat-item {
    padding: 4px 6px;
  }
}
</style>
