<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="logo-icon">🌌</div>
        <div class="logo-title">AIKA</div>
        <div class="logo-sub">COLONY</div>
      </div>

      <h2 class="auth-heading">Redirecting to AikaHub...</h2>
      <p class="redirect-msg">Registration is now handled through AikaHub.</p>
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.js';

const auth = useAuthStore();

onMounted(async () => {
  // Redirect to AikaHub for registration/login
  await auth.requireAuth();
});
</script>

<style scoped>
.auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; font-family: 'Exo 2', sans-serif; background: #02040a; }
.auth-card { width: 400px; background: rgba(10, 20, 40, 0.8); border: 1px solid var(--border); border-radius: 12px; padding: 40px; box-shadow: 0 0 60px rgba(0,200,255,0.08), 0 0 120px rgba(0,0,0,0.6); text-align: center; }
.auth-logo { margin-bottom: 24px; }
.logo-icon { font-size: 44px; filter: drop-shadow(0 0 20px rgba(0,200,255,0.5)); margin-bottom: 6px; }
.logo-title { font-family: 'Orbitron', sans-serif; font-size: 26px; font-weight: 900; color: var(--accent); letter-spacing: 6px; text-shadow: 0 0 20px var(--accent); }
.logo-sub { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--text-dim); letter-spacing: 6px; }
.auth-heading { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 600; color: var(--accent); letter-spacing: 2px; margin-bottom: 16px; }
.redirect-msg { color: var(--text-dim); font-size: 13px; margin-bottom: 20px; }
.spinner { width: 30px; height: 30px; border: 3px solid rgba(0,200,255,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
