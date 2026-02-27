<template>
  <div class="queue-item">
    <div class="queue-info">
      <div class="queue-name">{{ item.item_name }}</div>
      <div class="queue-time">{{ timeLeft }}</div>
      <div class="queue-progress">
        <div class="queue-progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({ item: Object });

const now = () => Math.floor(Date.now() / 1000);
const totalDuration = ref(0); // unknown unless we track start, so use remaining as proxy
const remaining = ref(Math.max(0, props.item.finish_at - now()));
const timeLeft  = ref('');
const progressPct = ref(0);

function formatTime(s) {
  if (s <= 0) return 'Kész!';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}ó ${m}p ${sec}mp`;
  if (m > 0) return `${m}p ${sec}mp`;
  return `${sec}mp`;
}

let timer;
onMounted(() => {
  totalDuration.value = remaining.value || 1;
  timer = setInterval(() => {
    remaining.value = Math.max(0, props.item.finish_at - now());
    timeLeft.value  = formatTime(remaining.value);
    progressPct.value = Math.min(100, ((totalDuration.value - remaining.value) / totalDuration.value) * 100);
  }, 1000);
  timeLeft.value = formatTime(remaining.value);
});
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.queue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(0,200,255,0.05);
  border: 1px solid rgba(0,200,255,0.15);
  border-radius: 4px;
  margin-bottom: 4px;
}
.queue-info { flex: 1; }
.queue-name { font-size: 11px; color: var(--text-bright); }
.queue-time { font-size: 9px; color: var(--accent4); font-family: 'Orbitron', sans-serif; margin-top: 2px; }
.queue-progress { height: 2px; background: var(--border); border-radius: 2px; margin-top: 4px; overflow: hidden; }
.queue-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--crystal)); border-radius: 2px; transition: width 1s linear; }
</style>
