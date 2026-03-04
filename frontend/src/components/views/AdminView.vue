<template>
  <div class="admin-container">
    <div class="panel">
      <div class="panel-header"><h3>⚙️ Adminisztrációs Panel</h3></div>
      <div class="panel-body">
        
        <!-- Stats -->
        <div class="stats-row" v-if="stats">
          <div class="stat-card">
            <div class="label">Felhasználók</div>
            <div class="val">{{ stats.users }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Összpontszám</div>
            <div class="val">{{ stats.totalScore?.toLocaleString('hu') }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Aktív küldetések</div>
            <div class="val">{{ stats.missions }}</div>
          </div>
        </div>

        <div class="admin-actions-bar">
          <button class="btn-primary" @click="seedBots" :disabled="loading">🤖 Botok Generálása</button>
          <button class="btn-primary" @click="simulateBots" :disabled="loading">⚡ Bot Szimuláció</button>
        </div>

        <div class="section-title">Felhasználók listája</div>
        <div class="user-list-scroll">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Felhasználó</th>
                <th>Email</th>
                <th>Pont</th>
                <th>Admin?</th>
                <th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td class="username-cell">{{ u.username }}</td>
                <td class="email-cell">{{ u.email }}</td>
                <td class="score-cell">{{ u.score?.toLocaleString('hu') }}</td>
                <td>{{ u.is_admin ? '✅' : '❌' }}</td>
                <td>
                  <button class="btn-primary" @click="selectUser(u)">💰 Adomány</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resource Gift Modal (simplified) -->
        <div v-if="selectedUser" class="modal-overlay">
          <div class="modal panel">
            <div class="panel-header"><h3>Adomány: {{ selectedUser.username }}</h3></div>
            <div class="panel-body">
              <div class="input-group">
                <label>Fém</label>
                <input type="number" v-model="gift.metal" />
              </div>
              <div class="input-group">
                <label>Kristály</label>
                <input type="number" v-model="gift.crystal" />
              </div>
              <div class="input-group">
                <label>Déusium</label>
                <input type="number" v-model="gift.deus" />
              </div>
              <div class="modal-btns">
                <button class="btn-primary" @click="sendGift" :disabled="loading">Küldés</button>
                <button class="btn-primary red" @click="selectedUser = null">Mégse</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const stats = ref(null);
const users = ref([]);
const selectedUser = ref(null);
const loading = ref(false);
const gift = ref({ metal: 10000, crystal: 5000, deus: 1000 });

async function loadAdminData() {
  const token = localStorage.getItem('aika_token');
  const [sRes, uRes] = await Promise.all([
    fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
  ]);
  
  const sData = await sRes.json();
  const uData = await uRes.json();
  
  if (sData.ok) stats.value = sData.stats;
  if (uData.ok) users.value = uData.users;
}

function selectUser(user) {
  selectedUser.value = user;
}

async function sendGift() {
  if (!selectedUser.value) return;
  loading.value = true;
  try {
    const res = await fetch('/api/admin/update-resources', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('aika_token')}` 
      },
      body: JSON.stringify({
        targetUserId: selectedUser.value.id,
        ...gift.value
      })
    });
    if (res.ok) {
      alert('Sikeres adományozás!');
      selectedUser.value = null;
      await loadAdminData();
    }
  } catch (e) {
    alert('Hiba történt.');
  }
  loading.value = false;
}

async function seedBots() {
    if (!confirm('Generálod az NPC botokat?')) return;
    loading.value = true;
    try {
        const res = await fetch('/api/admin/bots/seed', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('aika_token')}` }
        });
        const data = await res.json();
        alert(`Sikeres: ${data.created} bot létrehozva.`);
        await loadAdminData();
    } catch (e) { alert(e.message); }
    loading.value = false;
}

async function simulateBots() {
    loading.value = true;
    try {
        const res = await fetch('/api/admin/bots/simulate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('aika_token')}` }
        });
        const data = await res.json();
        alert(`Szimuláció kész: ${data.updated} bot frissítve.`);
        await loadAdminData();
    } catch (e) { alert(e.message); }
    loading.value = false;
}

onMounted(loadAdminData);
</script>

<style scoped>
.admin-container { max-width: 1000px; margin: 0 auto; color: var(--text); }
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; border-radius: 8px; text-align: center; box-shadow: var(--panel-shadow); }
.stat-card .label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
.stat-card .val { font-family: 'Orbitron', sans-serif; font-size: 24px; color: var(--accent); text-shadow: 0 0 10px rgba(0,200,255,0.3); }

.admin-actions-bar { display: flex; gap: 10px; margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px dashed var(--border); }

.section-title { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--text-bright); margin-bottom: 15px; border-left: 3px solid var(--accent); padding-left: 10px; }

.user-list-scroll { max-height: 500px; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-panel); }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.admin-table th { background: rgba(255,255,255,0.05); text-align: left; padding: 12px; color: var(--accent); font-family: 'Orbitron', sans-serif; font-size: 10px; text-transform: uppercase; position: sticky; top: 0; z-index: 10; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text); }
.admin-table tr:hover td { background: rgba(0,200,255,0.05); }

.username-cell { font-weight: bold; color: var(--text-bright); }
.email-cell { color: var(--text-dim); font-size: 12px; }
.score-cell { font-family: 'Orbitron', sans-serif; color: var(--accent4); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.modal { width: 350px; background: var(--bg-card); border: 1px solid var(--accent); }
.input-group { margin-bottom: 15px; }
.input-group label { display: block; font-size: 11px; margin-bottom: 6px; color: var(--accent); text-transform: uppercase; }
.input-group input { width: 100%; background: #000; border: 1px solid var(--border); color: #fff; padding: 10px; border-radius: 4px; font-family: 'Exo 2', sans-serif; font-size: 14px; }
.input-group input:focus { border-color: var(--accent); box-shadow: 0 0 10px rgba(0,200,255,0.2); }
.modal-btns { display: flex; gap: 10px; margin-top: 20px; }
.btn-primary.red { border-color: var(--accent2); color: var(--accent2); }
.btn-primary.red:hover { background: rgba(255,58,122,0.2); box-shadow: 0 0 12px rgba(255,58,122,0.4); }
</style>
