<template>
  <!-- Main Shell - Only render when state is ready -->
  <div class="game-shell" v-if="gameStore.state && !gameStore.loading">

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
        <ResourceItem icon="⚙️" :label="L.t('res.metal')"        :value="resources.metal"          :rate="rates.metal"   color="var(--metal)"   :maxVal="gameStore.storage?.metal" />
        <ResourceItem icon="💎" :label="L.t('res.crystal')"      :value="resources.crystal"        :rate="rates.crystal" color="var(--crystal)" :maxVal="gameStore.storage?.crystal" />
        <ResourceItem icon="⚡" :label="L.t('res.energy')"       :value="resources.energy"         :rate="rates.energy"  color="var(--energy)" />
        <ResourceItem icon="🔮" :label="L.t('res.deus')"         :value="resources.deus"           :rate="rates.deus"    color="var(--accent)"  :maxVal="gameStore.storage?.deus" />
        <ResourceItem icon="🟣" :label="L.t('res.darkMatter') || 'Dark Matter'" :value="gameStore.darkMatter" color="#9b59b6" />
      </div>

      <div class="user-area">
        <ControlSwitch />
        <div class="user-info" @click="activeTab = 'profile'" style="cursor:pointer" :title="L.t('nav.profile')">
          <div class="user-name">{{ auth.username }}</div>
          <div class="user-pts">{{ scoreFormatted }} pt</div>
        </div>
        <div class="notif-wrapper">
          <button class="timeline-bell" @click="showNotifPanel = !showNotifPanel" :title="L.t('notifications.title')">
            🔔
            <span v-if="notifStore.unreadCount > 0" class="bell-badge">{{ notifStore.unreadCount }}</span>
          </button>
          <div v-if="showNotifPanel" class="notif-dropdown" @click.stop>
            <div class="notif-header">
              <span class="notif-title">{{ L.t('notifications.title') }}</span>
              <button v-if="notifStore.notifications.length > 0" class="notif-mark-read" @click="notifStore.markAllRead()">{{ L.t('notifications.markAllRead') }}</button>
            </div>
            <div class="notif-list">
              <div v-if="notifStore.notifications.length === 0" class="notif-empty">{{ L.t('notifications.noNotifications') }}</div>
              <div
                v-for="n in notifStore.notifications"
                :key="n.id"
                class="notif-item"
                :class="{ unread: !n.is_read }"
                @click="notifStore.markRead(n.id)"
              >
                <span class="notif-icon">{{ notifTypeIcon(n.type) }}</span>
                <div class="notif-content">
                  <div class="notif-item-title">{{ n.title }}</div>
                  <div class="notif-body">{{ n.body }}</div>
                  <div class="notif-time">{{ timeAgo(n.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="timeline-bell" @click="showTimeline = true" title="Aktivitás">
          📋
          <span v-if="gameStore.unreadTimelineCount > 0" class="bell-badge">{{ gameStore.unreadTimelineCount }}</span>
        </button>
        <div v-if="allianceStore.inAlliance" class="alliance-badge" @click="activeTab = 'alliance'" title="Szövetség">
          [{{ allianceStore.alliance?.tag }}]
        </div>
        <button class="audio-toggle" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">{{ isMuted ? '\uD83D\uDD07' : '\uD83D\uDD0A' }}</button>
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

    <!-- ── EVENT BANNER ── -->
    <Transition name="slide-down">
      <div v-if="activeEvent" class="event-banner" @click="activeTab = 'overview'">
        <span class="event-icon">{{ activeEvent.meta?.icon || '🌋' }}</span>
        <span class="event-name">{{ eventName }}</span>
        <span class="event-sep">—</span>
        <span class="event-time">{{ eventTimeRemaining }}</span>
      </div>
    </Transition>

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
        :class="{ active: gameStore.state?.activePlanet?.id === planet.id, 'is-moon': planet.isMoon }"
        @click="gameStore.switchPlanet(planet.id)"
      >
        <span class="planet-emoji">
            {{ planet.emoji || (planet.isMoon ? '🌑' : '🌍') }}
            <span v-if="planet.isMoon" class="moon-badge">MOON</span>
        </span>
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
      <MarketView    v-if="activeTab === 'market'"    />
      <GuideView     v-if="activeTab === 'guide'"     />
      <ShopView      v-if="activeTab === 'shop'"      />
      <AdminView     v-if="activeTab === 'admin'"     />
    </main>

    <BotPanel />
    <TourOverlay />
    <ActivityTimeline :visible="showTimeline" @close="showTimeline = false" />
  </div>

  <!-- Loading State -->
  <div v-else-if="gameStore.loading || !gameStore.state" class="loading-screen">
    <div class="loading-icon">🌌</div>
    <div class="loading-text">{{ L.t('game.loading') || 'Betöltés...' }}</div>
  </div>

  <!-- Error State -->
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
import { useNotificationsStore } from '@/stores/notifications.js';
import { useAllianceStore } from '@/stores/alliance.js';
import { useBotStore }      from '@/stores/bot.js';
import { useTourStore }     from '@/stores/tour.js';
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
import MarketView    from '@/components/views/MarketView.vue';
import GuideView     from '@/components/views/GuideView.vue';
import AdminView     from '@/components/views/AdminView.vue';
import ShopView      from '@/components/views/ShopView.vue';
import BotPanel       from '@/components/BotPanel.vue';
import ControlSwitch  from '@/components/LangSwitch.vue';
import ChangelogModal from '@/components/ChangelogModal.vue';
import TourOverlay    from '@/components/TourOverlay.vue';
import ActivityTimeline from '@/components/ActivityTimeline.vue';
import { useLangStore }  from '@/stores/lang.js';
import { api }           from '@/api/client.js';
import { APP_VERSION }   from '@/data/changelog.js';
import { audioEngine }   from '@/audio/AudioEngine.js';
import { startAmbientMusic, stopAmbientMusic } from '@/audio/music.js';

const router        = useRouter();
const auth          = useAuthStore();
const gameStore     = useGameStore();
const msgStore      = useMessagesStore();
const allianceStore = useAllianceStore();
const tour          = useTourStore();
const notifStore    = useNotificationsStore();
const L             = useLangStore();

const activeTab      = ref('overview');
const showChangelog  = ref(false);
const showTimeline   = ref(false);
const showNotifPanel = ref(false);
const isMuted        = ref(audioEngine.muted);
const activeEvent    = ref(null);

// Audio: init on first user click (browser autoplay policy)
function initAudio() {
  audioEngine.init();
  startAmbientMusic();
  document.removeEventListener('click', initAudio);
}

function notifTypeIcon(type) {
  const icons = { attack: '⚔️', buildComplete: '🏗️', missionReturn: '🚀', questComplete: '🏆' };
  return icons[type] || '🔔';
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return L.t('time.now') || 'now';
  if (diff < 3600) return Math.floor(diff / 60) + (L.t('time.min') || 'm');
  if (diff < 86400) return Math.floor(diff / 3600) + (L.t('time.hour') || 'h');
  return Math.floor(diff / 86400) + (L.t('time.day') || 'd');
}

function toggleMute() {
  const newState = !audioEngine.muted;
  audioEngine.setMuted(newState);
  isMuted.value = newState;
}

// Safe computed accessors
const resources = computed(() => gameStore.state?.activePlanet?.resources || { metal: 0, crystal: 0, energy: 0, deus: 0 });
const rates     = computed(() => gameStore.state?.activePlanet?.rates || { metal: 0, crystal: 0, energy: 0, deus: 0 });
const planets   = computed(() => gameStore.state?.planets || []);
const scoreFormatted = computed(() => (gameStore.state?.score || 0).toLocaleString('hu'));

const eventName = computed(() => {
  if (!activeEvent.value) return '';
  const meta = activeEvent.value.meta;
  if (!meta) return activeEvent.value.type || '';
  const lang = L.currentLang || 'en';
  return meta.name?.[lang] || meta.name?.en || activeEvent.value.type;
});

const eventTimeRemaining = computed(() => {
  if (!activeEvent.value) return '';
  const now = Math.floor(Date.now() / 1000);
  const diff = (activeEvent.value.expiresAt || 0) - now;
  if (diff <= 0) return L.t('events.ended') || 'Ended';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600) / 60);
  return `${hours}h ${mins}m`;
});

async function loadActiveEvent() {
  try {
    const data = await api.getActiveEvent();
    activeEvent.value = data.event || null;
  } catch (_) {
    activeEvent.value = null;
  }
}

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
    { id: 'market',    label: L.t('nav.market')    || '⚖️ Piac' },
    { id: 'messages',  label: L.t('nav.messages')  },
    { id: 'rankings',  label: L.t('nav.rankings')  },
    { id: 'profile',   label: L.t('nav.profile')   },
    { id: 'guide',     label: L.t('nav.guide')     },
    { id: 'shop',      label: L.t('nav.shop') || '🟣 Shop' },
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

let tickTimer, syncTimer, timelineTimer, notifTimer, eventTimer;

function closeNotifPanel(e) {
  if (showNotifPanel.value) showNotifPanel.value = false;
}

onMounted(async () => {
  document.addEventListener('click', initAudio);
  auth.refresh(); // sync SDK auth state
  await gameStore.loadState();
  await msgStore.loadMessages();
  await allianceStore.load();
  await gameStore.syncResources();
  tickTimer = setInterval(() => gameStore.tickResources(), 1000);
  syncTimer = setInterval(() => gameStore.syncResources(), 30000);

  // Timeline polling (every 30s)
  await gameStore.loadTimeline(50);
  timelineTimer = setInterval(() => gameStore.loadTimeline(50), 30000);

  // Notifications polling (every 60s)
  await notifStore.load();
  notifTimer = setInterval(() => notifStore.load(), 60000);
  document.addEventListener('click', closeNotifPanel);

  // Active event polling (every 5 min)
  await loadActiveEvent();
  eventTimer = setInterval(() => loadActiveEvent(), 300000);

  // Request browser notification permission (Notification API)
  if ('Notification' in window && Notification.permission === 'default') {
    const pushEnabled = localStorage.getItem('aika_push_enabled');
    if (pushEnabled !== 'denied') {
      try {
        const perm = await Notification.requestPermission();
        localStorage.setItem('aika_push_enabled', perm === 'granted' ? 'true' : 'denied');
      } catch (_) {}
    }
  }

  if (!localStorage.getItem('aika_tour_finished')) {
    setTimeout(() => {
      if (tour && typeof tour.start === 'function') {
        tour.start();
      }
    }, 1500);
  }
});

onUnmounted(() => {
  clearInterval(tickTimer);
  clearInterval(syncTimer);
  clearInterval(timelineTimer);
  clearInterval(notifTimer);
  clearInterval(eventTimer);
  document.removeEventListener('click', initAudio);
  document.removeEventListener('click', closeNotifPanel);
  stopAmbientMusic();
  const bot = useBotStore();
  if (bot.active) bot.stop();
});
</script>

<style scoped>
.game-shell { display: flex; flex-direction: column; min-height: 100vh; position: relative; z-index: 1; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, var(--bg-deep) 0%, #040813 100%);
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: auto 1fr auto; 
  align-items: center;
  height: 48px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.6);
  padding-right: 8px;
}

