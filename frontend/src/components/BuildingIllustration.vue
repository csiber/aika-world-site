<template>
  <canvas ref="canvasEl" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.9" />
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
let rafId = null;

function hexToRgba(hex, a) {
  const h = hex.replace('#','');
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function init() {
  const canvas = canvasEl.value; if (!canvas) return;
  const W = props.width, H = props.height;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const color = props.color.startsWith('#') ? props.color : '#1ac8e8';
  const c  = (a) => hexToRgba(color, a);
  const bg = (a) => `rgba(3,8,16,${a})`;

  function glow(n=10){ ctx.shadowColor=color; ctx.shadowBlur=n; }
  function noGlow(){ ctx.shadowBlur=0; }
  function S(a=.65,lw=1){ ctx.strokeStyle=c(a); ctx.lineWidth=lw; }
  function F(a=.12){ ctx.fillStyle=c(a); }
  function groundLine(){ ctx.beginPath();ctx.moveTo(0,H-6);ctx.lineTo(W,H-6);S(.2,.5);ctx.stroke(); }

  const draws = {
    metal_mine(){
      groundLine();
      const cx=W/2,base=H-6;
      F(.1);S(.65,1.2);ctx.beginPath();ctx.rect(cx-5,8,10,base-8);ctx.fill();ctx.stroke();
      F(.18);glow(8);S(.8,1.2);ctx.beginPath();ctx.moveTo(cx-14,22);ctx.lineTo(cx+14,22);ctx.lineTo(cx,4);ctx.closePath();ctx.fill();ctx.stroke();noGlow();
      S(.55,1);F(.08);ctx.beginPath();ctx.arc(cx,base-2,18,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;S(.4,2);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*14,base-2+Math.sin(a)*14);ctx.lineTo(cx+Math.cos(a)*20,base-2+Math.sin(a)*20);ctx.stroke();}
      S(.35,.8);ctx.beginPath();ctx.moveTo(cx-40,base);ctx.lineTo(cx-6,28);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx+40,base);ctx.lineTo(cx+6,28);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-28,52);ctx.lineTo(cx+28,52);ctx.stroke();
      F(.08);S(.3,.8);ctx.beginPath();ctx.rect(20,H-22,52,8);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.rect(148,H-22,52,8);ctx.fill();ctx.stroke();
      for(let s=0;s<2;s++){F(.07);S(.35,.8);ctx.beginPath();ctx.rect(22+s*18,28,7,36);ctx.fill();ctx.stroke();}
    },
    crystal_mine(){
      groundLine();
      const cx=W/2,base=H-6;
      F(.12);S(.5,1);ctx.beginPath();ctx.rect(cx-25,base-8,50,8);ctx.fill();ctx.stroke();
      glow(14);F(.22);S(.8,1.2);ctx.beginPath();ctx.moveTo(cx,2);ctx.lineTo(cx+10,28);ctx.lineTo(cx+7,base-8);ctx.lineTo(cx-7,base-8);ctx.lineTo(cx-10,28);ctx.closePath();ctx.fill();ctx.stroke();
      S(.9,.6);glow(8);ctx.beginPath();ctx.moveTo(cx,2);ctx.lineTo(cx,base-8);ctx.stroke();noGlow();
      [[cx-32,base-8,cx-22,34,cx-42,38],[cx+32,base-8,cx+22,34,cx+42,38],[cx-18,base-8,cx-12,44,cx-24,46],[cx+18,base-8,cx+12,44,cx+24,46]].forEach(([bx,by,tx,ty,rx,ry])=>{
        F(.14);S(.5,.8);ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(bx,by);ctx.lineTo(rx,ry);ctx.closePath();ctx.fill();ctx.stroke();
      });
      for(let ring=1;ring<=3;ring++){S(.1+ring*.04,.5);ctx.beginPath();ctx.ellipse(cx,base-2,ring*18,ring*4,0,0,Math.PI*2);ctx.stroke();}
    },
    energy_plant(){
      groundLine();
      const cx=W/2,cy=H*.52;
      F(.09);S(.4,1);ctx.beginPath();ctx.arc(cx,cy,30,0,Math.PI*2);ctx.fill();ctx.stroke();
      S(.45,1);ctx.save();ctx.translate(cx,cy);ctx.rotate(-.4);ctx.beginPath();ctx.ellipse(0,0,36,10,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      glow(16);F(.35);S(.9,1.2);ctx.beginPath();ctx.arc(cx,cy,12,0,Math.PI*2);ctx.fill();ctx.stroke();noGlow();
      F(.6);ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fill();
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>{
        S(.35,2);ctx.beginPath();ctx.moveTo(cx+dx*32,cy+dy*28);ctx.lineTo(cx+dx*50,cy+dy*28);ctx.lineTo(cx+dx*50,H-6);ctx.stroke();
        F(.12);S(.4,.8);ctx.beginPath();ctx.rect(cx+dx*46,H-22,8,16);ctx.fill();ctx.stroke();
      });
      for(let l=0;l<4;l++){const a=(l/4)*Math.PI*2+Math.PI/4;S(.3,.8);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*30,cy+Math.sin(a)*30);ctx.lineTo(cx+Math.cos(a)*52,H-6);ctx.stroke();}
    },
    deus_extractor(){
      groundLine();
      const cx=W/2,base=H-6;
      for(let ring=1;ring<=4;ring++){S(.06+ring*.04,.6);ctx.beginPath();ctx.ellipse(cx,base-2,ring*22,ring*5,0,0,Math.PI*2);ctx.stroke();}
      glow(12);F(.2);S(.75,1.2);ctx.beginPath();ctx.moveTo(cx-32,16);ctx.lineTo(cx+32,16);ctx.lineTo(cx+20,46);ctx.lineTo(cx-20,46);ctx.closePath();ctx.fill();ctx.stroke();
      S(.4,.6);ctx.beginPath();ctx.moveTo(cx,16);ctx.lineTo(cx,46);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-16,31);ctx.lineTo(cx+16,31);ctx.stroke();
      F(.5);S(.9,1);glow(10);ctx.beginPath();ctx.moveTo(cx-10,46);ctx.lineTo(cx+10,46);ctx.lineTo(cx,60);ctx.closePath();ctx.fill();ctx.stroke();noGlow();
      S(.2,.6);ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(cx,60);ctx.lineTo(cx,base-2);ctx.stroke();ctx.setLineDash([]);
      [[cx-46,38,6,5],[cx+46,32,5,5],[cx-54,22,4,4],[cx+52,20,5,3]].forEach(([fx,fy,fw,fh])=>{F(.18);S(.45,.7);ctx.beginPath();ctx.rect(fx-fw/2,fy-fh/2,fw,fh);ctx.fill();ctx.stroke();});
    },
    shipyard(){
      groundLine();
      const base=H-6;
      F(.06);S(.45,1.2);ctx.beginPath();ctx.rect(30,10,160,56);ctx.fill();ctx.stroke();
      [22,38,54].forEach(y=>{S(.25,.6);ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(190,y);ctx.stroke();});
      [62,94,126,158].forEach(x=>{S(.3,.8);ctx.beginPath();ctx.moveTo(x,10);ctx.lineTo(x,66);ctx.stroke();});
      glow(10);F(.2);S(.7,1);ctx.beginPath();ctx.moveTo(56,50);ctx.lineTo(164,46);ctx.lineTo(172,40);ctx.lineTo(164,34);ctx.lineTo(56,30);ctx.lineTo(44,40);ctx.closePath();ctx.fill();ctx.stroke();noGlow();
      [[56,34],[56,46]].forEach(([nx,ny])=>{F(.35);S(.6,.8);ctx.beginPath();ctx.ellipse(nx,ny,4,6,0,0,Math.PI*2);ctx.fill();ctx.stroke();});
      F(.25);S(.5,.8);ctx.beginPath();ctx.rect(148,34,14,12);ctx.fill();ctx.stroke();
      [50,90,130,170].forEach(x=>{S(.3,1.2);ctx.beginPath();ctx.moveTo(x,66);ctx.lineTo(x,base);ctx.stroke();});
    },
    research_lab(){
      groundLine();
      const cx=W/2,base=H-6;
      F(.1);S(.45,1);ctx.beginPath();ctx.rect(cx-30,base-8,60,8);ctx.fill();ctx.stroke();
      F(.12);S(.55,1.1);ctx.beginPath();ctx.rect(cx-9,14,18,base-22);ctx.fill();ctx.stroke();
      F(.2);S(.7,1);glow(8);ctx.beginPath();ctx.rect(cx-12,8,24,10);ctx.fill();ctx.stroke();noGlow();
      S(.6,.8);ctx.beginPath();ctx.moveTo(cx,8);ctx.lineTo(cx,0);ctx.stroke();
      S(.55,1);F(.12);ctx.beginPath();ctx.ellipse(cx,2,10,4,-.4,0,Math.PI*2);ctx.fill();ctx.stroke();
      [[-38,30,20,30],[18,30,20,30]].forEach(([mx,my,mw,mh])=>{
        F(.09);S(.4,.8);ctx.beginPath();ctx.rect(cx+mx,my,mw,mh);ctx.fill();ctx.stroke();
        [[4,6],[4,18]].forEach(([wx,wy])=>{F(.25);S(.5,.5);ctx.beginPath();ctx.rect(cx+mx+wx,my+wy,6,6);ctx.fill();ctx.stroke();});
      });
      S(.3,.7);ctx.beginPath();ctx.moveTo(cx-9,44);ctx.lineTo(cx-18,44);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+9,44);ctx.lineTo(cx+18,44);ctx.stroke();
    },
    defense_matrix(){
      groundLine();
      const cx=W/2,base=H-6;
      F(.12);S(.5,1.2);glow(8);ctx.beginPath();
      for(let v=0;v<6;v++){const a=(v/6)*Math.PI*2-Math.PI/6;v===0?ctx.moveTo(cx+Math.cos(a)*26,base-6+Math.sin(a)*10):ctx.lineTo(cx+Math.cos(a)*26,base-6+Math.sin(a)*10);}
      ctx.closePath();ctx.fill();ctx.stroke();noGlow();
      F(.18);S(.6,1);ctx.beginPath();ctx.rect(cx-8,base-40,16,30);ctx.fill();ctx.stroke();
      F(.22);S(.7,1);glow(10);ctx.beginPath();ctx.ellipse(cx,base-40,14,8,0,0,Math.PI*2);ctx.fill();ctx.stroke();noGlow();
      [[-30,-10,-18,-8],[18,-8,30,-10]].forEach(([x1,y1,x2,y2])=>{S(.6,3);ctx.beginPath();ctx.moveTo(cx+x1,base+y1);ctx.lineTo(cx+x2,base+y2);ctx.stroke();F(.4);ctx.beginPath();ctx.arc(cx+x2,base+y2,3,0,Math.PI*2);ctx.fill();});
      for(let ring=1;ring<=3;ring++){S(.06+ring*.03,.6);ctx.beginPath();ctx.ellipse(cx,base-20,ring*28+8,ring*7,0,0,Math.PI*2);ctx.stroke();}
      [[-60,base-14],[60,base-14]].forEach(([tx,ty])=>{F(.1);S(.4,.8);ctx.beginPath();ctx.rect(cx+tx-5,ty,10,14);ctx.fill();ctx.stroke();S(.5,2);ctx.beginPath();ctx.moveTo(cx+tx,ty);ctx.lineTo(cx+tx-8,ty-10);ctx.stroke();});
    },
    storage(){
      groundLine();
      const base=H-6;
      [[55,16,28],[110,14,32],[165,18,24]].forEach(([tx,top,rad])=>{
        F(.1);S(.4,1);ctx.beginPath();ctx.rect(tx-rad/2,top,rad,base-top);ctx.fill();ctx.stroke();
        F(.16);S(.45,.8);ctx.beginPath();ctx.ellipse(tx,top,rad/2,rad/5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
        [.3,.6].forEach(frac=>{const bh=top+(base-top)*frac;S(.25,1.2);ctx.beginPath();ctx.moveTo(tx-rad/2,bh);ctx.lineTo(tx+rad/2,bh);ctx.stroke();});
        S(.2,.5);ctx.beginPath();ctx.moveTo(tx+rad/2-2,top+6);ctx.lineTo(tx+rad/2-2,base);ctx.stroke();ctx.beginPath();ctx.moveTo(tx+rad/2+2,top+6);ctx.lineTo(tx+rad/2+2,base);ctx.stroke();
        [.25,.45,.65,.85].forEach(f=>{const lh=top+6+(base-top-6)*f;ctx.beginPath();ctx.moveTo(tx+rad/2-2,lh);ctx.lineTo(tx+rad/2+2,lh);ctx.stroke();});
      });
      S(.3,2);ctx.beginPath();ctx.moveTo(69,32);ctx.lineTo(94,30);ctx.stroke();ctx.beginPath();ctx.moveTo(126,28);ctx.lineTo(153,30);ctx.stroke();
      S(.25,3);ctx.beginPath();ctx.moveTo(20,base-14);ctx.lineTo(200,base-14);ctx.stroke();
      [80,138].forEach(jx=>{F(.2);S(.4,.8);ctx.beginPath();ctx.arc(jx,base-14,4,0,Math.PI*2);ctx.fill();ctx.stroke();});
    },
  };

  // Fallback aliases
  const aliases = { crystal_refinery:'crystal_mine', fusion_reactor:'energy_plant', lunar_dock:'shipyard', ion_cannon:'defense_matrix' };
  const fn = draws[props.buildingId] || draws[aliases[props.buildingId]] || draws.storage;

  cancelAnimationFrame(rafId);
  fn();

  // Vignette
  const vig = ctx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,W*.75);
  vig.addColorStop(0,'rgba(3,8,16,0)'); vig.addColorStop(1,'rgba(3,8,16,0.55)');
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
}

onMounted(init);
watch(() => [props.buildingId, props.color], init);
onUnmounted(() => cancelAnimationFrame(rafId));
</script>
