<template>
  <div class="defense-layout">
    <!-- Defense summary -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">🛡️</span><h3>{{ L.t('defense.summary') || 'Védelmi Összesítő' }}</h3></div>
      <div class="panel-body">
        <table class="defense-table">
          <thead>
            <tr>
              <th>Egység</th>
              <th>Mennyiség</th>
              <th>Támadás</th>
              <th>Pajzs</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in defense" :key="d.id">
              <td>{{ d.icon }} {{ d.name }}</td>
              <td class="def-val">{{ d.count }}</td>
              <td class="def-val" style="color:var(--accent2);">{{ d.attack }}</td>
              <td class="def-val" style="color:var(--accent);">{{ d.shield }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Build defense -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">🔨</span><h3>{{ L.t('defense.build') || 'Védelem Építése' }}</h3></div>
      <div class="panel-body">
        <div class="def-grid">
          <div v-for="d in defense" :key="d.id" class="def-card" :class="{ 'in-queue': inQueue(d.id), 'locked': !checkPre(d).ok }">
            <div class="def-head">
              <span class="def-emoji">{{ d.icon }}</span>
              <div>
                <div class="def-name">{{ d.name }}</div>
                <div class="def-count">Jelenleg: {{ d.count }} db</div>
              </div>
            </div>
            <div class="def-stats">
              <span>⚔️ {{ d.attack }}</span>
              <span>🛡️ {{ d.shield }}</span>
            </div>

            <!-- Prerequisites -->
            <div v-if="!checkPre(d).ok" class="req-box">
              <div class="req-title">Követelmények:</div>
              <div v-for="m in checkPre(d).missing" :key="m" class="req-item missing">❌ {{ m }}</div>
            </div>

            <template v-if="checkPre(d).ok">
              <div class="def-cost">
                ⚙️ {{ d.cost.metal.toLocaleString('hu') }} | 💎 {{ d.cost.crystal.toLocaleString('hu') }}
              </div>
              <div class="def-build-row">
                <input
                  v-model.number="amounts[d.id]"
                  type="number" min="1" max="1000"
                  class="amount-input"
                  placeholder="1"
                />
                <button
                  class="btn-primary"
                  :disabled="!canAffordDef(d) || inQueue(d.id) || busy === d.id"
                  @click="onBuild(d)"
                >
                  <span v-if="inQueue(d.id)">⏳ Folyamatban</span>
                  <span v-else-if="busy === d.id">...</span>
                  <span v-else>Építés</span>
                </button>
              </div>
              <div class="def-total-cost" v-if="amounts[d.id] > 1">
                Összesen: ⚙️ {{ (d.cost.metal * (amounts[d.id] || 1)).toLocaleString('hu') }} | 💎 {{ (d.cost.crystal * (amounts[d.id] || 1)).toLocaleString('hu') }}
              </div>
            </template>
            <div v-else class="locked-label">Lezárva</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';

const game  = useGameStore();
const L     = useLangStore();
const defense = computed(() => game.defense);
const buildings = computed(() => game.buildings);
const research  = computed(() => game.research);
const busy  = ref(null);

const amounts = reactive({});

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

function canAffordDef(d) {
  const amt = amounts[d.id] || 1;
  return game.canAfford({ metal: d.cost.metal * amt, crystal: d.cost.crystal * amt });
}

async function onBuild(d) {
  const amt = Math.max(1, amounts[d.id] || 1);
  busy.value = d.id;
  const ok = await game.buildDefense(d.id, amt);
  if (ok) amounts[d.id] = 1;
  busy.value = null;
}
</script>

<style scoped>
.defense-layout { display: flex; flex-direction: column; gap: 12px; }
.defense-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.defense-table th { text-align: left; color: var(--text-dim); font-weight: 400; padding: 4px 8px; border-bottom: 1px solid var(--border); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; }
.defense-table td { padding: 6px 8px; border-bottom: 1px solid rgba(26,42,74,0.5); color: var(--text); }
.defense-table tr:hover td { background: rgba(255,255,255,0.02); }
.def-val { font-family: 'Orbitron', sans-serif; font-size: 10px; }

.def-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.def-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; }
.def-card:hover { border-color: var(--border-glow); }
.def-card.in-queue { border-color: rgba(255,215,0,0.3); }
.def-card.locked { opacity: 0.7; border-style: dashed; }

.def-head { display: flex; align-items: center; gap: 10px; }
.def-emoji { font-size: 28px; }
.def-name { font-size: 12px; color: var(--text-bright); font-weight: 600; }
.def-count { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent3); }
.def-stats { display: flex; gap: 10px; font-size: 10px; color: var(--text-dim); }
.def-cost { font-size: 9px; color: var(--text-dim); }

.req-box { background: rgba(0,0,0,0.2); border-radius: 4px; padding: 6px; margin: 4px 0; }
.req-title { font-size: 9px; color: var(--text-dim); margin-bottom: 3px; text-transform: uppercase; }
.req-item { font-size: 9px; margin-bottom: 2px; }
.req-item.missing { color: var(--red); }

.def-build-row { display: flex; gap: 6px; }
.amount-input { width: 70px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text); padding: 5px 8px; font-size: 12px; border-radius: 3px; font-family: 'Exo 2', sans-serif; outline: none; }
.amount-input:focus { border-color: var(--accent); }
.def-total-cost { font-size: 9px; color: var(--accent4); }
.locked-label { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); text-align: center; padding: 6px; }
</style>
