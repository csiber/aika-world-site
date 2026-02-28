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
        <button class="ver-badge" @click="showChangelog = true" title="Changelog">v{{ APP_VERSION }}</button>
      </div>

      <div class="resource-bar">
        <ResourceItem icon="⚙️" :label="L.t('res.metal')"   :value="resources.metal"   :rate="rates.metal"   color="var(--metal)"   :maxVal="gameStore.storage.metal" />
        <ResourceItem icon="💎" :label="L.t('res.crystal')" :value="resources.crystal" :rate="rates.crystal" color="var(--crystal)" :maxVal="gameStore.storage.crystal" />
        <ResourceItem icon="⚡" :label="L.t('res.energy')"  :value="resources.energy"  :rate="rates.energy"  color="var(--energy)" />
        <ResourceItem icon="🔮" :label="L.t('res.deus')"    :value="resources.deus"    :rate="rates.deus"    color="var(--accent)"  :maxVal="gameStore.storage.deus" />
      </div>

      <div class="user-area">
        <LangSwitch />
        <div class="user-info" @click="activeTab = 'profile'" style="cursor:pointer" :title="L.t('nav.profile')">
          <div class="user-name">{{ auth.username }}</div>
          <div class="user-pts">{{ score.toLocaleString('hu') }} pt</div>
        </div>
        <div v-if="allianceStore.inAlliance" class="alliance-badge" @click="activeTab = 'alliance'" title="Szövetség">
          [{{ allianceStore.alliance?.tag }}]
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

    <!-- ── ENERGY WARNING ── -->
    <Transition name="slide-down">
      <div v-if="gameStore.energyWarning" class="energy-banner" :class="gameStore.energyWarning.level">
        {{ gameStore.energyWarning.level === 'critical'
          ? L.t('game.energyCritical', { eff: gameStore.energyWarning.eff, reduction: 100 - gameStore.energyWarning.eff })
          : L.t('game.energyWarning',  { eff: gameStore.energyWarning.eff }) }}
      </div>
    </Transition>

    <!-- ── PLANET BAR ── -->
    <div class="planet-bar">
      <div
        v-for="(planet, idx) in planets"
        :key="idx"
        class="planet-slot"
        :class="{ active: activePlanet === idx }"
        @click="activePlanet = idx"
      >
        <span class="planet-emoji">{{ planet.emoji || '🌍' }}</span>
        <span class="planet-name">{{ planet.name }}</span>
        <span class="planet-coords">{{ planet.coords }}</span>
      </div>
      <div class="planet-slot add-planet" @click="activeTab = 'galaxy'" :title="L.t('game.addPlanet')">+</div>
    </div>

    <!-- ── VIEWS ── -->
    <main class="main-content">
      <OverviewView  v-if="activeTab === 'overview'"  :activePlanetIdx="activePlanet" />
      <BuildingsView v-if="activeTab === 'buildings'" />
      <ResearchView  v-if="activeTab === 'research'"  />
      <FleetView     v-if="activeTab === 'fleet'"     />
      <GalaxyView    v-if="activeTab === 'galaxy'"    />
      <AllianceView  v-if="activeTab === 'alliance'"  />
      <RankingsView  v-if="activeTab === 'rankings'"  />
      <MessagesView  v-if="activeTab === 'messages'"  />
      <ProfileView   v-if="activeTab === 'profile'"   />
      <GuideView     v-if="activeTab === 'guide'"     />
    </main>

    <BotPanel />
  </div>

  <div v-else-if="gameStore.loading" class="loading-screen">
    <div class="loading-icon">🌌</div>
    <div class="loading-text">{{ L.t('game.loading') }}</div>
  </div>

  <div v-else class="loading-screen">
    <div class="loading-icon">⚠️</div>
    <div class="loading-text">{{ gameStore.error || L.t('game.error') }}</div>
    <button class="auth-btn" style="margin-top:20px;width:200px;" @click="gameStore.loadState()">{{ L.t('game.retry') }}</button>
  </div>

  <ChangelogModal v-if="showChangelog" @close="showChangelog = false" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore }     from '@/stores/auth.js';
