<template>
  <div class="fleet-tracker" v-if="fleets.length > 0">
    <div class="tracker-header">
      <span class="tracker-icon">📡</span>
      <span class="tracker-title">Flotta Radar</span>
      <span class="tracker-count">{{ fleets.length }} flotta</span>
    </div>

    <div class="tracker-map">
      <div v-for="fleet in fleets" :key="fleet.id" class="fleet-marker"
        :class="fleetClass(fleet)"
        :style="markerPosition(fleet)"
        @click="selectFleet(fleet)"
        :title="fleet.owner_name"
      >
        <span class="marker-dot"></span>
        <span class="marker-label">{{ fleet.owner_name }}</span>
      </div>
    </div>

    <div class="fleet-list">
      <div v-for="fleet in fleets" :key="fleet.id" class="fleet-item"
        :class="[fleetClass(fleet), { active: selectedFleet?.id === fleet.id }]"
        @click="selectFleet(fleet)"
      >
        <div class="fleet-item-header">
          <span class="fleet-dot" :class="fleetClass(fleet)"></span>
          <span class="fleet-owner">{{ fleet.owner_name }}</span>
          <span class="fleet-type-badge">{{ missionLabel(fleet.mission_type) }}</span>
          <span v-if="fleet.is_intercepted" class="intercepted-badge">ELFOGVA</span>
        </div>
        <div class="fleet-item-route">
          <span class="from">{{ fleet.origin_coords || '?' }}</span>
          <span class="arrow">→</span>
          <span class="to">{{ fleet.target_coords }}</span>
        </div>
        <div class="fleet-item-footer">
          <span class="fleet-timer">{{ formatTimeLeft(fleet.arrive_at) }}</span>
          <div class="fleet-ships-summary">
            <span v-for="s in fleet.ship_summary" :key="s.id" class="ship-mini">
              {{ s.icon || '🚀' }} {{ s.count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fleet Detail Popup -->
    <Transition name="fade">
      <div v-if="selectedFleet" class="fleet-detail-popup">
        <div class="popup-header">
          <span class="fleet-dot large" :class="fleetClass(selectedFleet)"></span>
          <div class="popup-title">
            <strong>{{ selectedFleet.owner_name }}</strong>
            <span class="popup-type">{{ missionLabel(selectedFleet.mission_type) }}</span>
          </div>
          <button class="close-btn" @click="selectedFleet = null">✕</button>
        </div>

        <div class="popup-route">
          <div class="route-from">
            <div class="label">Indulás</div>
            <div class="val">{{ selectedFleet.origin_coords || 'Ismeretlen' }}</div>
          </div>
          <div class="route-arrow">→</div>
          <div class="route-to">
            <div class="label">Célpont</div>
            <div class="val">{{ selectedFleet.target_coords }}</div>
          </div>
        </div>

        <div class="popup-ships">
          <div v-for="s in selectedFleet.ship_summary" :key="s.id" class="popup-ship">
            <span>{{ s.icon || '🚀' }} {{ s.name || s.id }}</span>
            <span class="ship-ct">×{{ s.count }}</span>
          </div>
        </div>

        <div class="popup-timer">
          <span class="label">Érkezés:</span>
          <span class="time">{{ formatTimeLeft(selectedFleet.arrive_at) }}</span>
        </div>

        <div v-if="selectedFleet.intercept_coords" class="popup-intercept">
          <span class="label">Elfogási pont:</span>
          <span class="val">{{ selectedFleet.intercept_coords }}</span>
        </div>

        <!-- Intercept button for enemy fleets -->
        <button v-if="!selectedFleet.is_own && !selectedFleet.is_allied && !selectedFleet.is_intercepted"
          class="btn-intercept"
          @click="$emit('intercept', selectedFleet)"
        >
          🎯 Elfogás
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  fleets: { type: Array, default: () => [] },
});

defineEmits(['intercept']);

const selectedFleet = ref(null);

function fleetClass(fleet) {
  if (fleet.is_own) return 'own';
  if (fleet.is_allied) return 'allied';
  return 'enemy';
}

function markerPosition(fleet) {
  // Position based on progress through the journey
  const now = Math.floor(Date.now() / 1000);
  const total = fleet.arrive_at - fleet.departed_at;
  const elapsed = now - fleet.departed_at;
  const progress = total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : 0;
  return {
    left: `${5 + progress * 90}%`,
    top: `${20 + (hashCode(fleet.id) % 60)}%`,
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectFleet(fleet) {
  selectedFleet.value = selectedFleet.value?.id === fleet.id ? null : fleet;
}

function missionLabel(type) {
  return { spy: 'Kém', attack: 'Támadás', harvest: 'Bányász', expedition: 'Expedíció', colonize: 'Gyarmat', intercept: 'Elfogás', unknown: '???' }[type] || type;
}

function formatTimeLeft(ts) {
  if (!ts) return '';
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'Megérkezett';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Auto-refresh timer display
let refreshTimer;
onMounted(() => { refreshTimer = setInterval(() => {}, 1000); });
onUnmounted(() => clearInterval(refreshTimer));
</script>

<style scoped>
.fleet-tracker { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }

.tracker-header { display: flex; align-items: center; gap: 8px; padding: 10px 15px; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.2); }
.tracker-icon { font-size: 16px; }
.tracker-title { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--text-bright); text-transform: uppercase; letter-spacing: 1px; }
.tracker-count { margin-left: auto; font-size: 10px; color: var(--text-dim); background: rgba(0,200,255,0.1); padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(0,200,255,0.2); }

/* Tracker Map (visual) */
.tracker-map { position: relative; height: 80px; background: rgba(0,0,0,0.3); border-bottom: 1px solid var(--border); overflow: hidden; }
.tracker-map::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,200,255,0.03) 0%, transparent 70%); }

