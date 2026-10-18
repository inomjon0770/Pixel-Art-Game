// Web Audio API Procedural Chiptune & Sound Effects Engine
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterVolume = 0.7;
    this.bgmVolume = 0.5;
    this.sfxVolume = 0.8;
    this.isMuted = false;
    this.currentTrack = null;
    this.isPlayingBgm = false;
    this.bgmInterval = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateVolumes();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  }

  resume() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateVolumes();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateVolumes();
    return this.isMuted;
  }

  updateVolumes() {
    if (!this.masterGain) return;
    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.setValueAtTime(0, now);
    } else {
      this.masterGain.gain.setValueAtTime(this.masterVolume, now);
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, now);
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
    }
  }

  // --- Dynamic Procedural Chiptune Music Generator ---
  playMusic(theme = 'forest') {
    this.resume();
    if (this.currentTrack === theme && this.isPlayingBgm) return;
    this.stopMusic();

    this.currentTrack = theme;
    this.isPlayingBgm = true;

    // Musical scales for procedural generation
    const scales = {
      forest: [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37], // A Major Pentatonic / Lydian
      crypt: [146.83, 164.81, 174.61, 220.00, 246.94, 293.66, 329.63],   // D Minor Aeolian
      magma: [110, 123.47, 130.81, 146.83, 164.81, 174.61, 220],          // Heavy A Phrygian
      frost: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33],   // C Lydian crystalline
      void: [130.81, 138.59, 164.81, 174.61, 196.00, 207.65, 261.63],    // Diminished / Cyber mystery
      boss: [110, 116.54, 130.81, 146.83, 155.56, 174.61, 220, 246.94]    // Fast Locrian / Thriller
    };

    const scale = scales[theme] || scales.forest;
    const tempo = theme === 'boss' ? 140 : (theme === 'magma' ? 110 : 90);
    const stepTime = 60 / tempo / 2; // 16th or 8th notes

    let step = 0;
    const playStep = () => {
      if (!this.isPlayingBgm || !this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Bassline (Square/Triangle wave)
      if (step % 2 === 0) {
        const bassFreq = scale[(step / 2) % 4] * 0.5;
        this.playTone(bassFreq, 'triangle', now, stepTime * 1.8, 0.25, this.bgmGain);
      }

      // 2. Melody Lead (Arpeggiator / Pulse wave)
      const leadNoteIndex = (step * 3 + (step % 5)) % scale.length;
      if (step % 2 === 0 || theme === 'boss' || theme === 'frost') {
        const leadFreq = scale[leadNoteIndex] * (theme === 'boss' ? 1.5 : 1.0);
        this.playTone(leadFreq, 'sawtooth', now, stepTime * 0.8, 0.12, this.bgmGain);
      }

      // 3. Counter Arp (Higher octave twinkle)
      if (step % 4 === 1 && theme !== 'crypt') {
        const highFreq = scale[(step + 2) % scale.length] * 2.0;
        this.playTone(highFreq, 'sine', now, stepTime * 0.6, 0.08, this.bgmGain);
      }

      // 4. Chiptune Percussion (Noise click / hi-hat / snare)
      if (step % 4 === 0) {
        this.playKick(now, this.bgmGain);
      } else if (step % 4 === 2) {
        this.playSnare(now, this.bgmGain);
      } else if (theme === 'boss' || theme === 'magma') {
        this.playHiHat(now, this.bgmGain);
      }

      step = (step + 1) % 64;
    };

    this.bgmInterval = setInterval(playStep, stepTime * 1000);
  }

  stopMusic() {
    this.isPlayingBgm = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // --- Core Synthesis Helpers ---
  playTone(freq, type, startTime, duration, vol, outputGain) {
    if (!this.ctx || !outputGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(outputGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {}
  }

  playKick(startTime, outputGain) {
    if (!this.ctx || !outputGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, startTime);
      osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.12);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
      osc.connect(gain);
      gain.connect(outputGain);
      osc.start(startTime);
      osc.stop(startTime + 0.14);
    } catch (e) {}
  }

  playSnare(startTime, outputGain) {
    if (!this.ctx || !outputGain) return;
    try {
      // Noise burst for snare
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(outputGain);

      noise.start(startTime);
    } catch (e) {}
  }

  playHiHat(startTime, outputGain) {
    if (!this.ctx || !outputGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(7000, startTime);
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);
      osc.connect(gain);
      gain.connect(outputGain);
      osc.start(startTime);
      osc.stop(startTime + 0.04);
    } catch (e) {}
  }

  // --- Rich Sound Effects (SFX) ---
  playSfx(type) {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'slash': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }

      case 'hit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'crit': {
        this.playTone(550, 'sawtooth', now, 0.15, 0.3, this.sfxGain);
        this.playTone(880, 'sine', now + 0.04, 0.18, 0.3, this.sfxGain);
        break;
      }

      case 'dash': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'magic_cast': {
        this.playTone(523.25, 'sine', now, 0.12, 0.2, this.sfxGain);
        this.playTone(659.25, 'sine', now + 0.06, 0.12, 0.2, this.sfxGain);
        this.playTone(783.99, 'sine', now + 0.12, 0.2, 0.2, this.sfxGain);
        break;
      }

      case 'time_stop': {
        // Slow sweeping pitch down
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.65);
        break;
      }

      case 'potion': {
        this.playTone(400, 'sine', now, 0.08, 0.2, this.sfxGain);
        this.playTone(500, 'sine', now + 0.07, 0.08, 0.2, this.sfxGain);
        this.playTone(600, 'sine', now + 0.14, 0.12, 0.2, this.sfxGain);
        break;
      }

      case 'coin': {
        this.playTone(987.77, 'square', now, 0.08, 0.15, this.sfxGain);
        this.playTone(1318.51, 'square', now + 0.08, 0.16, 0.15, this.sfxGain);
        break;
      }

      case 'chest': {
        this.playTone(330, 'triangle', now, 0.1, 0.2, this.sfxGain);
        this.playTone(440, 'triangle', now + 0.08, 0.1, 0.2, this.sfxGain);
        this.playTone(660, 'triangle', now + 0.16, 0.25, 0.25, this.sfxGain);
        break;
      }

      case 'levelup': {
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
          this.playTone(freq, 'sawtooth', now + idx * 0.09, 0.18, 0.2, this.sfxGain);
        });
        break;
      }

      case 'boss_roar': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.75);
        break;
      }

      case 'click': {
        this.playTone(800, 'sine', now, 0.03, 0.1, this.sfxGain);
        break;
      }

      case 'dialogue_beep': {
        const randPitch = 400 + Math.random() * 200;
        this.playTone(randPitch, 'triangle', now, 0.03, 0.08, this.sfxGain);
        break;
      }
    }
  }
}

export const audio = new AudioManager();
