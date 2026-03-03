/**
 * AIKA WORLD — Audio Utility (Synthesized Web Audio)
 */

class BotAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // UI Sounds
  click()   { this.playTone(800, 'sine', 0.1, 0.05); }
  success() { 
    this.playTone(600, 'sine', 0.2, 0.05); 
    setTimeout(() => this.playTone(900, 'sine', 0.3, 0.05), 100);
  }
  error()   { 
    this.playTone(200, 'sawtooth', 0.3, 0.05); 
  }
  build()   { 
    this.playTone(400, 'square', 0.1, 0.03);
    setTimeout(() => this.playTone(500, 'square', 0.1, 0.03), 100);
  }
  mission() {
    this.playTone(1000, 'sine', 0.5, 0.02);
    setTimeout(() => this.playTone(1200, 'sine', 0.5, 0.02), 200);
  }
}

export const audio = new BotAudio();
