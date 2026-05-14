// Web Audio API – all sounds synthesised, no audio files required.

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _bgTimeout: ReturnType<typeof setTimeout> | null = null;
let _bgNextStart = 0;
let _bgRunning = false;

// ─── Context / master chain ───────────────────────────────────────────────────

function ctx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    _master = _ctx.createGain();
    _master.gain.value = 0.65;

    // Gentle compressor to prevent clipping
    const comp = _ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;

    _master.connect(comp);
    comp.connect(_ctx.destination);
  }
  return _ctx;
}

function master(): GainNode {
  ctx();
  return _master!;
}

// ─── Low-level helpers ────────────────────────────────────────────────────────

function makeLowPass(frequency: number): BiquadFilterNode {
  const f = ctx().createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = frequency;
  f.Q.value = 0.7;
  return f;
}

/** Play a single tone with a simple ADSR envelope. */
function tone(
  freq: number,
  start: number,
  dur: number,
  vol: number,
  type: OscillatorType = 'sine',
  dest: AudioNode = master(),
) {
  const c = ctx();
  const osc = c.createOscillator();
  const g = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  const attack = Math.min(0.04, dur * 0.1);
  const release = Math.min(0.12, dur * 0.3);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + attack);
  g.gain.setValueAtTime(vol * 0.75, start + dur - release);
  g.gain.linearRampToValueAtTime(0, start + dur);

  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** Build a simple feedback-delay reverb bus. */
function makeReverb(delayTime = 0.22, feedback = 0.38, wetGain = 0.28): GainNode {
  const c = ctx();
  const input = c.createGain();
  const delay = c.createDelay(1.0);
  const fb = c.createGain();
  const wet = c.createGain();
  const lpf = makeLowPass(1800);

  delay.delayTime.value = delayTime;
  fb.gain.value = feedback;
  wet.gain.value = wetGain;

  input.connect(delay);
  delay.connect(lpf);
  lpf.connect(fb);
  fb.connect(delay);
  delay.connect(wet);
  wet.connect(master());

  return input;
}

// Shared reverb bus (created lazily)
let _reverb: GainNode | null = null;
function reverb(): GainNode {
  if (!_reverb) _reverb = makeReverb();
  return _reverb;
}

// ─── Background music ─────────────────────────────────────────────────────────
// Am pentatonic: A3 C4 D4 E4 G4 A4  (underwater, dreamy loop)

const AM_PENT = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00];
// A flowing arpeggiated pattern (index into AM_PENT)
const MELODY_IDX = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 2, 3, 4, 3, 2];
const BEAT = 0.52; // seconds per note

function scheduleBgLoop(startAt: number): number {
  const c = ctx();
  const lpf = makeLowPass(900); // underwater muffling
  lpf.connect(reverb());

  const loopDur = MELODY_IDX.length * BEAT;

  // Bass drone – very soft
  [55.00, 110.00].forEach(f => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, startAt);
    g.gain.linearRampToValueAtTime(0.06, startAt + 0.2);
    g.gain.setValueAtTime(0.06, startAt + loopDur - 0.3);
    g.gain.linearRampToValueAtTime(0, startAt + loopDur);
    osc.connect(g);
    g.connect(lpf);
    osc.start(startAt);
    osc.stop(startAt + loopDur + 0.1);
  });

  // Melody
  MELODY_IDX.forEach((idx, i) => {
    const t = startAt + i * BEAT;
    tone(AM_PENT[idx], t, BEAT * 1.15, 0.13, 'sine', lpf);
    // Octave-up sparkle every 4 beats
    if (i % 4 === 0) tone(AM_PENT[idx] * 2, t, BEAT * 0.5, 0.05, 'triangle', lpf);
  });

  // Soft harmony layer (a fifth up)
  [0, 4, 8, 12].forEach(i => {
    if (i < MELODY_IDX.length) {
      const t = startAt + i * BEAT;
      tone(AM_PENT[MELODY_IDX[i]] * 1.5, t, BEAT * 2, 0.05, 'sine', lpf);
    }
  });

  return loopDur;
}

export function startBgMusic() {
  if (_bgRunning) return;
  _bgRunning = true;

  const c = ctx();
  if (c.state === 'suspended') c.resume();

  _bgNextStart = c.currentTime + 0.1;

  function schedule() {
    if (!_bgRunning) return;
    const dur = scheduleBgLoop(_bgNextStart);
    _bgNextStart += dur;
    // Re-schedule 0.6 s before the loop ends so there's no gap
    const delay = (_bgNextStart - ctx().currentTime - 0.6) * 1000;
    _bgTimeout = setTimeout(schedule, Math.max(delay, 50));
  }

  schedule();
}

export function stopBgMusic() {
  _bgRunning = false;
  if (_bgTimeout) { clearTimeout(_bgTimeout); _bgTimeout = null; }
}

// ─── Sound effects ────────────────────────────────────────────────────────────

export function playEatSound() {
  const c = ctx();
  const now = c.currentTime;

  // "Bloop" – fast downward frequency glide
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(680, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
  g.gain.setValueAtTime(0.45, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(g);
  g.connect(reverb());
  g.connect(master());
  osc.start(now);
  osc.stop(now + 0.25);

  // Tiny transient "pop"
  const pop = c.createOscillator();
  const pg = c.createGain();
  pop.type = 'square';
  pop.frequency.value = 220;
  pg.gain.setValueAtTime(0.12, now);
  pg.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  pop.connect(pg);
  pg.connect(master());
  pop.start(now);
  pop.stop(now + 0.05);
}

export function playLevelComplete() {
  const c = ctx();
  const now = c.currentTime;
  // Rising C-maj arpeggio: C4 E4 G4 C5 – then a sustained chord
  const arp = [261.63, 329.63, 392.00, 523.25];
  arp.forEach((f, i) => tone(f, now + i * 0.13, 0.28, 0.35, 'triangle'));
  arp.forEach(f => tone(f, now + arp.length * 0.13, 0.9, 0.18, 'sine'));
  // Extra shimmer
  tone(1046.5, now + arp.length * 0.13 + 0.1, 0.6, 0.12, 'sine');
}

export function playGameOver() {
  const c = ctx();
  const now = c.currentTime;
  // Descending minor: A4 G4 Eb4 C4
  [440, 392, 311.13, 261.63].forEach((f, i) =>
    tone(f, now + i * 0.22, 0.38, 0.32, 'triangle'),
  );
}

/** Call once on first user interaction to unlock AudioContext on mobile/Safari. */
export function resumeAudio() {
  if (_ctx?.state === 'suspended') _ctx.resume();
  if (!_ctx) ctx(); // create eagerly so first sound has no latency
}
