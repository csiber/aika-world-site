<template>
  <div class="battle-canvas-wrapper">
    <canvas
      ref="canvasEl"
      class="battle-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    <div class="canvas-controls">
      <button class="bc-btn" @click="togglePlay">
        {{ isPlaying ? 'Szünet' : 'Lejátszás' }}
      </button>
      <button class="bc-btn" @click="restart">Újra</button>
      <span class="bc-label">Kör {{ displayRound }}/{{ totalRounds }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  battleData: { type: Object, required: true },
  playing: { type: Boolean, default: true },
});

const canvasEl = ref(null);
const canvasWidth = 800;
const canvasHeight = 500;

// ── Animation state ──
const isPlaying = ref(props.playing);
const currentRound = ref(0);
const phase = ref('idle'); // idle, charge, fire, damage, pause, done
const phaseProgress = ref(0); // 0..1
const displayRound = ref(0);

const PHASE_DURATIONS = { charge: 500, fire: 800, damage: 500, pause: 300 };

// ── Stars (static background) ──
const stars = [];
for (let i = 0; i < 120; i++) {
  stars.push({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    r: Math.random() * 1.5 + 0.3,
    a: Math.random() * 0.6 + 0.2,
    twinkleSpeed: Math.random() * 0.002 + 0.001,
  });
}

// ── Ship type → drawing config ──
const SHIP_CONFIG = {
  fighter_s: { shape: 'triangle', size: 8, label: 'F' },
  fighter_l: { shape: 'triangle', size: 12, label: 'F+' },
  cruiser: { shape: 'diamond', size: 14, label: 'C' },
  battleship: { shape: 'hexagon', size: 20, label: 'B' },
  recycler: { shape: 'circle', size: 12, label: 'R' },
  miner: { shape: 'circle', size: 10, label: 'M' },
  colony: { shape: 'square', size: 10, label: 'Co' },
  laser_turret: { shape: 'diamond', size: 10, label: 'LT' },
  missile_launcher: { shape: 'triangle', size: 10, label: 'ML' },
  plasma_cannon: { shape: 'hexagon', size: 14, label: 'PC' },
  shield_dome: { shape: 'circle', size: 16, label: 'SD' },
};

const COLOR_ATK = '#00c8ff';
const COLOR_DEF = '#ff3a7a';
const COLOR_ATK_DIM = 'rgba(0,200,255,0.3)';
const COLOR_DEF_DIM = 'rgba(255,58,122,0.3)';

// ── Build ship arrays from battle data ──
let atkShips = [];
let defShips = [];
let particles = [];
let lasers = [];
let lootParticles = [];
let overlayText = '';
let overlayAlpha = 0;

function buildFleets() {
  atkShips = [];
  defShips = [];
  particles = [];
  lasers = [];
  lootParticles = [];
  overlayText = '';
  overlayAlpha = 0;

  const bd = props.battleData;
  if (!bd) return;

  const atkFleet = bd.initialAtkFleet || bd.attackerFleet || [];
  const defFleet = bd.initialDefFleet || bd.defenderFleet || [];

  // Place attacker ships on the left
  let idx = 0;
  for (const group of atkFleet) {
    const count = group.count || 0;
    for (let i = 0; i < Math.min(count, 30); i++) {
      const row = idx % 8;
      const col = Math.floor(idx / 8);
      atkShips.push({
        x: 60 + col * 35,
        y: 50 + row * 52,
        baseX: 60 + col * 35,
        baseY: 50 + row * 52,
        type: group.shipType || group.id,
        alive: true,
        team: 'attacker',
      });
      idx++;
    }
  }

  // Place defender ships on the right
  idx = 0;
  for (const group of defFleet) {
    const count = group.count || 0;
    for (let i = 0; i < Math.min(count, 30); i++) {
      const row = idx % 8;
      const col = Math.floor(idx / 8);
      defShips.push({
        x: canvasWidth - 60 - col * 35,
        y: 50 + row * 52,
        baseX: canvasWidth - 60 - col * 35,
        baseY: 50 + row * 52,
        type: group.shipType || group.id,
        alive: true,
        team: 'defender',
      });
      idx++;
    }
  }
}

const totalRounds = computed(() => {
  const bd = props.battleData;
  if (!bd) return 0;
  return (bd.rounds || bd.roundLog || []).length || 0;
});

