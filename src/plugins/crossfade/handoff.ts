import { createFadeScale, VolumeFader, type VolumeControllable } from './fader';

import type { CrossfadeAudioGraph } from './audio-graph';
import type { QueueItem, RepeatMode } from '@/types/datahost-get-state';
import type { QueueElement } from '@/types/queue';

/** How much of the end of a track is kept to play the outgoing side. */
const TAIL_SECONDS = 90;
/** How much of the start is kept to play the incoming side. */
const HEAD_SECONDS = 60;
/** The player's real position may be this far from its reported one. */
const SYNC_SEARCH_SECONDS = 0.35;
/** Correlation needed to trust a position match. */
const SYNC_MIN_SCORE = 0.6;
/**
 * How far ahead the outgoing copy is scheduled to take over. Setting the
 * swap up takes the main thread ~100 ms; a start time already in the past
 * would replay what the player just played.
 */
const START_LEAD = 0.25;
/** Volume the player element is driven to while a copy plays instead. */
const SILENT_VOLUME = 0.0001;
/** Complementary ramp length of the outgoing swap (graph mode). */
const SWAP_MS = 60;
const SWAP_S = 0.06;
/** Copy → player crossfade at hand-over. */
const HANDOVER_MS = 250;
const HANDOVER_S = 0.25;
/** The hand-over seek aims this far ahead of the copy, covering seek latency. */
const SEEK_LEAD_S = 0.08;
/** Residual drift beyond this after a seek triggers one realignment. */
const RESYNC_TOLERANCE_S = 0.25;
/** How long after the swap the player is advanced to the next track. */
const ADVANCE_DELAY_S = 0.2;
/** How much of the player's latest audio an incoming check listens to. */
const HEAR_SECONDS = 0.25;
/** Player ↔ copy distance the incoming ear check accepts as locked. */
const HEAR_SYNC = 0.006;
/** Seeks the ear check may spend trying to lock the incoming song. */
const EAR_SEEKS = 3;
/** Measured player offsets are re-read at most this often. */
const MEASURE_EVERY_MS = 2000;

type Invoke = (channel: string, ...args: unknown[]) => Promise<unknown>;

type Logger = {
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
  debug: (msg: string, ...args: unknown[]) => void;
};

export interface BeginOptions {
  /** The currently playing track's id (the one being swapped out). */
  currentTrackId: string;
  /** The next track's id the queue says will play (the copy's track). */
  expectedNextId: string;
  video: HTMLVideoElement;
  /** Fallback duration when the decoded copy's own length is unknown. */
  duration: number;
  /** The element's current volume — the loudness the swap must preserve. */
  peak: number;
  fadeInMs: number;
  fadeOutMs: number;
  fadeScaling: string | number;
  useGraph: boolean;
  /** Guard-aware player volume setter (element mode). */
  setPlayerVolume: (v: number) => void;
  /** Guard-aware player volume target for faders (element mode). */
  setPlayerVolumeTarget: () => VolumeControllable;
  /** Fresh player <video> lookup (the element can be replaced mid-flight). */
  getPlayerVideo: () => HTMLVideoElement | null;
  getCurrentVideoId: () => string | null;
  /** Fires the auto-advance (crossfade:auto-advance + nextVideo). */
  onAdvance: () => void;
  /** The transition completed normally (cooldown can start). */
  onHandoverDone: () => void;
}

// ---------------------------------------------------------------------------
// Queue read
// ---------------------------------------------------------------------------

const getQueueStore = () =>
  document.querySelector<QueueElement>('#queue')?.queue?.store?.store;

const primaryOf = (item: QueueItem) =>
  item.playlistPanelVideoRenderer ??
  item.playlistPanelVideoWrapperRenderer?.primaryRenderer
    ?.playlistPanelVideoRenderer;

const counterpartOf = (item: QueueItem) =>
  item.playlistPanelVideoWrapperRenderer?.counterpart?.[0]?.counterpartRenderer
    ?.playlistPanelVideoRenderer;

export interface NextTrackInfo {
  videoId: string;
  repeatMode: RepeatMode;
}

/**
 * True when the player queue's internal store could actually be read. A
 * `readNextTrack` of null only means "no next track" when this holds; when
 * it is false the queue UI simply was not there to ask.
 */
export const isQueueReadable = (): boolean => {
  const state = getQueueStore()?.getState()?.queue;
  return Boolean(state?.items);
};

/**
 * The track that plays after the playing one, read from the player queue's
 * internal store (the same source the queue UI renders from). Autoplay
 * suggestions are honoured when the queue itself runs out, and repeat-all
 * wraps around.
 */
