<template>
  <div class="galaxy-canvas-wrapper">
    <canvas
      ref="canvasEl"
      class="galaxy-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @click="onClick"
    ></canvas>
    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="gc-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="gc-tt-name">{{ tooltip.name }}</div>
      <div v-if="tooltip.player" class="gc-tt-player">{{ tooltip.player }}</div>
      <div v-if="tooltip.score" class="gc-tt-score">Score: {{ tooltip.score.toLocaleString() }}</div>
      <div v-if="tooltip.debris" class="gc-tt-debris">Debris field</div>
      <div v-if="tooltip.missionType" class="gc-tt-mission">{{ tooltip.missionType }}</div>
      <div v-if="tooltip.ships" class="gc-tt-ships">{{ tooltip.ships }}</div>
      <div v-if="tooltip.eta" class="gc-tt-eta">ETA: {{ tooltip.eta }}</div>
      <div v-if="tooltip.slot" class="gc-tt-slot">Slot {{ tooltip.slot }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useGameStore } from '@/stores/game.js';

const gameStore = useGameStore();

const props = defineProps({
  galaxy: { type: Number, default: 1 },
  system: { type: Number, default: 1 },
  players: { type: Array, default: () => [] },
  myPlanets: { type: Array, default: () => [] },
  sectorClaims: { type: Array, default: () => [] },
  myUsername: { type: String, default: '' },
  allianceTag: { type: String, default: '' },
});

const emit = defineEmits(['planet-selected', 'navigate']);

const canvasEl = ref(null);
const canvasWidth = 700;
const canvasHeight = 500;
const centerX = canvasWidth / 2;
const centerY = canvasHeight / 2;

// Tooltip state
const tooltip = ref({
  visible: false, x: 0, y: 0, name: '', player: '', score: 0, slot: 0,
  debris: false, missionType: '', ships: '', eta: '',
});

// Background stars (generated once)
const bgStars = [];
for (let i = 0; i < 50; i++) {
  bgStars.push({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    r: Math.random() * 1.5 + 0.3,
    brightness: Math.random() * 0.6 + 0.4,
    speed: (Math.random() - 0.5) * 0.15,
  });
}

// Debris particles
const debrisParticles = [];
for (let i = 0; i < 30; i++) {
  debrisParticles.push({
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 8,
    speed: (Math.random() - 0.5) * 0.03,
    size: Math.random() * 1.5 + 0.5,
  });
}

// Planet slot positions (precomputed)
function computeSlotPositions() {
  const slots = [];
  // 3 concentric rings: inner (3 planets), middle (5), outer (7)
  const rings = [
    { count: 3, radius: 80 },
    { count: 5, radius: 140 },
    { count: 7, radius: 200 },
  ];
  let slotNum = 1;
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 - Math.PI / 2;
      slots.push({
        slot: slotNum,
        x: centerX + Math.cos(angle) * ring.radius,
        y: centerY + Math.sin(angle) * ring.radius,
        ringRadius: ring.radius,
        angle,
      });
      slotNum++;
    }
  }
  return slots;
}

const slotPositions = computeSlotPositions();

// ── Fleet position helpers ───────────────────────────────────────────────────

function parseCoords(c) {
  const m = c.match(/\[?(\d+):(\d+):(\d+)\]?/);
  if (!m) return null;
  return { galaxy: parseInt(m[1]), system: parseInt(m[2]), planet: parseInt(m[3]) };
}

/** Get canvas x/y for a coord string. Returns null if not in current system view. */
function coordsToCanvasPos(coordStr) {
  const c = parseCoords(coordStr);
  if (!c) return null;
  if (c.galaxy === props.galaxy && c.system === props.system) {
    // Same system — find orbital position
    const sp = slotPositions.find(s => s.slot === c.planet);
    if (sp) return { x: sp.x, y: sp.y, inSystem: true };
  }
  // Different system/galaxy — pick an edge position based on direction
  const edgeAngle = getEdgeAngle(coordStr);
  return {
    x: centerX + Math.cos(edgeAngle) * (canvasWidth * 0.46),
    y: centerY + Math.sin(edgeAngle) * (canvasHeight * 0.46),
    inSystem: false,
  };
}

/** Deterministic edge angle for off-system coords so each unique coord gets a stable edge point. */
function getEdgeAngle(coordStr) {
  let hash = 0;
  for (let i = 0; i < coordStr.length; i++) {
    hash = ((hash << 5) - hash) + coordStr.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 360) * (Math.PI / 180);
}

