/*
 * This file runs in AudioWorkletGlobalScope, not the window or node, so oxlint sees
 * neither its globals (AudioWorkletProcessor, registerProcessor, sampleRate) nor any
 * types for them. With the base class unresolved every `this.x` degrades to `any`,
 * which fires the whole no-unsafe-* family on correct code. no-mixed-operators is off
 * because parenthesising every term of a DSP formula obscures the maths it transcribes.
 * The performance-improvement plugin's rm3.js takes the same route for the same reason.
 */
/* oxlint-disable no-undef */
/* oxlint-disable typescript/no-unsafe-argument */
/* oxlint-disable typescript/no-unsafe-assignment */
/* oxlint-disable typescript/no-unsafe-call */
/* oxlint-disable typescript/no-unsafe-member-access */
/* oxlint-disable typescript/no-unsafe-return */
/* oxlint-disable @stylistic/no-mixed-operators */

/**
 * Pitch-shift AudioWorklet — transposes audio without changing its tempo.
 *
 * WHY THIS IS NOT A ONE-LINER. Do not "simplify" this into a playbackRate tweak:
 *
 *   - `playbackRate` alone moves tempo AND pitch together.
 *   - `playbackRate` + `preservesPitch = true` moves tempo and HOLDS pitch — the
 *     exact opposite of what we want. There is no element flag for pitch-only.
 *   - A pure resampler cannot do it either. A MediaElementAudioSourceNode delivers
 *     samples in real time, so this node must be rate-neutral: N frames in, N frames
 *     out per render quantum. Resampling is never rate-neutral.
 *
 * Constant-tempo pitch shift therefore needs a genuine time-stretch. That is what
 * the phase vocoder below is for.
 *
 * ARCHITECTURE — time-stretch by the pitch ratio, then resample by the same ratio:
 *
 *   input ─▶ STFT phase-vocoder stretch (×r, pitch unchanged) ─▶ resample (×r) ─▶ out
 *
 * Stretching by r makes the audio r× longer at the original pitch; reading it back
 * r× faster restores the original duration and lifts the pitch by r.
 *
 * Rate-neutral BY CONSTRUCTION, which is what keeps this stable for hours: a frame
 * consumes `gap` input samples and emits `r · gap` stretched samples, which the
 * resampler turns back into exactly `gap` output samples — for any r. Frames are
 * rendered on demand by the resampler (pull model), so production can never outrun
 * consumption and there is no free-running producer to drift against.
 *
 * This file is authored as plain JS (no TypeScript) because it ships verbatim as a
 * string via Vite's `?raw` and is loaded through a Blob URL. See ./audio-graph.ts.
 */

const FFT_SIZE = 2048;
const HALF_SIZE = FFT_SIZE / 2;
const BIN_COUNT = HALF_SIZE + 1;
const TWO_PI = Math.PI * 2;

/**
 * We hold the SYNTHESIS hop near FFT_SIZE/4 (75% overlap), where Hann² overlap-add
 * sums flat. Since hs = r · gap, the analysis hop has to shrink as the pitch rises,
 * or hs would reach 50% overlap — where Hann² does not sum flat and adds audible
 * amplitude ripple. Clamping the analysis hop caps CPU at 2× nominal.
 */
const TARGET_SYNTH_HOP = FFT_SIZE / 4;
const MIN_ANALYSIS_HOP = 256;
const MAX_ANALYSIS_HOP = 512;

const INPUT_CAPACITY = 8192;
const STRETCH_CAPACITY = 16384;
/** Compact the accumulator once the read head has passed this point. */
const STRETCH_COMPACT_AT = STRETCH_CAPACITY >> 2;

/**
 * Input backlog the servo defends. A frame needs FFT_SIZE buffered, so the backlog
 * naturally sits in [FFT_SIZE, FFT_SIZE + gap]; the deadband covers that whole band
 * so the servo contributes exactly zero detune in normal operation.
 */
const TARGET_INPUT_FILL = FFT_SIZE + MAX_ANALYSIS_HOP;
const FILL_DEADBAND = MAX_ANALYSIS_HOP;
/** Servo authority as a fraction of the resample step. 0.001 ≈ 1.7 cents. */
const MAX_SERVO = 0.001;
const SERVO_GAIN = 0.25;

/** Ratio glide time constant, seconds — stops slider drags from zippering. */
const GLIDE_SECONDS = 0.04;

