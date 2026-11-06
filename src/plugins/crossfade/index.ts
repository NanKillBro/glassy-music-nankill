import prompt from 'custom-electron-prompt';
import { dialog, type BrowserWindow } from 'electron';
import { Howl } from 'howler';
import {
  Innertube,
  Platform,
  UniversalCache,
  type Types,
  type YT,
  type YTMusic,
} from '\u0079\u006f\u0075\u0074\u0075\u0062\u0065i.js';

import {
  get as getRootConfig,
  setMenuOption as setRootMenuOption,
} from '@/config';
import { t } from '@/i18n';
import { getNetFetchAsFetch } from '@/plugins/utils/main';
import promptOptions from '@/providers/prompt-options';
import { createPlugin } from '@/utils';

import { CrossfadeAudioGraph, type CrossfadeRampHandle } from './audio-graph';
import { VolumeFader } from './fader';
import { Type2Engine, isQueueReadable, readNextTrack } from './handoff';

import type { PoTokenMinter } from './po-token';
import type { RendererContext } from '@/types/contexts';
import type { MusicPlayer } from '@/types/music-player';

export type CrossfadePluginConfig = {
  enabled: boolean;
  type: 1 | 2;
  fadeInDuration: number;
  fadeOutDuration: number;
  secondsBeforeEnd: number;
  fadeScaling: 'linear' | 'logarithmic' | 'equalPower' | number;
  usePoToken: boolean;
};

// Largest audio stream the type-2 preload downloads (long mixes/podcasts
// are skipped rather than held in RAM).
const MAX_AUDIO_BYTES = 40 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 60_000;

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

const AUTH_COOKIE_NAMES = new Set([
  'SID',
  'SAPISID',
  '__Secure-1PSID',
  '__Secure-3PSID',
  'LOGIN_INFO',
]);

const hasAuthCookie = (cookie?: string) =>
  (cookie ?? '').split(';').some((part) => {
    const name = part.split('=')[0]?.trim();
    return name !== undefined && AUTH_COOKIE_NAMES.has(name);
  });

let minterPromise: Promise<PoTokenMinter | null> | null = null;

export default createPlugin<
  unknown,
  unknown,
  {
    config?: CrossfadePluginConfig;
    ipc?: RendererContext<CrossfadePluginConfig>['ipc'];
    cleanup?: () => void;
    /** Guards the async graph init against a stop() landing mid-await. */
    setupGeneration: number;
  },
  CrossfadePluginConfig
