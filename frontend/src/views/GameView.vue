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
        <ControlSwitch />
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
        v-for="planet in planets"
        :key="planet.id"
        class="planet-slot"
        :class="{ active: gameStore.activePlanet.id === planet.id }"
        @click="gameStore.switchPlanet(planet.id)"
      >
        <span class="planet-emoji">{{ planet.emoji || '🌍' }}</span>
        <span class="planet-name">{{ planet.name }}</span>
        <span class="planet-coords">{{ planet.coords }}</span>
      </div>
      <div class="planet-slot add-planet" @click="activeTab = 'galaxy'" :title="L.t('game.addPlanet')">+</div>
    </div>

    <!-- ── VIEWS ── -->
    <main class="main-content">
      <OverviewView  v-if="activeTab === 'overview'" />
      <BuildingsView v-if="activeTab === 'buildings'" />
      <ResearchView  v-if="activeTab === 'research'"  />
      <FleetView     v-if="activeTab === 'fleet'"     />
      <DefenseView   v-if="activeTab === 'defense'"   />
      <GalaxyView    v-if="activeTab === 'galaxy'"    />
      <MissionsView  v-if="activeTab === 'missions'"  />
      <AllianceView  v-if="activeTab === 'alliance'"  />
      <RankingsView  v-if="activeTab === 'rankings'"  />
      <MessagesView  v-if="activeTab === 'messages'"  />
      <ProfileView   v-if="activeTab === 'profile'"   />
      <GuideView     v-if="activeTab === 'guide'"     />
      <AdminView     v-if="activeTab === 'admin'"     />
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
import { useBotStore }      from '@/stores/bot.js';
import ResourceItem  from '@/components/ResourceItem.vue';
import OverviewView  from '@/components/views/OverviewView.vue';
import BuildingsView from '@/components/views/BuildingsView.vue';
import ResearchView  from '@/components/views/ResearchView.vue';
import FleetView     from '@/components/views/FleetView.vue';
import DefenseView   from '@/components/views/DefenseView.vue';
import GalaxyView    from '@/components/views/GalaxyView.vue';
import MissionsView  from '@/components/views/MissionsView.vue';
import AllianceView  from '@/components/views/AllianceView.vue';
import RankingsView  from '@/components/views/RankingsView.vue';
import MessagesView  from '@/components/views/MessagesView.vue';
import ProfileView   from '@/components/views/ProfileView.vue';
import GuideView     from '@/components/views/GuideView.vue';
import AdminView     from '@/components/views/AdminView.vue';
import BotPanel       from '@/components/BotPanel.vue';
import ControlSwitch  from '@/components/LangSwitch.vue';
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
const showChangelog  = ref(false);

const resources = computed(() => gameStore.resources);
const rates     = computed(() => gameStore.rates);
const planets   = computed(() => gameStore.planets);
const score     = computed(() => gameStore.score);

const tabs = computed(() => {
  const t = [
    { id: 'overview',  label: L.t('nav.overview')  },
    { id: 'buildings', label: L.t('nav.buildings') },
    { id: 'research',  label: L.t('nav.research')  },
    { id: 'fleet',     label: L.t('nav.fleet')     },
    { id: 'defense',   label: L.t('nav.defense')   || '🛡️ Védelem' },
    { id: 'galaxy',    label: L.t('nav.galaxy')    },
    { id: 'missions',  label: L.t('nav.missions')  || '🚀 Küldetések' },
    { id: 'alliance',  label: L.t('nav.alliance')  },
    { id: 'messages',  label: L.t('nav.messages')  },
    { id: 'rankings',  label: L.t('nav.rankings')  },
    { id: 'profile',   label: L.t('nav.profile')   },
    { id: 'guide',     label: L.t('nav.guide')     },
  ];
  if (auth.isAdmin) {
    t.push({ id: 'admin', label: '⚙️ Admin' });
  }
  return t;
});

function onLogout() {
  auth.logout();
  router.push('/login');
}

let tickTimer, syncTimer;

onMounted(async () => {
  await gameStore.loadState();
  await msgStore.loadMessages();
  await allianceStore.load();
  await gameStore.syncResources(); 
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
/* ... (rest of the styles are the same) */
</style>
