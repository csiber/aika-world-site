<template>
  <div class="tactical-layout">
    <!-- Loading -->
    <div v-if="loading" class="tactical-loading">
      <div class="loading-icon">⚔️</div>
      <div class="loading-text">Taktikai csata betöltése...</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="tactical-error">
      <div class="error-icon">⚠️</div>
      <div class="error-text">{{ error }}</div>
      <button class="btn-primary" @click="loadBattle">Újrapróbálás</button>
    </div>

    <!-- Battle UI -->
    <div v-else-if="battle" class="tactical-main">

      <!-- Header bar -->
      <div class="tactical-header">
        <div class="th-left">
          <span class="th-icon">⚔️</span>
          <div>
            <div class="th-title">TAKTIKAI CSATA</div>
            <div class="th-sub">{{ battle.planetCoords }} — Kör {{ battle.currentRound }}/{{ battle.maxRounds }}</div>
          </div>
        </div>
        <div class="th-center">
          <div class="status-badge" :class="battle.status">{{ statusLabel }}</div>
        </div>
        <div class="th-right">
          <div v-if="battle.status !== 'resolved'" class="timer-display">
            <span class="timer-label">Auto-feloldás:</span>
            <span class="timer-value">{{ autoResolveCountdown }}</span>
          </div>
          <button class="btn-auto" @click="doAutoResolve" :disabled="busy">
            {{ busy ? '...' : 'Auto-feloldás' }}
          </button>
        </div>
      </div>

      <!-- ═══ FORMATION PHASE ═══ -->
      <div v-if="battle.status === 'pending_formation'" class="phase-formation">
        <div class="phase-title">FORMÁCIÓ FELÁLLÍTÁS</div>
        <div class="phase-desc">Húzd a hajócsoportokat a kívánt pozícióba a rácson, majd kattints a "Kész" gombra.</div>

        <div class="battlefield-wrapper">
          <!-- Attacker side label -->
          <div class="side-label attacker-label">TÁMADÓ</div>

          <!-- Grid -->
          <div class="battlefield-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.key"
              class="grid-cell"
              :class="{
                'has-unit': cell.unit,
                'attacker-unit': cell.unit && cell.side === 'attacker',
                'defender-unit': cell.unit && cell.side === 'defender',
                'drop-target': dragActive,
                'drag-over': dragOverCell === cell.key,
              }"
              @dragover.prevent="onDragOver(cell)"
              @dragleave="onDragLeave"
              @drop="onDrop(cell)"
            >
              <div v-if="cell.unit" class="cell-content"
                :draggable="cell.side === mySide"
                @dragstart="onDragStart(cell)"
                @dragend="onDragEnd"
              >
                <div class="cell-icon">{{ shipIcon(cell.unit.shipType) }}</div>
                <div class="cell-count">{{ cell.unit.count }}</div>
                <div class="cell-hp-bar">
                  <div class="cell-hp-fill" :style="{ width: hpPercent(cell.unit) + '%' }"></div>
                </div>
              </div>
              <div v-else class="cell-empty">
                <span class="cell-coords">{{ cell.row }},{{ cell.col }}</span>
              </div>
            </div>
          </div>

          <!-- Defender side label -->
          <div class="side-label defender-label">VÉDEKEZŐ</div>
        </div>

        <!-- Ship info panel -->
        <div class="ship-info-panel" v-if="selectedUnit">
          <div class="sip-header">
            <span class="sip-icon">{{ shipIcon(selectedUnit.shipType) }}</span>
            <div class="sip-name">{{ shipName(selectedUnit.shipType) }}</div>
          </div>
          <div class="sip-stats">
            <span>Darab: {{ selectedUnit.count }}</span>
            <span>HP: {{ Math.floor(selectedUnit.hp) }}/{{ Math.floor(selectedUnit.maxHp) }}</span>
            <span>Támadás: {{ selectedUnit.attack }}</span>
            <span>Pajzs: {{ selectedUnit.shield }}</span>
          </div>
          <div class="sip-abilities" v-if="selectedUnit.abilities?.length">
            <div v-for="ab in selectedUnit.abilities" :key="ab.id" class="ability-tag">
              {{ ab.icon }} {{ ab.name }} (CD: {{ ab.cooldown }})
            </div>
          </div>
        </div>

        <div class="formation-actions">
          <button class="btn-primary" @click="submitFormation" :disabled="busy">
            {{ busy ? 'Küldés...' : 'Kész — Formáció elküldése' }}
          </button>
        </div>
      </div>

      <!-- ═══ SIMULATING / BATTLE PHASE ═══ -->
      <div v-if="battle.status === 'simulating'" class="phase-battle">
        <div class="phase-title">CSATA FOLYAMATBAN</div>

        <!-- Orders panel -->
        <div class="orders-panel">
          <div class="orders-section">
            <label class="orders-label">Célpont prioritás:</label>
            <select v-model="targetPriority" class="orders-select">
              <option value="closest">Legközelebbi</option>
              <option value="weakest_first">Leggyengébb először</option>
              <option value="strongest_first">Legerősebb először</option>
            </select>
            <button class="btn-secondary" @click="submitOrders" :disabled="busy">Parancs küldése</button>
          </div>

          <!-- Ability buttons -->
          <div class="ability-panel" v-if="myUnitsWithAbilities.length">
            <div class="orders-label">Képességek:</div>
            <div class="ability-buttons">
              <button
                v-for="ua in myUnitsWithAbilities"
                :key="ua.shipType + '-' + ua.ability.id"
                class="btn-ability"
                :class="{ active: isAbilityQueued(ua.shipType, ua.ability.id), 'on-cooldown': ua.cooldown > 0 }"
                @click="toggleAbility(ua.shipType, ua.ability.id)"
                :disabled="ua.cooldown > 0"
              >
                {{ ua.ability.icon }} {{ shipName(ua.shipType) }}: {{ ua.ability.name }}
                <span v-if="ua.cooldown > 0" class="cd-badge">CD:{{ ua.cooldown }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Battlefield -->
        <div class="battlefield-wrapper">
          <div class="side-label attacker-label">TÁMADÓ</div>
          <div class="battlefield-grid">
            <div
              v-for="cell in gridCells"
              :key="cell.key"
              class="grid-cell"
              :class="{
                'has-unit': cell.unit,
                'attacker-unit': cell.unit && cell.side === 'attacker',
                'defender-unit': cell.unit && cell.side === 'defender',
                'destroyed': cell.unit && cell.unit.count <= 0,
                'animating': cell.animating,
              }"
              @click="selectUnit(cell.unit)"
            >
              <div v-if="cell.unit" class="cell-content">
                <div class="cell-icon" :class="{ 'destroyed-icon': cell.unit.count <= 0 }">{{ shipIcon(cell.unit.shipType) }}</div>
                <div class="cell-count" :class="{ zero: cell.unit.count <= 0 }">{{ cell.unit.count }}</div>
                <div class="cell-hp-bar">
                  <div class="cell-hp-fill" :style="{ width: hpPercent(cell.unit) + '%' }" :class="hpClass(cell.unit)"></div>
                </div>
                <Transition name="dmg-fly">
                  <div v-if="cell.damageNumber" class="damage-number">-{{ cell.damageNumber }}</div>
                </Transition>
              </div>
            </div>
          </div>
          <div class="side-label defender-label">VÉDEKEZŐ</div>
        </div>

        <div class="battle-actions">
          <button class="btn-primary btn-advance" @click="advanceRound" :disabled="busy">
            {{ busy ? 'Szimuláció...' : 'Következő kör' }}
          </button>
        </div>
      </div>

      <!-- ═══ BATTLE CANVAS VISUALIZATION ═══ -->
      <BattleCanvas
        v-if="battle.status === 'resolved' && battle.result"
        :battleData="battle.result"
        :playing="true"
      />

      <!-- ═══ RESOLVED PHASE ═══ -->
      <div v-if="battle.status === 'resolved' && battle.result" class="phase-result">
        <div class="result-banner" :class="{ won: battle.result.attackerWins === isAttacker, lost: battle.result.attackerWins !== isAttacker }">
          <div class="result-icon">{{ battle.result.attackerWins === isAttacker ? '🏆' : '💀' }}</div>
          <div class="result-title">{{ battle.result.attackerWins === isAttacker ? 'GYŐZELEM!' : 'VERESÉG' }}</div>
        </div>

        <div class="result-details">
          <div class="result-panel">
            <div class="rp-title">Zsákmány</div>
            <div class="rp-row"><span>Fém:</span><span class="rp-val metal">{{ fmt(battle.result.loot?.metal) }}</span></div>
            <div class="rp-row"><span>Kristály:</span><span class="rp-val crystal">{{ fmt(battle.result.loot?.crystal) }}</span></div>
            <div class="rp-row"><span>Déusium:</span><span class="rp-val deus">{{ fmt(battle.result.loot?.deus) }}</span></div>
          </div>

          <div class="result-panel">
            <div class="rp-title">Törmelék</div>
            <div class="rp-row"><span>Fém:</span><span class="rp-val">{{ fmt(battle.result.debris?.metal) }}</span></div>
            <div class="rp-row"><span>Kristály:</span><span class="rp-val">{{ fmt(battle.result.debris?.crystal) }}</span></div>
            <div v-if="battle.result.moonCreated" class="moon-notice">🌑 ÚJ HOLD KELETKEZETT!</div>
          </div>
        </div>

        <button class="btn-primary" @click="$emit('close')">Vissza a küldetésekhez</button>
      </div>

      <!-- ═══ ROUND LOG ═══ -->
      <div class="round-log-panel" v-if="battle.roundLog?.length">
        <div class="rl-header">
          <span class="rl-icon">📜</span>
          <span class="rl-title">Kör Napló</span>
        </div>
        <div class="rl-body">
          <div v-for="round in battle.roundLog" :key="round.round" class="rl-round">
            <div class="rl-round-header">Kör {{ round.round }}</div>
            <div v-for="(ev, i) in round.events" :key="i" class="rl-event" :class="ev.side">
              <span class="rl-side">{{ ev.side === 'attacker' ? 'ATK' : 'DEF' }}</span>
              <span v-if="ev.dodged" class="rl-dodge">{{ shipIcon(ev.unit) }} → {{ shipIcon(ev.target) }} KITÉRVE!</span>
              <span v-else-if="ev.ability && ev.shieldBoost" class="rl-ability">{{ shipIcon(ev.unit) }} pajzs túltöltés aktív!</span>
              <span v-else-if="ev.ability && ev.dodgeActive" class="rl-ability">{{ shipIcon(ev.unit) }} kitérő manőver aktív!</span>
              <span v-else class="rl-hit">
                {{ shipIcon(ev.unit) }} → {{ shipIcon(ev.target) }}:
                <span class="rl-dmg">-{{ fmt(ev.damage) }}</span>
                <span v-if="ev.destroyed > 0" class="rl-destroyed">({{ ev.destroyed }} megsemmisült)</span>
                <span v-if="ev.abilityUsed" class="rl-ability-used">{{ ev.abilityUsed }}</span>
              </span>
            </div>
            <div class="rl-summary">
              Támadó: {{ round.attackerRemaining }} egység | Védekező: {{ round.defenderRemaining }} egység
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game.js';
import { api } from '@/api/client.js';
import BattleCanvas from '@/components/BattleCanvas.vue';

