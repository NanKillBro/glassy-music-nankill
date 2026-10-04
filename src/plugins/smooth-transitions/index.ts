import { t } from '@/i18n';
import { createPlugin } from '@/utils';
import {
  getOrCreateMediaSource,
  insertLineNode,
  registerMediaSource,
  removeLineNode,
} from '@/utils/audio-line';

import type { MusicPlayer } from '@/types/music-player';

export type SmoothTransitionsPluginConfig = {
  enabled: boolean;
  /**
   * Fade the volume down before pausing and back up when resuming,
   * instead of an abrupt stop/start (like Spotify does).
   *
   * @default true
   */
  fadeOnPause: boolean;
  /**
   * Duration of the pause/resume fade, in milliseconds.
   *
   * @default 200
   */
  pauseFadeDuration: number;
  /**
   * Fade the volume down briefly before switching to the next/previous
   * song (when manually skipping), and back up once the new song starts.
   *
   * @default true
   */
  fadeOnSkip: boolean;
  /**
   * Duration of the skip fade, in milliseconds.
   *
   * @default 180
   */
  skipFadeDuration: number;
};

type Teardown = () => void;

type DebugState = {
  video: HTMLVideoElement | null;
  isFading: boolean;
  pauseFadeToken: number;
  skipFadeToken: number;
  gainReady: boolean;
  disabled: boolean;
};

type AudioCanPlayDetail = {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode;
  /** The element audioSource was created from - see the Compressor type. */
  video: HTMLVideoElement;
};

/**
 * Fades are driven exclusively by a Web Audio GainNode - never by
 * video.volume. This is deliberate: video.volume is a shared property that
 * other plugins can globally reinterpret (e.g. Exponential Volume replaces
 * HTMLMediaElement.prototype.volume's getter/setter with a cubic curve, on
 * every video element, transforming whatever anyone reads or writes there).
 * A GainNode lives one layer below that, in the Web Audio graph, so it's
 * completely unaffected by what any other plugin does to video.volume - the
 * two compose multiplicatively (video.volume x gain) without either needing
 * to know the other exists. Fading video.volume directly, as this plugin
 * used to, meant every fade was silently corrupted by whatever transform
 * another plugin applied to that property.
 *
 * The rest value is always 1 (no attenuation) - fades are relative dips on
 * top of whatever video.volume/other plugins/the user's slider already
 * dictates, never a stored "target volume" that could go stale.
 */
function createGainFader(
  gainNode: GainNode,
  audioContext: AudioContext,
  debug: DebugState,
) {
  let rampTimeout: number | null = null;
  // Where the gain is heading, as opposed to where it has got to so far.
  // gain.value only reports the latter, so a guard like "fade up unless we're
  // already at full" reads below 1 for the whole length of a fade-in that is
  // already on its way to 1 - and every call site carrying that guard
  // schedules another ramp on top, each one cancelling and restarting the
  // last. Measured on one track change: four redundant ramps to 1, audible as
  // a fade-in that keeps restarting. Tracking the destination separately lets
  // those guards ask the question they actually mean.
  let targetValue = gainNode.gain.value;

  // Curve shape decides how "direct" a fade feels, independently of its
  // duration. An equal-power curve (cos/sin, the standard crossfade shape)
  // is only -0.7dB into a fade-out at 25% of the ramp and -3dB at the
  // halfway point, so the first half is barely quieter than full volume -
  // pressing pause reads as a delay before anything happens. Linear gain
  // is not much better early on. exponentialRampToValueAtTime overcorrects
  // instead: the spec forbids ramping to exactly 0, so the target has to be
  // a tiny approximation, and covering 0 to roughly -80dB in a couple
  // hundred ms dumps the whole audible drop into the first third (measured
  // live: -75dB by 30% of the ramp) - an instant cut, not a fade.
  //
  // Easing the interpolation with t^EASE_EXPONENT front-loads the movement
  // without any of that: at 25% of a fade-out the gain is already down to
  // about 0.57 (-4.9dB) and at the halfway point about 0.34 (-9dB), so the
  // drop is immediately audible and the rest of the ramp is the tail. The
  // same easing applies to fade-ins, which makes a resume come back just as
  // promptly. Endpoints are still hit exactly, so no approximation of 0 is
  // needed.
  const CURVE_LENGTH = 32;
  const EASE_EXPONENT = 0.6;

  const rampTo = (target: number, durationMs: number, onDone?: () => void) => {
    if (rampTimeout !== null) {
      window.clearTimeout(rampTimeout);
      rampTimeout = null;
    }
    const now = audioContext.currentTime;
    // Read the value first, then cancel: a fade is often re-triggered while
    // a previous curve is still running (spamming play/pause does exactly
    // that), and the new curve has to pick up from wherever the old one had
    // reached.
    //
    // It must be cancelScheduledValues here, NOT cancelAndHoldAtTime.
    // cancelAndHoldAtTime cannot cancel a setValueCurveAtTime that is
    // currently running - it throws NotSupportedError ("setValueCurveAtTime
    // ... overlaps setValueCurveAtTime ...") and the fade dies mid-curve,
    // taking play/pause with it. cancelScheduledValues does remove a curve
    // that spans the cancel time, which is what this needs.
    const startValue = gainNode.gain.value;
    gainNode.gain.cancelScheduledValues(now);
    // setValueCurveAtTime rejects a zero or negative duration, and the fade
    // durations come from stored config, so don't assume they're sane. A
    // floor of 1ms also gives "no fade" the sensible reading: effectively
    // instant, rather than a thrown error that kills play/pause.
    const safeDurationMs =
      Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 1;
    const durationSec = safeDurationMs / 1000;
    // Interpolating between the two endpoints keeps the curve inside them by
    // construction, so a fade between two non-zero values - resuming to 1
    // from a pause fade that was interrupted partway, which happens
    // constantly here - can't overshoot above unity and clip. The clamp is
    // belt and braces against floating point landing a hair outside.
    const lowest = Math.min(startValue, target);
    const highest = Math.max(startValue, target);
    const curve = new Float32Array(CURVE_LENGTH);
    for (let i = 0; i < CURVE_LENGTH; i++) {
      const progress = (i / (CURVE_LENGTH - 1)) ** EASE_EXPONENT;
      const delta = (target - startValue) * progress;
      const value = startValue + delta;
      curve[i] = Math.min(Math.max(value, lowest), highest);
    }
    gainNode.gain.setValueCurveAtTime(curve, now, durationSec);
    targetValue = target;
    debug.isFading = true;
    rampTimeout = window.setTimeout(() => {
      rampTimeout = null;
      debug.isFading = false;
      onDone?.();
    }, safeDurationMs);
  };

  return {
    get: () => gainNode.gain.value,
    target: () => targetValue,
    rampTo,
    dispose() {
      if (rampTimeout !== null) {
        window.clearTimeout(rampTimeout);
        rampTimeout = null;
      }
      debug.isFading = false;
    },
  };
}

