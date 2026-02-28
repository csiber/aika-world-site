<template>
  <div class="lang-switch" :title="lang === 'hu' ? 'Switch to English' : 'Váltás magyarra'">
    <button
      class="ls-btn"
      :class="{ active: lang === 'hu' }"
      @click="setLang('hu')"
    >HU</button>
    <span class="ls-sep">|</span>
    <button
      class="ls-btn"
      :class="{ active: lang === 'en' }"
      @click="setLang('en')"
    >EN</button>
  </div>
</template>

<script setup>
import { useLangStore } from '@/stores/lang.js';
import { storeToRefs } from 'pinia';

const langStore = useLangStore();
const { lang } = storeToRefs(langStore);
const { setLang } = langStore;
</script>

<style scoped>
.lang-switch {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
}
.ls-btn {
  background: none;
  border: 1px solid transparent;
  color: var(--text-dim, #7090b0);
  padding: 2px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.ls-btn:hover { color: var(--text, #c8d8f0); }
.ls-btn.active {
  color: var(--accent, #00c8ff);
  border-color: rgba(0,200,255,0.3);
  background: rgba(0,200,255,0.08);
}
.ls-sep { color: var(--border, rgba(0,200,255,0.2)); font-size: 10px; }
</style>
