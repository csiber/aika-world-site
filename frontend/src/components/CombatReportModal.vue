<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content combat-report">
      <div class="modal-header">
        <h3>⚔️ Harci Jelentés</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body" v-if="report">
        <div class="report-summary" :class="report.attackerWins ? 'win' : 'loss'">
          {{ report.attackerWins ? 'GYŐZELEM' : 'VERESÉG' }}
        </div>

        <div class="sides-grid">
          <div class="side attacker">
            <h4>Támadó: {{ report.attackerName }}</h4>
            <div class="unit-list">
              <div v-for="u in unitsDiff(report.initialAtkFleet, report.attackerRemainingFleet)" :key="u.id" class="unit-row">
                <span>{{ u.icon }} {{ u.name }}</span>
                <span class="count">{{ u.initial }} <span class="loss" v-if="u.loss > 0">-{{ u.loss }}</span></span>
              </div>
            </div>
          </div>
          <div class="side defender">
            <h4>Védő: {{ report.defenderName }}</h4>
            <div class="unit-list">
              <div v-for="u in unitsDiff(report.initialDefFleet, report.defenderRemainingFleet)" :key="u.id" class="unit-row">
                <span>{{ u.icon }} {{ u.name }}</span>
                <span class="count">{{ u.initial }} <span class="loss" v-if="u.loss > 0">-{{ u.loss }}</span></span>
              </div>
              <div v-for="u in unitsDiff(report.initialDefDefense, report.defenderRemainingDefense)" :key="'d'+u.id" class="unit-row">
                <span>{{ u.icon }} {{ u.name }}</span>
                <span class="count">{{ u.initial }} <span class="loss" v-if="u.loss > 0">-{{ u.loss }}</span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounds-box">
          <h5>Körök összefoglalója</h5>
          <div v-for="r in report.rounds" :key="r.round" class="round-row">
            <span>{{ r.round }}. kör</span>
            <span>Támadó erő: {{ r.attackerPower.toLocaleString('hu') }}</span>
            <span>Védő pajzs: {{ r.defenderPower.toLocaleString('hu') }}</span>
          </div>
        </div>

        <div class="loot-box" v-if="report.loot">
          <h5>Zsákmány</h5>
          <div class="loot-grid">
            <div class="loot-item">⚙️ Fém: {{ Math.floor(report.loot.metal).toLocaleString('hu') }}</div>
            <div class="loot-item">💎 Kristály: {{ Math.floor(report.loot.crystal).toLocaleString('hu') }}</div>
          </div>
        </div>
      </div>
      <div class="modal-body" v-else>Betöltés...</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { api } from '@/api/client.js';

const props = defineProps({ reportId: String });
const emit  = defineEmits(['close']);
const report = ref(null);

onMounted(async () => {
  try {
    const data = await api.getMissionReport(props.reportId);
    report.value = data.report;
  } catch (e) {
    console.error(e);
  }
});

function unitsDiff(initial, remaining) {
  if (!initial) return [];
  return initial.map(u => {
    const rem = remaining?.find(x => x.id === u.id)?.count || 0;
    return { ...u, initial: u.count, remaining: rem, loss: u.count - rem };
  }).filter(u => u.initial > 0);
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); padding: 20px; }
.modal-content { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 40px rgba(0,0,0,0.8); }
.combat-report { border-color: var(--accent); }

.modal-header { padding: 15px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 16px; color: var(--accent); }
.close-btn { background: none; border: none; color: var(--text-dim); font-size: 20px; cursor: pointer; }

.modal-body { padding: 20px; }

.report-summary { text-align: center; font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 900; margin-bottom: 20px; padding: 10px; border-radius: 4px; }
.report-summary.win { background: rgba(58,255,122,0.1); color: var(--accent3); border: 1px solid rgba(58,255,122,0.3); }
.report-summary.loss { background: rgba(255,58,122,0.1); color: var(--accent2); border: 1px solid rgba(255,58,122,0.3); }

.sides-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.side h4 { font-family: 'Orbitron', sans-serif; font-size: 12px; margin-bottom: 10px; border-bottom: 1px solid var(--border); padding-bottom: 5px; }
.unit-list { display: flex; flex-direction: column; gap: 5px; }
.unit-row { display: flex; justify-content: space-between; font-size: 11px; }
.count { font-family: 'Orbitron', sans-serif; font-size: 10px; }
.loss { color: var(--accent2); margin-left: 5px; }

.rounds-box { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 4px; margin-bottom: 20px; border: 1px solid var(--border); }
.rounds-box h5 { margin: 0 0 10px 0; font-size: 11px; color: var(--text-dim); text-transform: uppercase; }
.round-row { display: flex; justify-content: space-between; font-size: 10px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }

.loot-box { background: rgba(0,200,255,0.05); padding: 15px; border-radius: 4px; border: 1px solid var(--border-glow); }
.loot-box h5 { margin: 0 0 10px 0; font-size: 11px; }
.loot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: 'Orbitron', sans-serif; font-size: 12px; color: var(--text-bright); }

@media (max-width: 480px) {
  .sides-grid { grid-template-columns: 1fr; }
}
</style>
