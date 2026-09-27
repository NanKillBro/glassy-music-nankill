import {
  getOrCreateMediaSource,
  insertLineNode,
  registerMediaSource,
  removeLineNode,
} from '@/utils/audio-line';

import { createFadeScale, type VolumeScale } from './fader';

/** This plugin's node id in the shared audio line (see audio-line.ts). */
const LINE_NODE_ID = 'crossfade';

/** Sample points per gain ramp curve (plan: 128). */
const RAMP_CURVE_LENGTH = 128;

/**
 * The YTM player's own <video> — same selector discipline as the crossfade
 * plugin body and smooth-transitions: anchored on #movie_player so other
 * content's <video>s (shaders-glassy's animated album art, most notably)
 * can never be picked up.
 */
const getPlayerVideo = (): HTMLVideoElement | null =>
  document.querySelector<HTMLVideoElement>('#movie_player video') ??
  document.querySelector<HTMLVideoElement>(
    'video.video-stream.html5-main-video',
  );

type CrossfadeClaim = {
  video: HTMLVideoElement;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
};

/** A handle for a running gain ramp; `cancel` holds the gain where it is. */
export type CrossfadeRampHandle = {
  cancel(): void;
};

/**
 * Invoked when the player <video> is replaced while a transition is in
 * flight. `previousGain` is the line gain the old claim had reached when
 * the swap was detected (mid-ramp values included), so the new claim can
 * pick the transition up exactly where the old one left it.
 */
export type CrossfadeSwapCallback = (
  newVideo: HTMLVideoElement,
  previousGain: number,
) => void;

/**
 * Crossfade's Web Audio side: a single GainNode spliced into the shared
 * audio line (src/utils/audio-line.ts) that carries the player <video>'s
 * output to the speakers.
 *
 * Why a GainNode instead of the element's volume/mute (the plugin's
 * element mode): YouTube's player re-applies its own stored volume to the
 * <video> on track initialization and on every videodatachange (base.js
 * g.uz.setVolume). A guard that reverts those writes is reactive —
 * Chromium runs the volumechange handler as a queued task *after* the
 * write is already audible — so under heavy CPU throttling (power-save
 * mode, hidden window) the incoming track blares at full volume for as
 * long as that task is delayed. The GainNode removes the race by
 * construction: element volume writes multiply into whatever the gain
 * already is, and the gain is enforced by Chromium's audio rendering
 * thread with sample accuracy, independent of JS task scheduling. A gain
 * of 0 makes every foreign volume write inaudible with zero reaction
 * time.
 *
 * At rest the gain is 1 (neutral). During a transition the plugin drives
 * it exclusively: handoff ramp to 0, hold through the load window, then a
 * fade-in ramp back to 1 shaped by the user's fadeScaling curve. In graph
 * mode the element's own volume/muted properties are never touched, and
 * the element-mode guard stays disarmed.
 *
 * Failure discipline: every operation is defensive — a failure logs with
 * a [CrossfadeGraph] prefix and reports false to the caller, which falls
 * back to element mode for that transition. Nothing here may leave audio
 * stuck silent at rest: dispose() snaps the gain back to 1 and removes
 * the node before anything else is torn down.
 */
export class CrossfadeAudioGraph {
  private context: AudioContext | null = null;
  private claimState: CrossfadeClaim | null = null;
  private disabled = false;
  private disposed = false;
  private transitionActive = false;
  private swapCallback: CrossfadeSwapCallback | null = null;
  private observer: MutationObserver | null = null;
  private observedContainer: Element | null = null;
  private watchdogTimer: number | null = null;
  private rampTimer: number | null = null;
  private rampToken = 0;