type GainFader = ReturnType<typeof createGainFader>;

/**
 * The YTM player's own <video>, anchored on the player container so it can
 * never grab an unrelated <video> injected by other content — most notably
 * shaders-glassy's animated album art (#bls-video, plus the transient
 * "bls-video-crossfade-dummy" it keeps during its artwork crossfade), which
 * lives higher up inside ytmusic-player. Verified against the live DOM: the
 * player video sits at #movie_player > .html5-video-container > video with
 * classes "video-stream html5-main-video", and #movie_player contains exactly
 * one <video> even while the decoy exists — whereas the bare
 * document.querySelector('video') this replaces resolves to the decoy. The
 * fallback matches the same element via the YouTube player's own classes for
 * the window where #movie_player is transiently absent.
 */
const getPlayerVideo = (): HTMLVideoElement | null =>
  document.querySelector<HTMLVideoElement>('#movie_player video') ??
  document.querySelector<HTMLVideoElement>(
    'video.video-stream.html5-main-video',
  );

/**
 * The element's *real* paused state. `video.paused` can't answer this: the
 * instance property is shadowed below to report pause *intent* immediately
 * (see the Object.defineProperty block in setupSmoothTransitions), so it says
 * "paused" throughout a pause fade during which the element is still playing.
 * Starting the lookup at the prototype reaches past that shadowing to the
 * accessor the element itself implements, with `video` as the receiver.
 */
const isReallyPaused = (video: HTMLVideoElement): boolean =>
  Reflect.get(HTMLMediaElement.prototype, 'paused', video);

/**
 * How long after a 'crossfade:auto-advance' event a track change is still
 * considered crossfade-driven. The advance call itself is intercepted
 * synchronously, but the loadstart it causes lands asynchronously (usually
 * well under a second) — the window covers both without staying open long
 * enough to swallow an unrelated manual skip.
 */
const CROSSFADE_ADVANCE_BYPASS_MS = 2000;

/**
 * Wraps video.pause()/play() directly (not the player API) since the
 * on-screen button and spacebar call the element methods, bypassing the
 * API. Manual song selections and skip buttons are observed, never
 * intercepted: the gesture reaches the app untouched and the fade races the
 * track change rather than gating it (see the comment on onSkipGesture).
 */