.logo-area { display: flex; align-items: center; gap: 8px; padding: 0 14px; border-right: 1px solid var(--border); height: 100%; min-width: 140px; }
.ver-badge { font-family: 'Orbitron', sans-serif; font-size: 8px; color: var(--text-dim); background: none; border: 1px solid var(--border); border-radius: 3px; padding: 1px 5px; cursor: pointer; transition: all 0.2s; letter-spacing: 1px; margin-left: 4px; }
.ver-badge:hover { color: var(--accent); border-color: var(--accent); }
.logo-icon  { font-size: 22px; }
.logo-title { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 900; color: var(--accent); letter-spacing: 2px; text-shadow: 0 0 12px var(--accent); }
.logo-sub   { font-size: 8px; color: var(--text-dim); letter-spacing: 3px; font-family: 'Orbitron', sans-serif; }

.resource-bar { display: flex; align-items: center; flex: 1; height: 100%; padding: 0 8px; overflow-x: auto; scrollbar-width: none; }
.resource-bar::-webkit-scrollbar { display: none; }

.user-area { display: flex; align-items: center; gap: 8px; padding: 0 14px; border-left: 1px solid var(--border); height: 100%; }
.user-info  { text-align: right; }
.user-name  { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent4); }
.user-pts   { font-size: 9px; color: var(--accent3); }
.user-info:hover .user-name { color: var(--accent); }

