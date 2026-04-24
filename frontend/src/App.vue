<template>
  <RouterView />
  <Teleport to="body">
    <div class="notif-container">
      <TransitionGroup name="notif">
        <div v-for="n in notifications" :key="n.id" class="notif" :class="n.type">{{ n.text }}</div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useGameStore } from '@/stores/game.js';
import { useLangStore } from '@/stores/lang.js';
const game = useGameStore();
const lang = useLangStore();
const notifications = computed(() => game.notifications);
onMounted(() => { document.documentElement.setAttribute('data-theme', lang.theme); });
</script>

<style>
/* ── Reset ── */
*{box-sizing:border-box;margin:0;padding:0;border:0;outline:0}
html,body{min-height:100vh;background:var(--bg-deep);overflow-x:hidden;color:var(--text);font-family:'Exo 2',sans-serif;transition:background-color .3s,color .3s}

/* ── Design Tokens ── */
:root{
  --accent:#1ac8e8;
  --accent2:#e83a6a;
  --accent3:#3ae88a;
  --accent4:#e8b450;
  --red:#e83a6a;
  --green:#3ae88a;
  --metal:#78aad0;
  --crystal:#9878f0;
  --energy:#f0c840;
}

[data-theme="dark"]{
  --bg-deep:#030810;
  --bg-panel:#070e20;
  --bg-card:#0a1428;
  --bg-hover:#0d1a35;
  --border:rgba(0,180,220,.13);
  --border-glow:rgba(0,180,220,.32);
  --text:#b8d0f0;
  --text-dim:rgba(140,180,220,.42);
  --text-bright:#ddeeff;
  --panel-shadow:0 2px 20px rgba(0,0,0,.5);
}

[data-theme="light"]{
  --bg-deep:#e8f0f8;
  --bg-panel:#ffffff;
  --bg-card:#f4f8fd;
  --bg-hover:#eaf2fb;
  --border:rgba(0,100,160,.14);
  --border-glow:rgba(0,100,160,.3);
  --text:#2c3e50;
  --text-dim:#7f8c9a;
  --text-bright:#1c2833;
  --panel-shadow:0 4px 20px rgba(0,20,50,.06);
}

/* ── Starfield (dark only) ── */
[data-theme="dark"] body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(1px 1px at 12% 18%,rgba(255,255,255,.55) 0%,transparent 100%),
    radial-gradient(1px 1px at 35% 52%,rgba(255,255,255,.35) 0%,transparent 100%),
    radial-gradient(1px 1px at 62% 9%,rgba(255,255,255,.45) 0%,transparent 100%),
    radial-gradient(1px 1px at 78% 73%,rgba(255,255,255,.28) 0%,transparent 100%),
    radial-gradient(1px 1px at 91% 34%,rgba(255,255,255,.40) 0%,transparent 100%),
    radial-gradient(1200px 900px at 20% 100%,rgba(0,60,140,.12) 0%,transparent 70%),
    radial-gradient(800px 600px at 85% 0%,rgba(90,0,120,.09) 0%,transparent 60%);
}
[data-theme="dark"] body::after{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 60% 40% at 15% 80%,rgba(26,200,232,.04) 0%,transparent 70%),
    radial-gradient(ellipse 50% 30% at 85% 20%,rgba(155,89,182,.04) 0%,transparent 70%);
  animation:nebula-drift 18s ease-in-out infinite alternate;
}
@keyframes nebula-drift{
  0%{transform:translate(0,0) scale(1)}
  100%{transform:translate(10px,-6px) scale(1.02)}
}

/* ── Notifications ── */
.notif-container{position:fixed;top:60px;right:12px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.notif{background:var(--bg-card);border:1px solid var(--accent);border-radius:4px;padding:10px 14px;font-size:12px;font-family:'Exo 2',sans-serif;color:var(--text-bright);box-shadow:0 0 20px rgba(26,200,232,.2);min-width:200px;max-width:280px}
.notif.red{border-color:var(--accent2);box-shadow:0 0 20px rgba(232,58,106,.2)}
.notif.green{border-color:var(--accent3);box-shadow:0 0 20px rgba(58,232,138,.2)}
.notif-enter-active,.notif-leave-active{transition:all .3s ease}
.notif-enter-from{transform:translateX(300px);opacity:0}
.notif-leave-to{transform:translateX(300px);opacity:0}
@media(max-width:768px){
  .notif-container{top:110px;right:10px;left:10px;align-items:stretch}
  .notif{min-width:0;max-width:none;width:100%}
  .notif-enter-from,.notif-leave-to{transform:translateY(-20px);opacity:0}
}

/* ── Panel system ── */
.panel{background:var(--bg-panel);border:1px solid var(--border);border-radius:4px;box-shadow:var(--panel-shadow);overflow:hidden;position:relative}
.panel::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,var(--accent) 0%,transparent 100%);opacity:.5;z-index:1;pointer-events:none}
.panel-header{background:linear-gradient(90deg,rgba(0,180,220,.06) 0%,transparent 100%);border-bottom:1px solid var(--border);padding:8px 12px 8px 14px;display:flex;align-items:center;gap:8px}
.panel-header h3{font-family:'Orbitron',sans-serif;font-size:9px;font-weight:700;color:var(--accent);letter-spacing:2px;text-transform:uppercase}
.panel-body{padding:10px 12px}

/* ── Buttons ── */
.btn-primary{padding:4px 10px;background:rgba(26,200,232,.12);border:1px solid var(--border-glow);color:var(--accent);font-size:9px;font-family:'Orbitron',sans-serif;border-radius:3px;cursor:pointer;letter-spacing:1px;transition:all .2s;white-space:nowrap;position:relative;overflow:hidden}
.btn-primary::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);transition:.5s}
.btn-primary:hover:not(:disabled)::after{left:100%}
.btn-primary:hover:not(:disabled){background:rgba(26,200,232,.25);box-shadow:0 0 12px rgba(26,200,232,.3);transform:translateY(-1px)}
.btn-primary:disabled{opacity:.3;cursor:not-allowed}

/* ── Global animations ── */
@keyframes glow-pulse{0%{box-shadow:0 0 5px rgba(26,200,232,.2)}50%{box-shadow:0 0 20px rgba(26,200,232,.45)}100%{box-shadow:0 0 5px rgba(26,200,232,.2)}}
@keyframes text-glow{0%{text-shadow:0 0 5px rgba(26,200,232,.2)}50%{text-shadow:0 0 15px rgba(26,200,232,.6)}100%{text-shadow:0 0 5px rgba(26,200,232,.2)}}
@keyframes planet-slot-pulse{0%,100%{box-shadow:0 0 12px rgba(26,200,232,.12)}50%{box-shadow:0 0 20px rgba(26,200,232,.28),inset 0 0 8px rgba(26,200,232,.06)}}
@keyframes returning-pulse{0%,100%{border-color:rgba(58,232,138,.25);box-shadow:none}50%{border-color:rgba(58,232,138,.55);box-shadow:0 0 10px rgba(58,232,138,.15)}}
</style>
