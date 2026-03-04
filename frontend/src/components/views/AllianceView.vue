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

        <!-- WARS TAB -->
        <div v-if="activeTab === 'wars'" class="tab-content wars-view">
          <div class="panel">
            <div class="panel-header"><h3>⚔️ Hadiállapot</h3></div>
            <div class="panel-body">
              <div v-if="wars.length === 0" class="empty-war">
                <div class="peace-icon">🕊️</div>
                <p>Jelenleg béke van a birodalmad és a galaxis többi szövetsége között.</p>
              </div>
              <div class="war-list-new">
                <div v-for="w in wars" :key="w.id" class="war-item">
                  <div class="war-meta">Háború kezdete: {{ new Date(w.started_at * 1000).toLocaleDateString('hu') }}</div>
                  <div class="war-battlefield">
                    <div class="side att">
                      <div class="s-tag">[{{ w.attacker_tag }}]</div>
                      <div class="s-pts">{{ L.n(w.attacker_score) }} PT</div>
                    </div>
                    <div class="war-vs">VS</div>
                    <div class="side def">
                      <div class="s-tag">[{{ w.defender_tag }}]</div>
                      <div class="s-pts">{{ L.n(w.defender_score) }} PT</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="canManage" class="war-declare-section">
                <h4>Hadüzenet küldése</h4>
                <div class="declare-row">
                  <select v-model="targetAllianceId" class="input">
                    <option disabled value="">Válassz célpontot...</option>
                    <option v-for="a in otherAlliances" :key="a.id" :value="a.id">[{{ a.tag }}] {{ a.name }}</option>
                  </select>
                  <button class="btn-danger" @click="declareWar" :disabled="!targetAllianceId || busy">HADÜZENET</button>
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
const targetAllianceId = ref('');

const tabs = [
  { id: 'overview', label: 'Áttekintés', icon: '🏛️' },
  { id: 'members',  label: 'Tagok',      icon: '👥' },
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
const sortedMembers = computed(() => [...allianceStore.members].sort((a,b) => b.score - a.score));
const otherAlliances = computed(() => allianceStore.list.filter(a => a.id !== allianceStore.alliance?.id));

async function loadWars() {
    try { const data = await api.get('/alliance/wars'); wars.value = data.wars || []; } catch {}
}

async function declareWar() {
    if (!confirm('Biztosan hadat üzensz? Ez egy visszavonhatatlan folyamat!')) return;
    busy.value = true;
    try {
        await api.post('/alliance/war/declare', { targetAllianceId: targetAllianceId.value });
        await loadWars();
    } catch (e) { alert(e.message); }
    busy.value = false;
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
.war-item { background: linear-gradient(90deg, rgba(255,58,122,0.1) 0%, transparent 100%); border: 1px solid rgba(255,58,122,0.3); border-radius: 8px; padding: 25px; margin-bottom: 20px; position: relative; }
.war-meta { position: absolute; top: 10px; right: 15px; font-size: 10px; color: var(--text-dim); text-transform: uppercase; }
.war-battlefield { display: flex; align-items: center; justify-content: center; gap: 40px; }
.war-vs { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; color: #fff; opacity: 0.2; }
.side { text-align: center; }
.s-tag { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; color: var(--accent2); text-shadow: 0 0 20px rgba(255,58,122,0.4); }
.s-pts { font-size: 16px; font-weight: 800; color: #fff; margin-top: 5px; }

.empty-war { padding: 50px; text-align: center; color: var(--text-dim); }
.peace-icon { font-size: 48px; margin-bottom: 15px; opacity: 0.5; }

.declare-row { display: flex; gap: 10px; margin-top: 15px; }

/* Global helper */
.full-width { width: 100%; }
.btn-danger-outline { background: none; border: 1px solid rgba(255,58,122,0.5); color: var(--accent2); padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 11px; text-transform: uppercase; font-family: 'Orbitron', sans-serif; transition: all 0.2s; }
.btn-danger-outline:hover { background: rgba(255,58,122,0.1); border-color: var(--accent2); }
.btn-icon-xs { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; margin-left: 4px; }
.btn-icon-xs.red { color: var(--accent2); border-color: rgba(255,58,122,0.3); }
</style>
