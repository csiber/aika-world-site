<template>
  <div class="bcard" :class="{ 'in-queue': inQueue, 'locked': !checkPre.ok }">
    <div class="bcard-header">
      <span class="bcard-icon">{{ building.icon }}</span>
      <div>
        <div class="bcard-name">{{ building.name }}</div>
        <div class="bcard-level">{{ L.t('buildings.level') }} {{ building.level }}</div>
      </div>
      <div class="bcard-badge" :class="building.type === 'production' ? 'badge-blue' : 'badge-green'">
        {{ building.type === 'production' ? L.t('buildings.production') : L.t('buildings.infra') }}
      </div>
    </div>

    <div class="bcard-progress">
      <div class="bcard-progress-fill" :style="{ width: levelPct + '%' }"></div>
    </div>

    <!-- Prerequisites -->
    <div v-if="!checkPre.ok" class="req-box">
      <div class="req-title">Követelmények:</div>
      <div v-for="m in checkPre.missing" :key="m" class="req-item missing">❌ {{ m }}</div>
    </div>

    <div class="bcard-costs" v-if="checkPre.ok">
      <div class="cost-row">
        <span>{{ L.t('buildings.nextLevel') }}</span>
        <span>{{ building.level + 1 }}</span>
      </div>
      <div class="cost-row">
        <span>⚙️ {{ L.t('res.metal') }}:</span>
        <span :class="{ 'not-enough': !hasMetal }">{{ L.n(cost.metal) }}</span>
      </div>
      <div class="cost-row">
        <span>💎 {{ L.t('res.crystal') }}:</span>
        <span :class="{ 'not-enough': !hasCrystal }">{{ L.n(cost.crystal) }}</span>
      </div>
      <div class="cost-row">
        <span>⏱️ {{ L.t('buildings.time') }}</span>
        <span>{{ formatTime(buildSeconds) }}</span>
      </div>
    </div>

    <button
      class="btn-primary upgrade-btn"
      :disabled="!canAfford || inQueue || loading || !checkPre.ok"
      @click="onUpgrade"
    >
      <span v-if="inQueue">⏳ {{ L.t('buildings.inProgress') }}</span>
      <span v-else-if="loading">{{ L.t('buildings.sending') }}</span>
      <span v-else-if="!checkPre.ok">Lezárva</span>
      <span v-else-if="!canAfford">{{ L.t('buildings.notEnough') }}</span>
      <span v-else>⬆️ {{ L.t('buildings.upgrade') }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';

const props   = defineProps({ building: Object });
const game    = useGameStore();
const L       = useLangStore();
const loading = ref(false);

const cost      = computed(() => game.getBuildCost(props.building));
const hasMetal  = computed(() => game.resources.metal >= cost.value.metal);
const hasCrystal = computed(() => game.resources.crystal >= cost.value.crystal);
const canAfford = computed(() => hasMetal.value && hasCrystal.value);
const inQueue   = computed(() => game.queueItemIsActive(props.building.id));
const levelPct  = computed(() => Math.min(100, (props.building.level / 20) * 100));
const roboticsLevel = computed(() => game.buildings.find(b => b.id === 'robotics')?.level || 1);
const buildSeconds  = computed(() => {
  const base      = Math.floor(props.building.level * 90 + 30);
  const reduction = Math.max(0.2, 1 - (roboticsLevel.value - 1) * 0.07);
  return Math.floor(base * reduction);
});

const checkPre = computed(() => {
  const item = props.building;
  if (!item.req) return { ok: true };
  const missing = [];
  if (item.req.buildings) {
    for (const [id, lvl] of Object.entries(item.req.buildings)) {
      const b = game.buildings.find(x => x.id === id);
      if (!b || b.level < lvl) missing.push(`${b?.name || id} ${lvl}`);
    }
  }
  if (item.req.research) {
    for (const [id, lvl] of Object.entries(item.req.research)) {
      const r = game.research.find(x => x.id === id);
      if (!r || r.level < lvl) missing.push(`${r?.name || id} ${lvl}`);
    }
  }
  return { ok: missing.length === 0, missing };
});

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}${L.t('time.hour')} ${m}${L.t('time.min')}`;
  if (m > 0) return `${m}${L.t('time.min')} ${sec}${L.t('time.sec')}`;
  return `${sec}${L.t('time.sec')}`;
}

async function onUpgrade() {
  loading.value = true;
  await game.upgradeBuilding(props.building.id);
  loading.value = false;
}
</script>

<style scoped>
.bcard {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 14px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bcard:hover { border-color: var(--border-glow); box-shadow: 0 0 15px rgba(0,200,255,0.06); }
.bcard.in-queue { border-color: rgba(255,215,0,0.3); }
.bcard.locked { opacity: 0.7; border-style: dashed; }

.bcard-header { display: flex; align-items: center; gap: 10px; }
.bcard-icon { font-size: 28px; }
.bcard-name { font-size: 13px; color: var(--text-bright); font-weight: 600; }
.bcard-level { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); }
.bcard-badge { margin-left: auto; font-size: 9px; }

.bcard-progress { height: 3px; background: var(--border); border-radius: 3px; overflow: hidden; }
.bcard-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--crystal)); border-radius: 3px; }

.bcard-costs { display: flex; flex-direction: column; gap: 4px; }
.cost-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim); }
.cost-row span:last-child { color: var(--text); font-family: 'Orbitron', sans-serif; font-size: 10px; }
.cost-row span.not-enough { color: var(--accent2) !important; }

.req-box { background: rgba(0,0,0,0.2); border-radius: 4px; padding: 8px; margin: 4px 0; }
.req-title { font-size: 9px; color: var(--text-dim); margin-bottom: 4px; text-transform: uppercase; }
.req-item { font-size: 10px; margin-bottom: 2px; }
.req-item.missing { color: var(--red); }

.upgrade-btn { width: 100%; padding: 8px; }
</style>
