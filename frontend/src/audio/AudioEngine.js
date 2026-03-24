/**
 * AIKA WORLD — Audio Engine (Singleton)
 * Manages Web Audio context, master/music/sfx gain nodes, volume & mute state.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicPlaying = false;
    this._volume = parseFloat(localStorage.getItem('aika_audio_volume') || '0.5');
    this._muted = localStorage.getItem('aika_audio_muted') === 'true';
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.3;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this.setVolume(this._volume);
    this.setMuted(this._muted);
  }

  setVolume(v) {
    this._volume = v;
    if (this.masterGain) this.masterGain.gain.value = this._muted ? 0 : v;
    localStorage.setItem('aika_audio_volume', v);
  }

  setMuted(m) {
    this._muted = m;
    if (this.masterGain) this.masterGain.gain.value = m ? 0 : this._volume;
    localStorage.setItem('aika_audio_muted', m);
  }

  get volume() { return this._volume; }
  get muted() { return this._muted; }
}

export const audioEngine = new AudioEngine();