function setupSmoothTransitions(
  video: HTMLVideoElement,
  api: MusicPlayer,
  getConfig: () => SmoothTransitionsPluginConfig | null,
  debug: DebugState,
  fader: GainFader,
  crossfadeActive: boolean,
): Teardown {
  debug.video = video;

  // --- Pause / resume ---
  const originalVideoPause = video.pause.bind(video);
  const originalVideoPlay = video.play.bind(video);
  let pauseFadeToken = 0;

  // The spec has .pause() flip `paused` to true synchronously, but our
  // fade delays the real pause() call until the fade finishes - so any
  // code reading video.paused right after calling pause() (e.g. the
  // on-screen button's own icon/state logic) would see stale "still
  // playing" for the whole fade. Under rapid clicking that desyncs the
  // button from reality until it stops responding correctly. Shadowing
  // `paused` to report intent immediately keeps external code in sync.
  let intendedPaused = video.paused;
  Object.defineProperty(video, 'paused', {
    configurable: true,
    get: () => intendedPaused,
  });
  const onNativePause = () => {
    intendedPaused = true;
  };
  const onNativePlay = () => {
    intendedPaused = false;
  };
  video.addEventListener('pause', onNativePause);
  video.addEventListener('play', onNativePlay);

  // When an output device disappears (e.g. AirPods taken out), audio
  // briefly plays from whatever it falls back to (usually speakers)
  // before this app's own device-change handling pauses it. Fading that
  // pause would only stretch out the window of audio coming from the
  // wrong place, so skip the fade and cut instantly for a pause that
  // follows a device change.
  let recentDeviceChangeUntil = 0;
  const onDeviceChange = () => {
    recentDeviceChangeUntil = performance.now() + 1000;
  };
  navigator.mediaDevices.addEventListener('devicechange', onDeviceChange);

  video.pause = () => {
    const config = getConfig();
    const isDeviceChangePause = performance.now() < recentDeviceChangeUntil;
    if (!config?.fadeOnPause || intendedPaused || isDeviceChangePause) {
      intendedPaused = true;
      return originalVideoPause();
    }

    intendedPaused = true;
    const token = ++pauseFadeToken;
    debug.pauseFadeToken = pauseFadeToken;
    fader.rampTo(0, config.pauseFadeDuration, () => {
      if (token !== pauseFadeToken) return;
      originalVideoPause();
    });
    return undefined;
  };

  video.play = () => {
    const wasIntendedPaused = intendedPaused;
    intendedPaused = false;
    pauseFadeToken++; // invalidates any in-flight pause fade
    debug.pauseFadeToken = pauseFadeToken;
    // Resync to full whenever gain isn't already heading there: the pause
    // fade above may have been left running (invalidating it only skips the
    // final pause() call, not the gain animation), so gain could be
    // anywhere between 0 and 1 when play() is called for any reason -
    // but most play() calls (e.g. every normal song advance) don't need
    // this at all, so skip the no-op ramp when gain is already at rest.
    if (fader.target() < 1) {
      const config = getConfig();
      fader.rampTo(1, config?.pauseFadeDuration ?? 200);
    }
    // Read the element's real state *before* play() flips it. A track change
    // pauses and then plays within the same turn, and the native 'pause'
    // event is queued as a task - so a flag set from that event still reads
    // "not really paused" here even though the element genuinely did stop and
    // originalVideoPlay() is about to fire its own play/playing. Asking the
    // element directly is exact, and stops both sets firing at once.
    const wasReallyPaused = isReallyPaused(video);
    const result = originalVideoPlay();
    // If a pause fade was in flight and got invalidated by this very call
    // before its deferred originalVideoPause() ever ran, the element was
    // never actually paused - calling play() on an already-playing element
    // is a spec-mandated no-op that fires no 'play'/'playing' event. Any
    // outside code that reacted to the earlier pause() call (e.g. the
    // player bar's own button, which flips its icon/title the moment
    // pause() is called, then waits for a real event to confirm resuming)
    // would otherwise be stuck showing "paused" forever despite playback
    // never having stopped - dispatch the events ourselves so it resyncs.
    if (wasIntendedPaused && !wasReallyPaused) {
      video.dispatchEvent(new Event('play'));
      video.dispatchEvent(new Event('playing'));
    }
    return result;
  };

  // Route the higher-level player API through the same patched methods,
  // in case something calls pauseVideo()/playVideo() without going
  // through video.pause()/play() directly.
  const originalApiPauseVideo = api.pauseVideo.bind(api);
  const originalApiPlayVideo = api.playVideo.bind(api);
  api.pauseVideo = () => video.pause();
  api.playVideo = () => video.play();

  // --- Manual song selection / skip (next / previous / playlist clicks) ---
  const skipTeardowns: Teardown[] = [];
  let skipFadeToken = 0;
  let tornDown = false;
  // Held so teardown can cancel it - otherwise it can fire after the plugin
  // is stopped and ramp a fader that has already been disposed.
  let skipSafetyTimer: number | null = null;
  skipTeardowns.push(() => {
    if (skipSafetyTimer !== null) window.clearTimeout(skipSafetyTimer);
    skipSafetyTimer = null;
  });

  // --- Crossfade coordination ---
  // When the crossfade plugin is enabled it owns the automatic end-of-track
  // transition (video-volume handoff to its shadow audio, then the advance).
  // It announces each advance ('crossfade:auto-advance') so this plugin can
  // tell it apart from a user-initiated skip: an automated advance must not
  // be wrapped in a skip fade — the video is already silent at that point
  // (its volume was ramped to 0 for the handoff), so a fade would only
  // delay the player's track change and dip the gain mid-choreography.
  // Manual skips keep their fade: crossfade performs no fade of its own on
  // manual track changes (it resets to IDLE), so the short dip remains the
  // only fade there and is still wanted.
  let lastCrossfadeAdvanceAt = Number.NEGATIVE_INFINITY;
  const onCrossfadeAdvance = () => {
    lastCrossfadeAdvanceAt = performance.now();
  };
  const isCrossfadeAdvance = () =>
    crossfadeActive &&
    performance.now() - lastCrossfadeAdvanceAt < CROSSFADE_ADVANCE_BYPASS_MS;
  if (crossfadeActive) {
    document.addEventListener('crossfade:auto-advance', onCrossfadeAdvance);
    skipTeardowns.push(() =>
      document.removeEventListener(
        'crossfade:auto-advance',
        onCrossfadeAdvance,
      ),
    );
  }

  // One gesture fires both skip listeners below - a pointerdown, then the
  // click it becomes - and only the first of the pair should fade. A fade
  // already heading to silence means this is the second one, or that there is
  // nothing left to fade. Deliberately *not* used by the paths that defer an
  // action behind the fade (the wrapped player API, the media-session
  // handler): this is true from the instant a fade starts, when the audio is
  // still at full volume, so acting on it there would switch track before the
  // fade had been heard at all.
  const fadeToSilencePending = () => fader.target() <= 0;

  // A skip fades out and then relies on the new song's loadstart/play to
  // fade back in. When the action doesn't actually change track - previous
  // at the start of a queue, a media key the app ignores, a click that
  // didn't navigate - none of those fire, and the gain would sit at 0 with
  // playback continuing silently. Restore it if nothing has by then.
  const scheduleFadeRestore = (token: number, durationMs: number) => {
    if (skipSafetyTimer !== null) window.clearTimeout(skipSafetyTimer);
    skipSafetyTimer = window.setTimeout(() => {
      skipSafetyTimer = null;
      if (token === skipFadeToken && fader.target() < 1 && !video.paused) {
        fader.rampTo(1, durationMs);
      }
    }, 300);
  };

  const onSongPlay = () => {
    intendedPaused = false;
    if (fader.target() < 1) {
      const config = getConfig();
      fader.rampTo(
        1,
        config?.skipFadeDuration ?? config?.pauseFadeDuration ?? 180,
      );
    }
  };
  video.addEventListener('play', onSongPlay);
  video.addEventListener('playing', onSongPlay);

  const onLoadStart = () => {
    const config = getConfig();
    // Skip the dip for a crossfade-driven load: the video is already silent
    // (volume ramped down for the shadow-audio handoff), so the dip is
    // inaudible and only adds a gain restore that depends on the new track
    // firing 'play'.
    if (
      config?.fadeOnSkip &&
      !isCrossfadeAdvance() &&
      fader.target() > 0 &&
      !video.paused
    ) {
      fader.rampTo(0, 100);
    }
  };
  video.addEventListener('loadstart', onLoadStart);

  const wrapTrackChange = <A extends unknown[], R>(
    fn?: (...args: A) => R,
  ): ((...args: A) => R | undefined) | undefined => {
    if (!fn) return undefined;
    return (...args: A) => {
      const config = getConfig();
      if (
        isCrossfadeAdvance() ||
        !config?.fadeOnSkip ||
        video.paused ||
        fader.get() <= 0
      ) {
        return fn(...args);
      }

      const token = ++skipFadeToken;
      debug.skipFadeToken = skipFadeToken;
      fader.rampTo(0, config.skipFadeDuration, () => {
        if (token !== skipFadeToken) return;
        fn(...args);
        // previousVideo() at the start of a queue, or loadVideoById() for
        // the track already playing, don't actually change track and so
        // fire nothing to fade back in on.
        scheduleFadeRestore(token, config.skipFadeDuration);
      });
      return undefined;
    };
  };

  const originalNextVideo = api.nextVideo ? api.nextVideo.bind(api) : undefined;
  const originalPrevVideo = api.previousVideo
    ? api.previousVideo.bind(api)
    : undefined;
  const originalLoadByVars = api.loadVideoByPlayerVars
    ? api.loadVideoByPlayerVars.bind(api)
    : undefined;
  const originalLoadById = api.loadVideoById
    ? api.loadVideoById.bind(api)
    : undefined;
  const originalLoadByUrl = api.loadVideoByUrl
    ? api.loadVideoByUrl.bind(api)
    : undefined;
  const originalCueByVars = api.cueVideoByPlayerVars
    ? api.cueVideoByPlayerVars.bind(api)
    : undefined;
  const originalCueById = api.cueVideoById
    ? api.cueVideoById.bind(api)
    : undefined;
  const originalCueByUrl = api.cueVideoByUrl
    ? api.cueVideoByUrl.bind(api)
    : undefined;
  const originalLoadPlaylist = (
    api as unknown as { loadPlaylist?: (...args: unknown[]) => unknown }
  ).loadPlaylist
    ? (
        api as unknown as { loadPlaylist: (...args: unknown[]) => unknown }
      ).loadPlaylist.bind(api)
    : undefined;

  if (originalNextVideo) api.nextVideo = wrapTrackChange(originalNextVideo)!;
  if (originalPrevVideo)
    api.previousVideo = wrapTrackChange(originalPrevVideo)!;
  if (originalLoadByVars)
    api.loadVideoByPlayerVars = wrapTrackChange(originalLoadByVars)!;
  if (originalLoadById) api.loadVideoById = wrapTrackChange(originalLoadById)!;
  if (originalLoadByUrl)
    api.loadVideoByUrl = wrapTrackChange(originalLoadByUrl)!;
  if (originalCueByVars)
    api.cueVideoByPlayerVars = wrapTrackChange(originalCueByVars)!;
  if (originalCueById) api.cueVideoById = wrapTrackChange(originalCueById)!;
  if (originalCueByUrl) api.cueVideoByUrl = wrapTrackChange(originalCueByUrl)!;
  if (originalLoadPlaylist) {
    (
      api as unknown as { loadPlaylist: (...args: unknown[]) => unknown }
    ).loadPlaylist = wrapTrackChange(originalLoadPlaylist)!;
  }

  // Fading a manual song selection used to mean swallowing the gesture -
  // preventDefault + stopImmediatePropagation at document capture phase -
  // and re-dispatching playTrigger.click() once the fade had finished. That
  // is what pinned the CPU. A fabricated activation gives YouTube Music's
  // tp-yt-paper-ripple a ripple origin outside the element it belongs to, and
  // paper-ripple only ever retires a ripple once its radius reaches
  // min(maxRadius, 300), where maxRadius is the distance from that origin to
  // the element's furthest corner. A ripple can only grow to
  // 1.1 x min(diagonal, 300) + 5, so an origin far enough outside puts the
  // retirement radius permanently out of reach: measured on a 180x180
  // homepage carousel card, a ceiling of 285 against a threshold of 300. The
  // ripple is never removed, paper-ripple's hand-rolled rAF loop never hits
  // its exit condition, and it re-arms itself every frame for the rest of the
  // session - rewriting inline styles on two live nodes inside the carousel,
  // forever, at a layout recalc per frame.
  //
  // So the gesture is left completely alone and the fade races the track
  // change instead of gating it. Nothing is prevented, nothing is
  // re-dispatched, and no other component can be left holding state its own
  // code never produces. pointerdown rather than click buys the fade the gap
  // between press and release - usually 80-150ms of human reaction time -
  // and onLoadStart's own dip covers the rest; click is listened to as well
  // so keyboard activation, which fires no pointerdown, still fades.
  // fadeToSilencePending() collapses the pair: the click that follows a
  // pointerdown sees a fade already heading to 0 and does nothing.
  const onSkipGesture = (event: MouseEvent) => {
    // Secondary buttons open context menus rather than changing track.
    if (event.button !== 0) return;

    const config = getConfig();
    if (
      !config?.fadeOnSkip ||
      isCrossfadeAdvance() ||
      video.paused ||
      fadeToSilencePending()
    )
      return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Do not fade for menus, like buttons, sliders, channels, browse links,
    // or controls - none of them change track.
    if (
      target.closest(
        'ytmusic-menu-renderer, ytmusic-like-button-renderer, tp-yt-paper-slider, #volume-slider, #progress-bar, ytmusic-toggle-menu-service-item-renderer, button[aria-label*="Menu"], button[aria-label*="More"], .dropdown-trigger, a[href*="/channel/"], a[href*="/browse/"]',
      )
    ) {
      return;
    }

    // Only fade for specific, verified play triggers (play buttons, thumbnails, song title links, queue items, skip buttons)
    //
    // The card shelf - search's "top result" card - is the one place that
    // starts playback from a plain yt-button-renderer rather than a
    // ytmusic-play-button-renderer, so its primary action needs naming
    // separately or clicking Play there changes track with no fade at all.
    // Its own thumbnail and title links are already covered by the
    // watch?v= rule; only the button in .actions-container is not.
    // It's matched two ways because neither signal alone is durable: the
    // button carries no stable identity of its own, and its aria-label is
    // localised ("Phát", "Play", ...), so matching that would work in one
    // UI language and silently stop in every other. Position picks the
    // first action, which is Play; the filled style picks the card's
    // primary action, which is what distinguishes it from the outlined
    // Save button beside it. Either one alone breaks on a reorder or a
    // restyle, and breaking means the silent no-fade this is fixing.
    // Over-matching is the cheap direction: a button that turns out not to
    // change track just dips for ~180ms before scheduleFadeRestore's safety
    // net brings the gain back.
    const playTrigger = target.closest<HTMLElement>(
      'ytmusic-play-button-renderer, .next-button.ytmusic-player-bar, .previous-button.ytmusic-player-bar, ytmusic-player-queue-item .song-info, ytmusic-player-queue-item ytmusic-thumbnail-renderer, ytmusic-responsive-list-item-renderer .title a, ytmusic-responsive-list-item-renderer ytmusic-thumbnail-renderer, ytmusic-card-shelf-renderer .actions-container yt-button-renderer:first-of-type, ytmusic-card-shelf-renderer .actions-container button.ytSpecButtonShapeNextFilled, a[href*="watch?v="]',
    );

    if (!playTrigger) return;

    if (
      (playTrigger as HTMLButtonElement).disabled ||
      playTrigger.getAttribute('aria-disabled') === 'true'
    ) {
      return;
    }

    const token = ++skipFadeToken;
    debug.skipFadeToken = skipFadeToken;

    // A press that never becomes a track change - dragged off the control,
    // a click the app ignores - leaves the gain down with nothing to bring
    // it back, so the safety net schedules itself from the fade's end.
    fader.rampTo(0, config.skipFadeDuration, () => {
      if (token !== skipFadeToken) return;
      scheduleFadeRestore(token, config.skipFadeDuration);
    });
  };

  const originalSetActionHandler =
    'mediaSession' in navigator
      ? navigator.mediaSession.setActionHandler.bind(navigator.mediaSession)
      : null;

  if (originalSetActionHandler) {
    navigator.mediaSession.setActionHandler = (action, handler) => {
      if (!handler) {
        return originalSetActionHandler(action, null);
      }

      if (action === 'nexttrack' || action === 'previoustrack') {
        const wrappedHandler = (details: MediaSessionActionDetails) => {
          const config = getConfig();
          // Teardown restores the setActionHandler setter, but handlers
          // already registered through it stay registered with the app, so
          // this can still run afterwards - with the gain node no longer in
          // the graph, fading here would only delay the skip for nothing.
          if (
            tornDown ||
            isCrossfadeAdvance() ||
            !config?.fadeOnSkip ||
            video.paused ||
            fader.get() <= 0
          ) {
            return handler(details);
          }

          const token = ++skipFadeToken;
          debug.skipFadeToken = skipFadeToken;
          fader.rampTo(0, config.skipFadeDuration, () => {
            if (token !== skipFadeToken) return;
            handler(details);
            scheduleFadeRestore(token, config.skipFadeDuration);
          });
        };
        return originalSetActionHandler(action, wrappedHandler);
      }

      // pause/play deliberately aren't wrapped. Replacing them with
      // video.pause()/play() would drop whatever the app itself does on
      // those actions, and it isn't needed for the fade: api.pauseVideo and
      // api.playVideo are already patched to route through the element
      // methods, so the app's own handler reaches the fade on its own.
      return originalSetActionHandler(action, handler);
    };

    skipTeardowns.push(() => {
      navigator.mediaSession.setActionHandler = originalSetActionHandler;
    });
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (
      event.key === 'MediaTrackNext' ||
      event.key === 'MediaTrackPrevious' ||
      event.code === 'MediaTrackNext' ||
      event.code === 'MediaTrackPrevious'
    ) {
      const config = getConfig();
      if (
        !config?.fadeOnSkip ||
        isCrossfadeAdvance() ||
        video.paused ||
        fader.get() <= 0
      )
        return;

      const token = ++skipFadeToken;
      debug.skipFadeToken = skipFadeToken;
      // Scheduled from the completion callback, like the other skip paths:
      // the restore window is a fixed 300ms, so starting it up front would
      // let it fire mid-fade and ramp back up before reaching silence
      // whenever skipFadeDuration is configured above 300.
      fader.rampTo(0, config.skipFadeDuration, () => {
        scheduleFadeRestore(token, config.skipFadeDuration);
      });
    }
  };
  window.addEventListener('keydown', onKeyDown, true);
  skipTeardowns.push(() =>
    window.removeEventListener('keydown', onKeyDown, true),
  );

  // Capture phase so the fade still starts if something downstream stops
  // propagation, and passive to state outright that neither listener ever
  // calls preventDefault.
  const skipGestureOptions = { capture: true, passive: true } as const;
  document.addEventListener('pointerdown', onSkipGesture, skipGestureOptions);
  document.addEventListener('click', onSkipGesture, skipGestureOptions);
  skipTeardowns.push(() => {
    document.removeEventListener('pointerdown', onSkipGesture, true);
    document.removeEventListener('click', onSkipGesture, true);
  });

  return () => {
    tornDown = true;
    video.removeEventListener('pause', onNativePause);
    video.removeEventListener('play', onNativePlay);
    video.removeEventListener('play', onSongPlay);
    video.removeEventListener('playing', onSongPlay);
    video.removeEventListener('loadstart', onLoadStart);
    navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange);
    delete (video as { paused?: boolean }).paused;
    video.pause = originalVideoPause;
    video.play = originalVideoPlay;
    api.pauseVideo = originalApiPauseVideo;
    api.playVideo = originalApiPlayVideo;
    if (originalNextVideo) api.nextVideo = originalNextVideo;
    if (originalPrevVideo) api.previousVideo = originalPrevVideo;
    if (originalLoadByVars) api.loadVideoByPlayerVars = originalLoadByVars;
    if (originalLoadById) api.loadVideoById = originalLoadById;
    if (originalLoadByUrl) api.loadVideoByUrl = originalLoadByUrl;
    if (originalCueByVars) api.cueVideoByPlayerVars = originalCueByVars;
    if (originalCueById) api.cueVideoById = originalCueById;
    if (originalCueByUrl) api.cueVideoByUrl = originalCueByUrl;
    if (originalLoadPlaylist) {
      (
        api as unknown as { loadPlaylist: (...args: unknown[]) => unknown }
      ).loadPlaylist = originalLoadPlaylist;
    }
    for (const teardown of skipTeardowns) teardown();
    debug.video = null;
  };
}