.alliance-badge { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2); padding: 2px 6px; border-radius: 3px; cursor: pointer; transition: all 0.2s; }
.alliance-badge:hover { background: rgba(255,215,0,0.15); border-color: var(--accent4); }

.timeline-bell { position: relative; background: none; border: 1px solid var(--border); color: var(--text-dim); width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.timeline-bell:hover { background: rgba(0,200,255,0.08); border-color: var(--accent); color: var(--accent); }
.bell-badge { position: absolute; top: -4px; right: -4px; background: var(--accent2); color: white; font-size: 8px; font-family: 'Orbitron', sans-serif; min-width: 14px; height: 14px; border-radius: 7px; display: flex; align-items: center; justify-content: center; padding: 0 3px; animation: glow-pulse 2s ease-in-out infinite; }

.audio-toggle { background: none; border: 1px solid var(--border); color: var(--text-dim); width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.audio-toggle:hover { background: rgba(0,200,255,0.08); border-color: var(--accent); color: var(--accent); }

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
.planet-emoji  { font-size: 20px; position: relative; }
.moon-badge { position: absolute; top: -5px; right: -10px; background: var(--accent); color: #000; font-size: 7px; padding: 1px 3px; border-radius: 3px; font-weight: 900; letter-spacing: 0.5px; }
.planet-slot.is-moon { border-color: rgba(255,255,255,0.2); }
.planet-slot.is-moon.active { border-color: var(--accent); }
.planet-name   { font-size: 9px; color: var(--text-dim); margin-top: 2px; }
.planet-coords { font-size: 8px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.add-planet { border-style: dashed; opacity: 0.5; font-size: 20px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); min-width: 50px; height: 52px; }
.add-planet:hover { opacity: 0.8; }

.main-content { flex: 1; padding: 10px; position: relative; z-index: 1; }

.loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative; z-index: 1; }
.loading-icon { font-size: 64px; animation: pulse 2s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(0,200,255,0.5)); }
.loading-text { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); letter-spacing: 2px; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }

.event-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 14px;
  font-size: 12px;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 1px;
  background: linear-gradient(90deg, rgba(155,89,182,0.2) 0%, rgba(52,152,219,0.2) 50%, rgba(155,89,182,0.2) 100%);
  border-bottom: 1px solid rgba(155,89,182,0.3);
  color: #9b59b6;
  cursor: pointer;
  text-transform: uppercase;
  animation: event-glow 3s ease-in-out infinite;
}
.event-banner:hover { background: rgba(155,89,182,0.25); }
.event-icon { font-size: 16px; }
.event-name { color: #bb86fc; font-weight: 700; }
.event-sep { color: var(--text-dim, #666); }
.event-time { color: var(--text-dim, #aaa); font-size: 10px; }
@keyframes event-glow {
  0%, 100% { box-shadow: inset 0 0 10px rgba(155,89,182,0.1); }
  50% { box-shadow: inset 0 0 20px rgba(155,89,182,0.2); }
}

.energy-banner { padding: 5px 14px; font-size: 11px; text-align: center; font-family: 'Exo 2', sans-serif; }
.energy-banner.warning  { background: rgba(255,165,0,0.15); border-bottom: 1px solid rgba(255,165,0,0.3); color: #ffaa00; }
.energy-banner.critical { background: rgba(255,58,122,0.15); border-bottom: 1px solid rgba(255,58,122,0.3); color: var(--accent2); animation: pulse 1.5s ease-in-out infinite; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

/* Notification dropdown */
.notif-wrapper { position: relative; }
.notif-dropdown {
  position: absolute; top: 36px; right: 0; width: 320px; max-height: 400px;
  background: var(--bg-deep, #060e20); border: 1px solid var(--border-glow, rgba(0,200,255,0.2));
  border-radius: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.7); z-index: 200;
  display: flex; flex-direction: column; overflow: hidden;
}
.notif-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
}
.notif-title { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent, #00c8ff); letter-spacing: 1px; }
.notif-mark-read {
  background: none; border: 1px solid var(--border, rgba(255,255,255,0.1)); color: var(--text-dim, #888);
  font-size: 10px; padding: 2px 8px; border-radius: 3px; cursor: pointer; transition: all 0.2s;
}
.notif-mark-read:hover { color: var(--accent, #00c8ff); border-color: var(--accent, #00c8ff); }
.notif-list { overflow-y: auto; flex: 1; max-height: 350px; }
.notif-empty { text-align: center; padding: 24px 12px; color: var(--text-dim, #888); font-size: 12px; }
.notif-item {
  display: flex; gap: 8px; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; transition: background 0.15s;
}
.notif-item:hover { background: rgba(0,200,255,0.05); }
.notif-item.unread { background: rgba(0,200,255,0.08); border-left: 2px solid var(--accent, #00c8ff); }
.notif-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.notif-content { flex: 1; min-width: 0; }
.notif-item-title { font-size: 11px; color: var(--text, #eee); font-weight: 600; }
.notif-body { font-size: 10px; color: var(--text-dim, #888); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif-time { font-size: 9px; color: var(--text-dim, #666); margin-top: 2px; font-family: 'Orbitron', sans-serif; }
</style>