  /**
   * Async setup, called once from the plugin's onPlayerApiReady:
   * step-aside checks and registry seeding. When a graph-rerouting plugin
   * (audio-compressor / equalizer / pitch-shift) is enabled, the graph
   * permanently disables itself for the session — splicing a second chain
   * into a graph those plugins own could produce parallel audio paths —
   * and the plugin uses its element-mode defenses throughout.
   */
  async init(): Promise<void> {
    if (this.disposed) return;
    const steppingAsideFor = [
      'audio-compressor',
      'equalizer',
      'pitch-shift',
    ] as const;
    for (const pluginId of steppingAsideFor) {
      let enabled = false;
      try {
        enabled = await window.mainConfig.plugins.isEnabled(pluginId);
      } catch (err) {
        console.warn(
          `[CrossfadeGraph] could not check whether plugin '${pluginId}' is enabled`,
          err,
        );
      }
      if (enabled) {
        this.disabled = true;
        console.info(`[CrossfadeGraph] stepping aside: ${pluginId} enabled`);
        return;
      }
    }
    // stop() may have landed while the awaits above were in flight.
    if (this.disposed) return;

    // Seed the registry from the shared bus renderer.ts publishes: its
    // source is the one capture the player <video> will ever have.
    const bus = window.__blyricsAudio;
    if (bus) {
      this.context = bus.context;
      registerMediaSource(bus.element, bus.source);
    }

    document.addEventListener('peard:audio-can-play', this.onAudioCanPlay);
    this.observer = new MutationObserver(this.onDomChange);
    this.anchorObserver();
    this.watchdogTimer = window.setInterval(this.onDomChange, 2000);
  }

  /**
   * Claims the shared line for `video` — idempotent for the element
   * already claimed. A fresh claim inserts a GainNode at rest (gain 1)
   * and takes over from whatever claim preceded it. Any failure returns
   * false so the caller uses element mode; the existing line is never
   * disturbed.
   */
  claim(video: HTMLVideoElement): boolean {
    if (this.disposed || this.disabled || !this.context) return false;
    const current = this.claimState;
    if (current?.video === video) return true;
    try {
      const source = getOrCreateMediaSource(video, this.context);
      const gain = this.context.createGain();
      gain.gain.value = 1;
      if (!insertLineNode(this.context, source, LINE_NODE_ID, gain)) {
        return false;
      }
      this.claimState = { video, source, gain };
      if (current && current.source !== source) {
        // The previous claim's element was replaced and can no longer
        // produce audio; drop its node from that (now dead) line for
        // tidiness. Failures are irrelevant — the line belongs to a
        // detached element.
        removeLineNode(this.context, current.source, LINE_NODE_ID);
      }
      return true;
    } catch (err) {
      console.warn(
        '[CrossfadeGraph] could not claim the video audio line',
        err,
      );
      return false;
    }
  }

  /** True while `video` is the element the current claim was made for. */
  isClaimed(video: HTMLVideoElement): boolean {
    return !this.disposed && this.claimState?.video === video;
  }

  /** The claimed gain's current value (1 when no claim exists). */
  currentValue(): number {
    try {
      return this.claimState?.gain.gain.value ?? 1;
    } catch {
      return 1;
    }
  }

  /** True while a ramp's completion hook is still pending. */
  isRamping(): boolean {
    return this.rampTimer !== null;
  }

  /**
   * Marks whether a crossfade transition is in flight. Element swaps
   * outside a transition are handled by re-claiming the new element at
   * rest; swaps during one are forwarded to the registered swap callback,
   * which carries the transition across.
   */
  setTransitionActive(active: boolean): void {
    this.transitionActive = active;
  }

  /** Registers (or clears) the mid-transition element-swap callback. */
  onSwap(callback: CrossfadeSwapCallback | null): void {
    this.swapCallback = callback;
  }

