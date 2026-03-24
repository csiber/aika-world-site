/**
 * AIKA WORLD — Audio Utility (Synthesized Web Audio)
 * Now delegates to the central AudioEngine for unified volume/mute control.
 */

import { audioEngine } from '@/audio/AudioEngine.js';

class BotAudio {
  constructor() {
    this.enabled = true;
    this.volume = 0.1;
  }

  /** Initialise the shared AudioEngine context */
  init() {
    audioEngine.init();
  }

  /** @private */
  playTone(freq, type, duration, volMult = 1) {
    if (!this.enabled || !audioEngine.ctx || audioEngine.muted) return;
    if (audioEngine.ctx.state === 'suspended') audioEngine.ctx.resume();

    const osc = audioEngine.ctx.createOscillator();
    const gain = audioEngine.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioEngine.ctx.currentTime);

    gain.gain.setValueAtTime(this.volume * volMult, audioEngine.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioEngine.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioEngine.sfxGain || audioEngine.ctx.destination);

    osc.start();
    osc.stop(audioEngine.ctx.currentTime + duration);
  }

  // UI Sounds
  click()    { this.playTone(800, 'sine', 0.1, 0.5); }
  success()  {
    this.playTone(600, 'sine', 0.2, 0.5);
    setTimeout(() => this.playTone(900, 'sine', 0.3, 0.5), 100);
  }
  error()    {
    this.playTone(200, 'sawtooth', 0.3, 0.5);
  }
  build()    {
    this.playTone(400, 'square', 0.1, 0.3);
    setTimeout(() => this.playTone(500, 'square', 0.1, 0.3), 100);
  }
  research() {
    this.playTone(700, 'sine', 0.1, 0.3);
    setTimeout(() => this.playTone(850, 'sine', 0.2, 0.3), 80);
  }
  fleet()    {
    this.playTone(1000, 'sine', 0.5, 0.2);
    setTimeout(() => this.playTone(1200, 'sine', 0.5, 0.2), 200);
  }
  energy()   {
    this.playTone(300, 'triangle', 0.2, 0.4);
    setTimeout(() => this.playTone(400, 'triangle', 0.2, 0.4), 150);
  }
  warn()     {
    this.playTone(150, 'sawtooth', 0.4, 0.6);
  }
  start()    {
    this.playTone(500, 'sine', 0.1, 0.5);
    setTimeout(() => this.playTone(700, 'sine', 0.2, 0.5), 100);
  }
  stop()     {
    this.playTone(700, 'sine', 0.1, 0.5);
    setTimeout(() => this.playTone(500, 'sine', 0.2, 0.5), 100);
  }
}

export const audio = new BotAudio();

// Backward compatibility for old imports
export const initAudio = () => audio.init();
export const setVolume = (v) => { audio.volume = v; };
export const sounds = {
    click:    () => audio.click(),
    success:  () => audio.success(),
    error:    () => audio.error(),
    build:    () => audio.build(),
    research: () => audio.research(),
    fleet:    () => audio.fleet(),
    energy:   () => audio.energy(),
    warn:     () => audio.warn(),
    start:    () => audio.start(),
    stop:     () => audio.stop()
};