.fleet-marker { position: absolute; cursor: pointer; transform: translate(-50%, -50%); z-index: 1; transition: all 0.3s ease; }
.fleet-marker:hover { z-index: 10; transform: translate(-50%, -50%) scale(1.2); }
.marker-dot { display: block; width: 8px; height: 8px; border-radius: 50%; animation: fleet-pulse 2s infinite; }
.fleet-marker.own .marker-dot { background: #4da6ff; box-shadow: 0 0 8px rgba(77,166,255,0.6); }
.fleet-marker.allied .marker-dot { background: #3aff7a; box-shadow: 0 0 8px rgba(58,255,122,0.6); }
.fleet-marker.enemy .marker-dot { background: #ff3a5c; box-shadow: 0 0 8px rgba(255,58,92,0.6); }
.marker-label { display: none; position: absolute; top: -18px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 8px; color: var(--text-dim); background: rgba(0,0,0,0.8); padding: 1px 4px; border-radius: 2px; }
.fleet-marker:hover .marker-label { display: block; }

@keyframes fleet-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Fleet List */
.fleet-list { max-height: 250px; overflow-y: auto; }
.fleet-item { padding: 8px 15px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.2s; }
.fleet-item:hover, .fleet-item.active { background: rgba(255,255,255,0.03); }

.fleet-item-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.fleet-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.fleet-dot.own { background: #4da6ff; }
.fleet-dot.allied { background: #3aff7a; }
.fleet-dot.enemy { background: #ff3a5c; }
.fleet-dot.large { width: 10px; height: 10px; }
.fleet-owner { font-size: 11px; color: var(--text-bright); font-weight: 600; }
.fleet-type-badge { margin-left: auto; font-size: 8px; padding: 1px 6px; border-radius: 8px; background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid rgba(0,200,255,0.2); text-transform: uppercase; }
.intercepted-badge { font-size: 8px; padding: 1px 6px; border-radius: 8px; background: rgba(255,58,92,0.15); color: #ff3a5c; border: 1px solid rgba(255,58,92,0.3); text-transform: uppercase; animation: flash-red 1.5s infinite; }
@keyframes flash-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.fleet-item-route { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-dim); margin-bottom: 4px; font-family: 'Orbitron', sans-serif; }
.arrow { color: var(--accent); }

.fleet-item-footer { display: flex; align-items: center; justify-content: space-between; }
.fleet-timer { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent); font-weight: 700; }
.fleet-ships-summary { display: flex; gap: 4px; }
.ship-mini { font-size: 9px; color: var(--text-dim); background: rgba(0,0,0,0.3); padding: 1px 4px; border-radius: 2px; }

/* Detail Popup */
.fleet-detail-popup { margin: 0 10px 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; padding: 12px; }
.popup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.popup-title { display: flex; flex-direction: column; font-size: 12px; }
.popup-type { font-size: 9px; color: var(--text-dim); text-transform: uppercase; }
.close-btn { margin-left: auto; background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 16px; }
.close-btn:hover { color: #fff; }

.popup-route { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; }
.route-arrow { color: var(--accent); font-size: 16px; }
.label { font-size: 8px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 2px; }
.val { font-size: 11px; color: var(--text-bright); font-family: 'Orbitron', sans-serif; }

.popup-ships { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.popup-ship { font-size: 10px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 3px 8px; border-radius: 3px; display: flex; gap: 6px; }
.ship-ct { color: var(--accent); font-family: 'Orbitron', sans-serif; }

.popup-timer { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.popup-timer .time { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); font-weight: 700; }

.popup-intercept { display: flex; align-items: center; gap: 8px; font-size: 10px; color: var(--text-dim); margin-bottom: 10px; }
.popup-intercept .val { color: var(--accent2); }

.btn-intercept { width: 100%; padding: 8px; background: rgba(255,58,92,0.1); border: 1px solid rgba(255,58,92,0.4); color: #ff3a5c; font-family: 'Orbitron', sans-serif; font-size: 11px; border-radius: 4px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; }
.btn-intercept:hover { background: rgba(255,58,92,0.2); border-color: #ff3a5c; transform: translateY(-1px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
