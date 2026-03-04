<template>
  <div class="market-layout">
    <div class="market-grid">
      <!-- ── GALACTIC EXCHANGE ── -->
      <div class="panel exchange-panel">
        <div class="panel-header">
          <span class="panel-icon">⚖️</span>
          <h3>{{ L.t('market.title') }}</h3>
          <button class="btn-sm" @click="showCreate = true">+ {{ L.t('market.createOffer') }}</button>
        </div>
        <div class="panel-body no-padding">
          <div class="market-tabs">
            <button v-for="t in ['all', 'metal', 'crystal', 'deus', 'mine']" :key="t" 
              :class="{ active: filterType === t }" @click="filterType = t" class="m-tab">
              {{ t === 'mine' ? L.t('market.myOffers') : (t === 'all' ? 'Összes' : L.t('res.' + t)) }}
            </button>
          </div>

          <div class="table-wrapper">
            <table class="market-table">
              <thead>
                <tr>
                  <th>{{ L.t('market.player') }}</th>
                  <th>{{ L.t('market.offer') }}</th>
                  <th>{{ L.t('market.seek') }}</th>
                  <th>{{ L.t('market.ratio') }}</th>
                  <th style="text-align:right;">{{ L.t('market.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading" class="loading-row"><td colspan="5">Betöltés...</td></tr>
                <tr v-else-if="filteredOffers.length === 0" class="empty-row"><td colspan="5">{{ L.t('market.noOffers') }}</td></tr>
                <tr v-for="o in filteredOffers" :key="m.id" :class="{ 'own-offer': o.user_id === auth.userId }">
                  <td class="player-cell">
                    <span class="player-name">{{ o.username }}</span>
                    <span v-if="o.user_id === auth.userId" class="own-tag">Saját</span>
                  </td>
                  <td class="res-cell offer">
                    <span class="res-icon">{{ resIcon(o.offer_res) }}</span>
                    <span class="res-val">{{ Math.floor(o.offer_amt).toLocaleString('hu') }}</span>
                  </td>
                  <td class="res-cell seek">
                    <span class="res-icon">{{ resIcon(o.seek_res) }}</span>
                    <span class="res-val">{{ Math.floor(o.seek_amt).toLocaleString('hu') }}</span>
                  </td>
                  <td class="ratio-cell">{{ (o.seek_amt / o.offer_amt).toFixed(2) }}</td>
                  <td class="actions-cell">
                    <button v-if="o.user_id === auth.userId" class="btn-cancel" @click="cancelOffer(o.id)" :disabled="busy === o.id">✕</button>
                    <button v-else class="btn-accept" @click="acceptOffer(o)" :disabled="busy === o.id || !canAfford(o)">{{ L.t('market.tradeBtn') }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── NPC TRADER ── -->
      <div class="panel npc-panel">
        <div class="panel-header">
          <span class="panel-icon">🤖</span>
          <h3>{{ L.t('market.npcTitle') }}</h3>
        </div>
        <div class="panel-body">
          <p class="npc-info">{{ L.t('market.npcRatioInfo') }}</p>
          
          <div class="npc-form">
            <div class="trade-side">
              <label>{{ L.t('market.give') }}</label>
              <div class="res-select">
                <button v-for="r in ['metal','crystal','deus']" :key="r" 
                  :class="{ active: npcGive === r }" @click="npcGive = r" class="res-btn">
                  {{ resIcon(r) }} {{ L.t('res.' + r) }}
                </button>
              </div>
              <input type="number" v-model.number="npcAmt" class="input" :max="currentRes[npcGive]" />
              <button class="btn-xs" @click="npcAmt = Math.floor(currentRes[npcGive])">MAX</button>
            </div>

            <div class="trade-arrow">➔</div>

            <div class="trade-side">
              <label>{{ L.t('market.get') }}</label>
              <div class="res-select">
                <button v-for="r in ['metal','crystal','deus']" :key="r" 
                  :class="{ active: npcGet === r, disabled: npcGive === r }" 
                  @click="npcGive !== r && (npcGet = r)" class="res-btn">
                  {{ resIcon(r) }} {{ L.t('res.' + r) }}
                </button>
              </div>
              <div class="npc-result">
                {{ Math.floor(npcPreview).toLocaleString('hu') }} {{ resIcon(npcGet) }}
              </div>
            </div>

            <button class="btn-primary full-width" @click="doNpcTrade" :disabled="npcAmt <= 0 || npcGive === npcGet || npcBusy">
              {{ npcBusy ? '...' : L.t('market.tradeBtn') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE OFFER MODAL -->
    <Transition name="fade">
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="panel create-modal">
          <div class="panel-header"><h3>{{ L.t('market.createOffer') }}</h3></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="field">
                <label>{{ L.t('market.give') }}</label>
                <select v-model="newOffer.offerRes" class="input">
                  <option value="metal">Fém</option>
                  <option value="crystal">Kristály</option>
                  <option value="deus">Déusium</option>
                </select>
                <input type="number" v-model.number="newOffer.offerAmt" class="input" placeholder="Mennyiség" />
              </div>
              <div class="field">
                <label>{{ L.t('market.get') }}</label>
                <select v-model="newOffer.seekRes" class="input">
                  <option value="metal">Fém</option>
                  <option value="crystal">Kristály</option>
                  <option value="deus">Déusium</option>
                </select>
                <input type="number" v-model.number="newOffer.seekAmt" class="input" placeholder="Mennyiség" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showCreate = false">{{ L.t('market.cancelBtn') }}</button>
              <button class="btn-primary" @click="createOffer" :disabled="creating">KÖZZÉTÉTEL</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { useAuthStore } from '@/stores/auth.js';
import { useLangStore } from '@/stores/lang.js';
import { api } from '@/api/client.js';
import { audio } from '@/utils/botAudio.js';

const game = useGameStore();
const auth = useAuthStore();
const L    = useLangStore();

const offers  = ref([]);
const loading = ref(false);
const busy    = ref(null);
const filterType = ref('all');

const showCreate = ref(false);
const creating   = ref(false);
const newOffer   = ref({ offerRes: 'metal', offerAmt: 10000, seekRes: 'crystal', seekAmt: 5000 });

const npcGive = ref('metal');
const npcGet  = ref('crystal');
const npcAmt  = ref(1000);
const npcBusy = ref(false);

const currentRes = computed(() => game.resources);

const npcPreview = computed(() => {
    const ratios = { metal: { crystal: 0.5, deus: 0.25 }, crystal: { metal: 2.0, deus: 0.5 }, deus: { metal: 4.0, crystal: 2.0 } };
    return npcAmt.value * (ratios[npcGive.value]?.[npcGet.value] || 0);
});

const filteredOffers = computed(() => {
    let list = offers.value;
    if (filterType.value === 'mine') return list.filter(o => o.user_id === auth.userId);
    if (filterType.value !== 'all') return list.filter(o => o.offer_res === filterType.value || o.seek_res === filterType.value);
    return list;
});

async function loadOffers() {
  loading.value = true;
  try { const data = await api.getMarketOffers(); offers.value = data.offers || []; } catch {}
  loading.value = false;
}

function resIcon(r) { return { metal: '⚙️', crystal: '💎', deus: '🔮' }[r] || '📦'; }

function canAfford(o) { return currentRes.value[o.seek_res] >= o.seek_amt; }

async function createOffer() {
  creating.value = true;
  try {
    await api.createMarketOffer(newOffer.value.offerRes, newOffer.value.offerAmt, newOffer.value.seekRes, newOffer.value.seekAmt, game.activePlanet.id);
    game.notify(L.t('market.successCreate'), 'green');
    showCreate.value = false;
    await Promise.all([loadOffers(), game.loadState()]);
  } catch (e) { game.notify(e.message, 'red'); }
  creating.value = false;
}

async function acceptOffer(offer) {
  busy.value = offer.id;
  try {
    await api.acceptMarketOffer(offer.id, game.activePlanet.id);
    game.notify(L.t('market.successAccept'), 'green');
    audio.success();
    await Promise.all([loadOffers(), game.loadState()]);
  } catch (e) { game.notify(e.message, 'red'); }
  busy.value = null;
}

async function cancelOffer(id) {
  busy.value = id;
  try {
    await api.cancelMarketOffer(id);
    game.notify(L.t('market.successCancel'), 'blue');
    await Promise.all([loadOffers(), game.loadState()]);
  } catch (e) { game.notify(e.message, 'red'); }
  busy.value = null;
}

async function doNpcTrade() {
    npcBusy.value = true;
    try {
        await api.npcTrade(npcGive.value, npcAmt.value, npcGet.value, game.activePlanet.id);
        game.notify('Sikeres NPC csere!', 'green');
        audio.success();
        await game.loadState();
    } catch (e) { game.notify(e.message, 'red'); }
    npcBusy.value = false;
}

onMounted(loadOffers);
</script>

<style scoped>
.market-layout { }
.market-grid { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
@media (max-width: 900px) { .market-grid { grid-template-columns: 1fr; } }

.exchange-panel { }
.no-padding { padding: 0 !important; }

.market-tabs { display: flex; background: rgba(0,0,0,0.3); border-bottom: 1px solid var(--border); }
.m-tab { flex: 1; padding: 10px; background: none; border: none; color: var(--text-dim); cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid transparent; }
.m-tab:hover { color: #fff; background: rgba(255,255,255,0.02); }
.m-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: rgba(0,200,255,0.05); }

.table-wrapper { overflow-x: auto; }
.market-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.market-table th { text-align: left; padding: 12px 15px; font-size: 10px; text-transform: uppercase; color: var(--text-dim); border-bottom: 1px solid var(--border); }
.market-table td { padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.market-table tr:hover td { background: rgba(255,255,255,0.02); }

.player-name { color: var(--text-bright); font-weight: 600; }
.own-tag { font-size: 9px; background: var(--accent); color: #000; padding: 1px 4px; border-radius: 3px; margin-left: 6px; }
.own-offer td { background: rgba(0,200,255,0.03); }

.res-cell { font-family: 'Orbitron', sans-serif; }
.res-icon { margin-right: 6px; }
.res-val { color: var(--text-bright); }
.offer .res-val { color: var(--green); }
.seek .res-val { color: var(--accent2); }

.ratio-cell { color: var(--text-dim); font-size: 11px; }

.btn-accept { background: var(--accent); color: #000; border: none; padding: 5px 12px; border-radius: 4px; font-weight: 800; cursor: pointer; font-size: 11px; }
.btn-accept:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-cancel { background: none; border: 1px solid var(--accent2); color: var(--accent2); width: 24px; height: 24px; border-radius: 4px; cursor: pointer; }

/* NPC Trader */
.npc-info { font-size: 12px; color: var(--text-dim); margin-bottom: 20px; line-height: 1.4; }
.npc-form { display: flex; flex-direction: column; gap: 15px; }
.trade-side { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
.trade-side label { font-size: 10px; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 10px; }

.res-select { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 10px; }
.res-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-dim); padding: 6px; border-radius: 4px; cursor: pointer; font-size: 10px; }
.res-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(0,200,255,0.1); }
.res-btn.disabled { opacity: 0.2; cursor: not-allowed; }

.trade-arrow { text-align: center; font-size: 24px; color: var(--accent); }
.npc-result { font-size: 18px; font-family: 'Orbitron', sans-serif; color: #fff; font-weight: 800; text-align: center; padding: 10px; }

.input { width: 100%; background: #000; border: 1px solid var(--border); color: #fff; padding: 8px; border-radius: 4px; margin-bottom: 5px; }
.btn-xs { font-size: 9px; padding: 2px 6px; background: rgba(255,255,255,0.1); border: 1px solid var(--border); color: #fff; cursor: pointer; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.create-modal { width: 400px; color: #fff; }
.form-grid { display: grid; gap: 20px; }
.field label { font-size: 11px; color: var(--accent); display: block; margin-bottom: 6px; }
.modal-footer { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
</style>
