import prompt from 'custom-electron-prompt';
import { Howl } from 'howler';
import {
  Innertube,
  Platform,
  UniversalCache,
  type Types,
  type YT,
  type YTMusic,
} from '\u0079\u006f\u0075\u0074\u0075\u0062\u0065i.js';

import { t } from '@/i18n';
import { getNetFetchAsFetch } from '@/plugins/utils/main';
import promptOptions from '@/providers/prompt-options';
import { createPlugin } from '@/utils';

import { VolumeFader } from './fader';

import type { RendererContext } from '@/types/contexts';
import type { MusicPlayer } from '@/types/music-player';
import type { BrowserWindow } from 'electron';

export type CrossfadePluginConfig = {
  enabled: boolean;
  fadeInDuration: number;
  fadeOutDuration: number;
  secondsBeforeEnd: number;
  fadeScaling: 'linear' | 'logarithmic' | 'equalPower' | number;
};

// Duration of the handoff cross-ramp between the player's <video> and the
// preloaded shadow audio at the moment one track hands off to the next:
// the video ramps down to 0 while the shadow ramps up to the user's volume,
// replacing the older instant-swap (shadow straight to full volume + hard
// video mute 150ms later). Both sources carry the same content, so the
// overlap masks the residual handoff offset (seek-completion latency, clock
// skew, encode offset) instead of exposing it as an audible gap/repeat.
const HANDOFF_CROSSFADE_MS = 300;

const setupPlatformShimEval = () => {
  if (!Platform.shim.eval) {
    Platform.shim.eval = (
      data: Types.BuildScriptResult,
      env: Record<string, Types.VMPrimative>,
    ) => {
      const properties = [];

      if (env.n) {
        properties.push(`n: exportedVars.nFunction("${env.n}")`);
      }

      if (env.sig) {
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
      }

      const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

      // oxlint-disable-next-line typescript/no-unsafe-return,typescript/no-implied-eval,typescript/no-unsafe-call
      return new Function(code)();
    };
  }
};

const getCookieFromWindow = async (win?: BrowserWindow) => {
  if (!win) return undefined;
  try {
    return (
      await win.webContents.session.cookies.get({
        url: 'https://music.\u0079\u006f\u0075\u0074\u0075\u0062\u0065.com',
      })
    )
      .map((it) => `${it.name}=${it.value}`)
      .join(';');
  } catch {
    return undefined;
  }
};

export default createPlugin<
  unknown,
  unknown,
  {
    config?: CrossfadePluginConfig;
    ipc?: RendererContext<CrossfadePluginConfig>['ipc'];
    cleanup?: () => void;
  },
  CrossfadePluginConfig
