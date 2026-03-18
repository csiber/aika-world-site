<template>
  <div class="tactical-wrapper">
    <header class="tactical-topbar">
      <div class="tb-left">
        <span class="tb-logo">🌌</span>
        <div>
          <div class="tb-title">AIKA WORLD</div>
          <div class="tb-sub">TAKTIKAI CSATA</div>
        </div>
      </div>
      <button class="tb-back" @click="goBack">← Vissza a játékba</button>
    </header>
    <main class="tactical-content">
      <TacticalBattleView :battleId="battleId" @close="goBack" />
    </main>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import TacticalBattleView from '@/components/views/TacticalBattleView.vue';

const route = useRoute();
const router = useRouter();
const battleId = route.params.battleId;

function goBack() {
  router.push('/');
}
</script>

<style scoped>
.tactical-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.tactical-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, var(--bg-deep) 0%, #040813 100%);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
  height: 48px;
}

.tb-left { display: flex; align-items: center; gap: 8px; }
.tb-logo { font-size: 22px; }
.tb-title { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 900; color: var(--accent); letter-spacing: 2px; }
.tb-sub { font-size: 8px; color: var(--accent2); letter-spacing: 3px; font-family: 'Orbitron', sans-serif; }

.tb-back {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 5px 14px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Exo 2', sans-serif;
}
.tb-back:hover { border-color: var(--accent); color: var(--accent); }

.tactical-content {
  flex: 1;
  padding: 16px;
}
</style>
