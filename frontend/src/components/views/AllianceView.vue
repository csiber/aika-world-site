<template>
  <div class="alliance-layout">

    <!-- Nem tagja szövetségnek -->
    <template v-if="!store.inAlliance">
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">🤝</span><h3>Szövetségek</h3></div>
        <div class="panel-body">
          <!-- Létrehozás -->
          <div class="section-title">Új szövetség alapítása</div>
          <div class="create-form">
            <input v-model="newName" class="input" placeholder="Szövetség neve (3-40 kar.)" maxlength="40" />
            <input v-model="newTag"  class="input input-sm" placeholder="TAG (pl. AIKA)" maxlength="5"
              style="width:90px;text-transform:uppercase" @input="newTag = newTag.toUpperCase()" />
            <input v-model="newDesc" class="input" placeholder="Leírás (opcionális)" maxlength="200" />
            <button class="btn-primary" @click="doCreate" :disabled="busy">{{ busy === 'create' ? '...' : '⚔️ Alapítás' }}</button>
          </div>
          <div v-if="createError" class="error-msg">❌ {{ createError }}</div>

          <!-- Csatlakozás ID-vel -->
          <div class="section-title" style="margin-top:16px;">Csatlakozás meghívóval</div>
          <div class="join-form">
            <input v-model="joinId" class="input" placeholder="Szövetség ID (meghívóból)" />
            <button class="btn-primary" @click="doJoin" :disabled="busy">{{ busy === 'join' ? '...' : '🚪 Csatlakozás' }}</button>
          </div>
          <div v-if="joinError" class="error-msg">❌ {{ joinError }}</div>

          <!-- Lista -->
          <div class="section-title" style="margin-top:20px;">Aktív szövetségek</div>
          <div v-if="loadingList" class="empty-msg">Betöltés...</div>
          <table v-else class="alliance-table">
            <thead><tr><th>TAG</th><th>Név</th><th>Vezető</th><th>Tagok</th><th>Pontszám</th><th></th></tr></thead>
            <tbody>
              <tr v-for="a in alliances" :key="a.id">
                <td><span class="alliance-tag">[{{ a.tag }}]</span></td>
                <td class="a-name">{{ a.name }}</td>
                <td class="a-leader">{{ a.leader_name }}</td>
                <td class="a-num">{{ a.member_count }}/50</td>
                <td class="a-score">{{ Number(a.total_score).toLocaleString('hu') }}</td>
                <td><button class="btn-sm" @click="joinById(a.id)" :disabled="busy">Csatlakozás</button></td>
              </tr>
              <tr v-if="!alliances.length"><td colspan="6" class="empty-msg">Még nincs szövetség.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Tag -->
    <template v-else>
      <div class="alliance-grid">
        <!-- Szövetség info -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-icon">⚔️</span>
            <h3>[{{ store.alliance.tag }}] {{ store.alliance.name }}</h3>
            <button class="btn-danger" style="margin-left:auto" @click="doLeave" :disabled="busy">Kilépés</button>
          </div>
          <div class="panel-body">
            <p class="alliance-desc">{{ store.alliance.description || 'Nincs leírás.' }}</p>
            <div class="alliance-meta">
              <span>👑 Vezető:</span>
              <span>{{ leaderName }}</span>
            </div>
            <div class="alliance-meta">
              <span>👥 Tagok:</span>
              <span>{{ store.members.length }} / 50</span>
            </div>
            <div class="alliance-meta">
              <span>🏆 Összpontszám:</span>
              <span>{{ totalScore.toLocaleString('hu') }}</span>
            </div>
            <div class="alliance-meta">
              <span>🎖️ Rangod:</span>
              <span class="role-badge" :class="store.myRole">{{ roleLabel(store.myRole) }}</span>
            </div>

            <!-- Meghívó (tiszt+) -->
            <template v-if="store.isOfficer">
              <div class="section-title" style="margin-top:14px;">Játékos meghívása</div>
              <div class="invite-form">
                <input v-model="inviteUsername" class="input" placeholder="Felhasználónév" />
                <button class="btn-primary" @click="doInvite" :disabled="busy">📨 Meghívó</button>
              </div>
              <div v-if="inviteMsg" class="success-msg">{{ inviteMsg }}</div>
            </template>
          </div>
        </div>

        <!-- Tag lista -->
        <div class="panel">
          <div class="panel-header"><span class="panel-icon">👥</span><h3>Tagok</h3></div>
          <div class="panel-body">
            <div v-for="m in sortedMembers" :key="m.user_id" class="member-row">
              <span class="role-badge" :class="m.role">{{ roleIcon(m.role) }}</span>
              <span class="member-name">{{ m.username }}</span>
              <span class="member-score">{{ Number(m.score).toLocaleString('hu') }} pt</span>
              <div v-if="store.isOfficer && m.user_id !== auth.userId" class="member-actions">
                <button class="btn-sm" v-if="store.isLeader && m.role === 'member'" @click="promote(m.user_id, 'officer')">↑ Tiszt</button>
                <button class="btn-sm" v-if="store.isLeader && m.role === 'officer'" @click="promote(m.user_id, 'member')">↓ Tag</button>
                <button class="btn-sm danger" @click="kick(m.user_id)">Kirúg</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat -->
      <div class="panel">
        <div class="panel-header"><span class="panel-icon">💬</span><h3>Szövetségi Chat</h3></div>
        <div class="panel-body">
          <div class="chat-log" ref="chatLog">
            <div v-for="msg in store.chatMsgs" :key="msg.id" class="chat-msg" :class="{ mine: msg.user_id === auth.userId }">
              <span class="chat-user">{{ msg.username }}</span>
              <span class="chat-text">{{ msg.message }}</span>
              <span class="chat-time">{{ timeAgo(msg.created_at) }}</span>
            </div>
            <div v-if="!store.chatMsgs.length" class="empty-msg">Még nincs üzenet.</div>
          </div>
          <div class="chat-input-row">
            <input v-model="chatMsg" class="input" placeholder="Üzenet a szövetségnek..." maxlength="300"
              @keydown.enter="sendChat" />
            <button class="btn-primary" @click="sendChat" :disabled="!chatMsg.trim()">KÜLD</button>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAllianceStore } from '@/stores/alliance.js';
