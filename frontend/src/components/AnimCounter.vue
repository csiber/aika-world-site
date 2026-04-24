<template>
  <span :style="spanStyle">{{ displayedFormatted }}</span>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps({
  value: { type: Number, required: true },
  color: { type: String, default: 'inherit' },
  locale: { type: String, default: 'hu' },
});

const displayed = ref(props.value);
let rafId = null, startTs = null, fromVal = props.value;

const spanStyle = computed(() => ({
  fontFamily: "'Space Mono', monospace",
  color: props.color,
  fontVariantNumeric: 'tabular-nums',
}));

const displayedFormatted = computed(() =>
  Math.floor(displayed.value).toLocaleString(props.locale)
);

function animateTo(to) {
  const from = fromVal;
  const dur  = 800;
  cancelAnimationFrame(rafId);
  startTs = null;

  function step(ts) {
    if (!startTs) startTs = ts;
    const pct  = Math.min((ts - startTs) / dur, 1);
    const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
    displayed.value = from + (to - from) * ease;
    if (pct < 1) rafId = requestAnimationFrame(step);
    else { displayed.value = to; fromVal = to; }
  }
  rafId = requestAnimationFrame(step);
}

watch(() => props.value, (newVal) => {
  fromVal = displayed.value;
  animateTo(newVal);
});

onUnmounted(() => cancelAnimationFrame(rafId));
</script>