// ── Determine how many ships die per round ──
function getDestroyedCounts(roundIdx) {
  const bd = props.battleData;
  if (!bd) return { atkLost: 0, defLost: 0 };

  const rounds = bd.rounds || bd.roundLog || [];
  const round = rounds[roundIdx];
  if (!round) return { atkLost: 0, defLost: 0 };

  // If round has events array with destroyed counts
  if (round.events) {
    let atkLost = 0;
    let defLost = 0;
    for (const ev of round.events) {
      if (ev.destroyed > 0) {
        // if attacker is firing, defender loses ships
        if (ev.side === 'attacker') defLost += ev.destroyed;
        else atkLost += ev.destroyed;
      }
    }
    return { atkLost, defLost };
  }

  // Fallback: estimate from power ratios
  const atkPower = round.attackerPower || 0;
  const defPower = round.defenderPower || 0;
  const total = atkPower + defPower || 1;
  const defLostPct = Math.min(0.5, (atkPower / total) * 0.6);
  const atkLostPct = Math.min(0.3, (defPower / total) * 0.3);

  return {
    atkLost: Math.max(1, Math.floor(atkShips.filter(s => s.alive).length * atkLostPct)),
    defLost: Math.max(1, Math.floor(defShips.filter(s => s.alive).length * defLostPct)),
  };
}