import { useAuthStore } from '@/stores/auth.js';
import { api } from '@/api/client.js';

const store = useAllianceStore();
const auth  = useAuthStore();

const busy = ref(null);
const newName = ref(''); const newTag = ref(''); const newDesc = ref('');
const joinId  = ref('');
const inviteUsername = ref('');
const inviteMsg = ref('');
const chatMsg = ref('');
const createError = ref(''); const joinError = ref('');
const alliances = ref([]); const loadingList = ref(false);
const chatLog = ref(null);

const leaderName  = computed(() => store.members.find(m => m.role === 'leader')?.username || '');
const totalScore  = computed(() => store.members.reduce((s, m) => s + (m.score || 0), 0));
const sortedMembers = computed(() => [...store.members].sort((a,b) => {
  const order = { leader: 0, officer: 1, member: 2 };
  return (order[a.role] - order[b.role]) || b.score - a.score;
}));

function roleLabel(r) { return { leader: 'Vezető', officer: 'Tiszt', member: 'Tag' }[r] || r; }
function roleIcon(r)  { return { leader: '👑', officer: '⭐', member: '👤' }[r] || '👤'; }
function timeAgo(ts) {
  const d = Math.floor(Date.now()/1000) - ts;
  if (d < 60)    return 'most';
  if (d < 3600)  return `${Math.floor(d/60)}p`;
  if (d < 86400) return `${Math.floor(d/3600)}ó`;
  return `${Math.floor(d/86400)}n`;
}

async function loadList() {
  loadingList.value = true;
  try { alliances.value = (await api.getAlliances()).alliances || []; } catch {}
  loadingList.value = false;
}

async function doCreate() {
  createError.value = '';
  if (!newName.value || !newTag.value) { createError.value = 'Név és TAG kötelező'; return; }
  busy.value = 'create';
  try {
    await store.create(newName.value, newTag.value, newDesc.value);
  } catch (e) { createError.value = e.message; }
  busy.value = null;
}

async function doJoin() {
  joinError.value = '';
  if (!joinId.value) { joinError.value = 'Add meg a szövetség ID-t'; return; }
  busy.value = 'join';
  try { await store.join(joinId.value); }
  catch (e) { joinError.value = e.message; }
  busy.value = null;
}

async function joinById(id) {
  busy.value = 'join';
  try { await store.join(id); }
  catch (e) { joinError.value = e.message; }
  busy.value = null;
}

async function doLeave() {
  if (!confirm('Biztosan kilépsz a szövetségből?')) return;
  busy.value = 'leave';
  try { await store.leave(); } catch {}
  busy.value = null;
}

