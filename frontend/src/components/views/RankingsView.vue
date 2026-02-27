<template>
  <div class="panel">
    <div class="panel-header"><span class="panel-icon">🏆</span><h3>Galaktikus Rangsor</h3></div>
    <div class="panel-body">
      <div v-if="loading" class="empty-msg">Rangsor betöltése...</div>
      <div v-else>
        <!-- My rank highlight -->
        <div v-if="myRank" class="my-rank-bar">
          🎖️ Saját helyezésed: <strong>#{{ myRank }}</strong>
          — {{ myUsername }} —
          <span class="score-val">{{ myScore.toLocaleString('hu') }} pont</span>
        </div>

        <table class="rank-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Játékos</th>
              <th>Pontszám</th>
              <th>Utoljára aktív</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rankings"
              :key="row.username"
              :class="{ 'my-row': row.username === myUsername }"
            >
              <td>
                <span v-if="row.rank === 1">🥇</span>
                <span v-else-if="row.rank === 2">🥈</span>
                <span v-else-if="row.rank === 3">🥉</span>
                <span v-else class="rank-num">#{{ row.rank }}</span>
              </td>
              <td class="player-name">{{ row.username }}</td>
              <td class="score-val">{{ Number(row.score).toLocaleString('hu') }}</td>
              <td class="time-val">{{ timeAgo(row.updated_at) }}</td>
            </tr>
            <tr v-if="!rankings.length">
              <td colspan="4" class="empty-msg">Még nincs rangsor adat.</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" v-if="total > 50">
          <button class="btn-primary" :disabled="page <= 1" @click="changePage(page - 1)">← Előző</button>
          <span>{{ page }}</span>
          <button class="btn-primary" :disabled="page * 50 >= total" @click="changePage(page + 1)">Következő →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/client.js';
import { useAuthStore } from '@/stores/auth.js';

const auth       = useAuthStore();
const rankings   = ref([]);
const myRank     = ref(null);
const myScore    = ref(0);
const myUsername = ref(auth.username);
const total      = ref(0);
const page       = ref(1);
const loading    = ref(false);

async function load() {
  loading.value = true;
  try {
    const data = await api.getRankings(page.value);
    rankings.value   = data.rankings;
    myRank.value     = data.myRank;
    myScore.value    = data.myScore;
    myUsername.value = data.myUsername;
    total.value      = data.total;
  } catch (e) { /* ignore */ }
  loading.value = false;
}

function changePage(p) {
  page.value = p;
  load();
}

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60)   return 'most';
  if (diff < 3600) return `${Math.floor(diff / 60)}p`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ó`;
  return `${Math.floor(diff / 86400)}n`;
}

onMounted(load);
</script>

<style scoped>
.my-rank-bar {
  background: rgba(0,200,255,0.08);
  border: 1px solid rgba(0,200,255,0.2);
  border-radius: 4px;
  padding: 10px 14px;
  font-size: 12px;
  margin-bottom: 14px;
  color: var(--text);
}
.rank-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.rank-table th { text-align: left; color: var(--text-dim); font-weight: 400; padding: 6px 10px; border-bottom: 1px solid var(--border); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; }
.rank-table td { padding: 8px 10px; border-bottom: 1px solid rgba(26,42,74,0.4); }
.rank-table tr:hover td { background: rgba(255,255,255,0.02); }
.rank-table tr.my-row td { background: rgba(0,200,255,0.05); color: var(--accent); }
.rank-num { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--text-dim); }
.player-name { color: var(--text-bright); font-weight: 500; }
.score-val { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent4); }
.time-val { font-size: 10px; color: var(--text-dim); }
.empty-msg { color: var(--text-dim); font-size: 11px; padding: 8px 0; }
.pagination { display: flex; align-items: center; gap: 12px; margin-top: 14px; justify-content: center; font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--text-dim); }
</style>