// ── Drawing helpers ──
function drawShape(ctx, x, y, type, color, scale = 1) {
  const cfg = SHIP_CONFIG[type] || SHIP_CONFIG.fighter_s;
  const sz = cfg.size * scale;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  switch (cfg.shape) {
    case 'triangle':
      ctx.moveTo(x, y - sz);
      ctx.lineTo(x - sz * 0.8, y + sz * 0.6);
      ctx.lineTo(x + sz * 0.8, y + sz * 0.6);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(x, y - sz);
      ctx.lineTo(x + sz * 0.7, y);
      ctx.lineTo(x, y + sz);
      ctx.lineTo(x - sz * 0.7, y);
      ctx.closePath();
      break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const hx = x + sz * Math.cos(angle);
        const hy = y + sz * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      break;
    case 'circle':
      ctx.arc(x, y, sz, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(x - sz, y - sz, sz * 2, sz * 2);
      break;
  }
  ctx.fill();
  ctx.stroke();
}

function drawStars(ctx, time) {
  for (const s of stars) {
    const alpha = s.a + Math.sin(time * s.twinkleSpeed) * 0.2;
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0.05, alpha)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShips(ctx, ships, baseColor, dimColor, chargeOffset = 0) {
  for (const ship of ships) {
    if (!ship.alive) continue;
    const ox = ship.team === 'attacker' ? chargeOffset : -chargeOffset;
    // Glow
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 6;
    drawShape(ctx, ship.x + ox, ship.y, ship.type, baseColor, 1);
    ctx.shadowBlur = 0;
  }
}

function drawLasers(ctx) {
  for (const l of lasers) {
    const alpha = l.alpha || 1;
    ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = COLOR_ATK;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x1 + (l.x2 - l.x1) * l.progress, l.y1 + (l.y2 - l.y1) * l.progress);
    ctx.stroke();

    // Shield flash at impact
    if (l.progress > 0.9) {
      ctx.fillStyle = `rgba(255,255,255,${(1 - l.progress) * 5})`;
      ctx.beginPath();
      ctx.arc(l.x2, l.y2, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

function drawParticles(ctx) {
  for (const p of particles) {
    if (p.life <= 0) continue;
    const alpha = p.life;
    ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLootAnimation(ctx) {
  for (const lp of lootParticles) {
    if (lp.life <= 0) continue;
    ctx.fillStyle = `rgba(${lp.color},${lp.life})`;
    ctx.font = `${14 * lp.life + 8}px "Exo 2", sans-serif`;
    ctx.fillText(lp.text, lp.x, lp.y);
  }
}

function drawOverlay(ctx) {
  if (overlayAlpha <= 0 || !overlayText) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, overlayAlpha);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, canvasHeight / 2 - 50, canvasWidth, 100);

  ctx.font = 'bold 36px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow
  const isWin = overlayText.includes('GY') || overlayText.includes('WIN');
  const glowColor = isWin ? '#00c8ff' : '#ff3a7a';
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.fillStyle = glowColor;
  ctx.fillText(overlayText, canvasWidth / 2, canvasHeight / 2);

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Side labels ──
function drawLabels(ctx) {
  ctx.font = 'bold 11px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR_ATK;
  ctx.fillText('ATTACKER', 100, canvasHeight - 14);
  ctx.fillStyle = COLOR_DEF;
  ctx.fillText('DEFENDER', canvasWidth - 100, canvasHeight - 14);
}

// ── Animation loop ──
let animFrame = 0;
let lastTime = 0;
let phaseTimer = 0;
let roundDestroyedAtk = 0;
let roundDestroyedDef = 0;

function tick(time) {
  const dt = lastTime ? time - lastTime : 16;
  lastTime = time;

  const ctx = canvasEl.value?.getContext('2d');
  if (!ctx) { animFrame = requestAnimationFrame(tick); return; }

  // Clear
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Stars
  drawStars(ctx, time);

  // Compute charge offset
  let chargeOffset = 0;
  if (phase.value === 'charge') {
    chargeOffset = phaseProgress.value * 20;
  } else if (phase.value === 'fire' || phase.value === 'damage') {
    chargeOffset = 20;
  }

  // Draw ships
  drawShips(ctx, atkShips, COLOR_ATK, COLOR_ATK_DIM, chargeOffset);
  drawShips(ctx, defShips, COLOR_DEF, COLOR_DEF_DIM, chargeOffset);

  // Draw lasers
  drawLasers(ctx);

  // Draw particles
  drawParticles(ctx);

  // Draw loot
  drawLootAnimation(ctx);

  // Draw overlay
  drawOverlay(ctx);

  // Labels
  drawLabels(ctx);

  // ── Update animation state ──
  if (isPlaying.value && phase.value !== 'done') {
    phaseTimer += dt;

    if (phase.value === 'idle') {
      if (currentRound.value < totalRounds.value) {
        phase.value = 'charge';
        phaseTimer = 0;
        displayRound.value = currentRound.value + 1;
        const counts = getDestroyedCounts(currentRound.value);
        roundDestroyedAtk = counts.atkLost;
        roundDestroyedDef = counts.defLost;
      } else {
        // All rounds done, show result
        phase.value = 'done';
        showResult();
      }
    } else if (phase.value === 'charge') {
      phaseProgress.value = Math.min(1, phaseTimer / PHASE_DURATIONS.charge);
      if (phaseTimer >= PHASE_DURATIONS.charge) {
        phase.value = 'fire';
        phaseTimer = 0;
        phaseProgress.value = 0;
        spawnLasers();
      }
    } else if (phase.value === 'fire') {
      phaseProgress.value = Math.min(1, phaseTimer / PHASE_DURATIONS.fire);
      // Update laser progress
      for (const l of lasers) {
        l.progress = Math.min(1, phaseProgress.value * 1.3);
        l.alpha = 1 - phaseProgress.value * 0.5;
      }
      if (phaseTimer >= PHASE_DURATIONS.fire) {
        phase.value = 'damage';
        phaseTimer = 0;
        phaseProgress.value = 0;
        applyDamageVisual();
      }
    } else if (phase.value === 'damage') {
      phaseProgress.value = Math.min(1, phaseTimer / PHASE_DURATIONS.damage);
      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
      }
      particles = particles.filter(p => p.life > 0);

      if (phaseTimer >= PHASE_DURATIONS.damage) {
        phase.value = 'pause';
        phaseTimer = 0;
        lasers = [];
      }
    } else if (phase.value === 'pause') {
      if (phaseTimer >= PHASE_DURATIONS.pause) {
        currentRound.value++;
        phase.value = 'idle';
        phaseTimer = 0;
      }
    }
  }

  // Update loot particles
  for (const lp of lootParticles) {
    lp.x += lp.vx;
    lp.y += lp.vy;
    lp.life -= 0.005;
  }
  lootParticles = lootParticles.filter(lp => lp.life > 0);

  // Fade in overlay
  if (phase.value === 'done' && overlayText) {
    overlayAlpha = Math.min(1, overlayAlpha + 0.02);
  }

  animFrame = requestAnimationFrame(tick);
}

function spawnLasers() {
  lasers = [];
  const aliveAtk = atkShips.filter(s => s.alive);
  const aliveDef = defShips.filter(s => s.alive);
  if (!aliveAtk.length || !aliveDef.length) return;

  // Each attacker fires at a random defender
  const numLasers = Math.min(aliveAtk.length, 12);
  for (let i = 0; i < numLasers; i++) {
    const src = aliveAtk[i % aliveAtk.length];
    const tgt = aliveDef[Math.floor(Math.random() * aliveDef.length)];
    lasers.push({
      x1: src.x + 20, y1: src.y,
      x2: tgt.x - 20, y2: tgt.y,
      progress: 0,
      alpha: 1,
    });
  }

  // Some defenders fire back (fewer)
  const numDefLasers = Math.min(aliveDef.length, 6);
  for (let i = 0; i < numDefLasers; i++) {
    const src = aliveDef[i % aliveDef.length];
    const tgt = aliveAtk[Math.floor(Math.random() * aliveAtk.length)];
    lasers.push({
      x1: src.x - 20, y1: src.y,
      x2: tgt.x + 20, y2: tgt.y,
      progress: 0,
      alpha: 1,
    });
  }
}

function spawnExplosion(x, y) {
  const count = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    const isOrange = Math.random() > 0.4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: isOrange ? 255 : 255,
      g: isOrange ? 165 : 220,
      b: isOrange ? 0 : 50,
      size: Math.random() * 4 + 2,
      life: 1,
    });
  }
}

function applyDamageVisual() {
  // Kill some defender ships
  let defKilled = 0;
  for (const ship of defShips) {
    if (!ship.alive) continue;
    if (defKilled >= roundDestroyedDef) break;
    ship.alive = false;
    spawnExplosion(ship.x, ship.y);
    defKilled++;
  }

  // Kill some attacker ships
  let atkKilled = 0;
  for (const ship of atkShips) {
    if (!ship.alive) continue;
    if (atkKilled >= roundDestroyedAtk) break;
    ship.alive = false;
    spawnExplosion(ship.x, ship.y);
    atkKilled++;
  }
}

function showResult() {
  const bd = props.battleData;
  if (!bd) return;

  const won = bd.attackerWins;
  overlayText = won ? 'ATTACKER WINS!' : 'DEFENDER WINS!';
  overlayAlpha = 0;

  // Loot animation if attacker wins
  if (won && bd.loot) {
    const resources = [];
    if (bd.loot.metal > 0) resources.push({ text: `Fe ${Math.floor(bd.loot.metal)}`, color: '180,180,200' });
    if (bd.loot.crystal > 0) resources.push({ text: `Cr ${Math.floor(bd.loot.crystal)}`, color: '100,200,255' });
    if (bd.loot.deus > 0) resources.push({ text: `De ${Math.floor(bd.loot.deus)}`, color: '200,100,255' });

    for (let i = 0; i < resources.length; i++) {
      lootParticles.push({
        x: canvasWidth - 80,
        y: 100 + i * 40,
        vx: -0.5,
        vy: 0,
        text: resources[i].text,
        color: resources[i].color,
        life: 1.5,
      });
    }
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
}

function restart() {
  currentRound.value = 0;
  displayRound.value = 0;
  phase.value = 'idle';
  phaseProgress.value = 0;
  phaseTimer = 0;
  lasers = [];
  particles = [];
  lootParticles = [];
  overlayText = '';
  overlayAlpha = 0;
  buildFleets();
  isPlaying.value = true;
}

watch(() => props.playing, (val) => {
  isPlaying.value = val;
});

watch(() => props.battleData, () => {
  restart();
}, { deep: true });

onMounted(() => {
  buildFleets();
  animFrame = requestAnimationFrame(tick);
});

onUnmounted(() => {
  cancelAnimationFrame(animFrame);
});
</script>

<style scoped>
.battle-canvas-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 16px;
}

.battle-canvas {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.08), inset 0 0 40px rgba(0, 0, 0, 0.3);
}

.canvas-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  justify-content: center;
}

.bc-btn {
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00c8ff;
  padding: 4px 14px;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'Exo 2', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.bc-btn:hover {
  background: rgba(0, 200, 255, 0.2);
}

.bc-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  margin-left: 8px;
}
</style>
