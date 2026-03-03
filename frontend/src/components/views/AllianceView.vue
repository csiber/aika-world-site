<template>
  <div class="alliance-layout">
    <!-- NO ALLIANCE: Create or Join -->
    <div v-if="!allianceStore.inAlliance" class="alliance-grid">
      <div class="panel">
        <div class="panel-header"><h3>{{ L.t('alliance.create') }}</h3></div>
        <div class="panel-body alliance-form">
          <input v-model="form.name" :placeholder="L.t('alliance.namePh')" class="input" />
          <input v-model="form.tag" :placeholder="L.t('alliance.tagPh')" class="input" maxlength="5" />
          <textarea v-model="form.desc" :placeholder="L.t('alliance.descPh')" class="input"></textarea>
          <button class="btn-primary" @click="createAlliance" :disabled="busy">{{ L.t('alliance.createBtn') }}</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><h3>{{ L.t('alliance.active') }}</h3></div>
        <div class="panel-body no-padding">
          <div v-if="allianceStore.loading" class="empty-msg">{{ L.t('alliance.loading') }}</div>
          <table v-else class="alliance-table">
            <thead>
              <tr><th>{{ L.t('alliance.tag') }}</th><th>{{ L.t('alliance.name') }}</th><th>{{ L.t('alliance.members') }}</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="a in allianceStore.list" :key="a.id">
                <td class="a-tag">[{{ a.tag }}]</td>
                <td>{{ a.name }}</td>
                <td>{{ a.member_count }}</td>
                <td style="text-align:right;">
                  <button class="btn-sm" @click="joinAlliance(a.id)" :disabled="busy">{{ L.t('alliance.join') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- IN ALLIANCE: Dashboard -->
    <div v-else class="alliance-grid-active">
      <div class="alliance-sidebar">
        <div class="panel info-panel">
          <div class="panel-header">
            <h3>[{{ allianceStore.alliance.tag }}] {{ allianceStore.alliance.name }}</h3>
          </div>
          <div class="panel-body">
            <div class="a-stat">
              <span class="label">{{ L.t('alliance.level') }}:</span>
              <span class="val accent">{{ allianceStore.alliance.level }}</span>
            </div>
            <div class="a-stat">
              <span class="label">{{ L.t('alliance.exp') }}:</span>
              <div class="exp-bar-wrap">
                <div class="exp-bar" :style="{ width: expProgress + '%' }"></div>
                <span class="exp-text">{{ allianceStore.alliance.exp }} / {{ nextLevelExp }}</span>
              </div>
            </div>
            <p class="a-desc">{{ allianceStore.alliance.description || L.t('alliance.noDesc') }}</p>
            <div class="a-actions">
              <button class="btn-secondary full-width" @click="leaveAlliance">{{ L.t('alliance.leave') }}</button>
            </div>
          </div>
        </div>

        <div class="panel nav-panel">
          <div class="panel-body no-padding vertical-nav">
            <button v-for="t in tabs" :key="t.id" :class="{ active: activeTab === t.id }" @click="activeTab = t.id" class="v-nav-btn">
              {{ t.icon }} {{ t.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="alliance-main">
        <!-- MEMBERS TAB -->
        <div v-if="activeTab === 'members'" class="panel">
          <div class="panel-header"><h3>Tagok ({{ allianceStore.members.length }})</h3></div>
          <div class="panel-body no-padding">
            <table class="alliance-table">
              <thead>
                <tr><th>Játékos</th><th>Rang</th><th>Pontszám</th><th v-if="canManage"></th></tr>
              </thead>
              <tbody>
                <tr v-for="m in allianceStore.members" :key="m.user_id">
                  <td class="player-link" @click="openProfile(m.username)">{{ m.username }}</td>
                  <td class="role-tag" :class="m.role">{{ L.t('alliance.roles.' + m.role) }}</td>
                  <td>{{ m.score.toLocaleString('hu') }}</td>
                  <td v-if="canManage" style="text-align:right;">
                    <div class="mgmt-btns" v-if="m.user_id !== auth.userId">
                      <button v-if="m.role === 'member'" class="btn-xs" @click="promote(m.user_id)">↑</button>
                      <button v-if="m.role === 'officer'" class="btn-xs" @click="demote(m.user_id)">↓</button>
                      <button class="btn-xs danger" @click="kick(m.user_id)">✕</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="canManage" class="invite-box">
              <input v-model="inviteUser" :placeholder="L.t('alliance.usernamePh')" class="input-sm" />
              <button class="btn-primary-sm" @click="sendInvite" :disabled="busy">{{ L.t('alliance.inviteBtn') }}</button>
            </div>
          </div>
        </div>

        <!-- BANK TAB -->
        <div v-if="activeTab === 'bank'" class="panel">
          <div class="panel-header"><h3>{{ L.t('alliance.bank') }}</h3></div>
          <div class="panel-body">
            <div class="vault-display">
              <div class="v-res"><span class="icon">⚙️</span> {{ Math.floor(allianceStore.alliance.vault?.metal || 0).toLocaleString('hu') }}</div>
              <div class="v-res"><span class="icon">💎</span> {{ Math.floor(allianceStore.alliance.vault?.crystal || 0).toLocaleString('hu') }}</div>
              <div class="v-res"><span class="icon">🔮</span> {{ Math.floor(allianceStore.alliance.vault?.deus || 0).toLocaleString('hu') }}</div>
            </div>
            <div class="donate-form">
              <div class="d-input"><label>⚙️</label><input type="number" v-model.number="donate.metal" /></div>
              <div class="d-input"><label>💎</label><input type="number" v-model.number="donate.crystal" /></div>
              <div class="d-input"><label>🔮</label><input type="number" v-model.number="donate.deus" /></div>
              <button class="btn-primary full-width" @click="doDonate" :disabled="busy">{{ L.t('alliance.donateBtn') }}</button>
            </div>
          </div>
        </div>

        <!-- WARS TAB -->
        <div v-if="activeTab === 'wars'" class="panel">
          <div class="panel-header"><h3>⚔️ Aktív Háborúk</h3></div>
          <div class="panel-body no-padding">
            <div v-if="wars.length === 0" class="empty-msg">Nincs folyamatban lévő háború.</div>
            <div v-for="w in wars" :key="w.id" class="war-card">
              <div class="war-teams">
                <div class="team attacker">
                  <div class="team-tag">[{{ w.attacker_tag }}]</div>
                  <div class="team-score">{{ w.attacker_score }} pt</div>
                </div>
                <div class="war-vs">VS</div>
                <div class="team defender">
                  <div class="team-tag">[{{ w.defender_tag }}]</div>
                  <div class="team-score">{{ w.defender_score }} pt</div>
                </div>
              </div>
              <div class="war-footer">Kezdet: {{ new Date(w.started_at * 1000).toLocaleDateString('hu') }}</div>
            </div>

            <div v-if="canManage" class="war-declare-box">
              <h4>Hadüzenet küldése</h4>
              <select v-model="targetAllianceId" class="input">
                <option v-for="a in otherAlliances" :key="a.id" :value="a.id">[{{ a.tag }}] {{ a.name }}</option>
              </select>
              <button class="btn-primary" @click="declareWar" :disabled="!targetAllianceId || busy">HADÜZENET</button>
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

const activeTab = ref('members');
const busy = ref(false);
const inviteUser = ref('');
const wars = ref([]);
const targetAllianceId = ref('');

const tabs = [
  { id: 'members', label: 'Tagok', icon: '👥' },
  { id: 'bank',    label: 'Bank',  icon: '🏦' },
  { id: 'wars',    label: 'Háború', icon: '⚔️' }
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
  if (!confirm(L.t('alliance.leaveConfirm'))) return;
  await allianceStore.leave();
}

async function sendInvite() {
  if (!inviteUser.value) return;
  busy.value = true;
  try { await allianceStore.invite(inviteUser.value); inviteUser.value = ''; } catch (e) { alert(e.message); }
  busy.value = false;
}

async function promote(uid) { await api.post('/alliance/promote', { targetUserId: uid, role: 'officer' }); await allianceStore.load(); }
async function demote(uid)  { await api.post('/alliance/promote', { targetUserId: uid, role: 'member' }); await allianceStore.load(); }
async function kick(uid)    { if (!confirm(L.t('alliance.kickConfirm'))) return; await api.post('/alliance/kick', { targetUserId: uid }); await allianceStore.load(); }

async function doDonate() {
  busy.value = true;
  try { await allianceStore.donate(donate.value.metal, donate.value.crystal, donate.value.deus); } catch (e) { alert(e.message); }
  busy.value = false;
}

onMounted(() => {
    allianceStore.load();
    loadWars();
});
</script>

<style scoped>
.alliance-layout { }
.alliance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 800px) { .alliance-grid { grid-template-columns: 1fr; } }

.alliance-form { display: flex; flex-direction: column; gap: 12px; }
.alliance-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.alliance-table th { text-align: left; padding: 12px 15px; color: var(--text-dim); font-size: 10px; text-transform: uppercase; border-bottom: 1px solid var(--border); }
.alliance-table td { padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }

.a-tag { color: var(--accent); font-family: 'Orbitron', sans-serif; font-weight: 800; }

/* Active View */
.alliance-grid-active { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
@media (max-width: 900px) { .alliance-grid-active { grid-template-columns: 1fr; } }

.a-stat { display: flex; justify-content: space-between; margin-bottom: 10px; }
.exp-bar-wrap { flex: 1; margin-left: 15px; height: 18px; background: rgba(0,0,0,0.5); border-radius: 9px; position: relative; overflow: hidden; border: 1px solid var(--border); }
.exp-bar { height: 100%; background: linear-gradient(90deg, var(--accent) 0%, #00ffcc 100%); transition: width 0.5s ease; }
.exp-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px #000; }

.vertical-nav { display: flex; flex-direction: column; gap: 2px; }
.v-nav-btn { padding: 12px 20px; background: none; border: none; color: var(--text-dim); text-align: left; cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; }
.v-nav-btn:hover { background: rgba(255,255,255,0.03); color: #fff; }
.v-nav-btn.active { background: rgba(0,200,255,0.05); color: var(--accent); border-left-color: var(--accent); }

.role-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; display: inline-block; }
.role-tag.leader { background: rgba(255,215,0,0.1); color: gold; border: 1px solid gold; }
.role-tag.officer { background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid var(--accent); }

.vault-display { display: flex; gap: 20px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin-bottom: 20px; justify-content: center; }
.v-res { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 800; color: var(--text-bright); }

.donate-form { display: grid; gap: 10px; max-width: 300px; margin: 0 auto; }
.d-input { display: flex; align-items: center; gap: 10px; }
.d-input label { width: 30px; font-size: 20px; }
.d-input input { flex: 1; background: #000; border: 1px solid var(--border); color: #fff; padding: 8px; border-radius: 4px; }

.invite-box { padding: 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; }

/* War Cards */
.war-card { background: rgba(255,58,122,0.05); border: 1px solid rgba(255,58,122,0.2); border-radius: 8px; padding: 20px; margin-bottom: 15px; }
.war-teams { display: flex; align-items: center; justify-content: space-around; }
.war-vs { font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 900; color: #fff; opacity: 0.3; }
.team { text-align: center; }
.team-tag { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; color: var(--accent2); margin-bottom: 5px; }
.team-score { font-size: 14px; font-weight: 700; color: #fff; }
.war-footer { text-align: center; font-size: 10px; color: var(--text-dim); margin-top: 15px; text-transform: uppercase; }

.war-declare-box { padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-top: 20px; }
.war-declare-box h4 { margin-bottom: 15px; color: var(--accent2); }
</style>
