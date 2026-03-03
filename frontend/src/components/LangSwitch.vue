<template>
  <div class="control-switch">
    <button @click="langStore.toggleTheme" class="btn-theme" :title="L.t('theme.toggle') || 'Téma váltás'">
      {{ langStore.theme === 'dark' ? '☀️' : '🌙' }}
    </button>
    <button @click="langStore.setLang('hu')" :class="{ active: langStore.lang === 'hu' }">HU</button>
    <button @click="langStore.setLang('en')" :class="{ active: langStore.lang === 'en' }">EN</button>
  </div>
</template>

<script setup>
import { useLangStore } from '@/stores/lang.js';
const langStore = useLangStore();
const L = langStore;
</script>

<style scoped>
.control-switch { display: flex; align-items: center; gap: 4px; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 4px; padding: 2px; }
.control-switch button { background: none; border: 1px solid transparent; color: var(--text-dim); font-size: 10px; padding: 4px 6px; border-radius: 3px; cursor: pointer; transition: all 0.2s; }
.control-switch button:hover { background: var(--bg-card); color: var(--text); }
.control-switch button.active { background: var(--accent); color: var(--bg-deep); font-weight: 700; }
.btn-theme { font-size: 12px !important; }
</style>
