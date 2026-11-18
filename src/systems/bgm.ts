/**
 * Procedural Web Audio Background Music (BGM) Sequencer for MARS: THE LAST DESCENT
 * Zero external audio assets — uses a hardware-clock lookahead scheduler.
 * Tracks:
 * - 'intro': Warm orchestral-synth space overture (Main Menu, Prologue, Crash/Launch)
 * - 'moon': Weightless lunar celesta & floating vacuum pads (Moon Chapter)
 * - 'mars': Determined rhythmic exploration synthwave-ambient (Mars Open World)
 */

export type BgmTrack = 'intro' | 'mars' | 'moon' | 'none';

interface BarScore {
  padMidi: number[];
  bassMidi: number;
  arpSteps: Record<number, number>;
}

interface TrackConfig {
  bpm: number;
  padFilterHz: number;
  padGain: number;
  padWave: OscillatorType;
  bassMode: 'sustained' | 'pulse' | 'none';
  bassGain: number;
  arpGain: number;
  echoDelayS: number;
  percussion: boolean;
  bars: BarScore[];
}

const TRACK_CONFIGS: Record<Exclude<BgmTrack, 'none'>, TrackConfig> = {
  // 72 BPM D Dorian orbital overture
  intro: {
    bpm: 72,
    padFilterHz: 720,
    padGain: 0.048,
    padWave: 'triangle',
    bassMode: 'sustained',
    bassGain: 0.095,
    arpGain: 0.045,
    echoDelayS: 0.31,
    percussion: false,
    bars: [
      {
        padMidi: [50, 57, 60, 64, 65], // Dm9
        bassMidi: 38, // D2
        arpSteps: { 0: 69, 3: 72, 6: 76, 10: 74, 14: 69 },
      },
      {
        padMidi: [46, 53, 57, 60, 62], // Bbmaj7
        bassMidi: 34, // Bb1
        arpSteps: { 0: 70, 4: 74, 7: 77, 11: 72, 14: 69 },
      },
      {
        padMidi: [48, 53, 57, 60, 64], // Fmaj7
        bassMidi: 41, // F2
        arpSteps: { 0: 72, 3: 76, 6: 79, 10: 77, 13: 72 },
      },
      {
        padMidi: [48, 55, 57, 62, 64], // C6/9
        bassMidi: 36, // C2
        arpSteps: { 0: 74, 4: 72, 8: 67, 12: 69 },
      },
    ],
  },

  // 66 BPM A Aeolian / F Lydian lunar horizon
  moon: {
    bpm: 66,
    padFilterHz: 580,
    padGain: 0.042,
    padWave: 'sine',
    bassMode: 'sustained',
    bassGain: 0.07,
    arpGain: 0.042,
    echoDelayS: 0.38,
    percussion: false,
    bars: [
      {
        padMidi: [52, 57, 60, 64, 71], // Am9
        bassMidi: 45, // A2
        arpSteps: { 0: 76, 5: 79, 10: 83 },
      },
      {
        padMidi: [53, 57, 60, 64, 69], // Fmaj7
        bassMidi: 41, // F2
        arpSteps: { 2: 76, 7: 72, 12: 77 },
      },
      {
        padMidi: [50, 55, 59, 64, 67], // G6
        bassMidi: 43, // G2
        arpSteps: { 0: 79, 6: 76, 11: 74 },
      },
      {
        padMidi: [52, 55, 59, 62, 67], // Em7
        bassMidi: 40, // E2
        arpSteps: { 3: 74, 8: 71, 13: 76 },
      },
    ],
  },

  // 88 BPM E Minor 8-bar exploration theme
  mars: {
    bpm: 88,
    padFilterHz: 760,
    padGain: 0.04,
    padWave: 'triangle',
    bassMode: 'pulse',
    bassGain: 0.068,
    arpGain: 0.042,
    echoDelayS: 0.255,
    percussion: true,
    bars: [
      {
        padMidi: [52, 55, 59, 66], // Em9
        bassMidi: 40, // E2
        arpSteps: { 0: 71, 3: 74, 6: 76, 10: 74, 14: 71 },
      },
      {
        padMidi: [48, 55, 59, 64], // Cmaj7
        bassMidi: 36, // C2
        arpSteps: { 0: 72, 4: 76, 8: 79, 12: 76 },
      },
      {
        padMidi: [47, 54, 59, 62], // Gmaj7
        bassMidi: 43, // G2
        arpSteps: { 0: 74, 3: 78, 6: 79, 10: 76, 14: 74 },
      },
      {
        padMidi: [50, 57, 64, 66], // Dadd9
        bassMidi: 38, // D2
        arpSteps: { 0: 76, 6: 74, 12: 69 },
      },
      {
        padMidi: [48, 52, 57, 59], // Am9
        bassMidi: 45, // A2
        arpSteps: { 0: 72, 3: 76, 6: 79, 10: 74, 14: 72 },
      },
      {
        padMidi: [48, 55, 59, 64], // Cmaj7
        bassMidi: 36, // C2
        arpSteps: { 0: 71, 4: 72, 8: 76, 12: 74 },
      },
      {
        padMidi: [47, 52, 54, 57], // Bsus4
        bassMidi: 35, // B1
        arpSteps: { 0: 71, 6: 74, 12: 66 },
      },
      {
        padMidi: [52, 55, 59, 66], // Em9 (release bar)
        bassMidi: 40, // E2
        arpSteps: { 0: 67, 8: 71 },
      },
    ],
  },
};

