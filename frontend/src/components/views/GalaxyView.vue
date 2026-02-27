<template>
  <div class="galaxy-layout">
    <div class="panel galaxy-panel">
      <div class="panel-header">
        <span class="panel-icon">🌌</span>
        <h3>Galaxis Térkép</h3>
        <div class="galaxy-legend" style="margin-left:auto;display:flex;gap:10px;font-size:10px;">
          <span style="color:var(--accent3);">■ Sajátod</span>
          <span style="color:var(--accent2);">■ Ellenség</span>
          <span style="color:var(--accent4);">■ Semleges</span>
          <span style="color:var(--text-dim);">■ Üres</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="galaxy-grid">
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
            </div>
          </div>
          <div class="cd-actions" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
            <button
              class="btn-primary"
              :disabled="actionBusy"
              @click="doSpy"
            >{{ actionBusy === 'spy' ? '...' : '🔍 Kémkedés' }}</button>
            <button
              class="btn-primary"
              v-if="selected.type === 'enemy'"
              :disabled="actionBusy"
              @click="doAttack"
            >{{ actionBusy === 'attack' ? '...' : '⚔️ Támadás' }}</button>
            <button
              class="btn-primary"
              v-if="selected.type === 'empty'"
              :disabled="actionBusy || !hasColonyShip"
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
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useAuthStore } from '@/stores/auth.js';

const game = useGameStore();
const auth = useAuthStore();
const selected = ref(null);
const actionBusy = ref(null);

const typeLabel = (t) => ({ own: 'Saját bolygó', enemy: 'Ellenséges', neutral: 'Semleges', empty: 'Üres rendszer' })[t] || t;

const hasColonyShip = computed(() => {
  const ship = game.fleet.find(f => f.id === 'colony');
  return ship && ship.count > 0;
});

// Deterministic seeded random based on auth user id + cell index
function seededRand(seed, idx) {
  const s = seed + idx * 2654435761;
  return ((s ^ (s >>> 16)) * 0x45d9f3b) % 1 === 0
    ? Math.abs(Math.sin(s)) % 1
    : Math.abs(Math.sin(seed * idx + 1)) % 1;
}

const galaxyCells = computed(() => {
  const seed = auth.username ? auth.username.charCodeAt(0) * 31 : 42;
  const cells = [];
  const ownPlanets = game.planets;

  for (let i = 0; i < 100; i++) {
    const r = seededRand(seed, i);
    let type = 'empty';
    let emoji = '';
    const row = Math.floor(i / 10) + 1;
    const col = (i % 10) + 1;
    const slot = Math.floor(seededRand(seed + 7, i) * 15) + 1;
    const coords = `[${row}:${col}:${slot}]`;
    let name = `Rendszer ${row}:${col}`;

    // Place own planets at their actual coordinates or first slots
    const ownIdx = ownPlanets.findIndex((p, pi) => {
      const targetI = pi * 11 + 3; // deterministic placement
      return targetI === i;
    });

    if (ownIdx >= 0) {
      type = 'own';
      emoji = ownPlanets[ownIdx].emoji || '🌍';
      name = ownPlanets[ownIdx].name;
    } else if (r < 0.12) {
      type = 'enemy';
      emoji = ['🔴','🌑','⭕'][Math.floor(seededRand(seed + 3, i) * 3)];
    } else if (r < 0.22) {
      type = 'neutral';
      emoji = ['🟡','🟠','🟤'][Math.floor(seededRand(seed + 5, i) * 3)];
    }

    cells.push({ id: i, type, emoji, name, coords, tooltip: `${name} ${coords}` });
  }
  return cells;
});

function selectCell(cell) { selected.value = cell; }

async function doSpy() {
  if (!selected.value) return;
  actionBusy.value = 'spy';
  // TODO: POST /api/fleet/spy when mission system is implemented
  await new Promise(r => setTimeout(r, 600));
  game.notify('🔍 Kém úton van... (hamarosan elérhető)', 'blue');
  actionBusy.value = null;
}

async function doAttack() {
  if (!selected.value) return;
  actionBusy.value = 'attack';
  // TODO: POST /api/fleet/attack when mission system is implemented
  await new Promise(r => setTimeout(r, 600));
  game.notify('⚔️ Flottaküldés hamarosan elérhető!', 'blue');
  actionBusy.value = null;
}

async function doColonize() {
  if (!selected.value || !hasColonyShip.value) return;
  actionBusy.value = 'colony';
  // TODO: POST /api/fleet/colonize when mission system is implemented
  await new Promise(r => setTimeout(r, 600));
  game.notify('🌍 Gyarmatosítás hamarosan elérhető!', 'blue');
  actionBusy.value = null;
}
</script>

<style scoped>
.galaxy-layout { display: flex; flex-direction: column; gap: 12px; }
.galaxy-panel { width: 100%; }
.galaxy-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; }
.galaxy-cell { aspect-ratio: 1; border: 1px solid rgba(26,42,74,0.4); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.15s; background: rgba(0,0,0,0.3); }
.galaxy-cell:hover { border-color: var(--accent); background: rgba(0,200,255,0.1); z-index: 1; }
.galaxy-cell.own     { border-color: var(--accent3); background: rgba(58,255,122,0.08); }
.galaxy-cell.enemy   { border-color: var(--accent2); background: rgba(255,58,122,0.08); }
.galaxy-cell.neutral { border-color: var(--accent4); background: rgba(255,215,0,0.06); }
.galaxy-cell.empty   { opacity: 0.3; }

.cell-info { }
.cell-detail { display: flex; gap: 14px; align-items: center; }
.cd-emoji { font-size: 40px; }
.cd-name   { font-size: 14px; color: var(--text-bright); font-weight: 600; }
.cd-coords { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent); }
.cd-type   { font-size: 11px; margin-top: 4px; }
.text-own     { color: var(--accent3); }
.text-enemy   { color: var(--accent2); }
.text-neutral { color: var(--accent4); }
.text-empty   { color: var(--text-dim); }
.action-hint { font-size: 10px; color: var(--accent4); margin-top: 6px; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
