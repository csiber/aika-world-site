<template>
  <div class="expedition-overlay" @click.self.prevent>
    <div class="expedition-modal">
      <!-- Animated background particles -->
      <div class="particle-bg" aria-hidden="true">
        <span v-for="n in 12" :key="n" class="particle" :style="particleStyle(n)"></span>
      </div>

      <div class="modal-inner">
        <!-- Header -->
        <div class="modal-header">
          <span class="modal-icon">🌌</span>
          <h2 class="modal-title">{{ L.t('expeditions.title') || 'Expedition Report' }}</h2>
          <div class="timer-wrap">
            <span class="timer-label">{{ L.t('expeditions.timeout') || 'Time remaining' }}</span>
            <span class="timer-value" :class="{ urgent: timeLeft < 300 }">{{ formatTimer(timeLeft) }}</span>
          </div>
        </div>

        <!-- Narrative -->
        <div class="narrative">
          <p>{{ eventNarrative }}</p>
        </div>

        <!-- Choice prompt -->
        <div class="choose-label">{{ L.t('expeditions.chooseAction') || 'Choose your action' }}</div>

        <!-- Choice buttons -->
        <div class="choices-grid">
          <button
            v-for="c in choices"
            :key="c.id"
            class="choice-btn"
            :class="[c.risk, { selected: chosen === c.id, disabled: submitting }]"
            :disabled="submitting"
            @click="submit(c.id)"
          >
            <span class="choice-icon">{{ c.icon }}</span>
            <span class="choice-name">{{ L.t('expeditions.' + c.id) || c.label }}</span>
            <span class="choice-desc">{{ c.desc }}</span>
            <span class="choice-risk-badge" :class="c.risk">
              {{ c.risk === 'safe' ? (L.t('expeditions.safe') || 'Safe') : (L.t('expeditions.risk') || 'Risk') }}
            </span>
          </button>
        </div>

        <!-- Loading indicator -->
        <div v-if="submitting" class="submitting-msg">
          <span class="spinner"></span> Transmitting order...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';

const props = defineProps({
  mission: { type: Object, required: true },
});

const emit = defineEmits(['chosen']);

const L = useLangStore();

const submitting = ref(false);
const chosen = ref(null);
const timeLeft = ref(3600);

// ── Parse event info from mission.result ──────────────────────────────────────
const eventInfo = computed(() => {
  try {
    const r = JSON.parse(props.mission.result || '{}');
    return r;
  } catch {
    return {};
  }
});

const eventType = computed(() => eventInfo.value.event || '');

// ── Narrative text lookup ─────────────────────────────────────────────────────
const eventNarrative = computed(() => {
  const key = eventType.value;
  if (key) {
    const txt = L.t('expeditions.' + key);
    if (txt && txt !== 'expeditions.' + key) return txt;
  }
  return L.t('expeditions.expedition_empty') || 'Your fleet found nothing in the void of space.';
});

// ── Build choice list from event info or sensible defaults per event type ─────
const CHOICE_MAP = {
  alien:       [
    { id: 'attack',     label: 'Attack',     desc: 'Engage the alien patrol',     risk: 'risky', icon: '⚔️' },
    { id: 'avoid',      label: 'Avoid',      desc: 'Retreat before contact',      risk: 'safe',  icon: '🛡️' },
  ],
  blackhole:   [
    { id: 'enter',      label: 'Enter',      desc: 'Navigate into the singularity', risk: 'risky', icon: '🌀' },
    { id: 'avoid',      label: 'Avoid',      desc: 'Pull back to safe distance',    risk: 'safe',  icon: '🛡️' },
  ],
  caravan:     [
    { id: 'trade',      label: 'Trade',      desc: 'Exchange goods with the nomads', risk: 'safe',  icon: '⚖️' },
    { id: 'ignore',     label: 'Ignore',     desc: 'Continue on your route',        risk: 'safe',  icon: '➡️' },
  ],
  distress:    [
    { id: 'rescue',     label: 'Rescue',     desc: 'Help the stranded travelers',  risk: 'risky', icon: '🆘' },
    { id: 'ignore',     label: 'Ignore',     desc: 'Maintain your course',         risk: 'safe',  icon: '➡️' },
  ],
  wormhole:    [
    { id: 'enter',      label: 'Enter',      desc: 'Venture through the wormhole', risk: 'risky', icon: '🌀' },
    { id: 'avoid',      label: 'Avoid',      desc: 'Steer clear of the anomaly',   risk: 'safe',  icon: '🛡️' },
  ],
  chain_ancient_2: [
    { id: 'investigate', label: 'Investigate', desc: 'Explore the sealed chamber',  risk: 'risky', icon: '🔦' },
    { id: 'avoid',       label: 'Leave',       desc: 'Seal the entrance and go back', risk: 'safe', icon: '🚪' },
  ],
};

const choices = computed(() => {
  // Backend may supply choices directly
  if (Array.isArray(eventInfo.value.choices) && eventInfo.value.choices.length) {
    return eventInfo.value.choices.map(c => ({
      id:    c.id   || c.key,
      label: c.label || c.id,
      desc:  c.desc  || '',
      risk:  c.risk  || 'safe',
      icon:  c.icon  || '✦',
    }));
  }
  // Fallback by event type
  const key = eventType.value;
  return CHOICE_MAP[key] || [
    { id: 'investigate', label: 'Investigate', desc: 'Examine the anomaly', risk: 'risky', icon: '🔍' },
    { id: 'avoid',       label: 'Avoid',       desc: 'Play it safe',        risk: 'safe',  icon: '🛡️' },
  ];
});

