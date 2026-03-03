<template>
  <div class="res-item" :class="{ full: isFull, warning: fillPct >= 90 }" :title="tooltip">
    <span class="res-icon">{{ icon }}</span>
    <div class="res-info">
      <span class="res-name">{{ label }}</span>
      <span class="res-val" :class="{ 'tick-up': isTicking }" :style="{ color }">{{ formatted }}</span>
      <div class="res-bottom">
        <span class="res-rate">+{{ rate.toFixed(0) }}/h</span>
        <span v-if="maxVal" class="res-cap" :class="{ 'cap-warn': fillPct >= 90 }">{{ fillPct }}%</span>
      </div>
    </div>
    <div v-if="maxVal" class="res-bar">
      <div class="res-bar-fill" :style="{ width: fillPct + '%', background: color }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  icon:   String,
  label:  String,
  value:  { type: Number, default: 0 },
  rate:   { type: Number, default: 0 },
  color:  { type: String, default: '#c8deff' },
  maxVal: { type: Number, default: 0 },
});

const formatted = computed(() => Math.floor(props.value).toLocaleString('hu'));
const fillPct   = computed(() => props.maxVal ? Math.min(100, Math.floor(props.value / props.maxVal * 100)) : 0);
const isFull    = computed(() => props.maxVal && props.value >= props.maxVal);
const tooltip   = computed(() => props.maxVal
  ? `${Math.floor(props.value).toLocaleString('hu')} / ${props.maxVal.toLocaleString('hu')} (${fillPct.value}%)`
  : props.label
);

const isTicking = ref(false);
let tickTimeout = null;

watch(() => Math.floor(props.value), (newVal, oldVal) => {
  if (newVal > oldVal) {
    isTicking.value = true;
    if (tickTimeout) clearTimeout(tickTimeout);
    tickTimeout = setTimeout(() => { isTicking.value = false; }, 300);
  }
});
</script>

<style scoped>
.res-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 100%;
  border-right: 1px solid rgba(26,42,74,0.5);
  cursor: default;
  transition: background 0.2s;
  position: relative;
  min-width: 80px;
}
.res-item:hover { background: rgba(0,200,255,0.04); }
.res-item.full { background: rgba(255,58,122,0.04); }
.res-item.warning .res-val { animation: pulse-warn 2s ease-in-out infinite; }
@keyframes pulse-warn { 0%,100%{opacity:1} 50%{opacity:0.6} }

.res-icon { font-size: 14px; }
.res-info { display: flex; flex-direction: column; flex: 1; }
.res-name  { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; }
.res-val   { font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 600; transition: all 0.2s; display: inline-block; }
.res-val.tick-up { transform: scale(1.1); color: #fff !important; text-shadow: 0 0 10px var(--accent); }

.res-bottom { display: flex; justify-content: space-between; align-items: center; }
.res-rate  { font-size: 9px; color: var(--accent3); }
.res-cap   { font-size: 9px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.res-cap.cap-warn { color: var(--accent2); }

.res-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.05); }
.res-bar-fill { height: 100%; border-radius: 0; transition: width 0.5s ease; opacity: 0.6; }
</style>
