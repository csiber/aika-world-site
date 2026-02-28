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
                <td>{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.score?.toLocaleString('hu') }}</td>
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
    }
  } catch (e) {
    alert('Hiba történt.');
  }
  loading.value = false;
}

onMounted(loadAdminData);
</script>

<style scoped>
.admin-container { max-width: 1000px; margin: 0 auto; }
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; }
.stat-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 15px; border-radius: 6px; text-align: center; }
.stat-card .label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 5px; }
.stat-card .val { font-family: 'Orbitron', sans-serif; font-size: 20px; color: var(--accent); }

.user-list-scroll { max-height: 400px; overflow-y: auto; border: 1px solid var(--border); border-radius: 4px; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.admin-table th { background: rgba(255,255,255,0.05); text-align: left; padding: 10px; color: var(--text-dim); }
.admin-table td { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal { width: 300px; }
.input-group { margin-bottom: 10px; }
.input-group label { display: block; font-size: 10px; margin-bottom: 4px; color: var(--text-dim); }
.input-group input { width: 100%; background: #000; border: 1px solid var(--border); color: #fff; padding: 6px; border-radius: 3px; }
.modal-btns { display: flex; gap: 10px; margin-top: 15px; }
.btn-primary.red { border-color: var(--accent2); color: var(--accent2); }
</style>
