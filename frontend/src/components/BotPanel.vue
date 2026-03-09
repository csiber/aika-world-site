<template>
  <div class="bot-panel" :class="{ minimized }">
    <!-- ── HEADER ── -->
    <div class="bot-header" @click="minimized = !minimized">
      <span class="bot-title">🤖 {{ L.t('bot.title') }} 2.0</span>
      <div class="bot-header-actions" @click.stop>
        <button class="bot-btn" :disabled="bot.status === 'exhausted'" @click="toggleBot" :title="bot.active ? L.t('bot.stopped') : L.t('bot.running')">
          {{ bot.active ? '■' : '▶' }}
        </button>
        <button class="bot-btn close-btn" @click="minimized = !minimized">
          {{ minimized ? '▲' : '▼' }}
        </button>
      </div>
    </div>

    <!-- ── BODY ── -->
    <div v-if="!minimized" class="bot-body">

      <!-- Status -->
      <div class="bot-status-row">
        <span class="status-dot" :class="bot.status"></span>
        <span class="status-label">{{ statusLabel }}</span>
      </div>
      <div v-if="bot.lastAction" class="bot-last-action">{{ bot.lastAction }}</div>

      <div class="bot-divider"></div>

      <!-- Stats -->
      <div class="bot-stats">
        <div class="stat-row">
          <span class="stat-icon">⏱</span>
          <span>{{ L.t('bot.today') }} <b>{{ dailyTimeStr }}</b> / {{ bot.settings.dailyTimeLimitMin }} {{ L.t('time.min') }}</span>
          <button class="reset-btn" @click="bot.resetStats" title="Statisztikák nullázása">♻️</button>
        </div>
        <div class="stat-row">
          <span class="stat-icon">🎯</span>
          <span>{{ L.t('bot.actions') }} <b>{{ bot.todayActions }}</b> / {{ bot.settings.dailyActionLimit }}</span>
        </div>
        <div class="stat-row" v-if="bot.active">
          <span class="stat-icon">🕐</span>
          <span>{{ L.t('bot.session') }} <b>{{ sessionStr }}</b> / {{ bot.settings.sessionTimeLimitMin }}:00</span>
        </div>
      </div>

      <div class="bot-divider"></div>

      <!-- Settings toggle -->
      <button class="settings-toggle" @click="showSettings = !showSettings">
        {{ L.t('bot.settings') }} {{ showSettings ? '▲' : '▼' }}
      </button>

      <div v-if="showSettings" class="bot-settings">
        <label class="setting-row">
          <input type="checkbox" v-model="bot.settings.autoBuild" />
          <span>{{ L.t('bot.autoBuild') }}</span>
        </label>
        <label class="setting-row">
          <input type="checkbox" v-model="bot.settings.autoResearch" />
          <span>{{ L.t('bot.autoResearch') }}</span>
        </label>
        <label class="setting-row">
          <input type="checkbox" v-model="bot.settings.autoFleet" />
          <span>{{ L.t('bot.autoFleet') }}</span>
        </label>
        <label class="setting-row">
          <input type="checkbox" v-model="bot.settings.autoExpedition" />
          <span>🚀 Auto-Expedíció</span>
        </label>
        <div class="setting-number-row">
          <span>{{ L.t('bot.dailyLimit') }}</span>
          <input type="number" v-model.number="bot.settings.dailyTimeLimitMin" min="1" max="1440" class="num-input" />
        </div>
        <div class="setting-number-row">
          <span>{{ L.t('bot.sessionLimit') }}</span>
          <input type="number" v-model.number="bot.settings.sessionTimeLimitMin" min="1" max="120" class="num-input" />
        </div>
        <div class="setting-number-row">
          <span>{{ L.t('bot.actionLimit') }}</span>
          <input type="number" v-model.number="bot.settings.dailyActionLimit" min="1" max="200" class="num-input" />
        </div>

        <div class="bot-divider"></div>

        <!-- Sound settings -->
        <label class="setting-row">
          <input type="checkbox" v-model="soundEnabled" @change="onSoundToggle" />
          <span>{{ L.t('bot.sounds') }}</span>
        </label>
        <div v-if="soundEnabled" class="setting-number-row volume-row">
          <span>{{ L.t('bot.volume') }}</span>
          <input type="range" min="0" max="1" step="0.05" v-model.number="soundVolume" @input="onVolumeChange" class="volume-slider" />
          <span class="volume-pct">{{ Math.round(soundVolume * 100) }}%</span>
        </div>

        <div class="bot-divider"></div>

        <!-- Notification settings -->
        <div class="notif-row">
          <span>{{ L.t('bot.notifications') }}</span>
          <button class="notif-btn" :class="notifPermission" @click="onRequestNotif" :disabled="notifPermission === 'granted' || notifPermission === 'unsupported'">
            {{ notifLabel }}
          </button>
        </div>
        <div v-if="notifPermission === 'granted'" class="notif-hint">{{ L.t('bot.notifBg') }}</div>
        <div v-if="notifPermission === 'denied'"  class="notif-hint warn">{{ L.t('bot.notifBlocked') }}</div>
      </div>

      <div class="bot-divider"></div>

      <!-- Log -->
      <div class="bot-log">
        <div v-for="(entry, i) in bot.log.slice(0, 12)" :key="i" class="log-entry" :class="entry.type">
          <span class="log-ts">{{ entry.ts }}</span>
          <span class="log-msg">{{ entry.msg }}</span>
        </div>
        <div v-if="bot.log.length === 0" class="log-empty">{{ L.t('bot.noLog') }}</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useBotStore }  from '@/stores/bot.js';
