<template>
  <div class="game-shell" v-if="!gameStore.loading && gameStore.state">

    <!-- ── TOPBAR ── -->
    <header class="topbar">
      <div class="logo-area">
        <span class="logo-icon">🌌</span>
        <div>
          <div class="logo-title">AIKA</div>
          <div class="logo-sub">WORLD</div>
        </div>
      </div>

      <div class="resource-bar">
        <ResourceItem icon="⚙️" label="Fém"     :value="resources.metal"   :rate="rates.metal"   color="var(--metal)" />
        <ResourceItem icon="💎" label="Kristály" :value="resources.crystal" :rate="rates.crystal" color="var(--crystal)" />
        <ResourceItem icon="⚡" label="Energia"  :value="resources.energy"  :rate="rates.energy"  color="var(--energy)" />
        <ResourceItem icon="🔮" label="Déusium"  :value="resources.deus"    :rate="rates.deus"    color="var(--accent)" />
      </div>

      <div class="user-area">
        <div class="user-info">
          <div class="user-name">{{ auth.username }}</div>
          <div class="user-pts">Pontszám: {{ score.toLocaleString('hu') }}</div>
        </div>
        <button class="logout-btn" @click="onLogout" title="Kilépés">⏻</button>
      </div>
    </header>

    <!-- ── NAV ── -->
    <nav class="nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.id === 'messages' && msgStore.unreadCount > 0" class="badge badge-red" style="margin-left:4px;">{{ msgStore.unreadCount }}</span>
      </button>
    </nav>

    <!-- ── PLANET BAR ── -->
    <div class="planet-bar">
      <div
        v-for="(planet, idx) in planets"
        :key="idx"
        class="planet-slot"
        :class="{ active: activePlanet === idx }"
        @click="activePlanet = idx"
      >
        <span class="planet-emoji">{{ planet.emoji }}</span>
        <span class="planet-name">{{ planet.name }}</span>
        <span class="planet-coords">{{ planet.coords }}</span>
      </div>
      <div class="planet-slot add-planet" @click="gameStore.notify('Gyarmatosító hajót kell küldeni!', 'blue')">+</div>
    </div>

    <!-- ── VIEWS ── -->
    <main class="main-content">
      <OverviewView  v-if="activeTab === 'overview'"  />
      <BuildingsView v-if="activeTab === 'buildings'" />
      <ResearchView  v-if="activeTab === 'research'"  />
      <FleetView     v-if="activeTab === 'fleet'"     />
      <GalaxyView    v-if="activeTab === 'galaxy'"    />
      <RankingsView  v-if="activeTab === 'rankings'"  />
      <MessagesView  v-if="activeTab === 'messages'"  />
    </main>
  </div>

  <!-- Loading state -->
  <div v-else-if="gameStore.loading" class="loading-screen">
    <div class="loading-icon">🌌</div>
    <div class="loading-text">Galaxis betöltése...</div>
  </div>

  <!-- Error state -->
  <div v-else class="loading-screen">
    <div class="loading-icon">⚠️</div>
    <div class="loading-text">{{ gameStore.error || 'Hiba történt' }}</div>
    <button class="auth-btn" style="margin-top:20px;width:200px;" @click="gameStore.loadState()">Újrapróbálás</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useGameStore } from '@/stores/game.js';
import { useMessagesStore } from '@/stores/messages.js';
import ResourceItem  from '@/components/ResourceItem.vue';
import OverviewView  from '@/components/views/OverviewView.vue';
import BuildingsView from '@/components/views/BuildingsView.vue';
import ResearchView  from '@/components/views/ResearchView.vue';
import FleetView     from '@/components/views/FleetView.vue';
import GalaxyView    from '@/components/views/GalaxyView.vue';
import RankingsView  from '@/components/views/RankingsView.vue';
import MessagesView  from '@/components/views/MessagesView.vue';

const router    = useRouter();
const auth      = useAuthStore();
const gameStore = useGameStore();
const msgStore  = useMessagesStore();

const activeTab    = ref('overview');
const activePlanet = ref(0);