export const readNextTrack = (
  playingId: string | null,
): NextTrackInfo | null => {
  const state = getQueueStore()?.getState()?.queue;
  if (!state?.items?.length) return null;

  const selected = state.items.findIndex(
    (item) => primaryOf(item)?.selected || counterpartOf(item)?.selected,
  );
  // Trust the song that is actually playing over the "selected" flag, which
  // can lag behind after a programmatic skip; with duplicates, take the copy
  // closest to the selected one.
  let index = -1;
  if (playingId !== null) {
    state.items.forEach((item, i) => {
      if (
        (primaryOf(item)?.videoId === playingId ||
          counterpartOf(item)?.videoId === playingId) &&
        (index < 0 ||
          Math.abs(i - Math.max(selected, 0)) <
            Math.abs(index - Math.max(selected, 0)))
      ) {
        index = i;
      }
    });
  }
  if (index < 0) index = selected;
  if (index < 0) return null;

  const currentItem = state.items[index];
  const onCounterpart =
    playingId !== null &&
    primaryOf(currentItem)?.videoId !== playingId &&
    counterpartOf(currentItem)?.videoId === playingId;

  const autoplayItems =
    state.autoplay && Array.isArray(state.automixItems)
      ? (state.automixItems as QueueItem[])
      : [];
  const at = index + 1;
  let item: QueueItem | undefined;
  if (at < state.items.length) {
    item = state.items[at];
  } else if (state.repeatMode === 'ALL') {
    item = state.items[at % state.items.length];
  } else {
    item = autoplayItems[at - state.items.length];
  }
  if (!item) return null;

  const renderer = (onCounterpart && counterpartOf(item)) || primaryOf(item);
  if (!renderer?.videoId) return null;
  return { videoId: renderer.videoId, repeatMode: state.repeatMode };
};

// ---------------------------------------------------------------------------
// Sample-accurate position measurement (port of automix sync.ts)
// ---------------------------------------------------------------------------

const DECIMATE = 8;

const mono = (buffer: AudioBuffer, first: number, length: number) => {
  const out = new Float32Array(length);
  const channels = buffer.numberOfChannels;
  for (let channel = 0; channel < channels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) out[i] += data[first + i] / channels;
  }
  return out;
};

const decimate = (signal: Float32Array, factor: number) => {
  const out = new Float32Array(Math.floor(signal.length / factor));
  for (let i = 0; i < out.length; i++) {
    let sum = 0;
    const base = i * factor;
    for (let k = 0; k < factor; k++) sum += signal[base + k];
    out[i] = sum / factor;
  }
  return out;
};

/** Normalised cross-correlation of `needle` against `hay` at each lag. */
const bestLag = (
  needle: Float32Array,
  hay: Float32Array,
  fromLag: number,
  toLag: number,
) => {
  let needleEnergy = 0;
  for (const v of needle) needleEnergy += v * v;
  if (needleEnergy === 0) return null;

  let best = -1;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (let lag = Math.max(0, fromLag); lag <= toLag; lag++) {
    if (lag + needle.length > hay.length) break;
    let dot = 0;
    let energy = 0;
    for (let i = 0; i < needle.length; i++) {
      const h = hay[lag + i];
      dot += needle[i] * h;
      energy += h * h;
    }
    if (energy === 0) continue;
    const score = dot / Math.sqrt(needleEnergy * energy);
    if (score > bestScore) {
      bestScore = score;
      best = lag;
    }
  }
  return best < 0 ? null : { lag: best, score: bestScore };
};

/**
 * Locates `capture` (mono, at the buffer's sample rate) in `buffer`,
 * searching start positions between `fromSeconds` and `toSeconds`.
 * Coarse search on a decimated signal, then refined to the sample.
 */
export const locateCapture = (
  capture: Float32Array,
  buffer: AudioBuffer,
  fromSeconds: number,
  toSeconds: number,
): { time: number; score: number } | null => {
  const rate = buffer.sampleRate;
  const first = Math.max(0, Math.floor(fromSeconds * rate));
  const last = Math.min(
    buffer.length - capture.length,
    Math.ceil(toSeconds * rate),
  );
  if (last <= first) return null;
  const region = mono(buffer, first, last - first + capture.length);

  const coarse = bestLag(
    decimate(capture, DECIMATE),
    decimate(region, DECIMATE),
    0,
    Math.floor((last - first) / DECIMATE),
  );
  if (!coarse) return null;
  const fine = bestLag(
    capture,
    region,
    (coarse.lag - 2) * DECIMATE,
    (coarse.lag + 2) * DECIMATE,
  );
  if (!fine) return null;
  return { time: (first + fine.lag) / rate, score: fine.score };
};

// ---------------------------------------------------------------------------
// Type-2 engine
// ---------------------------------------------------------------------------

