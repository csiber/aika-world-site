<template>
  <div class="auth-page">
    <div class="matrix-bg">
      <div class="scanline"></div>
      <div class="glitch-overlay"></div>
    </div>

    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">🌌</span>
          <h1 class="logo-text">AIKA WORLD</h1>
          <p class="logo-sub">Galactic Strategy</p>
        </div>

        <p class="redirect-msg">{{ message }}</p>
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const router = useRouter();
const auth = useAuthStore();
const message = ref('Connecting to AikaHub...');

onMounted(async () => {
  try {
    await auth.requireAuth();
    // If we get here, user is authenticated
    router.push('/');
  } catch (e) {
    message.value = 'Redirecting to AikaHub...';
    // requireAuth already redirects, this is a fallback
  }
});
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #02040a; position: relative; overflow: hidden; font-family: 'Exo 2', sans-serif; }
.matrix-bg { position: absolute; inset: 0; background: radial-gradient(circle at center, #0a1525 0%, #02040a 100%); z-index: 0; }
.scanline { width: 100%; height: 100px; background: linear-gradient(0deg, rgba(0, 255, 255, 0) 0%, rgba(0, 200, 255, 0.05) 50%, rgba(0, 255, 255, 0) 100%); position: absolute; bottom: 100%; animation: scan 8s linear infinite; z-index: 1; }
@keyframes scan { from { bottom: 100%; } to { bottom: -100px; } }
.glitch-overlay { position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png'); opacity: 0.1; pointer-events: none; }
.auth-container { position: relative; z-index: 10; width: 100%; max-width: 400px; padding: 20px; }
.auth-card { background: rgba(10, 20, 40, 0.8); backdrop-filter: blur(15px); border: 1px solid var(--border); border-radius: 12px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); text-align: center; }
.auth-logo { margin-bottom: 30px; }
.logo-icon { font-size: 50px; display: block; margin-bottom: 10px; animation: float 4s ease-in-out infinite; }
.logo-text { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; color: var(--accent); letter-spacing: 4px; text-shadow: 0 0 15px var(--accent); }
.logo-sub { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 6px; margin-top: 5px; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.redirect-msg { color: var(--accent); font-size: 14px; font-family: 'Orbitron', sans-serif; margin-bottom: 20px; letter-spacing: 1px; }
.spinner { width: 30px; height: 30px; border: 3px solid rgba(0,200,255,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
