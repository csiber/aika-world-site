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
  // Ensure the theme is set on initial load
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
  --bg-deep:    #030610;
  --bg-panel:   #070d1f;
  --bg-card:    #0b1428;
  --border:     #1a2a4a;
  --border-glow:#1e4080;
  --text:       #c8deff;
  --text-dim:   #4a6a9a;
  --text-bright:#e8f4ff;
  --panel-shadow: 0 0 30px rgba(0,200,255,0.08);
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

/* ── Starfield (Dark mode only) ── */
[data-theme="dark"] body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 10% 20%,  rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 50%,  rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 10%,  rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 70%,  rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1500px 1500px at 30% 100%, rgba(0,50,120,0.15) 0%, transparent 70%),
    radial-gradient(1000px 800px  at 80% 0%,   rgba(80,0,100,0.1)  0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

/* ── Notifications ── */
.notif-container { position: fixed; top: 60px; right: 12px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.notif { background: var(--bg-card); border: 1px solid var(--accent); border-radius: 6px; padding: 10px 14px; font-size: 12px; font-family: 'Exo 2', sans-serif; color: var(--text-bright); box-shadow: 0 0 20px rgba(0,200,255,0.2); min-width: 200px; max-width: 280px; }
.notif.red   { border-color: var(--accent2); box-shadow: 0 0 20px rgba(255,58,122,0.2); }
.notif.green { border-color: var(--accent3); box-shadow: 0 0 20px rgba(58,255,122,0.2); }
.notif-enter-active, .notif-leave-active { transition: all 0.3s ease; }
.notif-enter-from { transform: translateX(300px); opacity: 0; }
.notif-leave-to   { transform: translateX(300px); opacity: 0; }

@media (max-width: 768px) {
  .notif-container { top: 110px; right: 10px; left: 10px; align-items: stretch; }
  .notif { min-width: 0; max-width: none; width: 100%; }
  .notif-enter-from, .notif-leave-to { transform: translateY(-20px); opacity: 0; }
}

/* ── Shared component styles ── */
.panel { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--panel-shadow); overflow: hidden; }
.panel-header { background: linear-gradient(90deg, rgba(0,200,255,0.05) 0%, transparent 100%); border-bottom: 1px solid var(--border); padding: 8px 12px; display: flex; align-items: center; gap: 8px; }
.panel-header h3 { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; }
.panel-body { padding: 10px; }

.btn-primary { padding: 4px 10px; background: rgba(0,200,255,0.15); border: 1px solid var(--accent); color: var(--accent); font-size: 10px; border-radius: 3px; cursor: pointer; font-family: 'Orbitron', sans-serif; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap; position: relative; overflow: hidden; }
.btn-primary::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: 0.5s; }
.btn-primary:hover:not(:disabled)::after { left: 100%; }
.btn-primary:hover:not(:disabled) { background: rgba(0,200,255,0.3); box-shadow: 0 0 12px rgba(0,200,255,0.4); transform: translateY(-1px); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.3; cursor: not-allowed; border-color: var(--text-dim); color: var(--text-dim); background: none; }

/* ── Global Animations ── */
@keyframes glow-pulse { 0% { box-shadow: 0 0 5px rgba(0,200,255,0.2); } 50% { box-shadow: 0 0 20px rgba(0,200,255,0.4); } 100% { box-shadow: 0 0 5px rgba(0,200,255,0.2); } }
@keyframes text-glow { 0% { text-shadow: 0 0 5px rgba(0,200,255,0.2); } 50% { text-shadow: 0 0 15px rgba(0,200,255,0.6); } 100% { text-shadow: 0 0 5px rgba(0,200,255,0.2); } }
@keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
</style>
