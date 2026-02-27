<template>
  <div class="overview-grid">
    <!-- LEFT: Buildings quick -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">🏗️</span><h3>Épületek</h3></div>
      <div class="panel-body scroll-list">
        <div class="section-title">Termelés</div>
        <BuildingItem v-for="b in prodBuildings" :key="b.id" :building="b" />
        <div class="section-title" style="margin-top:12px;">Infrastruktúra</div>
        <BuildingItem v-for="b in infraBuildings" :key="b.id" :building="b" />
      </div>
    </div>

    <!-- CENTER: Planet + Queue -->
    <div id="planet-view">
      <!-- Planet visual -->
      <div class="planet-visual panel">
        <div class="big-planet">🌍</div>
        <div class="planet-stats">
          <h2>{{ activePlanet.name }}</h2>
          <div class="planet-coords-big">KOORDINÁTA: {{ activePlanet.coords }}</div>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-label">Épületek</div>
              <div class="stat-value">{{ buildings.length }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Flotta</div>
              <div class="stat-value">{{ totalShips }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Termelés</div>
              <div class="stat-value">{{ rates.metal?.toFixed(0) }}/h</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Pontszám</div>
              <div class="stat-value">{{ score.toLocaleString('hu') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Build Queue -->
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">⚒️</span><h3>Építési Sor</h3></div>
        <div class="panel-body">
          <div v-if="!queue.length" class="empty-msg">Nincs aktív építés.</div>
          <QueueItem v-for="q in queue" :key="q.id || q.item_id" :item="q" />
        </div>
      </div>

      <!-- Aika AI chat -->
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">🤖</span><h3>AIKA Asszisztens</h3></div>
        <div class="panel-body">
          <div class="aika-chat">
            <div class="aika-bubble">
              <div class="aika-text">{{ currentAikaMsg }}</div>
            </div>
            <div class="aika-input-row">
              <input v-model="aikaInput" class="aika-input" placeholder="Kérdezd meg Aikát..." @keydown.enter="sendToAika" />
              <button class="aika-send" @click="sendToAika">KÜLD</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Stats -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">📊</span><h3>Statisztikák</h3></div>
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
        <div class="section-title" style="margin-top:12px;">Flotta összesítő</div>
        <div class="stat-block">
          <div v-for="ship in fleet" :key="ship.id" class="stat-row">
            <span>{{ ship.icon }} {{ ship.name }}</span>
            <span class="sv">{{ ship.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import BuildingItem from '@/components/BuildingItem.vue';
import QueueItem    from '@/components/QueueItem.vue';

const game = useGameStore();
const prodBuildings  = computed(() => game.prodBuildings);
const infraBuildings = computed(() => game.infraBuildings);
const buildings = computed(() => game.buildings);
const resources = computed(() => game.resources);
const rates     = computed(() => game.rates);
const fleet     = computed(() => game.fleet);
const score     = computed(() => game.score);
const planets   = computed(() => game.planets);
const queue     = computed(() => game.queue);
const activePlanet = computed(() => planets.value[0] || { name: 'Ismeretlen', coords: '[?:?:?]' });
const totalShips    = computed(() => fleet.value.reduce((s, f) => s + f.count, 0));

const aikaInput = ref('');
const aikaMessages = [
  'Termelésed optimális. A fémolvasztó fejlesztése prioritás.',
  'Figyelem: egy ellenséges játékos közeledik. Erősítsd a védelmet!',
  'A Déusium Reaktor szintjének növelése nyitja meg a fejlettebb kutatásokat.',
  'Javaslom az Asztrofizika kutatást — egy negyedik bolygó gyarmatosítható lenne.',
  'Kristálytermelésed alacsony. Fontold meg a kristálybánya fejlesztését.',
  'A flottád optimálisan konfiguráltnak tűnik az aktuális szintedhez képest.',
  'Szövetségbe lépés erősen ajánlott a te szinteden.',
];
let aikaIdx = 0;
const currentAikaMsg = ref(aikaMessages[0]);

function sendToAika() {
  if (!aikaInput.value.trim()) return;
  aikaInput.value = '';
  aikaIdx = (aikaIdx + 1) % aikaMessages.length;
  currentAikaMsg.value = aikaMessages[aikaIdx];
  game.notify('💬 Aika válaszolt', 'blue');
}
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
.big-planet {
  font-size: 80px;
  filter: drop-shadow(0 0 30px rgba(0,150,255,0.4));
  animation: float 6s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.planet-stats h2 { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 900; color: var(--text-bright); margin-bottom: 4px; }
.planet-coords-big { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent); margin-bottom: 12px; letter-spacing: 2px; }
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat-item { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 6px 10px; }
.stat-label { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; }
.stat-value { font-family: 'Orbitron', sans-serif; font-size: 13px; color: var(--text-bright); font-weight: 600; }

#planet-view { display: flex; flex-direction: column; gap: 10px; }

.empty-msg { font-size: 11px; color: var(--text-dim); padding: 8px 0; }

.aika-chat { background: rgba(0,0,0,0.4); border: 1px solid rgba(0,200,255,0.2); border-radius: 4px; padding: 10px; }
.aika-bubble { margin-bottom: 8px; }
.aika-text { background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.2); border-radius: 4px; padding: 6px 10px; font-size: 11px; color: var(--text); line-height: 1.5; }
.aika-input-row { display: flex; gap: 6px; margin-top: 6px; }
.aika-input { flex: 1; background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text); padding: 5px 10px; font-size: 11px; border-radius: 3px; font-family: 'Exo 2', sans-serif; outline: none; transition: border-color 0.2s; }
.aika-input:focus { border-color: var(--accent); }
.aika-send { padding: 5px 12px; background: rgba(0,200,255,0.15); border: 1px solid var(--accent); color: var(--accent); border-radius: 3px; cursor: pointer; font-size: 11px; font-family: 'Orbitron', sans-serif; transition: all 0.2s; }
.aika-send:hover { background: rgba(0,200,255,0.3); }

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
</style>
