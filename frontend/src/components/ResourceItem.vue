<template>
  <div class="res-item">
    <span class="res-icon">{{ icon }}</span>
    <div class="res-info">
      <span class="res-name">{{ label }}</span>
      <span class="res-val" :style="{ color }">{{ formatted }}</span>
      <span class="res-rate">+{{ rate.toFixed(0) }}/h</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon:  String,
  label: String,
  value: { type: Number, default: 0 },
  rate:  { type: Number, default: 0 },
  color: { type: String, default: '#c8deff' },
});

const formatted = computed(() => Math.floor(props.value).toLocaleString('hu'));
</script>

<style scoped>
.res-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 100%;
  border-right: 1px solid rgba(26,42,74,0.5);
  cursor: default;
  transition: background 0.2s;
}
.res-item:hover { background: rgba(0,200,255,0.04); }
.res-icon { font-size: 14px; }
.res-info { display: flex; flex-direction: column; }
.res-name { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; }
.res-val  { font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 600; }
.res-rate { font-size: 9px; color: var(--accent3); }
</style>
