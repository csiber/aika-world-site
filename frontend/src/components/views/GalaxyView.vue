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
            <button class="btn-primary" @click="game.notify('Kém küldetés indítva!', 'blue')">🔍 Kémkedés</button>
            <button class="btn-primary" v-if="selected.type === 'enemy'" @click="game.notify('Flotta küldése...', 'blue')">⚔️ Támadás</button>
            <button class="btn-primary" v-if="selected.type === 'empty'" @click="game.notify('Gyarmatosító hajót kell küldeni!', 'blue')">🌍 Gyarmatosítás</button>
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

const typeLabel = (t) => ({ own: 'Saját bolygó', enemy: 'Ellenséges', neutral: 'Semleges', empty: 'Üres rendszer' })[t] || t;

// Generate a deterministic galaxy grid
const galaxyCells = computed(() => {
  const cells = [];
  const ownPlanets = game.planets.map((p, i) => ({ idx: Math.floor(Math.random() * 100), planet: p }));
  for (let i = 0; i < 100; i++) {
    const r = Math.random();
    let type = 'empty';
    let emoji = '';
    let name = `Rendszer ${i + 1}`;
    let tooltip = `[${Math.floor(i/10)+1}:${(i%10)+1}:${Math.ceil(Math.random()*15)}]`;

    if (i < 3) { // own planets
      type = 'own';
      emoji = game.planets[i]?.emoji || '🌍';
      name  = game.planets[i]?.name  || name;
    } else if (r < 0.12) {
      type = 'enemy'; emoji = ['🔴','🌑','⭕'][Math.floor(Math.random()*3)];
    } else if (r < 0.22) {
      type = 'neutral'; emoji = ['🟡','🟠','🟤'][Math.floor(Math.random()*3)];
    }

    cells.push({ id: i, type, emoji, name, coords: tooltip, tooltip: `${name} ${tooltip}` });
  }
  return cells;
});

function selectCell(cell) { selected.value = cell; }
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

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