>({
  name: () => t('plugins.crossfade.name'),
  description: () => t('plugins.crossfade.description'),
  restartNeeded: true,
  config: {
    enabled: false,
    /**
     * Which handoff implementation to use.
     *
     * Type 1 fades the player against a shadow copy of the current track
     * (the original behaviour; JS-timed ramps, needs background throttling
     * off). Type 2 downloads and decodes both songs and plays them from Web
     * Audio at the exact switch point, swapping the player out
     * phase-cancelled and back in sample-locked — the next song starts on
     * time regardless of how long the player takes to load it, and every
     * audible event runs on the audio clock (throttle-proof).
     *
     * @default 2
     */
    type: 2,
    /**
     * The duration of the fade in and fade out in milliseconds.
     *
     * @default 5000ms
     */
    fadeInDuration: 8000,
    /**
     * The duration of the fade in and fade out in milliseconds.
     *
     * @default 5000ms
     */
    fadeOutDuration: 8000,
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
     * @default 'linear'
     */
    fadeScaling: 'linear',
    /**
     * Opt-in stream path: mint a content-bound BotGuard PoToken for each
     * video and fetch with a bounded range. Needed on profiles that are not
     * signed in to Google; off keeps the original path.
     *
     * @default false
     */
    usePoToken: false,
  },
  async menu({ window, getConfig, refresh, setConfig }) {
    const config = await getConfig();

    const promptCrossfadeValues = async (
      win: BrowserWindow,
      options: CrossfadePluginConfig,
    ): Promise<
      Omit<CrossfadePluginConfig, 'enabled' | 'usePoToken'> | undefined
    > => {
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
            {
              label: t(
                'plugins.crossfade.prompt.options.multi-input.type.label',
              ),
              selectOptions: {
                1: t('plugins.crossfade.prompt.options.multi-input.type.1'),
                2: t('plugins.crossfade.prompt.options.multi-input.type.2'),
              },
              value: options.type,
            },
          ],
          resizable: true,
          height: 430,
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

      let type: 1 | 2 = Number(res[4]) === 2 ? 2 : 1;

      // Type 1 drives its fade with JS timers, which Chromium throttles while
      // the window is hidden/occluded when background throttling is enabled;
      // type 2 schedules every audible event on the audio clock.
      if (
        type === 1 &&
        (getRootConfig('options.backgroundThrottling') ?? false)
      ) {
        const { response } = await dialog.showMessageBox(win, {
          type: 'warning',
          title: t('plugins.crossfade.prompt.throttle-warning.title'),
          message: t('plugins.crossfade.prompt.throttle-warning.message'),
          buttons: [
            t(
              'plugins.crossfade.prompt.throttle-warning.buttons.disable-throttling',
            ),
            t(
              'plugins.crossfade.prompt.throttle-warning.buttons.switch-to-type-2',
            ),
            t('plugins.crossfade.prompt.throttle-warning.buttons.use-anyway'),
            t('plugins.crossfade.prompt.throttle-warning.buttons.cancel'),
          ],
          defaultId: 0,
          cancelId: 3,
        });
        if (response === 0) {
          setRootMenuOption('options.backgroundThrottling', false);
          dialog.showMessageBox(win, {
            type: 'info',
            title: 'Restart Required',
            message: 'A restart is required for this setting to apply.',
          });
        } else if (response === 1) {
          type = 2;
        } else if (response !== 2) {
          // Esc / window close — abort without changing anything
          return undefined;
        }
      }

      return {
        type,
        fadeInDuration: Number(res[0]),
        fadeOutDuration: Number(res[1]),
        secondsBeforeEnd: Number(res[2]),
        fadeScaling,
      };
    };

    return [
      {
        label: t('plugins.crossfade.menu.use-po-token'),
        type: 'checkbox',
        checked: config.usePoToken ?? false,
        async click(item) {
          await setConfig({ usePoToken: item.checked });
          await refresh();
        },
      },
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
    start({ getConfig, ipc, window }) {
      setupPlatformShimEval();

      let sessionAuthenticated = false;
      let warnedAboutPoTokenOff = false;
      let ytPromise: Promise<Innertube> | null = null;
      const getYt = async (): Promise<Innertube> => {
        if (!ytPromise) {
          const creation = (async () => {
            const cookie = await getCookieFromWindow(window);
            sessionAuthenticated = hasAuthCookie(cookie);
            const instance = await Innertube.create({
              cache: new UniversalCache(false),
              cookie,
              generate_session_locally: true,
              fetch: getNetFetchAsFetch(),
            });
            console.log(
              `[Crossfade Backend] Innertube ready (auth: ${sessionAuthenticated ? 'yes' : 'no'}, visitorData: ${instance.session.context.client.visitorData ? 'yes' : 'no'}).`,
            );
            return instance;
          })();
          ytPromise = creation;
          creation.catch(() => {
            if (ytPromise === creation) ytPromise = null;
          });
        }
        return ytPromise;
      };

      minterPromise = null;
      const getMinter = (): Promise<PoTokenMinter | null> => {
        if (!minterPromise) {
          minterPromise = import('./po-token')
            .then(({ createPoTokenMinter }) => createPoTokenMinter(window))
            .catch((error) => {
              console.warn(
                '[Crossfade Backend] PoToken minter unavailable:',
                error,
              );
              return null;
            });
        }
        return minterPromise;
      };

      // A content-bound PoToken only authorizes the video it was minted for,
      // so token setup + getInfo + decipher must not interleave between tracks.
      let resolveQueue: Promise<unknown> = Promise.resolve();
      const enqueueResolve = <T>(task: () => Promise<T>): Promise<T> => {
        const run = resolveQueue.then(task, task);
        resolveQueue = run.catch(() => undefined);
        return run;
      };

      const resolveAudio = async (videoID: string) => {
        const ytInstance = await getYt();
        const config = await getConfig();
        const usePoToken = config.usePoToken ?? false;
        const minter = usePoToken ? await getMinter() : null;

        return enqueueResolve(async () => {
          const poToken = usePoToken
            ? ((await minter?.mint(videoID)) ?? null)
            : null;

          if (!usePoToken && !sessionAuthenticated && !warnedAboutPoTokenOff) {
            warnedAboutPoTokenOff = true;
            console.warn(
              '[Crossfade Backend] Logged-out profile: the original stream path can fail with HTTP 403. Enable "Use PoToken" in Crossfade settings to use the new path.',
            );
          }
          if (usePoToken && !poToken && !sessionAuthenticated) {
            console.warn(
              `[Crossfade Backend] No content-bound PoToken for ${videoID} and no Google auth cookie; googlevideo will reject the stream with HTTP 403.`,
            );
          }

          if (ytInstance.session.player) {
            ytInstance.session.player.po_token = poToken ?? undefined;
          }

          let info: YTMusic.TrackInfo | YT.VideoInfo;
          try {
            info = await ytInstance.music.getInfo(
              videoID,
              poToken ? { po_token: poToken } : undefined,
            );
          } catch (error) {
            console.warn(
              `[Crossfade Backend] yt.music.getInfo failed for ${videoID}, falling back to yt.getInfo:`,
              error,
            );
            info = await ytInstance.getInfo(
              videoID,
              poToken ? { po_token: poToken } : undefined,
            );
          }

          const format = info.chooseFormat({
            type: 'audio',
            quality: 'best',
          });
          if (!format) {
            return { format: null, url: null, poToken, usePoToken };
          }

          const url = await format.decipher(ytInstance.session.player);
          return { format, url, poToken, usePoToken };
        });
      };

      ipc.handle(
        'audio-url',
        async (videoID: string): Promise<string | null> => {
          try {
            console.log(
              `[Crossfade Backend] Fetching audio URL for video: ${videoID}`,
            );
            const { format, url, poToken } = await resolveAudio(videoID);
            if (!format || !url) {
              console.warn(
                `[Crossfade Backend] No suitable audio format found for ${videoID}`,
              );
              return null;
            }
            console.log(
              `[Crossfade Backend] Successfully resolved stream URL for ${videoID} (itag: ${format.itag}, mime: ${format.mime_type}, poToken: ${poToken ? 'yes' : 'no'})`,
            );
            return url;
          } catch (error) {
            console.error(
              `[Crossfade Backend] Failed to get audio URL for ${videoID}:`,
              error,
            );
            return null;
          }
        },
      );

      // Type 2: the whole deciphered stream, for decodeAudioData. Used for
      // both the outgoing tail and the incoming head copies. Downloads are
      // serialized so prefetching never starves playback.
      let downloadQueue: Promise<unknown> = Promise.resolve();
      const downloadAudioData = async (
        videoID: string,
      ): Promise<Uint8Array | null> => {
        try {
          let { format, url, usePoToken } = await resolveAudio(videoID);
          if (
            !format ||
            !url ||
            (format.content_length ?? 0) > MAX_AUDIO_BYTES
          ) {
            console.warn(
              `[Crossfade Backend] No usable audio stream for ${videoID} (itag ${format?.itag ?? '?'}).`,
            );
            return null;
          }

          const fetchStream = async (
            streamUrl: string,
            contentLength: number | undefined,
            ranged: boolean,
          ) =>
            getNetFetchAsFetch()(streamUrl, {
              // With the new path, a plain full GET is throttled
              // (~30-50 KB/s); a bounded range returns the same bytes fast.
              headers:
                ranged && contentLength && contentLength > 0
                  ? { Range: `bytes=0-${contentLength - 1}` }
                  : undefined,
              signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
            });

          let response = await fetchStream(
            url,
            format?.content_length,
            usePoToken,
          );
          if (response.status === 403 && usePoToken) {
            console.warn(
              `[Crossfade Backend] Stream fetch for ${videoID} returned 403; refreshing PoToken and retrying once.`,
            );
            const minter = await getMinter();
            await minter?.reset();
            ({ format, url, usePoToken } = await resolveAudio(videoID));
            if (!url) return null;
            response = await fetchStream(
              url,
              format?.content_length,
              usePoToken,
            );
          }

          if (!response.ok) {
            console.warn(
              `[Crossfade Backend] Stream fetch for ${videoID} failed: HTTP ${response.status}`,
            );
            return null;
          }
          const bytes = new Uint8Array(await response.arrayBuffer());
          console.log(
            `[Crossfade Backend] Downloaded ${videoID}: ${bytes.byteLength} bytes (HTTP ${response.status}).`,
          );
          return bytes;
        } catch (error) {
          console.warn(
            `[Crossfade Backend] audio-data download failed for ${videoID}:`,
            error,
          );
          return null;
        }
      };
      ipc.handle(
        'audio-data',
        (videoID: string): Promise<Uint8Array | null> => {
          const result = downloadQueue.then(() => downloadAudioData(videoID));
          downloadQueue = result.catch(() => null);
          return result;
        },
      );
    },
    async stop({ ipc }) {
      ipc.removeHandler('audio-url');
      ipc.removeHandler('audio-data');
      const minter = minterPromise ? await minterPromise : null;
      minterPromise = null;
      await minter?.dispose();
    },
    async onConfigChange(newConfig) {
      if (newConfig.usePoToken) return;

      // The setting applies from the next resolve; drop the hidden window
      // right away so disabling the option also frees its renderer process.
      const minter = minterPromise ? await minterPromise : null;
      minterPromise = null;
      await minter?.dispose();
    },
  },

  renderer: {
    setupGeneration: 0,
    async start({ ipc, getConfig }) {
      this.config = await getConfig();
      this.ipc = ipc;
    },
    stop() {
      this.setupGeneration++;
      this.cleanup?.();
      this.cleanup = undefined;
    },
    onConfigChange(newConfig) {
      this.config = newConfig;
    },
    async onPlayerApiReady(playerApi: MusicPlayer) {
      // The graph init awaits (step-aside checks + registry seeding) can
      // resolve after a stop() cleared this.cleanup - it would then wire
      // the graph with nothing left to remove it. The generation counter
      // is bumped by every stop(), so a stale setup disposes its
      // half-built graph and bails instead (same pattern as
      // smooth-transitions).
      const generation = ++this.setupGeneration;
      const graph = new CrossfadeAudioGraph();
      try {
        await graph.init();
      } catch (err) {
        // Without a context the graph can never be claimed, so every
        // transition simply uses element mode.
        console.error(
          '[CrossfadeGraph] init failed; element mode applies',
          err,
        );
      }
      if (generation !== this.setupGeneration) {
        graph.dispose();
        return;
      }

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
      // Foreign-write guard: while a transition is in flight, these hold the
      // volume/mute state crossfade last intended for the player <video>.
      // YouTube's player re-applies its own stored volume to the element on
      // track load and on every videodatachange (base.js g.uz.setVolume via
      // its pub/sub, verified with a console tracer), so any window where
      // crossfade is not actively rewriting the element leaks the incoming
      // track at the user's full volume for tens of milliseconds. null means
      // the guard is inactive and foreign writes pass through untouched.
      let guardVolume: number | null = null;
      let guardMuted: boolean | null = null;

      // --- Investigation state (2026-09-25 premature/missed crossfade bug) ---
      // Which of the three duration sources the trigger threshold came from.
      type DurationSource =
        | 'howl'
        | 'type2'
        | 'playerApi'
        | 'videoElement'
        | 'unknown';
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

      // Type 2: decodes both songs and plays them from the shared
      // AudioContext (see handoff.ts). Falls back to type 1 whenever a
      // precondition is missing.
      const engine = new Type2Engine(
        (channel, ...args) =>
          this.ipc?.invoke(channel, ...args) as Promise<unknown>,
        log,
        graph,
      );
      const type2Enabled = () => (this.config?.type ?? 1) === 2;

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

      // VolumeFader target for the player <video> that records every volume
      // write in the guard state before applying it, so the guard knows what
      // the element should currently read.
      const videoVolumeTarget = (video: HTMLVideoElement) => ({
        get volume() {
          return video.volume;
        },
        set volume(value: number) {
          guardVolume = value;
          video.volume = value;
        },
      });

      const setCooldown = (ms: number) => {
        state = 'COOLDOWN';
        if (cooldownTimer) clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
          state = 'IDLE';
          log.info(`[State] Cooldown of ${ms}ms elapsed. State is now IDLE.`);
        }, ms);
      };

      // Aborts the current transition and restores plain playback. Used by
      // the type-2 engine's abort paths (pause, user seek, wrong song, an
      // element swap) — type 1's own paths keep their existing handling.
      const flushTransition = (reason: string) => {
        log.warn(`[Transition] Flushing crossfade: ${reason}.`);
        transitionToken++;
        if (fadeInPollTimer) {
          clearInterval(fadeInPollTimer);
          fadeInPollTimer = null;
        }
        if (fadeInTimeoutTimer) {
          clearTimeout(fadeInTimeoutTimer);
          fadeInTimeoutTimer = null;
        }
        fadeInFader?.cancelFade();
        fadeInFader = null;
        fadeOutFader?.cancelFade();
        fadeOutFader = null;
        handoffAudioFader?.cancelFade();
        handoffAudioFader = null;
        handoffVideoFader?.cancelFade();
        handoffVideoFader = null;
        if (engine.active) engine.abort();
        if (syncedAudio) {
          syncedAudio.unload();
          syncedAudio = null;
        }
        guardVolume = null;
        guardMuted = null;
        graph.rampTo(1, 150);
        graph.setTransitionActive(false);
        const vid = getPlayerVideo();
        if (vid) {
          vid.muted = false;
          if (vid.volume < 0.001) vid.volume = getUserVolume();
        }
        setCooldown(1500);
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

      // --- Type 2 preloading -------------------------------------------------
      // Downloads and decodes the next track's start ahead of the trigger,
      // and measures the player offset from its audio while it is clearly
      // audible (see handoff.ts).
      const PRELOAD_LEAD_S = 45;
      let preloadingId: string | null = null;
      let preloadFailedId: string | null = null;
      let preloadFailedAt = 0;
      let queueEndSkipLogged = false;
      const maybePreloadNext = (duration: number, currentTime: number) => {
        if (!engine.available()) return;
        const remaining = duration - currentTime;
        const lead = Math.max(
          PRELOAD_LEAD_S,
          (this.config?.secondsBeforeEnd ?? 10) + 10,
        );
        if (remaining > lead || remaining <= 0) return;

        const video = getPlayerVideo();
        if (video && currentTrackId && !video.paused && !video.seeking) {
          engine.maybeMeasure(currentTrackId, video);
        }

        const next = readNextTrack(currentTrackId);
        const nextId =
          next && next.videoId !== currentTrackId ? next.videoId : null;

        if (preloadingId || !nextId) return;
        if (engine.hasCopy(nextId)) return;
        if (
          preloadFailedId === nextId &&
          Date.now() - preloadFailedAt < 30_000
        ) {
          return;
        }
        preloadingId = nextId;
        log.info(`[Type2] Preloading next track ${nextId}...`);
        engine.preloadNext(nextId).then((ok) => {
          if (preloadingId === nextId) preloadingId = null;
          if (!ok) {
            preloadFailedId = nextId;
            preloadFailedAt = Date.now();
          }
          log.info(`[Type2] Preload ${ok ? 'ready' : 'failed'} for ${nextId}.`);
        });
      };

      const startCrossfade = (trackDuration: number) => {
        const video = getPlayerVideo();
        if (!video) return;

        const activeTransitionToken = ++transitionToken;
        if (fadeInPollTimer) clearInterval(fadeInPollTimer);
        if (fadeInTimeoutTimer) clearTimeout(fadeInTimeoutTimer);

        state = 'TRANSITIONING';

        // Claim the shared Web Audio line for this transition. In graph
        // mode all video-side fade control happens on a crossfade-owned
        // GainNode enforced by the audio rendering thread: YouTube's own
        // element volume writes (g.uz.setVolume on track load and on every
        // videodatachange) multiply into the gain and stay inaudible while
        // it is held at 0, with no reactive guard left to race CPU
        // throttling. When the line cannot be claimed (conflicting plugin,
        // capture failure) the element-mode defenses below carry the
        // transition instead.
        let useGraph = graph.claim(video);
        graph.setTransitionActive(useGraph);

        log.info(
          `[Transition] Crossfade started (${useGraph ? 'graph' : 'element'} mode)! Track: ${currentTrackId}, Time: ${video.currentTime.toFixed(1)}s / ${trackDuration.toFixed(1)}s (video element: ${video.duration.toFixed(1)}s)`,
        );

        if (useGraph) {
          log.info(
            '[Graph] Video audio line claimed; element volume/mute guard stays disarmed for this transition.',
          );
        } else {
          // Take ownership of the element's volume/mute state from here on:
          // the guard reverts any foreign write back to what crossfade last
          // intended, until the transition finishes or is aborted.
          guardVolume = video.volume;
          guardMuted = video.muted;
        }

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

        const fadeInDuration = this.config?.fadeInDuration ?? 5000;

        // --- Type 2: precise, decoded handoff ----------------------------
        // Both songs play from the shared AudioContext; the player is
        // swapped out phase-cancelled and back in sample-locked (see
        // handoff.ts). Only engaged when the queue's next track and both
        // decoded copies are actually available.
        let type2Started = false;
        if (type2Enabled() && engine.available()) {
          const next = readNextTrack(currentTrackId);
          const expectedNextId =
            next && next.repeatMode !== 'ONE' && next.videoId !== currentTrackId
              ? next.videoId
              : null;
          if (expectedNextId) {
            type2Started = engine.begin({
              currentTrackId: currentTrackId ?? '',
              expectedNextId,
              video,
              duration: trackDuration,
              peak: video.muted ? 0 : Math.min(Math.max(video.volume, 0), 1),
              fadeInMs: fadeInDuration,
              fadeOutMs: this.config?.fadeOutDuration ?? 5000,
              fadeScaling: this.config?.fadeScaling ?? 'linear',
              useGraph,
              setPlayerVolume: (v: number) => {
                const el = getPlayerVideo();
                if (el) videoVolumeTarget(el).volume = v;
              },
              setPlayerVolumeTarget: () =>
                videoVolumeTarget(getPlayerVideo() ?? video),
              getPlayerVideo,
              getCurrentVideoId,
              onAdvance: () => {
                // The engine already silenced the player; only the track
                // change itself is left (same announcement as type 1, so
                // smooth-transitions lets it through untouched).
                document.dispatchEvent(
                  new CustomEvent('crossfade:auto-advance'),
                );
                if (typeof playerApi?.nextVideo === 'function') {
                  playerApi.nextVideo();
                } else {
                  document
                    .querySelector<HTMLButtonElement>('.next-button')
                    ?.click();
                }
              },
              onHandoverDone: () => {
                log.info('[Type2] Hand-over completed.');
                if (fadeInPollTimer) {
                  clearInterval(fadeInPollTimer);
                  fadeInPollTimer = null;
                }
                if (fadeInTimeoutTimer) {
                  clearTimeout(fadeInTimeoutTimer);
                  fadeInTimeoutTimer = null;
                }
                fadeInFader?.cancelFade();
                fadeInFader = null;
                handoffAudioFader?.cancelFade();
                handoffAudioFader = null;
                handoffVideoFader?.cancelFade();
                handoffVideoFader = null;
                guardVolume = null;
                guardMuted = null;
                graph.setTransitionActive(false);
                setCooldown(3000);
              },
            });
            if (type2Started) {
              // The decoded copies carry the audio; the Howl shadow is
              // not needed for this transition.
              fadingAudio?.unload();
              log.info(
                '[Type2] Precise handoff engaged; Howl shadow unloaded for this transition.',
              );
            } else {
              log.info(
                '[Type2] Engine refused the handoff (copies/correlation unavailable); using type 1.',
              );
            }
          }
        }

        // 1. Hand off to the shadow audio, then fade it out.
        if (!type2Started && fadingAudio && fadingAudio.state() === 'loaded') {
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
            `[Transition] Handoff cross-ramp: shadow 0 → ${targetVolume}, ${useGraph ? 'line gain' : 'video'} → 0, over ${HANDOFF_CROSSFADE_MS}ms...`,
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
        } else if (!type2Started) {
          log.warn(
            '[Transition] No preloaded Howl audio to fade out; proceeding with video transition.',
          );
          fadingAudio?.unload();
        }

        // 2. Fade in the active incoming video once it has started playing
        let hasFadedIn = false;
        // Graph-mode handoff ramp handle — the GainNode counterpart of
        // handoffVideoFader.
        let handoffGraphRamp: CrossfadeRampHandle | null = null;
        const doFadeIn = () => {
          if (
            hasFadedIn ||
            engine.active ||
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
          handoffGraphRamp?.cancel();
          handoffGraphRamp = null;
          fadeInFader?.cancelFade();

          if (useGraph && graph.isClaimed(activeVideo)) {
            // Graph mode: fade the line gain 0 → 1. The audible level is
            // the user's element volume × the gain curve — YouTube
            // maintains the element volume itself, so no element writes
            // and no unmute happen at all.
            log.info(
              `[Graph] Fading in next track on the audio line (gain → 1) over ${fadeInDuration}ms...`,
            );
            const ramp = graph.rampTo(
              1,
              fadeInDuration,
              this.config?.fadeScaling,
              () => {
                log.info('[Graph] Next track fade-in completed.');
                setCooldown(3000);
                graph.setTransitionActive(false);
              },
            );
            if (ramp) return;
            // Scheduling failed: finish this transition in element mode.
            log.warn(
              '[Graph] Fade-in ramp could not be scheduled; falling back to element mode.',
            );
            useGraph = false;
          } else if (useGraph) {
            // The graph lost this element (replaced without the claim
            // having been migrated yet): element mode takes over.
            useGraph = false;
          }

          const videoTarget = videoVolumeTarget(activeVideo);
          videoTarget.volume = 0;
          // Unmute only now, with the element pinned at 0: the mute armed at
          // the advance kept every foreign volume re-apply during the track
          // load silent, and the fade-in brings the track up from zero.
          guardMuted = false;
          activeVideo.muted = false;
          fadeInFader = new VolumeFader(videoTarget, {
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
            guardVolume = null;
            guardMuted = null;
            setCooldown(3000);
          });
        };

        // The graph detected the player <video> being replaced mid-flight
        // and hands us the old claim's current gain so the transition can
        // continue exactly where it was (see CrossfadeAudioGraph.onSwap).
        graph.onSwap((newVideo, previousGain) => {
          if (engine.active) {
            // The decoded copies are aligned to the old element; a swap
            // mid-handoff is not worth carrying across.
            flushTransition('player <video> was replaced mid-handoff');
            return;
          }
          if (!useGraph) {
            // Already fell back to element mode; it owns the element.
            return;
          }
          const wasRamping = graph.isRamping();
          if (graph.claim(newVideo)) {
            graph.snapTo(previousGain);
            log.info(
              `[Graph] Video element swapped mid-transition; claim migrated, line held at gain ${previousGain.toFixed(3)}.`,
            );
            if (wasRamping && hasFadedIn) {
              // The fade-in was interrupted mid-ramp: reset the flag and
              // re-arm the 100ms poll (doFadeIn clears it once started) so
              // the remaining ramp resumes from the held value on the new
              // claim.
              hasFadedIn = false;
              if (fadeInPollTimer) clearInterval(fadeInPollTimer);
              fadeInPollTimer = setInterval(doFadeIn, 100);
              log.info(
                '[Graph] Fade-in was mid-ramp; re-armed the fade-in poll to resume it on the new claim.',
              );
            }
          } else {
            // Re-claim failed: finish this transition in element mode,
            // with the new element muted and the guard armed — the same
            // defensive state advanceToNextTrack would have set.
            useGraph = false;
            guardVolume = 0;
            guardMuted = true;
            newVideo.volume = 0;
            newVideo.muted = true;
            log.warn(
              '[Graph] Re-claim after element swap failed; finishing this transition in element mode (element muted, guard armed).',
            );
          }
        });

        // Runs the incoming phase: the type-2 engine (alignment + hand-over)
        // when it owns the transition, the plain fade-in otherwise.
        const advanceIncoming = () => {
          if (engine.active) {
            const owned = engine.onIncomingTick();
            if (engine.handoverStarted) hasFadedIn = true;
            if (!owned) doFadeIn();
            return;
          }
          doFadeIn();
        };
        video.addEventListener('playing', advanceIncoming);
        video.addEventListener('timeupdate', advanceIncoming);

        // The player may replace the video element during navigation, so follow it.
        fadeInPollTimer = setInterval(advanceIncoming, 100);
        fadeInTimeoutTimer = setTimeout(() => {
          doFadeIn();
          if (fadeInPollTimer) clearInterval(fadeInPollTimer);
          fadeInPollTimer = null;
          fadeInTimeoutTimer = null;
          if (!hasFadedIn) {
            if (engine.active) {
              log.warn(
                '[Type2] Hand-over did not start within the fade-in window; aborting the decoded copies.',
              );
              engine.abort();
            }
            log.warn(
              '[Transition] 10s fade-in window elapsed without the next video ever playing; resetting state to IDLE.',
            );
            state = 'IDLE';
            guardVolume = null;
            guardMuted = null;
            if (useGraph) {
              // Restore the line to rest (gain 1). The element itself was
              // never muted or zeroed in graph mode, so there is nothing
              // to restore on it.
              graph.snapTo(1);
              graph.setTransitionActive(false);
            }
            const vid = getPlayerVideo();
            if (!useGraph && vid) {
              vid.muted = false;
              if (vid.volume === 0) {
                vid.volume = targetVolume;
              }
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

          if (useGraph) {
            // Graph mode: the audio line replaces the element mute. The
            // handoff ramp (or this snap, for the paths that advance
            // without one — no shadow audio, shadow play error, bridge
            // timeout) holds the line at gain 0, so every volume write
            // YouTube applies to the element during the load window
            // multiplies into 0 and stays silent; doFadeIn ramps the
            // gain back up.
            if (graph.currentValue() > 0.001) {
              graph.snapTo(0);
            }
            log.info(
              '[Graph] Advancing to next track in player (audio line held at gain 0 until fade-in starts)...',
            );
          } else {
            // Mute in addition to zeroing: YouTube re-applies its stored
            // volume to the element while the next track loads (observed
            // before the incoming track even starts). A muted element is
            // immune to those writes; doFadeIn unmutes it pinned at 0.
            guardVolume = 0;
            guardMuted = true;
            video.volume = 0;
            video.muted = true;
            log.info(
              '[Transition] Advancing to next track in player (video muted until fade-in starts)...',
            );
          }
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
          if (useGraph) {
            handoffGraphRamp?.cancel();
            handoffGraphRamp = graph.rampTo(
              0,
              HANDOFF_CROSSFADE_MS,
              this.config?.fadeScaling,
              () => {
                handoffGraphRamp = null;
                advanceToNextTrack();
              },
            );
            if (handoffGraphRamp) {
              log.info(
                `[Graph] Handoff ramp on the audio line: gain → 0 over ${HANDOFF_CROSSFADE_MS}ms...`,
              );
            } else {
              // The GainNode curve is the whole throttle-proof point of
              // graph mode; without it this handoff has no protection
              // left, so finish the transition via the element path.
              log.warn(
                '[Graph] Handoff ramp could not be scheduled; falling back to the element-mode handoff.',
              );
              useGraph = false;
            }
          }
          if (!useGraph) {
            handoffVideoFader?.cancelFade();
            handoffVideoFader = new VolumeFader(videoVolumeTarget(video), {
              fadeScaling: this.config?.fadeScaling,
              fadeDuration: HANDOFF_CROSSFADE_MS,
            });
            handoffVideoFader.fadeTo(0, () => {
              handoffVideoFader = null;
              advanceToNextTrack();
            });
          }
          // Safety: if the fade callback never runs (e.g. rAF throttled in a
          // hidden window), advance anyway. In graph mode the gain curve
          // itself is enforced by the audio thread and stays on schedule,
          // but this advance call is still plain JS and needs the backup.
          bridgeStartTimer = setTimeout(
            advanceToNextTrack,
            HANDOFF_CROSSFADE_MS * 3,
          );
        };

        if (type2Started) {
          log.info(
            '[Type2] Outgoing copy scheduled; the engine advances the silent player.',
          );
        } else if (fadingAudio && fadingAudio.state() === 'loaded') {
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
        const type2Duration = type2Enabled()
          ? engine.cachedDuration(currentTrackId ?? '')
          : null;
        if (howlDuration !== null) {
          duration = howlDuration;
          durationSource = 'howl';
        } else if (type2Duration !== null) {
          // Type 2 decoded the same audio-only stream family the Howl used;
          // its own length is the honest end of the song (the video element
          // can run tens of seconds longer on some tracks).
          duration = type2Duration;
          durationSource = 'type2';
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

        // Type 2: arm the next-track decode and the position measurement
        // ahead of the trigger.
        if (type2Enabled()) maybePreloadNext(duration, currentTime);

        // Check if threshold is reached
        if (currentTime >= threshold) {
          if (type2Enabled()) {
            // With no next track (queue end, autoplay off) or repeat-one,
            // advancing early would cut the song short — let it play out /
            // restart naturally instead of crossfading into nothing.
            const next = readNextTrack(currentTrackId);
            if (
              isQueueReadable() &&
              (!next ||
                next.repeatMode === 'ONE' ||
                next.videoId === currentTrackId)
            ) {
              if (!queueEndSkipLogged) {
                queueEndSkipLogged = true;
                log.info(
                  `[Type2] No next track to hand off to (${next ? 'repeat-one' : 'queue end'}); letting the song play out.`,
                );
              }
              return;
            }
          }
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
        queueEndSkipLogged = false;
        // Forensics state is per-track; start clean for the new track.
        lastTriggerEval = null;
        mismatchWarnedTrackId = null;

        // If manual track change while not transitioning
        if (state !== 'TRANSITIONING') {
          log.info(
            '[Track Change] Non-transition track change. Resetting state to IDLE.',
          );
          if (engine.active) engine.abort();
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
          guardVolume = null;
          guardMuted = null;
          if (video) {
            video.muted = false;
            if (video.volume === 0) {
              video.volume = getUserVolume();
            }
          }
          // Graph abort: a manual skip can interrupt a transition whose
          // gain is still down, so ease the line back to rest over ~150ms
          // (audio resumes at full level, no silence) and close the
          // transition window. A no-op when the graph is unclaimed.
          graph.rampTo(1, 150);
          graph.setTransitionActive(false);
          state = 'IDLE';
        } else if (engine.active && newVideoId !== engine.expectedNextId) {
          // The player brought in a different song than the decoded copy
          // plays (queue changed under the advance): the precise handoff is
          // impossible.
          flushTransition(
            `player brought ${newVideoId} instead of ${engine.expectedNextId ?? '?'}`,
          );
        }

        bindVideoListeners(getPlayerVideo());

        // Type 2 owns the track: the decoded copy replaces the Howl shadow
        // (no audio-url fetch, no shadow sync). The Howl only comes back as
        // a lazy backup from maybePreloadNext when copies fall behind.
        if (type2Enabled() && engine.available()) {
          engine.ensureCurrent(newVideoId).then((ok) => {
            log.info(
              `[Type2] Copy ${ok ? 'ready' : 'unavailable'} for ${newVideoId}.`,
            );
          });
        } else {
          // Preload audio for this new track for its upcoming crossfade transition
          loadTrackAudio(newVideoId);
        }
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
        if (engine.active) {
          // NEVER flush on 'seeking': the engine's own alignment seeks can
          // legally interleave seeked/seeking events, and YouTube re-scrubs
          // the element after a track load. User intent is detected on the
          // player bar (onUserSeekIntent below), not here.
          if (engine.advanced && !engine.handoverStarted && !engine.ownsSeek) {
            engine.realign();
          }
          return;
        }
        if (syncedAudio && syncedAudio.state() === 'loaded') {
          const video = getPlayerVideo();
          if (video) {
            syncedAudio.seek(video.currentTime);
            lastSeekTime = Date.now();
          }
        }
      };
      const onPause = () => {
        if (engine.active && !engine.advanced) {
          // Paused before the player was swapped out: abandon the copies
          // and let normal playback continue when it resumes. (After the
          // advance, load-related pauses are tolerated and a persistent
          // user pause is caught by the engine's own watchdog.)
          flushTransition('player paused before the swap');
          return;
        }
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

      // Reverts foreign volume/muted writes on the player <video> while the
      // guard is armed (guard state non-null). YouTube re-applies its stored
      // volume on track load and on videodatachange, which would otherwise
      // surface as a brief full-volume blast of the incoming track — both
      // before the fade-in starts and mid-fade. Crossfade's own writes
      // always match the guard (they update it first), so this only fires
      // for foreign writes; user volume changes made during a transition
      // are also treated as foreign and deferred, as the fade already does.
      const onVolumeChange = () => {
        if (guardVolume === null) return;
        const video = getPlayerVideo();
        if (!video) return;
        if (Math.abs(video.volume - guardVolume) > 0.001) {
          log.info(
            `[Guard] Foreign video volume write reverted: ${video.volume.toFixed(3)} -> ${guardVolume.toFixed(3)} at t=${video.currentTime.toFixed(2)}s (hidden=${document.hidden}).`,
          );
          video.volume = guardVolume;
        }
        if (guardMuted !== null && video.muted !== guardMuted) {
          log.info(
            `[Guard] Foreign video mute write reverted: muted ${video.muted} -> ${guardMuted} at t=${video.currentTime.toFixed(2)}s (hidden=${document.hidden}).`,
          );
          video.muted = guardMuted;
        }
      };

      const bindVideoListeners = (v: HTMLVideoElement | null) => {
        if (!v || v === currentBoundVideo) return;
        if (currentBoundVideo) {
          currentBoundVideo.removeEventListener('timeupdate', onTimeUpdate);
          currentBoundVideo.removeEventListener('seeking', onSeeking);
          currentBoundVideo.removeEventListener('pause', onPause);
          currentBoundVideo.removeEventListener('play', onPlay);
          currentBoundVideo.removeEventListener('ended', onEnded);
          currentBoundVideo.removeEventListener('volumechange', onVolumeChange);
        }
        currentBoundVideo = v;
        v.addEventListener('timeupdate', onTimeUpdate);
        v.addEventListener('seeking', onSeeking);
        v.addEventListener('pause', onPause);
        v.addEventListener('play', onPlay);
        v.addEventListener('ended', onEnded);
        v.addEventListener('volumechange', onVolumeChange);
      };

      bindVideoListeners(getPlayerVideo());

      const intervalTimer = setInterval(() => {
        onTimeUpdate();
      }, 500);

      // A pointerdown on the player bar is a user seek intent: while a
      // type-2 transition is in flight the decoded copies cannot follow an
      // arbitrary scrub, so the transition is flushed (same philosophy as
      // automix's input-based cancel).
      const onUserSeekIntent = (event: PointerEvent) => {
        if (!engine.active) return;
        const target = event.target as Element | null;
        if (target?.closest?.('ytmusic-player-bar')) {
          flushTransition('user seek (player bar)');
        }
      };
      document.addEventListener('pointerdown', onUserSeekIntent, true);

      document.addEventListener('videodatachange', onVideoDataChange);
      window.navigation?.addEventListener('navigate', onNavigate);

      this.cleanup = () => {
        log.info('[Cleanup] Removing crossfade event listeners and audio.');
        // Type-2 copies play outside the player's line, so nothing else
        // here can silence them.
        engine.dispose();
        // Graph next: gain back to 1 and the line node removed before any
        // listener teardown, so audio can never stay stuck silent.
        graph.dispose();
        // Whether the element is currently under element-mode control at
        // this moment (guard armed) — only then do the element restores
        // below have anything to undo. In graph mode the element was never
        // muted or zeroed by crossfade.
        const elementWasGuarded = guardVolume !== null || guardMuted !== null;
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
        guardVolume = null;
        guardMuted = null;
        if (currentBoundVideo) {
          currentBoundVideo.removeEventListener('timeupdate', onTimeUpdate);
          currentBoundVideo.removeEventListener('seeking', onSeeking);
          currentBoundVideo.removeEventListener('pause', onPause);
          currentBoundVideo.removeEventListener('play', onPlay);
          currentBoundVideo.removeEventListener('ended', onEnded);
          currentBoundVideo.removeEventListener('volumechange', onVolumeChange);
          if (elementWasGuarded) {
            currentBoundVideo.muted = false;
            if (currentBoundVideo.volume === 0) currentBoundVideo.volume = 1;
          }
          currentBoundVideo = null;
        }
        document.removeEventListener('pointerdown', onUserSeekIntent, true);
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
