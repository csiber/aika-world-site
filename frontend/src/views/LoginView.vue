<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-top-bar">
        <LangSwitch />
        <button class="ver-btn" @click="showChangelog = true">v{{ APP_VERSION }}</button>
      </div>

      <div class="auth-logo">
        <div class="logo-icon">🌌</div>
        <div class="logo-title">AIKA</div>
        <div class="logo-sub">COLONY</div>
      </div>

      <h2 class="auth-heading">{{ L.t('auth.login.title') }}</h2>

      <form class="auth-form" @submit.prevent="onLogin">
        <div class="field">
          <label>{{ L.t('auth.login.email') }}</label>
          <input v-model="email" type="email" placeholder="pilot@galaxy.hu" autocomplete="email" required />
        </div>
        <div class="field">
          <label>{{ L.t('auth.login.password') }}</label>
          <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" required />
        </div>

        <div class="ts-wrap">
          <div ref="tsContainer"></div>
          <div v-if="!tsReady" class="ts-loading">{{ L.t('auth.login.security') }}</div>
        </div>

        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>

        <button type="submit" class="auth-btn" :disabled="loading || !tsToken">
          <span v-if="loading">{{ L.t('auth.login.submitting') }}</span>
          <span v-else>{{ L.t('auth.login.submit') }}</span>
        </button>
      </form>

      <div class="auth-switch">
        {{ L.t('auth.login.noAccount') }}
        <RouterLink to="/register">{{ L.t('auth.login.registerLink') }}</RouterLink>
      </div>
    </div>

    <ChangelogModal v-if="showChangelog" @close="showChangelog = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useLangStore } from '@/stores/lang.js';
import { APP_VERSION } from '@/data/changelog.js';
import LangSwitch      from '@/components/LangSwitch.vue';
import ChangelogModal  from '@/components/ChangelogModal.vue';

const SITE_KEY = '0x4AAAAAACjkTbgtjRtTiQo_';

const router      = useRouter();
const auth        = useAuthStore();
const L           = useLangStore();
const email       = ref('');
const password    = ref('');
const loading     = ref(false);
const errorMsg    = ref('');
const tsContainer = ref(null);
const tsToken     = ref('');
const tsWidgetId  = ref(null);
const tsReady     = ref(false);
const showChangelog = ref(false);

function initTurnstile() {
  if (window.turnstile && tsContainer.value) {
    tsReady.value = true;
    tsWidgetId.value = window.turnstile.render(tsContainer.value, {
      sitekey: SITE_KEY, theme: 'dark',
      callback:           (token) => { tsToken.value = token; },
      'expired-callback': ()      => { tsToken.value = ''; },
      'error-callback':   ()      => { tsToken.value = ''; },
    });
  } else {
    setTimeout(initTurnstile, 100);
  }
}

onMounted(initTurnstile);
onUnmounted(() => {
  if (tsWidgetId.value !== null && window.turnstile) window.turnstile.remove(tsWidgetId.value);
});

async function onLogin() {
  if (!tsToken.value) return;
  loading.value  = true;
  errorMsg.value = '';
  try {
    await auth.login(email.value, password.value, tsToken.value);
    router.push('/');
  } catch (e) {
    errorMsg.value = e.message;
    if (tsWidgetId.value !== null && window.turnstile) window.turnstile.reset(tsWidgetId.value);
    tsToken.value = '';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 1;
}
.auth-card {
  width: 380px; background: var(--bg-panel); border: 1px solid var(--border);
  border-radius: 12px; padding: 28px 32px 36px;
  box-shadow: 0 0 60px rgba(0,200,255,0.08), 0 0 120px rgba(0,0,0,0.6);
}
.auth-top-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.ver-btn {
  font-family: 'Orbitron', sans-serif; font-size: 9px; color: var(--text-dim);
  background: none; border: 1px solid var(--border); border-radius: 3px;
  padding: 2px 7px; cursor: pointer; transition: all 0.2s; letter-spacing: 1px;
}
.ver-btn:hover { color: var(--accent); border-color: var(--accent); }
.auth-logo { text-align: center; margin-bottom: 28px; }
.logo-icon { font-size: 48px; filter: drop-shadow(0 0 20px rgba(0,200,255,0.5)); margin-bottom: 8px; }
.logo-title { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; color: var(--accent); letter-spacing: 6px; text-shadow: 0 0 20px var(--accent); }
.logo-sub { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--text-dim); letter-spacing: 6px; }
.auth-heading { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 600; color: var(--text-bright); letter-spacing: 2px; text-align: center; margin-bottom: 24px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 10px; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; font-family: 'Orbitron', sans-serif; }
.field input { background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text-bright); padding: 10px 14px; font-size: 13px; border-radius: 4px; font-family: 'Exo 2', sans-serif; outline: none; transition: border-color 0.2s; }
.field input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(0,200,255,0.1); }
.field input::placeholder { color: var(--text-dim); }
.ts-wrap { display: flex; flex-direction: column; align-items: center; min-height: 68px; justify-content: center; }
.ts-loading { font-size: 11px; color: var(--text-dim); font-family: 'Exo 2', sans-serif; letter-spacing: 1px; }
.auth-error { background: rgba(255,58,122,0.1); border: 1px solid rgba(255,58,122,0.3); color: var(--accent2); padding: 8px 12px; border-radius: 4px; font-size: 12px; text-align: center; }
.auth-btn { padding: 12px; background: rgba(0,200,255,0.15); border: 1px solid var(--accent); color: var(--accent); font-size: 13px; border-radius: 4px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 1px; transition: all 0.2s; margin-top: 4px; }
.auth-btn:hover:not(:disabled) { background: rgba(0,200,255,0.3); box-shadow: 0 0 20px rgba(0,200,255,0.3); }
.auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.auth-switch { text-align: center; margin-top: 20px; font-size: 12px; color: var(--text-dim); }
.auth-switch a { color: var(--accent); text-decoration: none; margin-left: 6px; font-weight: 500; }
.auth-switch a:hover { text-decoration: underline; }
</style>