const props = defineProps({
  battleId: { type: String, required: true },
});

const emit = defineEmits(['close']);

const game = useGameStore();
const battle = ref(null);
const loading = ref(false);
const error = ref(null);
const busy = ref(false);
const selectedUnit = ref(null);
const dragActive = ref(false);
const dragOverCell = ref(null);
const dragSource = ref(null);
const targetPriority = ref('closest');
const queuedAbilities = ref([]);
const now = ref(Math.floor(Date.now() / 1000));

const GRID_ROWS = 6;
const GRID_COLS = 10;

const SHIP_ICONS = {
  fighter_s: '✈️', fighter_l: '🛸', cruiser: '🚀', battleship: '🛰️',
  miner: '⛏️', colony: '🌍', recycler: '♻️',
  laser_turret: '🔴', missile_launcher: '🚀', plasma_cannon: '💥', shield_dome: '🛡️',
};
const SHIP_NAMES = {
  fighter_s: 'Kis Vadász', fighter_l: 'Nagy Vadász', cruiser: 'Cirkáló', battleship: 'Csatahajó',
  miner: 'Bányász', colony: 'Gyarmatosító', recycler: 'Újrahasznosító',
  laser_turret: 'Lézertorony', missile_launcher: 'Rakétakilövő', plasma_cannon: 'Plazmaágyú', shield_dome: 'Pajzskupola',
};