/** Inside this band the vocoder is a no-op, so we skip the FFTs entirely. */
const BYPASS_EPSILON = 1e-4;

/** Spectral-flux ratio above which we treat the frame as a transient. */
const TRANSIENT_THRESHOLD = 0.45;

const clamp = (value, min, max) =>
  value < min ? min : value > max ? max : value;

/** Wrap to (-PI, PI]. */
const princarg = (phase) => {
  if (phase >= -Math.PI && phase < Math.PI) return phase;
  return phase - TWO_PI * Math.floor(phase / TWO_PI + 0.5);
};

/** Iterative in-place radix-2 Cooley-Tukey. The inverse transform is unscaled. */
class Fft {
  constructor(size) {
    this.size = size;

    const levels = Math.log2(size) | 0;
    this.reverse = new Uint32Array(size);
    for (let i = 0; i < size; i++) {
      let value = i;
      let reversed = 0;
      for (let bit = 0; bit < levels; bit++) {
        reversed = (reversed << 1) | (value & 1);
        value >>= 1;
      }
      this.reverse[i] = reversed;
    }

    const half = size >> 1;
    this.cosTable = new Float64Array(half);
    this.sinTable = new Float64Array(half);
    for (let i = 0; i < half; i++) {
      this.cosTable[i] = Math.cos((TWO_PI * i) / size);
      this.sinTable[i] = Math.sin((TWO_PI * i) / size);
    }
  }

  transform(re, im, inverse) {
    const { size, reverse, cosTable, sinTable } = this;

    for (let i = 0; i < size; i++) {
      const j = reverse[i];
      if (j > i) {
        let swap = re[i];
        re[i] = re[j];
        re[j] = swap;
        swap = im[i];
        im[i] = im[j];
        im[j] = swap;
      }
    }

    for (let span = 2; span <= size; span <<= 1) {
      const half = span >> 1;
      const stride = size / span;
      for (let base = 0; base < size; base += span) {
        const end = base + half;
        for (let i = base, twiddle = 0; i < end; i++, twiddle += stride) {
          const cos = cosTable[twiddle];
          const sin = inverse ? sinTable[twiddle] : -sinTable[twiddle];
          const pair = i + half;
          const tre = re[pair] * cos - im[pair] * sin;
          const tim = re[pair] * sin + im[pair] * cos;
          re[pair] = re[i] - tre;
          im[pair] = im[i] - tim;
          re[i] += tre;
          im[i] += tim;
        }
      }
    }
  }
}

class PitchShiftProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'pitchSemitones',
        defaultValue: 0,
        minValue: -24,
        maxValue: 24,
        // k-rate: the vocoder works per hop, not per sample, so sample-accurate
        // automation would be averaged away regardless.
        automationRate: 'k-rate',
      },
    ];
  }

  constructor() {
    super();

    this.fft = new Fft(FFT_SIZE);
    this.channelCount = 0;
    this.inputBuffers = null;
    this.stretchBuffers = null;
    this.spectrumRe = null;
    this.spectrumIm = null;

    // Hann, periodic. windowSquared serves the bypass path, which skips the FFT but
    // still needs the same w² weighting for exact reconstruction.
    this.window = new Float64Array(FFT_SIZE);
    this.windowSquared = new Float64Array(FFT_SIZE);
    for (let i = 0; i < FFT_SIZE; i++) {
      const w = 0.5 - 0.5 * Math.cos((TWO_PI * i) / FFT_SIZE);
      this.window[i] = w;
      this.windowSquared[i] = w * w;
    }

    // Only the mid channel carries phase continuity; each real channel is rebuilt
    // relative to mid, which stops the stereo image from wandering and widening.
    this.midRe = new Float64Array(FFT_SIZE);
    this.midIm = new Float64Array(FFT_SIZE);
    this.midPhase = new Float64Array(BIN_COUNT);
    this.midMagnitude = new Float64Array(BIN_COUNT);
    this.lastMidPhase = new Float64Array(BIN_COUNT);
    this.sumPhase = new Float64Array(BIN_COUNT);
    this.previousMagnitude = new Float64Array(BIN_COUNT);
    this.binPeak = new Int32Array(BIN_COUNT);

    this.ratio = 1;
    this.glide = 0;
    this.gap = TARGET_SYNTH_HOP;
    this.phaseLocking = true;

    this.resetBuffers();

    this.port.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'flush') this.resetBuffers();
      else if (data.type === 'phaseLocking') this.phaseLocking = !!data.value;
    };
  }

  allocate(channels) {
    this.channelCount = channels;
    this.inputBuffers = [];
    this.stretchBuffers = [];
    this.spectrumRe = [];
    this.spectrumIm = [];
    for (let ch = 0; ch < channels; ch++) {
      this.inputBuffers.push(new Float32Array(INPUT_CAPACITY));
      this.stretchBuffers.push(new Float64Array(STRETCH_CAPACITY));
      this.spectrumRe.push(new Float64Array(FFT_SIZE));
      this.spectrumIm.push(new Float64Array(FFT_SIZE));
    }
    this.resetBuffers();
  }

  resetBuffers() {
    this.inputStart = 0;
    this.inputEnd = 0;
    this.readPosition = 0;
    this.olaPosition = 0;
    this.finalized = 0;
    this.gap = TARGET_SYNTH_HOP;
    this.lastMidPhase.fill(0);
    this.sumPhase.fill(0);
    this.previousMagnitude.fill(0);
    if (this.stretchBuffers) {
      for (const buffer of this.stretchBuffers) buffer.fill(0);
    }
  }

  /** Slide the retained input window back to index 0 so appends keep fitting. */
  compactInput(incoming) {
    if (this.inputEnd + incoming <= INPUT_CAPACITY) return;
    const kept = this.inputEnd - this.inputStart;
    for (let ch = 0; ch < this.channelCount; ch++) {
      this.inputBuffers[ch].copyWithin(0, this.inputStart, this.inputEnd);
    }
    this.inputStart = 0;
    this.inputEnd = kept;
  }

  /**
   * Slide the overlap-add accumulator back, keeping one sample of history for the
   * cubic interpolator, and zero the tail so future frames accumulate onto silence
   * rather than onto the stale copy copyWithin leaves behind.
   */
  compactStretch() {
    const shift = Math.floor(this.readPosition) - 1;
    if (shift < STRETCH_COMPACT_AT) return;

    for (let ch = 0; ch < this.channelCount; ch++) {
      const buffer = this.stretchBuffers[ch];
      buffer.copyWithin(0, shift);
      buffer.fill(0, buffer.length - shift);
    }
    this.readPosition -= shift;
    this.olaPosition -= shift;
    this.finalized -= shift;
  }

  /**
   * Analyse one frame, resynthesise it at the stretched hop, overlap-add it, and
   * advance the input read head. Returns false when there is not enough input yet.
   */
  renderFrame() {
    if (this.inputEnd - this.inputStart < FFT_SIZE) return false;

    const channels = this.channelCount;
    const gap = this.gap;
    const synthHop = this.ratio * gap;
    const start = Math.floor(this.olaPosition);

    // Hann² overlap-add at hop H sums to N·(3/8)/H, so this undoes it.
    const olaGain = synthHop / (0.375 * FFT_SIZE);

    if (this.ratio === 1) {
      // Windowed overlap-add with hs === gap reconstructs the input exactly, so the
      // whole spectral stage can be skipped while latency stays identical.
      for (let ch = 0; ch < channels; ch++) {
        const input = this.inputBuffers[ch];
        const accumulator = this.stretchBuffers[ch];
        const offset = this.inputStart;
        for (let n = 0; n < FFT_SIZE; n++) {
          accumulator[start + n] +=
            input[offset + n] * this.windowSquared[n] * olaGain;
        }
      }
    } else {
      this.renderSpectralFrame(
        channels,
        gap,
        synthHop,
        olaGain / FFT_SIZE,
        start,
      );
    }

    // Samples before this frame's start can receive no further contribution.
    this.finalized = start;
    this.olaPosition += synthHop;

    const nextGap = clamp(
      Math.round(TARGET_SYNTH_HOP / this.ratio),
      MIN_ANALYSIS_HOP,
      MAX_ANALYSIS_HOP,
    );
    this.inputStart += nextGap;
    this.gap = nextGap;
    return true;
  }

  renderSpectralFrame(channels, gap, synthHop, scale, start) {
    const { fft, window, midRe, midIm, midPhase, midMagnitude, sumPhase } =
      this;

    for (let ch = 0; ch < channels; ch++) {
      const re = this.spectrumRe[ch];
      const im = this.spectrumIm[ch];
      const input = this.inputBuffers[ch];
      const offset = this.inputStart;
      for (let n = 0; n < FFT_SIZE; n++) {
        re[n] = input[offset + n] * window[n];
        im[n] = 0;
      }
      fft.transform(re, im, false);
    }

    // The mid spectrum costs no extra FFT, because the transform is linear.
    if (channels === 1) {
      midRe.set(this.spectrumRe[0]);
      midIm.set(this.spectrumIm[0]);
    } else {
      const inverse = 1 / channels;
      for (let k = 0; k < BIN_COUNT; k++) {
        let sumRe = 0;
        let sumIm = 0;
        for (let ch = 0; ch < channels; ch++) {
          sumRe += this.spectrumRe[ch][k];
          sumIm += this.spectrumIm[ch][k];
        }
        midRe[k] = sumRe * inverse;
        midIm[k] = sumIm * inverse;
      }
    }

    for (let k = 0; k < BIN_COUNT; k++) {
      const re = midRe[k];
      const im = midIm[k];
      midMagnitude[k] = Math.sqrt(re * re + im * im);
      midPhase[k] = Math.atan2(im, re);
    }

    this.advanceMidPhase(gap, synthHop);

    for (let ch = 0; ch < channels; ch++) {
      const re = this.spectrumRe[ch];
      const im = this.spectrumIm[ch];

      for (let k = 0; k < BIN_COUNT; k++) {
        const a = re[k];
        const b = im[k];
        const magnitude = Math.sqrt(a * a + b * b);
        // Keep this channel's phase offset from mid, so the inter-channel phase
        // differences that carry the stereo image survive the shift.
        const phase =
          channels === 1
            ? sumPhase[k]
            : sumPhase[k] + (Math.atan2(b, a) - midPhase[k]);
        re[k] = magnitude * Math.cos(phase);
        im[k] = magnitude * Math.sin(phase);
      }

      // DC and Nyquist are purely real in any real-valued signal; leaving the phase
      // rotation on them would inject a DC offset.
      im[0] = 0;
      im[HALF_SIZE] = 0;

      for (let k = HALF_SIZE + 1; k < FFT_SIZE; k++) {
        re[k] = re[FFT_SIZE - k];
        im[k] = -im[FFT_SIZE - k];
      }

      fft.transform(re, im, true);

      const accumulator = this.stretchBuffers[ch];
      for (let n = 0; n < FFT_SIZE; n++) {
        accumulator[start + n] += re[n] * window[n] * scale;
      }
    }
  }

  /** Phase-vocoder advance on the mid channel, with locking and transient reset. */
  advanceMidPhase(gap, synthHop) {
    const {
      midPhase,
      midMagnitude,
      lastMidPhase,
      sumPhase,
      previousMagnitude,
    } = this;

    let flux = 0;
    let total = 0;
    for (let k = 0; k < BIN_COUNT; k++) {
      const delta = midMagnitude[k] - previousMagnitude[k];
      if (delta > 0) flux += delta;
      total += midMagnitude[k];
      previousMagnitude[k] = midMagnitude[k];
    }

    // Integrating phase through a drum hit smears the attack. Snapping to the
    // measured phase keeps it crisp, at the cost of one frame's coherence.
    if (total > 1e-9 && flux / total > TRANSIENT_THRESHOLD) {
      sumPhase.set(midPhase);
      lastMidPhase.set(midPhase);
      return;
    }

    const expectedPerBin = (TWO_PI * gap) / FFT_SIZE;
    const binToRadians = TWO_PI / FFT_SIZE;

    // Identity phase locking (Laroche-Dolson): advance only the spectral peaks by
    // their true frequency, then hang every other bin off its nearest peak. This
    // preserves the local phase relationships that plain per-bin advance destroys,
    // and is what removes most of the "phasiness" the naive vocoder is known for.
    if (this.phaseLocking) {
      const binPeak = this.binPeak;
      let previousPeak = -1;

      for (let k = 1; k < BIN_COUNT - 1; k++) {
        if (
          midMagnitude[k] > midMagnitude[k - 1] &&
          midMagnitude[k] >= midMagnitude[k + 1]
        ) {
          const deviation = princarg(
            midPhase[k] - lastMidPhase[k] - expectedPerBin * k,
          );
          sumPhase[k] += (binToRadians * k + deviation / gap) * synthHop;

          const from = previousPeak < 0 ? 0 : ((previousPeak + k) >> 1) + 1;
          for (let bin = from; bin <= k; bin++) binPeak[bin] = k;
          previousPeak = k;
        }
      }

      if (previousPeak >= 0) {
        for (let bin = previousPeak + 1; bin < BIN_COUNT; bin++) {
          binPeak[bin] = previousPeak;
        }
        for (let k = 0; k < BIN_COUNT; k++) {
          const peak = binPeak[k];
          if (k !== peak) {
            sumPhase[k] = sumPhase[peak] + (midPhase[k] - midPhase[peak]);
          }
          lastMidPhase[k] = midPhase[k];
        }
        return;
      }
      // No peaks at all — a noise-like frame. Fall through to per-bin advance.
    }

    for (let k = 0; k < BIN_COUNT; k++) {
      const deviation = princarg(
        midPhase[k] - lastMidPhase[k] - expectedPerBin * k,
      );
      sumPhase[k] += (binToRadians * k + deviation / gap) * synthHop;
      lastMidPhase[k] = midPhase[k];
    }
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!output || output.length === 0) return true;

    const frames = output[0].length;
    const input = inputs[0];

    if (!input || input.length === 0 || !input[0] || input[0].length === 0) {
      for (const channel of output) channel.fill(0);
      return true;
    }

    const channels = Math.min(input.length, output.length);
    if (channels !== this.channelCount) this.allocate(channels);

    const semitones = parameters.pitchSemitones;
    const targetRatio = Math.pow(
      2,
      clamp(semitones.length > 0 ? semitones[0] : 0, -24, 24) / 12,
    );

    // Glide the ratio so dragging the control does not click.
    if (this.glide === 0) {
      this.glide = 1 - Math.exp(-frames / (GLIDE_SECONDS * sampleRate));
    }
    this.ratio += (targetRatio - this.ratio) * this.glide;
    if (Math.abs(this.ratio - targetRatio) < 1e-6) this.ratio = targetRatio;
    if (Math.abs(this.ratio - 1) < BYPASS_EPSILON) this.ratio = 1;

    this.compactInput(frames);
    for (let ch = 0; ch < channels; ch++) {
      this.inputBuffers[ch].set(input[ch], this.inputEnd);
    }
    this.inputEnd += frames;
    this.compactStretch();

    // The chain is rate-neutral for a constant ratio, so in steady state the backlog
    // sits inside the deadband and this contributes nothing. It exists to reabsorb
    // the imbalance a ratio change leaves behind, which would otherwise ratchet
    // latency up until the buffers overrun.
    const error = this.inputEnd - this.inputStart - TARGET_INPUT_FILL;
    let servo = 0;
    if (error > FILL_DEADBAND || error < -FILL_DEADBAND) {
      const excess = error > 0 ? error - FILL_DEADBAND : error + FILL_DEADBAND;
      servo = clamp(
        (excess / TARGET_INPUT_FILL) * SERVO_GAIN,
        -MAX_SERVO,
        MAX_SERVO,
      );
    }
    const step = this.ratio * (1 + servo);

    let produced = 0;
    while (produced < frames) {
      while (this.finalized < this.readPosition + 2) {
        if (!this.renderFrame()) break;
      }
      if (this.finalized < this.readPosition + 2) break;

      const base = Math.floor(this.readPosition);
      const fraction = this.readPosition - base;

      for (let ch = 0; ch < channels; ch++) {
        const buffer = this.stretchBuffers[ch];
        const p0 = base > 0 ? buffer[base - 1] : 0;
        const p1 = buffer[base];
        const p2 = buffer[base + 1];
        const p3 = buffer[base + 2];

        // Catmull-Rom: linear interpolation audibly dulls the top octave.
        const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
        const b = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
        const c = -0.5 * p0 + 0.5 * p2;
        output[ch][produced] =
          ((a * fraction + b) * fraction + c) * fraction + p1;
      }

      this.readPosition += step;
      produced++;
    }

    // Starved — priming after a flush, or a stall. Silence beats replaying stale
    // audio, and the servo pulls the backlog back to target within a few quanta.
    for (let ch = 0; ch < channels; ch++) output[ch].fill(0, produced);
    for (let ch = channels; ch < output.length; ch++) output[ch].fill(0);

    return true;
  }
}

registerProcessor('pitch-shift-processor', PitchShiftProcessor);
