<template>
  <RouterView />
  <!-- Global notifications -->
  <Teleport to="body">
    <div class="notif-container">
      <TransitionGroup name="notif">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notif"
          :class="n.type"
        >{{ n.text }}</div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';

const game = useGameStore();
const lang = useLangStore();
const notifications = computed(() => game.notifications);

onMounted(() => {
  document.documentElement.setAttribute('data-theme', lang.theme);
});
</script>

<style>
/* ── Theme Variables ── */
:root {
  --accent: #00c8ff;
  --accent2: #ff3a7a;
  --accent3: #7fff47;
  --accent4: #ffd700;
  --red: #ff3a3a;
  --green: #3aff7a;
  --metal: #8ab0d0;
  --crystal: #a87fff;
  --energy: #ffcc00;
}

/* Dark Theme (Default) */
[data-theme="dark"] {
  --bg-deep:    #02040a;
  --bg-panel:   #050a18;
  --bg-card:    #081020;
  --border:     #101a30; /* Very dark blue, almost invisible */
  --border-glow:#1e4080;
  --text:       #c8deff;
  --text-dim:   #4a6a9a;
  --text-bright:#e8f4ff;
  --panel-shadow: none;
}

/* Light Theme */
[data-theme="light"] {
  --bg-deep:    #e8f0f8;
  --bg-panel:   #ffffff;
  --bg-card:    #f8fafd;
  --border:     #d0d8e8;
  --border-glow:#a0b8d8;
  --text:       #2c3e50;
  --text-dim:   #7f8c9a;
  --text-bright:#1c2833;
  --panel-shadow: 0 4px 20px rgba(0,20,50,0.05);
}

/* ── Shared component styles ── */
.panel { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.panel-header { background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); padding: 8px 12px; display: flex; align-items: center; gap: 8px; }
.panel-header h3 { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; }
.panel-body { padding: 10px; }

/* ── Global Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.btn-primary { padding: 4px 10px; background: rgba(0,200,255,0.1); border: 1px solid var(--accent); color: var(--accent); font-size: 10px; border-radius: 3px; cursor: pointer; font-family: 'Orbitron', sans-serif; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { background: rgba(0,200,255,0.2); box-shadow: 0 0 10px rgba(0,200,255,0.2); }
</style>
