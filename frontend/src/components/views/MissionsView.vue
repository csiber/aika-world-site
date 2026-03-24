<template>
  <div class="missions-layout">
    <div class="panel">
      <div class="panel-header">
        <span class="panel-icon">🚀</span>
        <h3>{{ activeTab === 'missions' ? (L.t('missions.title') || 'Flotta Irányítás') : (L.t('quests.title') || 'Küldetések') }}</h3>
        <div class="tab-toggle">
          <button :class="['tab-btn', { active: activeTab === 'missions' }]" @click="activeTab = 'missions'">
            🚀 {{ L.t('missions.title') || 'Missziók' }}
          </button>
          <button :class="['tab-btn', { active: activeTab === 'quests' }]" @click="switchToQuests">
            🎯 {{ L.t('quests.title') || 'Küldetések' }}
            <span v-if="questsStore.completedCount > 0" class="quest-badge">{{ questsStore.completedCount }}</span>
          </button>
        </div>
        <button class="btn-refresh" @click="activeTab === 'missions' ? loadMissions() : questsStore.loadQuests()" :disabled="loading || questsStore.loading">↻</button>
      </div>

      <!-- Missions Tab -->
      <div v-if="activeTab === 'missions'" class="panel-body">
        <div v-if="loading && !missions.length" class="empty-msg">Betöltés...</div>
        <div v-else-if="!missions.length" class="empty-msg">Nincs aktív flotta mozgás.</div>

        <div class="missions-grid">
          <div v-for="m in missions" :key="m.id" class="mission-card" :class="m.status">
            <div class="m-header">
              <span class="m-icon">{{ missionIcon(m.mission_type) }}</span>
              <div class="m-type-label">{{ typeLabel(m.mission_type) }}</div>
              <div v-if="m.is_intercepted === 1" class="m-intercepted-badge">ELFOGVA</div>
              <div v-if="m.status === 'battle_pending'" class="m-status-badge battle_pending" @click="openBattle(m)" style="cursor:pointer;">
                ⚔️ CSATA FOLYAMATBAN — Kattints!
              </div>
              <div v-else class="m-status-badge" :class="m.status">{{ statusLabel(m.status) }}</div>
            </div>

            <div class="m-route">
              <div class="m-origin">
                <div class="label">Indulás</div>
                <div class="val">{{ getPlanetName(m.origin_planet_id) }}</div>
              </div>
              <div class="m-arrow">➔</div>
              <div class="m-target">
                <div class="label">{{ m.mission_type === 'intercept' ? 'Elfogási pont' : 'Célpont' }}</div>
                <div class="val">{{ m.target_name }} {{ m.target_coords }}</div>
              </div>
            </div>
            <div v-if="m.intercept_coords" class="m-intercept-info">
              <span class="intercept-label">Elfogási pont:</span>
              <span class="intercept-coords">{{ m.intercept_coords }}</span>
            </div>

            <div class="m-ships">
              <div v-for="s in parseShips(m.ships)" :key="s.id" class="ship-tag">
                {{ s.icon }} {{ s.count }}
              </div>
            </div>

            <div class="m-footer">
              <div v-if="m.status === 'battle_pending'" class="m-timer">
                <button class="btn-battle" @click="openBattle(m)">Csata megnyitása</button>
              </div>
              <template v-else>
                <div class="m-timer">
                  <span class="label">{{ m.status === 'travelling' ? 'Érkezés:' : 'Visszaérkezés:' }}</span>
                  <span class="time">{{ formatTimeLeft(m.status === 'travelling' ? m.arrive_at : m.return_at) }}</span>
                </div>
                <button
                  v-if="m.status === 'travelling'"
                  class="btn-recall"
                  @click="recall(m.id)"
                  :disabled="busy === m.id"
                >
                  {{ busy === m.id ? '...' : 'Visszahívás' }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Expedition 2.0: awaiting choice modal -->
      <ExpeditionChoice
        v-if="awaitingChoiceMission"
        :mission="awaitingChoiceMission"
        @chosen="onExpeditionChosen"
      />

      <!-- Quests Tab -->
      <div v-else class="panel-body">
        <div v-if="questsStore.loading && !questsStore.quests.length" class="empty-msg">{{ L.t('common.loading') || 'Betöltés...' }}</div>
        <div v-else-if="!questsStore.quests.length" class="empty-msg">{{ L.t('quests.noQuests') || 'Nincs aktív küldetés' }}</div>

        <template v-else>
          <!-- Daily Quests -->
          <div class="quest-section">
            <div class="quest-section-header">
              <span class="quest-section-icon">☀️</span>
              <span>{{ L.t('quests.daily') || 'Napi Küldetések' }}</span>
            </div>
            <div v-if="!questsStore.dailyQuests.length" class="empty-msg small">{{ L.t('quests.noQuests') || 'Nincs aktív küldetés' }}</div>
            <div class="quests-grid">
              <div
                v-for="q in questsStore.dailyQuests"
                :key="q.target_id"
                class="quest-card"
                :class="{ completed: q.is_claimed, claimable: q.current >= q.required && !q.is_claimed }"
              >
                <div class="q-header">
                  <span v-if="q.is_claimed" class="q-check">✓</span>
                  <div class="q-name">{{ L.t('quests.' + q.target_id) || q.target_id }}</div>
                  <div v-if="q.expires_at" class="q-expires">
                    <span class="label">{{ L.t('quests.expires') || 'Lejárat' }}:</span>
                    <span class="expires-time">{{ formatTimeLeft(q.expires_at) }}</span>
                  </div>
                </div>

                <div class="q-progress-wrap">
                  <div class="q-progress-bar">
                    <div
                      class="q-progress-fill"
                      :style="{ width: Math.min(100, Math.floor((q.current / q.required) * 100)) + '%' }"
                      :class="{ full: q.current >= q.required }"
                    ></div>
                  </div>
                  <span class="q-progress-label">{{ q.current }} / {{ q.required }}</span>
                </div>

                <div class="q-footer">
                  <div class="q-reward">
                    <span class="label">{{ L.t('quests.reward') || 'Jutalom' }}:</span>
                    <span class="reward-amount">{{ q.reward_amount?.toLocaleString() }} {{ L.t('quests.darkMatter') || 'Sötét Anyag' }}</span>
                  </div>
                  <button
                    v-if="!q.is_claimed"
                    class="btn-claim"
                    :disabled="q.current < q.required || claiming === q.target_id"
                    @click="handleClaim(q.target_id)"
                  >
                    {{ claiming === q.target_id ? '...' : (L.t('quests.claim') || 'Átvétel') }}
                  </button>
                  <span v-else class="claimed-label">{{ L.t('quests.claimed') || 'Átvéve' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Weekly Quest -->
          <div class="quest-section">
            <div class="quest-section-header">
              <span class="quest-section-icon">🌙</span>
              <span>{{ L.t('quests.weekly') || 'Heti Küldetés' }}</span>
            </div>
            <div v-if="!questsStore.weeklyQuests.length" class="empty-msg small">{{ L.t('quests.noQuests') || 'Nincs aktív küldetés' }}</div>
            <div class="quests-grid">
              <div
                v-for="q in questsStore.weeklyQuests"
                :key="q.target_id"
                class="quest-card weekly"
                :class="{ completed: q.is_claimed, claimable: q.current >= q.required && !q.is_claimed }"
              >
                <div class="q-header">
                  <span v-if="q.is_claimed" class="q-check">✓</span>
                  <div class="q-name">{{ L.t('quests.' + q.target_id) || q.target_id }}</div>
                  <div v-if="q.expires_at" class="q-expires">
                    <span class="label">{{ L.t('quests.expires') || 'Lejárat' }}:</span>
                    <span class="expires-time">{{ formatTimeLeft(q.expires_at) }}</span>
                  </div>
                </div>

                <div class="q-progress-wrap">
                  <div class="q-progress-bar">
                    <div
                      class="q-progress-fill"
                      :style="{ width: Math.min(100, Math.floor((q.current / q.required) * 100)) + '%' }"
                      :class="{ full: q.current >= q.required }"
                    ></div>
                  </div>
                  <span class="q-progress-label">{{ q.current }} / {{ q.required }}</span>
                </div>

                <div class="q-footer">
                  <div class="q-reward">
                    <span class="label">{{ L.t('quests.reward') || 'Jutalom' }}:</span>
                    <span class="reward-amount weekly-reward">{{ q.reward_amount?.toLocaleString() }} {{ L.t('quests.darkMatter') || 'Sötét Anyag' }}</span>
                  </div>
                  <button
                    v-if="!q.is_claimed"
                    class="btn-claim weekly"
                    :disabled="q.current < q.required || claiming === q.target_id"
                    @click="handleClaim(q.target_id)"
                  >
                    {{ claiming === q.target_id ? '...' : (L.t('quests.claim') || 'Átvétel') }}
                  </button>
                  <span v-else class="claimed-label">{{ L.t('quests.claimed') || 'Átvéve' }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
import { useQuestsStore } from '@/stores/quests.js';
import { api } from '@/api/client.js';
import { audio } from '@/utils/botAudio.js';
import ExpeditionChoice from '@/components/ExpeditionChoice.vue';

const router = useRouter();

const game = useGameStore();
const L    = useLangStore();
const questsStore = useQuestsStore();
const missions = ref([]);
const loading  = ref(false);
const busy     = ref(null);
const activeTab = ref('missions');
const claiming = ref(null);

// Expedition 2.0 — awaiting choice
const awaitingChoiceMission = computed(() =>
  missions.value.find(m => m.status === 'awaiting_choice') || null
);

async function onExpeditionChosen(result) {
  game.notify(result?.message || 'Expedition resolved!', 'blue');
  await loadMissions();
}

const typeLabel = (t) => ({ spy: 'Kémkedés', attack: 'Támadás', colonize: 'Gyarmatosítás', harvest: 'Újrahasznosítás', expedition: 'Expedíció', intercept: 'Elfogás' }[t] || t);
const statusLabel = (s) => ({ travelling: 'Úton', returning: 'Visszatérés', done: 'Befejezve', battle_pending: 'CSATA FOLYAMATBAN', awaiting_choice: 'DÖNTÉS SZÜKSÉGES' }[s] || s);
const missionIcon = (t) => ({ spy: '🔍', attack: '⚔️', colonize: '🌍', harvest: '🚛', expedition: '🌌', intercept: '🎯' }[t] || '🚀');

function getBattleId(m) {
  if (m.status !== 'battle_pending') return null;
  try { const r = JSON.parse(m.result || '{}'); return r.tacticalBattleId || null; } catch { return null; }
}

function openBattle(m) {
  const bid = getBattleId(m);
  if (bid) router.push(`/tactical/${bid}`);
}

function getPlanetName(id) {
  return game.planets.find(p => p.id === id)?.name || 'Ismeretlen';
}

function parseShips(json) {
  try { return JSON.parse(json); } catch { return []; }
}

async function loadMissions() {
  loading.value = true;
  try {
    const data = await api.getMissions();
    missions.value = data.missions || [];
  } catch {}
  loading.value = false;
}

async function recall(id) {
  if (!confirm('Biztosan visszafordítod a flottát?')) return;
  audio.click();
  busy.value = id;
  try {
    await api.recallMission(id);
    game.notify('A flotta visszafordult', 'blue');
    await loadMissions();
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  busy.value = null;
}

function formatTimeLeft(ts) {
  if (!ts) return '';
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'Megérkezett';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function switchToQuests() {
  activeTab.value = 'quests';
  if (!questsStore.quests.length) questsStore.loadQuests();
}

async function handleClaim(questId) {
  claiming.value = questId;
  try {
    const res = await questsStore.claimQuest(questId);
    if (res?.ok) {
      game.notify('Jutalom átvéve!', 'green');
    }
  } catch (e) {
    game.notify(`Hiba: ${e?.message || 'Ismeretlen hiba'}`, 'red');
  }
  claiming.value = null;
}

let timer;
onMounted(() => {
  loadMissions();
  timer = setInterval(loadMissions, 5000);
});
onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.missions-layout { }
.btn-refresh { background: none; border: 1px solid var(--border); color: var(--text-dim); padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-left: 10px; }

/* Tab toggle */
.tab-toggle { display: flex; gap: 6px; margin-left: auto; }
.tab-btn { background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: var(--text-dim); padding: 4px 14px; border-radius: 4px; cursor: pointer; font-size: 11px; font-family: 'Orbitron', sans-serif; font-weight: 600; letter-spacing: 0.5px; transition: all 0.2s; position: relative; }
.tab-btn:hover { border-color: var(--accent); color: var(--accent); }
.tab-btn.active { background: rgba(0,200,255,0.1); border-color: var(--accent); color: var(--accent); }
.quest-badge { position: absolute; top: -5px; right: -5px; background: var(--accent3); color: #000; border-radius: 50%; width: 16px; height: 16px; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 700; }

/* Missions */
.missions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 15px; margin-top: 10px; }
.mission-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 15px; position: relative; overflow: hidden; }
.mission-card.returning { border-color: var(--accent3); background: rgba(58,255,122,0.03); }
.mission-card.battle_pending { border-color: var(--accent2); background: rgba(255,58,122,0.05); animation: battle-pulse 2s ease-in-out infinite; }
.mission-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--accent); }
.mission-card.returning::before { background: var(--accent3); }
.mission-card.battle_pending::before { background: var(--accent2); }
@keyframes battle-pulse { 0%,100% { box-shadow: 0 0 0 rgba(255,58,122,0); } 50% { box-shadow: 0 0 15px rgba(255,58,122,0.2); } }

.m-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.m-icon { font-size: 20px; }
.m-type-label { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; color: var(--text-bright); text-transform: uppercase; }
.m-status-badge { margin-left: auto; font-size: 9px; padding: 2px 8px; border-radius: 10px; background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid var(--accent); }
.m-status-badge.returning { background: rgba(58,255,122,0.1); color: var(--accent3); border-color: var(--accent3); }
.m-status-badge.battle_pending { background: rgba(255,58,122,0.15); color: var(--accent2); border-color: var(--accent2); font-weight: 700; animation: battle-pulse 2s ease-in-out infinite; }

.btn-battle { background: linear-gradient(135deg, rgba(255,58,122,0.2), rgba(255,58,122,0.05)); border: 1px solid var(--accent2); color: var(--accent2); padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 11px; font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 1px; transition: all 0.2s; }
.btn-battle:hover { background: rgba(255,58,122,0.25); box-shadow: 0 0 12px rgba(255,58,122,0.3); }

.m-route { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 4px; }
.m-arrow { color: var(--text-dim); font-size: 18px; }
.label { font-size: 9px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 2px; }
.val { font-size: 11px; color: var(--text-bright); font-weight: 600; }

.m-ships { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; }
.ship-tag { background: rgba(0,0,0,0.5); border: 1px solid var(--border); padding: 2px 6px; border-radius: 3px; font-size: 10px; font-family: 'Orbitron', sans-serif; }

.m-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }
.m-timer { display: flex; flex-direction: column; }
.m-timer .time { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); font-weight: 700; }

.btn-recall { background: none; border: 1px solid var(--accent2); color: var(--accent2); padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; transition: all 0.2s; }
.btn-recall:hover { background: rgba(255,58,122,0.1); }
.btn-recall:disabled { opacity: 0.5; }

/* Intercepted badge */
.m-intercepted-badge { font-size: 8px; padding: 2px 8px; border-radius: 10px; background: rgba(255,58,92,0.15); color: #ff3a5c; border: 1px solid rgba(255,58,92,0.3); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; animation: flash-intercepted 1.5s infinite; }
@keyframes flash-intercepted { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Intercept info */
.m-intercept-info { display: flex; align-items: center; gap: 8px; font-size: 10px; padding: 6px 10px; background: rgba(255,58,92,0.05); border: 1px solid rgba(255,58,92,0.15); border-radius: 4px; margin-bottom: 15px; }
.intercept-label { color: var(--text-dim); text-transform: uppercase; font-size: 9px; }
.intercept-coords { color: #ff3a5c; font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; }

/* Quest section */
.quest-section { margin-bottom: 24px; }
.quest-section-header { display: flex; align-items: center; gap: 8px; font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.quest-section-icon { font-size: 16px; }

.quests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }

.quest-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 14px; position: relative; overflow: hidden; transition: border-color 0.2s; }
.quest-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--accent); }
.quest-card.weekly::before { background: #ffd700; }
.quest-card.claimable { border-color: var(--accent3); background: rgba(58,255,122,0.03); }
.quest-card.claimable::before { background: var(--accent3); }
.quest-card.completed { opacity: 0.5; border-color: rgba(255,255,255,0.1); }
.quest-card.completed::before { background: rgba(255,255,255,0.2); }

.q-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
.q-check { font-size: 16px; color: var(--accent3); flex-shrink: 0; }
.q-name { font-size: 12px; color: var(--text-bright); font-weight: 600; flex: 1; line-height: 1.4; }
.q-expires { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.q-expires .label { font-size: 8px; }
.expires-time { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent2); font-weight: 700; }

.q-progress-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.q-progress-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.q-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), rgba(0,200,255,0.6)); border-radius: 3px; transition: width 0.4s ease; }
.q-progress-fill.full { background: linear-gradient(90deg, var(--accent3), rgba(58,255,122,0.6)); }
.q-progress-label { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--text-dim); white-space: nowrap; }