/**
 * Waits for the app's Web Audio graph (via peard:audio-can-play) and
 * inserts a GainNode into it, then attaches setupSmoothTransitions using
 * that gain node exclusively - no video.volume-based fallback. If the video
 * element is ever replaced (e.g. after the OS sleeps/wakes), the old gain
 * node's binding goes stale and can't follow it, so a fresh one is wired
 * straight onto the new element using the same shared AudioContext - no
 * dependency on renderer.ts redoing anything, since a media element can
 * only ever be captured by one MediaElementAudioSourceNode and nothing else
 * has claimed the new one yet. If that ever fails, fading is disabled for
 * the rest of the session rather than falling back to touching
 * video.volume directly, which would reintroduce the conflict with plugins
 * like Exponential Volume that this design avoids.
 *
 * Also exposes window.__smoothTransitionsDebug for inspection from
 * DevTools if something goes wrong.
 *
 * When the crossfade plugin is co-enabled, `crossfadeActive` switches the
 * attached setup into coordination mode: automatic crossfade advances
 * bypass the skip fade, while pause/resume and manual-skip fades stay
 * active (see the crossfade coordination block in setupSmoothTransitions).
 */
function superviseSmoothTransitions(
  api: MusicPlayer,
  getConfig: () => SmoothTransitionsPluginConfig | null,
  crossfadeActive: boolean,
): Teardown {
  let stopCurrent: Teardown | null = null;
  let fader: GainFader | null = null;
  let disabled = false;
  // Retained purely so a later video-element swap (e.g. after the OS
  // sleeps/wakes) can wire a fresh gain node on its own, without depending
  // on renderer.ts to redo anything - it only ever handed us this context
  // and a source bound to the *original* video once, at startup.
  let sharedAudioContext: AudioContext | null = null;
  // The gain node currently spliced into the graph, kept so teardown can
  // take it back out. Without this, disabling the plugin mid-fade (e.g.
  // while paused, so gain sits at 0) would leave the node in place at that
  // value and silence playback until the app restarts.
  let insertedGain: {
    gainNode: GainNode;
    audioSource: MediaElementAudioSourceNode;
    audioContext: AudioContext;
  } | null = null;

  const debug: DebugState = {
    video: null,
    isFading: false,
    pauseFadeToken: 0,
    skipFadeToken: 0,
    gainReady: false,
    disabled: false,
  };
  (
    window as unknown as { __smoothTransitionsDebug: DebugState }
  ).__smoothTransitionsDebug = debug;

  const attachIfPossible = () => {
    if (disabled || !fader || stopCurrent) return;
    const video = getPlayerVideo();
    if (!video) return;
    stopCurrent = setupSmoothTransitions(
      video,
      api,
      getConfig,
      debug,
      fader,
      crossfadeActive,
    );
  };

  // Inserts a GainNode into the shared audio line (see
  // src/utils/audio-line.ts) and wraps it in a fader. Used both for the
  // very first video (via the audioSource renderer.ts already created for
  // it) and to rebuild from scratch after a video-element swap, where
  // nothing has claimed the new element's audio yet - a media element can
  // only ever be captured by one MediaElementAudioSourceNode, so this only
  // works while that's still true for `video`. A same-id re-insert
  // replaces any node a previous wiring left in the line instead of
  // letting stale gain nodes pile up in the graph.
  const wireGainNode = (
    audioContext: AudioContext,
    audioSource: MediaElementAudioSourceNode,
  ): GainFader | null => {
    try {
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;
      if (
        !insertLineNode(
          audioContext,
          audioSource,
          'smooth-transitions',
          gainNode,
        )
      ) {
        console.error(
          '[smooth-transitions] could not insert the gain node into the shared audio line',
        );
        return null;
      }
      insertedGain = { gainNode, audioSource, audioContext };
      return createGainFader(gainNode, audioContext, debug);
    } catch (err) {
      console.error('[smooth-transitions] failed to insert gain node', err);
      return null;
    }
  };

  const onAudioCanPlay = (event: Event) => {
    if (fader || disabled) return;
    const {
      audioContext,
      audioSource,
      video: sourceVideo,
    } = (event as CustomEvent<AudioCanPlayDetail>).detail;
    const video = getPlayerVideo();
    sharedAudioContext = audioContext;

    // Seed the shared line registry with renderer.ts's capture of this
    // element: a media element only ever gets one
    // MediaElementAudioSourceNode, so every later claim - ours, crossfade's,
    // or a re-capture after an element swap - must reuse this exact node
    // instead of attempting a second createMediaElementSource.
    registerMediaSource(sourceVideo, audioSource);

    // The event can arrive after its own element was already replaced -
    // detaching a media element doesn't remove its listeners, so the
    // dispatcher in renderer.ts can still fire from the old one. Fading a
    // source bound to a detached element would silently do nothing, so
    // capture the element that's actually on the page instead. That's safe
    // here precisely because it isn't the one renderer.ts captured.
    let source = audioSource;
    if (video && sourceVideo && sourceVideo !== video) {
      try {
        source = getOrCreateMediaSource(video, audioContext);
      } catch (err) {
        console.error(
          '[smooth-transitions] the video was replaced before setup and the replacement could not be captured, disabling fades for this session',
          err,
        );
        disabled = true;
        debug.disabled = true;
        return;
      }
    }

    fader = wireGainNode(audioContext, source);
    if (!fader) {
      disabled = true;
      debug.disabled = true;
      return;
    }
    debug.gainReady = true;

    attachIfPossible();
    // The instance's own native 'play'-driven resync only covers *future*
    // play() calls - if playback is already underway right now, that
    // event already fired before this fader existed, so nothing else
    // will trigger the fade-in unless done here.
    if (video && !video.paused) {
      fader.rampTo(1, 150);
    }
  };
  document.addEventListener('peard:audio-can-play', onAudioCanPlay);

  // Tracks the video element across calls independently of debug.video,
  // which only reflects whether setupSmoothTransitions is *currently*
  // attached (it's null both before the very first attach and whenever
  // fading is disabled) - comparing against that directly would treat the
  // first-ever sighting of the video as a "swap" before gain is even
  // ready, permanently disabling the plugin at startup.
  let lastSeenVideo: HTMLVideoElement | null = null;

  // The observer is anchored on #movie_player — the closest id'd ancestor of
  // the player's <video> (video > .html5-video-container > #movie_player) —
  // instead of <body>. #movie_player holds exactly one <video> and only the
  // player's own internals, so swap detection fires on a handful of batches
  // per navigation instead of on every mutation batch of a page that churns
  // constantly. Two escapes keep the edge cases covered: before the player
  // container exists the fallback target is <body> (promoted on the first
  // mutation after #movie_player appears), and if the container itself is
  // torn down and rebuilt the observer bound to the dead node goes silent —
  // the watchdog interval below notices within a couple of seconds and
  // re-anchors.
  let observer: MutationObserver | null = null;
  let observedContainer: Element | null = null;

  const anchorObserver = () => {
    if (!observer) return;
    const container = document.querySelector('#movie_player') ?? document.body;
    if (container === observedContainer) return;
    observer.disconnect();
    observer.observe(container, { childList: true, subtree: true });
    observedContainer = container;
  };

  const onDomChange = () => {
    if (disabled) return;
    // Promote <body> → #movie_player as soon as the player container
    // exists, and re-anchor when the previously observed container was torn
    // down with the player rebuilt.
    if (
      observedContainer === null ||
      observedContainer === document.body ||
      !observedContainer.isConnected
    ) {
      anchorObserver();
    }
    // This still runs for every mutation batch while attached, so keep the
    // common case down to one O(1) check. The only thing the observer has
    // to catch is the <video> being swapped out; while the element we're
    // attached to is still in the document, nothing here needs to change.
    if (stopCurrent && lastSeenVideo?.isConnected) return;

    const video = getPlayerVideo();
    if (!video) return;

    if (video !== lastSeenVideo) {
      lastSeenVideo = video;
      stopCurrent?.();
      stopCurrent = null;

      if (fader) {
        // The video element was replaced (e.g. after sleep/wake, or a GPU
        // process restart). The old gain node is permanently bound to the
        // now-detached element and can't follow, but nobody has claimed
        // the *new* element's audio yet, so a fresh GainNode can be wired
        // straight onto it - same as the very first attach, just reusing
        // the shared AudioContext instead of waiting for renderer.ts to
        // hand us a new peard:audio-can-play (it never fires again for a
        // swapped element, since renderer.ts's own loadstart/canplaythrough
        // listeners are still bound to the old one).
        fader.dispose();
        fader = null;
        debug.gainReady = false;
        if (sharedAudioContext) {
          try {
            // Throws if something outside the shared line registry already
            // captured this element's audio - there can only ever be one
            // MediaElementAudioSourceNode per element, and it can't be
            // undone once taken. Plugins that register with the line
            // module share the node instead of conflicting with us.
            const audioSource = getOrCreateMediaSource(
              video,
              sharedAudioContext,
            );
            fader = wireGainNode(sharedAudioContext, audioSource);
          } catch (err) {
            console.error(
              '[smooth-transitions] failed to capture the replaced video element',
              err,
            );
          }
        }
        if (!fader) {
          console.error(
            '[smooth-transitions] could not rewire gain node onto the replaced video element, disabling fades for this session',
          );
          disabled = true;
          debug.disabled = true;
          return;
        }
        debug.gainReady = true;
        // The new element's audio was just rerouted into a gain node that
        // starts silent - unlike the very first attach, playback here is
        // already underway (this element replaced one that was mid-song),
        // so snap straight to audible instead of gliding up from silence.
        fader.rampTo(1, 1);
      }
    }
    attachIfPossible();
  };
  observer = new MutationObserver(onDomChange);
  anchorObserver();
  lastSeenVideo = getPlayerVideo();
  attachIfPossible();

  // Safety net for the one case the observer cannot see: #movie_player being
  // torn down and rebuilt with a fresh <video> inside. The observer is bound
  // to the dead old node and receives nothing, so this slow poll re-anchors
  // and re-checks the video identity. Until it does, audio itself is fine —
  // the new element simply plays uncaptured, outside the gain node — only
  // fades go missing for the moment.
  const watchdogTimer = window.setInterval(onDomChange, 2000);

  // Puts the audio graph back the way renderer.ts left it: source straight
  // to destination, with this plugin's gain node removed entirely.
  const restoreGraph = () => {
    if (!insertedGain) return;
    const { gainNode, audioSource, audioContext } = insertedGain;
    insertedGain = null;
    try {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.value = 1;
      removeLineNode(audioContext, audioSource, 'smooth-transitions');
    } catch (err) {
      console.error('[smooth-transitions] failed to restore audio graph', err);
    }
  };

  return () => {
    window.clearInterval(watchdogTimer);
    observer?.disconnect();
    document.removeEventListener('peard:audio-can-play', onAudioCanPlay);
    stopCurrent?.();
    fader?.dispose();
    restoreGraph();
  };
}

