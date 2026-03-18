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
      <!-- Galaxy Bonus Banner -->
      <div class="galaxy-bonus-banner" :class="'gal-' + currentGal">
        <span class="bonus-icon">💠</span>
        <span class="bonus-text">{{ galaxyBonus }}</span>
        <div v-if="currentDominator" class="dominance-tag">
          👑 <b>{{ currentDominator.alliance_tag }}</b> uralma alatt (+10% bónusz)
        </div>
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
                <th>Név / Törmelék</th>
                <th>Játékos</th>
                <th>Pontszám</th>
                <th style="text-align:right;">Akciók</th>
              </tr>
            </thead>
            <!-- Territory Banner for this system -->
            <tr v-if="getSystemClaim(currentSys)" class="territory-banner-row">
              <td colspan="6" class="territory-banner" :style="{ borderLeftColor: allianceColor(getSystemClaim(currentSys).alliance_id) }">
                <span class="territory-tag" :style="{ color: allianceColor(getSystemClaim(currentSys).alliance_id) }">
                  [{{ getSystemClaim(currentSys).alliance_tag }}]
                </span>
                Terület — +{{ Math.round(getSystemClaim(currentSys).bonus_value * 100) }}% termelés, +10% flotta sebesség
                <span v-if="getSystemRelay(currentSys)" class="relay-icon" title="Relay pont aktív — +50% sebesség">📡</span>
              </td>
            </tr>
            <tbody>
              <!-- Slots 1-15 (Planets) -->
              <tr v-for="slot in 15" :key="slot" :class="[getCell(slot).type, { 'claimed-system': !!getSystemClaim(currentSys) }]"
                  :style="getSystemClaim(currentSys) ? { '--claim-color': allianceColor(getSystemClaim(currentSys).alliance_id) } : {}"
                  :title="getSystemClaim(currentSys) ? `Irányítja: [${getSystemClaim(currentSys).alliance_tag}] — +${Math.round(getSystemClaim(currentSys).bonus_value * 100)}% termelés, +10% flotta sebesség` : ''">
                <td class="slot-num">{{ slot }}</td>
                <td class="slot-visual">
                  <span v-if="getCell(slot).emoji" class="p-emoji">{{ getCell(slot).emoji }}</span>
                  <span v-else class="p-empty">🌑</span>
                  <span v-if="getCell(slot).hasMoon" class="p-moon" title="Hold">🌑</span>
                </td>
                <td class="slot-name">
                  <div v-if="getCell(slot).type !== 'empty'">{{ getCell(slot).name }}</div>
                  <div v-else class="empty-text">Üres világűr</div>
                  <!-- Debris Field -->
                  <div v-if="getCell(slot).debris_metal > 0 || getCell(slot).debris_crystal > 0" class="debris-info" title="Törmelékmező">
                    🚛 <span class="d-m">{{ L.n(getCell(slot).debris_metal) }}</span> / <span class="d-c">{{ L.n(getCell(slot).debris_crystal) }}</span>
                  </div>
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
                  <div class="action-btns">
                    <!-- Enemy actions -->
                    <template v-if="getCell(slot).type === 'enemy'">
                      <button class="btn-icon" @click="selectCell(getCell(slot), 'spy')" title="Kémkedés">🔍</button>
                      <button class="btn-icon" @click="selectCell(getCell(slot), 'attack')" title="Támadás">⚔️</button>
                    </template>
                    <!-- Debris action -->
                    <button v-if="getCell(slot).debris_metal > 0 || getCell(slot).debris_crystal > 0" 
                      class="btn-icon harvest" @click="selectCell(getCell(slot), 'harvest')" title="Újrahasznosítás">🚛</button>
                    <!-- Empty slot actions -->
                    <button v-if="getCell(slot).type === 'empty'" 
                      class="btn-icon" @click="doQuickColonize(getCell(slot))" :disabled="!hasColonyShip" title="Gyarmatosítás">🌍</button>
                    <!-- Own slot -->
                    <span v-if="getCell(slot).type === 'own'" class="own-tag">Saját</span>
                  </div>
                </td>
              </tr>
              <!-- Slot 16 (Expedition) -->
              <tr class="expedition-row">
                <td class="slot-num">16</td>
                <td class="slot-visual"><span class="p-emoji">✨</span></td>
                <td class="slot-name">Mélyűr (Expedíció)</td>
                <td>—</td>
                <td>—</td>
                <td class="slot-actions">
                  <div class="action-btns">
                    <button class="btn-icon expedition" @click="selectCell({ slot: 16, coords: `[${currentGal}:${currentSys}:16]`, name: 'Mélyűr' }, 'expedition')" title="Expedíció indítása">🚀</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Fleet Tracker (Live Fleet Movements) -->
    <FleetTracker :fleets="trackedFleets" @intercept="openInterceptModal" />

    <!-- Phalanx Scan Button -->
    <div v-if="hasPhalanx" class="panel phalanx-panel">
      <div class="panel-body phalanx-row">
        <span class="phalanx-icon">📡</span>
        <span class="phalanx-label">Szenzor Falanx (Szint {{ phalanxLevel }})</span>
        <span class="phalanx-range">Hatótáv: ±{{ phalanxLevel * 2 }} rendszer</span>
        <button class="btn-scan" @click="doScanPhalanx" :disabled="scanning">
          {{ scanning ? 'Szkennelés...' : 'Szkennel' }}
        </button>
      </div>
      <div v-if="scanResults.length > 0" class="scan-results">
        <div class="scan-title">Észlelt flották:</div>
        <div v-for="s in scanResults" :key="s.id" class="scan-item">
          <span class="scan-owner">{{ s.owner_name }}</span>
          <span class="scan-route">{{ s.origin_coords }} → {{ s.target_coords }}</span>
          <span class="scan-type">{{ missionLabel(s.mission_type) }}</span>
        </div>
      </div>
    </div>

    <!-- Intercept Ship Selection Modal -->
    <Transition name="fade">
      <div v-if="showInterceptModal" class="modal-overlay" @click.self="showInterceptModal = false">
        <div class="panel fleet-setup-modal">
          <div class="panel-header">
            <h3>🎯 Elfogás indítása</h3>
            <button class="close-btn" @click="showInterceptModal = false">✕</button>
          </div>
          <div class="panel-body">
            <div class="target-summary">
              Célpont: <strong>{{ interceptTarget?.owner_name }}</strong> flottája → {{ interceptTarget?.target_coords }}
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
                  <button class="btn-xs" @click="interceptShips[ship.id] = ship.count">MAX</button>
                  <input type="number" v-model.number="interceptShips[ship.id]" min="0" :max="ship.count" class="ship-input" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-primary btn-danger" @click="confirmIntercept" :disabled="!hasInterceptShips || !!actionBusy">
                {{ actionBusy ? '...' : '🎯 ELFOGÁS INDÍTÁSA' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Fleet Setup Modal (Overlay) -->
    <Transition name="fade">
      <div v-if="showFleetSetup" class="modal-overlay" @click.self="showFleetSetup = false">
        <div class="panel fleet-setup-modal">
          <div class="panel-header">
            <h3>🚀 {{ missionTitle }} indítása</h3>
            <button class="close-btn" @click="showFleetSetup = false">✕</button>
          </div>
          <div class="panel-body">
            <div class="target-summary">
              Célpont: <strong>{{ selected?.name || 'Törmelékmező' }}</strong> {{ selected?.coords }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useAuthStore } from '@/stores/auth.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';
import { audio } from '@/utils/botAudio.js';
import FleetTracker from '@/components/FleetTracker.vue';

const game = useGameStore();
const auth = useAuthStore();
const L    = useLangStore();

const currentGal = ref(1);
const currentSys = ref(1);
const loading    = ref(false);
const players    = ref([]);
const dominance  = ref({});
const selected   = ref(null);
const actionBusy = ref(null);
const territoryClaims = ref([]);
const relayPoints = ref([]);

const currentDominator = computed(() => dominance.value[currentGal.value]);

const galaxyBonus = computed(() => {
    const bonuses = {
        1: 'Standard Galaxis: Nincsenek speciális bónuszok.',
        2: 'Vasháló Galaxis: +10% Fém termelés.',
        3: 'Kristályköd Galaxis: +10% Kristály termelés.',
        4: 'Sötét Energia Galaxis: +15% Déusium kitermelés.',
        5: 'Szoláris Galaxis: +15% Energia termelés.',
        6: 'Ipari Galaxis: +15% Fém, de -5% Kristály termelés.',
        7: 'Ragyogó Galaxis: +15% Kristály, de -5% Fém termelés.',
        8: 'Hiper-Vákuum: +25% Déusium, de -10% Energia hatékonyság.',
        9: 'Mélyűr (Deep Space): +10% Fém, +10% Kristály és +10% Déusium termelés.'
    };
    return bonuses[currentGal.value] || 'Ismeretlen szektor.';
});

const showFleetSetup = ref(false);
const missionType    = ref(null);
const selectedShips  = ref({});

const missionTitle = computed(() => {
    if (missionType.value === 'spy') return 'Kémflotta';
    if (missionType.value === 'attack') return 'Támadó flotta';
    if (missionType.value === 'harvest') return 'Recycle flotta';
    if (missionType.value === 'expedition') return 'Expedíciós flotta';
    return 'Flotta';
});

const availableShips = computed(() => {
    let ships = game.fleet.filter(f => f.count > 0);
    if (missionType.value === 'harvest') {
        return ships.sort((a,b) => (b.id === 'recycler') - (a.id === 'recycler'));
    }
    return ships;
});

const hasSelectedShips = computed(() => Object.values(selectedShips.value).some(v => v > 0));
const hasColonyShip = computed(() => game.fleet.some(f => f.id === 'colony' && f.count > 0));

// ── Fleet Tracker state ──
const trackedFleets = ref([]);
const scanning = ref(false);
const scanResults = ref([]);
const showInterceptModal = ref(false);
const interceptTarget = ref(null);
const interceptShips = ref({});
const hasInterceptShips = computed(() => Object.values(interceptShips.value).some(v => v > 0));

// Phalanx detection
const hasPhalanx = computed(() => {
  const buildings = game.activePlanet?.buildings || [];
  const phalanx = buildings.find(b => b.id === 'sensor_phalanx');
  return phalanx && phalanx.level > 0;
});
const phalanxLevel = computed(() => {
  const buildings = game.activePlanet?.buildings || [];
  return buildings.find(b => b.id === 'sensor_phalanx')?.level || 0;
});

function missionLabel(type) {
  return { spy: 'Kém', attack: 'Támadás', harvest: 'Bányász', expedition: 'Expedíció', colonize: 'Gyarmat', intercept: 'Elfogás', unknown: '???' }[type] || type;
}

function changeGal(delta) {
  audio.click();
  currentGal.value = Math.max(1, Math.min(9, currentGal.value + delta));
  loadGalaxy();
}
function changeSys(delta) {
  audio.click();
  currentSys.value = Math.max(1, Math.min(499, currentSys.value + delta));
  loadGalaxy();
}

async function loadGalaxy() {
  loading.value = true;
  try {
    const [galData, domData, terData] = await Promise.all([
      api.getGalaxy(currentGal.value, currentSys.value),
      api.get('/alliance/dominance'),
      api.getTerritoryMap(currentGal.value)
    ]);
    players.value = galData.players || [];
    dominance.value = domData.sectors || {};
    territoryClaims.value = terData.claims || [];
    relayPoints.value = terData.relays || [];
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  loading.value = false;
}

function getSystemClaim(systemNum) {
  return territoryClaims.value.find(c => c.system_num === systemNum);
}

function getSystemRelay(systemNum) {
  return relayPoints.value.find(r => r.system_num === systemNum);
}

function allianceColor(allianceId) {
  if (!allianceId) return '';
  let hash = 0;
  for (let i = 0; i < allianceId.length; i++) { hash = allianceId.charCodeAt(i) + ((hash << 5) - hash); }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

function getCell(slot) {
  const coords = `[${currentGal.value}:${currentSys.value}:${slot}]`;
  const p = players.value.find(x => x.coords === coords);
  if (!p) return { slot, coords, type: 'empty', debris_metal: 0, debris_crystal: 0, hasMoon: false };
  
  const isOwn = p.username === auth.username;
  return {
    slot, coords,
    type: isOwn ? 'own' : 'enemy',
    emoji: p.planet_emoji,
    name: p.planet_name,
    username: p.username,
    score: p.score,
    targetUserId: p.user_id,
    debris_metal: p.debris_metal || 0,
    debris_crystal: p.debris_crystal || 0,
    hasMoon: !!p.has_moon
  };
}

function selectCell(cell, type) {
  audio.click();
  selected.value = cell;
  missionType.value = type;
  showFleetSetup.value = true;
  selectedShips.value = {};
  availableShips.value.forEach(s => selectedShips.value[s.id] = 0);
  
  if (type === 'spy') {
    const s = availableShips.value.find(x => x.id === 'fighter_s' || x.id === 'spy');
    if (s) selectedShips.value[s.id] = 1;
  } else if (type === 'harvest') {
    const r = availableShips.value.find(x => x.id === 'recycler');
    if (r) selectedShips.value[r.id] = Math.min(r.count, Math.ceil((cell.debris_metal + cell.debris_crystal) / 20000) || 1);
  }
}

async function confirmMission() {
  if (missionType.value === 'spy') await doSpy();
  else if (missionType.value === 'attack') await doAttack();
  else if (missionType.value === 'harvest') await doHarvest();
  else if (missionType.value === 'expedition') await doExpedition();
}

async function doSpy() {
  actionBusy.value = 'spy';
  try {
    const ships = Object.entries(selectedShips.value).filter(([_, c]) => c > 0).map(([id, count]) => ({ id, count }));
    await api.spy(selected.value.targetUserId, selected.value.coords, selected.value.name, ships);
    audio.mission();
    game.notify('Kémflotta elindult', 'blue');
    showFleetSetup.value = false;
    await game.loadState();
  } catch (e) { audio.error(); game.notify(`❌ ${e.message}`, 'red'); }
  actionBusy.value = null;
}

async function doAttack() {
  actionBusy.value = 'attack';
  try {
    const ships = Object.entries(selectedShips.value).filter(([_, c]) => c > 0).map(([id, count]) => ({ id, count }));
    await api.attack(selected.value.targetUserId, selected.value.coords, selected.value.name, ships);
    audio.mission();
    game.notify('Támadó flotta elindult', 'red');
    showFleetSetup.value = false;
    await game.loadState();
  } catch (e) { audio.error(); game.notify(`❌ ${e.message}`, 'red'); }
  actionBusy.value = null;
}

async function doHarvest() {
    actionBusy.value = 'harvest';
    try {
        const ships = Object.entries(selectedShips.value).filter(([_, c]) => c > 0).map(([id, count]) => ({ id, count }));
        await api.harvest(selected.value.coords, 'Törmelékmező', ships);
        audio.mission();
        game.notify('Recycler flotta elindult', 'blue');
        showFleetSetup.value = false;
        await game.loadState();
    } catch (e) { audio.error(); game.notify(`❌ ${e.message}`, 'red'); }
    actionBusy.value = null;
}

async function doExpedition() {
    actionBusy.value = 'expedition';
    try {
        const ships = Object.entries(selectedShips.value).filter(([_, c]) => c > 0).map(([id, count]) => ({ id, count }));
        await api.expedition(selected.value.coords, ships);
        audio.mission();
        game.notify('Expedíciós flotta elindult a mélyűrbe', 'blue');
        showFleetSetup.value = false;
        await game.loadState();
    } catch (e) { audio.error(); game.notify(`❌ ${e.message}`, 'red'); }
    actionBusy.value = null;
}

// ── Fleet tracking ──
async function loadFleetMovements() {
  try {
    const data = await api.getFleetMovements(currentGal.value, currentSys.value);
    trackedFleets.value = data.fleets || [];
  } catch (e) { /* silent */ }
}

async function doScanPhalanx() {
  scanning.value = true;
  try {
    const data = await api.scanPhalanx(currentGal.value, currentSys.value);
    scanResults.value = data.detected || [];
    audio.click();
    if (scanResults.value.length === 0) {
      game.notify('Nincs észlelt flottamozgás ebben a rendszerben', 'blue');
    } else {
      game.notify(`${scanResults.value.length} flotta észlelve!`, 'green');
    }
    await loadFleetMovements();
  } catch (e) { audio.error(); game.notify(`${e.message}`, 'red'); }
  scanning.value = false;
}

function openInterceptModal(fleet) {
  audio.click();
  interceptTarget.value = fleet;
  showInterceptModal.value = true;
  interceptShips.value = {};
  availableShips.value.forEach(s => interceptShips.value[s.id] = 0);
}

async function confirmIntercept() {
  if (!interceptTarget.value) return;
  actionBusy.value = 'intercept';
  try {
    const ships = Object.entries(interceptShips.value).filter(([_, c]) => c > 0).map(([id, count]) => ({ id, count }));
    await api.interceptFleet(interceptTarget.value.id, ships);
    audio.mission();
    game.notify('Elfogó flotta elindult!', 'red');
    showInterceptModal.value = false;
    await game.loadState();
    await loadFleetMovements();
  } catch (e) { audio.error(); game.notify(`${e.message}`, 'red'); }
  actionBusy.value = null;
}

async function doQuickColonize(cell) {
  actionBusy.value = 'colony';
  try {
    await api.colonize(cell.coords, 'Új gyarmat');
    audio.mission();
    game.notify(`Gyarmatosító hajó elindult: ${cell.coords}`, 'blue');
    await game.loadState();
  } catch (e) { audio.error(); game.notify(`❌ ${e.message}`, 'red'); }
  actionBusy.value = null;
}

let fleetRefreshTimer;
onMounted(() => {
  const m = game.activePlanet?.coords?.match(/\[(\d+):(\d+):(\d+)\]/);
  if (m) { currentGal.value = parseInt(m[1]); currentSys.value = parseInt(m[2]); }
  loadGalaxy();
  loadFleetMovements();
  fleetRefreshTimer = setInterval(loadFleetMovements, 10000);
});
onUnmounted(() => clearInterval(fleetRefreshTimer));
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

.galaxy-bonus-banner {
  margin: 0 10px 10px;
  padding: 8px 15px;
  border-radius: 4px;
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  transition: all 0.3s ease;
}
.bonus-icon { font-size: 14px; }
.bonus-text { color: var(--accent); font-family: 'Exo 2', sans-serif; letter-spacing: 0.5px; }
.dominance-tag { margin-left: auto; font-size: 10px; color: var(--accent); background: rgba(0,200,255,0.1); padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(0,200,255,0.3); animation: pulse-border 2s infinite; }
@keyframes pulse-border { 0%, 100% { border-color: rgba(0,200,255,0.3); } 50% { border-color: var(--accent); } }

/* Galaxy specific themes */
.gal-1 { border-color: var(--border); }
.gal-2 { border-color: var(--metal); box-shadow: inset 0 0 10px rgba(170,187,204,0.1); }
.gal-3 { border-color: var(--crystal); box-shadow: inset 0 0 10px rgba(0,255,255,0.1); }
.gal-4 { border-color: var(--accent); box-shadow: inset 0 0 10px rgba(0,200,255,0.1); }
.gal-5 { border-color: var(--energy); box-shadow: inset 0 0 10px rgba(255,255,0,0.1); }
.gal-6 { border-color: #ff8800; }
.gal-7 { border-color: #ff00ff; }
.gal-8 { border-color: #00ff88; }
.gal-9 { border-color: var(--accent2); background: linear-gradient(90deg, rgba(255,58,122,0.05), transparent); }

.system-panel { width: 100%; }
.no-padding { padding: 0 !important; }
.system-table-wrapper { width: 100%; overflow-x: auto; }
.system-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.system-table th { text-align: left; padding: 12px 15px; background: rgba(255,255,255,0.02); color: var(--text-dim); font-size: 10px; text-transform: uppercase; border-bottom: 1px solid var(--border); }
.system-table td { padding: 10px 15px; border-bottom: 1px solid rgba(26,42,74,0.3); }
.system-table tr:hover td { background: rgba(255,255,255,0.02); }

.expedition-row { background: rgba(0,200,255,0.03); }
.expedition-row td { border-bottom: none; }

.slot-num { font-family: 'Orbitron', sans-serif; color: var(--text-dim); font-size: 10px; }
.p-emoji { font-size: 20px; }
.p-empty { opacity: 0.2; font-size: 18px; }
.p-moon { font-size: 14px; position: absolute; bottom: 5px; right: 5px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); }
.slot-visual { position: relative; }

.empty-text { color: var(--text-dim); font-style: italic; font-size: 11px; }
.player-link { color: var(--accent); cursor: pointer; }
.player-link:hover { text-decoration: underline; }
.own-tag { font-size: 9px; color: var(--accent3); border: 1px solid var(--accent3); padding: 1px 5px; border-radius: 10px; }

.debris-info { font-size: 9px; margin-top: 4px; background: rgba(0,200,255,0.05); padding: 2px 6px; border-radius: 3px; display: inline-block; color: var(--text-dim); }
.d-m { color: var(--metal); }
.d-c { color: var(--crystal); }

.action-btns { display: flex; justify-content: flex-end; gap: 6px; }
.btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-icon:hover { border-color: var(--accent); background: rgba(0,200,255,0.1); transform: translateY(-2px); }
.btn-icon.harvest { border-color: var(--accent3); color: var(--accent3); }
.btn-icon.expedition { border-color: var(--accent4); color: var(--accent4); }
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

/* Territory Overlay */
.territory-banner-row td { padding: 0 !important; border-bottom: none !important; }
.territory-banner {
  padding: 6px 15px !important;
  background: rgba(0,0,0,0.4);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-dim);
  border-left: 3px solid var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}
.territory-tag { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 11px; }
.relay-icon { font-size: 14px; margin-left: auto; animation: pulse-relay 2s infinite; }
@keyframes pulse-relay { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

tr.claimed-system td { background: rgba(var(--claim-color-rgb, 0,200,255), 0.03); border-left: 2px solid var(--claim-color, transparent); }
tr.claimed-system:hover td { background: rgba(var(--claim-color-rgb, 0,200,255), 0.06); }

/* Phalanx Panel */
.phalanx-panel { background: var(--bg-panel); border: 1px solid var(--border); }
.phalanx-row { display: flex; align-items: center; gap: 10px; padding: 10px 15px; }
.phalanx-icon { font-size: 18px; }
.phalanx-label { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--text-bright); text-transform: uppercase; }
.phalanx-range { font-size: 10px; color: var(--text-dim); margin-left: auto; }
.btn-scan { background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.3); color: var(--accent); padding: 5px 12px; border-radius: 4px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 10px; text-transform: uppercase; transition: all 0.2s; }
.btn-scan:hover { background: rgba(0,200,255,0.2); border-color: var(--accent); }
.btn-scan:disabled { opacity: 0.5; cursor: not-allowed; }

.scan-results { padding: 10px 15px; border-top: 1px solid var(--border); }
.scan-title { font-size: 10px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
.scan-item { display: flex; align-items: center; gap: 10px; padding: 6px 10px; background: rgba(255,58,92,0.05); border: 1px solid rgba(255,58,92,0.15); border-radius: 4px; margin-bottom: 4px; font-size: 10px; }
.scan-owner { color: #ff3a5c; font-weight: 600; }
.scan-route { color: var(--text-dim); font-family: 'Orbitron', sans-serif; font-size: 9px; }
.scan-type { margin-left: auto; color: var(--accent); text-transform: uppercase; font-size: 8px; }

/* Intercept button style */
.btn-danger { background: rgba(255,58,92,0.15) !important; border-color: rgba(255,58,92,0.4) !important; color: #ff3a5c !important; }
.btn-danger:hover { background: rgba(255,58,92,0.25) !important; }

@media (max-width: 600px) {
  .nav-row { flex-direction: column; gap: 15px; }
  .system-table th:nth-child(5), .system-table td:nth-child(5) { display: none; }
  .phalanx-row { flex-wrap: wrap; }
}
</style>
