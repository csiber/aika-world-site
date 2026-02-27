<template>
  <div class="bcard" :class="{ 'in-queue': inQueue }">
    <div class="bcard-header">
      <span class="bcard-icon">{{ building.icon }}</span>
      <div>
        <div class="bcard-name">{{ building.name }}</div>
        <div class="bcard-level">Szint {{ building.level }}</div>
      </div>
      <div class="bcard-badge" :class="building.type === 'production' ? 'badge-blue' : 'badge-green'">
        {{ building.type === 'production' ? 'Termelés' : 'Infra' }}
      </div>
    </div>

    <div class="bcard-progress">
      <div class="bcard-progress-fill" :style="{ width: levelPct + '%' }"></div>
    </div>

    <div class="bcard-costs">
      <div class="cost-row">
        <span>Következő szint:</span>
        <span>{{ building.level + 1 }}</span>
      </div>
      <div class="cost-row">
        <span>⚙️ Fém:</span>
        <span :class="{ 'not-enough': !hasMetal }">{{ cost.metal.toLocaleString('hu') }}</span>
      </div>
      <div class="cost-row">
        <span>💎 Kristály:</span>
        <span :class="{ 'not-enough': !hasCrystal }">{{ cost.crystal.toLocaleString('hu') }}</span>
      </div>
      <div class="cost-row">
        <span>⏱️ Idő:</span>
        <span>{{ formatTime(buildSeconds) }}</span>
      </div>
    </div>

    <button
      class="btn-primary upgrade-btn"
      :disabled="!canAfford || inQueue || loading"
      @click="onUpgrade"
    >
      <span v-if="inQueue">⏳ Folyamatban...</span>
      <span v-else-if="loading">Kérés küldése...</span>
      <span v-else-if="!canAfford">Kevés nyersanyag</span>
      <span v-else>⬆️ Fejlesztés indítása</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game.js';

const props   = defineProps({ building: Object });
const game    = useGameStore();
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

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}ó ${m}p`;
  if (m > 0) return `${m}p ${sec}mp`;
  return `${sec}mp`;
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

.upgrade-btn { width: 100%; padding: 8px; }
</style>