interface TrackParts {
  videoId: string;
  /** The decoded stream's full length, in seconds. */
  fullDuration: number;
  /** Last part of the track, played while the player is swapped out. */
  tail: AudioBuffer;
  /** Track time at which `tail` starts. */
  tailStart: number;
  /** First part of the track, played when it comes in. */
  head: AudioBuffer;
}

export const equalPowerCurve = (peak: number, direction: 'in' | 'out') => {
  const curve = new Float32Array(64);
  for (let i = 0; i < 64; i++) {
    const x = i / 63;
    curve[i] =
      peak *
      (direction === 'in'
        ? Math.sin((x * Math.PI) / 2)
        : Math.cos((x * Math.PI) / 2));
  }
  return curve;
};

const musicalCurve = (
  peak: number,
  direction: 'in' | 'out',
  fadeScaling: string | number,
) => {
  let scale;
  try {
    scale = createFadeScale(fadeScaling);
  } catch {
    return equalPowerCurve(peak, direction);
  }
  const curve = new Float32Array(64);
  for (let i = 0; i < 64; i++) {
    const x = i / 63;
    curve[i] = peak * scale.internalToVolume(direction === 'in' ? x : 1 - x);
  }
  return curve;
};

export const linearCurve = (from: number, to: number) => {
  const curve = new Float32Array(64);
  const step = (to - from) / 63;
  let value = from;
  for (let i = 0; i < 64; i++) {
    curve[i] = value;
    value += step;
  }
  return curve;
};

/**
 * Type-2 crossfade: both songs are downloaded, decoded and played from the
 * shared AudioContext, and the player <video> only carries audio outside
 * transitions (automix's handoff, without any analysis).
 *
 * Transition sequence:
 *  1. `begin` measures where the player really is by cross-correlating a
 *     tap of its actual audio against the decoded tail (currentTime is tens
 *     of ms off, and the two streams' encodes differ by a static offset —
 *     the correlation absorbs both in one number).
 *  2. At startAt the decoded copy of the OLD song takes over sample-locked:
 *     graph mode ramps the audio line down over SWAP_MS while the copy
 *     ramps up complementarily (same content, constant loudness); element
 *     mode jumps the copy in and a −1 gain node on the player's source
 *     cancels whatever the element still plays until its volume is driven
 *     to ~0.
 *  3. ADVANCE_DELAY_S later the player is advanced to the next track —
 *     still silent. Both musical fades are scheduled on the audio clock:
 *     the old copy fades out so it ends at the song's natural end, the new
 *     copy fades in over the last seconds of it — gapless no matter how
 *     long the player takes to load.
 *  4. When the muted player produces the new song, it is seek-aligned to
 *     the new copy and the two crossfade over with complementary ramps;
 *     the player volume then continues the configured fade-in.
 */
export class Type2Engine {
  private readonly invoke: Invoke;
  private readonly log: Logger;
  private readonly graph: CrossfadeAudioGraph;
  private decodeToken = 0;
  private readonly cache = new Map<string, TrackParts>();

  private tap: AnalyserNode | null = null;
  /** Last measured (reported → real) position offset of the playing track. */
  private playerOffset = 0;
  private lastCurrentId: string | null = null;
  private lastMeasureAt = 0;

  private timerIds: ReturnType<typeof setTimeout>[] = [];
  private swapSource: AudioBufferSourceNode | null = null;
  private swapGain: GainNode | null = null;
  private inSource: AudioBufferSourceNode | null = null;
  private inGain: GainNode | null = null;
  private headDuration = 0;
  private cancel: GainNode | null = null;
  private inFader: VolumeFader | null = null;
  private seekedVideo: HTMLVideoElement | null = null;
  private seekedListener: (() => void) | null = null;

  /** True from a successful `begin` until hand-over completes or abort. */
  active = false;
  /** True once the player has been advanced to the next track. */
  advanced = false;
  expectedNextId: string | null = null;
  /** True once the copy → player hand-over ramp has started. */
  get handoverStarted() {
    return this.handedOver;
  }

  /** True while a seek the engine itself made is in flight. */
  ownsSeek = false;
  private opts: BeginOptions | null = null;
  private context: AudioContext | null = null;
  private startInAt = 0;
  private alignSeeks = 0;
  private handedOver = false;
  private pausedSince = 0;
  private realignAfter = 0;

  constructor(invoke: Invoke, log: Logger, graph: CrossfadeAudioGraph) {
    this.invoke = invoke;
    this.log = log;
    this.graph = graph;
  }

  private getContext = () => window.__blyricsAudio?.context ?? null;

  /** True when everything type 2 needs is present for the current setup. */
  available() {
    return Boolean(window.__blyricsAudio?.source) && this.getContext() !== null;
  }

