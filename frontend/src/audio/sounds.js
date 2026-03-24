/**
 * AIKA WORLD — Procedural UI Sound Effects
 * Each function creates a short synthesized sound and plays it immediately.
 * Zero audio files — everything is generated with oscillators and noise buffers.
 */

import { audioEngine } from './AudioEngine.js';

function playTone(freq, type, duration, volume = 0.3) {
  const e = audioEngine;
  if (!e.ctx || e.muted) return;
  if (e.ctx.state === 'suspended') e.ctx.resume();
  const osc = e.ctx.createOscillator();
  const gain = e.ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, e.ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(e.sfxGain);
  osc.start();
  osc.stop(e.ctx.currentTime + duration);
}

function playNoise(duration, volume = 0.2) {
  const e = audioEngine;
  if (!e.ctx || e.muted) return;
  if (e.ctx.state === 'suspended') e.ctx.resume();
  const bufferSize = e.ctx.sampleRate * duration;
  const buffer = e.ctx.createBuffer(1, bufferSize, e.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = e.ctx.createBufferSource();
  src.buffer = buffer;
  const gain = e.ctx.createGain();
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, e.ctx.currentTime + duration);
  src.connect(gain);
  gain.connect(e.sfxGain);
  src.start();
}

export const sfx = {
  click:            () => playTone(800, 'square', 0.05, 0.1),
  buildStart:       () => { playTone(300, 'sawtooth', 0.15, 0.15); setTimeout(() => playTone(400, 'sawtooth', 0.15, 0.15), 100); },
  buildComplete:    () => { playTone(523, 'sine', 0.1, 0.2); setTimeout(() => playTone(659, 'sine', 0.1, 0.2), 100); setTimeout(() => playTone(784, 'sine', 0.2, 0.2), 200); },
  researchComplete: () => { playTone(440, 'triangle', 0.15, 0.2); setTimeout(() => playTone(554, 'triangle', 0.15, 0.2), 120); setTimeout(() => playTone(659, 'triangle', 0.15, 0.2), 240); setTimeout(() => playTone(880, 'triangle', 0.3, 0.2), 360); },
  fleetLaunch:      () => { playTone(200, 'sawtooth', 0.3, 0.15); playTone(100, 'sawtooth', 0.4, 0.1); },
  fleetReturn:      () => { playTone(400, 'sine', 0.1, 0.15); setTimeout(() => playTone(300, 'sine', 0.1, 0.15), 80); setTimeout(() => playTone(200, 'sine', 0.2, 0.15), 160); },
  laser:            () => playTone(1200, 'sawtooth', 0.08, 0.12),
  explosion:        () => playNoise(0.3, 0.2),
  shieldHit:        () => playTone(2000, 'sine', 0.1, 0.1),
  notification:     () => { playTone(660, 'sine', 0.1, 0.15); setTimeout(() => playTone(880, 'sine', 0.15, 0.15), 100); },
  error:            () => { playTone(200, 'square', 0.15, 0.15); setTimeout(() => playTone(150, 'square', 0.2, 0.15), 100); },
  questComplete:    () => { playTone(523, 'sine', 0.1, 0.2); setTimeout(() => playTone(659, 'sine', 0.1, 0.2), 80); setTimeout(() => playTone(784, 'sine', 0.1, 0.2), 160); setTimeout(() => playTone(1047, 'sine', 0.3, 0.25), 240); },
};