import { useGameStore }     from '@/stores/game.js';
import { useMessagesStore } from '@/stores/messages.js';
import { useAllianceStore } from '@/stores/alliance.js';
import ResourceItem  from '@/components/ResourceItem.vue';
import OverviewView  from '@/components/views/OverviewView.vue';
import BuildingsView from '@/components/views/BuildingsView.vue';
import ResearchView  from '@/components/views/ResearchView.vue';
import FleetView     from '@/components/views/FleetView.vue';
import GalaxyView    from '@/components/views/GalaxyView.vue';
import AllianceView  from '@/components/views/AllianceView.vue';
import RankingsView  from '@/components/views/RankingsView.vue';
import MessagesView  from '@/components/views/MessagesView.vue';
import ProfileView   from '@/components/views/ProfileView.vue';
import GuideView      from '@/components/views/GuideView.vue';
import BotPanel       from '@/components/BotPanel.vue';
import LangSwitch     from '@/components/LangSwitch.vue';
import ChangelogModal from '@/components/ChangelogModal.vue';
import { useLangStore }  from '@/stores/lang.js';
import { APP_VERSION }   from '@/data/changelog.js';

const router        = useRouter();
const auth          = useAuthStore();
const gameStore     = useGameStore();
const msgStore      = useMessagesStore();
const allianceStore = useAllianceStore();
const L             = useLangStore();

const activeTab      = ref('overview');
const activePlanet   = ref(0);
const showChangelog  = ref(false);

const resources = computed(() => gameStore.resources);
const rates     = computed(() => gameStore.rates);
const planets   = computed(() => gameStore.planets);
const score     = computed(() => gameStore.score);

const tabs = computed(() => [
  { id: 'overview',  label: L.t('nav.overview')  },
  { id: 'buildings', label: L.t('nav.buildings') },
  { id: 'research',  label: L.t('nav.research')  },
  { id: 'fleet',     label: L.t('nav.fleet')     },
  { id: 'galaxy',    label: L.t('nav.galaxy')    },
  { id: 'alliance',  label: L.t('nav.alliance')  },
  { id: 'messages',  label: L.t('nav.messages')  },
  { id: 'rankings',  label: L.t('nav.rankings')  },
  { id: 'profile',   label: L.t('nav.profile')   },
  { id: 'guide',     label: L.t('nav.guide')     },
]);

function onLogout() {
  auth.logout();
  router.push('/login');
}

let tickTimer, syncTimer;

onMounted(async () => {
  await gameStore.loadState();
  await msgStore.loadMessages();
  await allianceStore.load();
  await gameStore.syncResources(); // Force initial sync
  tickTimer = setInterval(() => gameStore.tickResources(), 1000);
  syncTimer = setInterval(() => gameStore.syncResources(), 60000);
});

onUnmounted(() => {
  clearInterval(tickTimer);
  clearInterval(syncTimer);
  const bot = useBotStore();
  if (bot.active) bot.stop();
});
</script>

<style scoped>
.game-shell { display: flex; flex-direction: column; min-height: 100vh; position: relative; z-index: 1; }

.topbar { position: sticky; top: 0; z-index: 100; background: linear-gradient(180deg, #04091a 0%, #040813 100%); border-bottom: 1px solid var(--border); display: flex; align-items: center; height: 48px; box-shadow: 0 2px 20px rgba(0,0,0,0.6); }

.logo-area { display: flex; align-items: center; gap: 8px; padding: 0 14px; border-right: 1px solid var(--border); height: 100%; min-width: 140px; }
.ver-badge { font-family: 'Orbitron', sans-serif; font-size: 8px; color: var(--text-dim); background: none; border: 1px solid var(--border); border-radius: 3px; padding: 1px 5px; cursor: pointer; transition: all 0.2s; letter-spacing: 1px; margin-left: 4px; }
.ver-badge:hover { color: var(--accent); border-color: var(--accent); }
.logo-icon  { font-size: 22px; }
.logo-title { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 900; color: var(--accent); letter-spacing: 2px; text-shadow: 0 0 12px var(--accent); }
.logo-sub   { font-size: 8px; color: var(--text-dim); letter-spacing: 3px; font-family: 'Orbitron', sans-serif; }

.resource-bar { display: flex; align-items: center; flex: 1; height: 100%; padding: 0 8px; }

.user-area { display: flex; align-items: center; gap: 8px; padding: 0 14px; border-left: 1px solid var(--border); height: 100%; }
.user-info  { text-align: right; }
.user-name  { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent4); }
.user-pts   { font-size: 9px; color: var(--accent3); }
.user-info:hover .user-name { color: var(--accent); }

.alliance-badge { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2); padding: 2px 6px; border-radius: 3px; cursor: pointer; transition: all 0.2s; }
.alliance-badge:hover { background: rgba(255,215,0,0.15); border-color: var(--accent4); }

