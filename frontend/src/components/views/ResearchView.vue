<template>
  <div>
    <div class="panel" style="margin-bottom:12px;">
      <div class="panel-header"><span class="panel-icon">🔬</span><h3>{{ L.t('research.title') }}</h3></div>
      <div class="panel-body">
        <div class="research-grid">
          <div
            v-for="r in research"
            :key="r.id"
            class="research-card"
            :class="{ maxed: r.level >= r.max, 'in-queue': inQueue(r.id), 'locked': !checkPre(r).ok }"
          >
            <div class="research-icon">{{ r.icon }}</div>
            <div class="research-name">{{ r.name }}</div>
            <div class="research-level">{{ L.t('research.level') }} {{ r.level }} / {{ r.max }}</div>

            <div class="research-progress">
              <div class="research-progress-fill" :style="{ width: (r.level / r.max * 100) + '%' }"></div>
            </div>

            <div class="research-desc">{{ r.desc }}</div>

            <!-- Prerequisites -->
            <div v-if="!checkPre(r).ok" class="req-box">
              <div class="req-title">Követelmények:</div>
              <div v-for="m in checkPre(r).missing" :key="m" class="req-item missing">❌ {{ m }}</div>
            </div>

            <template v-if="r.level < r.max">
              <div class="research-cost">
                ⚙️ {{ (cost(r).metal || 0).toLocaleString('hu') }} | 💎 {{ (cost(r).crystal || 0).toLocaleString('hu') }}
              </div>
              <button
                class="btn-primary"
                style="width:100%;padding:6px;"
                :disabled="!canAfford(r) || inQueue(r.id) || busy === r.id || !checkPre(r).ok"
                @click="onResearch(r)"
              >
                <span v-if="inQueue(r.id)">⏳ {{ L.t('research.inProgress') }}</span>
                <span v-else-if="busy === r.id">...</span>
                <span v-else-if="!checkPre(r).ok">Lezárva</span>
                <span v-else-if="!canAfford(r)">{{ L.t('research.notEnough') }}</span>
                <span v-else>🔬 {{ L.t('research.start') }}</span>
              </button>
            </template>
            <div v-else class="maxed-label">{{ L.t('research.maxLevel') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';

const game     = useGameStore();
const L        = useLangStore();
const research = computed(() => game.research);
const buildings = computed(() => game.buildings);
const busy     = ref(null);

function cost(r) { return game.getResearchCost(r); }
function canAfford(r) { return game.canAfford(cost(r)); }
function inQueue(id) { return game.queueItemIsActive(id); }

function checkPre(item) {
  if (!item.req) return { ok: true };
  const missing = [];
  if (item.req.buildings) {
    for (const [id, lvl] of Object.entries(item.req.buildings)) {
      const b = buildings.value.find(x => x.id === id);
      if (!b || b.level < lvl) missing.push(`${b?.name || id} ${lvl}`);
    }
  }
  if (item.req.research) {
    for (const [id, lvl] of Object.entries(item.req.research)) {
      const r = research.value.find(x => x.id === id);
      if (!r || r.level < lvl) missing.push(`${r?.name || id} ${lvl}`);
    }
  }
  return { ok: missing.length === 0, missing };
}

async function onResearch(r) {
  busy.value = r.id;
  await game.startResearch(r.id);
  busy.value = null;
}
</script>

<style scoped>
.research-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.research-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s;
}
.research-card:hover { border-color: var(--border-glow); box-shadow: 0 0 15px rgba(0,200,255,0.08); }
.research-card.maxed { border-color: var(--accent4); }
.research-card.in-queue { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.02); }
.research-card.locked { opacity: 0.7; border-style: dashed; }

.research-icon { font-size: 28px; }
.research-name { font-size: 12px; color: var(--text-bright); font-weight: 600; }
.research-level { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); }
.research-progress { height: 3px; background: var(--border); border-radius: 3px; overflow: hidden; }
.research-progress-fill { height: 100%; background: linear-gradient(90deg, var(--crystal), var(--accent4)); border-radius: 3px; }
.research-desc { font-size: 10px; color: var(--text-dim); line-height: 1.5; }
.research-cost { font-size: 9px; color: var(--text-dim); }

.req-box { background: rgba(0,0,0,0.2); border-radius: 4px; padding: 6px; margin: 4px 0; }
.req-title { font-size: 9px; color: var(--text-dim); margin-bottom: 3px; text-transform: uppercase; }
.req-item { font-size: 9px; margin-bottom: 2px; }
.req-item.missing { color: var(--red); }

.maxed-label { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); text-align: center; padding: 6px; }
</style>