function shipIcon(type) { return SHIP_ICONS[type] || '🔵'; }
function shipName(type) { return SHIP_NAMES[type] || type; }
function fmt(n) { return Math.floor(n || 0).toLocaleString('hu'); }
function hpPercent(unit) { return unit.maxHp > 0 ? Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100)) : 0; }
function hpClass(unit) {
  const pct = hpPercent(unit);
  if (pct > 60) return 'hp-good';
  if (pct > 30) return 'hp-warn';
  return 'hp-crit';
}

const isAttacker = computed(() => {
  if (!battle.value) return false;
  const userId = game.state?.activePlanet?.userId || '';
  // We don't have userId on activePlanet, let's compare with battle data
  return true; // Attacker initiated the battle view
});

const mySide = computed(() => isAttacker.value ? 'attacker' : 'defender');

const statusLabel = computed(() => {
  if (!battle.value) return '';
  const map = {
    pending_formation: 'Formáció felállítás',
    simulating: 'Csata folyamatban',
    resolved: 'Lezárult',
  };
  return map[battle.value.status] || battle.value.status;
});

const autoResolveCountdown = computed(() => {
  if (!battle.value || !battle.value.autoResolveAt) return '--:--';
  const diff = battle.value.autoResolveAt - now.value;
  if (diff <= 0) return 'Lejárt';
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

// Build the 6x10 grid from attacker + defender units
const gridCells = computed(() => {
  const cells = [];
  if (!battle.value) return cells;

  const atkUnits = battle.value.attackerFleet || [];
  const defUnits = battle.value.defenderFleet || [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const key = `${r}:${c}`;
      // Attacker on left half (cols 0-4), defender on right half (cols 5-9)
      let unit = null;
      let side = null;

      const atkUnit = atkUnits.find(u => u.row === r && u.col === c);
      const defUnit = defUnits.find(u => u.row === r && u.col === c);

      if (atkUnit) { unit = atkUnit; side = 'attacker'; }
      else if (defUnit) { unit = defUnit; side = 'defender'; }

      cells.push({ row: r, col: c, key, unit, side, damageNumber: null, animating: false });
    }
  }
  return cells;
});

const myUnitsWithAbilities = computed(() => {
  if (!battle.value) return [];
  const units = isAttacker.value ? (battle.value.attackerFleet || []) : (battle.value.defenderFleet || []);
  const result = [];
  for (const u of units) {
    if (u.count <= 0 || !u.abilities?.length) continue;
    for (const ab of u.abilities) {
      const cd = u.abilityCooldowns?.[ab.id] || 0;
      result.push({ shipType: u.shipType, ability: ab, cooldown: cd });
    }
  }
  return result;
});

function isAbilityQueued(shipType, abilityId) {
  return queuedAbilities.value.some(a => a.shipType === shipType && a.abilityId === abilityId);
}

function toggleAbility(shipType, abilityId) {
  const idx = queuedAbilities.value.findIndex(a => a.shipType === shipType && a.abilityId === abilityId);
  if (idx >= 0) queuedAbilities.value.splice(idx, 1);
  else queuedAbilities.value.push({ shipType, abilityId });
}

function selectUnit(unit) {
  selectedUnit.value = unit;
}

// Drag & drop for formation
function onDragStart(cell) {
  dragActive.value = true;
  dragSource.value = cell;
}
function onDragEnd() {
  dragActive.value = false;
  dragSource.value = null;
  dragOverCell.value = null;
}
function onDragOver(cell) {
  dragOverCell.value = cell.key;
}
function onDragLeave() {
  dragOverCell.value = null;
}
function onDrop(targetCell) {
  dragOverCell.value = null;
  dragActive.value = false;
  if (!dragSource.value || !dragSource.value.unit) return;

  const src = dragSource.value;
  const units = isAttacker.value ? battle.value.attackerFleet : battle.value.defenderFleet;

  // Swap positions
  const srcUnit = units.find(u => u.row === src.row && u.col === src.col);
  const tgtUnit = units.find(u => u.row === targetCell.row && u.col === targetCell.col);

  if (srcUnit) {
    if (tgtUnit) {
      // Swap
      const tmpRow = srcUnit.row;
      const tmpCol = srcUnit.col;
      srcUnit.row = tgtUnit.row;
      srcUnit.col = tgtUnit.col;
      tgtUnit.row = tmpRow;
      tgtUnit.col = tmpCol;
    } else {
      srcUnit.row = targetCell.row;
      srcUnit.col = targetCell.col;
    }
  }

  // Trigger reactivity
  if (isAttacker.value) {
    battle.value.attackerFleet = [...battle.value.attackerFleet];
  } else {
    battle.value.defenderFleet = [...battle.value.defenderFleet];
  }

  dragSource.value = null;
}

// ── API Calls ──────────────────────────────────────────

async function loadBattle() {
  loading.value = true;
  error.value = null;
  try {
    const data = await api.getTacticalBattle(props.battleId);
    battle.value = data.battle;
    game.activeBattle = data.battle;
  } catch (e) {
    error.value = e.message;
  }
  loading.value = false;
}

async function submitFormation() {
  if (!battle.value) return;
  busy.value = true;
  try {
    const units = isAttacker.value ? battle.value.attackerFleet : battle.value.defenderFleet;
    const formation = units.map(u => ({ shipType: u.shipType, row: u.row, col: u.col }));
    await api.submitFormation(props.battleId, formation);
    await loadBattle();
    game.notify('Formáció elküldve!', 'green');
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  busy.value = false;
}

async function submitOrders() {
  busy.value = true;
  try {
    const orders = {
      target_priority: targetPriority.value,
      abilities: queuedAbilities.value,
    };
    await api.submitOrders(props.battleId, orders);
    game.notify('Parancsok elküldve!', 'blue');
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  busy.value = false;
}

async function advanceRound() {
  busy.value = true;
  try {
    // Submit orders first
    const orders = {
      target_priority: targetPriority.value,
      abilities: queuedAbilities.value,
    };
    await api.submitOrders(props.battleId, orders);
    queuedAbilities.value = [];

    // Then advance
    const data = await api.advanceRound(props.battleId);
    if (data.resolved && data.result) {
      await loadBattle();
    } else {
      await loadBattle();
    }
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  busy.value = false;
}

async function doAutoResolve() {
  busy.value = true;
  try {
    await api.autoResolveBattle(props.battleId);
    await loadBattle();
    game.notify('Csata automatikusan feloldva!', 'blue');
  } catch (e) {
    game.notify(`Hiba: ${e.message}`, 'red');
  }
  busy.value = false;
}

// Timer ticker
let ticker;
onMounted(() => {
  loadBattle();
  ticker = setInterval(() => {
    now.value = Math.floor(Date.now() / 1000);
  }, 1000);
});
onUnmounted(() => {
  clearInterval(ticker);
});
</script>

<style scoped>
.tactical-layout {
  max-width: 1200px;
  margin: 0 auto;
}

.tactical-loading, .tactical-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
}
.loading-icon, .error-icon { font-size: 48px; animation: pulse 2s ease-in-out infinite; }
.loading-text, .error-text { font-family: 'Orbitron', sans-serif; font-size: 13px; color: var(--text-dim); letter-spacing: 1px; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); opacity: 0.7; } }

/* ── Header ── */
.tactical-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 16px;
  margin-bottom: 12px;
}
.th-left { display: flex; align-items: center; gap: 10px; }
.th-icon { font-size: 24px; }
.th-title { font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 900; color: var(--accent2); letter-spacing: 2px; }
.th-sub { font-size: 10px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.th-right { display: flex; align-items: center; gap: 12px; }

.status-badge {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  padding: 3px 10px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.status-badge.pending_formation { background: rgba(0,200,255,0.1); color: var(--accent); border: 1px solid var(--accent); }
.status-badge.simulating { background: rgba(255,165,0,0.1); color: #ffaa00; border: 1px solid #ffaa00; }
.status-badge.resolved { background: rgba(58,255,122,0.1); color: var(--accent3); border: 1px solid var(--accent3); }

.timer-display { text-align: right; }
.timer-label { font-size: 9px; color: var(--text-dim); display: block; }
.timer-value { font-family: 'Orbitron', sans-serif; font-size: 16px; color: var(--accent2); font-weight: 700; }

.btn-auto {
  background: rgba(255,58,122,0.1);
  border: 1px solid var(--accent2);
  color: var(--accent2);
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'Exo 2', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-auto:hover { background: rgba(255,58,122,0.2); }
.btn-auto:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Phase titles ── */
.phase-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.phase-desc { font-size: 11px; color: var(--text-dim); margin-bottom: 16px; }

/* ── Battlefield Grid ── */
.battlefield-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
}
.side-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 2px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 8px 2px;
}
.attacker-label { color: var(--accent); }
.defender-label { color: var(--accent2); }

.battlefield-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 2px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px;
  flex: 1;
  min-width: 600px;
}

.grid-cell {
  width: 100%;
  aspect-ratio: 1;
  min-width: 50px;
  min-height: 50px;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 3px;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.15s;
  cursor: default;
}
.grid-cell.has-unit { cursor: pointer; }
.grid-cell.attacker-unit { border-color: rgba(0,200,255,0.2); background: rgba(0,200,255,0.05); }
.grid-cell.defender-unit { border-color: rgba(255,58,122,0.2); background: rgba(255,58,122,0.05); }
.grid-cell.destroyed { opacity: 0.3; }
.grid-cell.drop-target { border-color: rgba(255,215,0,0.3); }
.grid-cell.drag-over { background: rgba(255,215,0,0.15); border-color: var(--accent4); }

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 100%;
  padding: 2px;
}
.cell-icon { font-size: 18px; }
.cell-icon.destroyed-icon { filter: grayscale(1); opacity: 0.5; }
.cell-count { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--text-bright); font-weight: 700; }
.cell-count.zero { color: var(--accent2); text-decoration: line-through; }