  private async decode(videoId: string): Promise<TrackParts | null> {
    const cached = this.cache.get(videoId);
    if (cached) {
      // Refresh recency so eviction keeps the current and next tracks
      this.cache.delete(videoId);
      this.cache.set(videoId, cached);
      return cached;
    }
    const context = this.getContext();
    if (!context) return null;
    const token = this.decodeToken;
    try {
      const bytes = (await this.invoke(
        'audio-data',
        videoId,
      )) as Uint8Array | null;
      if (!bytes || token !== this.decodeToken) return null;

      // decodeAudioData detaches its input, so hand it a private copy
      const decoder = new OfflineAudioContext(2, 1, context.sampleRate);
      const full = await decoder.decodeAudioData(bytes.slice().buffer);
      if (token !== this.decodeToken) return null;

      const slice = (from: number, to: number) => {
        const startFrame = Math.max(0, Math.round(from * full.sampleRate));
        const endFrame = Math.min(
          full.length,
          Math.round(to * full.sampleRate),
        );
        const part = new AudioBuffer({
          numberOfChannels: full.numberOfChannels,
          length: Math.max(1, endFrame - startFrame),
          sampleRate: full.sampleRate,
        });
        for (let channel = 0; channel < full.numberOfChannels; channel++) {
          part.copyToChannel(
            full.getChannelData(channel).subarray(startFrame, endFrame),
            channel,
          );
        }
        return part;
      };
      const parts: TrackParts = {
        videoId,
        fullDuration: full.duration,
        tail: slice(Math.max(0, full.duration - TAIL_SECONDS), full.duration),
        tailStart: Math.max(0, full.duration - TAIL_SECONDS),
        head: slice(0, HEAD_SECONDS),
      };
      this.cache.set(videoId, parts);
      while (this.cache.size > 2) {
        const oldest = this.cache.keys().next().value;
        if (oldest === undefined) break;
        this.cache.delete(oldest);
      }
      return parts;
    } catch (err) {
      this.log.warn(`[Type2] Decode failed for ${videoId}:`, err);
      return null;
    }
  }

  /** Ensures the decoded copy of the playing track exists (its tail side). */
  ensureCurrent(videoId: string): Promise<boolean> {
    if (videoId !== this.lastCurrentId) {
      // The offset is per encode pair; a new song invalidates it
      this.lastCurrentId = videoId;
      this.playerOffset = 0;
      this.lastMeasureAt = 0;
    }
    return this.decode(videoId).then(
      (parts) => parts !== null,
      () => false,
    );
  }

  /** Ensures the decoded copy of the upcoming track exists (its head side). */
  preloadNext(videoId: string): Promise<boolean> {
    return this.decode(videoId).then(
      (parts) => parts !== null,
      () => false,
    );
  }

  /** True when a decoded copy for this track is already in the cache. */
  hasCopy(videoId: string): boolean {
    return this.cache.has(videoId);
  }

  /** The decoded copy's own duration for a cached track, else null. */
  cachedDuration(videoId: string): number | null {
    return this.cache.get(videoId)?.fullDuration ?? null;
  }

  /**
   * Re-arms alignment after a foreign seek of the (silent) player — YouTube
   * re-scrubs the element after a track load. Throttled so a seek storm
   * cannot turn into a seek war with the player.
   */
  realign() {
    if (!this.active || !this.advanced || this.handedOver) return;
    const context = this.context;
    if (!context) return;
    if (context.currentTime < this.realignAfter) return;
    this.realignAfter = context.currentTime + 0.3;
    this.log.info(
      '[Type2] Foreign seek of the player; re-aligning to the copy.',
    );
    this.alignSeeks = 0;
    this.pausedSince = 0;
  }

  private ensureTap() {
    if (this.tap) return this.tap;
    const bus = window.__blyricsAudio;
    const context = this.getContext();
    if (!bus || !context) return null;
    const tap = context.createAnalyser();
    tap.fftSize = 32768;
    bus.source.connect(tap);
    this.tap = tap;
    return tap;
  }

  /**
   * Measures where the player really is: matches the last ~0.7 s it played
   * against the decoded tail. Returns null when the audio is too quiet or
   * ambiguous to match.
   */
  private measurePlayerOffset(video: HTMLVideoElement, track: TrackParts) {
    const tap = this.tap;
    const context = this.context;
    if (!tap || !context) return null;
    const capture = new Float32Array(tap.fftSize);
    tap.getFloatTimeDomainData(capture);
    const capturedAt = context.currentTime;
    const reported = video.currentTime;
    const span = capture.length / track.tail.sampleRate;
    const expected = reported + this.playerOffset - span - track.tailStart;
    const found = locateCapture(
      capture,
      track.tail,
      expected - SYNC_SEARCH_SECONDS,
      expected + SYNC_SEARCH_SECONDS,
    );
    if (!found || found.score < SYNC_MIN_SCORE) return null;

    const position = track.tailStart + found.time + span;
    const offset = position - reported;
    if (Math.abs(offset) > SYNC_SEARCH_SECONDS) return null;
    this.playerOffset = offset;
    return { position, at: capturedAt, score: found.score };
  }

