<template>
  <canvas ref="canvasEl" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.82" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  buildingId: { type: String, required: true },
  color:      { type: String, default: '#1ac8e8' },
  width:      { type: Number, default: 220 },
  height:     { type: Number, default: 80 },
});

const canvasEl = ref(null);
let rafId = null, t = 0;

function hexToRgba(hex, a) {
  const h = hex.replace('#','');
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
}

function init() {
  const canvas = canvasEl.value; if (!canvas) return;
  const W = props.width, H = props.height;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const color = props.color.startsWith('#') ? props.color : '#1ac8e8';
  const c = (a) => hexToRgba(color, a);

  const particles = Array.from({ length: 16 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: -Math.random() * .6 - .2,
    life: Math.random(), size: Math.random() * 1.8 + .4
  }));

  const type = props.buildingId.includes('metal') ? 'metal'
    : props.buildingId.includes('crystal') || props.buildingId.includes('refinery') ? 'crystal'
    : props.buildingId.includes('energy') || props.buildingId.includes('fusion') ? 'energy'
    : props.buildingId.includes('deus') ? 'deus'
    : props.buildingId.includes('research') ? 'research'
    : props.buildingId.includes('shipyard') || props.buildingId.includes('dock') ? 'shipyard'
    : props.buildingId.includes('defense') || props.buildingId.includes('cannon') ? 'defense'
    : 'storage';

  function drawMetal(time) {
    const scanY = (time * 30) % (H * 2) - H * .5;
    const sg = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
    sg.addColorStop(0, c(0)); sg.addColorStop(.5, c(.18)); sg.addColorStop(1, c(0));
    ctx.fillStyle = sg; ctx.fillRect(0, scanY - 8, W, 16);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life += .012;
      if (p.life > 1) { p.x = Math.random() * W; p.y = H + 4; p.life = 0; }
      ctx.fillStyle = c(Math.sin(p.life * Math.PI) * .65);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
  }

  function drawCrystal(time) {
    for (let i = 0; i < 4; i++) {
      const x = (Math.sin(time * .4 + i * 1.6) * .5 + .5) * W;
      const y = (Math.cos(time * .3 + i * .9) * .5 + .5) * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 32 + Math.sin(time + i) * 10);
      g.addColorStop(0, c(.2)); g.addColorStop(1, c(0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 42, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawEnergy(time) {
    const cx = W / 2, cy = H / 2;
    const pulse = Math.sin(time * 4) * .5 + .5;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 + pulse * 12);
    cg.addColorStop(0, c(.3 + pulse * .2)); cg.addColorStop(1, c(0));
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 34 + pulse * 12, 0, Math.PI * 2); ctx.fill();
    for (let a = 0; a < 4; a++) {
      const angle = time * 2 + a * Math.PI / 2;
      const ex = cx + Math.cos(angle) * (22 + Math.sin(time * 5 + a) * 12);
      const ey = cy + Math.sin(angle) * (14 + Math.sin(time * 5 + a) * 7);
      const mx = cx + Math.cos(angle + .4) * 12 + (Math.random() - .5) * 6;
      const my = cy + Math.sin(angle + .4) * 7  + (Math.random() - .5) * 3;
      ctx.strokeStyle = c(.42 + Math.sin(time * 6 + a) * .2);
      ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
    }
  }

  function drawDeus(time) {
    const cx = W / 2, cy = H / 2;
    for (let ring = 0; ring < 3; ring++) {
      const phase = (time * .6 + ring / 3) % 1;
      ctx.strokeStyle = c((1 - phase) * .25); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(cx, cy, phase * 50, phase * 22, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawResearch(time) {
    const cx = W / 2, cy = H / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * .5);
    ctx.strokeStyle = c(.2); ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.ellipse(0, 0, 38, 20, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    for (let d = 0; d < 4; d++) {
      const da = (d / 4) * Math.PI * 2;
      ctx.fillStyle = c(.45); ctx.beginPath(); ctx.arc(Math.cos(da) * 38, Math.sin(da) * 20, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    const rp = Math.sin(time * 2) * .5 + .5;
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 + rp * 6);
    rg.addColorStop(0, c(.15 + rp * .1)); rg.addColorStop(1, c(0));
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, 24 + rp * 6, 0, Math.PI * 2); ctx.fill();
  }

  function drawShipyard(time) {
    const cx = W * .7, cy = H / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * 1.5);
    const lg = ctx.createLinearGradient(0, 0, 50, 0);
    lg.addColorStop(0, c(.28)); lg.addColorStop(1, c(0));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(50, -14); ctx.lineTo(50, 14); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawDefense(time) {
    const cx = W / 2, cy = H / 2;
    const pulse = Math.sin(time * 1.5) * .5 + .5;
    for (let ring = 0; ring < 3; ring++) {
      const rs = 15 + ring * 14 + pulse * 4;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * .1 + ring * .2);
      ctx.strokeStyle = c(.16 - ring * .04 + pulse * .08); ctx.lineWidth = .8;
      ctx.beginPath();
      for (let v = 0; v < 6; v++) {
        const a = (v / 6) * Math.PI * 2 - Math.PI / 6;
        v === 0 ? ctx.moveTo(Math.cos(a) * rs, Math.sin(a) * rs * .6)
                : ctx.lineTo(Math.cos(a) * rs, Math.sin(a) * rs * .6);
      }
      ctx.closePath(); ctx.stroke(); ctx.restore();
    }
  }

  function drawStorage(time) {
    const breathe = Math.sin(time * .8) * .5 + .5;
    const bg2 = ctx.createLinearGradient(0, H, 0, 0);
    bg2.addColorStop(0, c(.1 + breathe * .06)); bg2.addColorStop(1, c(0));
    ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
  }

  const drawFns = { metal: drawMetal, crystal: drawCrystal, energy: drawEnergy, deus: drawDeus, research: drawResearch, shipyard: drawShipyard, defense: drawDefense, storage: drawStorage };
  const drawFn = drawFns[type] || drawStorage;

  cancelAnimationFrame(rafId);
  function loop() { ctx.clearRect(0, 0, W, H); t += .022; drawFn(t); rafId = requestAnimationFrame(loop); }
  loop();
}

onMounted(init);
watch(() => [props.buildingId, props.color], () => { cancelAnimationFrame(rafId); t = 0; init(); });
onUnmounted(() => cancelAnimationFrame(rafId));
</script>
