<template>
  <div class="galaxy-layout">
    <div class="panel galaxy-panel">
      <div class="panel-header">
        <span class="panel-icon">🌌</span>
        <h3>Galaxis Térkép</h3>
        <div class="galaxy-legend" style="margin-left:auto;display:flex;gap:10px;font-size:10px;">
          <span style="color:var(--accent3);">■ Sajátod</span>
          <span style="color:var(--accent2);">■ Ellenség</span>
          <span style="color:var(--text-dim);">■ Üres</span>
        </div>
        <button class="btn-refresh" @click="loadGalaxy" :disabled="loading" style="margin-left:10px;">
          {{ loading ? '...' : '↻' }}
        </button>
      </div>
      <div class="panel-body">
        <div v-if="loading && !galaxyCells.length" class="empty-msg" style="padding:20px 0;">Galaxis betöltése...</div>
        <div v-else class="galaxy-grid">
          <div
            v-for="cell in galaxyCells"
            :key="cell.id"
            class="galaxy-cell"
            :class="cell.type"
            :title="cell.tooltip"
            @click="selectCell(cell)"
          >
            <span v-if="cell.emoji">{{ cell.emoji }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected cell info -->
    <Transition name="slide">
      <div v-if="selected" class="panel cell-info">
        <div class="panel-header"><span class="panel-icon">📍</span><h3>Rendszer Info</h3></div>
        <div class="panel-body">
          <div class="cell-detail">
            <div class="cd-emoji">{{ selected.emoji || '🌑' }}</div>
            <div>
              <div class="cd-name">{{ selected.name }}</div>
              <div class="cd-coords">{{ selected.coords }}</div>
              <div class="cd-type" :class="'text-' + selected.type">{{ typeLabel(selected.type) }}</div>
              <div v-if="selected.username" class="cd-player">👤 {{ selected.username }}</div>
            </div>
          </div>
          <div v-if="selected.type !== 'own'" class="cd-actions" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
            <button
              class="btn-primary"
              :disabled="!!actionBusy"
              @click="doSpy"
            >{{ actionBusy === 'spy' ? '...' : '🔍 Kémkedés' }}</button>
            <button
              class="btn-primary"
              v-if="selected.type === 'enemy' && selected.targetUserId"
              :disabled="!!actionBusy"
              @click="doAttack"
            >{{ actionBusy === 'attack' ? '...' : '⚔️ Támadás' }}</button>
            <button
              class="btn-primary"
              v-if="selected.type === 'empty'"
              :disabled="!!actionBusy || !hasColonyShip"
              @click="doColonize"
              :title="!hasColonyShip ? 'Szükséges: Gyarmatosító hajó' : ''"
            >{{ actionBusy === 'colony' ? '...' : '🌍 Gyarmatosítás' }}</button>
          </div>
          <div v-if="!hasColonyShip && selected.type === 'empty'" class="action-hint">
            ⚠️ Gyarmatosító hajó szükséges
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
import { api } from '@/api/client.js';

const game = useGameStore();
const auth = useAuthStore();
const selected   = ref(null);
const actionBusy = ref(null);
const loading    = ref(false);
const players    = ref([]);
const apiMyPlanets = ref([]);

const typeLabel = (t) => ({
  own:   'Saját bolygó',
  enemy: 'Ellenséges',
  empty: 'Üres rendszer',
})[t] || t;

const hasColonyShip = computed(() => {
  const ship = game.fleet.find(f => f.id === 'colony');
  return ship && ship.count > 0;
});

function parseCoords(coords) {
  const m = coords?.match(/\[(\d+):(\d+):(\d+)\]/);
  if (!m) return null;
  return { row: parseInt(m[1]), col: parseInt(m[2]), slot: parseInt(m[3]) };
}

async function loadGalaxy() {
  loading.value = true;
  try {
    const data = await api.getGalaxy();
    players.value    = data.players    || [];
    apiMyPlanets.value = data.myPlanets || [];
  } catch {
    players.value    = [];
    apiMyPlanets.value = game.planets;
  }
  loading.value = false;
}

const galaxyCells = computed(() => {
  const myUsername = auth.username;

  // Build player map keyed by "row:col" → player (highest score wins if collision)
  const playerMap = new Map();
  for (const p of players.value) {
    const parsed = parseCoords(p.coords);
    if (!parsed) continue;
    const key = `${parsed.row}:${parsed.col}`;
    if (!playerMap.has(key) || (playerMap.get(key).score || 0) < (p.score || 0)) {
      playerMap.set(key, p);
    }
  }

  // Build own planets map
  const ownPlanets = apiMyPlanets.value.length ? apiMyPlanets.value : game.planets;
  const ownMap = new Map();
  for (const p of ownPlanets) {
    const parsed = parseCoords(p.coords);
    if (!parsed) continue;
    ownMap.set(`${parsed.row}:${parsed.col}`, p);
  }

  const cells = [];
  for (let i = 0; i < 100; i++) {
    const row  = Math.floor(i / 10) + 1;
    const col  = (i % 10) + 1;
    const key  = `${row}:${col}`;
    const slot = ((row * 31 + col * 17) % 15) + 1;
    const coords = `[${row}:${col}:${slot}]`;

    if (ownMap.has(key)) {
      const p = ownMap.get(key);
      cells.push({ id: i, type: 'own', emoji: p.emoji || '🌍', name: p.name, coords: p.coords, targetUserId: null, username: myUsername, tooltip: `${p.name} ${p.coords} (Saját)` });
      continue;
    }

    if (playerMap.has(key)) {
      const p = playerMap.get(key);
      if (p.username === myUsername) {
        cells.push({ id: i, type: 'own', emoji: p.planet_emoji || '🌍', name: p.planet_name, coords: p.coords, targetUserId: p.user_id, username: p.username, tooltip: `${p.planet_name} ${p.coords} (Saját)` });
      } else {
        cells.push({ id: i, type: 'enemy', emoji: p.planet_emoji || '🔴', name: p.planet_name || p.username, coords: p.coords, targetUserId: p.user_id, username: p.username, tooltip: `${p.planet_name || p.username} ${p.coords}` });
      }
      continue;
    }

    cells.push({ id: i, type: 'empty', emoji: '', name: `Üres rendszer ${row}:${col}`, coords, targetUserId: null, username: null, tooltip: `Üres ${coords}` });
  }

  return cells;
});

function selectCell(cell) { selected.value = cell; }

async function doSpy() {
  if (!selected.value) return;
  actionBusy.value = 'spy';
  try {
    await api.spy(selected.value.targetUserId || null, selected.value.coords, selected.value.name);
    game.notify('🔍 Kém úton van! Ellenőrizd az Üzenetek menüpontot, ha megérkezett.', 'blue');
  } catch (e) {
    game.notify(`❌ ${e.message}`, 'red');
  }
  actionBusy.value = null;
}

async function doAttack() {
  if (!selected.value) return;
  actionBusy.value = 'attack';
  try {
    await api.attack(selected.value.targetUserId, selected.value.coords, selected.value.name);
    game.notify('⚔️ Flottád elindult! Ellenőrizd az Üzenetek menüpontot, ha megérkezett.', 'blue');
  } catch (e) {
    game.notify(`❌ ${e.message}`, 'red');
  }
  actionBusy.value = null;
}

async function doColonize() {
  if (!selected.value || !hasColonyShip.value) return;
  actionBusy.value = 'colony';
  try {
    await api.colonize(selected.value.coords, selected.value.name);
    game.notify(`🌍 Gyarmatosító úton van ${selected.value.coords} felé!`, 'blue');
    selected.value = null;
    await loadGalaxy();
  } catch (e) {
    game.notify(`❌ ${e.message}`, 'red');
  }
  actionBusy.value = null;
}

onMounted(loadGalaxy);
</script>

<style scoped>
.galaxy-layout { display: flex; flex-direction: column; gap: 12px; }
.galaxy-panel { width: 100%; }
.galaxy-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; }
.galaxy-cell { aspect-ratio: 1; border: 1px solid rgba(26,42,74,0.4); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.15s; background: rgba(0,0,0,0.3); }
.galaxy-cell:hover { border-color: var(--accent); background: rgba(0,200,255,0.1); z-index: 1; }
.galaxy-cell.own     { border-color: var(--accent3); background: rgba(58,255,122,0.08); }
.galaxy-cell.enemy   { border-color: var(--accent2); background: rgba(255,58,122,0.08); }
.galaxy-cell.empty   { opacity: 0.3; }

.btn-refresh { background: none; border: 1px solid var(--border); color: var(--text-dim); width: 26px; height: 26px; border-radius: 3px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-refresh:hover { border-color: var(--accent); color: var(--accent); }

.cell-info { }
.cell-detail { display: flex; gap: 14px; align-items: center; }
.cd-emoji { font-size: 40px; }
.cd-name   { font-size: 14px; color: var(--text-bright); font-weight: 600; }
.cd-coords { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent); }
.cd-type   { font-size: 11px; margin-top: 4px; }
.cd-player { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
.text-own     { color: var(--accent3); }
.text-enemy   { color: var(--accent2); }
.text-empty   { color: var(--text-dim); }
.action-hint { font-size: 10px; color: var(--accent4); margin-top: 6px; }
.cd-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
.empty-msg { color: var(--text-dim); font-size: 11px; }
</style>