  /**
   * Ramps the claimed gain to `target` over `durationMs`, shaped by the
   * user's fadeScaling curve (the same scale constructors the VolumeFader
   * uses, so the ramp reproduces the element-mode fade shape exactly).
   *
   * The curve is scheduled with setValueCurveAtTime, which the audio
   * rendering thread enforces with sample accuracy — it runs on schedule
   * even when JS tasks are throttled to a crawl. The returned handle's
   * completion hook (`onDone`, delivered via a plain setTimeout) is the
   * only part that can lag under throttling; callers must not rely on its
   * timing for anything the audio itself already guarantees.
   *
   * Returns null when there is no claim or scheduling failed, in which
   * case the gain is left untouched and the caller should fall back.
   */
  rampTo(
    target: number,
    durationMs: number,
    fadeScaling?: string | number,
    onDone?: () => void,
  ): CrossfadeRampHandle | null {
    const current = this.claimState;
    const context = this.context;
    if (this.disposed || !current || !context) return null;
    try {
      const now = context.currentTime;
      // Read the value first, then cancel: a ramp is often re-triggered
      // while a previous curve is still running, and the new curve has to
      // pick up from wherever the old one had reached.
      //
      // It must be cancelScheduledValues here, NOT cancelAndHoldAtTime:
      // cancelAndHoldAtTime cannot cancel a running setValueCurveAtTime
      // (it throws NotSupportedError); cancelScheduledValues removes a
      // curve spanning the cancel time, which is what this needs (same
      // discipline as smooth-transitions).
      const startValue = Math.min(Math.max(current.gain.gain.value, 0), 1);
      current.gain.gain.cancelScheduledValues(now);
      const safeDurationMs =
        Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 1;
      let scale: VolumeScale;
      try {
        scale = createFadeScale(fadeScaling);
      } catch {
        // A corrupted config value must not disable the whole graph mode;
        // fall back to the fader's default curve.
        scale = createFadeScale('logarithmic');
      }
      const clampedTarget = Math.min(Math.max(target, 0), 1);
      const startLevel = scale.volumeToInternal(startValue);
      const endLevel = scale.volumeToInternal(clampedTarget);
      // Linear in the internal scale, mapped through internalToVolume —
      // the exact interpolation the VolumeFader applies to element
      // volumes, with endpoints clamped to the ramp's range.
      const lowest = Math.min(startValue, clampedTarget);
      const highest = Math.max(startValue, clampedTarget);
      const curve = new Float32Array(RAMP_CURVE_LENGTH);
      for (let i = 0; i < RAMP_CURVE_LENGTH; i++) {
        const progress = i / (RAMP_CURVE_LENGTH - 1);
        const levelDelta = (endLevel - startLevel) * progress;
        const level = startLevel + levelDelta;
        const value = scale.internalToVolume(level);
        curve[i] = Math.min(Math.max(value, lowest), highest);
      }
      current.gain.gain.setValueCurveAtTime(curve, now, safeDurationMs / 1000);

      this.supersedeRamp();
      const token = this.rampToken;
      this.rampTimer = window.setTimeout(() => {
        this.rampTimer = null;
        if (token === this.rampToken) onDone?.();
      }, safeDurationMs);

      return {
        cancel: () => {
          // A stale handle (superseded by a newer ramp or a snap) must
          // not touch the line the newer operation now owns.
          if (token !== this.rampToken) return;
          this.supersedeRamp();
          this.holdClaimGain(current);
        },
      };
    } catch (err) {
      console.error('[CrossfadeGraph] could not schedule the gain ramp', err);
      return null;
    }
  }

  /**
   * Snaps the claimed gain to `value` with no ramp, invalidating any
   * active ramp (its completion hook will not fire).
   */
  snapTo(value: number): void {
    const current = this.claimState;
    const context = this.context;
    if (!current || !context) return;
    this.supersedeRamp();
    try {
      const now = context.currentTime;
      const clamped = Math.min(Math.max(value, 0), 1);
      current.gain.gain.cancelScheduledValues(now);
      current.gain.gain.setValueAtTime(clamped, now);
    } catch (err) {
      console.error('[CrossfadeGraph] could not snap the gain', err);
    }
  }

