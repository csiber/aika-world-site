<template>
  <div class="game-shell" v-if="gameStore.state && !gameStore.loading">

    <!-- ── TOPBAR ── -->
    <header class="topbar">
      <div class="tb-logo">
        <span class="tb-logo-icon">⬡</span>
        <div>
          <div class="tb-logo-title">AIKA</div>
          <div class="tb-logo-sub">WORLD</div>
        </div>
        <button class="tb-ver" @click="showChangelog = true" :title="'Changelog'">v{{ APP_VERSION }}</button>
      </div>

      <div class="tb-resources">
        <div class="res-chip" v-for="res in resourceChips" :key="res.key">
          <div class="res-chip-top">
            <span class="res-chip-sym" :style="{ color: res.color }">{{ res.sym }}</span>
            <span class="res-chip-label">{{ res.label }}</span>
          </div>
          <div class="res-chip-val" :style="{ color: res.color }">
            {{ Math.floor(res.value).toLocaleString('hu') }}
          </div>
          <div class="res-chip-rate" v-if="res.rate">+{{ Math.floor(res.rate).toLocaleString('hu') }}/h</div>
          <div class="res-chip-bar" v-if="res.max">
            <div class="res-chip-fill" :style="{ width: Math.min(100, res.value / res.max * 100) + '%', background: res.color }" />
          </div>
        </div>
      </div>

      <div class="tb-user">
        <div>
          <div class="tb-username">{{ auth.username }}</div>
          <div class="tb-score">{{ scoreFormatted }} pt</div>
        </div>
        <div v-if="allianceStore.inAlliance" class="tb-alliance" @click="activeTab = 'alliance'">
          [{{ allianceStore.alliance?.tag }}]
        </div>
        <div class="tb-btn-wrap">
          <button class="tb-icon-btn" @click="showNotifPanel = !showNotifPanel">🔔</button>
          <span v-if="notifStore.unreadCount > 0" class="tb-badge">{{ notifStore.unreadCount }}</span>
        </div>
        <button class="tb-icon-btn" @click="showTimeline = true">📋
          <span v-if="gameStore.unreadTimelineCount > 0" class="tb-badge">{{ gameStore.unreadTimelineCount }}</span>
        </button>
        <button class="tb-icon-btn" @click="toggleMute">{{ isMuted ? '🔇' : '🔊' }}</button>
        <button class="tb-icon-btn tb-logout" @click="onLogout">⏻</button>

        <!-- Notification dropdown -->
        <div v-if="showNotifPanel" class="notif-dropdown" @click.stop>
          <div class="notif-dd-header">
            <span class="notif-dd-title">{{ L.t('notifications.title') }}</span>
            <button v-if="notifStore.notifications.length > 0" class="btn-primary" style="font-size:7px;padding:2px 6px" @click="notifStore.markAllRead()">{{ L.t('notifications.markAllRead') }}</button>
          </div>
          <div class="notif-dd-list">
            <div v-if="!notifStore.notifications.length" class="notif-dd-empty">{{ L.t('notifications.noNotifications') }}</div>
            <div v-for="n in notifStore.notifications" :key="n.id" class="notif-dd-item" :class="{ unread: !n.is_read }" @click="notifStore.markRead(n.id)">
              <span class="notif-dd-icon">{{ notifTypeIcon(n.type) }}</span>
              <div class="notif-dd-body">
                <div class="notif-dd-item-title">{{ n.title }}</div>
                <div class="notif-dd-item-text">{{ n.body }}</div>
                <div class="notif-dd-item-time">{{ timeAgo(n.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ── NAVBAR ── -->
    <nav class="navbar">
      <button v-for="tab in tabs" :key="tab.id" class="nav-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        {{ tab.label }}
        <span v-if="tab.id === 'messages' && msgStore.unreadCount > 0" class="nav-badge">{{ msgStore.unreadCount }}</span>
      </button>
    </nav>

    <!-- ── EVENT BANNER ── -->
    <Transition name="slide-down">
      <div v-if="activeEvent" class="event-banner" @click="activeTab = 'overview'">
        <span>{{ activeEvent.meta?.icon || '🌋' }}</span>
        <span class="event-banner-name">{{ eventName }}</span>
        <span class="event-banner-sep">—</span>
        <span class="event-banner-time">⏳ {{ eventTimeRemaining }}</span>
      </div>
    </Transition>

    <!-- ── ENERGY WARNING ── -->
    <Transition name="slide-down">
      <div v-if="gameStore.energyWarning" class="energy-banner" :class="gameStore.energyWarning.level">
        {{ gameStore.energyWarning.level === 'critical'
          ? L.t('game.energyCritical', { eff: gameStore.energyWarning.eff, reduction: 100 - gameStore.energyWarning.eff })
          : L.t('game.energyWarning', { eff: gameStore.energyWarning.eff }) }}
      </div>
    </Transition>

    <!-- ── PLANET BAR ── -->
    <div class="planet-bar">
      <div v-for="planet in planets" :key="planet.id" class="planet-slot"
        :class="{ active: gameStore.state?.activePlanet?.id === planet.id, 'is-moon': planet.isMoon }"
        @click="gameStore.switchPlanet(planet.id)">
        <div class="planet-emoji-wrap">
          <span class="planet-emoji">{{ planet.emoji || (planet.isMoon ? '🌑' : '🌍') }}</span>
          <span v-if="planet.isMoon" class="moon-tag">MOON</span>
        </div>
        <div class="planet-details">
          <div class="planet-name">{{ planet.name }}</div>
          <div class="planet-coords">{{ planet.coords }}</div>
        </div>
      </div>
      <div class="planet-slot planet-add" @click="activeTab = 'galaxy'">+</div>
    </div>

    <!-- ── MAIN CONTENT ── -->
    <main class="main-content">
      <OverviewView  v-if="activeTab === 'overview'" />
      <BuildingsView v-if="activeTab === 'buildings'" />
      <ResearchView  v-if="activeTab === 'research'" />
      <FleetView     v-if="activeTab === 'fleet'" />
      <DefenseView   v-if="activeTab === 'defense'" />
      <GalaxyView    v-if="activeTab === 'galaxy'" />
      <MissionsView  v-if="activeTab === 'missions'" />
      <AllianceView  v-if="activeTab === 'alliance'" />
      <RankingsView  v-if="activeTab === 'rankings'" />
      <MessagesView  v-if="activeTab === 'messages'" />
      <ProfileView   v-if="activeTab === 'profile'" />
      <MarketView    v-if="activeTab === 'market'" />
      <GuideView     v-if="activeTab === 'guide'" />
      <ShopView      v-if="activeTab === 'shop'" />
      <AdminView     v-if="activeTab === 'admin'" />
    </main>

    <BotPanel />
    <TourOverlay />
    <ActivityTimeline :visible="showTimeline" @close="showTimeline = false" />
    <ChangelogModal v-if="showChangelog" @close="showChangelog = false" />
  </div>

  <div v-else-if="gameStore.loading || !gameStore.state" class="loading-screen">
    <div class="loading-icon">⬡</div>
    <div class="loading-text">{{ L.t('game.loading') || 'Betöltés...' }}</div>
  </div>

  <div v-else class="loading-screen">
    <div class="loading-icon">⚠</div>
    <div class="loading-text">{{ gameStore.error || L.t('game.error') }}</div>
    <button class="btn-primary" style="margin-top:20px;width:200px" @click="gameStore.loadState()">{{ L.t('game.retry') }}</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore }          from '@/stores/auth.js';
import { useGameStore }          from '@/stores/game.js';
import { useMessagesStore }      from '@/stores/messages.js';
import { useNotificationsStore } from '@/stores/notifications.js';
import { useAllianceStore }      from '@/stores/alliance.js';
import { useBotStore }           from '@/stores/bot.js';
import { useTourStore }          from '@/stores/tour.js';
import { useLangStore }          from '@/stores/lang.js';
import { api }                   from '@/api/client.js';
import { APP_VERSION }           from '@/data/changelog.js';
import { audioEngine }           from '@/audio/AudioEngine.js';
import { startAmbientMusic, stopAmbientMusic } from '@/audio/music.js';
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
import BotPanel         from '@/components/BotPanel.vue';
import TourOverlay      from '@/components/TourOverlay.vue';
import ActivityTimeline from '@/components/ActivityTimeline.vue';
import ChangelogModal   from '@/components/ChangelogModal.vue';

const router        = useRouter();
const auth          = useAuthStore();
const gameStore     = useGameStore();
const msgStore      = useMessagesStore();
const allianceStore = useAllianceStore();
const notifStore    = useNotificationsStore();
const tour          = useTourStore();
const L             = useLangStore();

const activeTab      = ref('overview');
const showChangelog  = ref(false);
const showTimeline   = ref(false);
const showNotifPanel = ref(false);
const isMuted        = ref(audioEngine.muted);
const activeEvent    = ref(null);

function initAudio() { audioEngine.init(); startAmbientMusic(); document.removeEventListener('click', initAudio); }
function notifTypeIcon(type) { return { attack:'⚔️', buildComplete:'🏗️', missionReturn:'🚀', questComplete:'🏆' }[type] || '🔔'; }
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return L.t('time.now') || 'now';
  if (diff < 3600) return Math.floor(diff / 60) + (L.t('time.min') || 'm');
  if (diff < 86400) return Math.floor(diff / 3600) + (L.t('time.hour') || 'h');
  return Math.floor(diff / 86400) + (L.t('time.day') || 'd');
}
function toggleMute() { const n = !audioEngine.muted; audioEngine.setMuted(n); isMuted.value = n; }

const resources     = computed(() => gameStore.state?.activePlanet?.resources || { metal:0,crystal:0,energy:0,deus:0 });
const rates         = computed(() => gameStore.state?.activePlanet?.rates     || { metal:0,crystal:0,energy:0,deus:0 });
const planets       = computed(() => gameStore.state?.planets || []);
const scoreFormatted = computed(() => (gameStore.state?.score || 0).toLocaleString('hu'));

const resourceChips = computed(() => [
  { key:'metal',      label:'FÉM',         sym:'◈', color:'var(--metal)',   value:resources.value.metal,   rate:rates.value.metal,   max:gameStore.storage?.metal },
  { key:'crystal',    label:'KRISTÁLY',    sym:'◆', color:'var(--crystal)', value:resources.value.crystal, rate:rates.value.crystal, max:gameStore.storage?.crystal },
  { key:'energy',     label:'ENERGIA',     sym:'⚡', color:'var(--energy)',  value:resources.value.energy,  rate:rates.value.energy,  max:null },
  { key:'deus',       label:'DÉUSIUM',     sym:'◉', color:'var(--accent)',  value:resources.value.deus,    rate:rates.value.deus,    max:gameStore.storage?.deus },
  { key:'darkMatter', label:'DARK MATTER', sym:'●', color:'#9b59b6',        value:gameStore.darkMatter||0, rate:null, max:null },
]);

const eventName = computed(() => {
  if (!activeEvent.value) return '';
  const meta = activeEvent.value.meta;
  if (!meta) return activeEvent.value.type || '';
  return meta.name?.[L.currentLang] || meta.name?.en || activeEvent.value.type;
});
const eventTimeRemaining = computed(() => {
  if (!activeEvent.value) return '';
  const diff = (activeEvent.value.expiresAt || 0) - Math.floor(Date.now() / 1000);
  if (diff <= 0) return L.t('events.ended') || 'Ended';
  const days = Math.floor(diff / 86400), hours = Math.floor((diff % 86400) / 3600);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${Math.floor((diff % 3600) / 60)}m`;
});

async function loadActiveEvent() { try { const d = await api.getActiveEvent(); activeEvent.value = d.event || null; } catch { activeEvent.value = null; } }

const tabs = computed(() => {
  const t = [
    { id:'overview',  label:L.t('nav.overview')  },
    { id:'buildings', label:L.t('nav.buildings') },
    { id:'research',  label:L.t('nav.research')  },
    { id:'fleet',     label:L.t('nav.fleet')     },
    { id:'defense',   label:L.t('nav.defense') || 'VÉDELEM' },
    { id:'galaxy',    label:L.t('nav.galaxy')    },
    { id:'missions',  label:L.t('nav.missions') || 'KÜLDETÉSEK' },
    { id:'alliance',  label:L.t('nav.alliance')  },
    { id:'market',    label:L.t('nav.market') || 'PIAC' },
    { id:'messages',  label:L.t('nav.messages')  },
    { id:'rankings',  label:L.t('nav.rankings')  },
    { id:'profile',   label:L.t('nav.profile')   },
    { id:'guide',     label:L.t('nav.guide')     },
    { id:'shop',      label:L.t('nav.shop') || 'SHOP' },
  ];
  if (auth.isAdmin) t.push({ id:'admin', label:'ADMIN' });
  return t;
});

function onLogout() { auth.logout(); router.push('/login'); }
function closeNotifPanel() { if (showNotifPanel.value) showNotifPanel.value = false; }

let tickTimer, syncTimer, timelineTimer, notifTimer, eventTimer;

onMounted(async () => {
  document.addEventListener('click', initAudio);
  document.addEventListener('click', closeNotifPanel);
  auth.refresh();
  await gameStore.loadState();
  await msgStore.loadMessages();
  await allianceStore.load();
  await gameStore.syncResources();
  tickTimer     = setInterval(() => gameStore.tickResources(), 1000);
  syncTimer     = setInterval(() => gameStore.syncResources(), 30000);
  await gameStore.loadTimeline(50);
  timelineTimer = setInterval(() => gameStore.loadTimeline(50), 30000);
  await notifStore.load();
  notifTimer    = setInterval(() => notifStore.load(), 60000);
  await loadActiveEvent();
  eventTimer    = setInterval(() => loadActiveEvent(), 300000);
  if ('Notification' in window && Notification.permission === 'default' && localStorage.getItem('aika_push_enabled') !== 'denied') {
    try { const p = await Notification.requestPermission(); localStorage.setItem('aika_push_enabled', p === 'granted' ? 'true' : 'denied'); } catch {}
  }
  if (!localStorage.getItem('aika_tour_finished')) setTimeout(() => tour?.start?.(), 1500);
});

onUnmounted(() => {
  [tickTimer, syncTimer, timelineTimer, notifTimer, eventTimer].forEach(clearInterval);
  document.removeEventListener('click', initAudio);
  document.removeEventListener('click', closeNotifPanel);
  stopAmbientMusic();
  const bot = useBotStore();
  if (bot.active) bot.stop();
});
</script>

<style scoped>
.game-shell{display:flex;flex-direction:column;min-height:100vh;position:relative;z-index:1}

/* ── Topbar ── */
.topbar{position:sticky;top:0;z-index:200;height:52px;
  background:linear-gradient(180deg,rgba(3,8,16,.98) 0%,rgba(5,11,24,.96) 100%);
  border-bottom:1px solid var(--border);
  display:grid;grid-template-columns:160px 1fr auto;align-items:center;
  box-shadow:0 4px 24px rgba(0,0,0,.6);}
.tb-logo{display:flex;align-items:center;gap:10px;padding:0 16px;border-right:1px solid var(--border);height:100%}
.tb-logo-icon{font-size:20px;filter:drop-shadow(0 0 8px rgba(26,200,232,.5))}
.tb-logo-title{font-family:'Orbitron',sans-serif;font-size:14px;font-weight:900;color:var(--accent);letter-spacing:3px;line-height:1;text-shadow:0 0 12px rgba(26,200,232,.4)}
.tb-logo-sub{font-family:'Orbitron',sans-serif;font-size:7px;color:var(--text-dim);letter-spacing:4px;margin-top:2px}
.tb-ver{font-family:'Orbitron',sans-serif;font-size:7px;color:var(--text-dim);background:none;border:1px solid var(--border);border-radius:2px;padding:1px 5px;cursor:pointer;letter-spacing:1px;transition:all .2s;margin-left:auto}
.tb-ver:hover{color:var(--accent);border-color:var(--accent)}
.tb-resources{display:flex;align-items:center;padding:0 8px;gap:4px;overflow-x:auto;height:100%;scrollbar-width:none}
.tb-resources::-webkit-scrollbar{display:none}
.res-chip{display:flex;flex-direction:column;justify-content:center;padding:5px 10px;border-right:1px solid rgba(255,255,255,.04);min-width:88px;cursor:default;transition:background .15s}
.res-chip:hover{background:rgba(255,255,255,.02)}
.res-chip-top{display:flex;align-items:center;gap:5px}
.res-chip-sym{font-size:11px;flex-shrink:0}
.res-chip-label{font-family:'Orbitron',sans-serif;font-size:7px;letter-spacing:1.5px;color:var(--text-dim)}
.res-chip-val{font-family:'Space Mono',monospace;font-size:11px;font-weight:700;margin-top:1px}
.res-chip-rate{font-size:9px;color:var(--text-dim);margin-top:1px}
.res-chip-bar{height:2px;background:rgba(255,255,255,.06);border-radius:1px;margin-top:3px;overflow:hidden}
.res-chip-fill{height:100%;border-radius:1px;transition:width .4s ease}
.tb-user{display:flex;align-items:center;gap:8px;padding:0 14px;border-left:1px solid var(--border);height:100%;position:relative}
.tb-username{font-family:'Orbitron',sans-serif;font-size:11px;color:var(--accent4);letter-spacing:1px}
.tb-score{font-family:'Space Mono',monospace;font-size:9px;color:var(--accent3)}
.tb-alliance{font-family:'Orbitron',sans-serif;font-size:9px;color:var(--accent4);background:rgba(232,180,80,.08);border:1px solid rgba(232,180,80,.2);padding:2px 7px;border-radius:2px;cursor:pointer;transition:all .2s}
.tb-alliance:hover{background:rgba(232,180,80,.15)}
.tb-btn-wrap{position:relative}
.tb-badge{position:absolute;top:-4px;right:-4px;background:var(--accent2);color:#fff;font-size:7px;font-family:'Orbitron',sans-serif;min-width:14px;height:14px;border-radius:7px;display:flex;align-items:center;justify-content:center;padding:0 3px;pointer-events:none}
.tb-icon-btn{background:none;border:1px solid var(--border);color:var(--text-dim);width:28px;height:28px;border-radius:3px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;position:relative}
.tb-icon-btn:hover{background:rgba(26,200,232,.08);border-color:var(--accent);color:var(--accent)}
.tb-logout{border-color:rgba(232,58,106,.25);color:var(--accent2)}
.tb-logout:hover{background:rgba(232,58,106,.1);border-color:var(--accent2)}

/* Notification dropdown */
.notif-dropdown{position:absolute;top:44px;right:0;width:300px;max-height:380px;background:var(--bg-deep);border:1px solid var(--border-glow);border-radius:4px;box-shadow:0 8px 32px rgba(0,0,0,.7);z-index:300;display:flex;flex-direction:column;overflow:hidden}
.notif-dd-header{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border)}
.notif-dd-title{font-family:'Orbitron',sans-serif;font-size:9px;color:var(--accent);letter-spacing:1px}
.notif-dd-list{overflow-y:auto;flex:1}
.notif-dd-empty{text-align:center;padding:20px;color:var(--text-dim);font-size:11px}
.notif-dd-item{display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .15s}
.notif-dd-item:hover{background:rgba(26,200,232,.04)}
.notif-dd-item.unread{background:rgba(26,200,232,.07);border-left:2px solid var(--accent)}
.notif-dd-icon{font-size:18px;flex-shrink:0;margin-top:2px}
.notif-dd-item-title{font-size:11px;color:var(--text-bright);font-weight:600}
.notif-dd-item-text{font-size:10px;color:var(--text-dim);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.notif-dd-item-time{font-size:9px;color:var(--text-dim);margin-top:2px;font-family:'Orbitron',sans-serif}

/* ── Navbar ── */
.navbar{background:rgba(4,10,22,.97);border-bottom:1px solid var(--border);display:flex;align-items:center;height:34px;padding:0 6px;position:sticky;top:52px;z-index:199;gap:1px;overflow-x:auto}
.navbar::-webkit-scrollbar{display:none}
.nav-btn{padding:0 11px;height:26px;background:none;border:1px solid transparent;color:var(--text-dim);font-family:'Orbitron',sans-serif;font-size:8.5px;letter-spacing:1px;cursor:pointer;border-radius:2px;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:5px;text-transform:uppercase}
.nav-btn:hover{color:var(--text);border-color:var(--border)}
.nav-btn.active{color:var(--accent);border-color:var(--border-glow);background:rgba(26,200,232,.07);box-shadow:inset 0 -2px 0 var(--accent);text-shadow:0 0 8px rgba(26,200,232,.5)}
.nav-badge{background:var(--accent2);color:#fff;font-size:7px;min-width:14px;height:14px;border-radius:7px;display:flex;align-items:center;justify-content:center;padding:0 3px}

/* ── Planet bar ── */
.planet-bar{background:rgba(3,8,16,.96);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px;padding:6px 12px;position:sticky;top:86px;z-index:198;overflow-x:auto}
.planet-bar::-webkit-scrollbar{display:none}
.planet-slot{display:flex;align-items:center;gap:8px;padding:5px 12px;border:1px solid var(--border);border-radius:3px;cursor:pointer;min-width:120px;transition:all .2s;background:rgba(10,20,40,.6)}
.planet-slot:hover{border-color:var(--border-glow)}
.planet-slot.active{border-color:var(--accent);background:rgba(26,200,232,.08);animation:planet-slot-pulse 3s ease-in-out infinite}
.planet-slot.is-moon{border-color:rgba(255,255,255,.12)}
.planet-slot.is-moon.active{border-color:rgba(255,255,255,.4)}
.planet-emoji-wrap{position:relative;flex-shrink:0}
.planet-emoji{font-size:22px;display:block;line-height:1}
.moon-tag{position:absolute;top:-4px;right:-10px;background:var(--accent);color:#000;font-size:6px;padding:1px 3px;border-radius:2px;font-family:'Orbitron',sans-serif;font-weight:900}
.planet-details{}
.planet-name{font-family:'Orbitron',sans-serif;font-size:9px;color:var(--text-bright);letter-spacing:.5px}
.planet-coords{font-family:'Space Mono',monospace;font-size:8px;color:var(--text-dim);margin-top:1px}
.planet-add{border-style:dashed;opacity:.4;min-width:46px;height:50px;justify-content:center;font-size:18px;color:var(--text-dim)}
.planet-add:hover{opacity:.7}

/* ── Event / Energy banners ── */
.event-banner{display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 16px;font-size:11px;font-family:'Orbitron',sans-serif;letter-spacing:1px;background:linear-gradient(90deg,rgba(155,89,182,.12),rgba(26,200,232,.08),rgba(155,89,182,.12));border-bottom:1px solid rgba(155,89,182,.2);color:#bb86fc;text-transform:uppercase;cursor:pointer;animation:event-glow 4s ease-in-out infinite}
.event-banner-name{color:#bb86fc;font-weight:700}
.event-banner-sep{color:var(--text-dim)}
.event-banner-time{color:var(--text-dim);font-size:9px}
@keyframes event-glow{0%,100%{box-shadow:inset 0 0 12px rgba(155,89,182,.08)}50%{box-shadow:inset 0 0 24px rgba(155,89,182,.16)}}
.energy-banner{padding:5px 14px;font-size:11px;text-align:center;font-family:'Exo 2',sans-serif}
.energy-banner.warning{background:rgba(255,165,0,.15);border-bottom:1px solid rgba(255,165,0,.3);color:#ffaa00}
.energy-banner.critical{background:rgba(232,58,106,.15);border-bottom:1px solid rgba(232,58,106,.3);color:var(--accent2);animation:glow-pulse 1.5s ease-in-out infinite}
.slide-down-enter-active,.slide-down-leave-active{transition:all .3s ease}
.slide-down-enter-from,.slide-down-leave-to{opacity:0;transform:translateY(-8px)}

/* ── Main content ── */
.main-content{flex:1;padding:10px;position:relative;z-index:1}

/* ── Loading screen ── */
.loading-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;position:relative;z-index:1}
.loading-icon{font-size:56px;animation:glow-pulse 2s ease-in-out infinite;color:var(--accent);text-shadow:0 0 20px rgba(26,200,232,.5)}
.loading-text{font-family:'Orbitron',sans-serif;font-size:13px;color:var(--accent);letter-spacing:3px}
</style>
