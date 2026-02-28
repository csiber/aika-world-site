/**
 * Bot audio — szintetizált hangok Web Audio API-val (fájl nélkül)
 * Az AudioContext-et user interaction után kell inicializálni.
 */

let ctx    = null;
let vol    = 0.35;

export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
}

export function setVolume(v) {
  vol = Math.max(0, Math.min(1, v));
}

function tone(freq, dur, type = 'sine', delay = 0, v = null) {
  if (!ctx || vol <= 0) return;
  const gainVal = v ?? vol;
  const t = ctx.currentTime + delay;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type           = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainVal, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

export const sounds = {
  // Bot aktiválva — felfelé arpeggio
  start() {
    tone(440, 0.12, 'sine', 0);
    tone(550, 0.12, 'sine', 0.13);
    tone(660, 0.18, 'sine', 0.26);
  },
  // Bot leállítva — lefelé glide
  stop() {
    tone(440, 0.15, 'sine', 0);
    tone(330, 0.22, 'sine', 0.18);
  },
  // Épület fejlesztés
  build() {
    tone(880, 0.10, 'sine', 0);
    tone(1100, 0.14, 'sine', 0.11);
  },
  // Kutatás indítás — háromhangos
  research() {
    tone(660, 0.09, 'triangle', 0);
    tone(880, 0.09, 'triangle', 0.11);
    tone(1100, 0.16, 'triangle', 0.22);
  },
  // Flotta gyártás — fűrészfog zúgás
  fleet() {
    tone(220, 0.08, 'sawtooth', 0);
    tone(330, 0.08, 'sawtooth', 0.09);
    tone(440, 0.18, 'sawtooth', 0.18);
  },
  // Energia figyelmeztető
  energy() {
    tone(523, 0.18, 'triangle', 0);
  },
  // Limit / kimerült — vészjelzés
  warn() {
    tone(440, 0.12, 'sawtooth', 0);
    tone(440, 0.12, 'sawtooth', 0.22);
    tone(330, 0.28, 'sawtooth', 0.44);
  },
};
