<template>
  <div v-if="tour.active" class="tour-overlay">
    <!-- Highlight Effect (if target exists) -->
    <div v-if="targetRect" class="tour-highlight" :style="highlightStyle"></div>

    <div class="tour-tooltip" :class="step.position" :style="tooltipStyle">
      <div class="tour-content">
        <div class="tour-icon">🛰️</div>
        <div class="tour-text">
          <p>{{ L.t('auth.tour.' + step.id) }}</p>
        </div>
      </div>
      
      <div class="tour-footer">
        <button class="tour-skip" @click="tour.stop">{{ L.t('auth.tour.skip') }}</button>
        <button class="tour-next" @click="tour.next">
          {{ tour.currentStep === tour.steps.length - 1 ? L.t('auth.tour.finish') : L.t('auth.tour.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useTourStore } from '@/stores/tour.js';
import { useLangStore } from '@/stores/lang.js';

const tour = useTourStore();
const L    = useLangStore();

const targetRect = ref(null);

const step = computed(() => tour.steps[tour.currentStep]);

const highlightStyle = computed(() => {
  if (!targetRect.value) return {};
  return {
    top: `${targetRect.value.top - 5}px`,
    left: `${targetRect.value.left - 5}px`,
    width: `${targetRect.value.width + 10}px`,
    height: `${targetRect.value.height + 10}px`,
  };
});

const tooltipStyle = computed(() => {
  if (!targetRect.value) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  
  if (step.value.position === 'bottom') {
    return {
      top: `${targetRect.value.bottom + 20}px`,
      left: `${targetRect.value.left + targetRect.value.width / 2}px`,
      transform: 'translateX(-50%)'
    };
  }
  return {};
});

function updateTarget() {
  if (step.value.target) {
    const el = document.querySelector(step.value.target);
    if (el) {
      targetRect.value = el.getBoundingClientRect();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      targetRect.value = null;
    }
  } else {
    targetRect.value = null;
  }
}

watch(() => tour.currentStep, updateTarget);
watch(() => tour.active, (val) => { if (val) setTimeout(updateTarget, 100); });

onMounted(() => {
  window.addEventListener('resize', updateTarget);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateTarget);
});
</script>

<style scoped>
.tour-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  z-index: 10000; backdrop-filter: blur(2px);
  pointer-events: auto;
}

.tour-highlight {
  position: absolute;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.7), 0 0 20px var(--accent);
  border: 2px solid var(--accent);
  z-index: 10001;
  pointer-events: none;
  transition: all 0.3s ease;
}

.tour-tooltip {
  position: absolute;
  width: 300px;
  background: #1a1c24;
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.8);
  z-index: 10002;
  color: #fff;
  transition: all 0.3s ease;
}

.tour-tooltip.center { transform: translate(-50%, -50%); }

.tour-content { display: flex; gap: 15px; align-items: flex-start; }
.tour-icon { font-size: 30px; }
.tour-text { font-size: 14px; line-height: 1.5; flex: 1; }

.tour-footer { margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
.tour-skip { background: none; border: none; color: var(--text-dim); font-size: 12px; cursor: pointer; }
.tour-next {
  background: var(--accent); color: #000; border: none; border-radius: 4px;
  padding: 6px 15px; font-weight: 800; font-family: 'Orbitron', sans-serif; font-size: 11px;
  cursor: pointer; transition: all 0.2s;
}
.tour-next:hover { background: #fff; }

/* Arrow for tooltip */
.tour-tooltip.bottom::after {
  content: ''; position: absolute; bottom: 100%; left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent; border-bottom-color: var(--accent);
}
</style>