import { useLangStore } from '@/stores/lang.js';
import { initAudio, setVolume, sounds } from '@/utils/botAudio.js';
import { getPermissionState, requestPermission, sendNotification } from '@/utils/botNotify.js';

const bot = useBotStore();
const L   = useLangStore();

const minimized    = ref(false);
const showSettings = ref(false);

// ── Audio ─────────────────────────────────────────────────────
const soundEnabled = ref(true);
const soundVolume  = ref(0.35);

function onSoundToggle() { setVolume(soundEnabled.value ? soundVolume.value : 0); }
function onVolumeChange() { setVolume(soundVolume.value); }

// ── Notifications ─────────────────────────────────────────────
const notifPermission = ref(getPermissionState());

const notifLabel = computed(() => {
  switch (notifPermission.value) {
    case 'granted':     return L.t('bot.notifGranted');
    case 'denied':      return L.t('bot.notifDenied');
    case 'unsupported': return L.t('bot.notifUnsupported');
    default:            return L.t('bot.notifRequest');
  }
});

async function onRequestNotif() {
  notifPermission.value = await requestPermission();
}

// ── Toggle ────────────────────────────────────────────────────
function toggleBot() {
  if (bot.active) { bot.stop(); }
  else { initAudio(); bot.start(); }
}

// ── React to new log entries ──────────────────────────────────
watch(() => bot.log[0], (entry) => {
  if (!entry) return;
  if (soundEnabled.value) {
    switch (entry.type) {
      case 'build':    sounds.build();    break;
      case 'research': sounds.research(); break;
      case 'fleet':    sounds.fleet();    break;
      case 'energy':   sounds.energy();   break;
      case 'warn':     sounds.warn();     break;
      case 'system':
        entry.msg.includes('aktiválva') || entry.msg.includes('activated') ? sounds.start() : sounds.stop();
        break;
    }
  }
  if (entry.type !== 'idle') sendNotification('🤖 AIKA Bot', entry.msg);
});

// ── Computed display ──────────────────────────────────────────
const statusLabel = computed(() => {
  switch (bot.status) {
    case 'running':   return L.t('bot.running');
    case 'exhausted': return L.t('bot.exhausted');
    default:          return L.t('bot.stopped');
  }
});

const dailyTimeStr = computed(() => {
  const mins = Math.floor(bot.todayTimeMs / 60000);
  const secs = Math.floor((bot.todayTimeMs % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, '0')}`;
});

const sessionStr = computed(() => {
  const ms   = bot.sessionElapsedMs;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, '0')}`;
});
</script>

