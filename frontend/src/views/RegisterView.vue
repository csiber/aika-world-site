<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="logo-icon">🌌</div>
        <div class="logo-title">AIKA</div>
        <div class="logo-sub">COLONY</div>
      </div>

      <h2 class="auth-heading">Regisztráció</h2>

      <form class="auth-form" @submit.prevent="onRegister">
        <div class="field">
          <label>Felhasználónév</label>
          <input v-model="username" type="text" placeholder="Nexus_Pilot" autocomplete="username"
            minlength="3" maxlength="20" required />
          <span class="field-hint">3–20 karakter, betűk, számok, _ és -</span>
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="pilot@galaxy.hu" autocomplete="email" required />
        </div>
        <div class="field">
          <label>Jelszó</label>
          <input v-model="password" type="password" placeholder="Min. 6 karakter" autocomplete="new-password"
            minlength="6" required />
        </div>
        <div class="field">
          <label>Jelszó megerősítése</label>
          <input v-model="password2" type="password" placeholder="••••••••" autocomplete="new-password" required />
        </div>

        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>

        <button type="submit" class="auth-btn" :disabled="loading">
          <span v-if="loading">Regisztráció...</span>
          <span v-else">🚀 Fiók létrehozása</span>
        </button>
      </form>

      <div class="auth-switch">
        Már van fiókod?
        <RouterLink to="/login">Jelentkezz be</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const router    = useRouter();
const auth      = useAuthStore();
const username  = ref('');
const email     = ref('');
const password  = ref('');
const password2 = ref('');
const loading   = ref(false);
const errorMsg  = ref('');

async function onRegister() {
  if (password.value !== password2.value) {
    errorMsg.value = 'A két jelszó nem egyezik';
    return;
  }
  loading.value  = true;
  errorMsg.value = '';
  try {
    await auth.register(username.value, email.value, password.value);
    router.push('/');
  } catch (e) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.auth-card {
  width: 400px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 36px 32px;
  box-shadow: 0 0 60px rgba(0,200,255,0.08), 0 0 120px rgba(0,0,0,0.6);
}
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
.auth-error { background: rgba(255,58,122,0.1); border: 1px solid rgba(255,58,122,0.3); color: var(--accent2); padding: 8px 12px; border-radius: 4px; font-size: 12px; text-align: center; }
.auth-btn { padding: 12px; background: rgba(0,200,255,0.15); border: 1px solid var(--accent); color: var(--accent); font-size: 13px; border-radius: 4px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 1px; transition: all 0.2s; margin-top: 4px; }
.auth-btn:hover:not(:disabled) { background: rgba(0,200,255,0.3); box-shadow: 0 0 20px rgba(0,200,255,0.3); }
.auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.auth-switch { text-align: center; margin-top: 18px; font-size: 12px; color: var(--text-dim); }
.auth-switch a { color: var(--accent); text-decoration: none; margin-left: 6px; }
.auth-switch a:hover { text-decoration: underline; }
</style>
