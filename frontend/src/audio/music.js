/**
 * AIKA WORLD — Ambient Space Music (Procedural)
 * Generates a continuous space drone using oscillators and LFO modulation.
 */

import { audioEngine } from './AudioEngine.js';

let droneOscs = [];

export function startAmbientMusic() {
  const e = audioEngine;
  if (!e.ctx || e.musicPlaying) return;
  e.musicPlaying = true;

  // Base drone: low frequency pad
  const osc1 = e.ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 55; // A1
  const gain1 = e.ctx.createGain();
  gain1.gain.value = 0.15;
  osc1.connect(gain1);
  gain1.connect(e.musicGain);
  osc1.start();

  // Harmonic layer
  const osc2 = e.ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 82.5; // E2
  const gain2 = e.ctx.createGain();
  gain2.gain.value = 0.08;
  osc2.connect(gain2);
  gain2.connect(e.musicGain);
  osc2.start();

  // Subtle high shimmer
  const osc3 = e.ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = 440;
  const gain3 = e.ctx.createGain();
  gain3.gain.value = 0.02;
  osc3.connect(gain3);
  gain3.connect(e.musicGain);
  osc3.start();

  // Slow LFO on frequencies for movement
  const lfo = e.ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.05; // Very slow
  const lfoGain = e.ctx.createGain();
  lfoGain.gain.value = 5;
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfo.start();

  droneOscs = [osc1, osc2, osc3, lfo];
}

export function stopAmbientMusic() {
  droneOscs.forEach(o => { try { o.stop(); } catch (e) { /* already stopped */ } });
  droneOscs = [];
  audioEngine.musicPlaying = false;
}