<style scoped>
.bot-panel {
  position: fixed; bottom: 20px; right: 20px; z-index: 1000; width: 260px;
  background: var(--bg-panel, #080f22);
  border: 1px solid var(--border-glow, rgba(0,200,255,0.3));
  border-radius: 6px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.7), 0 0 16px rgba(0,200,255,0.08);
  font-family: 'Exo 2', sans-serif; font-size: 12px; color: var(--text, #c8d8f0); user-select: none;
}
.bot-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(0,200,255,0.06); border-bottom: 1px solid var(--border, rgba(0,200,255,0.15)); border-radius: 6px 6px 0 0; cursor: pointer; }
.bot-title { font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700; color: var(--accent, #00c8ff); letter-spacing: 1px; }
.bot-header-actions { display: flex; gap: 4px; }
.bot-btn { background: rgba(0,200,255,0.1); border: 1px solid var(--border, rgba(0,200,255,0.2)); color: var(--accent, #00c8ff); width: 24px; height: 22px; border-radius: 3px; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.bot-btn:hover:not(:disabled) { background: rgba(0,200,255,0.2); }
.bot-btn:disabled { opacity: 0.35; cursor: default; }
.close-btn { color: var(--text-dim, #7090b0); }
.bot-body { padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.bot-divider { height: 1px; background: var(--border, rgba(0,200,255,0.1)); margin: 2px 0; }
.bot-status-row { display: flex; align-items: center; gap: 7px; }
.status-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; background: var(--text-dim, #7090b0); }
.status-dot.running { background: #00e676; box-shadow: 0 0 6px #00e676; animation: pulse-dot 1.4s ease-in-out infinite; }
.status-dot.exhausted { background: #ff3a7a; box-shadow: 0 0 6px #ff3a7a; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
.status-label { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; color: var(--text, #c8d8f0); letter-spacing: 1px; }
.bot-last-action { font-size: 11px; color: var(--text-dim, #7090b0); padding-left: 16px; }
.bot-stats { display: flex; flex-direction: column; gap: 3px; }
.stat-row { display: flex; align-items: center; gap: 6px; color: var(--text-dim, #7090b0); }
.stat-row b { color: var(--text, #c8d8f0); }
.stat-icon { width: 14px; text-align: center; }
.reset-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 0 5px; opacity: 0.6; transition: opacity 0.2s, transform 0.2s; }
.reset-btn:hover { opacity: 1; transform: rotate(180deg); }
.settings-toggle { background: none; border: 1px solid var(--border, rgba(0,200,255,0.15)); color: var(--text-dim, #7090b0); padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; width: 100%; text-align: left; font-family: 'Exo 2', sans-serif; transition: all 0.2s; }
.settings-toggle:hover { background: rgba(255,255,255,0.03); color: var(--text, #c8d8f0); }
.bot-settings { display: flex; flex-direction: column; gap: 5px; padding: 4px 0; }
.setting-row { display: flex; align-items: center; gap: 7px; cursor: pointer; color: var(--text-dim, #7090b0); transition: color 0.2s; }
.setting-row:hover { color: var(--text, #c8d8f0); }
.setting-row input[type="checkbox"] { accent-color: var(--accent, #00c8ff); width: 13px; height: 13px; cursor: pointer; }
.setting-number-row { display: flex; align-items: center; justify-content: space-between; color: var(--text-dim, #7090b0); gap: 6px; }
.num-input { width: 54px; background: rgba(0,0,0,0.3); border: 1px solid var(--border, rgba(0,200,255,0.15)); color: var(--text, #c8d8f0); border-radius: 3px; padding: 2px 5px; font-size: 11px; font-family: 'Exo 2', sans-serif; text-align: right; }
.num-input:focus { outline: none; border-color: var(--accent, #00c8ff); }
.volume-row { gap: 5px; }
.volume-slider { flex: 1; accent-color: var(--accent, #00c8ff); cursor: pointer; height: 4px; }
.volume-pct { font-size: 10px; color: var(--text-dim, #7090b0); min-width: 28px; text-align: right; }
.notif-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; color: var(--text-dim, #7090b0); }
.notif-btn { font-size: 10px; padding: 2px 7px; border-radius: 3px; cursor: pointer; border: 1px solid var(--border, rgba(0,200,255,0.2)); background: rgba(0,200,255,0.08); color: var(--accent, #00c8ff); font-family: 'Exo 2', sans-serif; transition: all 0.2s; white-space: nowrap; }
.notif-btn:hover:not(:disabled) { background: rgba(0,200,255,0.18); }
.notif-btn:disabled { opacity: 0.5; cursor: default; }
.notif-btn.granted { color: #00e676; border-color: rgba(0,230,118,0.3); background: rgba(0,230,118,0.06); }
.notif-btn.denied  { color: #ff3a7a; border-color: rgba(255,58,122,0.3); background: rgba(255,58,122,0.06); }
.notif-hint { font-size: 10px; color: var(--text-dim, #7090b0); padding-left: 2px; }
.notif-hint.warn { color: #ffaa00; }
.bot-log { max-height: 100px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
.bot-log::-webkit-scrollbar { width: 4px; }
.bot-log::-webkit-scrollbar-track { background: transparent; }
.bot-log::-webkit-scrollbar-thumb { background: var(--border, rgba(0,200,255,0.2)); border-radius: 2px; }
.log-entry { display: flex; align-items: flex-start; gap: 5px; font-size: 10.5px; line-height: 1.4; }
.log-ts { color: var(--text-dim, #7090b0); flex-shrink: 0; font-family: 'Orbitron', sans-serif; font-size: 9px; padding-top: 1px; }
.log-msg { color: var(--text, #c8d8f0); }
.log-entry.warn .log-msg     { color: #ffaa00; }
.log-entry.energy .log-msg   { color: #00e676; }
.log-entry.build .log-msg    { color: var(--accent, #00c8ff); }
.log-entry.research .log-msg { color: var(--accent3, #a78bfa); }
.log-entry.fleet .log-msg    { color: var(--accent2, #ff3a7a); }
.log-entry.system .log-msg   { color: var(--accent4, #ffd700); }
.log-entry.idle .log-msg     { color: var(--text-dim, #7090b0); font-style: italic; }
.log-empty { color: var(--text-dim, #7090b0); font-style: italic; font-size: 11px; text-align: center; padding: 4px 0; }
.bot-panel.minimized { width: auto; min-width: 160px; }
.bot-panel.minimized .bot-header { border-radius: 6px; border-bottom: none; }

@media (max-width: 768px) {
  .bot-panel { bottom: 10px; right: 10px; width: 220px; }
  .bot-body { max-height: 350px; overflow-y: auto; }
  .bot-title { font-size: 10px; }
  .bot-stats { font-size: 11px; }
}
</style>