export default createPlugin<
  unknown,
  unknown,
  {
    config: SmoothTransitionsPluginConfig | null;
    cleanup: Teardown | null;
    setupGeneration: number;
  },
  SmoothTransitionsPluginConfig
>({
  name: () => t('plugins.smooth-transitions.name'),
  description: () => t('plugins.smooth-transitions.description'),
  restartNeeded: true,
  config: {
    enabled: false,
    fadeOnPause: true,
    pauseFadeDuration: 200,
    fadeOnSkip: true,
    skipFadeDuration: 180,
  },
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();

    return [
      {
        label: t('plugins.smooth-transitions.menu.fade-on-pause'),
        type: 'checkbox',
        checked: config.fadeOnPause,
        async click() {
          const now = await getConfig();
          setConfig({ fadeOnPause: !now.fadeOnPause });
        },
      },
      {
        label: t('plugins.smooth-transitions.menu.fade-on-skip'),
        type: 'checkbox',
        checked: config.fadeOnSkip,
        async click() {
          const now = await getConfig();
          setConfig({ fadeOnSkip: !now.fadeOnSkip });
        },
      },
    ];
  },
  renderer: {
    config: null,
    cleanup: null,
    setupGeneration: 0,
    async start({ getConfig }) {
      this.config = await getConfig();
    },
    onConfigChange(newConfig) {
      this.config = newConfig;
    },
    async onPlayerApiReady(api) {
      // The isEnabled lookups below are async, and stop() can land while
      // they're in flight - it would clear this.cleanup first and then this
      // would install the patches anyway, with nothing left to remove them.
      const generation = ++this.setupGeneration;
      this.cleanup?.();
      // The crossfade plugin drives its own volume fades on the same
      // <video> element, but its fades live on video.volume while ours live
      // on a GainNode one layer below - the two compose multiplicatively
      // without either owning the other's control. So instead of stepping
      // aside entirely, crossfadeActive switches into coordination mode:
      // pause/resume and manual-skip fades stay active, while crossfade's
      // automatic end-of-track advances (announced via
      // 'crossfade:auto-advance') bypass the skip fade so they are never
      // delayed or double-faded.
      const crossfadeActive =
        await window.mainConfig.plugins.isEnabled('crossfade');
      // The audio-compressor plugin also reroutes the shared Web Audio
      // graph (source -> compressor -> destination). Inserting a gain
      // node into the same graph independently could race it and produce
      // duplicate/parallel audio paths, so step aside there too rather
      // than risk it - no fallback path exists to fall back to anymore.
      const audioCompressorActive =
        await window.mainConfig.plugins.isEnabled('audio-compressor');
      if (audioCompressorActive) return;
      // Equalizer hangs its filters off the same source
      // (source -> biquad -> destination) without removing the direct
      // source -> destination edge. Splicing a gain node into that edge
      // only attenuates one of the two parallel paths, so a "fade to
      // silence" would leave the filtered path audible. Step aside.
      const equalizerActive =
        await window.mainConfig.plugins.isEnabled('equalizer');
      if (equalizerActive) return;
      if (generation !== this.setupGeneration) return;
      this.cleanup = superviseSmoothTransitions(
        api,
        () => this.config,
        crossfadeActive,
      );
    },
    stop() {
      this.setupGeneration++;
      this.cleanup?.();
      this.cleanup = null;
    },
  },
});
