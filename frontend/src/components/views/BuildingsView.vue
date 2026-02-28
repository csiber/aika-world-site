<template>
  <div class="buildings-layout">
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">⚙️</span><h3>{{ L.t('buildings.productionHeader') }}</h3></div>
      <div class="panel-body">
        <div class="building-grid">
          <BuildingCard v-for="b in prodBuildings" :key="b.id" :building="b" />
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><span class="panel-icon">🏭</span><h3>{{ L.t('buildings.infraHeader') }}</h3></div>
      <div class="panel-body">
        <div class="building-grid">
          <BuildingCard v-for="b in infraBuildings" :key="b.id" :building="b" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
import BuildingCard from '@/components/BuildingCard.vue';

const game = useGameStore();
const L    = useLangStore();
const prodBuildings  = computed(() => game.prodBuildings);
const infraBuildings = computed(() => game.infraBuildings);
</script>

<style scoped>
.buildings-layout { display: flex; flex-direction: column; gap: 12px; }
.building-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
</style>
