<template>
  <div class="alliance-layout">
    <!-- NO ALLIANCE: Create or Join -->
    <div v-if="!allianceStore.inAlliance" class="no-alliance-view">
      <div class="panel hero-panel">
        <div class="panel-body">
          <div class="hero-content">
            <span class="hero-icon">🏛️</span>
            <h2>Szövetségi Központ</h2>
            <p>Csatlakozz egy létező szövetséghez a galaxisban, vagy alapíts egyet te magad!</p>
          </div>
        </div>
      </div>

      <div class="no-alliance-grid">
        <div class="panel create-panel">
          <div class="panel-header"><h3>🆕 Új Szövetség</h3></div>
          <div class="panel-body">
            <div class="form-group">
              <label>Szövetség neve</label>
              <input v-model="form.name" :placeholder="L.t('alliance.namePh')" class="input" />
            </div>
            <div class="form-group">
              <label>Rövidítés (TAG)</label>
              <input v-model="form.tag" :placeholder="L.t('alliance.tagPh')" class="input" maxlength="5" />
            </div>
            <div class="form-group">
              <label>Leírás</label>
              <textarea v-model="form.desc" :placeholder="L.t('alliance.descPh')" class="input" rows="3"></textarea>
            </div>
            <button class="btn-primary full-width" @click="createAlliance" :disabled="busy">ALAPÍTÁS</button>
          </div>
        </div>

        <div class="panel list-panel">
          <div class="panel-header"><h3>🔭 Aktív Szövetségek</h3></div>
          <div class="panel-body no-padding">
            <div v-if="allianceStore.loading" class="loading-box">Betöltés...</div>
            <div v-else class="table-scroll">
              <table class="alliance-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Név</th>
                    <th>Tagok</th>
                    <th style="text-align:right;">Akció</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in allianceStore.list" :key="a.id">
                    <td class="a-tag">[{{ a.tag }}]</td>
                    <td class="a-name">{{ a.name }}</td>
                    <td>{{ a.member_count }}</td>
                    <td style="text-align:right;">
                      <button class="btn-xs" @click="joinAlliance(a.id)" :disabled="busy">Csatlakozás</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- IN ALLIANCE: Dashboard -->
    <div v-else class="alliance-active-view">
      <header class="alliance-header">
        <div class="a-title-row">
          <div class="a-identity">
            <span class="a-tag">[{{ allianceStore.alliance.tag }}]</span>
            <h2 class="a-name">{{ allianceStore.alliance.name }}</h2>
          </div>
          <div class="a-level-badge">Lvl {{ allianceStore.alliance.level }}</div>
        </div>
        
        <nav class="a-tabs">
          <button v-for="t in tabs" :key="t.id" :class="{ active: activeTab === t.id }" @click="activeTab = t.id" class="tab-btn">
            <span class="tab-icon">{{ t.icon }}</span>
            <span class="tab-label">{{ t.label }}</span>
          </button>
        </nav>
      </header>

      <div class="alliance-content">
        <!-- OVERVIEW TAB -->
        <div v-if="activeTab === 'overview'" class="tab-content overview-grid">
          <div class="panel stats-panel">
            <div class="panel-header"><h3>Információk</h3></div>
            <div class="panel-body">
              <div class="exp-section">
                <div class="exp-info">
                  <span class="label">Fejlődés (Lvl {{ allianceStore.alliance.level }})</span>
                  <span class="val">{{ allianceStore.alliance.exp }} / {{ nextLevelExp }} EXP</span>
                </div>
                <div class="exp-bar-wrap">
                  <div class="exp-bar" :style="{ width: expProgress + '%' }"></div>
                </div>
              </div>

              <div class="bonuses-box">
                <h4>Aktív Bónuszok</h4>
                <div class="bonus-row">⚙️ Termelés: +{{ allianceStore.alliance.level }}%</div>
                <div class="bonus-row">🚀 Sebesség: +{{ allianceStore.alliance.level }}%</div>
                <div class="bonus-row">🛡️ Pajzsok: +{{ allianceStore.alliance.level }}%</div>
              </div>

              <p class="description-text">{{ allianceStore.alliance.description || 'Nincs szövetségi leírás.' }}</p>
              
              <div class="alliance-footer-actions">
                <button class="btn-danger-outline" @click="leaveAlliance">Szövetség Elhagyása</button>
              </div>
            </div>
          </div>

          <div class="panel members-mini-panel">
            <div class="panel-header"><h3>Online Tagok</h3></div>
            <div class="panel-body no-padding">
              <div class="member-list-mini">
                <div v-for="m in sortedMembers" :key="m.user_id" class="m-row">
                  <span class="m-role-dot" :class="m.role"></span>
                  <span class="m-name">{{ m.username }}</span>
                  <span class="m-score">{{ L.n(m.score) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MEMBERS TAB -->
        <div v-if="activeTab === 'members'" class="tab-content">
          <div class="panel">
            <div class="panel-header"><h3>Szövetség Tagjai</h3></div>
            <div class="panel-body no-padding">
              <table class="full-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Rang</th>
                    <th>Pontszám</th>
                    <th v-if="canManage" style="text-align:right">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in allianceStore.members" :key="m.user_id">
                    <td class="player-link" @click="openProfile(m.username)">{{ m.username }}</td>
                    <td><span class="role-badge" :class="m.role">{{ L.t('alliance.roles.' + m.role) }}</span></td>
                    <td class="score-val">{{ L.n(m.score) }}</td>
                    <td v-if="canManage" style="text-align:right;">
                      <div class="mgmt-group" v-if="m.user_id !== auth.userId">
                        <button v-if="m.role === 'member'" class="btn-icon-xs" @click="promote(m.user_id)" title="Előléptetés">↑</button>
                        <button v-if="m.role === 'officer'" class="btn-icon-xs" @click="demote(m.user_id)" title="Lefokozás">↓</button>
                        <button class="btn-icon-xs red" @click="kick(m.user_id)" title="Eltávolítás">✕</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- BANK TAB -->
        <div v-if="activeTab === 'bank'" class="tab-content bank-grid">
          <div class="panel vault-panel">
            <div class="panel-header"><h3>Szövetségi Széf</h3></div>
            <div class="panel-body">
              <div class="vault-items">
                <div class="v-item metal">
                  <span class="v-icon">⚙️</span>
                  <div class="v-details"><span class="v-val">{{ L.n(allianceStore.alliance.vault?.metal || 0) }}</span><span class="v-label">Fém</span></div>
                </div>
                <div class="v-item crystal">
                  <span class="v-icon">💎</span>
                  <div class="v-details"><span class="v-val">{{ L.n(allianceStore.alliance.vault?.crystal || 0) }}</span><span class="v-label">Kristály</span></div>
                </div>
                <div class="v-item deus">
                  <span class="v-icon">🔮</span>
                  <div class="v-details"><span class="v-val">{{ L.n(allianceStore.alliance.vault?.deus || 0) }}</span><span class="v-label">Déusium</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel donate-panel">
            <div class="panel-header"><h3>Adományozás</h3></div>
            <div class="panel-body">
              <p class="hint">Az adományozott nyersanyagokért a szövetség EXP-et kap.</p>
              <div class="donate-form-new">
                <div class="input-row">
                  <div class="input-field"><label>Fém</label><input type="number" v-model.number="donate.metal" /></div>
                  <div class="input-field"><label>Kristály</label><input type="number" v-model.number="donate.crystal" /></div>
                  <div class="input-field"><label>Déusium</label><input type="number" v-model.number="donate.deus" /></div>
                </div>
                <button class="btn-primary full-width" @click="doDonate" :disabled="busy">ADOMÁNYOZÁS</button>
              </div>
            </div>
          </div>
        </div>

        <!-- TERRITORY TAB -->
        <div v-if="activeTab === 'territory'" class="tab-content territory-view">
          <div class="panel">
            <div class="panel-header"><h3>🗺️ Szövetségi Területek</h3></div>
            <div class="panel-body">
              <div class="territory-stats">
                <div class="t-stat">
                  <span class="t-stat-val">{{ totalTerritory }}</span>
                  <span class="t-stat-label">Irányított rendszer</span>
                </div>
                <div class="t-stat">
                  <span class="t-stat-val">+{{ territory.length > 0 ? Math.round(territory.reduce((s, t) => s + t.bonus_value, 0) / territory.length * 100) : 0 }}%</span>
                  <span class="t-stat-label">Átlag termelés bónusz</span>
                </div>
                <div class="t-stat">
                  <span class="t-stat-val">+10%</span>
                  <span class="t-stat-label">Flotta sebesség (saját terület)</span>
                </div>
              </div>

              <div v-if="territory.length === 0" class="empty-territory">
                <div class="peace-icon">🗺️</div>
                <p>Még nincs irányított naprendszer. Több bolygót kell birtokolni egy rendszerben a területfoglaláshoz.</p>
              </div>
              <div v-else class="territory-list">
                <div v-for="t in territory" :key="`${t.galaxy}:${t.system_num}`" class="territory-item">
                  <div class="t-coords">[{{ t.galaxy }}:{{ t.system_num }}]</div>
                  <div class="t-info">
                    <span class="t-strength">Erő: {{ t.claim_strength }}/5</span>
                    <span class="t-bonus">+{{ Math.round(t.bonus_value * 100) }}% termelés</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- WARS TAB -->
        <div v-if="activeTab === 'wars'" class="tab-content wars-view">
          <!-- Active Wars -->
          <div class="panel">
            <div class="panel-header"><h3>⚔️ {{ L.t('alliance.war.active') }}</h3></div>
            <div class="panel-body">
              <div v-if="wars.length === 0" class="empty-war">
                <div class="peace-icon">🕊️</div>
                <p>{{ L.t('alliance.war.noActive') }}</p>
              </div>
              <div class="war-list-new">
                <div v-for="w in wars" :key="w.id" class="war-item" @click="selectWar(w)">
                  <div class="war-meta">
                    <span class="war-goal-badge">{{ warGoalLabel(w) }}</span>
                    <span class="war-timer" v-if="w.ends_at">{{ formatTimeLeft(w.ends_at) }}</span>
                  </div>
                  <div class="war-battlefield">
                    <div class="side att">
                      <div class="s-tag">[{{ w.attacker_tag }}]</div>
                      <div class="s-name">{{ w.attacker_name }}</div>
                      <div class="s-pts">{{ L.n(w.attacker_score) }} PT</div>
                    </div>
                    <div class="war-vs">{{ L.t('alliance.war.vs') }}</div>
                    <div class="side def">
                      <div class="s-tag">[{{ w.defender_tag }}]</div>
                      <div class="s-name">{{ w.defender_name }}</div>
                      <div class="s-pts">{{ L.n(w.defender_score) }} PT</div>
                    </div>
                  </div>
                  <div class="war-progress-bar" v-if="w.goal_type === 'score'">
                    <div class="wp-att" :style="{ width: warProgressPct(w, 'attacker') + '%' }"></div>
                    <div class="wp-def" :style="{ width: warProgressPct(w, 'defender') + '%' }"></div>
                  </div>
                  <div v-if="isLeader && (w.attacker_id === allianceStore.alliance?.id || w.defender_id === allianceStore.alliance?.id)" class="war-surrender-row">
                    <button class="btn-danger-outline btn-sm" @click.stop="surrenderWar(w.id)" :disabled="busy">{{ L.t('alliance.war.surrender') }}</button>
                  </div>
                </div>
              </div>

              <!-- War Stats Panel (selected war) -->
              <div v-if="selectedWarStats" class="war-stats-panel">
                <div class="panel-header"><h3>{{ L.t('alliance.war.stats') }}</h3></div>
                <div class="war-goal-info">
                  <span class="wg-label">{{ L.t('alliance.war.goal') }}:</span>
                  <span class="wg-value">{{ warGoalLabel(selectedWar) }}</span>
                  <span class="wg-progress" v-if="selectedWarStats.goalProgress">
                    {{ selectedWarStats.goalProgress.attacker }} / {{ selectedWarStats.goalProgress.target }}
                    {{ L.t('alliance.war.vs') }}
                    {{ selectedWarStats.goalProgress.defender }} / {{ selectedWarStats.goalProgress.target }}
                  </span>
                </div>
                <h4>{{ L.t('alliance.war.contributions') }}</h4>
                <table class="full-table war-contrib-table">
                  <thead>
                    <tr>
                      <th>{{ L.t('alliance.war.player') }}</th>
                      <th>{{ L.t('alliance.war.damage') }}</th>
                      <th>{{ L.t('alliance.war.raided') }}</th>
                      <th>{{ L.t('alliance.war.battlesWon') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in allContributions" :key="c.id" :class="{ 'own-side': c.alliance_id === allianceStore.alliance?.id }">
                      <td class="player-link">{{ c.username }}</td>
                      <td>{{ L.n(c.damage_dealt) }}</td>
                      <td>{{ L.n(c.resources_raided) }}</td>
                      <td>{{ c.battles_won }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Declare War -->
              <div v-if="isLeader" class="war-declare-section">
                <h4>{{ L.t('alliance.war.declare') }}</h4>
                <div class="declare-row">
                  <select v-model="targetAllianceId" class="input">
                    <option disabled value="">{{ L.t('alliance.war.selectTarget') }}</option>
                    <option v-for="a in otherAlliances" :key="a.id" :value="a.id">[{{ a.tag }}] {{ a.name }}</option>
                  </select>
                  <button class="btn-danger" @click="declareWar" :disabled="!targetAllianceId || busy">{{ L.t('alliance.war.declare') }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- War History -->
          <div class="panel" style="margin-top: 20px;">
            <div class="panel-header"><h3>📜 {{ L.t('alliance.war.history') }}</h3></div>
            <div class="panel-body">
              <div v-if="warHistory.length === 0" class="empty-war">
                <p>{{ L.t('alliance.war.noHistory') }}</p>
              </div>
              <div class="war-history-list">
                <div v-for="w in warHistory" :key="w.id" class="war-history-item">
                  <div class="wh-result" :class="{ won: w.winner_id === allianceStore.alliance?.id, lost: w.winner_id !== allianceStore.alliance?.id }">
                    {{ w.winner_id === allianceStore.alliance?.id ? L.t('alliance.war.victory') : L.t('alliance.war.defeat') }}
                  </div>
                  <div class="wh-info">
                    <span class="wh-tags">[{{ w.attacker_tag }}] {{ L.t('alliance.war.vs') }} [{{ w.defender_tag }}]</span>
                    <span class="wh-score">{{ L.n(w.attacker_score) }} — {{ L.n(w.defender_score) }}</span>
                  </div>
                  <div class="wh-dates">
                    {{ new Date(w.started_at * 1000).toLocaleDateString() }} — {{ w.ended_at ? new Date(w.ended_at * 1000).toLocaleDateString() : '?' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAllianceStore } from '@/stores/alliance.js';
import { useAuthStore } from '@/stores/auth.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';

const allianceStore = useAllianceStore();
const auth = useAuthStore();
const L = useLangStore();

const activeTab = ref('overview');
const busy = ref(false);
const inviteUser = ref('');
const wars = ref([]);
const warHistory = ref([]);
const targetAllianceId = ref('');
const territory = ref([]);
const totalTerritory = ref(0);
const selectedWar = ref(null);
const selectedWarStats = ref(null);

const tabs = [
  { id: 'overview', label: 'Áttekintés', icon: '🏛️' },
  { id: 'members',  label: 'Tagok',      icon: '👥' },
  { id: 'territory', label: 'Terület',   icon: '🗺️' },
  { id: 'bank',      label: 'Bank',       icon: '🏦' },
  { id: 'wars',      label: 'Háború',     icon: '⚔️' }
];

const form = ref({ name: '', tag: '', desc: '' });
const donate = ref({ metal: 10000, crystal: 5000, deus: 0 });

const expProgress = computed(() => {
  const a = allianceStore.alliance;
  if (!a) return 0;
  const next = a.level * 1000;
  return Math.min(100, (a.exp / next) * 100);
});

const nextLevelExp = computed(() => (allianceStore.alliance?.level || 1) * 1000);
const canManage = computed(() => allianceStore.myRole === 'leader' || allianceStore.myRole === 'officer');
const isLeader = computed(() => allianceStore.myRole === 'leader');
const sortedMembers = computed(() => [...allianceStore.members].sort((a,b) => b.score - a.score));
const allContributions = computed(() => {
  if (!selectedWarStats.value) return [];
  return [...(selectedWarStats.value.attackerContribs || []), ...(selectedWarStats.value.defenderContribs || [])];
});
const otherAlliances = computed(() => allianceStore.list.filter(a => a.id !== allianceStore.alliance?.id));

async function loadWars() {
    try {
      const data = await api.getActiveWars();
      wars.value = data.wars || [];
    } catch {}
}

async function loadWarHistory() {
    try {
      const data = await api.getWarHistory();
      warHistory.value = data.wars || [];
    } catch {}
}

async function loadTerritory() {
    try {
      const data = await api.getAllianceTerritory();
      territory.value = data.territory || [];
      totalTerritory.value = data.total_systems || 0;
    } catch {}
}

async function selectWar(war) {
    selectedWar.value = war;
    try {
      const data = await api.getWarStats(war.id);
      selectedWarStats.value = data;
    } catch (e) {
      selectedWarStats.value = null;
    }
}

async function declareWar() {
    if (!confirm(L.t('alliance.war.declareConfirm'))) return;
    busy.value = true;
    try {
        await api.declareWar(targetAllianceId.value);
        targetAllianceId.value = '';
        await loadWars();
    } catch (e) { alert(e.message); }
    busy.value = false;
}

async function surrenderWar(warId) {
    if (!confirm(L.t('alliance.war.surrenderConfirm'))) return;
    busy.value = true;
    try {
        await api.surrenderWar(warId);
        selectedWar.value = null;
        selectedWarStats.value = null;
        await loadWars();
        await loadWarHistory();
    } catch (e) { alert(e.message); }
    busy.value = false;
}

function warGoalLabel(war) {
    if (!war) return '';
    const target = war.goal_target || 0;
    if (war.goal_type === 'score') return L.t('alliance.war.goalScore').replace('{target}', L.n(target));
    if (war.goal_type === 'sectors') return L.t('alliance.war.goalSectors').replace('{target}', target);
    if (war.goal_type === 'battles') return L.t('alliance.war.goalBattles').replace('{target}', target);
    return war.goal_type;
}

function warProgressPct(war, side) {
    if (!war || !war.goal_target) return 0;
    const score = side === 'attacker' ? war.attacker_score : war.defender_score;
    return Math.min(100, Math.floor((score / war.goal_target) * 100));
}

function formatTimeLeft(endsAt) {
    const now = Math.floor(Date.now() / 1000);
    const diff = endsAt - now;
    if (diff <= 0) return L.t('alliance.war.expired');
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    if (days > 0) return `${days}${L.t('time.day')} ${hours}${L.t('time.hour')}`;
    if (hours > 0) return `${hours}${L.t('time.hour')} ${mins}${L.t('time.min')}`;
    return `${mins}${L.t('time.min')}`;
}

async function createAlliance() {
  if (!form.value.name || !form.value.tag) return alert('Név és TAG kötelező!');
  busy.value = true;
  try { await allianceStore.create(form.value.name, form.value.tag, form.value.desc); } catch (e) { alert(e.message); }
  busy.value = false;
}

async function joinAlliance(id) {
  busy.value = true;
  try { await allianceStore.join(id); } catch (e) { alert(e.message); }
  busy.value = false;
}

async function leaveAlliance() {
  if (!confirm(L.t('alliance.leaveConfirm') || 'Biztosan kilépsz?')) return;
  await allianceStore.leave();
}

async function promote(uid) { await api.post('/alliance/promote', { targetUserId: uid, role: 'officer' }); await allianceStore.load(); }
async function demote(uid)  { await api.post('/alliance/promote', { targetUserId: uid, role: 'member' }); await allianceStore.load(); }
async function kick(uid)    { if (!confirm(L.t('alliance.kickConfirm') || 'Biztosan eltávolítod?')) return; await api.post('/alliance/kick', { targetUserId: uid }); await allianceStore.load(); }

async function doDonate() {
  if (donate.value.metal < 0 || donate.value.crystal < 0 || donate.value.deus < 0) return;
  busy.value = true;
  try { await allianceStore.donate(donate.value.metal, donate.value.crystal, donate.value.deus); donate.value = { metal:0, crystal:0, deus:0 }; } catch (e) { alert(e.message); }
  busy.value = false;
}

onMounted(() => {
    allianceStore.load();
    loadWars();
    loadWarHistory();
    loadTerritory();
});
</script>

<style scoped>
.alliance-layout { max-width: 1000px; margin: 0 auto; color: var(--text); }

/* --- Hero View --- */
.hero-panel { background: linear-gradient(135deg, rgba(0,200,255,0.1) 0%, transparent 100%); margin-bottom: 20px; text-align: center; border-color: var(--accent); }
.hero-content { padding: 30px; }
.hero-icon { font-size: 48px; display: block; margin-bottom: 10px; }
.hero-content h2 { font-family: 'Orbitron', sans-serif; color: var(--text-bright); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
.hero-content p { color: var(--text-dim); font-size: 14px; }

.no-alliance-grid { display: grid; grid-template-columns: 350px 1fr; gap: 20px; }
@media (max-width: 800px) { .no-alliance-grid { grid-template-columns: 1fr; } }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 11px; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; letter-spacing: 1px; }
.input { width: 100%; background: #000; border: 1px solid var(--border); color: #fff; padding: 10px; border-radius: 4px; font-family: 'Exo 2', sans-serif; }
.input:focus { border-color: var(--accent); box-shadow: 0 0 10px rgba(0,200,255,0.2); }

.loading-box { padding: 40px; text-align: center; color: var(--text-dim); }
.table-scroll { max-height: 400px; overflow-y: auto; }
.alliance-table { width: 100%; border-collapse: collapse; }
.alliance-table th { position: sticky; top: 0; background: var(--bg-panel); padding: 12px; font-size: 10px; text-transform: uppercase; color: var(--text-dim); border-bottom: 1px solid var(--border); text-align: left; }
.alliance-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.a-tag { color: var(--accent); font-family: 'Orbitron', sans-serif; font-weight: bold; }
.a-name { color: var(--text-bright); font-weight: 600; }

/* --- Active Dashboard --- */
.alliance-header { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
.a-title-row { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255,255,255,0.02); }
.a-identity { display: flex; align-items: center; gap: 15px; }
.a-identity .a-tag { font-size: 24px; color: var(--accent); text-shadow: 0 0 15px rgba(0,200,255,0.4); }
.a-identity .a-name { font-family: 'Orbitron', sans-serif; font-size: 20px; margin: 0; }
.a-level-badge { background: var(--accent-gradient); color: #000; padding: 4px 12px; border-radius: 20px; font-weight: 900; font-family: 'Orbitron', sans-serif; font-size: 12px; }

.a-tabs { display: flex; border-top: 1px solid var(--border); }
.tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; background: none; border: none; color: var(--text-dim); cursor: pointer; transition: all 0.2s; border-bottom: 3px solid transparent; }
.tab-btn:hover { color: #fff; background: rgba(255,255,255,0.02); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); background: rgba(0,200,255,0.05); }
.tab-icon { font-size: 18px; }
.tab-label { font-family: 'Orbitron', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }

.tab-content { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Overview */
.overview-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
@media (max-width: 850px) { .overview-grid { grid-template-columns: 1fr; } }

.exp-section { margin-bottom: 25px; }
.exp-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
.exp-bar-wrap { height: 10px; background: #000; border-radius: 5px; border: 1px solid var(--border); overflow: hidden; }
.exp-bar { height: 100%; background: linear-gradient(90deg, var(--accent) 0%, #00ffcc 100%); box-shadow: 0 0 10px var(--accent); }

.bonuses-box { background: rgba(0,200,255,0.05); border: 1px solid rgba(0,200,255,0.1); border-radius: 8px; padding: 15px; margin-bottom: 20px; }
.bonuses-box h4 { font-size: 10px; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; letter-spacing: 1px; }
.bonus-row { font-size: 13px; color: var(--text-bright); margin-bottom: 6px; }

.description-text { line-height: 1.6; font-size: 14px; color: var(--text); background: rgba(0,0,0,0.2); padding: 15px; border-radius: 6px; border: 1px solid var(--border); }

.member-list-mini { display: flex; flex-direction: column; }
.m-row { display: flex; align-items: center; padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 12px; }
.m-role-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; background: #fff; }
.m-role-dot.leader { background: gold; box-shadow: 0 0 8px gold; }
.m-role-dot.officer { background: var(--accent); box-shadow: 0 0 8px var(--accent); }
.m-name { flex: 1; font-weight: 600; }
.m-score { color: var(--text-dim); font-family: 'Orbitron', sans-serif; font-size: 10px; }

/* Members Full Table */
.full-table { width: 100%; border-collapse: collapse; }
.full-table th { text-align: left; padding: 15px; font-size: 10px; text-transform: uppercase; color: var(--text-dim); border-bottom: 1px solid var(--border); }
.full-table td { padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.player-link { color: var(--accent); font-weight: bold; cursor: pointer; }
.role-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-weight: bold; }
.role-badge.leader { background: rgba(255,215,0,0.1); color: gold; border: 1px solid gold; }
.role-badge.officer { background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid var(--accent); }
.role-badge.member { color: var(--text-dim); border: 1px solid var(--border); }

/* Bank */
.bank-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 700px) { .bank-grid { grid-template-columns: 1fr; } }

.vault-items { display: grid; grid-template-columns: 1fr; gap: 15px; }
.v-item { display: flex; align-items: center; gap: 20px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 10px; border-left: 4px solid var(--border); }
.v-item.metal { border-left-color: var(--metal); }
.v-item.crystal { border-left-color: var(--crystal); }
.v-item.deus { border-left-color: var(--accent); }
.v-icon { font-size: 32px; }
.v-val { display: block; font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 900; color: #fff; }
.v-label { font-size: 10px; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px; }

.donate-form-new .input-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.input-field label { display: block; font-size: 9px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 5px; }
.input-field input { width: 100%; background: #000; border: 1px solid var(--border); color: #fff; padding: 8px; border-radius: 4px; font-family: 'Orbitron', sans-serif; }

/* Wars */
.war-item { background: linear-gradient(90deg, rgba(255,58,122,0.1) 0%, transparent 100%); border: 1px solid rgba(255,58,122,0.3); border-radius: 8px; padding: 25px; margin-bottom: 20px; position: relative; cursor: pointer; transition: border-color 0.2s; }
.war-item:hover { border-color: rgba(255,58,122,0.6); }
.war-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 10px; text-transform: uppercase; }
.war-goal-badge { background: rgba(255,58,122,0.15); color: var(--accent2); padding: 3px 10px; border-radius: 4px; font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 0.5px; border: 1px solid rgba(255,58,122,0.3); }
.war-timer { color: var(--accent); font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700; }
.war-battlefield { display: flex; align-items: center; justify-content: center; gap: 40px; }
.war-vs { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; color: #fff; opacity: 0.2; }
.side { text-align: center; }
.s-tag { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; color: var(--accent2); text-shadow: 0 0 20px rgba(255,58,122,0.4); }
.s-name { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
.s-pts { font-size: 16px; font-weight: 800; color: #fff; margin-top: 5px; }

.war-progress-bar { display: flex; height: 6px; background: rgba(0,0,0,0.4); border-radius: 3px; overflow: hidden; margin-top: 15px; gap: 2px; }
.wp-att { background: linear-gradient(90deg, var(--accent2), #ff7eb3); height: 100%; border-radius: 3px; transition: width 0.5s; }
.wp-def { background: linear-gradient(90deg, var(--accent), #00ffcc); height: 100%; border-radius: 3px; transition: width 0.5s; margin-left: auto; }

.war-surrender-row { margin-top: 12px; text-align: right; }
.btn-sm { font-size: 10px; padding: 5px 12px; }

/* War Stats */
.war-stats-panel { margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border); }
.war-goal-info { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
.wg-label { font-size: 10px; text-transform: uppercase; color: var(--text-dim); letter-spacing: 1px; }
.wg-value { color: var(--accent2); font-weight: 700; font-size: 13px; }
.wg-progress { font-family: 'Orbitron', sans-serif; font-size: 12px; color: var(--accent); margin-left: auto; }

.war-contrib-table .own-side { background: rgba(0,200,255,0.05); }

/* War History */
.war-history-list { display: flex; flex-direction: column; gap: 10px; }
.war-history-item { display: flex; align-items: center; gap: 15px; padding: 12px 15px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; }
.wh-result { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; min-width: 80px; text-align: center; }
.wh-result.won { background: rgba(0,255,100,0.1); color: #0f6; border: 1px solid rgba(0,255,100,0.3); }
.wh-result.lost { background: rgba(255,58,122,0.1); color: var(--accent2); border: 1px solid rgba(255,58,122,0.3); }
.wh-info { flex: 1; }
.wh-tags { display: block; font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; color: var(--text-bright); }
.wh-score { display: block; font-size: 11px; color: var(--text-dim); margin-top: 3px; }
.wh-dates { font-size: 10px; color: var(--text-dim); white-space: nowrap; }

.empty-war { padding: 50px; text-align: center; color: var(--text-dim); }
.peace-icon { font-size: 48px; margin-bottom: 15px; opacity: 0.5; }

.war-declare-section { margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border); }
.declare-row { display: flex; gap: 10px; margin-top: 15px; }

/* Territory */
.territory-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
.t-stat { text-align: center; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid var(--border); }
.t-stat-val { display: block; font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 900; color: var(--accent); }
.t-stat-label { display: block; font-size: 10px; text-transform: uppercase; color: var(--text-dim); margin-top: 6px; letter-spacing: 1px; }
.empty-territory { padding: 50px; text-align: center; color: var(--text-dim); }
.territory-list { display: flex; flex-direction: column; gap: 8px; }
.territory-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: rgba(0,200,255,0.03); border: 1px solid rgba(0,200,255,0.1); border-radius: 6px; }
.t-coords { font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 700; color: var(--accent); }
.t-info { display: flex; gap: 15px; font-size: 11px; }
.t-strength { color: var(--text-dim); }
.t-bonus { color: var(--accent3); font-weight: 600; }
@media (max-width: 600px) { .territory-stats { grid-template-columns: 1fr; } }

/* Global helper */
.full-width { width: 100%; }
.btn-danger-outline { background: none; border: 1px solid rgba(255,58,122,0.5); color: var(--accent2); padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Orbitron', sans-serif; transition: all 0.2s; }
.btn-danger-outline:hover { background: rgba(255,58,122,0.1); border-color: var(--accent2); }
.btn-icon-xs { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; margin-left: 4px; }
.btn-icon-xs.red { color: var(--accent2); border-color: rgba(255,58,122,0.3); }
</style>
