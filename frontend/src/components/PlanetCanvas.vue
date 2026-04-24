<template>
  <canvas ref="canvasEl" :style="canvasStyle" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  color: { type: String, default: '#1ac8e8' },
  size:  { type: Number, default: 72 },
  speed: { type: Number, default: 1.0 },
});

const canvasEl = ref(null);
const canvasStyle = computed(() => ({
  width: props.size + 'px', height: props.size + 'px',
  borderRadius: '50%', display: 'block',
}));

let rafId = null, t = 0;

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function init() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = props.size;
  canvas.width = s * dpr; canvas.height = s * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const cx = s / 2, cy = s / 2, r = s * 0.39;
  const color = props.color.startsWith('#') ? props.color : '#1ac8e8';
  const sp = props.speed;

  function draw(time) {
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();

    // Base gradient
    const bg = ctx.createRadialGradient(cx - r*.25, cy - r*.2, 0, cx, cy, r);
    bg.addColorStop(0, hexToRgba(color, 0.9));
    bg.addColorStop(0.55, hexToRgba(color, 0.65));
    bg.addColorStop(1, hexToRgba(color, 0.3));
    ctx.fillStyle = bg; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = 'rgba(2,6,18,0.45)'; ctx.fillRect(0, 0, s, s);

    // Terrain bands
    for (let i = 0; i < 7; i++) {
      const baseY = ((i / 7) * s * 1.3 - s * .15 + (time * sp * 4) % (s * 1.3)) % (s * 1.3) - s * .15;
      const amp = 4 + Math.sin(i * 1.7) * 2;
      ctx.beginPath(); ctx.moveTo(0, baseY);
      for (let x = 0; x <= s; x += 3) {
        const y = baseY + Math.sin(x * .07 + time * sp * .5 + i * .9) * amp
                       + Math.sin(x * .13 + time * sp * .3 + i * 1.8) * amp * .5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(s, baseY + 28); ctx.lineTo(0, baseY + 28); ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? `rgba(0,0,0,${.03 + i * .018})` : hexToRgba(color, .025 + i * .015);
      ctx.fill();
    }

    // Cloud wisps
    for (let i = 0; i < 5; i++) {
      const cloudX = ((Math.sin(time * sp * .12 + i * 1.57) * .5 + .5) * s * 1.4 - s * .2 + time * sp * 2) % (s * 1.4) - s * .2;
      const cloudY = cy + Math.sin(i * 1.3 + .5) * r * .55;
      const cg = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, r * (.45 + Math.sin(i * 2.1) * .2));
      cg.addColorStop(0, 'rgba(255,255,255,0.13)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = cg; ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, r * (.45 + Math.sin(i*2.1)*.2), r * .18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Terminator shadow
    const shad = ctx.createRadialGradient(cx + r*.45, cy, r*.1, cx + r*.3, cy, r * 1.4);
    shad.addColorStop(0, 'rgba(0,0,0,0)'); shad.addColorStop(.55, 'rgba(0,0,0,0)'); shad.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = shad; ctx.fillRect(0, 0, s, s);

    // Highlight
    const hl = ctx.createRadialGradient(cx - r*.38, cy - r*.38, 0, cx - r*.3, cy - r*.3, r * .7);
    hl.addColorStop(0, 'rgba(255,255,255,0.16)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl; ctx.fillRect(0, 0, s, s);
    ctx.restore();

    // Atmosphere
    const atm = ctx.createRadialGradient(cx, cy, r * .88, cx, cy, r * 1.3);
    atm.addColorStop(0, hexToRgba(color, 0)); atm.addColorStop(.4, hexToRgba(color, .22)); atm.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2); ctx.fill();

    // Orbiting satellite
    const satA = time * sp * .9;
    const sa = r * 1.55, sb = r * .38;
    const satX = cx + Math.cos(satA) * sa, satY = cy + Math.sin(satA) * sb;
    const behind = Math.sin(satA) < 0;

    ctx.strokeStyle = hexToRgba(color, .18); ctx.lineWidth = .6;
    ctx.beginPath(); ctx.ellipse(cx, cy, sa, sb, 0, 0, Math.PI * 2); ctx.stroke();

    if (!behind) {
      for (let i = 6; i >= 1; i--) {
        const ta = satA - i * .18;
        ctx.globalAlpha = (0.7 - i * .1) * .55;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx + Math.cos(ta) * sa, cy + Math.sin(ta) * sb, 1.8 - i * .22, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = .85; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(satX, satY, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .4; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(satX, satY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function loop() { t += 0.018; draw(t); rafId = requestAnimationFrame(loop); }
  cancelAnimationFrame(rafId); loop();
}

onMounted(init);
watch(() => [props.color, props.size], () => { cancelAnimationFrame(rafId); t = 0; init(); });
onUnmounted(() => cancelAnimationFrame(rafId));
</script>