  /**
   * Measures the player offset ahead of the trigger (player still clearly
   * audible), so a value is cached even if the reading at the trigger
   * moment fails.
   */
  maybeMeasure(videoId: string, video: HTMLVideoElement) {
    if (!this.available() || this.active) return;
    const track = this.cache.get(videoId);
    if (!track) return;
    const now = Date.now();
    if (
      this.lastMeasureAt !== 0 &&
      now - this.lastMeasureAt < MEASURE_EVERY_MS
    ) {
      return;
    }
    this.lastMeasureAt = now;
    this.context ??= this.getContext();
    if (!this.ensureTap()) return;
    this.measurePlayerOffset(video, track);
  }

  /**
   * Starts the type-2 transition. Returns false when any precondition is
   * missing, in which case the caller falls back to the type-1 handoff.
   */
  begin(opts: BeginOptions): boolean {
    const context = this.getContext();
    const bus = window.__blyricsAudio;
    const from = this.cache.get(opts.currentTrackId);
    const to = this.cache.get(opts.expectedNextId);
    if (!context || !bus || !from || !to) return false;
    if (Math.abs(opts.video.playbackRate - 1) > 0.01) return false;
    if (opts.video.loop) return false;

    this.context = context;
    this.ensureTap();

    const now = context.currentTime;
    const startAt = now + START_LEAD;
    // Where the player really is, read from its audio when possible — and
    // extrapolated to the copy's start time, which is START_LEAD ahead: the
    // player keeps playing while the swap is being scheduled, and starting
    // the copy at the stale position would replay what it just played.
    const heard = this.measurePlayerOffset(opts.video, from);
    const rate = opts.video.playbackRate || 1;
    const leadS = startAt - now;
    const sinceHeardS = heard ? startAt - heard.at : leadS;
    const basePosition = heard
      ? heard.position
      : opts.video.currentTime + this.playerOffset;
    const playbackLeadS = sinceHeardS * rate;
    const position = basePosition + playbackLeadS;
    this.log.info(
      `[Type2] Player position ${position.toFixed(3)}s at the swap (correlated: ${heard ? `${(heard.score * 100).toFixed(0)}%` : 'no — offset estimate'})`,
    );

    const offsetInTail = position - from.tailStart;
    const swapEnd = startAt + SWAP_S;
    // The copy plays the stream that was decoded, so its own length is the
    // honest end of the song
    const duration = from.fullDuration || opts.duration;
    if (
      offsetInTail < 0 ||
      offsetInTail >= from.tail.duration - 0.1 ||
      position >= duration - 1
    ) {
      return false;
    }

    // The old song's natural end on the context clock; the crossfade
    // window is bounded by what is left after the swap
    const oldEnd = startAt + (duration - position);
    const maxWindowMs = (oldEnd - swapEnd - 0.1) * 1000;
    const windowMs = Math.min(opts.fadeInMs, opts.fadeOutMs, maxWindowMs);
    const overlapMs = windowMs >= 150 ? windowMs : 0;
    const fadeOutS = opts.fadeOutMs / 1000;
    const overlapS = overlapMs / 1000;
    const oldFadeStart = Math.max(swapEnd + 0.05, oldEnd - fadeOutS);
    const inAt = oldEnd - overlapS;
    // The incoming copy must outlast the pre-hand-over stretch it covers
    if (inAt <= startAt || to.head.duration < oldEnd - inAt + 1.5) {
      return false;
    }

    this.stopSwapNodes();
    this.stopInNodes();
    this.stopCancel();
    this.opts = opts;
    this.active = true;
    this.advanced = false;
    this.handedOver = false;
    this.alignSeeks = 0;
    this.pausedSince = 0;
    this.realignAfter = 0;
    this.expectedNextId = opts.expectedNextId;
    this.startInAt = inAt;
    this.headDuration = to.head.duration;

    // 1. The outgoing copy takes over, sample-locked
    const sourceA = context.createBufferSource();
    sourceA.buffer = from.tail;
    const gainA = context.createGain();
    gainA.gain.value = 0;
    sourceA.connect(gainA).connect(context.destination);
    sourceA.start(startAt, offsetInTail);
    sourceA.onended = () => {
      if (this.swapSource === sourceA) this.stopSwapNodes();
    };
    this.swapSource = sourceA;
    this.swapGain = gainA;

    if (opts.useGraph) {
      // Line down while the copy rises, complementarily: both carry the
      // same samples, so the loudness is constant through the swap
      this.graph.rampToAt(0, startAt, SWAP_MS, 'linear');
      gainA.gain.setValueAtTime(0, startAt);
      gainA.gain.setValueCurveAtTime(
        linearCurve(0, opts.peak),
        startAt,
        SWAP_S,
      );
    } else {
      // Instant copy + a −1 node cancelling the player's source: from the
      // copy's first sample it does not matter when the element volume
      // write lands
      const cancel = context.createGain();
      cancel.gain.setValueAtTime(0, now);
      cancel.gain.setValueAtTime(-1, startAt);
      bus.source.connect(cancel).connect(context.destination);
      this.cancel = cancel;
      gainA.gain.setValueAtTime(0, startAt);
      gainA.gain.linearRampToValueAtTime(opts.peak, startAt + 0.005);
      this.at(startAt, () => {
        if (this.active) opts.setPlayerVolume(SILENT_VOLUME);
      });
    }

    // 2. The musical fades, scheduled on the audio clock
    if (overlapMs > 0) {
      gainA.gain.setValueCurveAtTime(
        musicalCurve(opts.peak, 'out', opts.fadeScaling),
        oldFadeStart,
        Math.min(opts.fadeOutMs, (oldEnd - oldFadeStart) * 1000) / 1000,
      );
    }
    const sourceB = context.createBufferSource();
    sourceB.buffer = to.head;
    const gainB = context.createGain();
    gainB.gain.value = 0;
    sourceB.connect(gainB).connect(context.destination);
    sourceB.start(inAt);
    gainB.gain.setValueAtTime(0, inAt);
    gainB.gain.setValueCurveAtTime(
      musicalCurve(opts.peak, 'in', opts.fadeScaling),
      inAt,
      opts.fadeInMs / 1000,
    );
    sourceB.onended = () => {
      if (this.inSource === sourceB) this.stopInNodes();
    };
    this.inSource = sourceB;
    this.inGain = gainB;

    // 3. Advance the (silent) player to the next track
    this.at(startAt + ADVANCE_DELAY_S, () => {
      if (!this.active || this.advanced) return;
      this.advanced = true;
      this.log.info('[Type2] Advancing player to the next track (silent).');
      opts.onAdvance();
    });

    this.log.info(
      `[Type2] Swap armed: copy in ${((startAt - now) * 1000).toFixed(0)}ms, next track fades in at ${(inAt - now).toFixed(2)}s, old ends at ${(oldEnd - now).toFixed(2)}s (overlap ${overlapMs.toFixed(0)}ms, ${opts.useGraph ? 'graph' : 'element'} mode).`,
    );
    return true;
  }

