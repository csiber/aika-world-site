<template>
  <div class="galaxy-layout">
    <!-- Galaxy Navigation -->
    <div class="panel nav-panel">
      <div class="panel-body nav-row">
        <div class="nav-group">
          <label>{{ L.t('galaxy.galaxy') || 'Galaxis' }}</label>
          <button class="nav-btn-sm" @click="changeGal(-1)">◀</button>
          <input type="number" v-model.number="currentGal" min="1" max="9" class="nav-input" @change="loadGalaxy" />
          <button class="nav-btn-sm" @click="changeGal(1)">▶</button>
        </div>
        <div class="nav-group">
          <label>{{ L.t('galaxy.system') || 'Naprendszer' }}</label>
          <button class="nav-btn-sm" @click="changeSys(-1)">◀</button>
          <input type="number" v-model.number="currentSys" min="1" max="499" class="nav-input" @change="loadGalaxy" />
          <button class="nav-btn-sm" @click="changeSys(1)">▶</button>
        </div>
        <button class="btn-refresh" @click="loadGalaxy" :disabled="loading">
          {{ loading ? '...' : 'Mutat' }}
        </button>
      </div>
    </div>

    <!-- System View -->
    <div class="panel system-panel">
      <div class="panel-header">
        <span class="panel-icon">🌌</span>
        <h3>{{ L.t('galaxy.system') || 'Naprendszer' }} [{{ currentGal }}:{{ currentSys }}]</h3>
      </div>
      <div class="panel-body no-padding">
        <div class="system-table-wrapper">
          <table class="system-table">
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                <th style="width:60px;">Bolygó</th>
                <th>Név</th>
                <th>Játékos</th>
                <th>Pontszám</th>
                <th style="text-align:right;">Akciók</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in 15" :key="slot" :class="getCell(slot).type">
                <td class="slot-num">{{ slot }}</td>
                <td class="slot-visual">
                  <span v-if="getCell(slot).emoji" class="p-emoji">{{ getCell(slot).emoji }}</span>
                  <span v-else class="p-empty">🌑</span>
                </td>
                <td class="slot-name">
                  <span v-if="getCell(slot).type !== 'empty'">{{ getCell(slot).name }}</span>
                  <span v-else class="empty-text">Üres világűr</span>
                </td>
                <td class="slot-player">
                  <span v-if="getCell(slot).username" @click="openProfile(getCell(slot).username)" class="player-link">
                    {{ getCell(slot).username }}
                  </span>
                </td>
                <td class="slot-score">
                  <span v-if="getCell(slot).score">{{ getCell(slot).score.toLocaleString('hu') }}</span>
                </td>
                <td class="slot-actions">
                  <div v-if="getCell(slot).type === 'enemy'" class="action-btns">
                    <button class="btn-icon" @click="selectCell(getCell(slot), 'spy')" title="Kémkedés">🔍</button>
                    <button class="btn-icon" @click="selectCell(getCell(slot), 'attack')" title="Támadás">⚔️</button>
                  </div>
                  <div v-else-if="getCell(slot).type === 'empty'" class="action-btns">
                    <button class="btn-icon" @click="doQuickColonize(getCell(slot))" :disabled="!hasColonyShip" title="Gyarmatosítás">🌍</button>
                  </div>
                  <div v-else-if="getCell(slot).type === 'own'" class="action-btns">
                    <span class="own-tag">Saját</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Fleet Setup Modal (Overlay) -->
    <Transition name="fade">
      <div v-if="showFleetSetup" class="modal-overlay" @click.self="showFleetSetup = false">
        <div class="panel fleet-setup-modal">
          <div class="panel-header">
            <h3>🚀 {{ missionType === 'spy' ? 'Kémflotta' : 'Támadó flotta' }} indítása</h3>
            <button class="close-btn" @click="showFleetSetup = false">✕</button>
          </div>
          <div class="panel-body">
            <div class="target-summary">
              Célpont: <strong>{{ selected?.name }}</strong> {{ selected?.coords }}
            </div>
            
            <div v-if="availableShips.length === 0" class="empty-msg">Nincs elérhető hajó ezen a bolygón.</div>
            <div v-else class="fleet-setup-grid">
              <div v-for="ship in availableShips" :key="ship.id" class="fleet-setup-row">
                <div class="ship-info">
                  <span class="ship-icon">{{ ship.icon }}</span>
                  <span class="ship-name">{{ ship.name }}</span>
                  <span class="ship-count">({{ ship.count }})</span>
                </div>
                <div class="ship-input-wrap">
                  <button class="btn-xs" @click="selectedShips[ship.id] = ship.count">MAX</button>
                  <input type="number" v-model.number="selectedShips[ship.id]" min="0" :max="ship.count" class="ship-input" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-primary" @click="confirmMission" :disabled="!hasSelectedShips || !!actionBusy">
                {{ actionBusy ? '...' : 'FLOTTA INDÍTÁSA' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useAuthStore } from '@/stores/auth.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';

const game = useGameStore();
const auth = useAuthStore();
const L    = useLangStore();

const currentGal = ref(1);
const currentSys = ref(1);
const loading    = ref(false);
const players    = ref([]);
const selected   = ref(null);
const actionBusy = ref(null);

const showFleetSetup = ref(false);
const missionType    = ref(null);
const selectedShips  = ref({});

const availableShips = computed(() => game.fleet.filter(f => f.count > 0));
const hasSelectedShips = computed(() => Object.values(selectedShips.value).some(v => v > 0));
const hasColonyShip = computed(() => game.fleet.some(f => f.id === 'colony' && f.count > 0));

function changeGal(delta) {
  currentGal.value = Math.max(1, Math.min(9, currentGal.value + delta));
  loadGalaxy();
}
function changeSys(delta) {
  currentSys.value = Math.max(1, Math.min(499, currentSys.value + delta));
  loadGalaxy();
}

async function loadGalaxy() {
  loading.value = true;
  try {
    const data = await api.getGalaxy(currentGal.value, currentSys.value);
    players.value = data.players || [];
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  loading.value = false;
}

function getCell(slot) {
  const coords = `[${currentGal.value}:${currentSys.value}:${slot}]`;
  const p = players.value.find(x => x.coords === coords);
  if (!p) return { slot, coords, type: 'empty' };
  
  const isOwn = p.username === auth.username;
  return {
    slot, coords,
    type: isOwn ? 'own' : 'enemy',
    emoji: p.planet_emoji,
    name: p.planet_name,
    username: p.username,
    score: p.score,
    targetUserId: p.user_id
  };
}

function selectCell(cell, type) {
  selected.value = cell;
  missionType.value = type;
  showFleetSetup.value = true;
  selectedShips.value = {};
  availableShips.value.forEach(s => selectedShips.value[s.id] = 0);
  if (type === 'spy') {
    const s = availableShips.value.find(x => x.id === 'fighter_s' || x.id === 'spy');
    if (s) selectedShips.value[s.id] = 1;
  }
}

async function confirmMission() {
  if (missionType.value === 'spy') await doSpy();
  else if (missionType.value === 'attack') await doAttack();
}

async function doSpy() {
  actionBusy.value = 'spy';
  try {
    const ships = Object.entries(selectedShips.value).filter(([_, c]) => c > 0).map(([id, count]) => ({ id, count }));
    await api.spy(selected.value.targetUserId, selected.value.coords, selected.value.name, ships);
    game.notify('Kémflotta elindult', 'blue');
    showFleetSetup.value = false;
    await game.loadState();
  } catch (e) { game.notify(`❌ ${e.message}`, 'red'); }
  actionBusy.value = null;
}

async function doAttack() {
  actionBusy.value = 'attack';
  try {
    const ships = Object.entries(selectedShips.value).filter(([_, c]) => c > 0).map(([id, count]) => ({ id, count }));
    await api.attack(selected.value.targetUserId, selected.value.coords, selected.value.name, ships);
    game.notify('Támadó flotta elindult', 'red');
    showFleetSetup.value = false;
    await game.loadState();
  } catch (e) { game.notify(`❌ ${e.message}`, 'red'); }
  actionBusy.value = null;
}

async function doQuickColonize(cell) {
  actionBusy.value = 'colony';
  try {
    await api.colonize(cell.coords, 'Új gyarmat');
    game.notify(`Gyarmatosító hajó elindult: ${cell.coords}`, 'blue');
    await game.loadState();
  } catch (e) { game.notify(`❌ ${e.message}`, 'red'); }
  actionBusy.value = null;
}

onMounted(() => {
  // Try to parse current planet coords to start there
  const m = game.activePlanet?.coords?.match(/\[(\d+):(\d+):(\d+)\]/);
  if (m) { currentGal.value = parseInt(m[1]); currentSys.value = parseInt(m[2]); }
  loadGalaxy();
});
</script>

<style scoped>
.galaxy-layout { display: flex; flex-direction: column; gap: 12px; }

.nav-panel { background: var(--bg-panel); border: 1px solid var(--border); }
.nav-row { display: flex; align-items: center; justify-content: center; gap: 30px; padding: 10px; }
.nav-group { display: flex; align-items: center; gap: 8px; }
.nav-group label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
.nav-input { width: 60px; background: #000; border: 1px solid var(--border); color: var(--accent); text-align: center; font-family: 'Orbitron', sans-serif; font-size: 14px; padding: 4px; border-radius: 4px; }
.nav-btn-sm { background: none; border: 1px solid var(--border); color: var(--text-dim); cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.nav-btn-sm:hover { border-color: var(--accent); color: var(--accent); }

.system-panel { width: 100%; }
.no-padding { padding: 0 !important; }
.system-table-wrapper { width: 100%; overflow-x: auto; }
.system-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.system-table th { text-align: left; padding: 12px 15px; background: rgba(255,255,255,0.02); color: var(--text-dim); font-size: 10px; text-transform: uppercase; border-bottom: 1px solid var(--border); }
.system-table td { padding: 10px 15px; border-bottom: 1px solid rgba(26,42,74,0.3); }
.system-table tr:hover td { background: rgba(255,255,255,0.02); }

.slot-num { font-family: 'Orbitron', sans-serif; color: var(--text-dim); font-size: 10px; }
.p-emoji { font-size: 20px; }
.p-empty { opacity: 0.2; font-size: 18px; }
.empty-text { color: var(--text-dim); font-style: italic; font-size: 11px; }
.player-link { color: var(--accent); cursor: pointer; }
.player-link:hover { text-decoration: underline; }
.own-tag { font-size: 9px; color: var(--accent3); border: 1px solid var(--accent3); padding: 1px 5px; border-radius: 10px; }

.action-btns { display: flex; justify-content: flex-end; gap: 6px; }
.btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-icon:hover { border-color: var(--accent); background: rgba(0,200,255,0.1); transform: translateY(-2px); }
.btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }

/* Modal Styles */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.fleet-setup-modal { width: 90%; max-width: 450px; }
.close-btn { background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; }
.target-summary { padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px; margin-bottom: 15px; font-size: 12px; }
.fleet-setup-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.fleet-setup-row { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.ship-info { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.ship-count { color: var(--text-dim); font-size: 10px; }
.ship-input-wrap { display: flex; gap: 6px; }
.ship-input { width: 60px; background: #000; border: 1px solid var(--border); color: #fff; padding: 4px; border-radius: 3px; text-align: center; }
.btn-xs { font-size: 8px; padding: 2px 4px; background: rgba(255,255,255,0.1); border: 1px solid var(--border); color: #fff; border-radius: 2px; cursor: pointer; }
.modal-footer { display: flex; justify-content: flex-end; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .nav-row { flex-direction: column; gap: 15px; }
  .system-table th:nth-child(5), .system-table td:nth-child(5) { display: none; }
}
</style>