.q-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }
.q-reward { display: flex; flex-direction: column; }
.q-reward .label { font-size: 8px; margin-bottom: 2px; }
.reward-amount { font-family: 'Orbitron', sans-serif; font-size: 12px; color: var(--accent); font-weight: 700; }
.reward-amount.weekly-reward { color: #ffd700; }

.btn-claim { background: rgba(58,255,122,0.1); border: 1px solid var(--accent3); color: var(--accent3); padding: 5px 14px; border-radius: 4px; cursor: pointer; font-size: 11px; font-family: 'Orbitron', sans-serif; font-weight: 700; letter-spacing: 0.5px; transition: all 0.2s; }
.btn-claim:hover:not(:disabled) { background: rgba(58,255,122,0.2); box-shadow: 0 0 10px rgba(58,255,122,0.2); }
.btn-claim:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-claim.weekly { border-color: #ffd700; color: #ffd700; background: rgba(255,215,0,0.08); }
.btn-claim.weekly:hover:not(:disabled) { background: rgba(255,215,0,0.15); box-shadow: 0 0 10px rgba(255,215,0,0.2); }

.claimed-label { font-size: 11px; color: var(--accent3); font-family: 'Orbitron', sans-serif; font-weight: 700; opacity: 0.7; }

.empty-msg.small { font-size: 11px; color: var(--text-dim); padding: 8px 0; }

@media (max-width: 480px) {
  .missions-grid { grid-template-columns: 1fr; }
  .quests-grid { grid-template-columns: 1fr; }
  .tab-toggle { gap: 4px; }
  .tab-btn { padding: 4px 8px; font-size: 10px; }
}
</style>
