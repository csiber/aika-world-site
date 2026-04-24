<template>
  <div>
    <div class="view-header">
      <div class="view-title">ÉPÜLETEK</div>
      <div class="view-sub">{{ activePlanet.name }} · {{ activePlanet.coords }}</div>
    </div>

    <div class="bld-grid">
      <div v-for="b in allBuildings" :key="b.id"
        class="bld-card"
        :class="{ 'bld-locked': !b.level }"
      >
        <!-- Header with illustration + animation layers -->
        <div class="bld-card-header" :style="{ borderTopColor: resolveColor(b.color) }">
          <BuildingIllustration :building-id="b.id" :color="resolveColor(b.color)" :width="220" :height="80" />
          <BuildingAnim v-if="b.level > 0" :building-id="b.id" :color="resolveColor(b.color)" :width="220" :height="80" />
          <!-- Overlay content (z-index above canvas) -->
          <div class="bld-card-overlay">
            <div class="bld-card-sym" :style="{ background: resolveColor(b.color) + '22', color: resolveColor(b.color) }">{{ b.symbol }}</div>
            <div class="bld-card-meta">
              <div class="bld-card-name">{{ b.name }}</div>
              <div class="bld-card-level" :style="{ color: resolveColor(b.color) }">
                {{ b.level ? `SZINT ${b.level}` : 'NEM ÉPÍTETT' }}
              </div>
            </div>
            <span v-if="b.level" class="bld-lv-tag" :style="{ borderColor: resolveColor(b.color) + '55', color: resolveColor(b.color) }">
              LV.{{ b.level }}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="bld-card-body">
          <div class="bld-cost-row">
            <span style="color:var(--metal)">◈ {{ fmt(buildCost(b, 'metal')) }}</span>
            <span style="color:var(--crystal)">◆ {{ fmt(buildCost(b, 'crystal')) }}</span>
            <span style="color:var(--energy)">⚡ {{ fmt(buildCost(b, 'energy')) }}</span>
          </div>
          <div class="bld-prog-wrap">
            <div class="bld-prog-bar">
              <div class="bld-prog-fill" :style="{ width: Math.min(100, (b.level / 20) * 100) + '%', background: resolveColor(b.color) }" />
            </div>
            <span class="bld-prog-label">{{ b.level }}/20</span>
          </div>
          <div class="bld-card-footer">
            <button class="btn-primary bld-btn"
              :style="{ borderColor: resolveColor(b.color) + '66', color: resolveColor(b.color) }"
              @click="upgradeBuilding(b)"
              :disabled="isInQueue(b.id)"
            >
              {{ !b.level ? 'MEGÉPÍT' : isInQueue(b.id) ? 'SORBAN...' : 'FEJLESZT' }}
            </button>
            <div v-if="b.productionInfo" class="bld-prod-info" :style="{ color: resolveColor(b.color) }">
              +{{ b.productionInfo }}/h
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
import { audio }        from '@/utils/botAudio.js';
import BuildingIllustration from '@/components/BuildingIllustration.vue';
import BuildingAnim         from '@/components/BuildingAnim.vue';

const game = useGameStore();
const L    = useLangStore();

const activePlanet   = computed(() => game.activePlanet || { name: '—', coords: '[?:?:?]' });
const queue          = computed(() => game.queue || []);

// CSS var resolver
function resolveColor(color) {
  if (!color) return '#1ac8e8';
  if (!color.startsWith('var(')) return color;
  const map = {
    'var(--metal)':   '#78aad0',
    'var(--crystal)': '#9878f0',
    'var(--energy)':  '#f0c840',
    'var(--accent)':  '#1ac8e8',
    'var(--accent2)': '#e83a6a',
    'var(--accent3)': '#3ae88a',
    'var(--accent4)': '#e8b450',
  };
  return map[color] || '#1ac8e8';
}

const fmt = (n) => Math.floor(n || 0).toLocaleString('hu');
const isInQueue = (id) => queue.value.some(q => q.building_id === id || q.item_id === id);