/** Compute fleet visual data for the current frame. */
function computeFleetVisuals() {
  const fleets = gameStore.fleetPositions;
  if (!fleets || fleets.length === 0) return [];

  const now = Math.floor(Date.now() / 1000);
  const visuals = [];

  for (const f of fleets) {
    const origin = f.origin_coords;
    const target = f.target_coords;
    if (!origin || !target) continue;

    const fromPos = coordsToCanvasPos(origin);
    const toPos = coordsToCanvasPos(target);
    if (!fromPos || !toPos) continue;

    // At least one end must be in the current system view
    if (!fromPos.inSystem && !toPos.inSystem) continue;

    const departed = f.departed_at || f.created_at;
    const arrive = f.arrive_at;
    const totalDuration = arrive - departed;
    if (totalDuration <= 0) continue;

    const elapsed = now - departed;
    const progress = Math.max(0, Math.min(1, elapsed / totalDuration));

    // Interpolate position
    const cx = fromPos.x + (toPos.x - fromPos.x) * progress;
    const cy = fromPos.y + (toPos.y - fromPos.y) * progress;

    // Direction angle
    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

    const color = f.is_own ? '#00ffff' : (f.is_allied ? '#00c8ff' : '#ff3a3a');

    const shipSummary = (f.ship_summary || [])
      .map(s => `${s.name || s.id} x${s.count}`)
      .join(', ');

    const etaSec = Math.max(0, arrive - now);
    const etaMin = Math.floor(etaSec / 60);
    const etaS = etaSec % 60;

    visuals.push({
      id: f.id,
      fromX: fromPos.x, fromY: fromPos.y,
      toX: toPos.x, toY: toPos.y,
      cx, cy, angle, progress, color,
      isOwn: f.is_own,
      isAllied: f.is_allied,
      missionType: f.mission_type || 'unknown',
      ownerName: f.owner_name || '',
      shipSummary,
      eta: `${etaMin}m ${etaS}s`,
    });
  }
  return visuals;
}