>({
  name: () => t('plugins.crossfade.name'),
  description: () => t('plugins.crossfade.description'),
  restartNeeded: true,
  config: {
    enabled: false,
    /**
     * The duration of the fade in and fade out in milliseconds.
     *
     * @default 5000ms
     */
    fadeInDuration: 6000,
    /**
     * The duration of the fade in and fade out in milliseconds.
     *
     * @default 5000ms
     */
    fadeOutDuration: 6000,
    /**
     * The duration of the fade in and fade out in seconds.
     *
     * @default 10s
     */
    secondsBeforeEnd: 8,
    /**
     * The scaling algorithm to use for the fade.
     * (or a positive number in dB)
     *
     * @default 'equalPower'
     */
    fadeScaling: 'equalPower',
  },
  menu({ window, getConfig, setConfig }) {
    const promptCrossfadeValues = async (
      win: BrowserWindow,
      options: CrossfadePluginConfig,
    ): Promise<Omit<CrossfadePluginConfig, 'enabled'> | undefined> => {
      const res = await prompt(
        {
          title: t('plugins.crossfade.prompt.options'),
          type: 'multiInput',
          multiInputOptions: [
            {
              label: t(
                'plugins.crossfade.prompt.options.multi-input.fade-in-duration',
              ),
              value: options.fadeInDuration,
              inputAttrs: {
                type: 'number',
                required: true,
                min: '0',
                step: '100',
              },
            },
            {
              label: t(
                'plugins.crossfade.prompt.options.multi-input.fade-out-duration',
              ),
              value: options.fadeOutDuration,
              inputAttrs: {
                type: 'number',
                required: true,
                min: '0',
                step: '100',
              },
            },
            {
              label: t(
                'plugins.crossfade.prompt.options.multi-input.seconds-before-end',
              ),
              value: options.secondsBeforeEnd,
              inputAttrs: {
                type: 'number',
                required: true,
                min: '0',
              },
            },
            {
              label: t(
                'plugins.crossfade.prompt.options.multi-input.fade-scaling.label',
              ),
              selectOptions: {
                linear: t(
                  'plugins.crossfade.prompt.options.multi-input.fade-scaling.linear',
                ),
                logarithmic: t(
                  'plugins.crossfade.prompt.options.multi-input.fade-scaling.logarithmic',
                ),
                equalPower: 'Equal Power',
              },
              value: options.fadeScaling,
            },
          ],
          resizable: true,
          height: 360,
          ...promptOptions(),
        },
        win,
      ).catch(console.error);

      if (!res) {
        return undefined;
      }

      let fadeScaling: 'linear' | 'logarithmic' | 'equalPower' | number;
      if (
        res[3] === 'linear' ||
        res[3] === 'logarithmic' ||
        res[3] === 'equalPower'
      ) {
        fadeScaling = res[3];
      } else if (isFinite(Number(res[3]))) {
        fadeScaling = Number(res[3]);
      } else {
        fadeScaling = options.fadeScaling;
      }

      return {
        fadeInDuration: Number(res[0]),
        fadeOutDuration: Number(res[1]),
        secondsBeforeEnd: Number(res[2]),
        fadeScaling,
      };
    };

    return [
      {
        label: t('plugins.crossfade.menu.advanced'),
        async click() {
          const newOptions = await promptCrossfadeValues(
            window,
            await getConfig(),
          );
          if (newOptions) {
            setConfig(newOptions);
          }
        },
      },
    ];
  },

  backend: {
    start({ ipc, window }) {
      setupPlatformShimEval();

      let yt: Innertube | null = null;
      const getYt = async () => {
        if (!yt) {
          const cookie = await getCookieFromWindow(window);
          yt = await Innertube.create({
            cache: new UniversalCache(false),
            cookie,
            fetch: getNetFetchAsFetch(),
          });
        }
        return yt;
      };

      ipc.handle(
        'audio-url',
        async (videoID: string): Promise<string | null> => {
          try {
            console.log(
              `[Crossfade Backend] Fetching audio URL for video: ${videoID}`,
            );
            const ytInstance = await getYt();
            let info: YTMusic.TrackInfo | YT.VideoInfo;
            try {
              info = await ytInstance.music.getInfo(videoID);
            } catch (e) {
              console.warn(
                `[Crossfade Backend] yt.music.getInfo failed for ${videoID}, falling back to yt.getInfo:`,
                e,
              );
              info = await ytInstance.getInfo(videoID);
            }

            const format = info.chooseFormat({
              type: 'audio',
              quality: 'best',
            });
            if (!format) {
              console.warn(
                `[Crossfade Backend] No suitable audio format found for ${videoID}`,
              );
              return null;
            }

            const decipheredUrl = await format.decipher(
              ytInstance.session.player,
            );
            console.log(
              `[Crossfade Backend] Successfully resolved stream URL for ${videoID} (itag: ${format.itag}, mime: ${format.mime_type})`,
            );
            return decipheredUrl;
          } catch (error) {
            console.error(
              `[Crossfade Backend] Failed to get audio URL for ${videoID}:`,
              error,
            );
            return null;
          }
        },
      );
    },
    stop({ ipc }) {
      ipc.removeHandler('audio-url');
    },
  },

  renderer: {
    async start({ ipc, getConfig }) {
      this.config = await getConfig();
      this.ipc = ipc;
    },
    stop() {
      this.cleanup?.();
      this.cleanup = undefined;
    },
    onConfigChange(newConfig) {
      this.config = newConfig;
    },
    onPlayerApiReady(playerApi: MusicPlayer) {
      type CrossfadeState = 'IDLE' | 'TRANSITIONING' | 'COOLDOWN';

      let state: CrossfadeState = 'IDLE';
      let currentTrackId: string | null = null;
      let syncedAudio: Howl | null = null;
      let cooldownTimer: ReturnType<typeof setTimeout> | null = null;
      let fadeOutFader: VolumeFader | null = null;
      let fadeInFader: VolumeFader | null = null;
      // Handoff cross-ramp faders (see HANDOFF_CROSSFADE_MS). The audio fader
      // ramps the shadow up; the video fader ramps the player's video down.
      let handoffAudioFader: VolumeFader | null = null;
      let handoffVideoFader: VolumeFader | null = null;
      let fadeInPollTimer: ReturnType<typeof setInterval> | null = null;
      let fadeInTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
      let transitionToken = 0;
      let loadToken = 0;
      let lastSeekTime = 0;

      // --- Investigation state (2026-09-25 premature/missed crossfade bug) ---
      // Which of the three duration sources the trigger threshold came from.
      type DurationSource = 'howl' | 'playerApi' | 'videoElement' | 'unknown';
      // Snapshot of the most recent armed trigger evaluation. Kept so that a
      // natural `ended` (missed crossfade) can be explained after the fact.
      type TriggerEval = {
        at: number;
        trackId: string | null;
        currentTime: number;
        duration: number;
        durationSource: DurationSource;
        videoDuration: number | null;
        playerDuration: number | null;
        howlDuration: number | null;
        howlSeek: number | null;
        threshold: number;
        blockedBy: string | null;
      };
      let lastTriggerEval: TriggerEval | null = null;
      // Timestamp of the last [Monitor] debug trace (throttled to ~1/s).
      let lastTraceAt = 0;
      // The [Durations] mismatch warning fires at most once per track.
      let mismatchWarnedTrackId: string | null = null;

      const log = {
        info: (msg: string, ...args: unknown[]) => {
          console.info(
            `%c[Crossfade]%c ${msg}`,
            'color: #00bcd4; font-weight: bold;',
            'color: inherit;',
            ...args,
          );
        },
        warn: (msg: string, ...args: unknown[]) => {
          console.warn(
            `%c[Crossfade]%c ${msg}`,
            'color: #ff9800; font-weight: bold;',
            'color: inherit;',
            ...args,
          );
        },
        error: (msg: string, ...args: unknown[]) => {
          console.error(
            `%c[Crossfade]%c ${msg}`,
            'color: #f44336; font-weight: bold;',
            'color: inherit;',
            ...args,
          );
        },
        debug: (msg: string, ...args: unknown[]) => {
          console.debug(
            `%c[Crossfade]%c ${msg}`,
            'color: #9c27b0; font-weight: bold;',
            'color: inherit;',
            ...args,
          );
        },
      };

      // Formats a seconds value for log lines; '?' for unknown/invalid.
      const fmtSec = (v: number | null | undefined) =>
        typeof v === 'number' && Number.isFinite(v) ? `${v.toFixed(1)}s` : '?';

      log.info('Renderer player API ready. Config:', this.config);

      const getStreamURL = async (videoID: string): Promise<string | null> =>
        this.ipc?.invoke('audio-url', videoID) as Promise<string | null>;

      const getVideoIDFromURL = (url: string) => {
        try {
          return new URLSearchParams(url.split('?')?.at(-1)).get('v');
        } catch {
          return null;
        }
      };

      // The YTM player's own <video>. A bare `querySelector('video')` can
      // grab an unrelated <video> injected by other plugins — most notably
      // shaders-glassy's animated album art (id "bls-video", plus a transient
      // "bls-video-crossfade-dummy" it keeps during its artwork crossfade) —
      // which runs on its own short timeline (observed: 34s loop vs a 175s
      // track) and silently corrupts trigger timing, sync, and volume reads.
      // Anchor on the player container and the YouTube player's own element
      // classes (same selectors Tacet's select-media-element uses); never
      // fall back to an arbitrary <video> — fail closed instead, since every
      // call site already handles a null video.
      const getPlayerVideo = (): HTMLVideoElement | null =>
        document.querySelector<HTMLVideoElement>('#movie_player video') ??
        document.querySelector<HTMLVideoElement>(
          'video.video-stream.html5-main-video',
        );

      const getUserVolume = (): number => {
        try {
          if (typeof playerApi?.getVolume === 'function') {
            const vol = playerApi.getVolume();
            if (Number.isFinite(vol) && vol > 0) {
              return Math.min(Math.max(vol / 100, 0), 1);
            }
          }
        } catch {
          // Ignore
        }
        const video = getPlayerVideo();
        if (video && video.volume > 0) {
          return video.volume;
        }
        return 1;
      };

      const getCurrentVideoId = (): string | null => {
        try {
          const videoData = playerApi?.getVideoData?.();
          if (videoData?.video_id) return videoData.video_id;
        } catch {
          // Ignore
        }
        return getVideoIDFromURL(window.location.href);
      };

      const setCooldown = (ms: number) => {
        state = 'COOLDOWN';
        if (cooldownTimer) clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
          state = 'IDLE';
          log.info(`[State] Cooldown of ${ms}ms elapsed. State is now IDLE.`);
        }, ms);
      };

      const loadTrackAudio = async (videoId: string) => {
        const token = ++loadToken;
        log.info(`[Preload] Fetching audio stream for track: ${videoId}`);

        let url: string | null;
        try {
          url = await getStreamURL(videoId);
        } catch (err) {
          log.error(
            `[Preload] IPC error while fetching stream URL for ${videoId}:`,
            err,
          );
          return;
        }

        // If another track started while fetching, discard
        if (token !== loadToken || currentTrackId !== videoId) {
          log.info(
            `[Preload] Track changed during fetch (${videoId} -> ${currentTrackId}); discarding.`,
          );
          return;
        }

        if (!url) {
          log.warn(
            `[Preload] No audio URL returned for ${videoId}. Crossfade will be skipped for this track.`,
          );
          return;
        }

        log.info(
          `[Preload] Stream URL received for ${videoId}. Creating Howl instance...`,
        );

        if (syncedAudio) {
          syncedAudio.unload();
          syncedAudio = null;
        }

        const video = getPlayerVideo();
        // One-shot flag so the shadow audio's onend warning cannot spam.
        let endedWarned = false;

        const howl = new Howl({
          src: url,
          html5: true,
          format: ['mp4', 'webm'],
          volume: 0,
          onload: () => {
            if (token !== loadToken) {
              howl.unload();
              return;
            }
            const howlDuration = howl.duration();
            log.info(
              `[Preload] Audio loaded for ${videoId}! Duration: ${howlDuration.toFixed(1)}s`,
            );

            // Diagnostic cross-check of the three duration sources (see the
            // DURATION RESOLUTION comment in onTimeUpdate). The video element
            // only reflects the NEW track once the player switched to it, so
            // compare here only when it is already playing this track; the
            // tick loop in onTimeUpdate re-checks afterwards either way.
            const videoNow = getPlayerVideo();
            const videoDur =
              videoNow && Number.isFinite(videoNow.duration)
                ? videoNow.duration
                : null;
            let playerDur: number | null = null;
            if (typeof playerApi?.getDuration === 'function') {
              const pDur = playerApi.getDuration();
              if (Number.isFinite(pDur) && pDur > 0) playerDur = pDur;
            }
            log.debug(
              `[Preload] Duration sources for ${videoId}: audio stream=${fmtSec(howlDuration)}, video element=${fmtSec(videoDur)}, playerApi=${fmtSec(playerDur)}`,
            );
            if (
              videoDur &&
              getCurrentVideoId() === videoId &&
              Math.abs(howlDuration - videoDur) > 2
            ) {
              mismatchWarnedTrackId = videoId;
              log.warn(
                `[Preload] DURATION MISMATCH for ${videoId}: audio stream ${fmtSec(howlDuration)} vs video element ${fmtSec(videoDur)} (playerApi ${fmtSec(playerDur)}). The trigger compares the video timeline against the audio-stream duration, so the crossfade will fire early (audio shorter) or never (audio longer) on this track.`,
              );
            }

            syncedAudio = howl;
            if (video && !video.paused) {
              // NOTE: this assumes both streams share one timeline. If the
              // audio-only stream is shorter than the video stream, this seek
              // clamps near the stream's end and the shadow audio stalls.
              syncedAudio.seek(video.currentTime);
              syncedAudio.play();
              lastSeekTime = Date.now();
            }
          },
          // The shadow audio hit the end of ITS OWN stream. If the video is
          // still playing this track, the two streams have different lengths
          // — the signature of the premature/missed crossfade bug under
          // investigation.
          onend: () => {
            if (
              endedWarned ||
              token !== loadToken ||
              currentTrackId !== videoId
            ) {
              return;
            }
            const videoNow = getPlayerVideo();
            if (videoNow && !videoNow.paused) {
              endedWarned = true;
              log.warn(
                `[Sync] Shadow audio for ${videoId} reached the end of its own stream (${fmtSec(howl.duration())}) while the video is still playing at ${fmtSec(videoNow.currentTime)} / ${fmtSec(videoNow.duration)} — the audio and video streams have different lengths.`,
              );
            }
          },
          onloaderror: (_id, err) => {
            log.error(`[Preload] Howl load error for ${videoId}:`, err);
            if (syncedAudio === howl) syncedAudio = null;
            howl.unload();
          },
          onplayerror: (_id, err) => {
            log.error(`[Preload] Howl play error for ${videoId}:`, err);
            if (syncedAudio === howl) syncedAudio = null;
            howl.unload();
          },
        });
      };

      const startCrossfade = (trackDuration: number) => {
        const video = getPlayerVideo();
        if (!video) return;

        const activeTransitionToken = ++transitionToken;
        if (fadeInPollTimer) clearInterval(fadeInPollTimer);
        if (fadeInTimeoutTimer) clearTimeout(fadeInTimeoutTimer);

        state = 'TRANSITIONING';
        log.info(
          `[Transition] Crossfade started! Track: ${currentTrackId}, Time: ${video.currentTime.toFixed(1)}s / ${trackDuration.toFixed(1)}s (video element: ${video.duration.toFixed(1)}s)`,
        );

        const fadingAudio = syncedAudio;
        syncedAudio = null; // Detach so it cannot be re-triggered

        const targetVolume = getUserVolume();
        log.info(`[Transition] Target volume: ${targetVolume}`);

        // Full duration matrix at the moment of the trigger. The three sources
        // can disagree (see DURATION RESOLUTION in onTimeUpdate); this line is
        // what tells us which timeline actually armed a possibly wrong
        // transition.
        const fadingSeekRaw =
          fadingAudio && fadingAudio.state() === 'loaded'
            ? fadingAudio.seek()
            : null;
        const fadingSeek =
          typeof fadingSeekRaw === 'number' ? fadingSeekRaw : null;
        const fadingDur =
          fadingAudio && fadingAudio.state() === 'loaded'
            ? fadingAudio.duration()
            : null;
        log.info(
          `[Transition] Trigger context: chosen=${fmtSec(trackDuration)} (source: ${lastTriggerEval?.durationSource ?? 'unknown'}), video=${fmtSec(Number.isFinite(video.duration) ? video.duration : null)}, playerApi=${fmtSec(lastTriggerEval?.playerDuration ?? null)}, howl=${fmtSec(fadingDur)}@${fmtSec(fadingSeek)} (drift vs video: ${fadingSeek !== null ? fmtSec(video.currentTime - fadingSeek) : '?'}), threshold=${fmtSec(trackDuration - (this.config?.secondsBeforeEnd ?? 10))}`,
        );

        // 1. Hand off to the shadow audio, then fade it out.
        if (fadingAudio && fadingAudio.state() === 'loaded') {
          const bridgePosition = fadingAudio.seek();
          if (
            typeof bridgePosition === 'number' &&
            bridgePosition < video.currentTime
          ) {
            fadingAudio.seek(video.currentTime);
            lastSeekTime = Date.now();
            log.debug(
              `[Transition] Advanced bridge audio from ${bridgePosition.toFixed(3)}s to ${video.currentTime.toFixed(3)}s before handoff.`,
            );
          }

          const targetControllable = {
            get volume() {
              return fadingAudio.volume();
            },
            set volume(v: number) {
              fadingAudio.volume(v);
            },
          };

          // Cross-ramp the shadow up 0 → targetVolume while the video ramps
          // down (section 3), instead of raising the shadow to full volume
          // instantly and hard-muting the video. Both carry the same
          // content, so the overlap masks the residual handoff offset
          // (seek-completion latency, clock skew, encode offset) that would
          // otherwise surface as an audible gap or repeat at the swap.
          handoffAudioFader?.cancelFade();
          handoffAudioFader = new VolumeFader(targetControllable, {
            fadeScaling: this.config?.fadeScaling,
            fadeDuration: HANDOFF_CROSSFADE_MS,
          });
          log.info(
            `[Transition] Handoff cross-ramp: shadow 0 → ${targetVolume}, video → 0, over ${HANDOFF_CROSSFADE_MS}ms...`,
          );
          handoffAudioFader.fadeTo(targetVolume, () => {
            handoffAudioFader = null;
            // The shadow is now the sole audible source of the old track;
            // start its configured long fade-out.
            const fadeOutDuration = this.config?.fadeOutDuration ?? 5000;
            log.info(
              `[Transition] Fading out previous track over ${fadeOutDuration}ms...`,
            );
            fadeOutFader?.cancelFade();
            fadeOutFader = new VolumeFader(targetControllable, {
              fadeScaling: this.config?.fadeScaling,
              fadeDuration: fadeOutDuration,
            });
            fadeOutFader.fadeOut(() => {
              log.info(
                '[Transition] Previous track fade-out completed. Unloading audio.',
              );
              fadingAudio.unload();
              fadeOutFader = null;
            });
          });
        } else {
          log.warn(
            '[Transition] No preloaded Howl audio to fade out; proceeding with video transition.',
          );
          fadingAudio?.unload();
        }

        // 2. Fade in the active incoming video once it has started playing
        const fadeInDuration = this.config?.fadeInDuration ?? 5000;

        let hasFadedIn = false;
        const doFadeIn = () => {
          if (
            hasFadedIn ||
            activeTransitionToken !== transitionToken ||
            state !== 'TRANSITIONING'
          ) {
            return;
          }

          const activeVideo = getPlayerVideo();
          if (
            !activeVideo ||
            activeVideo.paused ||
            activeVideo.currentTime <= 0 ||
            (activeVideo === video && activeVideo.currentTime > 2)
          ) {
            return;
          }

          hasFadedIn = true;
          if (fadeInPollTimer) clearInterval(fadeInPollTimer);
          if (fadeInTimeoutTimer) clearTimeout(fadeInTimeoutTimer);
          fadeInPollTimer = null;
          fadeInTimeoutTimer = null;
          // The handoff ramps should be finished by now; cancel any
          // stragglers (e.g. the safety-timer advance fired before the ramp
          // callback did) so they cannot fight the fade-in.
          handoffAudioFader?.cancelFade();
          handoffAudioFader = null;
          handoffVideoFader?.cancelFade();
          handoffVideoFader = null;
          fadeInFader?.cancelFade();
          activeVideo.volume = 0;
          fadeInFader = new VolumeFader(activeVideo, {
            initialVolume: 0,
            fadeScaling: this.config?.fadeScaling,
            fadeDuration: fadeInDuration,
          });
          log.info(
            `[Transition] Fading in next track on <video> to ${targetVolume} over ${fadeInDuration}ms...`,
          );
          fadeInFader?.fadeTo(targetVolume, () => {
            log.info('[Transition] Next track fade-in completed.');
            fadeInFader = null;
            setCooldown(3000);
          });
        };

        const onVideoPlaying = () => {
          doFadeIn();
        };
        const checkPlaying = () => {
          doFadeIn();
        };
        video.addEventListener('playing', onVideoPlaying);
        video.addEventListener('timeupdate', checkPlaying);

        // The player may replace the video element during navigation, so follow it.
        fadeInPollTimer = setInterval(doFadeIn, 100);
        fadeInTimeoutTimer = setTimeout(() => {
          doFadeIn();
          if (fadeInPollTimer) clearInterval(fadeInPollTimer);
          fadeInPollTimer = null;
          fadeInTimeoutTimer = null;
          if (!hasFadedIn) {
            log.warn(
              '[Transition] 10s fade-in window elapsed without the next video ever playing; resetting state to IDLE.',
            );
            state = 'IDLE';
            const vid = getPlayerVideo();
            if (vid && vid.volume === 0) {
              vid.volume = targetVolume;
            }
          }
        }, 10000);

        // 3. Cross-ramp the video down; once it is silent, advance the player.
        let hasAdvanced = false;
        let bridgeStartTimer: ReturnType<typeof setTimeout> | null = null;
        const advanceToNextTrack = () => {
          if (hasAdvanced) return;
          hasAdvanced = true;
          if (bridgeStartTimer) clearTimeout(bridgeStartTimer);

          // Measure the audible handoff offset at the exact mute moment.
          // Positive = shadow behind the video (the listener replays that
          // much already-heard content); negative = shadow ahead (content
          // skipped). The pre-handoff snap aligned the position NUMBERS, but
          // the seek is asynchronous and both clocks kept running during the
          // dual-audio window, so this is the offset the user actually hears.
          // A near-0ms reading with an audible repeat means the culprit is
          // seek-completion latency or the static offset between the two
          // different stream encodes (invisible in position numbers).
          const shadowSeekRaw =
            fadingAudio && fadingAudio.state() === 'loaded'
              ? fadingAudio.seek()
              : null;
          const shadowPos =
            typeof shadowSeekRaw === 'number' ? shadowSeekRaw : null;
          const offsetMs =
            shadowPos !== null ? (video.currentTime - shadowPos) * 1000 : null;
          log.info(
            `[Handoff] Muting video at ${video.currentTime.toFixed(3)}s; shadow audio at ${shadowPos !== null ? shadowPos.toFixed(3) : '?'}s → offset ${offsetMs !== null ? `${offsetMs.toFixed(0)}ms ${offsetMs > 0 ? '(shadow behind: replays)' : '(shadow ahead: skips)'}` : '(no shadow audio)'}.`,
          );

          video.volume = 0;
          log.info('[Transition] Advancing to next track in player...');
          // Announce the automatic advance so that smooth-transitions (when
          // both plugins are enabled) can tell it apart from a manual skip
          // and let it through untouched — its skip fade would delay this
          // call and dip the gain while the video is already silent.
          document.dispatchEvent(new CustomEvent('crossfade:auto-advance'));
          if (typeof playerApi?.nextVideo === 'function') {
            playerApi.nextVideo();
          } else {
            document.querySelector<HTMLButtonElement>('.next-button')?.click();
          }
        };

        // Ramp the video down over the same window the shadow ramps up
        // (section 1). Advancing only after the video has gone silent
        // guarantees the old track never bleeds into the next one.
        const startVideoHandoffRamp = () => {
          if (hasAdvanced) return;
          handoffVideoFader?.cancelFade();
          handoffVideoFader = new VolumeFader(video, {
            fadeScaling: this.config?.fadeScaling,
            fadeDuration: HANDOFF_CROSSFADE_MS,
          });
          handoffVideoFader.fadeTo(0, () => {
            handoffVideoFader = null;
            advanceToNextTrack();
          });
          // Safety: if the fade callback never runs (e.g. rAF throttled in a
          // hidden window), advance anyway.
          bridgeStartTimer = setTimeout(
            advanceToNextTrack,
            HANDOFF_CROSSFADE_MS * 3,
          );
        };

        if (fadingAudio && fadingAudio.state() === 'loaded') {
          if (fadingAudio.playing()) {
            startVideoHandoffRamp();
          } else {
            // Shadow is not producing audio (e.g. stalled): keep the video
            // audible until the shadow actually starts, then cross-ramp.
            fadingAudio.once('play', startVideoHandoffRamp);
            fadingAudio.once('playerror', advanceToNextTrack);
            fadingAudio.seek(video.currentTime);
            fadingAudio.play();
            bridgeStartTimer = setTimeout(advanceToNextTrack, 1500);
          }
        } else {
          advanceToNextTrack();
        }
      };

      const onTimeUpdate = () => {
        const video = getPlayerVideo();
        if (!video) return;
        bindVideoListeners(video);

        // Keep Howl in sync and playing in background.
        // NOTE: every seek here maps the VIDEO timeline position onto the
        // audio-only stream. If the two streams have different lengths, the
        // shadow audio clamps near its end (audio shorter) or lags the video
        // (audio longer) — see DURATION RESOLUTION below.
        if (
          syncedAudio &&
          syncedAudio.state() === 'loaded' &&
          !video.paused &&
          !video.seeking
        ) {
          if (!syncedAudio.playing()) {
            syncedAudio.seek(video.currentTime);
            syncedAudio.play();
            lastSeekTime = Date.now();
          } else {
            const now = Date.now();
            // Correct small drift aggressively: the shadow plays at volume 0
            // until a handoff, so re-seeks are inaudible — but whatever
            // drift remains at handoff time is exactly what the listener
            // hears. Keep it well inside the handoff cross-ramp window.
            if (now - lastSeekTime > 1000) {
              const currentSeek = syncedAudio.seek();
              if (typeof currentSeek === 'number') {
                const drift = Math.abs(currentSeek - video.currentTime);
                if (drift > 0.4) {
                  lastSeekTime = now;
                  log.debug(
                    `[Sync] Correcting Howl audio drift (${drift.toFixed(2)}s). Seeking to ${video.currentTime.toFixed(1)}s`,
                  );
                  syncedAudio.seek(video.currentTime);
                }
              }
            }
          }
        }

        // Guard: only monitor transition if state is IDLE, playing, and not seeking
        if (state !== 'IDLE') return;
        if (video.paused || video.seeking) return;

        const currentTime = video.currentTime;
        if (!Number.isFinite(currentTime)) return;

        // ------------------------------------------------------------------
        // DURATION RESOLUTION — prime suspect for premature / missed
        // crossfades (under investigation since 2026-09-25).
        //
        // Three independent "durations" exist for the same track and they do
        // NOT have to agree:
        //   1. syncedAudio.duration() — length of the audio-only stream
        //      fetched via the backend (a DIFFERENT media stream than the one
        //      the <video> element plays).
        //   2. playerApi.getDuration() — duration reported by the player
        //      API (track metadata, usually whole seconds).
        //   3. video.duration — length of the stream the <video> element is
        //      actually playing; video.currentTime lives on THIS timeline.
        //
        // The trigger below compares video.currentTime (timeline 3) against
        // `duration`, which prefers timeline 1. Observed in the wild:
        // audio stream 219.8s vs video element 329.3s for the same videoId →
        // the crossfade fired ~110s early. The opposite mismatch (audio
        // longer than video) means the video ends before the threshold is
        // ever reached → no crossfade at all (hard cut).
        //
        // Every decision is snapshotted (lastTriggerEval), traced once per
        // second at debug level ([Monitor]), and surfaced as a one-shot
        // [Durations] warning when the sources disagree by more than 2s.
        // ------------------------------------------------------------------
        let duration = 0;
        let durationSource: DurationSource = 'unknown';
        const howlDuration =
          syncedAudio &&
          syncedAudio.state() === 'loaded' &&
          syncedAudio.duration() > 0
            ? syncedAudio.duration()
            : null;
        let playerDuration: number | null = null;
        if (typeof playerApi?.getDuration === 'function') {
          const pDur = playerApi.getDuration();
          if (Number.isFinite(pDur) && pDur > 0) playerDuration = pDur;
        }
        if (howlDuration !== null) {
          duration = howlDuration;
          durationSource = 'howl';
        } else if (playerDuration !== null) {
          duration = playerDuration;
          durationSource = 'playerApi';
        }
        if (
          duration <= 0 &&
          Number.isFinite(video.duration) &&
          video.duration > 0
        ) {
          duration = video.duration;
          durationSource = 'videoElement';
        }

        if (!Number.isFinite(duration) || duration <= 0) return;

        const secondsBeforeEnd = this.config?.secondsBeforeEnd ?? 10;

        // One-shot warning when the two streams the trigger mixes disagree on
        // length (see the comment block above).
        if (
          mismatchWarnedTrackId !== currentTrackId &&
          howlDuration !== null &&
          Number.isFinite(video.duration) &&
          Math.abs(howlDuration - video.duration) > 2
        ) {
          mismatchWarnedTrackId = currentTrackId;
          log.warn(
            `[Durations] ${currentTrackId}: audio stream=${fmtSec(howlDuration)} vs video element=${fmtSec(video.duration)} vs playerApi=${fmtSec(playerDuration)}. The trigger compares video.currentTime against the audio-stream duration, so it will fire early (audio shorter) or never (audio longer) on this track.`,
          );
        }

        const howlSeekRaw =
          syncedAudio && syncedAudio.state() === 'loaded'
            ? syncedAudio.seek()
            : null;
        const howlSeek = typeof howlSeekRaw === 'number' ? howlSeekRaw : null;
        const threshold = duration - secondsBeforeEnd;

        // Why the trigger would not fire right now, if it would not.
        let blockedBy: string | null = null;
        if (duration <= secondsBeforeEnd + 2) {
          // Track must be long enough to support crossfade
          blockedBy = `track-too-short (duration ${fmtSec(duration)} <= secondsBeforeEnd+2)`;
        } else if (currentTime < 25) {
          // Protect against YouTube's initial preloaded chunk (usually ~20-30s)
          blockedBy = 'start-protection (currentTime < 25s)';
        } else if (currentTime < secondsBeforeEnd) {
          // Must not trigger in the very beginning
          blockedBy = `start-protection (currentTime < secondsBeforeEnd=${secondsBeforeEnd}s)`;
        }

        // Forensics snapshot for [Missed Crossfade] on natural end.
        lastTriggerEval = {
          at: Date.now(),
          trackId: currentTrackId,
          currentTime,
          duration,
          durationSource,
          videoDuration: Number.isFinite(video.duration)
            ? video.duration
            : null,
          playerDuration,
          howlDuration,
          howlSeek,
          threshold,
          blockedBy,
        };

        // Once-per-second debug trace of the armed trigger evaluation.
        // Enable "Verbose" in DevTools console levels to see these.
        const traceAt = Date.now();
        if (traceAt - lastTraceAt >= 1000) {
          lastTraceAt = traceAt;
          log.debug(
            `[Monitor] t=${fmtSec(currentTime)} src=${durationSource} chosen=${fmtSec(duration)} video=${fmtSec(Number.isFinite(video.duration) ? video.duration : null)} api=${fmtSec(playerDuration)} howl=${fmtSec(howlDuration)}@${fmtSec(howlSeek)}${syncedAudio?.playing() ? '' : ' (idle)'} threshold=${fmtSec(threshold)}${blockedBy ? ` blocked=${blockedBy}` : ''}`,
          );
        }

        if (blockedBy) return;

        // Check if threshold is reached
        if (currentTime >= threshold) {
          startCrossfade(duration);
        }
      };

      const handleTrackChange = (newVideoId: string) => {
        if (!newVideoId || newVideoId === currentTrackId) return;

        log.info(
          `[Track Change] Track changed from ${currentTrackId ?? 'none'} to ${newVideoId}. Current state: ${state}`,
        );
        currentTrackId = newVideoId;
        lastSeekTime = 0;
        // Forensics state is per-track; start clean for the new track.
        lastTriggerEval = null;
        mismatchWarnedTrackId = null;

        // If manual track change while not transitioning
        if (state !== 'TRANSITIONING') {
          log.info(
            '[Track Change] Non-transition track change. Resetting state to IDLE.',
          );
          fadeInFader?.cancelFade();
          fadeOutFader?.cancelFade();
          handoffAudioFader?.cancelFade();
          handoffAudioFader = null;
          handoffVideoFader?.cancelFade();
          handoffVideoFader = null;
          if (syncedAudio) {
            syncedAudio.unload();
            syncedAudio = null;
          }
          const video = getPlayerVideo();
          if (video && video.volume === 0) {
            video.volume = getUserVolume();
          }
          state = 'IDLE';
        }

        bindVideoListeners(getPlayerVideo());

        // Preload audio for this new track for its upcoming crossfade transition
        loadTrackAudio(newVideoId);
      };

      const onVideoDataChange = (event: Event) => {
        const customEvent = event as CustomEvent<{
          name: string;
          videoData?: { videoId?: string; isUpcoming?: boolean };
        }>;
        if (customEvent.detail?.videoData?.isUpcoming) return;

        const videoId = customEvent.detail?.videoData?.videoId;
        if (videoId) {
          handleTrackChange(videoId);
        }
      };

      const onNavigate = (event: NavigateEvent) => {
        const nextVideoID = getVideoIDFromURL(event.destination?.url ?? '');
        if (nextVideoID) {
          handleTrackChange(nextVideoID);
        }
      };

      // Set up video listeners
      let currentBoundVideo: HTMLVideoElement | null = null;
      const onSeeking = () => {
        if (syncedAudio && syncedAudio.state() === 'loaded') {
          const video = getPlayerVideo();
          if (video) {
            syncedAudio.seek(video.currentTime);
            lastSeekTime = Date.now();
          }
        }
      };
      const onPause = () => {
        if (syncedAudio && syncedAudio.state() === 'loaded') {
          syncedAudio.pause();
        }
      };
      const onPlay = () => {
        if (syncedAudio && syncedAudio.state() === 'loaded') {
          const video = getPlayerVideo();
          if (video) {
            syncedAudio.seek(video.currentTime);
            lastSeekTime = Date.now();
            if (!syncedAudio.playing()) {
              syncedAudio.play();
            }
          }
        }
      };

      // Natural end of the <video>. In the intended flow the crossfade has
      // already advanced the player `secondsBeforeEnd` before the end, so an
      // `ended` while IDLE means the trigger window was missed or the track
      // was never armed. Explain with the last evaluation snapshot.
      const onEnded = () => {
        if (state !== 'IDLE') return;
        const videoEl = getPlayerVideo();
        const endedAt =
          videoEl && Number.isFinite(videoEl.currentTime)
            ? videoEl.currentTime
            : null;
        const snap = lastTriggerEval;
        if (!snap || snap.trackId !== currentTrackId) {
          log.warn(
            `[Missed Crossfade] Track ${currentTrackId ?? '?'} ended naturally at ${fmtSec(endedAt)} with no trigger evaluation on record (normal only for the last queue item).`,
          );
          return;
        }
        if (snap.blockedBy) {
          log.warn(
            `[Missed Crossfade] Track ${currentTrackId} ended naturally at ${fmtSec(endedAt)}; trigger stayed blocked: ${snap.blockedBy}. Snapshot: chosen=${fmtSec(snap.duration)} (${snap.durationSource}), video=${fmtSec(snap.videoDuration)}, playerApi=${fmtSec(snap.playerDuration)}, howl=${fmtSec(snap.howlDuration)}@${fmtSec(snap.howlSeek)}, threshold=${fmtSec(snap.threshold)}.`,
          );
          return;
        }
        const shortBy = snap.threshold - (endedAt ?? 0);
        log.warn(
          `[Missed Crossfade] Track ${currentTrackId} ended naturally at ${fmtSec(endedAt)} without reaching the threshold ${fmtSec(snap.threshold)} (${fmtSec(Math.abs(shortBy))} ${shortBy > 0 ? 'before' : 'after'} it). Snapshot: chosen=${fmtSec(snap.duration)} (${snap.durationSource}), video=${fmtSec(snap.videoDuration)}, playerApi=${fmtSec(snap.playerDuration)}, howl=${fmtSec(snap.howlDuration)}@${fmtSec(snap.howlSeek)}, threshold=${fmtSec(snap.threshold)}. ` +
            'If the video ended BEFORE its threshold, the chosen duration is longer than the video stream (audio longer than video → the crossfade can never fire for this track).',
        );
      };

      const bindVideoListeners = (v: HTMLVideoElement | null) => {
        if (!v || v === currentBoundVideo) return;
        if (currentBoundVideo) {
          currentBoundVideo.removeEventListener('timeupdate', onTimeUpdate);
          currentBoundVideo.removeEventListener('seeking', onSeeking);
          currentBoundVideo.removeEventListener('pause', onPause);
          currentBoundVideo.removeEventListener('play', onPlay);
          currentBoundVideo.removeEventListener('ended', onEnded);
        }
        currentBoundVideo = v;
        v.addEventListener('timeupdate', onTimeUpdate);
        v.addEventListener('seeking', onSeeking);
        v.addEventListener('pause', onPause);
        v.addEventListener('play', onPlay);
        v.addEventListener('ended', onEnded);
      };

      bindVideoListeners(getPlayerVideo());

      const intervalTimer = setInterval(() => {
        onTimeUpdate();
      }, 500);

      document.addEventListener('videodatachange', onVideoDataChange);
      window.navigation?.addEventListener('navigate', onNavigate);

      this.cleanup = () => {
        log.info('[Cleanup] Removing crossfade event listeners and audio.');
        clearInterval(intervalTimer);
        if (cooldownTimer) clearTimeout(cooldownTimer);
        transitionToken++;
        if (fadeInPollTimer) clearInterval(fadeInPollTimer);
        if (fadeInTimeoutTimer) clearTimeout(fadeInTimeoutTimer);
        fadeInFader?.cancelFade();
        fadeOutFader?.cancelFade();
        handoffAudioFader?.cancelFade();
        handoffVideoFader?.cancelFade();
        if (syncedAudio) {
          syncedAudio.unload();
          syncedAudio = null;
        }
        if (currentBoundVideo) {
          currentBoundVideo.removeEventListener('timeupdate', onTimeUpdate);
          currentBoundVideo.removeEventListener('seeking', onSeeking);
          currentBoundVideo.removeEventListener('pause', onPause);
          currentBoundVideo.removeEventListener('play', onPlay);
          currentBoundVideo.removeEventListener('ended', onEnded);
          if (currentBoundVideo.volume === 0) currentBoundVideo.volume = 1;
          currentBoundVideo = null;
        }
        document.removeEventListener('videodatachange', onVideoDataChange);
        window.navigation?.removeEventListener('navigate', onNavigate);
      };

      // Check initial video on startup
      const initialId = getCurrentVideoId();
      if (initialId) {
        log.info(`[Startup] Detected currently active track: ${initialId}`);
        handleTrackChange(initialId);
      }
    },
  },
});