// Cost formula matching the game (simplified)
function buildCost(b, type) {
  const base = { metal: 1200, crystal: 800, energy: 200 };
  const mult = { metal: 1250, crystal: 840, energy: 220 };
  const lv   = b.level || 1;
  return Math.round((base[type] || 1000) * Math.pow(1.6, lv - 1));
}

async function upgradeBuilding(b) {
  try {
    await game.upgradeBuilding(b.id);
    audio.success();
  } catch (e) {
    game.notify(`❌ ${e.message}`, 'red');
  }
}

// Merge game buildings with extras that might have 0 level
const allBuildings = computed(() => {
  const gameBuildings = game.buildings || [];
  const extraDefs = [
    { id:'crystal_refinery', name:'Kristály Finomító', color:'var(--crystal)', type:'prod',  symbol:'CR', level:0 },
    { id:'fusion_reactor',   name:'Fúziós Reaktor',   color:'var(--energy)',  type:'prod',  symbol:'FR', level:0 },
    { id:'lunar_dock',       name:'Hold Dokk',         color:'var(--metal)',   type:'infra', symbol:'LD', level:0 },
    { id:'ion_cannon',       name:'Ion Ágyú',          color:'var(--accent2)', type:'infra', symbol:'IC', level:0 },
  ];
  const existingIds = new Set(gameBuildings.map(b => b.id));
  const extras = extraDefs.filter(e => !existingIds.has(e.id));
  return [...gameBuildings, ...extras];
});
</script>

<style scoped>
.view-header{margin-bottom:12px}
.view-title{font-family:'Orbitron',sans-serif;font-size:13px;font-weight:700;color:var(--accent);letter-spacing:3px}
.view-sub{font-family:'Space Mono',monospace;font-size:9px;color:var(--text-dim);margin-top:3px}

.bld-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}

.bld-card{background:var(--bg-card);border:1px solid var(--border);border-radius:4px;overflow:hidden;transition:all .2s}
.bld-card:hover{border-color:var(--border-glow);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.bld-card.bld-locked{opacity:.55}

/* Header: illustration + animation + overlay */
.bld-card-header{
  position:relative;overflow:hidden;min-height:80px;
  border-top:2px solid transparent;
  display:flex;align-items:flex-end;
}
.bld-card-overlay{
  position:relative;z-index:2;
  display:flex;align-items:center;gap:10px;
  padding:8px 10px;width:100%;
  background:linear-gradient(0deg,rgba(3,8,16,.85) 0%,rgba(3,8,16,.4) 60%,transparent 100%);
}
.bld-card-sym{
  font-family:'Orbitron',sans-serif;font-size:12px;font-weight:900;
  width:32px;height:32px;border-radius:3px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.bld-card-meta{flex:1;min-width:0}
.bld-card-name{font-size:11px;color:var(--text-bright);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bld-card-level{font-family:'Orbitron',sans-serif;font-size:8px;letter-spacing:1px;margin-top:2px}
.bld-lv-tag{font-family:'Orbitron',sans-serif;font-size:8px;letter-spacing:1px;padding:2px 5px;border:1px solid;border-radius:2px;flex-shrink:0}

/* Body */
.bld-card-body{padding:10px 12px}
.bld-cost-row{display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:9px;margin-bottom:8px}
.bld-prog-wrap{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.bld-prog-bar{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.bld-prog-fill{height:100%;border-radius:2px;transition:width .4s}
.bld-prog-label{font-family:'Space Mono',monospace;font-size:8px;color:var(--text-dim);flex-shrink:0}
.bld-card-footer{display:flex;justify-content:space-between;align-items:center}
.bld-btn{font-size:8px;padding:3px 10px}
.bld-prod-info{font-family:'Space Mono',monospace;font-size:9px}

@media(max-width:600px){.bld-grid{grid-template-columns:1fr 1fr}}
</style>