.logout-btn { background: none; border: 1px solid rgba(255,58,122,0.3); color: var(--accent2); width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.logout-btn:hover { background: rgba(255,58,122,0.1); border-color: var(--accent2); }

.nav { background: #050c1c; border-bottom: 1px solid var(--border); display: flex; align-items: center; height: 36px; padding: 0 4px; position: sticky; top: 48px; z-index: 99; gap: 2px; overflow-x: auto; }
.nav-btn { padding: 0 12px; height: 28px; background: none; border: 1px solid transparent; color: var(--text-dim); font-family: 'Exo 2', sans-serif; font-size: 12px; cursor: pointer; border-radius: 3px; transition: all 0.2s; display: flex; align-items: center; white-space: nowrap; }
.nav-btn:hover  { color: var(--text); border-color: var(--border); background: rgba(255,255,255,0.03); }
.nav-btn.active { color: var(--accent); border-color: var(--border-glow); background: rgba(0,200,255,0.08); box-shadow: inset 0 0 12px rgba(0,200,255,0.1); }

.planet-bar { background: #040a18; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 6px; padding: 6px 12px; overflow-x: auto; position: sticky; top: 84px; z-index: 98; }
.planet-slot { display: flex; flex-direction: column; align-items: center; padding: 4px 10px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; min-width: 80px; transition: all 0.2s; background: var(--bg-panel); }
.planet-slot:hover  { border-color: var(--border-glow); background: rgba(0,200,255,0.05); }
.planet-slot.active { border-color: var(--accent); background: rgba(0,200,255,0.1); box-shadow: 0 0 10px rgba(0,200,255,0.15); }
.planet-emoji  { font-size: 20px; }
.planet-name   { font-size: 9px; color: var(--text-dim); margin-top: 2px; }
.planet-coords { font-size: 8px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.add-planet { border-style: dashed; opacity: 0.5; font-size: 20px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); min-width: 50px; height: 52px; }
.add-planet:hover { opacity: 0.8; }

.main-content { flex: 1; padding: 10px; position: relative; z-index: 1; }

.loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative; z-index: 1; }
.loading-icon { font-size: 64px; animation: pulse 2s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(0,200,255,0.5)); }
.loading-text { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); letter-spacing: 2px; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }

.energy-banner { padding: 5px 14px; font-size: 11px; text-align: center; font-family: 'Exo 2', sans-serif; }
.energy-banner.warning  { background: rgba(255,165,0,0.15); border-bottom: 1px solid rgba(255,165,0,0.3); color: #ffaa00; }
.energy-banner.critical { background: rgba(255,58,122,0.15); border-bottom: 1px solid rgba(255,58,122,0.3); color: var(--accent2); animation: pulse 1.5s ease-in-out infinite; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .topbar { height: auto; min-height: 48px; flex-wrap: wrap; padding: 4px 0; }
  .logo-area { min-width: auto; padding: 0 10px; border: none; height: 40px; }
  .logo-title { font-size: 11px; }
  .logo-icon { font-size: 18px; }
  .logo-sub { display: none; }
  
  .resource-bar { order: 3; width: 100%; border-top: 1px solid var(--border); padding: 4px 8px; justify-content: space-around; }
  .user-area { padding: 0 10px; border: none; height: 40px; margin-left: auto; }
  .user-name { font-size: 10px; }
  .user-pts { display: none; }
  
  .nav { top: 88px; height: 32px; }
  .planet-bar { top: 120px; padding: 4px 8px; }
  .planet-slot { min-width: 70px; padding: 2px 6px; }
  .planet-emoji { font-size: 16px; }
}
</style>