  /**
   * Called from the incoming-phase poll. Drives alignment and hand-over.
   * Returns true while the engine owns the incoming phase; false when it
   * has dropped it and the plain fade-in should take over.
   */
  onIncomingTick(): boolean {
    if (!this.active || !this.opts || !this.context) return false;
    const opts = this.opts;
    if (!this.advanced || this.handedOver) return true;

    const video = opts.getPlayerVideo();
    if (!video) return true;
    if (video.paused) {
      // Load-related pauses are brief; a player paused for longer means the
      // user stopped the music — the copies must not keep sounding.
      if (this.pausedSince === 0) {
        this.pausedSince = this.context.currentTime;
      } else if (this.context.currentTime - this.pausedSince > 2) {
        this.log.warn('[Type2] Player stayed paused mid-handoff; flushing.');
        this.abort();
        return false;
      }
      return true;
    }
    this.pausedSince = 0;
    if (video.seeking) return true;
    const playingId = opts.getCurrentVideoId();
    if (playingId !== opts.expectedNextId) {
      if (playingId !== null && playingId !== opts.currentTrackId) {
        this.log.warn(
          `[Type2] Player loaded ${playingId} instead of ${opts.expectedNextId}; dropping the copies.`,
        );
        this.abort();
        return false;
      }
      return true;
    }
    if (video.currentTime <= 0) return true;
    if (!this.inSource || this.context.currentTime < this.startInAt) {
      return true;
    }
    // The copy is about to run out without the player catching up
    const inEndAt = this.startInAt + this.headDuration;
    if (this.context.currentTime > inEndAt - 1) {
      this.log.warn(
        '[Type2] Incoming copy ran out; flushing to plain playback.',
      );
      this.abort();
      return false;
    }

    if (this.alignSeeks === 0) {
      this.alignSeeks = 1;
      this.seekPlayerTo(video, this.copyPosition() + SEEK_LEAD_S);
      return true;
    }
    const drift = Math.abs(this.copyPosition() - video.currentTime);
    if (drift > RESYNC_TOLERANCE_S && this.alignSeeks < 3) {
      this.alignSeeks++;
      this.seekPlayerTo(video, this.copyPosition() + SEEK_LEAD_S);
      return true;
    }
    if (drift > RESYNC_TOLERANCE_S) {
      this.log.warn(
        `[Type2] Player still ${(drift * 1000).toFixed(0)}ms off after 3 seeks; handing over anyway (masked by the crossfade).`,
      );
    }
    // Ear check (graph mode): the tap hears the player even while the line
    // holds it silent, so the pair's static encode offset is measured and
    // corrected rather than assumed away.
    if (opts.useGraph && this.alignSeeks <= EAR_SEEKS) {
      const error = this.hearIncoming();
      if (error !== null && Math.abs(error) > HEAR_SYNC) {
        this.alignSeeks++;
        this.log.info(
          `[Type2] Ear check: player ${(error * 1000).toFixed(1)}ms ${error > 0 ? 'ahead of' : 'behind'} the copy; re-aligning.`,
        );
        this.seekPlayerTo(video, this.copyPosition() + SEEK_LEAD_S - error);
        return true;
      }
    }
    this.handOver();
    return true;
  }

