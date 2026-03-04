<template>
  <div class="fleet-layout">
    <!-- Fleet summary -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">🚀</span><h3>{{ L.t('fleet.summary') }}</h3></div>
      <div class="panel-body">
        <table class="fleet-table">
          <thead>
            <tr>
              <th>{{ L.t('fleet.ship') }}</th>
              <th>{{ L.t('fleet.count') }}</th>
              <th>{{ L.t('fleet.attack') }}</th>
              <th>{{ L.t('fleet.shield') }}</th>
              <th>{{ L.t('fleet.cargo') }}</th>
              <th>{{ L.t('fleet.speed') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ship in fleet" :key="ship.id">
              <td>{{ ship.icon }} {{ ship.name }}</td>
              <td class="fleet-val">{{ ship.count }}</td>
              <td class="fleet-val" style="color:var(--accent2);">{{ ship.attack }}</td>
              <td class="fleet-val" style="color:var(--accent);">{{ ship.shield }}</td>
              <td class="fleet-val" style="color:var(--accent3);">{{ ship.cargo }}</td>
              <td class="fleet-val" style="color:var(--accent4);">{{ ship.speed.toLocaleString('hu') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Build ships -->
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">🏭</span><h3>{{ L.t('fleet.shipyard') }}</h3></div>
      <div class="panel-body">
        <div class="ship-grid">
          <div v-for="ship in fleet" :key="ship.id" class="ship-card" :class="{ 'in-queue': inQueue(ship.id), 'locked': !checkPre(ship).ok }">
            <div class="ship-head">
              <span class="ship-emoji">{{ ship.icon }}</span>
              <div>
                <div class="ship-name">{{ ship.name }}</div>
                <div class="ship-count">{{ L.t('fleet.current') }}: {{ ship.count }} {{ L.t('fleet.units') }}</div>
              </div>
            </div>
            <div class="ship-stats">
              <span>⚔️ {{ ship.attack }}</span>
              <span>🛡️ {{ ship.shield }}</span>
              <span>📦 {{ ship.cargo }}</span>
            </div>

            <!-- Prerequisites -->
            <div v-if="!checkPre(ship).ok" class="req-box">
              <div class="req-title">Követelmények:</div>
              <div v-for="m in checkPre(ship).missing" :key="m" class="req-item missing">❌ {{ m }}</div>
            </div>

            <template v-if="checkPre(ship).ok">
              <div class="ship-cost">
                ⚙️ {{ ship.cost.metal.toLocaleString('hu') }} | 💎 {{ ship.cost.crystal.toLocaleString('hu') }} ({{ L.t('fleet.units') }})
              </div>
              <div class="ship-build-row">
                <input
                  v-model.number="amounts[ship.id]"
                  type="number" min="1" max="1000"
                  class="amount-input"
                  placeholder="1"
                />
                <button
                  class="btn-primary"
                  :disabled="!canAffordShip(ship) || inQueue(ship.id) || busy === ship.id"
                  @click="onBuild(ship)"
                >
                  <span v-if="inQueue(ship.id)">⏳ {{ L.t('fleet.building') }}</span>
                  <span v-else-if="busy === ship.id">...</span>
                  <span v-else>{{ L.t('fleet.build') }}</span>
                </button>
              </div>
              <div class="ship-total-cost" v-if="amounts[ship.id] > 1">
                {{ L.t('fleet.total') }}: ⚙️ {{ ((ship.cost.metal || 0) * (amounts[ship.id] || 1)).toLocaleString('hu') }} | 💎 {{ ((ship.cost.crystal || 0) * (amounts[ship.id] || 1)).toLocaleString('hu') }}              </div>
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
const fleet = computed(() => game.fleet);
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

function canAffordShip(ship) {
  const amt = amounts[ship.id] || 1;
  return game.canAfford({ metal: ship.cost.metal * amt, crystal: ship.cost.crystal * amt });
}

async function onBuild(ship) {
  const amt = Math.max(1, amounts[ship.id] || 1);
  busy.value = ship.id;
  const ok = await game.buildFleet(ship.id, amt);
  if (ok) amounts[ship.id] = 1;
  busy.value = null;
}
</script>

<style scoped>
.fleet-layout { display: flex; flex-direction: column; gap: 12px; }
.fleet-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.fleet-table th { text-align: left; color: var(--text-dim); font-weight: 400; padding: 4px 8px; border-bottom: 1px solid var(--border); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; }
.fleet-table td { padding: 6px 8px; border-bottom: 1px solid rgba(26,42,74,0.5); color: var(--text); }
.fleet-table tr:hover td { background: rgba(255,255,255,0.02); }
.fleet-val { font-family: 'Orbitron', sans-serif; font-size: 10px; }

.ship-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.ship-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; }
.ship-card:hover { border-color: var(--border-glow); }
.ship-card.in-queue { border-color: rgba(255,215,0,0.3); }
.ship-card.locked { opacity: 0.7; border-style: dashed; }

.ship-head { display: flex; align-items: center; gap: 10px; }
.ship-emoji { font-size: 28px; }
.ship-name { font-size: 12px; color: var(--text-bright); font-weight: 600; }
.ship-count { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent3); }
.ship-stats { display: flex; gap: 10px; font-size: 10px; color: var(--text-dim); }
.ship-cost { font-size: 9px; color: var(--text-dim); }

.req-box { background: rgba(0,0,0,0.2); border-radius: 4px; padding: 6px; margin: 4px 0; }
.req-title { font-size: 9px; color: var(--text-dim); margin-bottom: 3px; text-transform: uppercase; }
.req-item { font-size: 9px; margin-bottom: 2px; }
.req-item.missing { color: var(--red); }

.ship-build-row { display: flex; gap: 6px; }
.amount-input { width: 70px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text); padding: 5px 8px; font-size: 12px; border-radius: 3px; font-family: 'Exo 2', sans-serif; outline: none; }
.amount-input:focus { border-color: var(--accent); }
.ship-total-cost { font-size: 9px; color: var(--accent4); }
.locked-label { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); text-align: center; padding: 6px; }
</style>