.cell-hp-bar { width: 80%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
.cell-hp-fill { height: 100%; transition: width 0.3s; }
.cell-hp-fill.hp-good { background: var(--accent3); }
.cell-hp-fill.hp-warn { background: #ffaa00; }
.cell-hp-fill.hp-crit { background: var(--accent2); }

.cell-empty { display: flex; align-items: center; justify-content: center; }
.cell-coords { font-size: 7px; color: rgba(255,255,255,0.1); font-family: 'Orbitron', sans-serif; }

.damage-number {
  position: absolute;
  top: -5px;
  right: 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 900;
  color: var(--accent2);
  text-shadow: 0 0 6px rgba(255,58,122,0.6);
  pointer-events: none;
}

/* ── Ship Info Panel ── */
.ship-info-panel {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.sip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.sip-icon { font-size: 24px; }
.sip-name { font-family: 'Orbitron', sans-serif; font-size: 12px; color: var(--text-bright); font-weight: 700; }
.sip-stats { display: flex; gap: 16px; font-size: 11px; color: var(--text-dim); margin-bottom: 8px; }
.sip-abilities { display: flex; gap: 8px; flex-wrap: wrap; }
.ability-tag {
  background: rgba(0,200,255,0.1);
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-family: 'Orbitron', sans-serif;
}

.formation-actions, .battle-actions {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

/* ── Orders Panel ── */
.orders-panel {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.orders-section { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.orders-label { font-size: 11px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; white-space: nowrap; }
.orders-select {
  background: rgba(0,0,0,0.5);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'Exo 2', sans-serif;
}
.orders-select option { background: #0a0f1c; }

.ability-buttons { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.btn-ability {
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Exo 2', sans-serif;
}
.btn-ability:hover { border-color: var(--accent); color: var(--accent); }
.btn-ability.active { background: rgba(0,200,255,0.15); border-color: var(--accent); color: var(--accent); }
.btn-ability.on-cooldown { opacity: 0.4; cursor: not-allowed; }
.cd-badge { background: var(--accent2); color: #000; font-size: 8px; padding: 1px 4px; border-radius: 3px; margin-left: 4px; font-weight: 700; }

/* ── Buttons ── */
.btn-primary {
  background: linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,200,255,0.05));
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 8px 24px;
  border-radius: 4px;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover { background: rgba(0,200,255,0.2); box-shadow: 0 0 15px rgba(0,200,255,0.2); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
.btn-secondary:disabled { opacity: 0.5; }

.btn-advance {
  padding: 10px 40px;
  font-size: 13px;
}

/* ── Result Phase ── */
.phase-result { text-align: center; }

.result-banner {
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.result-banner.won {
  background: linear-gradient(135deg, rgba(58,255,122,0.1), rgba(0,200,255,0.05));
  border: 1px solid var(--accent3);
}
.result-banner.lost {
  background: linear-gradient(135deg, rgba(255,58,122,0.1), rgba(255,58,122,0.02));
  border: 1px solid var(--accent2);
}
.result-icon { font-size: 48px; margin-bottom: 10px; }
.result-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 4px;
}
.result-banner.won .result-title { color: var(--accent3); text-shadow: 0 0 20px rgba(58,255,122,0.4); }
.result-banner.lost .result-title { color: var(--accent2); text-shadow: 0 0 20px rgba(255,58,122,0.4); }

.result-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}
.result-panel {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 14px;
  text-align: left;
}
.rp-title { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent); margin-bottom: 10px; letter-spacing: 1px; }
.rp-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-dim); padding: 3px 0; }
.rp-val { font-family: 'Orbitron', sans-serif; font-weight: 700; color: var(--text-bright); }
.rp-val.metal { color: var(--metal); }
.rp-val.crystal { color: var(--crystal); }
.rp-val.deus { color: var(--accent); }
.moon-notice { font-family: 'Orbitron', sans-serif; font-size: 12px; color: var(--accent4); margin-top: 10px; text-align: center; }

/* ── Round Log ── */
.round-log-panel {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
}
.rl-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(0,0,0,0.6);
}
.rl-icon { font-size: 16px; }
.rl-title { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--text-bright); letter-spacing: 1px; }
.rl-body { padding: 8px 14px; }
.rl-round { margin-bottom: 12px; }
.rl-round-header { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent); margin-bottom: 4px; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 2px; }
.rl-event { font-size: 10px; color: var(--text-dim); padding: 1px 0; display: flex; align-items: center; gap: 6px; }
.rl-event.attacker .rl-side { color: var(--accent); }
.rl-event.defender .rl-side { color: var(--accent2); }
.rl-side { font-family: 'Orbitron', sans-serif; font-size: 8px; font-weight: 900; min-width: 24px; }
.rl-dmg { color: var(--accent2); font-weight: 700; }
.rl-destroyed { color: #ffaa00; font-size: 9px; }
.rl-dodge { color: var(--accent3); font-style: italic; }
.rl-ability { color: var(--accent4); }
.rl-ability-used { background: rgba(0,200,255,0.1); border-radius: 3px; padding: 0 4px; color: var(--accent); font-size: 9px; margin-left: 2px; }
.rl-summary { font-size: 9px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.03); }

/* ── Animations ── */
.dmg-fly-enter-active { animation: dmgFly 0.6s ease-out; }
.dmg-fly-leave-active { transition: opacity 0.3s; }
.dmg-fly-enter-from { opacity: 0; transform: translateY(10px); }
.dmg-fly-leave-to { opacity: 0; }
@keyframes dmgFly {
  0% { opacity: 0; transform: translateY(10px); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-20px); }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .tactical-header { flex-direction: column; gap: 8px; align-items: flex-start; }
  .th-right { width: 100%; justify-content: space-between; }
  .battlefield-grid { min-width: 400px; }
  .grid-cell { min-width: 36px; min-height: 36px; }
  .cell-icon { font-size: 14px; }
  .result-details { grid-template-columns: 1fr; }
}
</style>
