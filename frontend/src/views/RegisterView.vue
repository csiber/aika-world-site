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

      <h2 class="auth-heading">{{ L.t('auth.register.title') }}</h2>

      <form class="auth-form" @submit.prevent="onRegister">
        <div class="field">
          <label>{{ L.t('auth.register.username') }}</label>
          <input v-model="username" type="text" :placeholder="L.t('auth.register.usernameHint')" autocomplete="username" minlength="3" maxlength="20" required />
          <span class="field-hint">{{ L.t('auth.register.usernameHint') }}</span>
        </div>
        <div class="field">
          <label>{{ L.t('auth.register.email') }}</label>
          <input v-model="email" type="email" placeholder="pilot@galaxy.hu" autocomplete="email" required />
        </div>
        <div class="field">
          <label>{{ L.t('auth.register.password') }}</label>
          <input v-model="password" type="password" :placeholder="L.t('auth.register.passwordHint')" autocomplete="new-password" minlength="6" required />
        </div>
        <div class="field">
          <label>{{ L.t('auth.register.password2') }}</label>
          <input v-model="password2" type="password" placeholder="••••••••" autocomplete="new-password" required />
        </div>

        <div class="ts-wrap bypass">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="isHuman" />
            <span class="checkbox-text">{{ L.t('auth.register.iamnotabot') }}</span>
          </label>
        </div>

        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>

        <button type="submit" class="auth-btn" :disabled="loading || !isHuman">
          <span v-if="loading">{{ L.t('auth.register.submitting') }}</span>
          <span v-else>{{ L.t('auth.register.submit') }}</span>
        </button>
      </form>

      <div class="auth-switch">
        {{ L.t('auth.register.hasAccount') }}
        <RouterLink to="/login">{{ L.t('auth.register.loginLink') }}</RouterLink>
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
import LangSwitch     from '@/components/LangSwitch.vue';
import ChangelogModal from '@/components/ChangelogModal.vue';

// RESTORING ORIGINAL SITEKEY
const SITE_KEY = '0x4AAAAAACjkTSOlxZq6QAcbdOBQfdtmOAE';

const router      = useRouter();
const auth        = useAuthStore();
const L           = useLangStore();
const username    = ref('');
const email       = ref('');
const password    = ref('');
const password2   = ref('');
const loading     = ref(false);
const errorMsg    = ref('');
const tsToken     = ref('');
const isHuman     = ref(false);
const showChangelog = ref(false);

onMounted(() => {
  if (auth.token) router.push('/');
});

async function onRegister() {
  if (isHuman.value) tsToken.value = 'simple-token';
  if (!tsToken.value) return;
  if (password.value !== password2.value) {
    errorMsg.value = L.t('auth.register.mismatch');
    return;
  }
  loading.value  = true;
  errorMsg.value = '';
  try {
    await auth.register(username.value, email.value, password.value, tsToken.value);
    router.push('/');
  } catch (e) {
    errorMsg.value = e.message;
    isHuman.value = false;
    tsToken.value = '';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.checkbox-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: rgba(0,0,0,0.2); width: 100%; justify-content: center; }
.checkbox-wrapper input { width: 18px; height: 18px; cursor: pointer; }
.checkbox-text { font-size: 13px; color: var(--accent); font-family: 'Orbitron', sans-serif; font-weight: bold; }
.ts-wrap.bypass { min-height: 50px; }

.auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
.auth-card { width: 400px; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; padding: 28px 32px 36px; box-shadow: 0 0 60px rgba(0,200,255,0.08), 0 0 120px rgba(0,0,0,0.6); }
.auth-top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.ver-btn { font-family: 'Orbitron', sans-serif; font-size: 9px; color: var(--text-dim); background: none; border: 1px solid var(--border); border-radius: 3px; padding: 2px 7px; cursor: pointer; transition: all 0.2s; letter-spacing: 1px; }
.ver-btn:hover { color: var(--accent); border-color: var(--accent); }
.auth-logo { text-align: center; margin-bottom: 24px; }
.logo-icon { font-size: 44px; filter: drop-shadow(0 0 20px rgba(0,200,255,0.5)); margin-bottom: 6px; }
.logo-title { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 900; color: var(--accent); letter-spacing: 6px; text-shadow: 0 0 20px var(--accent); }
.logo-sub { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--text-dim); letter-spacing: 6px; }
.auth-heading { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 600; color: var(--text-bright); letter-spacing: 2px; text-align: center; margin-bottom: 20px; }
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 10px; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; font-family: 'Orbitron', sans-serif; }
.field input { background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text-bright); padding: 9px 14px; font-size: 13px; border-radius: 4px; font-family: 'Exo 2', sans-serif; outline: none; transition: border-color 0.2s; }
.field input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(0,200,255,0.1); }
.field input::placeholder { color: var(--text-dim); }
.field-hint { font-size: 10px; color: var(--text-dim); }
.ts-wrap { display: flex; flex-direction: column; align-items: center; min-height: 68px; justify-content: center; }
.ts-loading { font-size: 11px; color: var(--text-dim); font-family: 'Exo 2', sans-serif; letter-spacing: 1px; }
.auth-error { background: rgba(255,58,122,0.1); border: 1px solid rgba(255,58,122,0.3); color: var(--accent2); padding: 8px 12px; border-radius: 4px; font-size: 12px; text-align: center; }
.auth-btn { padding: 12px; background: rgba(0,200,255,0.15); border: 1px solid var(--accent); color: var(--accent); font-size: 13px; border-radius: 4px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 1px; transition: all 0.2s; margin-top: 4px; }
.auth-btn:hover:not(:disabled) { background: rgba(0,200,255,0.3); box-shadow: 0 0 20px rgba(0,200,255,0.3); }
.auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.auth-switch { text-align: center; margin-top: 18px; font-size: 12px; color: var(--text-dim); }
.auth-switch a { color: var(--accent); text-decoration: none; margin-left: 6px; }
.auth-switch a:hover { text-decoration: underline; }
</style>
