<template>
  <div class="ov-grid">

    <!-- LEFT: Buildings list -->
    <div class="panel ov-left-panel">
      <div class="panel-header"><h3>ÉPÜLETEK</h3></div>
      <div class="panel-body ov-scroll">
        <div class="ov-section-label">TERMELÉS</div>
        <div v-for="b in prodBuildings" :key="b.id" class="bld-row">
          <span class="bld-row-sym" :style="{ color: b.color }">{{ b.symbol }}</span>
          <span class="bld-row-name">{{ b.name }}</span>
          <span class="bld-row-lv" :style="{ color: b.color }">Lv.{{ b.level }}</span>
        </div>
        <div class="ov-section-label" style="margin-top:14px">INFRASTRUKTÚRA</div>
        <div v-for="b in infraBuildings" :key="b.id" class="bld-row">
          <span class="bld-row-sym" :style="{ color: b.color }">{{ b.symbol }}</span>
          <span class="bld-row-name">{{ b.name }}</span>
          <span class="bld-row-lv" :style="{ color: b.color }">Lv.{{ b.level }}</span>
        </div>
      </div>
    </div>

    <!-- CENTER -->
    <div class="ov-center">

      <!-- Planet visual -->
      <div class="panel planet-panel">
        <PlanetCanvas
          :color="planetColor"
          :size="88"
          :speed="activePlanet.isMoon ? 0.4 : 1.0"
        />
        <div class="planet-info">
          <div class="planet-name-big">{{ activePlanet.name }}</div>
          <div class="planet-coord-big">{{ activePlanet.coords }}</div>
          <span v-if="activePlanet.specialization" class="planet-spec-tag" :class="activePlanet.specialization">
            {{ specIcon(activePlanet.specialization) }} {{ L.t('specialization.' + activePlanet.specialization) }}
          </span>
          <div class="planet-stat-grid">
            <div class="psg-item">
              <div class="psg-label">ÉPÜLETEK</div>
              <div class="psg-val">{{ buildings.length }}</div>
            </div>
            <div class="psg-item">
              <div class="psg-label">FLOTTA</div>
              <div class="psg-val">{{ totalShips }}</div>
            </div>
            <div class="psg-item">
              <div class="psg-label">FÉM/H</div>
              <div class="psg-val" style="color:var(--metal)">{{ fmt(rates.metal) }}</div>
            </div>
            <div class="psg-item">
              <div class="psg-label">PONTSZÁM</div>
              <div class="psg-val" style="color:var(--accent4)">{{ fmt(score) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Quests -->
      <div class="panel">
        <div class="panel-header"><h3 style="color:var(--accent4)">NAPI KÜLDETÉSEK</h3></div>
        <div class="panel-body">
          <div v-if="!quests.length" class="ov-empty">Nincs aktív küldetés</div>
          <div v-for="q in quests" :key="q.id" class="quest-row" :class="{ 'q-done': q.current >= q.required && !q.is_claimed, 'q-claimed': q.is_claimed }">
            <div class="q-main">
              <div class="q-desc">{{ questLabel(q) }}</div>
              <div class="q-prog-row">
                <div class="q-bar"><div class="q-fill" :style="{ width: Math.min(100, (q.current/q.required)*100) + '%', background: q.current >= q.required ? 'var(--accent3)' : 'var(--accent4)' }" /></div>
                <span class="q-cnt">{{ q.current }}/{{ q.required }}</span>
              </div>
            </div>
            <div class="q-side">
              <button v-if="q.current >= q.required && !q.is_claimed" class="btn-claim" @click="claimQuest(q.id)">ÁTVÉTEL</button>
              <span v-else-if="q.is_claimed" class="q-claimed-tag">✓ ÁTVÉVE</span>
              <span v-else class="q-reward">{{ q.reward_metal ? fmt(q.reward_metal) + ' Fém' : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Fleet control -->
      <div class="panel">
        <div class="panel-header">
          <h3 style="color:var(--accent2)">FLOTTA IRÁNYÍTÁS</h3>
          <button class="btn-primary" style="margin-left:auto;font-size:7px;padding:2px 8px" @click="resolveMissions" :disabled="resolving">
            {{ resolving ? '...' : 'FRISSÍTÉS' }}
          </button>
        </div>
        <div class="panel-body">
          <div v-if="!missions.length" class="ov-empty">Nincs aktív flotta mozgás</div>
          <div v-for="m in missions" :key="m.id" class="mission-row" :class="m.status">
            <div class="mis-type" :style="{ color: m.mission_type === 'attack' ? 'var(--accent2)' : 'var(--accent3)' }">
              {{ m.mission_type === 'spy' ? 'KÉMKEDÉS' : m.mission_type === 'attack' ? 'TÁMADÁS' : 'MISSZIÓ' }}
            </div>
            <div class="mis-info">
              <span class="mis-target">{{ m.target_name }}</span>
              <span class="mis-coords">{{ m.target_coords }}</span>
            </div>
            <div class="mis-right">
              <span class="mis-status-txt">{{ m.status === 'returning' ? 'Visszatér' : 'Útban' }}</span>
              <span class="mis-time">{{ formatTimeLeft(m.status === 'travelling' ? m.arrive_at : m.return_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Build Queue -->
      <div class="panel">
        <div class="panel-header"><h3>ÉPÍTÉSI SOR</h3></div>
        <div class="panel-body">
          <div v-if="!queue.length" class="ov-empty">{{ L.t('overview.noQueue') }}</div>
          <QueueItem v-for="q in queue" :key="q.id || q.item_id" :item="q" />
        </div>
      </div>

      <!-- AIKA AI chat -->
      <div class="panel">
        <div class="panel-header"><h3 style="color:#9b59b6">AIKA — TAKTIKAI ASSZISZTENS</h3></div>
        <div class="panel-body">
          <div class="chat-log" ref="chatLogEl">
            <div v-for="(msg, i) in aikaChatLog" :key="i" class="chat-bubble" :class="'cb-' + msg.role">
              <span v-if="msg.role === 'assistant'" class="cb-badge" style="color:#9b59b6">AIKA</span>
              <div class="cb-text">{{ msg.text }}</div>
            </div>
            <div v-if="aikaLoading" class="chat-bubble cb-assistant">
              <span class="cb-badge" style="color:#9b59b6">AIKA</span>
              <div class="cb-text cb-typing">● ● ●</div>
            </div>
          </div>
          <div class="chat-input-row">
            <input class="chat-input" v-model="aikaInput" :placeholder="L.t('overview.askAika')" @keydown.enter="sendToAika" :disabled="aikaLoading" />
            <button class="btn-primary btn-aika" @click="sendToAika" :disabled="aikaLoading">{{ L.t('overview.send') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Stats -->
    <div class="ov-right">

      <!-- Resource stats -->
      <div class="panel">
        <div class="panel-header"><h3>ERŐFORRÁSOK</h3></div>
        <div class="panel-body">
          <div class="res-stat-row" v-for="res in resourceStats" :key="res.key">
            <div class="rsr-top">
              <span class="rsr-sym" :style="{ color: res.color }">{{ res.sym }}</span>
              <span class="rsr-label">{{ res.label }}</span>
              <AnimCounter :value="res.value" :color="res.color" style="font-size:10px;font-weight:700" />
            </div>
            <div v-if="res.max" class="rsr-bar"><div class="rsr-bar-fill" :style="{ width: Math.min(100, res.value/res.max*100)+'%', background: res.color }" /></div>
            <div v-if="res.rate" class="rsr-rate">+{{ fmt(res.rate) }}/h</div>
          </div>
        </div>
      </div>

      <!-- Fleet summary -->
      <div class="panel" style="margin-top:10px">
        <div class="panel-header"><h3 style="color:var(--accent2)">FLOTTA</h3></div>
        <div class="panel-body">
          <div v-for="ship in fleet" :key="ship.id" class="stat-row">
            <span class="sr-label"><span :style="{ color: ship.color }">{{ ship.icon }}</span> {{ ship.name }}</span>
            <span class="sr-val" :style="{ color: ship.color }">{{ ship.count }}</span>
          </div>
          <div v-if="!fleet.length" class="ov-empty">Nincs flotta</div>
        </div>
      </div>

      <!-- Defense summary -->
      <div class="panel" style="margin-top:10px">
        <div class="panel-header"><h3 style="color:var(--accent4)">VÉDELEM</h3></div>
        <div class="panel-body">
          <div v-for="d in (game.defense || [])" :key="d.id" class="stat-row">
            <span class="sr-label">{{ d.icon }} {{ d.name }}</span>
            <span class="sr-val">{{ d.count }}</span>
          </div>
          <div v-if="!(game.defense?.length)" class="ov-empty">Nincs védelmi egység</div>
        </div>
      </div>

      <!-- World Events -->
      <div v-if="game.state?.worldEvents?.length" class="panel ov-event-card" style="margin-top:10px">
        <div v-for="event in game.state.worldEvents" :key="event.id" class="ov-world-event">
          <div class="ov-event-icon">{{ event.meta?.icon }}</div>
          <div>
            <div class="ov-event-title">{{ event.meta?.name?.[L.lang] }}</div>
            <div class="ov-event-desc">{{ event.meta?.desc?.[L.lang] }}</div>
            <div class="ov-event-time">⏳ {{ formatTimeLeft(event.expires_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
import { api }          from '@/api/client.js';
import { audio }        from '@/utils/botAudio.js';
import sdk              from '@/sdk.js';
import QueueItem        from '@/components/QueueItem.vue';
import PlanetCanvas     from '@/components/PlanetCanvas.vue';
import AnimCounter      from '@/components/AnimCounter.vue';

const game = useGameStore();
const L    = useLangStore();

const prodBuildings  = computed(() => game.prodBuildings);
const infraBuildings = computed(() => game.infraBuildings);
const buildings      = computed(() => game.buildings);
const resources      = computed(() => game.resources);
const rates          = computed(() => game.rates);
const fleet          = computed(() => game.fleet);
const score          = computed(() => game.score);
const queue          = computed(() => game.queue);
const activePlanet   = computed(() => game.activePlanet || { name: '—', coords: '[?:?:?]' });
const totalShips     = computed(() => fleet.value.reduce((s, f) => s + f.count, 0));

const PLANET_COLORS = { 1: '#1ac8e8', 2: '#e8b450', 3: '#607890' };
const planetColor = computed(() => {
  if (activePlanet.value.isMoon) return '#607890';
  return PLANET_COLORS[activePlanet.value.id] || '#1ac8e8';
});

const resourceStats = computed(() => [
  { key:'metal',      label:'FÉM',         sym:'◈', color:'var(--metal)',   value:resources.value.metal   || 0, rate:rates.value.metal,   max:game.storage?.metal },
  { key:'crystal',    label:'KRISTÁLY',    sym:'◆', color:'var(--crystal)', value:resources.value.crystal || 0, rate:rates.value.crystal, max:game.storage?.crystal },
  { key:'energy',     label:'ENERGIA',     sym:'⚡', color:'var(--energy)',  value:resources.value.energy  || 0, rate:rates.value.energy,  max:null },
  { key:'deus',       label:'DÉUSIUM',     sym:'◉', color:'var(--accent)',  value:resources.value.deus    || 0, rate:rates.value.deus,    max:game.storage?.deus },
  { key:'dm',         label:'DARK MATTER', sym:'●', color:'#9b59b6',        value:game.darkMatter         || 0, rate:null, max:null },
]);

const fmt = (n) => Math.floor(n || 0).toLocaleString('hu');
const formatTimeLeft = (ts) => {
  if (!ts) return '';
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'Megérkezett';
  return `${Math.floor(diff / 60)}:${String(diff % 60).padStart(2, '0')}`;
};

function specIcon(type) { return { mining:'⛏', military:'⚔', research:'🔬', trade:'📦' }[type] || '🌐'; }

function questLabel(q) {
  return { upgrade:'Fejlessz fel egy épületet', build:`Építs ${q.required} egységet`, mission:`Indíts ${q.required} küldetést`, donate:'Adományozz a szövetségnek' }[q.quest_type] || 'Napi küldetés';
}

// Fleet & missions
const missions  = ref([]);
const resolving = ref(false);
const quests    = ref([]);
async function loadMissions() { try { const d = await api.getMissions(); missions.value = d.missions || []; } catch {} }
async function loadQuests()   { try { const d = await api.get('/game/quests'); quests.value = d.quests || []; } catch {} }

async function claimQuest(qid) {
  try { await api.post(`/game/quests/claim/${qid}`); audio.success(); game.notify('Jutalom átvéve!', 'green'); await loadQuests(); await game.loadState(); }
  catch (e) { game.notify(`Hiba: ${e.message}`, 'red'); }
}
async function resolveMissions() {
  resolving.value = true;
  try { await api.resolveMissions(); await loadMissions(); await game.loadState(); game.notify('Flották frissítve', 'blue'); }
  catch (e) { game.notify(`❌ ${e.message}`, 'red'); }
  resolving.value = false;
}

// AIKA chat
const chatLogEl  = ref(null);
const aikaInput  = ref('');
const aikaLoading = ref(false);
const aikaChatLog = ref([{ role: 'assistant', text: '🤖 Üdv, Parancsnok! Kérdezz tőlem bármit a játékkal kapcsolatban.' }]);

async function sendToAika() {
  const msg = aikaInput.value.trim();
  if (!msg || aikaLoading.value) return;
  aikaInput.value = '';
  aikaChatLog.value.push({ role: 'user', text: msg });
  aikaLoading.value = true;
  try {
    const res = await fetch('/api/aika-chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sdk.getToken()}` },
      body: JSON.stringify({ message: msg, context: { resources: game.resources, rates: game.rates, score: game.score, buildingsCount: game.buildings.length, fleetTotal: totalShips.value } })
    });
    const data = await res.json();
    aikaChatLog.value.push({ role: 'assistant', text: res.ok ? (data.reply || 'Hiba.') : `⚠️ ${data.error || 'Ismeretlen hiba'}` });
  } catch { aikaChatLog.value.push({ role: 'assistant', text: '⚠️ Kapcsolati hiba.' }); }
  aikaLoading.value = false;
  await nextTick();
  if (chatLogEl.value) chatLogEl.value.scrollTop = chatLogEl.value.scrollHeight;
}

let timer;
onMounted(() => { loadMissions(); loadQuests(); timer = setInterval(() => { loadMissions(); loadQuests(); }, 10000); });
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.ov-grid{display:grid;grid-template-columns:200px 1fr 210px;gap:10px;align-items:start}
.ov-left-panel{position:sticky;top:140px}
.ov-right{position:sticky;top:140px;display:flex;flex-direction:column;gap:0}
.ov-center{display:flex;flex-direction:column;gap:10px}
.ov-scroll{max-height:calc(100vh - 200px);overflow-y:auto}
.ov-section-label{font-family:'Orbitron',sans-serif;font-size:8px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border)}
.ov-empty{font-size:11px;color:var(--text-dim);padding:8px 0;text-align:center}

/* Building list rows */
.bld-row{display:flex;align-items:center;gap:8px;padding:5px 2px;border-bottom:1px solid rgba(255,255,255,.03)}
.bld-row:last-child{border:none}
.bld-row-sym{font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;width:18px;text-align:center;flex-shrink:0}
.bld-row-name{font-size:11px;color:var(--text);flex:1}
.bld-row-lv{font-family:'Space Mono',monospace;font-size:9px;font-weight:700}

/* Planet panel */
.planet-panel{display:flex;align-items:center;gap:20px;padding:18px 16px;overflow:hidden;position:relative}
.planet-panel::after{content:'';position:absolute;right:0;top:0;bottom:0;width:200px;background:radial-gradient(ellipse at right,rgba(26,200,232,.04),transparent 70%);pointer-events:none}
.planet-info{flex:1}
.planet-name-big{font-family:'Orbitron',sans-serif;font-size:16px;font-weight:900;color:var(--text-bright)}
.planet-coord-big{font-family:'Space Mono',monospace;font-size:10px;color:var(--accent);margin:3px 0 8px;letter-spacing:2px}
.planet-spec-tag{display:inline-flex;align-items:center;gap:4px;font-family:'Orbitron',sans-serif;font-size:8px;font-weight:700;padding:2px 8px;border-radius:2px;margin-bottom:8px}
.planet-spec-tag.mining{background:rgba(240,160,48,.1);border:1px solid rgba(240,160,48,.3);color:#f0a030}
.planet-spec-tag.military{background:rgba(232,58,106,.1);border:1px solid rgba(232,58,106,.3);color:var(--accent2)}
.planet-spec-tag.research{background:rgba(58,232,138,.1);border:1px solid rgba(58,232,138,.3);color:var(--accent3)}
.planet-spec-tag.trade{background:rgba(58,232,138,.1);border:1px solid rgba(58,232,138,.3);color:var(--accent3)}
.planet-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}
.psg-item{background:rgba(0,0,0,.25);border:1px solid var(--border);border-radius:3px;padding:5px 8px}
.psg-label{font-family:'Orbitron',sans-serif;font-size:7px;color:var(--text-dim);letter-spacing:1px}
.psg-val{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:var(--text-bright);margin-top:1px}

/* Quests */
.quest-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.03)}
.quest-row:last-child{border:none}
.quest-row.q-done .q-desc{color:var(--accent3)}
.quest-row.q-claimed{opacity:.45}
.q-main{flex:1;min-width:0}
.q-desc{font-size:11px;color:var(--text);margin-bottom:5px}
.q-prog-row{display:flex;align-items:center;gap:8px}
.q-bar{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.q-fill{height:100%;border-radius:2px;transition:width .4s}
.q-cnt{font-family:'Space Mono',monospace;font-size:8px;color:var(--text-dim);flex-shrink:0}
.q-side{flex-shrink:0}
.btn-claim{font-family:'Orbitron',sans-serif;font-size:8px;font-weight:700;letter-spacing:1px;padding:3px 10px;border-radius:3px;cursor:pointer;background:var(--accent3);border:none;color:#050e12;transition:all .18s}
.btn-claim:hover{filter:brightness(1.12);box-shadow:0 0 10px rgba(58,232,138,.4)}
.q-claimed-tag{font-size:9px;color:var(--accent3);font-family:'Orbitron',sans-serif}
.q-reward{font-family:'Space Mono',monospace;font-size:9px;color:var(--accent4)}

/* Missions */
.mission-row{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid var(--border);border-radius:3px;background:rgba(0,0,0,.2);margin-bottom:6px}
.mission-row:last-child{margin-bottom:0}
.mission-row.returning{border-color:rgba(58,232,138,.25);background:rgba(58,232,138,.04);animation:returning-pulse 1.5s ease-in-out infinite}
.mis-type{font-family:'Orbitron',sans-serif;font-size:7px;font-weight:700;letter-spacing:1px;flex-shrink:0;width:62px}
.mis-info{flex:1;min-width:0}
.mis-target{font-size:11px;color:var(--text-bright);font-weight:600}
.mis-coords{font-family:'Space Mono',monospace;font-size:9px;color:var(--text-dim);margin-left:6px}
.mis-right{text-align:right;flex-shrink:0}
.mis-status-txt{display:block;font-size:9px;color:var(--text-dim)}
.mis-time{font-family:'Space Mono',monospace;font-size:11px;color:var(--accent);font-weight:700}

/* AIKA chat */
.chat-log{max-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:10px;padding-right:4px;scrollbar-width:thin;scrollbar-color:var(--border-glow) transparent}
.chat-bubble{display:flex;flex-direction:column;gap:3px}
.cb-assistant{align-items:flex-start}
.cb-user{align-items:flex-end}
.cb-badge{font-family:'Orbitron',sans-serif;font-size:7px;letter-spacing:1px;margin-bottom:2px}
.cb-text{font-size:11px;line-height:1.5;padding:7px 10px;border-radius:3px;max-width:90%}
.cb-assistant .cb-text{background:rgba(155,89,182,.08);border:1px solid rgba(155,89,182,.2);color:var(--text)}
.cb-user .cb-text{background:rgba(26,200,232,.07);border:1px solid rgba(26,200,232,.15);color:var(--text-dim)}
.cb-typing{letter-spacing:4px;animation:typing-pulse 1.2s ease-in-out infinite}
@keyframes typing-pulse{0%,100%{opacity:.3}50%{opacity:1}}
.chat-input-row{display:flex;gap:6px}
.chat-input{flex:1;background:rgba(0,0,0,.4);border:1px solid var(--border);color:var(--text);padding:6px 10px;font-size:11px;border-radius:3px;font-family:'Exo 2',sans-serif;outline:none;transition:border-color .2s}
.chat-input:focus{border-color:rgba(155,89,182,.5)}
.chat-input::placeholder{color:var(--text-dim)}
.btn-aika{border-color:rgba(155,89,182,.5)!important;color:#9b59b6!important;background:rgba(155,89,182,.1)!important}

/* Resource stats */
.res-stat-row{padding:7px 0;border-bottom:1px solid rgba(255,255,255,.03)}
.res-stat-row:last-child{border:none}
.rsr-top{display:flex;align-items:center;gap:6px;margin-bottom:4px}
.rsr-sym{font-size:11px;flex-shrink:0}
.rsr-label{font-family:'Orbitron',sans-serif;font-size:7px;letter-spacing:1px;color:var(--text-dim);flex:1}
.rsr-bar{height:2px;background:rgba(255,255,255,.06);border-radius:1px;overflow:hidden;margin-top:2px}
.rsr-bar-fill{height:100%;border-radius:1px;transition:width .4s}
.rsr-rate{font-size:9px;color:var(--text-dim);margin-top:3px;font-family:'Space Mono',monospace}

/* Stat row */
.stat-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.025);font-size:11px}
.stat-row:last-child{border:none}
.sr-label{color:var(--text);font-size:10px}
.sr-val{font-family:'Space Mono',monospace;font-size:10px;font-weight:700}

/* World event */
.ov-event-card{padding:12px!important;background:rgba(155,89,182,.06)!important;border-color:rgba(155,89,182,.2)!important}
.ov-world-event{display:flex;align-items:flex-start;gap:12px}
.ov-event-icon{font-size:26px;flex-shrink:0}
.ov-event-title{font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;color:#bb86fc;letter-spacing:1px}
.ov-event-desc{font-size:10px;color:var(--text);margin:3px 0}
.ov-event-time{font-size:9px;color:var(--text-dim);font-family:'Space Mono',monospace}

@media(max-width:900px){.ov-grid{grid-template-columns:1fr}}
</style>
