<template>
  <div class="auth-page">
    <!-- Animated Matrix/Glitch Background -->
    <div class="matrix-bg">
      <div class="scanline"></div>
      <div class="glitch-overlay"></div>
    </div>

    <div class="auth-container" :class="{ blurred: showIntro }">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">🌌</span>
          <h1 class="logo-text">AIKA WORLD</h1>
          <p class="logo-sub">Galactic Strategy</p>
        </div>

        <form @submit.prevent="onLogin" class="auth-form">
          <div class="input-group">
            <label>{{ L.t('auth.login.email') }}</label>
            <input v-model="email" type="email" required placeholder="parancsnok@aika.world" />
          </div>
          <div class="input-group">
            <label>{{ L.t('auth.login.password') }}</label>
            <input v-model="password" type="password" required placeholder="••••••••" />
          </div>

          <!-- Cloudflare Turnstile -->
          <div class="captcha-container">
            <div id="turnstile-container"></div>
            <p v-if="!captchaReady" class="captcha-loading">{{ L.t('auth.login.security') }}</p>
          </div>

          <button type="submit" class="auth-btn" :disabled="loading || !captchaToken">
            <span v-if="loading">{{ L.t('auth.login.submitting') }}</span>
            <span v-else>{{ L.t('auth.login.submit') }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>{{ L.t('auth.login.noAccount') }} <router-link to="/register">{{ L.t('auth.login.registerLink') }}</router-link></p>
          <button class="intro-trigger" @click="showIntro = true">{{ L.t('auth.intro.btn') }}</button>
        </div>
        
        <div v-if="error" class="auth-error">❌ {{ error }}</div>
      </div>
    </div>

    <!-- TERMINAL INTRO MODAL -->
    <Transition name="terminal-fade">
      <div v-if="showIntro" class="terminal-overlay" @click.self="showIntro = false">
        <div class="terminal-window">
          <div class="terminal-header">
            <div class="terminal-controls">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            </div>
            <div class="terminal-title">AIKA_CORE_INTEL.EXE</div>
            <button class="terminal-close" @click="showIntro = false">✕</button>
          </div>
          <div class="terminal-body">
            <div class="typing-text">
              <p class="line"><span class="prompt">></span> ACCESSING_GALAXY_DATABASE...</p>
              <p class="line delay-1"><span class="prompt">></span> <span class="highlight">{{ L.t('auth.intro.title') }}</span></p>
              <p class="line delay-2">{{ L.t('auth.intro.what') }}</p>
              <p class="line delay-3"><span class="prompt">></span> MISSION_OBJECTIVE:</p>
              <p class="line delay-4">{{ L.t('auth.intro.goal') }}</p>
              <p class="line delay-5"><span class="prompt">></span> CORE_FEATURES:</p>
              <p class="line delay-6">{{ L.t('auth.intro.features') }}</p>
              <p class="line delay-7 blink-line"><span class="prompt">></span> {{ L.t('auth.intro.start') }}</p>
            </div>
            <button class="terminal-btn" @click="showIntro = false">INITIATE_LOGIN_SEQUENCE</button>
          </div>
        </div>
      </div>
    </Transition>

    <LangSwitch class="abs-lang" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useLangStore } from '@/stores/lang.js';
import LangSwitch from '@/components/LangSwitch.vue';

const router = useRouter();
const auth   = useAuthStore();
const L      = useLangStore();

const email    = ref('');
const password = ref('');
const error    = ref('');
const loading  = ref(false);
const showIntro = ref(false);

const captchaToken = ref(null);
const captchaReady = ref(false);

function onLogin() {
  if (!captchaToken.value) return;
  loading.value = true;
  error.value   = '';
  auth.login(email.value, password.value, captchaToken.value)
    .then(() => router.push('/'))
    .catch(err => {
      error.value = err.message;
      if (window.turnstile) window.turnstile.reset();
      captchaToken.value = null;
    })
    .finally(() => loading.value = false);
}

onMounted(() => {
  if (auth.token) router.push('/');
  
  const script = document.createElement('script');
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = () => {
    if (window.turnstile) {
      window.turnstile.render('#turnstile-container', {
        sitekey: '0x4AAAAAACjkTbgtjRtTiQo_',
        callback: (token) => { captchaToken.value = token; },
        'expired-callback': () => { captchaToken.value = null; },
        theme: 'dark'
      });
      captchaReady.value = true;
    }
  };
});
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #02040a;
  position: relative;
  overflow: hidden;
  font-family: 'Exo 2', sans-serif;
}

/* ── Matrix/Glitch Background ── */
.matrix-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, #0a1525 0%, #02040a 100%);
  z-index: 0;
}
.scanline {
  width: 100%; height: 100px;
  background: linear-gradient(0deg, rgba(0, 255, 255, 0) 0%, rgba(0, 200, 255, 0.05) 50%, rgba(0, 255, 255, 0) 100%);
  position: absolute; bottom: 100%;
  animation: scan 8s linear infinite;
  z-index: 1;
}
@keyframes scan { from { bottom: 100%; } to { bottom: -100px; } }