  /**
   * Rest (gain 1) and removal, in that order, so teardown can never leave
   * the audio stuck silent; then all observation stops. Idempotent.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.supersedeRamp();
    const current = this.claimState;
    if (current && this.context) {
      try {
        const now = this.context.currentTime;
        current.gain.gain.cancelScheduledValues(now);
        current.gain.gain.setValueAtTime(1, now);
      } catch (err) {
        console.error(
          '[CrossfadeGraph] could not restore the gain during dispose',
          err,
        );
      }
      removeLineNode(this.context, current.source, LINE_NODE_ID);
    }
    this.claimState = null;
    this.swapCallback = null;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.watchdogTimer !== null) {
      window.clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    document.removeEventListener('peard:audio-can-play', this.onAudioCanPlay);
  }

  private onAudioCanPlay = (event: Event) => {
    if (this.disposed || this.disabled) return;
    const { audioContext, audioSource, video } = (
      event as CustomEvent<Compressor>
    ).detail;
    // Keep the stored context and the registry fresh on every track load.
    this.context = audioContext;
    registerMediaSource(video, audioSource);
  };

  // The observer is anchored on #movie_player — the closest id'd ancestor
  // of the player's <video> — instead of <body>, so swap detection fires
  // on a handful of mutation batches per navigation instead of on every
  // batch of a page that churns constantly. Two escapes keep the edge
  // cases covered: before the player container exists the fallback target
  // is <body> (promoted on the first mutation after #movie_player
  // appears), and if the container itself is torn down and rebuilt the
  // observer bound to the dead node goes silent — the watchdog interval
  // below notices within a couple of seconds and re-anchors (same
  // skeleton as smooth-transitions).
  private anchorObserver = () => {
    if (!this.observer) return;
    const container = document.querySelector('#movie_player') ?? document.body;
    if (container === this.observedContainer) return;
    this.observer.disconnect();
    this.observer.observe(container, { childList: true, subtree: true });
    this.observedContainer = container;
  };

  private onDomChange = () => {
    if (this.disposed || this.disabled) return;
    if (
      this.observedContainer === null ||
      this.observedContainer === document.body ||
      !this.observedContainer.isConnected
    ) {
      this.anchorObserver();
    }
    const video = getPlayerVideo();
    if (!video) return;
    const current = this.claimState;
    if (current && current.video === video) return;
    if (!current && !this.transitionActive) return;

    // The player's <video> was replaced (sleep/wake, GPU restart, …).
    const previousGain = this.currentValue();
    if (this.transitionActive) {
      // A transition is in flight: the transition closure decides how to
      // carry it across the swap (claim migration or element fallback).
      this.swapCallback?.(video, previousGain);
      return;
    }
    if (this.claim(video)) {
      console.info(
        '[CrossfadeGraph] video element replaced; re-claimed the new element (gain 1)',
      );
    } else {
      console.warn(
        '[CrossfadeGraph] video element replaced; could not re-claim the new element (element fallback applies until the next transition claims it)',
      );
    }
  };

  /** Invalidates any active ramp and drops its pending completion hook. */
  private supersedeRamp(): void {
    this.rampToken++;
    if (this.rampTimer !== null) {
      window.clearTimeout(this.rampTimer);
      this.rampTimer = null;
    }
  }

  /**
   * Holds `claim`'s gain at the value its curve had reached — the manual
   * equivalent of cancelAndHoldAtTime, which cannot be used here (it
   * throws against a running setValueCurveAtTime; see rampTo).
   */
  private holdClaimGain(claim: CrossfadeClaim): void {
    const context = this.context;
    if (!context) return;
    try {
      const now = context.currentTime;
      const held = Math.min(Math.max(claim.gain.gain.value, 0), 1);
      claim.gain.gain.cancelScheduledValues(now);
      claim.gain.gain.setValueAtTime(held, now);
    } catch (err) {
      console.error('[CrossfadeGraph] could not hold the ramp value', err);
    }
  }
}