const resources = computed(() => gameStore.resources);
const rates     = computed(() => gameStore.rates);
const planets   = computed(() => gameStore.planets);
const score     = computed(() => gameStore.score);

const tabs = [
  { id: 'overview',  label: '🌐 Áttekintés' },
  { id: 'buildings', label: '🏗️ Épületek' },
  { id: 'research',  label: '🔬 Kutatás' },
  { id: 'fleet',     label: '🚀 Flotta' },
  { id: 'galaxy',    label: '🌌 Galaxis' },
  { id: 'messages',  label: '✉️ Üzenetek' },
  { id: 'rankings',  label: '🏆 Rangsor' },
];

function onLogout() {
  auth.logout();
  router.push('/login');
}

// Timers
let tickTimer, syncTimer;

onMounted(async () => {
  await gameStore.loadState();
  await msgStore.loadMessages();
  // Client-side resource interpolation every second
  tickTimer = setInterval(() => gameStore.tickResources(), 1000);
  // Server sync every 60s
  syncTimer = setInterval(() => gameStore.syncResources(), 60000);
});

onUnmounted(() => {
  clearInterval(tickTimer);
  clearInterval(syncTimer);
});
</script>

<style scoped>
.game-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* ── TOPBAR ── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, #04091a 0%, #040813 100%);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  height: 48px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.6);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-right: 1px solid var(--border);
  height: 100%;
  min-width: 140px;
}
.logo-icon { font-size: 22px; }
.logo-title { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 900; color: var(--accent); letter-spacing: 2px; text-shadow: 0 0 12px var(--accent); }
.logo-sub { font-size: 8px; color: var(--text-dim); letter-spacing: 3px; font-family: 'Orbitron', sans-serif; }

.resource-bar { display: flex; align-items: center; flex: 1; height: 100%; padding: 0 8px; }

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-left: 1px solid var(--border);
  height: 100%;
}
.user-info { text-align: right; }
.user-name { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent4); }
.user-pts  { font-size: 9px; color: var(--accent3); }

.logout-btn {
  background: none;
  border: 1px solid rgba(255,58,122,0.3);
  color: var(--accent2);
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.logout-btn:hover { background: rgba(255,58,122,0.1); border-color: var(--accent2); }

/* ── NAV ── */
.nav {
  background: #050c1c;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 4px;
  position: sticky;
  top: 48px;
  z-index: 99;
  gap: 2px;
}
.nav-btn {
  padding: 0 14px;
  height: 28px;
  background: none;
  border: 1px solid transparent;
  color: var(--text-dim);
  font-family: 'Exo 2', sans-serif;
  font-size: 12px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.nav-btn:hover { color: var(--text); border-color: var(--border); background: rgba(255,255,255,0.03); }
.nav-btn.active { color: var(--accent); border-color: var(--border-glow); background: rgba(0,200,255,0.08); box-shadow: inset 0 0 12px rgba(0,200,255,0.1); }

/* ── PLANET BAR ── */
.planet-bar {
  background: #040a18;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  overflow-x: auto;
  position: sticky;
  top: 84px;
  z-index: 98;
}
.planet-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  min-width: 80px;
  transition: all 0.2s;
  background: var(--bg-panel);
}
.planet-slot:hover { border-color: var(--border-glow); background: rgba(0,200,255,0.05); }
.planet-slot.active { border-color: var(--accent); background: rgba(0,200,255,0.1); box-shadow: 0 0 10px rgba(0,200,255,0.15); }
.planet-emoji { font-size: 20px; }
.planet-name  { font-size: 9px; color: var(--text-dim); margin-top: 2px; }
.planet-coords { font-size: 8px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.add-planet { border-style: dashed; opacity: 0.5; font-size: 20px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); min-width: 50px; height: 52px; }
.add-planet:hover { opacity: 0.8; }

/* ── MAIN ── */
.main-content {
  flex: 1;
  padding: 10px;
  position: relative;
  z-index: 1;
}

/* ── LOADING ── */
.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.loading-icon { font-size: 64px; animation: pulse 2s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(0,200,255,0.5)); }
.loading-text { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); letter-spacing: 2px; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
</style>