.glitch-overlay {
  position: absolute; inset: 0;
  background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
  opacity: 0.1;
  pointer-events: none;
}

.auth-container { position: relative; z-index: 10; transition: filter 0.5s ease; width: 100%; max-width: 400px; padding: 20px; }
.auth-container.blurred { filter: blur(10px) brightness(0.5); pointer-events: none; }

.auth-card {
  background: rgba(10, 20, 40, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  text-align: center;
}

.auth-logo { margin-bottom: 30px; }
.logo-icon { font-size: 50px; display: block; margin-bottom: 10px; animation: float 4s ease-in-out infinite; }
.logo-text { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; color: var(--accent); letter-spacing: 4px; text-shadow: 0 0 15px var(--accent); }
.logo-sub { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 6px; margin-top: 5px; }

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.input-group { text-align: left; margin-bottom: 20px; }
.input-group label { display: block; font-size: 11px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
.input-group input {
  width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 6px; padding: 12px 15px; color: #fff; font-size: 14px; outline: none; transition: all 0.3s;
}
.input-group input:focus { border-color: var(--accent); box-shadow: 0 0 10px rgba(0,200,255,0.2); }

.captcha-container { margin-bottom: 25px; min-height: 65px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.captcha-loading { font-size: 11px; color: var(--text-dim); font-style: italic; }

.auth-btn {
  width: 100%; padding: 14px; background: var(--accent); color: #000; border: none; border-radius: 6px;
  font-family: 'Orbitron', sans-serif; font-weight: 800; cursor: pointer; transition: all 0.3s; letter-spacing: 1px;
}
.auth-btn:hover:not(:disabled) { background: #fff; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,200,255,0.4); }
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

.auth-footer { margin-top: 25px; font-size: 13px; color: var(--text-dim); }
.auth-footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
.auth-footer a:hover { text-decoration: underline; }

.intro-trigger {
  margin-top: 20px; background: none; border: 1px solid rgba(255,255,255,0.05); color: var(--text-dim);
  padding: 6px 15px; border-radius: 20px; font-size: 11px; cursor: pointer; transition: all 0.2s;
}
.intro-trigger:hover { border-color: var(--accent); color: var(--accent); }

.auth-error { margin-top: 20px; color: #ff3a7a; font-size: 12px; background: rgba(255,58,122,0.1); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,58,122,0.2); }

/* ── Terminal Modal ── */
.terminal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.terminal-window {
  width: 100%; max-width: 600px; background: #0a0c10; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; overflow: hidden; box-shadow: 0 30px 100px rgba(0,0,0,0.8);
}
.terminal-header {
  background: #1a1c24; padding: 10px 15px; display: flex; align-items: center; gap: 15px;
}
.terminal-controls { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ff5f56; } .dot.yellow { background: #ffbd2e; } .dot.green { background: #27c93f; }
.terminal-title { flex: 1; font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--text-dim); letter-spacing: 1px; }
.terminal-close { background: none; border: none; color: var(--text-dim); cursor: pointer; }

.terminal-body { padding: 30px; font-family: 'Exo 2', monospace; color: #00ffcc; font-size: 14px; line-height: 1.6; }
.prompt { color: #fff; font-weight: bold; margin-right: 8px; }
.highlight { color: #fff; text-shadow: 0 0 10px #00ffcc; font-weight: 800; }

.line { margin-bottom: 12px; opacity: 0; animation: fadeIn 0.1s forwards; }
.delay-1 { animation-delay: 0.5s; }
.delay-2 { animation-delay: 1.2s; }
.delay-3 { animation-delay: 2.0s; }
.delay-4 { animation-delay: 2.8s; }
.delay-5 { animation-delay: 3.5s; }
.delay-6 { animation-delay: 4.2s; }
.delay-7 { animation-delay: 5.5s; }

@keyframes fadeIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }

.blink-line { position: relative; }
.blink-line::after { content: '_'; animation: blink 1s step-end infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.terminal-btn {
  margin-top: 30px; background: rgba(0,255,204,0.1); border: 1px solid #00ffcc;
  color: #00ffcc; padding: 10px 20px; font-family: 'Orbitron', sans-serif; font-size: 11px;
  cursor: pointer; transition: all 0.3s; width: 100%;
}
.terminal-btn:hover { background: #00ffcc; color: #000; }

.abs-lang { position: absolute; top: 20px; right: 20px; z-index: 100; }

/* Transitions */
.terminal-fade-enter-active, .terminal-fade-leave-active { transition: all 0.4s ease; }
.terminal-fade-enter-from, .terminal-fade-leave-to { opacity: 0; transform: scale(0.9); }
</style>
