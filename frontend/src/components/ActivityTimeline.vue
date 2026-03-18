<template>
  <Transition name="timeline-slide">
    <div v-if="visible" class="timeline-overlay" @click.self="$emit('close')">
      <div class="timeline-panel panel">
        <div class="panel-header">
          <span class="panel-icon">📋</span>
          <h3>Aktivitás</h3>
          <span v-if="gameStore.unreadTimelineCount > 0" class="unread-badge">{{ gameStore.unreadTimelineCount }}</span>
          <div style="margin-left:auto;display:flex;gap:6px;">
            <button v-if="gameStore.unreadTimelineCount > 0" class="btn-primary" @click="markRead">Olvasottnak jelöl</button>
            <button class="btn-primary close-btn" @click="$emit('close')">✕</button>
          </div>
        </div>

        <div class="timeline-body">
          <div v-if="loading" class="empty-msg">Betöltés...</div>
          <div v-else-if="!gameStore.activityTimeline.length" class="empty-msg">Nincs új esemény</div>
          <div
            v-for="event in gameStore.activityTimeline"
            :key="event.id"
            class="timeline-event"
            :class="[eventColorClass(event.event_type), { unread: event.created_at > gameStore.lastTimelineRead }]"
          >
            <div class="event-icon">{{ event.icon }}</div>
            <div class="event-content">
              <div class="event-title">
                {{ event.title }}
                <span v-if="event.created_at > gameStore.lastTimelineRead" class="new-badge">ÚJ</span>
              </div>
              <div v-if="event.detail" class="event-detail">{{ event.detail }}</div>
              <div class="event-time">{{ timeAgo(event.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game.js';

defineProps({ visible: Boolean });
defineEmits(['close']);

const gameStore = useGameStore();
const loading = ref(false);

let pollTimer = null;

async function loadData() {
  loading.value = true;
  await gameStore.loadTimeline(50);
  loading.value = false;
}

async function markRead() {
  await gameStore.markTimelineRead();
}

function eventColorClass(type) {
  if (['fleet_attacked', 'battle_won', 'battle_lost', 'fleet_intercepted'].includes(type)) return 'event-combat';
  if (['building_complete', 'research_complete'].includes(type)) return 'event-build';
  if (['fleet_arrived', 'phalanx_detected'].includes(type)) return 'event-fleet';
  if (['market_trade'].includes(type)) return 'event-market';
  if (['colony_established'].includes(type)) return 'event-build';
  return 'event-default';
}

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return 'most';
  if (diff < 3600) return `${Math.floor(diff / 60)} perc ezelőtt`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} órája`;
  return `${Math.floor(diff / 86400)} napja`;
}

onMounted(() => {
  loadData();
  pollTimer = setInterval(loadData, 30000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.timeline-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: flex-end;
}

.timeline-panel {
  width: 360px;
  max-width: 90vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  border-left: 1px solid var(--border-glow);
  box-shadow: -4px 0 30px rgba(0,200,255,0.1);
}

.timeline-panel .panel-header {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-badge {
  background: var(--accent2);
  color: white;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 10px;
  font-family: 'Orbitron', sans-serif;
}

.close-btn {
  border-color: var(--text-dim) !important;
  color: var(--text-dim) !important;
  padding: 2px 8px !important;
}
.close-btn:hover {
  border-color: var(--accent2) !important;
  color: var(--accent2) !important;
}

.timeline-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.empty-msg {
  padding: 30px;
  text-align: center;
  color: var(--text-dim);
  font-size: 12px;
}

.timeline-event {
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(26,42,74,0.4);
  transition: background 0.15s;
  border-left: 3px solid transparent;
}
.timeline-event:hover {
  background: rgba(255,255,255,0.02);
}
.timeline-event.unread {
  background: rgba(0,200,255,0.04);
}

/* Color coding by event type */
.event-combat  { border-left-color: var(--accent2); }
.event-build   { border-left-color: var(--accent3); }
.event-fleet   { border-left-color: var(--accent); }
.event-market  { border-left-color: var(--accent4); }
.event-default { border-left-color: var(--text-dim); }

.event-icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 12px;
  color: var(--text-bright);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.new-badge {
  background: var(--accent2);
  color: white;
  font-size: 8px;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
  animation: glow-pulse 2s ease-in-out infinite;
}

.event-detail {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 9px;
  color: var(--text-dim);
  font-family: 'Orbitron', sans-serif;
  margin-top: 3px;
}

/* Slide animation */
.timeline-slide-enter-active,
.timeline-slide-leave-active {
  transition: all 0.3s ease;
}
.timeline-slide-enter-active .timeline-panel,
.timeline-slide-leave-active .timeline-panel {
  transition: transform 0.3s ease;
}
.timeline-slide-enter-from,
.timeline-slide-leave-to {
  opacity: 0;
}
.timeline-slide-enter-from .timeline-panel,
.timeline-slide-leave-to .timeline-panel {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .timeline-panel {
    width: 100vw;
    max-width: 100vw;
  }
}
</style>