/** Draw fleet movement lines, animated dots, and trails. */
function drawFleets(ctx) {
  const visuals = computeFleetVisuals();
  if (visuals.length === 0) return;

  for (const fv of visuals) {
    // Dotted line from origin to destination
    ctx.save();
    ctx.strokeStyle = fv.color + '30';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(fv.fromX, fv.fromY);
    ctx.lineTo(fv.toX, fv.toY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Trail (fading line behind the dot)
    const trailLen = 20;
    const tx = fv.cx - Math.cos(fv.angle) * trailLen;
    const ty = fv.cy - Math.sin(fv.angle) * trailLen;
    const trailGrad = ctx.createLinearGradient(tx, ty, fv.cx, fv.cy);
    trailGrad.addColorStop(0, fv.color + '00');
    trailGrad.addColorStop(1, fv.color + '80');
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(fv.cx, fv.cy);
    ctx.stroke();

    // Fleet dot with glow
    const pulse = 1 + Math.sin(time * 4 + fv.progress * 10) * 0.25;
    const dotRadius = 3.5 * pulse;

    // Glow
    const glowGrad = ctx.createRadialGradient(fv.cx, fv.cy, 0, fv.cx, fv.cy, dotRadius * 3);
    glowGrad.addColorStop(0, fv.color + '60');
    glowGrad.addColorStop(1, fv.color + '00');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(fv.cx, fv.cy, dotRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = fv.color;
    ctx.beginPath();
    ctx.arc(fv.cx, fv.cy, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Direction arrow
    const arrowLen = 8;
    const arrowX = fv.cx + Math.cos(fv.angle) * (dotRadius + 3);
    const arrowY = fv.cy + Math.sin(fv.angle) * (dotRadius + 3);
    ctx.fillStyle = fv.color + 'aa';
    ctx.beginPath();
    ctx.moveTo(arrowX + Math.cos(fv.angle) * arrowLen, arrowY + Math.sin(fv.angle) * arrowLen);
    ctx.lineTo(arrowX + Math.cos(fv.angle + 2.5) * arrowLen * 0.5, arrowY + Math.sin(fv.angle + 2.5) * arrowLen * 0.5);
    ctx.lineTo(arrowX + Math.cos(fv.angle - 2.5) * arrowLen * 0.5, arrowY + Math.sin(fv.angle - 2.5) * arrowLen * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Store for hit detection
  fleetVisualsCache = visuals;
}

let fleetVisualsCache = [];

// Get cell data for a slot
function getCellData(slot) {
  const coords = `[${props.galaxy}:${props.system}:${slot}]`;
  const p = props.players.find(x => x.coords === coords);
  if (!p) return { slot, coords, type: 'empty', debris_metal: 0, debris_crystal: 0 };

  const isOwn = p.username === props.myUsername;
  // Check alliance membership
  const isAllied = !isOwn && props.allianceTag && p.alliance_tag === props.allianceTag;
  const isBot = !!p.is_bot;

  let type = 'enemy';
  if (isOwn) type = 'own';
  else if (isAllied) type = 'allied';
  else if (isBot) type = 'bot';

  // Get specialization for own planets
  let specialization = null;
  if (isOwn) {
    const storePlanet = props.myPlanets.find(sp => sp.coords === coords);
    if (storePlanet) specialization = storePlanet.specialization;
  }

  return {
    slot, coords, type,
    emoji: p.planet_emoji,
    name: p.planet_name,
    username: p.username,
    score: p.score,
    targetUserId: p.user_id,
    debris_metal: p.debris_metal || 0,
    debris_crystal: p.debris_crystal || 0,
    specialization,
    alliance_tag: p.alliance_tag,
  };
}

// Colors
const typeColors = {
  own: '#3aff7a',
  allied: '#00c8ff',
  enemy: '#ff3a7a',
  empty: '#333333',
  bot: '#ffa500',
};

const specLabels = { mining: 'M', military: 'W', research: 'R', trade: 'T' };

// Animation
let animFrame = null;
let time = 0;

function draw() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  time += 0.016; // ~60fps

  // Clear
  ctx.fillStyle = '#080c18';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Alliance territory overlay
  const claim = props.sectorClaims.find(c => c.system_num === props.system);
  if (claim) {
    // Subtle colored overlay
    let claimHue = 0;
    const tag = claim.alliance_tag || '';
    for (let i = 0; i < tag.length; i++) claimHue += tag.charCodeAt(i);
    claimHue = claimHue % 360;
    ctx.fillStyle = `hsla(${claimHue}, 60%, 40%, 0.06)`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // Border glow
    ctx.strokeStyle = `hsla(${claimHue}, 70%, 50%, 0.3)`;
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvasWidth - 4, canvasHeight - 4);
    // Territory label
    ctx.font = '10px Orbitron, monospace';
    ctx.fillStyle = `hsla(${claimHue}, 70%, 60%, 0.6)`;
    ctx.textAlign = 'right';
    ctx.fillText(`[${tag}] Territory`, canvasWidth - 12, 18);
    ctx.textAlign = 'start';
  }

  // Background stars with drift
  for (const star of bgStars) {
    star.x += star.speed;
    if (star.x < 0) star.x = canvasWidth;
    if (star.x > canvasWidth) star.x = 0;
    const flicker = star.brightness + Math.sin(time * 2 + star.x) * 0.15;
    ctx.fillStyle = `rgba(200,220,255,${Math.max(0.1, Math.min(1, flicker))})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Orbital rings
  const ringRadii = [80, 140, 200];
  for (const r of ringRadii) {
    ctx.strokeStyle = 'rgba(40,60,100,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Central star with glow
  const starPulse = 1 + Math.sin(time * 1.5) * 0.15;
  // Outer glow
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40 * starPulse);
  gradient.addColorStop(0, 'rgba(255,255,200,0.9)');
  gradient.addColorStop(0.3, 'rgba(255,230,100,0.4)');
  gradient.addColorStop(0.7, 'rgba(255,200,50,0.1)');
  gradient.addColorStop(1, 'rgba(255,200,50,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 40 * starPulse, 0, Math.PI * 2);
  ctx.fill();
  // Core
  ctx.fillStyle = '#fffbe0';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
  ctx.fill();
  // Star label
  ctx.font = '9px Orbitron, monospace';
  ctx.fillStyle = 'rgba(255,255,200,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText(`G${props.galaxy}:S${props.system}`, centerX, centerY + 22);

  // Draw planets
  for (const sp of slotPositions) {
    const cell = getCellData(sp.slot);
    const color = typeColors[cell.type] || typeColors.empty;

    if (cell.type === 'empty') {
      // Empty slot indicator
      ctx.fillStyle = 'rgba(50,60,80,0.3)';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
      ctx.fill();
      // Slot number
      ctx.font = '7px monospace';
      ctx.fillStyle = 'rgba(100,120,160,0.4)';
      ctx.textAlign = 'center';
      ctx.fillText(sp.slot, sp.x, sp.y + 14);
      continue;
    }

    // Planet size based on score
    const score = cell.score || 0;
    const size = Math.max(6, Math.min(20, 6 + Math.log10(Math.max(1, score)) * 3));

    // Planet glow
    const glowGrad = ctx.createRadialGradient(sp.x, sp.y, size * 0.3, sp.x, sp.y, size * 2.5);
    glowGrad.addColorStop(0, color + '60');
    glowGrad.addColorStop(1, color + '00');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Planet body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Planet border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, size, 0, Math.PI * 2);
    ctx.stroke();

    // Debris field particles
    if (cell.debris_metal > 0 || cell.debris_crystal > 0) {
      for (const dp of debrisParticles) {
        const pAngle = dp.angle + time * dp.speed + sp.slot;
        const px = sp.x + Math.cos(pAngle) * (size + 4 + dp.dist);
        const py = sp.y + Math.sin(pAngle) * (size + 4 + dp.dist);
        const sparkle = 0.4 + Math.sin(time * 3 + dp.angle * 5) * 0.3;
        ctx.fillStyle = `rgba(255,230,80,${sparkle})`;
        ctx.beginPath();
        ctx.arc(px, py, dp.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Specialization label for own planets
    if (cell.specialization && specLabels[cell.specialization]) {
      ctx.font = 'bold 8px Orbitron, monospace';
      ctx.fillStyle = '#ffffffcc';
      ctx.textAlign = 'center';
      ctx.fillText(specLabels[cell.specialization], sp.x + size + 8, sp.y - size + 2);
    }

    // Planet name
    ctx.font = '8px Exo 2, sans-serif';
    ctx.fillStyle = 'rgba(200,220,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(cell.name || '', sp.x, sp.y + size + 12);

    // Player name
    if (cell.username) {
      ctx.font = '7px monospace';
      ctx.fillStyle = color + 'aa';
      ctx.textAlign = 'center';
      ctx.fillText(cell.username, sp.x, sp.y + size + 21);
    }

    // Slot number
    ctx.font = '7px monospace';
    ctx.fillStyle = 'rgba(100,120,160,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText(sp.slot, sp.x, sp.y - size - 6);
  }

  // Draw fleet movements on top of planets
  drawFleets(ctx);

  // System info header
  ctx.font = '11px Orbitron, monospace';
  ctx.fillStyle = 'rgba(0,200,255,0.7)';
  ctx.textAlign = 'left';
  ctx.fillText(`Galaxy ${props.galaxy} - System ${props.system}`, 12, 18);

  // Fleet count indicator
  const fleetCount = fleetVisualsCache.length;
  if (fleetCount > 0) {
    ctx.font = '9px Orbitron, monospace';
    ctx.fillStyle = 'rgba(0,255,255,0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(`Fleets: ${fleetCount}`, 12, 32);
  }

  // Legend
  const legendY = canvasHeight - 16;
  const legendItems = [
    { label: 'Own', color: typeColors.own },
    { label: 'Allied', color: typeColors.allied },
    { label: 'Enemy', color: typeColors.enemy },
    { label: 'Bot', color: typeColors.bot },
  ];
  ctx.font = '8px monospace';
  let lx = 10;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(lx + 4, legendY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,220,255,0.6)';
    ctx.fillText(item.label, lx + 10, legendY + 3);
    lx += ctx.measureText(item.label).width + 22;
  }

  animFrame = requestAnimationFrame(draw);
}

// ── Hit detection ────────────────────────────────────────────────────────────

function getFleetAt(mx, my) {
  for (const fv of fleetVisualsCache) {
    const dx = mx - fv.cx;
    const dy = my - fv.cy;
    if (dx * dx + dy * dy <= 12 * 12) {
      return fv;
    }
  }
  return null;
}

function getSlotAt(mx, my) {
  for (const sp of slotPositions) {
    const cell = getCellData(sp.slot);
    const size = cell.type === 'empty' ? 8 : Math.max(6, Math.min(20, 6 + Math.log10(Math.max(1, cell.score || 1)) * 3));
    const hitRadius = Math.max(size + 6, 14);
    const dx = mx - sp.x;
    const dy = my - sp.y;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      return { sp, cell };
    }
  }
  return null;
}

function onMouseMove(e) {
  const rect = canvasEl.value.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvasWidth / rect.width);
  const my = (e.clientY - rect.top) * (canvasHeight / rect.height);

  // Check fleet hit first (fleets are drawn on top)
  const fleetHit = getFleetAt(mx, my);
  if (fleetHit) {
    const missionLabels = {
      attack: 'Attack', spy: 'Espionage', harvest: 'Harvest',
      expedition: 'Expedition', colonize: 'Colonize', intercept: 'Intercept',
      unknown: 'Unknown',
    };
    tooltip.value = {
      visible: true,
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 10,
      name: `Fleet: ${fleetHit.ownerName}`,
      player: '',
      score: 0,
      slot: 0,
      debris: false,
      missionType: missionLabels[fleetHit.missionType] || fleetHit.missionType,
      ships: fleetHit.shipSummary || '',
      eta: fleetHit.eta,
    };
    canvasEl.value.style.cursor = 'pointer';
    return;
  }

  const hit = getSlotAt(mx, my);
  if (hit) {
    const cell = hit.cell;
    tooltip.value = {
      visible: true,
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 10,
      name: cell.name || 'Empty space',
      player: cell.username || '',
      score: cell.score || 0,
      slot: cell.slot,
      debris: (cell.debris_metal > 0 || cell.debris_crystal > 0),
      missionType: '',
      ships: '',
      eta: '',
    };
    canvasEl.value.style.cursor = 'pointer';
  } else {
    tooltip.value.visible = false;
    canvasEl.value.style.cursor = 'default';
  }
}

function onMouseLeave() {
  tooltip.value.visible = false;
}

function onClick(e) {
  const rect = canvasEl.value.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvasWidth / rect.width);
  const my = (e.clientY - rect.top) * (canvasHeight / rect.height);
  const hit = getSlotAt(mx, my);
  if (hit) {
    emit('planet-selected', {
      slot: hit.cell.slot,
      player: hit.cell,
      coords: hit.cell.coords,
    });
  }
}

// ── Fleet position polling (every 10s) ───────────────────────────────────────

let fleetPollTimer = null;

function startFleetPolling() {
  stopFleetPolling();
  // Initial load
  gameStore.loadFleetPositions(props.galaxy, props.system);
  fleetPollTimer = setInterval(() => {
    gameStore.loadFleetPositions(props.galaxy, props.system);
  }, 10000);
}

function stopFleetPolling() {
  if (fleetPollTimer) {
    clearInterval(fleetPollTimer);
    fleetPollTimer = null;
  }
}

onMounted(() => {
  nextTick(() => { animFrame = requestAnimationFrame(draw); });
  startFleetPolling();
});

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame);
  stopFleetPolling();
});

// Restart fleet polling when galaxy/system changes
watch(() => [props.galaxy, props.system], () => {
  startFleetPolling();
});

// Redraw when data changes
watch(() => [props.galaxy, props.system, props.players], () => {
  // The animation loop will pick up changes automatically
}, { deep: true });
</script>

<style scoped>
.galaxy-canvas-wrapper {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.galaxy-canvas {
  width: 100%;
  height: auto;
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
  background: #080c18;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.08), inset 0 0 40px rgba(0, 0, 0, 0.5);
  display: block;
}

.gc-tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(8, 12, 24, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  color: #c8dcff;
  z-index: 100;
  box-shadow: 0 0 12px rgba(0, 200, 255, 0.15);
  white-space: nowrap;
}

.gc-tt-name {
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  color: #fff;
  margin-bottom: 2px;
}

.gc-tt-player {
  color: #00c8ff;
  font-size: 10px;
}

.gc-tt-score {
  color: rgba(200, 220, 255, 0.6);
  font-size: 9px;
}

.gc-tt-debris {
  color: #ffe650;
  font-size: 9px;
}

.gc-tt-mission {
  color: #ffa500;
  font-size: 9px;
  font-family: 'Orbitron', monospace;
}

.gc-tt-ships {
  color: rgba(200, 220, 255, 0.5);
  font-size: 8px;
  max-width: 200px;
  white-space: normal;
}

.gc-tt-eta {
  color: #3aff7a;
  font-size: 9px;
  font-family: monospace;
}

.gc-tt-slot {
  color: rgba(100, 120, 160, 0.6);
  font-size: 8px;
  margin-top: 2px;
}
</style>