const MASTER_SCALE = 0.34;
const LOOKAHEAD_S = 0.28;
const SCHEDULER_TICK_MS = 100;

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class BgmEngine {
  private activeTrack: BgmTrack = 'none';
  private masterGain: GainNode | null = null;
  private scheduleTimer: number | null = null;
  private stepIndex = 0;
  private nextNoteTime = 0;
  private getNoiseBuffer: () => AudioBuffer | null;

  constructor(getNoiseBuffer: () => AudioBuffer | null) {
    this.getNoiseBuffer = getNoiseBuffer;
  }

  public getActiveTrack(): BgmTrack {
    return this.activeTrack;
  }

  public sync(ctx: AudioContext, track: BgmTrack, volume: number): void {
    if (track === 'none' || volume <= 0) {
      this.stop(ctx);
      return;
    }

    const targetGain = Math.max(0, Math.min(1, volume)) * MASTER_SCALE;

    if (this.activeTrack === track && this.scheduleTimer !== null && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08);
      return;
    }

    // Crossfade cleanly from any previous track
    this.stop(ctx);

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1.2);
    bus.connect(ctx.destination);

    this.masterGain = bus;
    this.activeTrack = track;
    this.stepIndex = 0;
    this.nextNoteTime = ctx.currentTime + 0.06;

    const cfg = TRACK_CONFIGS[track];
    const stepDuration = 60 / cfg.bpm / 4;

    this.scheduleTimer = window.setInterval(() => {
      if (!this.masterGain || this.activeTrack !== track) return;
      if (ctx.state !== 'running') return;

      // Prevent catch-up note bursts after tab sleep
      if (this.nextNoteTime < ctx.currentTime - 0.5) {
        this.nextNoteTime = ctx.currentTime + 0.05;
      }

      while (this.nextNoteTime < ctx.currentTime + LOOKAHEAD_S) {
        this.scheduleStep(ctx, bus, cfg, this.stepIndex, this.nextNoteTime, stepDuration);
        this.nextNoteTime += stepDuration;
        this.stepIndex++;
      }
    }, SCHEDULER_TICK_MS);
  }

  public setVolume(ctx: AudioContext | null, volume: number): void {
    if (!ctx || !this.masterGain) return;
    if (volume <= 0) {
      this.stop(ctx);
      return;
    }
    const target = Math.max(0, Math.min(1, volume)) * MASTER_SCALE;
    this.masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.08);
  }

  public stop(ctx: AudioContext | null): void {
    if (this.scheduleTimer !== null) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }
    const oldBus = this.masterGain;
    this.masterGain = null;
    this.activeTrack = 'none';

    if (oldBus && ctx) {
      try {
        const now = ctx.currentTime;
        oldBus.gain.cancelScheduledValues(now);
        oldBus.gain.setValueAtTime(Math.max(0.0001, oldBus.gain.value), now);
        oldBus.gain.linearRampToValueAtTime(0.0001, now + 0.45);
        window.setTimeout(() => {
          try {
            oldBus.disconnect();
          } catch {}
        }, 550);
      } catch {}
    }
  }

  private scheduleStep(
    ctx: AudioContext,
    bus: GainNode,
    cfg: TrackConfig,
    absStep: number,
    time: number,
    stepDur: number
  ): void {
    const barCount = cfg.bars.length;
    const barIdx = Math.floor(absStep / 16) % barCount;
    const stepInBar = absStep % 16;
    const bar = cfg.bars[barIdx];
    const barDur = stepDur * 16;

    // 1. Warm Evolving Chord Pad (triggered once at start of each bar)
    if (stepInBar === 0) {
      this.triggerPadChord(ctx, bus, bar.padMidi, time, barDur + 0.7, cfg.padFilterHz, cfg.padGain, cfg.padWave);
    }

    // 2. Bass Anchor
    if (cfg.bassMode === 'sustained') {
      if (stepInBar === 0) {
        this.triggerBassNote(ctx, bus, midiToHz(bar.bassMidi), time, barDur * 0.78, cfg.bassGain, 'sine');
      } else if (stepInBar === 12) {
        this.triggerBassNote(ctx, bus, midiToHz(bar.bassMidi + 12), time, stepDur * 3.5, cfg.bassGain * 0.45, 'sine');
      }
    } else if (cfg.bassMode === 'pulse') {
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 8 || stepInBar === 10 || stepInBar === 14) {
        const note = stepInBar === 10 ? bar.bassMidi + 12 : bar.bassMidi;
        const accent = stepInBar === 0 || stepInBar === 8 ? 1.0 : 0.72;
        const dur = stepInBar === 6 || stepInBar === 14 ? stepDur * 1.7 : stepDur * 1.35;
        this.triggerBassNote(ctx, bus, midiToHz(note), time, dur, cfg.bassGain * accent, 'sawtooth');
      }
    }

    // 3. Expressive Cosmic Pluck + Simulated Tape Delay Echo
    const arpMidi = bar.arpSteps[stepInBar];
    if (arpMidi !== undefined) {
      const hz = midiToHz(arpMidi);
      this.triggerCelestaWithEcho(ctx, bus, hz, time, cfg.arpGain, cfg.echoDelayS);
    }

    // 4. Gentle Exploration Percussion (Mars track only)
    if (cfg.percussion) {
      if (stepInBar === 0 || stepInBar === 8) {
        this.triggerSoftThump(ctx, bus, time, stepInBar === 0 ? 0.055 : 0.036);
      }
      if (stepInBar === 2 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14) {
        this.triggerSoftShaker(ctx, bus, time, stepInBar === 6 || stepInBar === 14 ? 0.014 : 0.009);
      }
    }
  }

  private triggerPadChord(
    ctx: AudioContext,
    bus: GainNode,
    midis: number[],
    time: number,
    duration: number,
    cutoffHz: number,
    gainPerVoice: number,
    wave: OscillatorType
  ): void {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(0.7, time);
    filter.frequency.setValueAtTime(cutoffHz * 0.72, time);
    filter.frequency.linearRampToValueAtTime(cutoffHz * 1.18, time + duration * 0.45);
    filter.frequency.linearRampToValueAtTime(cutoffHz * 0.78, time + duration);

    const env = ctx.createGain();
    const peak = gainPerVoice;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(peak, time + Math.min(1.1, duration * 0.3));
    env.gain.setValueAtTime(peak, time + Math.max(0.2, duration - 1.1));
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    filter.connect(env);
    env.connect(bus);

    midis.forEach((midi, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? wave : 'sine';
      osc.frequency.setValueAtTime(midiToHz(midi), time);
      osc.detune.setValueAtTime(idx % 2 === 0 ? -4.5 : 4.5, time);
      osc.connect(filter);
      osc.start(time);
      osc.stop(time + duration + 0.05);
      osc.onended = () => {
        try { osc.disconnect(); } catch {}
      };
    });
  }

  private triggerBassNote(
    ctx: AudioContext,
    bus: GainNode,
    hz: number,
    time: number,
    duration: number,
    peakGain: number,
    wave: OscillatorType
  ): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = wave;
    osc.frequency.setValueAtTime(hz, time);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(1.2, time);
    filter.frequency.setValueAtTime(wave === 'sawtooth' ? 320 : 220, time);
    filter.frequency.exponentialRampToValueAtTime(110, time + duration);

    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(peakGain, time + 0.025);
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(env);
    env.connect(bus);

    osc.start(time);
    osc.stop(time + duration + 0.04);
    osc.onended = () => {
      try {
        osc.disconnect();
        filter.disconnect();
        env.disconnect();
      } catch {}
    };
  }

  private triggerCelestaWithEcho(
    ctx: AudioContext,
    bus: GainNode,
    hz: number,
    time: number,
    baseGain: number,
    echoDelayS: number
  ): void {
    const taps = [
      { delay: 0, gain: baseGain, cutoff: 1900, dur: 0.72 },
      { delay: echoDelayS, gain: baseGain * 0.34, cutoff: 1200, dur: 0.65 },
      { delay: echoDelayS * 2, gain: baseGain * 0.14, cutoff: 820, dur: 0.55 },
    ];

    for (const tap of taps) {
      const t = time + tap.delay;
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const overGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const env = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(hz, t);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(hz * 2, t);
      overGain.gain.setValueAtTime(0.22, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(tap.cutoff, t);

      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(tap.gain, t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, t + tap.dur);

      osc.connect(filter);
      overtone.connect(overGain);
      overGain.connect(filter);
      filter.connect(env);
      env.connect(bus);

      osc.start(t);
      overtone.start(t);
      osc.stop(t + tap.dur + 0.04);
      overtone.stop(t + tap.dur + 0.04);
      osc.onended = () => {
        try {
          osc.disconnect();
          overtone.disconnect();
          overGain.disconnect();
          filter.disconnect();
          env.disconnect();
        } catch {}
      };
    }
  }

  private triggerSoftThump(ctx: AudioContext, bus: GainNode, time: number, gainVal: number): void {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(86, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.14);

    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(gainVal, time + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

    osc.connect(env);
    env.connect(bus);
    osc.start(time);
    osc.stop(time + 0.2);
    osc.onended = () => {
      try {
        osc.disconnect();
        env.disconnect();
      } catch {}
    };
  }

  private triggerSoftShaker(ctx: AudioContext, bus: GainNode, time: number, gainVal: number): void {
    const nBuf = this.getNoiseBuffer();
    if (!nBuf) return;

    const src = ctx.createBufferSource();
    src.buffer = nBuf;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(4800, time);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(gainVal, time + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);

    src.connect(hp);
    hp.connect(env);
    env.connect(bus);

    const offset = Math.random() * Math.max(0.1, nBuf.duration - 0.1);
    src.start(time, offset, 0.07);
    src.onended = () => {
      try {
        src.disconnect();
        hp.disconnect();
        env.disconnect();
      } catch {}
    };
  }
}