  /**
   * How far the player's audio is from the incoming copy's position, read
   * from the tap (positive: the player is ahead). Null when it cannot be
   * made out clearly enough (silent player, weak match).
   */
  private hearIncoming(): number | null {
    const tap = this.tap;
    const context = this.context;
    const head = this.inSource?.buffer;
    if (!tap || !context || !head) return null;
    const all = new Float32Array(tap.fftSize);
    tap.getFloatTimeDomainData(all);
    const rate = head.sampleRate;
    const capture = all.subarray(all.length - Math.round(HEAR_SECONDS * rate));
    const span = capture.length / rate;
    const expected = this.copyPosition() - span;
    const found = locateCapture(
      capture,
      head,
      expected - SYNC_SEARCH_SECONDS,
      expected + SYNC_SEARCH_SECONDS,
    );
    if (!found || found.score < SYNC_MIN_SCORE) return null;
    return found.time - expected;
  }

  private copyPosition(): number {
    if (!this.context) return 0;
    return Math.max(0, this.context.currentTime - this.startInAt);
  }

  private copyLevel(): number {
    if (!this.inGain) return 0;
    return Math.min(Math.max(this.inGain.gain.value, 0), 1);
  }

  private seekPlayerTo(video: HTMLVideoElement, target: number) {
    this.log.debug(
      `[Type2] Aligning player to the copy: seek to ${target.toFixed(3)}s.`,
    );
    this.ownsSeek = true;
    this.detachSeeked();
    const onSeeked = () => {
      this.ownsSeek = false;
      this.seekedVideo = null;
      this.seekedListener = null;
    };
    this.seekedListener = onSeeked;
    this.seekedVideo = video;
    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = target;
  }

  private detachSeeked() {
    if (this.seekedVideo && this.seekedListener) {
      this.seekedVideo.removeEventListener('seeked', this.seekedListener);
    }
    this.seekedVideo = null;
    this.seekedListener = null;
  }

