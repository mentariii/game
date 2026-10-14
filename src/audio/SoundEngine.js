// Procedural Web Audio Synthesizer & BGM Engine
// Zero external audio files required, supports custom MP3 overrides from loveConfig.js

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.convolver = null;
    this.isInitialized = false;

    // Whoosh dynamic node
    this.whooshSource = null;
    this.whooshFilter = null;
    this.whooshGain = null;

    // Procedural BGM
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.currentBgmChord = 0;
    this.customBgmAudio = null;

    // Pentatonic scale for combo escalation (C5, D5, E5, G5, A5, C6, D6, E6)
    this.comboScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

    // Progression: Fmaj7 -> G6 -> Em7 -> Am7
    this.bgmChords = [
      // Fmaj7: F3, C4, E4, A4
      [174.61, 261.63, 329.63, 440.00],
      // G6: G3, D4, E4, B4
      [196.00, 293.66, 329.63, 493.88],
      // Em7: E3, B3, D4, G4
      [164.81, 246.94, 293.66, 392.00],
      // Am7: A3, E4, G4, C5
      [220.00, 329.63, 392.00, 523.25]
    ];
  }

  // Initialize AudioContext on first user interaction (click, touch, etc.)
  init() {
    if (this.isInitialized && this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // Create procedural lush reverb impulse response
      this.createProceduralReverb();

      // Setup continuous whoosh synthesizer
      this.setupWhooshSynth();

      this.isInitialized = true;
    } catch (err) {
      console.warn("Web Audio API initialization note:", err);
    }
  }

  // Create an ethereal 1.8s exponential decay convolution reverb
  createProceduralReverb() {
    if (!this.ctx) return;
    const rate = this.ctx.sampleRate;
    const length = rate * 1.8;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    const decay = 2.5;

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const t = (1 - n) ** decay;
      left[i] = (Math.random() * 2 - 1) * t;
      right[i] = (Math.random() * 2 - 1) * t;
    }

    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = impulse;
    this.convolverGain = this.ctx.createGain();
    this.convolverGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.convolver.connect(this.convolverGain);
    this.convolverGain.connect(this.sfxGain);
  }

  // Setup dynamic whoosh synthesizer
  setupWhooshSynth() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // Pink noise generator
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    this.whooshSource = this.ctx.createBufferSource();
    this.whooshSource.buffer = noiseBuffer;
    this.whooshSource.loop = true;

    this.whooshFilter = this.ctx.createBiquadFilter();
    this.whooshFilter.type = 'bandpass';
    this.whooshFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.whooshFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.whooshGain = this.ctx.createGain();
    this.whooshGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    this.whooshSource.connect(this.whooshFilter);
    this.whooshFilter.connect(this.whooshGain);
    this.whooshGain.connect(this.sfxGain);

    try {
      this.whooshSource.start();
    } catch {
      // Ignored if already started
    }
  }

  // Modulate whoosh sound in real-time based on hand/mouse speed
  updateWhoosh(velocity) {
    if (!this.ctx || !this.whooshFilter || !this.whooshGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const normalized = Math.min(velocity / 40, 1); // 0 to 1

    if (normalized > 0.08) {
      const targetFreq = 300 + normalized * 1800;
      const targetGain = Math.min(normalized * 0.28, 0.35);
      this.whooshFilter.frequency.setTargetAtTime(targetFreq, now, 0.04);
      this.whooshGain.gain.setTargetAtTime(targetGain, now, 0.04);
    } else {
      this.whooshGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
  }

  // 1. Balloon Pop + Shimmering Harp Chime Arpeggio
  playBalloonPop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Crisp Pop transient
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(280, now);
    popOsc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

    popGain.gain.setValueAtTime(0.5, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    popOsc.connect(popGain);
    popGain.connect(this.sfxGain);
    popOsc.start(now);
    popOsc.stop(now + 0.06);

    // Shimmering Pentatonic Harp Chimes (3 rapid sparkling notes)
    const notes = [659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const delay = 0.03 + idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(now + delay);
      osc.stop(now + delay + 0.75);
    });
  }

  // 2. Gift Box Slice: Crystalline bell chord + sparkle high-frequency shimmer
  playGiftSlice() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Bell chord: E5, G#5, B5, E6
    const freqs = [659.25, 830.61, 987.77, 1318.51];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.25 - i * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(now);
      osc.stop(now + 1.2);
    });

    // Shimmer sparkle envelope
    const noiseOsc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    noiseOsc.type = 'sine';
    noiseOsc.frequency.setValueAtTime(2093.00, now); // C7
    noiseOsc.frequency.exponentialRampToValueAtTime(3135.96, now + 0.15); // G7
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noiseOsc.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noiseOsc.start(now);
    noiseOsc.stop(now + 0.4);
  }

  // 3. Heart Slice: Warm romantic bell & pulse
  playHeartSlice() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [440.00, 554.37, 659.25, 880.00]; // A major
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.03);

      gain.gain.setValueAtTime(0.22, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.95);
    });
  }

  // 4. Combo Pitch Escalation: Note increases with combo count along Major Pentatonic
  playComboSlice(comboCount) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const idx = Math.min(Math.max(comboCount - 1, 0), this.comboScale.length - 1);
    const baseFreq = this.comboScale[idx];

    // Dual-harmonic chime tone
    [baseFreq, baseFreq * 1.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  // 5. Bomb Hit: Low sub-bass sine drop + comical slide whistle
  playBombThud() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub-bass drop: 120Hz down to 35Hz
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // Descending cartoon slide whistle
    const slideOsc = this.ctx.createOscillator();
    const slideGain = this.ctx.createGain();
    slideOsc.type = 'sawtooth';
    slideOsc.frequency.setValueAtTime(480, now + 0.05);
    slideOsc.frequency.exponentialRampToValueAtTime(140, now + 0.38);

    slideGain.gain.setValueAtTime(0.12, now + 0.05);
    slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    slideOsc.connect(slideGain);
    slideGain.connect(this.sfxGain);
    slideOsc.start(now + 0.05);
    slideOsc.stop(now + 0.42);
  }

  // 6. Infinite Love Revive Sound
  playReviveSound() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    arpeggio.forEach((freq, idx) => {
      const delay = idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(now + delay);
      osc.stop(now + delay + 1.3);
    });
  }

  // 7. Boss Slash Hit (1 to 10): Escalating pitch chord + resonance
  playBossSlash(slashIndex) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const baseFreq = 300 + slashIndex * 70;

    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(now);
      osc.stop(now + 0.75);
    });
  }

  // 8. Boss Final 10th Explosion Fanfare
  playBossExplosion() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Huge celebratory fireworks chord cascade
    const fanfare = [
      523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00
    ];
    fanfare.forEach((f, i) => {
      const delay = i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      if (this.convolver) gain.connect(this.convolver);

      osc.start(now + delay);
      osc.stop(now + delay + 2.6);
    });
  }

  // 9. Romantic Ambient BGM Generator: Fmaj7 -> G6 -> Em7 -> Am7
  startAmbientBgm(customUrl = "") {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;

    if (customUrl) {
      try {
        this.customBgmAudio = new Audio(customUrl);
        this.customBgmAudio.loop = true;
        this.customBgmAudio.volume = 0.35;
        this.customBgmAudio.play().catch(e => console.log("Custom audio autoplay policy:", e));
        return;
      } catch (e) {
        console.warn("Failed to play custom MP3, falling back to procedural synth:", e);
      }
    }

    // Procedural Music Box / Electric Piano Arpeggiator
    const playChordStep = () => {
      if (!this.bgmPlaying || !this.ctx || this.isMuted) return;

      const chord = this.bgmChords[this.currentBgmChord];
      const now = this.ctx.currentTime;

      // Play soft arpeggiated notes of the chord
      chord.forEach((freq, noteIdx) => {
        const noteDelay = noteIdx * 0.35;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + noteDelay);

        // Music box timbre
        gain.gain.setValueAtTime(0.08, now + noteDelay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + noteDelay + 2.2);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        if (this.convolver) gain.connect(this.convolver);

        osc.start(now + noteDelay);
        osc.stop(now + noteDelay + 2.3);
      });

      this.currentBgmChord = (this.currentBgmChord + 1) % this.bgmChords.length;
    };

    playChordStep();
    this.bgmInterval = setInterval(playChordStep, 2400); // 2.4s per measure
  }

  stopAmbientBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.customBgmAudio) {
      this.customBgmAudio.pause();
      this.customBgmAudio = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
    if (this.customBgmAudio) {
      this.customBgmAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
