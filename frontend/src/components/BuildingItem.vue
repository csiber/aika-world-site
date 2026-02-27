<template>
  <div class="building-item" :class="{ 'in-queue': inQueue }">
    <span class="building-icon">{{ building.icon }}</span>
    <div class="building-info">
      <div class="building-name">{{ building.name }}</div>
      <div class="building-level">Szint <span>{{ building.level }}</span> → {{ building.level + 1 }}</div>
      <div class="building-cost">⚙️ {{ cost.metal.toLocaleString('hu') }} | 💎 {{ cost.crystal.toLocaleString('hu') }}</div>
    </div>
    <button
      class="btn-primary"
      :disabled="!canAfford || inQueue || loading"
      @click="onUpgrade"
    >
      <span v-if="inQueue">⏳</span>
      <span v-else-if="loading">...</span>
      <span v-else-if="canAfford">Fejleszt</span>
      <span v-else>⚙️</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game.js';

const props = defineProps({ building: Object });
const game  = useGameStore();
const loading = ref(false);

const cost     = computed(() => game.getBuildCost(props.building));
const canAfford = computed(() => game.canAfford(cost.value));
const inQueue  = computed(() => game.queueItemIsActive(props.building.id));

async function onUpgrade() {
  loading.value = true;
  await game.upgradeBuilding(props.building.id);
  loading.value = false;
}
</script>

<style scoped>
.building-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: default;
  margin-bottom: 3px;
  transition: all 0.15s;
}
.building-item:hover { border-color: var(--border); background: rgba(255,255,255,0.03); }
.building-item.in-queue { border-color: rgba(255,215,0,0.2); background: rgba(255,215,0,0.03); }
.building-icon { font-size: 16px; min-width: 20px; text-align: center; }
.building-info { flex: 1; }
.building-name { font-size: 11px; color: var(--text-bright); font-weight: 500; }
.building-level { font-size: 9px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.building-level span { color: var(--accent4); }
.building-cost { font-size: 9px; color: var(--text-dim); margin-top: 2px; }
</style>