// ── Timer ─────────────────────────────────────────────────────────────────────
let timerHandle = null;

function startTimer() {
  // If mission has a deadline, compute from it; otherwise default 1 h
  const now = Math.floor(Date.now() / 1000);
  if (props.mission.choice_deadline) {
    timeLeft.value = Math.max(0, props.mission.choice_deadline - now);
  } else if (props.mission.arrive_at) {
    // 1 h window starting from arrive_at
    timeLeft.value = Math.max(0, props.mission.arrive_at + 3600 - now);
  }
  timerHandle = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--;
  }, 1000);
}

function formatTimer(s) {
  if (s <= 0) return '00:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ── Submit choice ─────────────────────────────────────────────────────────────
async function submit(choiceId) {
  if (submitting.value) return;
  submitting.value = true;
  chosen.value = choiceId;
  try {
    const result = await api.submitExpeditionChoice(props.mission.id, choiceId);
    emit('chosen', result);
  } catch (e) {
    // Reset so user can retry
    submitting.value = false;
    chosen.value = null;
  }
}

// ── Particle styling (decorative) ────────────────────────────────────────────
function particleStyle(n) {
  const size = 2 + (n % 4);
  const x = (n * 73) % 100;
  const y = (n * 47) % 100;
  const delay = (n * 0.4).toFixed(1);
  const dur = (3 + n % 4).toFixed(1);
  return {
    width:  size + 'px',
    height: size + 'px',
    left:   x + '%',
    top:    y + '%',
    animationDelay: delay + 's',
    animationDuration: dur + 's',
  };
}

onMounted(startTimer);
onUnmounted(() => clearInterval(timerHandle));
</script>

<style scoped>
/* ── Overlay ── */
.expedition-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* ── Modal ── */
.expedition-modal {
  position: relative;
  background: linear-gradient(145deg, #0a0a1a 0%, #0d1127 60%, #0a0a1a 100%);
  border: 1px solid rgba(0, 200, 255, 0.35);
  border-radius: 10px;
  width: min(640px, 95vw);
  max-height: 90vh;
  overflow: hidden;
  box-shadow:
    0 0 40px rgba(0, 200, 255, 0.12),
    0 0 80px rgba(255, 58, 122, 0.06),
    inset 0 0 60px rgba(0, 0, 0, 0.4);
}

/* ── Particle background ── */
.particle-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(0, 200, 255, 0.6);
  animation: float-particle linear infinite;
  opacity: 0;
}
@keyframes float-particle {
  0%   { opacity: 0; transform: translateY(0) scale(1); }
  20%  { opacity: 0.7; }
  80%  { opacity: 0.4; }
  100% { opacity: 0; transform: translateY(-40px) scale(0.5); }
}

/* ── Inner content ── */
.modal-inner {
  position: relative;
  z-index: 1;
  padding: 28px 28px 24px;
}

/* ── Header ── */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.15);
}
.modal-icon {
  font-size: 26px;
  line-height: 1;
  filter: drop-shadow(0 0 8px rgba(0, 200, 255, 0.6));
}
.modal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #00c8ff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
  flex: 1;
}
.timer-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}
.timer-label {
  font-size: 8px;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
}
.timer-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #00c8ff;
  letter-spacing: 1px;
  transition: color 0.3s;
}
.timer-value.urgent {
  color: #ff3a7a;
  animation: timer-pulse 1s ease-in-out infinite;
}
@keyframes timer-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* ── Narrative ── */
.narrative {
  background: rgba(0, 200, 255, 0.04);
  border-left: 3px solid rgba(0, 200, 255, 0.4);
  border-radius: 0 6px 6px 0;
  padding: 14px 16px;
  margin-bottom: 20px;
}
.narrative p {
  font-family: 'Exo 2', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.65;
  margin: 0;
}

/* ── Choose label ── */
.choose-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

/* ── Choices grid ── */
.choices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.choice-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 14px 14px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: inherit;
}
.choice-btn:hover:not(.disabled) {
  border-color: rgba(0, 200, 255, 0.6);
  background: rgba(0, 200, 255, 0.07);
  box-shadow: 0 0 16px rgba(0, 200, 255, 0.15);
  transform: translateY(-2px);
}
.choice-btn.risky:hover:not(.disabled) {
  border-color: rgba(255, 58, 122, 0.6);
  background: rgba(255, 58, 122, 0.07);
  box-shadow: 0 0 16px rgba(255, 58, 122, 0.15);
}
.choice-btn.selected {
  border-color: #00c8ff;
  background: rgba(0, 200, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.2);
}
.choice-btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.choice-icon {
  font-size: 28px;
  line-height: 1;
}
.choice-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.choice-desc {
  font-family: 'Exo 2', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  line-height: 1.4;
}
.choice-risk-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 8px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
}
.choice-risk-badge.safe {
  background: rgba(58, 255, 122, 0.12);
  color: #3aff7a;
  border: 1px solid rgba(58, 255, 122, 0.3);
}
.choice-risk-badge.risky {
  background: rgba(255, 58, 122, 0.12);
  color: #ff3a7a;
  border: 1px solid rgba(255, 58, 122, 0.3);
}

/* ── Submitting ── */
.submitting-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  color: rgba(0, 200, 255, 0.7);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding-top: 4px;
}
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 200, 255, 0.3);
  border-top-color: #00c8ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .modal-inner { padding: 18px 16px 16px; }
  .choices-grid { grid-template-columns: 1fr; }
  .modal-title { font-size: 12px; }
}
</style>
