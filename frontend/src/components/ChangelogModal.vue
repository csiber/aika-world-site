<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">📋 {{ L.t('changelog.title') }}</span>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-body">
          <div v-for="entry in changelog" :key="entry.version" class="cl-entry">
            <div class="cl-version-row">
              <span class="cl-badge">v{{ entry.version }}</span>
              <span class="cl-date">{{ entry.date }}</span>
              <span v-if="entry.version === APP_VERSION" class="cl-current">{{ L.lang === 'hu' ? 'Jelenlegi' : 'Current' }}</span>
            </div>
            <ul class="cl-list">
              <li v-for="(item, i) in (L.lang === 'hu' ? entry.hu : entry.en)" :key="i">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useLangStore } from '@/stores/lang.js';
import { changelog, APP_VERSION } from '@/data/changelog.js';

defineEmits(['close']);

const L = useLangStore();
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(3px);
}
.modal-box {
  width: 520px; max-width: 95vw; max-height: 80vh;
  background: var(--bg-panel, #080f22);
  border: 1px solid var(--border-glow, rgba(0,200,255,0.3));
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.8);
  display: flex; flex-direction: column;
  font-family: 'Exo 2', sans-serif;
}
.modal-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border, rgba(0,200,255,0.15));
  background: rgba(0,200,255,0.05);
  border-radius: 8px 8px 0 0;
}
.modal-title {
  font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700;
  color: var(--accent, #00c8ff); letter-spacing: 1px; flex: 1;
}
.modal-close {
  background: none; border: 1px solid var(--border, rgba(0,200,255,0.2));
  color: var(--text-dim, #7090b0); width: 26px; height: 26px;
  border-radius: 4px; cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { color: var(--accent2, #ff3a7a); border-color: var(--accent2, #ff3a7a); }

.modal-body {
  flex: 1; overflow-y: auto; padding: 18px;
  display: flex; flex-direction: column; gap: 20px;
}
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: var(--border, rgba(0,200,255,0.2)); border-radius: 2px; }

.cl-entry { border-left: 2px solid var(--border, rgba(0,200,255,0.2)); padding-left: 14px; }
.cl-version-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.cl-badge {
  font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700;
  color: var(--accent, #00c8ff); background: rgba(0,200,255,0.1);
  border: 1px solid rgba(0,200,255,0.25); padding: 2px 8px; border-radius: 4px;
}
.cl-date { font-size: 10px; color: var(--text-dim, #7090b0); font-family: 'Orbitron', sans-serif; }
.cl-current {
  font-size: 9px; padding: 1px 6px; border-radius: 3px;
  background: rgba(0,230,118,0.15); color: #00e676;
  border: 1px solid rgba(0,230,118,0.3);
  font-family: 'Orbitron', sans-serif; letter-spacing: 1px;
}
.cl-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.cl-list li { font-size: 11.5px; color: var(--text, #c8d8f0); padding-left: 14px; position: relative; line-height: 1.5; }
.cl-list li::before { content: '›'; position: absolute; left: 0; color: var(--accent, #00c8ff); font-weight: 700; }
</style>