  /** The copy → player crossfade: complementary ramps, constant loudness. */
  private handOver() {
    const opts = this.opts;
    const context = this.context;
    if (!opts || !context || !this.inGain) return;
    const level = this.copyLevel();
    this.handedOver = true;
    this.log.info(
      `[Type2] Handing over to the player at level ${(level * 100).toFixed(0)}%.`,
    );

    // The copy's fade-in curve had been running since it started; the
    // player continues exactly the remaining slice of it
    const elapsedMs = (context.currentTime - this.startInAt) * 1000;
    const remainingMs = Math.max(opts.fadeInMs - elapsedMs, 300);
    const now = context.currentTime;
    // Completion callbacks are plain JS timers and can be throttled; the
    // audio itself is already correct at this point, so a missed callback
    // only needs the state closed out.
    const armFinishFallback = () => {
      const remainingS = remainingMs / 1000;
      this.at(now + HANDOVER_S + remainingS + 2, () => {
        if (!this.active) return;
        this.log.warn(
          '[Type2] Hand-over completion callback missed; finalizing.',
        );
        this.active = false;
        opts.onHandoverDone();
      });
    };

    if (opts.useGraph) {
      // The line rises exactly as fast as the copy falls
      this.graph.rampToAt(
        level / Math.max(opts.peak, 0.01),
        now,
        HANDOVER_MS,
        'linear',
      );
      this.inGain.gain.cancelScheduledValues(now);
      this.inGain.gain.setValueCurveAtTime(
        linearCurve(level, 0),
        now,
        HANDOVER_S,
      );
      this.at(now + HANDOVER_S, () => {
        if (!this.active) return;
        this.graph.rampTo(1, remainingMs, opts.fadeScaling, () => {
          this.active = false;
          opts.onHandoverDone();
        });
      });
      armFinishFallback();
    } else {
      if (!this.cancel) return;
      // Player volume up to the copy's level, then copy and cancel wind
      // down complementarily: the total stays at `level` throughout
      opts.setPlayerVolume(level);
      this.cancel.gain.cancelScheduledValues(now);
      this.cancel.gain.setValueAtTime(this.cancel.gain.value, now);
      this.cancel.gain.setValueCurveAtTime(linearCurve(-1, 0), now, HANDOVER_S);
      const cancelNode = this.cancel;
      this.at(now + HANDOVER_S + 0.05, () => {
        // The player's own audio is untouched by then; the node has done
        // its job.
        if (this.cancel === cancelNode) this.stopCancel();
      });
      this.inGain.gain.cancelScheduledValues(now);
      this.inGain.gain.setValueAtTime(level, now);
      this.inGain.gain.setValueCurveAtTime(
        linearCurve(level, 0),
        now,
        HANDOVER_S,
      );
      let scale;
      try {
        scale = createFadeScale(opts.fadeScaling);
      } catch {
        scale = createFadeScale('logarithmic');
      }
      // Where the copy was on its fade curve, as a fraction of the peak
      const fraction = Math.min(
        Math.max(level / Math.max(opts.peak, 0.001), 0),
        1,
      );
      const faderRemainingMs = Math.max(
        opts.fadeInMs * (1 - scale.volumeToInternal(fraction)),
        300,
      );
      this.inFader?.cancelFade();
      this.inFader = new VolumeFader(opts.setPlayerVolumeTarget(), {
        initialVolume: level,
        fadeScaling: opts.fadeScaling,
        fadeDuration: faderRemainingMs,
      });
      this.at(now + HANDOVER_S, () => {
        if (!this.active) return;
        this.inFader?.fadeTo(opts.peak, () => {
          this.inFader = null;
          this.active = false;
          opts.onHandoverDone();
        });
      });
      armFinishFallback();
    }
  }

  /** Stops everything and releases the transition (fast fades). */
  abort() {
    const context = this.context;
    this.clearTimers();
    this.detachSeeked();
    this.ownsSeek = false;
    this.inFader?.cancelFade();
    this.inFader = null;
    if (context && this.swapGain) {
      try {
        const now = context.currentTime;
        const level = Math.min(Math.max(this.swapGain.gain.value, 0), 1);
        this.swapGain.gain.cancelScheduledValues(now);
        this.swapGain.gain.setValueAtTime(level, now);
        this.swapGain.gain.setTargetAtTime(0, now, 0.05);
        this.swapSource?.stop(now + 0.3);
      } catch {
        // Already stopped
      }
    }
    if (context && this.inGain) {
      try {
        const now = context.currentTime;
        const level = Math.min(Math.max(this.inGain.gain.value, 0), 1);
        this.inGain.gain.cancelScheduledValues(now);
        this.inGain.gain.setValueAtTime(level, now);
        this.inGain.gain.setTargetAtTime(0, now, 0.05);
        this.inSource?.stop(now + 0.3);
      } catch {
        // Already stopped
      }
    }
    this.stopSwapNodes();
    this.stopInNodes();
    this.stopCancel();
    this.active = false;
    this.advanced = false;
    this.handedOver = false;
    this.pausedSince = 0;
    this.opts = null;
  }

  /** Drops the cache and every node; the plugin is being torn down. */
  dispose() {
    this.decodeToken++;
    this.abort();
    this.cache.clear();
    if (this.tap) {
      try {
        window.__blyricsAudio?.source.disconnect(this.tap);
      } catch {
        // Already detached
      }
      this.tap = null;
    }
    this.playerOffset = 0;
  }

  private stopSwapNodes() {
    try {
      this.swapSource?.disconnect();
      this.swapGain?.disconnect();
    } catch {
      // Already detached
    }
    this.swapSource = null;
    this.swapGain = null;
  }

  private stopInNodes() {
    try {
      this.inSource?.disconnect();
      this.inGain?.disconnect();
    } catch {
      // Already detached
    }
    this.inSource = null;
    this.inGain = null;
  }

  private stopCancel() {
    if (this.cancel) {
      try {
        this.cancel.disconnect();
      } catch {
        // Already detached
      }
      this.cancel = null;
    }
  }

  /** Runs `callback` as close as possible to context time `time`. */
  private at(time: number, callback: () => void) {
    const context = this.context;
    if (!context) return;
    const delay = Math.max(0, (time - context.currentTime) * 1000);
    const id = setTimeout(() => {
      this.timerIds = this.timerIds.filter((t) => t !== id);
      callback();
    }, delay);
    this.timerIds.push(id);
  }

  private clearTimers() {
    for (const id of this.timerIds) clearTimeout(id);
    this.timerIds = [];
  }
}