async function doInvite() {
  if (!inviteUsername.value) return;
  busy.value = 'invite';
  inviteMsg.value = '';
  try {
    await api.inviteToAlliance(inviteUsername.value);
    inviteMsg.value = `✅ Meghívó elküldve: ${inviteUsername.value}`;
    inviteUsername.value = '';
  } catch (e) { inviteMsg.value = `❌ ${e.message}`; }
  busy.value = null;
}

async function kick(uid) {
  if (!confirm('Biztosan kirúgod?')) return;
  try { await store.kick(uid); } catch {}
}

async function promote(uid, role) {
  try { await store.promote(uid, role); } catch {}
}

async function sendChat() {
  if (!chatMsg.value.trim()) return;
  try {
    await store.sendChat(chatMsg.value);
    chatMsg.value = '';
    await nextTick();
    if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight;
  } catch {}
}

onMounted(async () => {
  await store.load();
  if (store.inAlliance) {
    await store.loadChat();
    await nextTick();
    if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight;
  } else {
    await loadList();
  }
});
</script>

<style scoped>
.alliance-layout { display: flex; flex-direction: column; gap: 12px; }
.alliance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 800px) { .alliance-grid { grid-template-columns: 1fr; } }

.input { background: rgba(0,0,0,0.5); border: 1px solid var(--border); color: var(--text); padding: 6px 10px; font-size: 12px; border-radius: 3px; font-family: 'Exo 2', sans-serif; outline: none; transition: border-color 0.2s; flex: 1; }
.input:focus { border-color: var(--accent); }
.input-sm { flex: 0 0 auto; }
.create-form, .join-form, .invite-form { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.section-title { font-size: 9px; color: var(--text-dim); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid var(--border); }
.error-msg { color: var(--accent2); font-size: 11px; margin-top: 4px; }
.success-msg { color: var(--accent3); font-size: 11px; margin-top: 4px; }

.alliance-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
.alliance-table th { text-align: left; color: var(--text-dim); font-weight: 400; padding: 4px 8px; border-bottom: 1px solid var(--border); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; }
.alliance-table td { padding: 6px 8px; border-bottom: 1px solid rgba(26,42,74,0.4); }
.alliance-table tr:hover td { background: rgba(255,255,255,0.02); }
.alliance-tag { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); }
.a-name { color: var(--text-bright); font-weight: 500; }
.a-leader { color: var(--text-dim); }
.a-num, .a-score { font-family: 'Orbitron', sans-serif; font-size: 10px; }
.btn-sm { padding: 3px 8px; background: rgba(0,200,255,0.1); border: 1px solid var(--border); color: var(--accent); border-radius: 3px; cursor: pointer; font-size: 10px; transition: all 0.15s; }
.btn-sm:hover { border-color: var(--accent); }
.btn-sm.danger { border-color: rgba(255,58,122,0.3); color: var(--accent2); }
.btn-sm.danger:hover { background: rgba(255,58,122,0.1); border-color: var(--accent2); }
.btn-danger { padding: 3px 10px; background: rgba(255,58,122,0.1); border: 1px solid rgba(255,58,122,0.3); color: var(--accent2); border-radius: 3px; cursor: pointer; font-size: 11px; }

.alliance-desc { font-size: 11px; color: var(--text-dim); margin-bottom: 12px; line-height: 1.5; }
.alliance-meta { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(26,42,74,0.3); font-size: 11px; }
.role-badge { font-size: 10px; padding: 1px 6px; border-radius: 3px; }
.role-badge.leader  { background: rgba(255,215,0,0.15); color: var(--accent4); border: 1px solid rgba(255,215,0,0.3); }
.role-badge.officer { background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid rgba(0,200,255,0.2); }
.role-badge.member  { background: rgba(255,255,255,0.04); color: var(--text-dim); border: 1px solid var(--border); }

.member-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(26,42,74,0.3); font-size: 11px; }
.member-name  { flex: 1; color: var(--text-bright); }
.member-score { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); }
.member-actions { display: flex; gap: 4px; }

.chat-log { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; padding: 10px; height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.chat-msg { display: flex; gap: 8px; align-items: baseline; font-size: 11px; }
.chat-msg.mine .chat-user { color: var(--accent3); }
.chat-user { color: var(--accent); font-weight: 600; min-width: 80px; }
.chat-text  { flex: 1; color: var(--text); }
.chat-time  { font-size: 9px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.chat-input-row { display: flex; gap: 8px; }
.empty-msg { color: var(--text-dim); font-size: 11px; }
</style>
