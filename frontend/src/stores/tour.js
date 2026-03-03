import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTourStore = defineStore('tour', () => {
  const active = ref(false);
  const currentStep = ref(0);

  const steps = [
    { id: 'welcome',   target: null, position: 'center' },
    { id: 'resources', target: '.resource-bar', position: 'bottom' },
    { id: 'planets',   target: '.planet-bar',   position: 'bottom' },
    { id: 'nav',       target: '.nav',          position: 'bottom' },
  ];

  function start() {
    active.value = true;
    currentStep.value = 0;
  }

  function next() {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
    } else {
      stop();
    }
  }

  function stop() {
    active.value = false;
    localStorage.setItem('aika_tour_finished', 'true');
  }

  return { active, currentStep, steps, start, next, stop };
});
