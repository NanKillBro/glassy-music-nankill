var e, t;
('function' == typeof (e = globalThis.define) && ((t = e), (e = null)),
  (function (t, r, a, i, s) {
    var n =
        'undefined' != typeof globalThis
          ? globalThis
          : 'undefined' != typeof self
            ? self
            : 'undefined' != typeof window
              ? window
              : 'undefined' != typeof global
                ? global
                : {},
      o = 'function' == typeof n[i] && n[i],
      l = o.cache || {},
      u =
        'undefined' != typeof module &&
        'function' == typeof module.require &&
        module.require.bind(module);
    function g(e, r) {
      if (!l[e]) {
        if (!t[e]) {
          var a = 'function' == typeof n[i] && n[i];
          if (!r && a) return a(e, !0);
          if (o) return o(e, !0);
          if (u && 'string' == typeof e) return u(e);
          var s = Error("Cannot find module '" + e + "'");
          throw ((s.code = 'MODULE_NOT_FOUND'), s);
        }
        ((c.resolve = function (r) {
          var a = t[e][1][r];
          return null != a ? a : r;
        }),
          (c.cache = {}));
        var m = (l[e] = new g.Module(e));
        t[e][0].call(m.exports, c, m, m.exports, this);
      }
      return l[e].exports;
      function c(e) {
        var t = c.resolve(e);
        return !1 === t ? {} : g(t);
      }
    }
    ((g.isParcelRequire = !0),
      (g.Module = function (e) {
        ((this.id = e), (this.bundle = g), (this.exports = {}));
      }),
      (g.modules = t),
      (g.cache = l),
      (g.parent = o),
      (g.register = function (e, r) {
        t[e] = [
          function (e, t) {
            t.exports = r;
          },
          {},
        ];
      }),
      Object.defineProperty(g, 'root', {
        get: function () {
          return n[i];
        },
      }),
      (n[i] = g));
    for (var m = 0; m < r.length; m++) g(r[m]);
    if (a) {
      var c = g(a);
      'object' == typeof exports && 'undefined' != typeof module
        ? (module.exports = c)
        : 'function' == typeof e && e.amd
          ? e(function () {
              return c;
            })
          : s && (this[s] = c);
    }
  })(
    {
      '5VIml': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r), a.export(r, 'config', () => g));
          var i = e('../shared/utils/logger'),
            s = e('./lib/audioAnalysis'),
            n = e('./lib/gradientController'),
            o = e('./lib/kawarpManager'),
            l = e('./lib/messageHandler'),
            u = e('./lib/navigationManager');
          let g = { matches: ['https://music.youtube.com/*'], all_frames: !1 },
            m = async () => {
              let e = await n.initializeSettings();
              ((0, i.logger).log('Better Lyrics Shaders: Initializing...'),
                (0, i.logger).log('Loaded settings:', e),
                (0, i.logger).log('Effects enabled:', e.enabled),
                o.cleanupOrphanedKawarps(),
                l.setupMessageListener({
                  onSettingsUpdate: n.updateGradientSettings,
                  getCurrentData: () => {
                    let e = l.getSongInfo();
                    return {
                      songTitle: e.title,
                      songAuthor: e.author,
                      gradientSettings: n.getSettings(),
                    };
                  },
                }),
                s.initializeAudioAnalysis(),
                setTimeout(async () => {
                  await n.checkAndUpdateGradient();
                  for (let e = 10; e > 0; e--) {
                    if (n.hasActiveEffect()) {
                      (0, i.logger).log('Effect initialized, stopping retry');
                      break;
                    }
                    ((0, i.logger).log(
                      `Effect not ready yet, retrying... (${e} retries left)`,
                    ),
                      await new Promise((e) => setTimeout(e, 500)),
                      await n.checkAndUpdateGradient(),
                      1 === e && (0, i.logger).log('Max retries reached'));
                  }
                  (n.startAudioIfEnabled(),
                    u.initialize(n.checkAndUpdateGradient));
                }, 0));
            };
          (window.addEventListener('beforeunload', () => {
            (u.cleanup(), n.cleanup());
          }),
            'loading' === document.readyState
              ? document.addEventListener('DOMContentLoaded', m)
              : m());
        },
        {
          '../shared/utils/logger': '4b2II',
          './lib/audioAnalysis': '5x9EN',
          './lib/gradientController': 'fIZjQ',
          './lib/kawarpManager': '3bNxI',
          './lib/messageHandler': '2fzSB',
          './lib/navigationManager': 'gW2L7',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
      '4b2II': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r), a.export(r, 'logger', () => n));
          let i = '[BLS]',
            s = !0,
            n = {
              log: (...e) => {
                s && console.log(i, ...e);
              },
              info: (...e) => {
                s && console.info(i, ...e);
              },
              warn: (...e) => {
                s && console.warn(i, ...e);
              },
              error: (...e) => {
                console.error(i, ...e);
              },
              setEnabled: (e) => {
                s = e;
              },
              isEnabled: () => s,
            };
        },
        { '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2' },
      ],
      'fRZO2': [
        function (e, t, r) {
          ((r.interopDefault = function (e) {
            return e && e.__esModule ? e : { default: e };
          }),
            (r.defineInteropFlag = function (e) {
              Object.defineProperty(e, '__esModule', { value: !0 });
            }),
            (r.exportAll = function (e, t) {
              return (
                Object.keys(e).forEach(function (r) {
                  'default' === r ||
                    '__esModule' === r ||
                    t.hasOwnProperty(r) ||
                    Object.defineProperty(t, r, {
                      enumerable: !0,
                      get: function () {
                        return e[r];
                      },
                    });
                }),
                t
              );
            }),
            (r.export = function (e, t, r) {
              Object.defineProperty(e, t, { enumerable: !0, get: r });
            }));
        },
        {},
      ],
      '5x9EN': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r),
            a.export(r, 'initializeAudioAnalysis', () => g),
            a.export(r, 'startAudioAnalysis', () => c),
            a.export(r, 'stopAudioAnalysis', () => d),
            a.export(r, 'checkAndReconnectElement', () => h),
            a.export(r, 'isAudioInitialized', () => f),
            a.export(r, 'setPlaybackStateCallback', () => A),
            a.export(r, 'isPlaying', () => x));
          var i = e('../../shared/utils/logger');
          let s = new WeakSet(),
            n = {
              context: null,
              analyser: null,
              source: null,
              element: null,
              rafId: null,
              isInitialized: !1,
              dataArray: null,
              lastAnalysisTime: 0,
              initTimeoutId: null,
              resumeContextHandler: null,
              playHandler: null,
              pauseHandler: null,
              onPlaybackStateChange: null,
            },
            o = { speedMultiplier: 1, scaleMultiplier: 1 },
            l = (e) => {
              (n.playHandler && e.removeEventListener('play', n.playHandler),
                n.pauseHandler &&
                  e.removeEventListener('pause', n.pauseHandler));
            },
            u = (e) => {
              ((n.playHandler = () => {
                n.onPlaybackStateChange && n.onPlaybackStateChange(!0);
              }),
                (n.pauseHandler = () => {
                  n.onPlaybackStateChange && n.onPlaybackStateChange(!1);
                }),
                e.addEventListener('play', n.playHandler),
                e.addEventListener('pause', n.pauseHandler));
            },
            g = async () => {
              if (!n.isInitialized)
                try {
                  if (
                    ((n.element = document.querySelector('audio, video')),
                    !n.element)
                  ) {
                    n.initTimeoutId = window.setTimeout(g, 1e3);
                    return;
                  }
                  ((n.initTimeoutId = null),
                    (n.context = new (
                      window.AudioContext || window.webkitAudioContext
                    )()),
                    'suspended' === n.context.state &&
                      (n.resumeContextHandler &&
                        (document.removeEventListener(
                          'click',
                          n.resumeContextHandler,
                        ),
                        document.removeEventListener(
                          'keydown',
                          n.resumeContextHandler,
                        )),
                      (n.resumeContextHandler = async () => {
                        (n.context &&
                          'suspended' === n.context.state &&
                          (await n.context.resume()),
                          n.resumeContextHandler &&
                            (document.removeEventListener(
                              'click',
                              n.resumeContextHandler,
                            ),
                            document.removeEventListener(
                              'keydown',
                              n.resumeContextHandler,
                            ),
                            (n.resumeContextHandler = null)));
                      }),
                      document.addEventListener(
                        'click',
                        n.resumeContextHandler,
                      ),
                      document.addEventListener(
                        'keydown',
                        n.resumeContextHandler,
                      )),
                    (n.analyser = n.context.createAnalyser()),
                    (n.analyser.fftSize = 1024),
                    (n.analyser.smoothingTimeConstant = 0.8));
                  let e = n.analyser.frequencyBinCount;
                  ((n.dataArray = new Uint8Array(new ArrayBuffer(e))),
                    (n.source = n.context.createMediaElementSource(n.element)),
                    n.source.connect(n.analyser),
                    n.source.connect(n.context.destination),
                    s.add(n.element),
                    u(n.element),
                    (n.isInitialized = !0),
                    (0, i.logger).log(
                      'Audio analysis initialized (passthrough mode)',
                    ));
                } catch (e) {
                  (0, i.logger).error('Error initializing audio analysis:', e);
                }
            },
            m = (e, t, r) => {
              if (!n.analyser || !n.dataArray || !n.element) {
                n.rafId = null;
                return;
              }
              if (r - n.lastAnalysisTime >= 100) {
                n.analyser.getByteTimeDomainData(n.dataArray);
                let a = n.element.volume,
                  i = a > 0.005 ? 1 / a : 1,
                  s = 0,
                  l = n.dataArray.length,
                  u = e.audioBeatThreshold;
                for (let e = 0; e < l; e++) {
                  let t = Math.abs(n.dataArray[e] - 128) / 128,
                    r = t * i;
                  if (r > s && (s = r) > u) break;
                }
                let g = s > u,
                  m = e.kawarpAudioScaleBoost;
                ((o.speedMultiplier =
                  e.audioResponsive && g ? e.audioSpeedMultiplier : 1),
                  (o.scaleMultiplier =
                    e.audioResponsive && g ? 1 + m / 100 : 1),
                  t(o),
                  (n.lastAnalysisTime = r));
              }
              n.rafId = requestAnimationFrame((r) => m(e, t, r));
            },
            c = (e, t) => {
              (null !== n.rafId && cancelAnimationFrame(n.rafId),
                (n.lastAnalysisTime = 0),
                (n.rafId = requestAnimationFrame((r) => m(e, t, r))));
            },
            d = () => {
              (null !== n.rafId &&
                (cancelAnimationFrame(n.rafId), (n.rafId = null)),
                null !== n.initTimeoutId &&
                  (clearTimeout(n.initTimeoutId), (n.initTimeoutId = null)),
                (n.lastAnalysisTime = 0));
            },
            p = (e) => {
              if (!n.context) return;
              if ((n.element && l(n.element), s.has(e))) {
                ((0, i.logger).log(
                  'Element already has MediaElementSource, re-adding listeners',
                ),
                  (n.element = e),
                  u(e));
                return;
              }
              ((n.analyser = n.context.createAnalyser()),
                (n.analyser.fftSize = 1024),
                (n.analyser.smoothingTimeConstant = 0.8));
              let t = n.analyser.frequencyBinCount;
              ((n.dataArray = new Uint8Array(new ArrayBuffer(t))),
                (n.source = n.context.createMediaElementSource(e)),
                n.source.connect(n.analyser),
                n.source.connect(n.context.destination),
                s.add(e),
                (n.element = e),
                u(e),
                (0, i.logger).log('Audio analysis reconnected to new element'));
            },
            h = () => {
              if (!n.isInitialized) return;
              let e = document.querySelector('audio, video');
              e && e !== n.element
                ? ((0, i.logger).log('Audio element changed, reconnecting...'),
                  p(e))
                : n.element &&
                  !document.contains(n.element) &&
                  e &&
                  ((0, i.logger).log(
                    'Old audio element detached, reconnecting to new one...',
                  ),
                  p(e));
            },
            f = () => n.isInitialized,
            A = (e) => {
              n.onPlaybackStateChange = e;
            },
            x = () => !!n.element && !n.element.paused;
        },
        {
          '../../shared/utils/logger': '4b2II',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
      'fIZjQ': [
        function (e, t, r) {
          let a;
          var i = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (i.defineInteropFlag(r),
            i.export(r, 'checkAndUpdateGradient', () => A),
            i.export(r, 'updateGradientSettings', () => x),
            i.export(r, 'initializeSettings', () => y),
            i.export(r, 'getSettings', () => b),
            i.export(r, 'getDynamicMultipliers', () => w),
            i.export(r, 'startAudioIfEnabled', () => v),
            i.export(r, 'hasActiveEffect', () => T),
            i.export(r, 'cleanup', () => E));
          var s = e('../../shared/constants/gradientSettings'),
            n = e('../../shared/utils/logger'),
            o = e('./audioAnalysis'),
            l = e('./kawarpManager'),
            u = e('./storage');
          let g = { ...s.DEFAULT_DYNAMIC_MULTIPLIERS },
            m = () => {
              let e = !!document.getElementById('player-page'),
                t = !!document.getElementById('search-page'),
                r = !!document.querySelector(
                  '.background-gradient.style-scope.ytmusic-browse-response',
                );
              return ((0, n.logger).log('getCurrentPageType check:', {
                hasPlayerPage: e,
                hasSearchPage: t,
                hasHomepageGradient: r,
              }),
              e)
                ? 'player'
                : t
                  ? 'search'
                  : r
                    ? 'homepage'
                    : 'other';
            },
            c = (e) =>
              'player' === e
                ? 'player-page'
                : 'search' === e
                  ? 'search-page'
                  : 'homepage',
            d = (e) => {
              ((g = e), l.updateKawarpSpeed(a, g));
            },
            p = (e) => {
              a.pauseOnInactive &&
                ((0, n.logger).log(
                  'Playback state changed:',
                  e ? 'playing' : 'paused',
                ),
                e ? l.resumeKawarp() : l.pauseKawarp());
            },
            h = () => {
              a.audioResponsive && o.isAudioInitialized()
                ? o.startAudioAnalysis(a, d)
                : ((g = { speedMultiplier: 1, scaleMultiplier: 1 }),
                  l.updateKawarpSpeed(a, g));
            },
            f = () => {
              (l.hasKawarp('homepage') &&
                ((0, n.logger).log('Removing homepage kawarp'),
                l.destroyKawarp('homepage')),
                l.hasKawarp('search') &&
                  ((0, n.logger).log('Removing search kawarp'),
                  l.destroyKawarp('search')));
            },
            A = async () => {
              if (!a.enabled) {
                (0, n.logger).log(
                  'Effects disabled - skipping gradient update',
                );
                return;
              }
              let e = m(),
                t = l.hasKawarp('player'),
                r = l.hasKawarp('homepage'),
                i = l.hasKawarp('search');
              if (
                ((0, n.logger).log('checkAndUpdateGradient', {
                  pageType: e,
                  hasPlayerEffect: t,
                  hasHomepageEffect: r,
                  hasSearchEffect: i,
                  showOnBrowsePages: a.showOnBrowsePages,
                }),
                'player' === e)
              )
                ((0, n.logger).log('On player page - creating/updating kawarp'),
                  t
                    ? await l.updateKawarpImage('player')
                    : await l.createKawarp(a, g, 'player-page'),
                  a.showOnBrowsePages
                    ? (r && (await l.updateKawarpImage('homepage')),
                      i && (await l.updateKawarpImage('search')),
                      r ||
                        ((0, n.logger).log('Creating homepage kawarp'),
                        await l.createKawarp(a, g, 'homepage')),
                      i ||
                        ((0, n.logger).log('Creating search kawarp'),
                        await l.createKawarp(a, g, 'search-page')))
                    : f());
              else if ('homepage' === e || 'search' === e) {
                if (a.showOnBrowsePages) {
                  let t = c(e),
                    s = 'homepage' === e ? r : i;
                  ((0, n.logger).log(`On ${e} - showOnBrowsePages enabled`, {
                    hasTargetEffect: s,
                  }),
                    s ||
                      ((0, n.logger).log(`Creating ${e} kawarp`),
                      await l.createKawarp(a, g, t)));
                } else f();
                t &&
                  ((0, n.logger).log(
                    'Not on player page - removing player effect',
                  ),
                  l.destroyKawarp('player'));
              } else
                ((0, n.logger).log('On other page - removing all effects'),
                  l.destroyKawarp());
            },
            x = async (e) => {
              let t = a.enabled,
                r = a.audioResponsive,
                i = a.showOnBrowsePages,
                s = a.pauseOnInactive,
                u =
                  a.audioSpeedMultiplier !== e.audioSpeedMultiplier ||
                  a.kawarpAudioScaleBoost !== e.kawarpAudioScaleBoost ||
                  a.audioBeatThreshold !== e.audioBeatThreshold;
              if (
                ((a = e), (0, n.logger).setEnabled(e.showLogs), t !== e.enabled)
              ) {
                e.enabled
                  ? ((0, n.logger).log('Effects enabled - reinitializing'),
                    await A(),
                    e.audioResponsive && o.startAudioAnalysis(e, d))
                  : ((0, n.logger).log(
                      'Effects disabled - destroying all kawarp instances',
                    ),
                    l.destroyKawarp(),
                    o.stopAudioAnalysis());
                return;
              }
              e.enabled &&
                ((r !== e.audioResponsive || u) && h(),
                i !== e.showOnBrowsePages && (await A()),
                s === e.pauseOnInactive ||
                  (e.pauseOnInactive && o.isAudioInitialized() && !o.isPlaying()
                    ? l.pauseKawarp()
                    : e.pauseOnInactive || l.resumeKawarp()),
                l.hasKawarp() && l.updateKawarpSettings(e, g));
            },
            y = async () => (
              (a = await u.loadGradientSettings()),
              (0, n.logger).setEnabled(a.showLogs),
              o.setPlaybackStateCallback(p),
              a
            ),
            b = () => a,
            w = () => g,
            v = () => {
              a.enabled && a.audioResponsive && o.startAudioAnalysis(a, d);
            },
            T = () => l.hasKawarp('player'),
            E = () => {
              (o.stopAudioAnalysis(), l.destroyKawarp());
            };
        },
        {
          '../../shared/constants/gradientSettings': '2tB0U',
          '../../shared/utils/logger': '4b2II',
          './audioAnalysis': '5x9EN',
          './kawarpManager': '3bNxI',
          './storage': '56Z7d',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
      '2tB0U': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r),
            a.export(r, 'DEFAULT_GRADIENT_SETTINGS', () => i),
            a.export(r, 'DEFAULT_DYNAMIC_MULTIPLIERS', () => s),
            a.export(r, 'GRADIENT_SETTINGS_STORAGE_KEY', () => n));
          let i = {
              enabled: !0,
              kawarpOpacity: 0.8,
              kawarpWarpIntensity: 1,
              kawarpBlurPasses: 8,
              kawarpAnimationSpeed: 1.5,
              kawarpTransitionDuration: 1500,
              kawarpSaturation: 2,
              kawarpDithering: 0.008,
              kawarpAudioScaleBoost: 2,
              audioResponsive: !0,
              audioSpeedMultiplier: 2,
              audioBeatThreshold: 0.8,
              pauseOnInactive: !1,
              showLogs: !0,
              showOnBrowsePages: !1,
            },
            s = { speedMultiplier: 1, scaleMultiplier: 1 },
            n = 'gradientSettings';
        },
        { '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2' },
      ],
      '3bNxI': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r),
            a.export(r, 'createKawarp', () => w),
            a.export(r, 'destroyKawarp', () => v),
            a.export(r, 'updateKawarpImage', () => E),
            a.export(r, 'updateKawarpSpeed', () => S),
            a.export(r, 'updateKawarpSettings', () => I),
            a.export(r, 'hasKawarp', () => _),
            a.export(r, 'getCurrentImageUrl', () => k),
            a.export(r, 'cleanupOrphanedKawarps', () => P),
            a.export(r, 'pauseKawarp', () => F),
            a.export(r, 'resumeKawarp', () => C));
          var i = e('@kawarp/core'),
            s = a.interopDefault(i),
            n = e('../../shared/utils/logger');
          let o = () => ({
              backdrop: null,
              container: null,
              canvas: null,
              instance: null,
              currentImageUrl: null,
              lastSettings: null,
              lastMultipliers: null,
              observer: null,
              isVisible: !0,
              isTransitioning: !1,
              pendingImageUrl: null,
              transitionTimeoutId: null,
              currentScale: 1,
              targetScale: 1,
              scaleAnimationId: null,
              currentSpeed: 1,
              targetSpeed: 1,
              speedAnimationId: null,
              isPaused: !1,
            }),
            l = async (e, t) => {
              try {
                await e.loadImage(t);
              } catch {
                let r = await fetch(t),
                  a = await r.blob(),
                  i = URL.createObjectURL(a);
                try {
                  await e.loadImage(i);
                } finally {
                  URL.revokeObjectURL(i);
                }
              }
            },
            u = (e) => {
              if (!e.instance) {
                e.scaleAnimationId = null;
                return;
              }
              let t = e.targetScale - e.currentScale;
              if (0.001 > Math.abs(t)) {
                ((e.currentScale = e.targetScale),
                  e.instance.setOptions({ scale: e.currentScale }),
                  (e.scaleAnimationId = null));
                return;
              }
              ((e.currentScale += t * (t > 0 ? 0.5 : 0.12)),
                e.instance.setOptions({ scale: e.currentScale }),
                (e.scaleAnimationId = requestAnimationFrame(() => u(e))));
            },
            g = (e) => {
              if (!e.instance) {
                e.speedAnimationId = null;
                return;
              }
              let t = e.targetSpeed - e.currentSpeed;
              if (0.001 > Math.abs(t)) {
                ((e.currentSpeed = e.targetSpeed),
                  (e.instance.animationSpeed = e.currentSpeed),
                  (e.speedAnimationId = null),
                  0 === e.currentSpeed && e.instance.stop());
                return;
              }
              ((e.currentSpeed += t * (t > 0 ? 0.05 : 0.03)),
                (e.instance.animationSpeed = e.currentSpeed),
                (e.speedAnimationId = requestAnimationFrame(() => g(e))));
            },
            m = new Map(),
            c = new Set(),
            d = null,
            p = (e) => (m.has(e) || m.set(e, o()), m.get(e)),
            h = (e, t) =>
              !!e &&
              e.kawarpWarpIntensity === t.kawarpWarpIntensity &&
              e.kawarpBlurPasses === t.kawarpBlurPasses &&
              e.kawarpAnimationSpeed === t.kawarpAnimationSpeed &&
              e.kawarpSaturation === t.kawarpSaturation &&
              e.kawarpDithering === t.kawarpDithering &&
              e.kawarpOpacity === t.kawarpOpacity,
            f = (e) =>
              'player-page' === e
                ? 'player'
                : 'search-page' === e
                  ? 'search'
                  : 'homepage',
            A = (e) =>
              'player-page' === e
                ? document.getElementById('player-page')
                : 'search-page' === e
                  ? document.getElementById('search-page')
                  : document.querySelector(
                      '.background-gradient.style-scope.ytmusic-browse-response',
                    ),
            x = async (e, t = 5e3) => {
              let r = A(e),
                a = r && r.children.length > 0;
              if (a) {
                let t = 'player-page' === e ? 1e3 : 100;
                return (await new Promise((e) => setTimeout(e, t)), !0);
              }
              return new Promise((r) => {
                let a = setTimeout(() => {
                    (i.disconnect(), r(!1));
                  }, t),
                  i = new MutationObserver(() => {
                    let t = A(e);
                    if (t && t.children.length > 0) {
                      (clearTimeout(a), i.disconnect());
                      let t = 'player-page' === e ? 1e3 : 100;
                      setTimeout(() => r(!0), t);
                    }
                  }),
                  s = document.querySelector('ytmusic-app');
                s
                  ? i.observe(s, { childList: !0, subtree: !0 })
                  : (clearTimeout(a), r(!1));
              });
            },
            y = () => {
              let e = new URL(window.location.href);
              return e.searchParams.get('v');
            },
            b = () => {
              let e = document.querySelector('#song-image img');
              if (e?.src && !e.src.startsWith('data:') && e.naturalHeight > 0)
                return e.src;
              let t = y();
              if (t) return `https://i.ytimg.com/vi/${t}/maxresdefault.jpg`;
              let r = document.querySelector(
                'ytmusic-player-bar .thumbnail img, .middle-controls .thumbnail img',
              );
              return r?.src && !r.src.startsWith('data:') && r.naturalHeight > 0
                ? r.src
                : null;
            },
            w = async (e, t, r = 'player-page') => {
              let a = f(r);
              if (c.has(a))
                return (
                  (0, n.logger).log(
                    `Kawarp creation already in progress for ${a}, skipping`,
                  ),
                  !1
                );
              let i = p(a);
              (i.instance &&
                ((0, n.logger).log(
                  `Kawarp already exists for ${a}, destroying first`,
                ),
                v(a)),
                c.add(a));
              let o = await x(r);
              if (!o) return (c.delete(a), !1);
              let u = A(r);
              if (
                ((0, n.logger).log(
                  'createKawarp - targetSelector:',
                  r,
                  'targetElement found:',
                  !!u,
                ),
                !u)
              )
                return (
                  (0, n.logger).error(
                    'Target element not found for selector:',
                    r,
                  ),
                  c.delete(a),
                  !1
                );
              let g = u.querySelector(`#better-lyrics-kawarp-${a}`);
              (g && g.remove(),
                (i.container = document.createElement('div')),
                (i.container.id = `better-lyrics-kawarp-${a}`));
              let m = 'player-page' !== r;
              ((i.backdrop = document.createElement('div')),
                (i.backdrop.id = `better-lyrics-kawarp-backdrop-${a}`),
                (i.backdrop.style.cssText = m
                  ? `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      background-color: #000;
      opacity: 0;
      will-change: opacity;
      transition: opacity 0.5s ease-out;
    `
                  : `
      --sidebar: 240px;
      position: absolute;
      top: -120px;
      left: calc(-1 * var(--sidebar));
      width: calc(100% + var(--sidebar));
      height: calc(100% + 128px);
      pointer-events: none;
      z-index: -2;
      background-color: #000;
      opacity: 0;
      will-change: opacity;
      transition: opacity 0.5s ease-out;
    `),
                (i.container.style.cssText = m
                  ? `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
      will-change: opacity, transform;
      transition: opacity 0.5s ease-out;
    `
                  : `
      --sidebar: 240px;
      position: absolute;
      top: -120px;
      left: calc(-1 * var(--sidebar));
      width: calc(100% + var(--sidebar));
      height: calc(100% + 128px);
      pointer-events: none;
      z-index: -1;
      opacity: 0;
      will-change: opacity, transform;
      transition: opacity 0.5s ease-out;
    `),
                (i.canvas = document.createElement('canvas')),
                (i.canvas.style.cssText = `
    width: 100%;
    height: 100%;
    display: block;
  `),
                i.container.appendChild(i.canvas),
                u.insertBefore(i.backdrop, u.firstChild),
                u.insertBefore(i.container, i.backdrop.nextSibling));
              let h = e.kawarpAnimationSpeed * t.speedMultiplier;
              ((i.instance = new s.default(i.canvas, {
                warpIntensity: e.kawarpWarpIntensity,
                blurPasses: e.kawarpBlurPasses,
                animationSpeed: h,
                transitionDuration: e.kawarpTransitionDuration,
                saturation: e.kawarpSaturation,
                dithering: e.kawarpDithering,
                scale: 1,
              })),
                (i.currentSpeed = h),
                (i.targetSpeed = h),
                (i.lastSettings = { ...e }),
                (i.lastMultipliers = { ...t }));
              let y = b();
              if (y)
                try {
                  (await l(i.instance, y),
                    (i.currentImageUrl = y),
                    (d = y),
                    (0, n.logger).log('Kawarp loaded album art:', y));
                } catch (e) {
                  (0, n.logger).error(
                    'Failed to load album art for kawarp:',
                    e,
                  );
                }
              return (
                i.instance.start(),
                (i.observer = new IntersectionObserver(
                  (e) => {
                    let t = e[0],
                      r = t.isIntersecting;
                    i.isVisible !== r &&
                      ((i.isVisible = r),
                      i.instance &&
                        (r ? i.instance.start() : i.instance.stop()));
                  },
                  { threshold: 0.1 },
                )),
                i.observer.observe(i.container),
                i.container.offsetHeight,
                setTimeout(() => {
                  requestAnimationFrame(() => {
                    (i.container &&
                      (i.container.style.opacity = e.kawarpOpacity.toString()),
                      i.backdrop && (i.backdrop.style.opacity = '1'));
                  });
                }, 300),
                c.delete(a),
                !0
              );
            },
            v = (e) => {
              if (e) {
                let t = p(e);
                ((0, n.logger).log(`Destroying kawarp for location: ${e}`),
                  null !== t.transitionTimeoutId &&
                    (clearTimeout(t.transitionTimeoutId),
                    (t.transitionTimeoutId = null)),
                  null !== t.scaleAnimationId &&
                    (cancelAnimationFrame(t.scaleAnimationId),
                    (t.scaleAnimationId = null)),
                  null !== t.speedAnimationId &&
                    (cancelAnimationFrame(t.speedAnimationId),
                    (t.speedAnimationId = null)),
                  t.observer && (t.observer.disconnect(), (t.observer = null)),
                  t.instance &&
                    (t.instance.stop(),
                    t.instance.dispose(),
                    (t.instance = null)),
                  t.container && (t.container.remove(), (t.container = null)),
                  t.backdrop && (t.backdrop.remove(), (t.backdrop = null)),
                  (t.canvas = null),
                  (t.currentImageUrl = null),
                  (t.lastSettings = null),
                  (t.lastMultipliers = null),
                  (t.isVisible = !0),
                  (t.isTransitioning = !1),
                  (t.pendingImageUrl = null),
                  (t.currentScale = 1),
                  (t.targetScale = 1),
                  (t.currentSpeed = 1),
                  (t.targetSpeed = 1),
                  (t.isPaused = !1),
                  m.delete(e));
              } else
                for (let e of ((0, n.logger).log('Destroying all kawarps'),
                m.keys()))
                  v(e);
            },
            T = async (e, t, r) => {
              if (!e.instance || !e.container) return;
              let a = e.lastSettings?.kawarpTransitionDuration ?? 1e3;
              ((e.isTransitioning = !0),
                null !== e.transitionTimeoutId &&
                  clearTimeout(e.transitionTimeoutId));
              try {
                (await l(e.instance, t),
                  (e.currentImageUrl = t),
                  (d = t),
                  (0, n.logger).log(`Updated kawarp image for ${r}:`, t));
              } catch (t) {
                ((0, n.logger).error('Failed to update kawarp image:', t),
                  (e.isTransitioning = !1));
                return;
              }
              e.transitionTimeoutId = window.setTimeout(() => {
                if (
                  ((e.isTransitioning = !1),
                  (e.transitionTimeoutId = null),
                  e.pendingImageUrl && e.pendingImageUrl !== e.currentImageUrl)
                ) {
                  let t = e.pendingImageUrl;
                  ((e.pendingImageUrl = null),
                    (0, n.logger).log(`Processing queued image for ${r}:`, t),
                    T(e, t, r));
                }
              }, a);
            },
            E = async (e = 'player') => {
              let t = p(e);
              if (!t.instance || !t.container) return;
              let r = b();
              if (r && r !== t.currentImageUrl) {
                if (t.isTransitioning) {
                  ((0, n.logger).log(
                    `Transition in progress for ${e}, queueing image:`,
                    r,
                  ),
                    (t.pendingImageUrl = r));
                  return;
                }
                await T(t, r, e);
              }
            },
            S = (e, t, r) => {
              let a = (r) => {
                let a = p(r);
                if (!a.instance || !a.container) return;
                let i =
                    a.lastMultipliers?.speedMultiplier !== t.speedMultiplier,
                  s = a.lastMultipliers?.scaleMultiplier !== t.scaleMultiplier;
                if (i || s) {
                  if (i) {
                    let r = e.kawarpAnimationSpeed * t.speedMultiplier;
                    a.instance.animationSpeed = r;
                  }
                  (s &&
                    ((a.targetScale = t.scaleMultiplier),
                    null === a.scaleAnimationId &&
                      (a.scaleAnimationId = requestAnimationFrame(() => u(a)))),
                    (a.lastMultipliers = { ...t }));
                }
              };
              if (r) a(r);
              else for (let e of m.keys()) a(e);
            },
            I = (e, t, r) => {
              let a = (r) => {
                let a = p(r);
                if (!a.instance || !a.container) return;
                if (!document.contains(a.container)) {
                  ((0, n.logger).log(
                    `Container for ${r} was removed from DOM, cleaning up state`,
                  ),
                    v(r));
                  return;
                }
                if (h(a.lastSettings, e)) return;
                let i = e.kawarpAnimationSpeed * t.speedMultiplier;
                (a.instance.setOptions({
                  warpIntensity: e.kawarpWarpIntensity,
                  blurPasses: e.kawarpBlurPasses,
                  animationSpeed: i,
                  saturation: e.kawarpSaturation,
                  dithering: e.kawarpDithering,
                }),
                  (a.lastSettings = { ...e }),
                  (a.lastMultipliers = { ...t }));
                let s = e.kawarpOpacity.toString();
                a.container &&
                  a.container.style.opacity !== s &&
                  (a.container.style.opacity = s);
              };
              if (r) a(r);
              else for (let e of m.keys()) a(e);
            },
            _ = (e) => {
              if (e) {
                let t = p(e);
                return (
                  null !== t.instance &&
                  null !== t.container &&
                  document.contains(t.container)
                );
              }
              return (
                m.size > 0 &&
                Array.from(m.values()).some(
                  (e) =>
                    null !== e.instance &&
                    null !== e.container &&
                    document.contains(e.container),
                )
              );
            },
            k = () => d,
            P = () => {
              let e = document.querySelectorAll("[id^='better-lyrics-kawarp']");
              (e.forEach((e) => e.remove()),
                (0, n.logger).log('Cleaned up orphaned kawarps:', e.length));
            },
            F = (e) => {
              let t = (e) => {
                let t = p(e);
                t.instance &&
                  !t.isPaused &&
                  ((t.isPaused = !0),
                  (t.targetSpeed = 0),
                  null === t.speedAnimationId &&
                    (t.speedAnimationId = requestAnimationFrame(() => g(t))));
              };
              if (e) t(e);
              else for (let e of m.keys()) t(e);
            },
            C = (e) => {
              let t = (e) => {
                let t = p(e);
                if (!t.instance || !t.isVisible || !t.isPaused) return;
                ((t.isPaused = !1), t.instance.start());
                let r = t.lastSettings?.kawarpAnimationSpeed ?? 1,
                  a = t.lastMultipliers?.speedMultiplier ?? 1;
                ((t.targetSpeed = r * a),
                  null === t.speedAnimationId &&
                    (t.speedAnimationId = requestAnimationFrame(() => g(t))));
              };
              if (e) t(e);
              else for (let e of m.keys()) t(e);
            };
        },
        {
          '@kawarp/core': '7nLkY',
          '../../shared/utils/logger': '4b2II',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
      '7nLkY': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r), a.export(r, 'Kawarp', () => g));
          let i = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`,
            s = `
  precision highp float;
  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform float u_offset;
  varying vec2 v_texCoord;

  void main() {
    highp vec2 texelSize = 1.0 / u_resolution;
    highp vec4 color = vec4(0.0);

    color += texture2D(u_texture, v_texCoord + vec2(-u_offset, -u_offset) * texelSize);
    color += texture2D(u_texture, v_texCoord + vec2(u_offset, -u_offset) * texelSize);
    color += texture2D(u_texture, v_texCoord + vec2(-u_offset, u_offset) * texelSize);
    color += texture2D(u_texture, v_texCoord + vec2(u_offset, u_offset) * texelSize);

    gl_FragColor = color * 0.25;
  }
`,
            n = `
  precision highp float;
  uniform sampler2D u_texture1;
  uniform sampler2D u_texture2;
  uniform float u_blend;
  varying vec2 v_texCoord;

  void main() {
    vec4 color1 = texture2D(u_texture1, v_texCoord);
    vec4 color2 = texture2D(u_texture2, v_texCoord);
    gl_FragColor = mix(color1, color2, u_blend);
  }
`,
            o = `
  precision highp float;
  uniform sampler2D u_texture;
  uniform vec3 u_tintColor;
  uniform float u_tintIntensity;
  varying vec2 v_texCoord;

  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // darkMask: 1.0 for black, 0.0 for luma >= 0.5
    float darkMask = 1.0 - smoothstep(0.0, 0.5, luma);

    // Blend dark areas toward tint color
    color.rgb = mix(color.rgb, u_tintColor, darkMask * u_tintIntensity);

    gl_FragColor = color;
  }
`,
            l = `
  precision highp float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_intensity;
  varying vec2 v_texCoord;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = v_texCoord;
    float t = u_time * 0.05;

    vec2 center = uv - 0.5;
    float centerWeight = 1.0 - smoothstep(0.0, 0.7, length(center));

    // Large-scale movement (slow, big blobs)
    float n1 = snoise(uv * 0.35 + vec2(t, t * 0.7));
    float n2 = snoise(uv * 0.35 + vec2(-t * 0.8, t * 0.5) + vec2(50.0, 50.0));

    // Medium-scale detail (adds organic movement)
    float n3 = snoise(uv * 0.9 + vec2(t * 1.2, -t) + vec2(100.0, 0.0));
    float n4 = snoise(uv * 0.9 + vec2(-t, t * 1.1) + vec2(0.0, 100.0));

    // Combine two octaves
    vec2 warp = vec2(
      n1 * 0.65 + n3 * 0.35,
      n2 * 0.65 + n4 * 0.35
    ) * centerWeight;

    vec2 warpedUV = uv + warp * u_intensity;
    warpedUV = clamp(warpedUV, 0.0, 1.0);

    gl_FragColor = texture2D(u_texture, warpedUV);
  }
`,
            u = `
  precision highp float;
  uniform sampler2D u_texture;
  uniform float u_saturation;
  uniform float u_dithering;
  uniform float u_time;
  uniform float u_scale;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;

  highp float hash(highp vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec2 uv = (v_texCoord - 0.5) / u_scale + 0.5;
    uv = clamp(uv, 0.0, 1.0);

    vec4 color = texture2D(u_texture, uv);

    vec2 center = v_texCoord - 0.5;
    float vignette = 1.0 - dot(center, center) * 0.3;
    color.rgb *= vignette;

    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, u_saturation);

    highp vec2 pixelPos = floor(v_texCoord * u_resolution);
    highp float noise = hash(vec3(pixelPos, floor(u_time * 60.0)));
    color.rgb += (noise - 0.5) * u_dithering;

    gl_FragColor = color;
  }
`;
          class g {
            canvas;
            gl;
            halfFloatExt = null;
            halfFloatLinearExt = null;
            blurProgram;
            blendProgram;
            tintProgram;
            warpProgram;
            outputProgram;
            positionBuffer;
            texCoordBuffer;
            sourceTexture;
            blurFBO1;
            blurFBO2;
            currentAlbumFBO;
            nextAlbumFBO;
            warpFBO;
            animationId = null;
            lastFrameTime = 0;
            accumulatedTime = 0;
            isPlaying = !1;
            isTransitioning = !1;
            transitionStartTime = 0;
            _transitionDuration;
            _warpIntensity;
            _blurPasses;
            _animationSpeed;
            _targetAnimationSpeed;
            _saturation;
            _tintColor;
            _tintIntensity;
            _dithering;
            _scale;
            hasImage = !1;
            attribs;
            uniforms;
            constructor(e, t = {}) {
              this.canvas = e;
              let r = e.getContext('webgl', { preserveDrawingBuffer: !0 });
              if (!r) throw Error('WebGL not supported');
              ((this.gl = r),
                (this.halfFloatExt = r.getExtension('OES_texture_half_float')),
                (this.halfFloatLinearExt = r.getExtension(
                  'OES_texture_half_float_linear',
                )),
                (this._warpIntensity = t.warpIntensity ?? 1),
                (this._blurPasses = t.blurPasses ?? 8),
                (this._animationSpeed = t.animationSpeed ?? 1),
                (this._targetAnimationSpeed = this._animationSpeed),
                (this._transitionDuration = t.transitionDuration ?? 1e3),
                (this._saturation = t.saturation ?? 1.5),
                (this._tintColor = t.tintColor ?? [0.157, 0.157, 0.235]),
                (this._tintIntensity = t.tintIntensity ?? 0.15),
                (this._dithering = t.dithering ?? 0.008),
                (this._scale = t.scale ?? 1),
                (this.blurProgram = this.createProgram(i, s)),
                (this.blendProgram = this.createProgram(i, n)),
                (this.tintProgram = this.createProgram(i, o)),
                (this.warpProgram = this.createProgram(i, l)),
                (this.outputProgram = this.createProgram(i, u)),
                (this.attribs = {
                  position: r.getAttribLocation(this.blurProgram, 'a_position'),
                  texCoord: r.getAttribLocation(this.blurProgram, 'a_texCoord'),
                }),
                (this.uniforms = {
                  blur: {
                    resolution: r.getUniformLocation(
                      this.blurProgram,
                      'u_resolution',
                    ),
                    texture: r.getUniformLocation(
                      this.blurProgram,
                      'u_texture',
                    ),
                    offset: r.getUniformLocation(this.blurProgram, 'u_offset'),
                  },
                  blend: {
                    texture1: r.getUniformLocation(
                      this.blendProgram,
                      'u_texture1',
                    ),
                    texture2: r.getUniformLocation(
                      this.blendProgram,
                      'u_texture2',
                    ),
                    blend: r.getUniformLocation(this.blendProgram, 'u_blend'),
                  },
                  warp: {
                    texture: r.getUniformLocation(
                      this.warpProgram,
                      'u_texture',
                    ),
                    time: r.getUniformLocation(this.warpProgram, 'u_time'),
                    intensity: r.getUniformLocation(
                      this.warpProgram,
                      'u_intensity',
                    ),
                  },
                  tint: {
                    texture: r.getUniformLocation(
                      this.tintProgram,
                      'u_texture',
                    ),
                    tintColor: r.getUniformLocation(
                      this.tintProgram,
                      'u_tintColor',
                    ),
                    tintIntensity: r.getUniformLocation(
                      this.tintProgram,
                      'u_tintIntensity',
                    ),
                  },
                  output: {
                    texture: r.getUniformLocation(
                      this.outputProgram,
                      'u_texture',
                    ),
                    saturation: r.getUniformLocation(
                      this.outputProgram,
                      'u_saturation',
                    ),
                    dithering: r.getUniformLocation(
                      this.outputProgram,
                      'u_dithering',
                    ),
                    time: r.getUniformLocation(this.outputProgram, 'u_time'),
                    scale: r.getUniformLocation(this.outputProgram, 'u_scale'),
                    resolution: r.getUniformLocation(
                      this.outputProgram,
                      'u_resolution',
                    ),
                  },
                }),
                (this.positionBuffer = this.createBuffer(
                  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
                )),
                (this.texCoordBuffer = this.createBuffer(
                  new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
                )),
                (this.sourceTexture = this.createTexture()),
                (this.blurFBO1 = this.createFramebuffer(128, 128, !0)),
                (this.blurFBO2 = this.createFramebuffer(128, 128, !0)),
                (this.currentAlbumFBO = this.createFramebuffer(128, 128, !0)),
                (this.nextAlbumFBO = this.createFramebuffer(128, 128, !0)),
                (this.warpFBO = this.createFramebuffer(1, 1, !0)),
                this.resize());
            }
            get warpIntensity() {
              return this._warpIntensity;
            }
            set warpIntensity(e) {
              this._warpIntensity = Math.max(0, Math.min(1, e));
            }
            get blurPasses() {
              return this._blurPasses;
            }
            set blurPasses(e) {
              let t = Math.max(1, Math.min(40, Math.floor(e)));
              t !== this._blurPasses &&
                ((this._blurPasses = t),
                this.hasImage && this.reblurCurrentImage());
            }
            get animationSpeed() {
              return this._targetAnimationSpeed;
            }
            set animationSpeed(e) {
              this._targetAnimationSpeed = Math.max(0.1, Math.min(5, e));
            }
            get transitionDuration() {
              return this._transitionDuration;
            }
            set transitionDuration(e) {
              this._transitionDuration = Math.max(0, Math.min(5e3, e));
            }
            get saturation() {
              return this._saturation;
            }
            set saturation(e) {
              this._saturation = Math.max(0, Math.min(3, e));
            }
            get tintColor() {
              return this._tintColor;
            }
            set tintColor(e) {
              let t = e.map((e) => Math.max(0, Math.min(1, e))),
                r = t.some((e, t) => e !== this._tintColor[t]);
              r &&
                ((this._tintColor = t),
                this.hasImage && this.reblurCurrentImage());
            }
            get tintIntensity() {
              return this._tintIntensity;
            }
            set tintIntensity(e) {
              let t = Math.max(0, Math.min(1, e));
              t !== this._tintIntensity &&
                ((this._tintIntensity = t),
                this.hasImage && this.reblurCurrentImage());
            }
            get dithering() {
              return this._dithering;
            }
            set dithering(e) {
              this._dithering = Math.max(0, Math.min(0.1, e));
            }
            get scale() {
              return this._scale;
            }
            set scale(e) {
              this._scale = Math.max(0.01, Math.min(4, e));
            }
            setOptions(e) {
              (void 0 !== e.warpIntensity &&
                (this.warpIntensity = e.warpIntensity),
                void 0 !== e.blurPasses && (this.blurPasses = e.blurPasses),
                void 0 !== e.animationSpeed &&
                  (this.animationSpeed = e.animationSpeed),
                void 0 !== e.transitionDuration &&
                  (this.transitionDuration = e.transitionDuration),
                void 0 !== e.saturation && (this.saturation = e.saturation),
                void 0 !== e.tintColor && (this.tintColor = e.tintColor),
                void 0 !== e.tintIntensity &&
                  (this.tintIntensity = e.tintIntensity),
                void 0 !== e.dithering && (this.dithering = e.dithering),
                void 0 !== e.scale && (this.scale = e.scale));
            }
            getOptions() {
              return {
                warpIntensity: this._warpIntensity,
                blurPasses: this._blurPasses,
                animationSpeed: this._targetAnimationSpeed,
                transitionDuration: this._transitionDuration,
                saturation: this._saturation,
                tintColor: this._tintColor,
                tintIntensity: this._tintIntensity,
                dithering: this._dithering,
                scale: this._scale,
              };
            }
            loadImage(e) {
              return new Promise((t, r) => {
                let a = new Image();
                ((a.crossOrigin = 'anonymous'),
                  (a.onload = () => {
                    (this.gl.bindTexture(
                      this.gl.TEXTURE_2D,
                      this.sourceTexture,
                    ),
                      this.gl.texImage2D(
                        this.gl.TEXTURE_2D,
                        0,
                        this.gl.RGBA,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        a,
                      ),
                      this.processNewImage(),
                      t());
                  }),
                  (a.onerror = () => r(Error(`Failed to load image: ${e}`))),
                  (a.src = e));
              });
            }
            loadImageElement(e) {
              (this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture),
                this.gl.texImage2D(
                  this.gl.TEXTURE_2D,
                  0,
                  this.gl.RGBA,
                  this.gl.RGBA,
                  this.gl.UNSIGNED_BYTE,
                  e,
                ),
                this.processNewImage());
            }
            loadImageData(e, t, r) {
              (this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture),
                this.gl.texImage2D(
                  this.gl.TEXTURE_2D,
                  0,
                  this.gl.RGBA,
                  t,
                  r,
                  0,
                  this.gl.RGBA,
                  this.gl.UNSIGNED_BYTE,
                  e instanceof Uint8ClampedArray ? new Uint8Array(e.buffer) : e,
                ),
                this.processNewImage());
            }
            loadFromImageData(e) {
              this.loadImageData(e.data, e.width, e.height);
            }
            async loadBlob(e) {
              let t = await createImageBitmap(e);
              (this.loadImageElement(t), t.close());
            }
            loadBase64(e) {
              let t = e.startsWith('data:') ? e : `data:image/png;base64,${e}`;
              return this.loadImage(t);
            }
            async loadArrayBuffer(e, t = 'image/png') {
              let r = new Blob([e], { type: t });
              return this.loadBlob(r);
            }
            loadGradient(e, t = 135) {
              let r = document.createElement('canvas');
              ((r.width = 512), (r.height = 512));
              let a = r.getContext('2d');
              if (!a) return;
              let i = (t * Math.PI) / 180,
                s = a.createLinearGradient(
                  256 - 512 * Math.cos(i),
                  256 - 512 * Math.sin(i),
                  256 + 512 * Math.cos(i),
                  256 + 512 * Math.sin(i),
                );
              (e.forEach((t, r) => {
                s.addColorStop(r / (e.length - 1), t);
              }),
                (a.fillStyle = s),
                a.fillRect(0, 0, 512, 512),
                this.loadImageElement(r));
            }
            processNewImage() {
              (([this.currentAlbumFBO, this.nextAlbumFBO] = [
                this.nextAlbumFBO,
                this.currentAlbumFBO,
              ]),
                this.blurSourceInto(this.nextAlbumFBO),
                (this.hasImage = !0),
                (this.isTransitioning = !0),
                (this.transitionStartTime = performance.now()));
            }
            reblurCurrentImage() {
              this.blurSourceInto(this.nextAlbumFBO);
            }
            blurSourceInto(e) {
              let t = this.gl;
              (t.useProgram(this.tintProgram),
                this.setupAttributes(),
                t.bindFramebuffer(t.FRAMEBUFFER, this.blurFBO1.framebuffer),
                t.viewport(0, 0, 128, 128),
                t.activeTexture(t.TEXTURE0),
                t.bindTexture(t.TEXTURE_2D, this.sourceTexture),
                t.uniform1i(this.uniforms.tint.texture, 0),
                t.uniform3fv(this.uniforms.tint.tintColor, this._tintColor),
                t.uniform1f(
                  this.uniforms.tint.tintIntensity,
                  this._tintIntensity,
                ),
                t.drawArrays(t.TRIANGLES, 0, 6),
                t.useProgram(this.blurProgram),
                this.setupAttributes(),
                t.uniform2f(this.uniforms.blur.resolution, 128, 128),
                t.uniform1i(this.uniforms.blur.texture, 0));
              let r = this.blurFBO1,
                a = this.blurFBO2;
              for (let e = 0; e < this._blurPasses; e++)
                (t.bindFramebuffer(t.FRAMEBUFFER, a.framebuffer),
                  t.viewport(0, 0, 128, 128),
                  t.bindTexture(t.TEXTURE_2D, r.texture),
                  t.uniform1f(this.uniforms.blur.offset, e + 0.5),
                  t.drawArrays(t.TRIANGLES, 0, 6),
                  ([r, a] = [a, r]));
              (t.bindFramebuffer(t.FRAMEBUFFER, e.framebuffer),
                t.viewport(0, 0, 128, 128),
                t.bindTexture(t.TEXTURE_2D, r.texture),
                t.uniform1f(this.uniforms.blur.offset, 0),
                t.drawArrays(t.TRIANGLES, 0, 6));
            }
            resize() {
              let e = this.canvas.width,
                t = this.canvas.height;
              (this.warpFBO && this.deleteFramebuffer(this.warpFBO),
                (this.warpFBO = this.createFramebuffer(e, t, !0)));
            }
            start() {
              this.isPlaying ||
                ((this.isPlaying = !0),
                (this.lastFrameTime = performance.now()),
                requestAnimationFrame(this.renderLoop));
            }
            stop() {
              ((this.isPlaying = !1),
                null !== this.animationId &&
                  (cancelAnimationFrame(this.animationId),
                  (this.animationId = null)));
            }
            renderFrame(e) {
              let t = performance.now();
              if (void 0 !== e) this.render(e, t);
              else {
                let e = (t - this.lastFrameTime) / 1e3;
                ((this.lastFrameTime = t),
                  (this._animationSpeed +=
                    (this._targetAnimationSpeed - this._animationSpeed) * 0.05),
                  (this.accumulatedTime += e * this._animationSpeed),
                  this.render(this.accumulatedTime, t));
              }
            }
            dispose() {
              this.stop();
              let e = this.gl;
              (e.deleteProgram(this.blurProgram),
                e.deleteProgram(this.blendProgram),
                e.deleteProgram(this.tintProgram),
                e.deleteProgram(this.warpProgram),
                e.deleteProgram(this.outputProgram),
                e.deleteBuffer(this.positionBuffer),
                e.deleteBuffer(this.texCoordBuffer),
                e.deleteTexture(this.sourceTexture),
                this.deleteFramebuffer(this.blurFBO1),
                this.deleteFramebuffer(this.blurFBO2),
                this.deleteFramebuffer(this.currentAlbumFBO),
                this.deleteFramebuffer(this.nextAlbumFBO),
                this.deleteFramebuffer(this.warpFBO));
            }
            renderLoop = (e) => {
              if (!this.isPlaying) return;
              let t = (e - this.lastFrameTime) / 1e3;
              ((this.lastFrameTime = e),
                (this._animationSpeed +=
                  (this._targetAnimationSpeed - this._animationSpeed) * 0.05),
                (this.accumulatedTime += t * this._animationSpeed),
                this.render(this.accumulatedTime, e),
                (this.animationId = requestAnimationFrame(this.renderLoop)));
            };
            render(e, t = performance.now()) {
              let r;
              let a = this.gl,
                i = this.canvas.width,
                s = this.canvas.height,
                n = 1;
              if (this.isTransitioning) {
                let e = t - this.transitionStartTime;
                (n = Math.min(1, e / this._transitionDuration)) >= 1 &&
                  (this.isTransitioning = !1);
              }
              (this.isTransitioning && n < 1
                ? (a.useProgram(this.blendProgram),
                  this.setupAttributes(),
                  a.bindFramebuffer(a.FRAMEBUFFER, this.blurFBO1.framebuffer),
                  a.viewport(0, 0, 128, 128),
                  a.activeTexture(a.TEXTURE0),
                  a.bindTexture(a.TEXTURE_2D, this.currentAlbumFBO.texture),
                  a.uniform1i(this.uniforms.blend.texture1, 0),
                  a.activeTexture(a.TEXTURE1),
                  a.bindTexture(a.TEXTURE_2D, this.nextAlbumFBO.texture),
                  a.uniform1i(this.uniforms.blend.texture2, 1),
                  a.uniform1f(this.uniforms.blend.blend, n),
                  a.drawArrays(a.TRIANGLES, 0, 6),
                  (r = this.blurFBO1.texture),
                  a.useProgram(this.warpProgram),
                  this.setupAttributes(),
                  a.bindFramebuffer(a.FRAMEBUFFER, this.warpFBO.framebuffer),
                  a.viewport(0, 0, i, s),
                  a.activeTexture(a.TEXTURE0),
                  a.bindTexture(a.TEXTURE_2D, r))
                : (a.useProgram(this.warpProgram),
                  this.setupAttributes(),
                  a.bindFramebuffer(a.FRAMEBUFFER, this.warpFBO.framebuffer),
                  a.viewport(0, 0, i, s),
                  a.activeTexture(a.TEXTURE0),
                  a.bindTexture(a.TEXTURE_2D, this.nextAlbumFBO.texture)),
                a.uniform1i(this.uniforms.warp.texture, 0),
                a.uniform1f(this.uniforms.warp.time, e),
                a.uniform1f(this.uniforms.warp.intensity, this._warpIntensity),
                a.drawArrays(a.TRIANGLES, 0, 6),
                a.useProgram(this.outputProgram),
                this.setupAttributes(),
                a.bindFramebuffer(a.FRAMEBUFFER, null),
                a.viewport(0, 0, i, s),
                a.bindTexture(a.TEXTURE_2D, this.warpFBO.texture),
                a.uniform1i(this.uniforms.output.texture, 0),
                a.uniform1f(this.uniforms.output.saturation, this._saturation),
                a.uniform1f(this.uniforms.output.dithering, this._dithering),
                a.uniform1f(this.uniforms.output.time, e),
                a.uniform1f(this.uniforms.output.scale, this._scale),
                a.uniform2f(this.uniforms.output.resolution, i, s),
                a.drawArrays(a.TRIANGLES, 0, 6));
            }
            setupAttributes() {
              let e = this.gl;
              (e.bindBuffer(e.ARRAY_BUFFER, this.positionBuffer),
                e.enableVertexAttribArray(this.attribs.position),
                e.vertexAttribPointer(
                  this.attribs.position,
                  2,
                  e.FLOAT,
                  !1,
                  0,
                  0,
                ),
                e.bindBuffer(e.ARRAY_BUFFER, this.texCoordBuffer),
                e.enableVertexAttribArray(this.attribs.texCoord),
                e.vertexAttribPointer(
                  this.attribs.texCoord,
                  2,
                  e.FLOAT,
                  !1,
                  0,
                  0,
                ));
            }
            createShader(e, t) {
              let r = this.gl,
                a = r.createShader(e);
              if (!a) throw Error('Failed to create shader');
              if (
                (r.shaderSource(a, t),
                r.compileShader(a),
                !r.getShaderParameter(a, r.COMPILE_STATUS))
              ) {
                let e = r.getShaderInfoLog(a);
                throw (r.deleteShader(a), Error(`Shader compile error: ${e}`));
              }
              return a;
            }
            createProgram(e, t) {
              let r = this.gl,
                a = this.createShader(r.VERTEX_SHADER, e),
                i = this.createShader(r.FRAGMENT_SHADER, t),
                s = r.createProgram();
              if (!s) throw Error('Failed to create program');
              if (
                (r.attachShader(s, a),
                r.attachShader(s, i),
                r.linkProgram(s),
                !r.getProgramParameter(s, r.LINK_STATUS))
              ) {
                let e = r.getProgramInfoLog(s);
                throw (r.deleteProgram(s), Error(`Program link error: ${e}`));
              }
              return (r.deleteShader(a), r.deleteShader(i), s);
            }
            createBuffer(e) {
              let t = this.gl,
                r = t.createBuffer();
              if (!r) throw Error('Failed to create buffer');
              return (
                t.bindBuffer(t.ARRAY_BUFFER, r),
                t.bufferData(t.ARRAY_BUFFER, e, t.STATIC_DRAW),
                r
              );
            }
            createTexture() {
              let e = this.gl,
                t = e.createTexture();
              if (!t) throw Error('Failed to create texture');
              return (
                e.bindTexture(e.TEXTURE_2D, t),
                e.texParameteri(
                  e.TEXTURE_2D,
                  e.TEXTURE_WRAP_S,
                  e.CLAMP_TO_EDGE,
                ),
                e.texParameteri(
                  e.TEXTURE_2D,
                  e.TEXTURE_WRAP_T,
                  e.CLAMP_TO_EDGE,
                ),
                e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR),
                e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR),
                t
              );
            }
            createFramebuffer(e, t, r = !1) {
              let a = this.gl,
                i = this.createTexture(),
                s = r && this.halfFloatExt && this.halfFloatLinearExt,
                n = s ? this.halfFloatExt.HALF_FLOAT_OES : a.UNSIGNED_BYTE;
              a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, e, t, 0, a.RGBA, n, null);
              let o = a.createFramebuffer();
              if (!o) throw Error('Failed to create framebuffer');
              return (
                a.bindFramebuffer(a.FRAMEBUFFER, o),
                a.framebufferTexture2D(
                  a.FRAMEBUFFER,
                  a.COLOR_ATTACHMENT0,
                  a.TEXTURE_2D,
                  i,
                  0,
                ),
                { framebuffer: o, texture: i }
              );
            }
            deleteFramebuffer(e) {
              (this.gl.deleteFramebuffer(e.framebuffer),
                this.gl.deleteTexture(e.texture));
            }
          }
          r.default = g;
        },
        { '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2' },
      ],
      '56Z7d': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r),
            a.export(r, 'loadGradientSettings', () => l),
            a.export(r, 'saveGradientSettings', () => u));
          var i = e('@plasmohq/storage'),
            s = e('../../shared/constants/gradientSettings'),
            n = e('../../shared/utils/logger');
          let o = new i.Storage(),
            l = async () => {
              try {
                let e = await o.get(s.GRADIENT_SETTINGS_STORAGE_KEY);
                if (e) {
                  let {
                      showOnHomepage: t,
                      shaderType: r,
                      distortion: a,
                      swirl: i,
                      offsetX: n,
                      offsetY: o,
                      scale: l,
                      rotation: u,
                      speed: g,
                      opacity: m,
                      boostDullColors: c,
                      vibrantSaturationThreshold: d,
                      vibrantRatioThreshold: p,
                      boostIntensity: h,
                      rememberAlbumSettings: f,
                      audioScaleBoost: A,
                      ...x
                    } = e,
                    y = {
                      ...s.DEFAULT_GRADIENT_SETTINGS,
                      ...x,
                      showOnBrowsePages:
                        x.showOnBrowsePages ??
                        t ??
                        s.DEFAULT_GRADIENT_SETTINGS.showOnBrowsePages,
                    };
                  return y;
                }
                return { ...s.DEFAULT_GRADIENT_SETTINGS };
              } catch (e) {
                return (
                  (0, n.logger).error(
                    'Error loading gradient settings from storage:',
                    e,
                  ),
                  { ...s.DEFAULT_GRADIENT_SETTINGS }
                );
              }
            },
            u = async (e) => {
              try {
                await o.set(s.GRADIENT_SETTINGS_STORAGE_KEY, e);
              } catch (e) {
                (0, n.logger).error(
                  'Error saving gradient settings to storage:',
                  e,
                );
              }
            };
        },
        {
          '@plasmohq/storage': '25Hq9',
          '../../shared/constants/gradientSettings': '2tB0U',
          '../../shared/utils/logger': '4b2II',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
      '25Hq9': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r),
            a.export(r, 'BaseStorage', () => o),
            a.export(r, 'Storage', () => l));
          var i = e('pify'),
            s = a.interopDefault(i),
            n = () => {
              try {
                let e =
                  globalThis.navigator?.userAgent.match(
                    /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
                  ) || [];
                if ('Chrome' === e[1])
                  return (
                    100 > parseInt(e[2]) ||
                    globalThis.chrome.runtime?.getManifest()
                      ?.manifest_version === 2
                  );
              } catch {}
              return !1;
            },
            o = class {
              #e;
              #t;
              get primaryClient() {
                return this.#t;
              }
              #r;
              get secondaryClient() {
                return this.#r;
              }
              #a;
              get area() {
                return this.#a;
              }
              get hasWebApi() {
                try {
                  return 'u' > typeof window && !!window.localStorage;
                } catch (e) {
                  return (console.error(e), !1);
                }
              }
              #i = new Map();
              #s;
              get copiedKeySet() {
                return this.#s;
              }
              isCopied = (e) =>
                this.hasWebApi && (this.allCopied || this.copiedKeySet.has(e));
              #n = !1;
              get allCopied() {
                return this.#n;
              }
              getExtStorageApi = () =>
                globalThis.browser?.storage || globalThis.chrome?.storage;
              get hasExtensionApi() {
                try {
                  return !!this.getExtStorageApi();
                } catch (e) {
                  return (console.error(e), !1);
                }
              }
              isWatchSupported = () => this.hasExtensionApi;
              keyNamespace = '';
              isValidKey = (e) => e.startsWith(this.keyNamespace);
              getNamespacedKey = (e) => `${this.keyNamespace}${e}`;
              getUnnamespacedKey = (e) => e.slice(this.keyNamespace.length);
              serde = { serializer: JSON.stringify, deserializer: JSON.parse };
              constructor({
                area: e = 'sync',
                allCopied: t = !1,
                copiedKeyList: r = [],
                serde: a = {},
              } = {}) {
                (this.setCopiedKeySet(r),
                  (this.#a = e),
                  (this.#n = t),
                  (this.serde = { ...this.serde, ...a }));
                try {
                  this.hasWebApi &&
                    (t || r.length > 0) &&
                    (this.#r = window.localStorage);
                } catch {}
                try {
                  this.hasExtensionApi &&
                    ((this.#e = this.getExtStorageApi()),
                    n()
                      ? (this.#t = (0, s.default)(this.#e[this.area], {
                          exclude: ['getBytesInUse'],
                          errorFirst: !1,
                        }))
                      : (this.#t = this.#e[this.area]));
                } catch {}
              }
              setCopiedKeySet(e) {
                this.#s = new Set(e);
              }
              rawGetAll = () => this.#t?.get();
              getAll = async () =>
                Object.entries(await this.rawGetAll())
                  .filter(([e]) => this.isValidKey(e))
                  .reduce(
                    (e, [t, r]) => ((e[this.getUnnamespacedKey(t)] = r), e),
                    {},
                  );
              copy = async (e) => {
                let t = void 0 === e;
                if (
                  (!t && !this.copiedKeySet.has(e)) ||
                  !this.allCopied ||
                  !this.hasExtensionApi
                )
                  return !1;
                let r = this.allCopied
                  ? await this.rawGetAll()
                  : await this.#t.get(
                      (t ? [...this.copiedKeySet] : [e]).map(
                        this.getNamespacedKey,
                      ),
                    );
                if (!r) return !1;
                let a = !1;
                for (let e in r) {
                  let t = r[e],
                    i = this.#r?.getItem(e);
                  (this.#r?.setItem(e, t), (a ||= t !== i));
                }
                return a;
              };
              rawGet = async (e) => (await this.rawGetMany([e]))[e];
              rawGetMany = async (e) =>
                this.hasExtensionApi
                  ? await this.#t.get(e)
                  : e
                      .filter(this.isCopied)
                      .reduce((e, t) => ((e[t] = this.#r?.getItem(t)), e), {});
              rawSet = async (e, t) => await this.rawSetMany({ [e]: t });
              rawSetMany = async (e) => (
                this.#r &&
                  Object.entries(e)
                    .filter(([e]) => this.isCopied(e))
                    .forEach(([e, t]) => this.#r.setItem(e, t)),
                this.hasExtensionApi && (await this.#t.set(e)),
                null
              );
              clear = async (e = !1) => {
                (e && this.#r?.clear(), await this.#t.clear());
              };
              rawRemove = async (e) => {
                await this.rawRemoveMany([e]);
              };
              rawRemoveMany = async (e) => {
                (this.#r &&
                  e.filter(this.isCopied).forEach((e) => this.#r.removeItem(e)),
                  this.hasExtensionApi && (await this.#t.remove(e)));
              };
              removeAll = async () => {
                let e = Object.keys(await this.getAll());
                await this.removeMany(e);
              };
              watch = (e) => {
                let t = this.isWatchSupported();
                return (t && this.#o(e), t);
              };
              #o = (e) => {
                for (let t in e) {
                  let r = this.getNamespacedKey(t),
                    a = this.#i.get(r)?.callbackSet || new Set();
                  if ((a.add(e[t]), a.size > 1)) continue;
                  let i = (e, t) => {
                    if (t !== this.area || !e[r]) return;
                    let a = this.#i.get(r);
                    if (!a)
                      throw Error(
                        `Storage comms does not exist for nsKey: ${r}`,
                      );
                    Promise.all([
                      this.parseValue(e[r].newValue),
                      this.parseValue(e[r].oldValue),
                    ]).then(([e, r]) => {
                      for (let i of a.callbackSet)
                        i({ newValue: e, oldValue: r }, t);
                    });
                  };
                  (this.#e.onChanged.addListener(i),
                    this.#i.set(r, { callbackSet: a, listener: i }));
                }
              };
              unwatch = (e) => {
                let t = this.isWatchSupported();
                return (t && this.#l(e), t);
              };
              #l(e) {
                for (let t in e) {
                  let r = this.getNamespacedKey(t),
                    a = e[t],
                    i = this.#i.get(r);
                  i &&
                    (i.callbackSet.delete(a),
                    0 === i.callbackSet.size &&
                      (this.#i.delete(r),
                      this.#e.onChanged.removeListener(i.listener)));
                }
              }
              unwatchAll = () => this.#u();
              #u() {
                (this.#i.forEach(({ listener: e }) =>
                  this.#e.onChanged.removeListener(e),
                ),
                  this.#i.clear());
              }
              async getItem(e) {
                return this.get(e);
              }
              async getItems(e) {
                return await this.getMany(e);
              }
              async setItem(e, t) {
                await this.set(e, t);
              }
              async setItems(e) {
                await await this.setMany(e);
              }
              async removeItem(e) {
                return this.remove(e);
              }
              async removeItems(e) {
                return await this.removeMany(e);
              }
            },
            l = class extends o {
              get = async (e) => {
                let t = this.getNamespacedKey(e),
                  r = await this.rawGet(t);
                return this.parseValue(r);
              };
              getMany = async (e) => {
                let t = e.map(this.getNamespacedKey),
                  r = await this.rawGetMany(t),
                  a = await Promise.all(Object.values(r).map(this.parseValue));
                return Object.keys(r).reduce(
                  (e, t, r) => ((e[this.getUnnamespacedKey(t)] = a[r]), e),
                  {},
                );
              };
              set = async (e, t) => {
                let r = this.getNamespacedKey(e),
                  a = this.serde.serializer(t);
                return this.rawSet(r, a);
              };
              setMany = async (e) => {
                let t = Object.entries(e).reduce(
                  (e, [t, r]) => (
                    (e[this.getNamespacedKey(t)] = this.serde.serializer(r)),
                    e
                  ),
                  {},
                );
                return await this.rawSetMany(t);
              };
              remove = async (e) => {
                let t = this.getNamespacedKey(e);
                return this.rawRemove(t);
              };
              removeMany = async (e) => {
                let t = e.map(this.getNamespacedKey);
                return await this.rawRemoveMany(t);
              };
              setNamespace = (e) => {
                this.keyNamespace = e;
              };
              parseValue = async (e) => {
                try {
                  if (void 0 !== e) return this.serde.deserializer(e);
                } catch (e) {
                  console.error(e);
                }
              };
            };
        },
        {
          'pify': 'fS8wt',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
      'fS8wt': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r), a.export(r, 'default', () => n));
          let i = (e, t, r, a) =>
              function (...i) {
                let s = t.promiseModule;
                return new s((s, n) => {
                  (t.multiArgs
                    ? i.push((...e) => {
                        t.errorFirst ? (e[0] ? n(e) : (e.shift(), s(e))) : s(e);
                      })
                    : t.errorFirst
                      ? i.push((e, t) => {
                          e ? n(e) : s(t);
                        })
                      : i.push(s),
                    Reflect.apply(e, this === r ? a : this, i));
                });
              },
            s = new WeakMap();
          function n(e, t) {
            t = {
              exclude: [/.+(?:Sync|Stream)$/],
              errorFirst: !0,
              promiseModule: Promise,
              ...t,
            };
            let r = typeof e;
            if (!(null !== e && ('object' === r || 'function' === r)))
              throw TypeError(
                `Expected \`input\` to be a \`Function\` or \`Object\`, got \`${null === e ? 'null' : r}\``,
              );
            let a = (e, r) => {
                let a = s.get(e);
                if ((a || ((a = {}), s.set(e, a)), r in a)) return a[r];
                let i = (e) =>
                    'string' == typeof e || 'symbol' == typeof r
                      ? r === e
                      : e.test(r),
                  n = Reflect.getOwnPropertyDescriptor(e, r),
                  o = void 0 === n || n.writable || n.configurable,
                  l = t.include
                    ? t.include.some((e) => i(e))
                    : !t.exclude.some((e) => i(e)),
                  u = l && o;
                return ((a[r] = u), u);
              },
              n = new WeakMap(),
              o = new Proxy(e, {
                apply(e, r, a) {
                  let s = n.get(e);
                  if (s) return Reflect.apply(s, r, a);
                  let l = t.excludeMain ? e : i(e, t, o, e);
                  return (n.set(e, l), Reflect.apply(l, r, a));
                },
                get(e, r) {
                  let s = e[r];
                  if (!a(e, r) || s === Function.prototype[r]) return s;
                  let l = n.get(s);
                  if (l) return l;
                  if ('function' == typeof s) {
                    let r = i(s, t, o, e);
                    return (n.set(s, r), r);
                  }
                  return s;
                },
              });
            return o;
          }
        },
        { '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2' },
      ],
      '2fzSB': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r),
            a.export(r, 'setupMessageListener', () => n),
            a.export(r, 'getSongInfo', () => o));
          var i = e('webextension-polyfill'),
            s = a.interopDefault(i);
          let n = (e) => {
              (0, s.default).runtime.onMessage.addListener((t) =>
                'getCurrentData' === t.action
                  ? Promise.resolve(e.getCurrentData())
                  : 'updateGradientSettings' === t.action && t.settings
                    ? e
                        .onSettingsUpdate(t.settings)
                        .then(() => ({ success: !0 }))
                    : Promise.resolve(void 0),
              );
            },
            o = () => {
              let e = document.querySelector(
                  '.title.style-scope.ytmusic-player-bar',
                ),
                t = e?.textContent ?? '',
                r = document.querySelector(
                  '.subtitle.style-scope.ytmusic-player-bar',
                ),
                a = r?.textContent?.split('\u2022')[0] ?? '';
              return { title: t, author: a };
            };
        },
        {
          'webextension-polyfill': 'eUP98',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
      'eUP98': [
        function (t, r, a) {
          var i;
          ('undefined' != typeof globalThis
            ? globalThis
            : 'undefined' != typeof self && self,
            (i = function (e) {
              if (
                !(
                  globalThis.chrome &&
                  globalThis.chrome.runtime &&
                  globalThis.chrome.runtime.id
                )
              )
                throw Error(
                  'This script should only be loaded in a browser extension.',
                );
              globalThis.browser &&
              globalThis.browser.runtime &&
              globalThis.browser.runtime.id
                ? (e.exports = globalThis.browser)
                : (e.exports = ((e) => {
                    let t = {
                      alarms: {
                        clear: { minArgs: 0, maxArgs: 1 },
                        clearAll: { minArgs: 0, maxArgs: 0 },
                        get: { minArgs: 0, maxArgs: 1 },
                        getAll: { minArgs: 0, maxArgs: 0 },
                      },
                      bookmarks: {
                        create: { minArgs: 1, maxArgs: 1 },
                        get: { minArgs: 1, maxArgs: 1 },
                        getChildren: { minArgs: 1, maxArgs: 1 },
                        getRecent: { minArgs: 1, maxArgs: 1 },
                        getSubTree: { minArgs: 1, maxArgs: 1 },
                        getTree: { minArgs: 0, maxArgs: 0 },
                        move: { minArgs: 2, maxArgs: 2 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        removeTree: { minArgs: 1, maxArgs: 1 },
                        search: { minArgs: 1, maxArgs: 1 },
                        update: { minArgs: 2, maxArgs: 2 },
                      },
                      browserAction: {
                        disable: {
                          minArgs: 0,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        enable: {
                          minArgs: 0,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                        getBadgeText: { minArgs: 1, maxArgs: 1 },
                        getPopup: { minArgs: 1, maxArgs: 1 },
                        getTitle: { minArgs: 1, maxArgs: 1 },
                        openPopup: { minArgs: 0, maxArgs: 0 },
                        setBadgeBackgroundColor: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        setBadgeText: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        setIcon: { minArgs: 1, maxArgs: 1 },
                        setPopup: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        setTitle: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                      },
                      browsingData: {
                        remove: { minArgs: 2, maxArgs: 2 },
                        removeCache: { minArgs: 1, maxArgs: 1 },
                        removeCookies: { minArgs: 1, maxArgs: 1 },
                        removeDownloads: { minArgs: 1, maxArgs: 1 },
                        removeFormData: { minArgs: 1, maxArgs: 1 },
                        removeHistory: { minArgs: 1, maxArgs: 1 },
                        removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                        removePasswords: { minArgs: 1, maxArgs: 1 },
                        removePluginData: { minArgs: 1, maxArgs: 1 },
                        settings: { minArgs: 0, maxArgs: 0 },
                      },
                      commands: { getAll: { minArgs: 0, maxArgs: 0 } },
                      contextMenus: {
                        remove: { minArgs: 1, maxArgs: 1 },
                        removeAll: { minArgs: 0, maxArgs: 0 },
                        update: { minArgs: 2, maxArgs: 2 },
                      },
                      cookies: {
                        get: { minArgs: 1, maxArgs: 1 },
                        getAll: { minArgs: 1, maxArgs: 1 },
                        getAllCookieStores: { minArgs: 0, maxArgs: 0 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        set: { minArgs: 1, maxArgs: 1 },
                      },
                      devtools: {
                        inspectedWindow: {
                          eval: {
                            minArgs: 1,
                            maxArgs: 2,
                            singleCallbackArg: !1,
                          },
                        },
                        panels: {
                          create: {
                            minArgs: 3,
                            maxArgs: 3,
                            singleCallbackArg: !0,
                          },
                          elements: {
                            createSidebarPane: { minArgs: 1, maxArgs: 1 },
                          },
                        },
                      },
                      downloads: {
                        cancel: { minArgs: 1, maxArgs: 1 },
                        download: { minArgs: 1, maxArgs: 1 },
                        erase: { minArgs: 1, maxArgs: 1 },
                        getFileIcon: { minArgs: 1, maxArgs: 2 },
                        open: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        pause: { minArgs: 1, maxArgs: 1 },
                        removeFile: { minArgs: 1, maxArgs: 1 },
                        resume: { minArgs: 1, maxArgs: 1 },
                        search: { minArgs: 1, maxArgs: 1 },
                        show: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                      },
                      extension: {
                        isAllowedFileSchemeAccess: { minArgs: 0, maxArgs: 0 },
                        isAllowedIncognitoAccess: { minArgs: 0, maxArgs: 0 },
                      },
                      history: {
                        addUrl: { minArgs: 1, maxArgs: 1 },
                        deleteAll: { minArgs: 0, maxArgs: 0 },
                        deleteRange: { minArgs: 1, maxArgs: 1 },
                        deleteUrl: { minArgs: 1, maxArgs: 1 },
                        getVisits: { minArgs: 1, maxArgs: 1 },
                        search: { minArgs: 1, maxArgs: 1 },
                      },
                      i18n: {
                        detectLanguage: { minArgs: 1, maxArgs: 1 },
                        getAcceptLanguages: { minArgs: 0, maxArgs: 0 },
                      },
                      identity: {
                        launchWebAuthFlow: { minArgs: 1, maxArgs: 1 },
                      },
                      idle: { queryState: { minArgs: 1, maxArgs: 1 } },
                      management: {
                        get: { minArgs: 1, maxArgs: 1 },
                        getAll: { minArgs: 0, maxArgs: 0 },
                        getSelf: { minArgs: 0, maxArgs: 0 },
                        setEnabled: { minArgs: 2, maxArgs: 2 },
                        uninstallSelf: { minArgs: 0, maxArgs: 1 },
                      },
                      notifications: {
                        clear: { minArgs: 1, maxArgs: 1 },
                        create: { minArgs: 1, maxArgs: 2 },
                        getAll: { minArgs: 0, maxArgs: 0 },
                        getPermissionLevel: { minArgs: 0, maxArgs: 0 },
                        update: { minArgs: 2, maxArgs: 2 },
                      },
                      pageAction: {
                        getPopup: { minArgs: 1, maxArgs: 1 },
                        getTitle: { minArgs: 1, maxArgs: 1 },
                        hide: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        setIcon: { minArgs: 1, maxArgs: 1 },
                        setPopup: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        setTitle: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                        show: {
                          minArgs: 1,
                          maxArgs: 1,
                          fallbackToNoCallback: !0,
                        },
                      },
                      permissions: {
                        contains: { minArgs: 1, maxArgs: 1 },
                        getAll: { minArgs: 0, maxArgs: 0 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        request: { minArgs: 1, maxArgs: 1 },
                      },
                      runtime: {
                        getBackgroundPage: { minArgs: 0, maxArgs: 0 },
                        getPlatformInfo: { minArgs: 0, maxArgs: 0 },
                        openOptionsPage: { minArgs: 0, maxArgs: 0 },
                        requestUpdateCheck: { minArgs: 0, maxArgs: 0 },
                        sendMessage: { minArgs: 1, maxArgs: 3 },
                        sendNativeMessage: { minArgs: 2, maxArgs: 2 },
                        setUninstallURL: { minArgs: 1, maxArgs: 1 },
                      },
                      sessions: {
                        getDevices: { minArgs: 0, maxArgs: 1 },
                        getRecentlyClosed: { minArgs: 0, maxArgs: 1 },
                        restore: { minArgs: 0, maxArgs: 1 },
                      },
                      storage: {
                        local: {
                          clear: { minArgs: 0, maxArgs: 0 },
                          get: { minArgs: 0, maxArgs: 1 },
                          getBytesInUse: { minArgs: 0, maxArgs: 1 },
                          remove: { minArgs: 1, maxArgs: 1 },
                          set: { minArgs: 1, maxArgs: 1 },
                        },
                        managed: {
                          get: { minArgs: 0, maxArgs: 1 },
                          getBytesInUse: { minArgs: 0, maxArgs: 1 },
                        },
                        sync: {
                          clear: { minArgs: 0, maxArgs: 0 },
                          get: { minArgs: 0, maxArgs: 1 },
                          getBytesInUse: { minArgs: 0, maxArgs: 1 },
                          remove: { minArgs: 1, maxArgs: 1 },
                          set: { minArgs: 1, maxArgs: 1 },
                        },
                      },
                      tabs: {
                        captureVisibleTab: { minArgs: 0, maxArgs: 2 },
                        create: { minArgs: 1, maxArgs: 1 },
                        detectLanguage: { minArgs: 0, maxArgs: 1 },
                        discard: { minArgs: 0, maxArgs: 1 },
                        duplicate: { minArgs: 1, maxArgs: 1 },
                        executeScript: { minArgs: 1, maxArgs: 2 },
                        get: { minArgs: 1, maxArgs: 1 },
                        getCurrent: { minArgs: 0, maxArgs: 0 },
                        getZoom: { minArgs: 0, maxArgs: 1 },
                        getZoomSettings: { minArgs: 0, maxArgs: 1 },
                        goBack: { minArgs: 0, maxArgs: 1 },
                        goForward: { minArgs: 0, maxArgs: 1 },
                        highlight: { minArgs: 1, maxArgs: 1 },
                        insertCSS: { minArgs: 1, maxArgs: 2 },
                        move: { minArgs: 2, maxArgs: 2 },
                        query: { minArgs: 1, maxArgs: 1 },
                        reload: { minArgs: 0, maxArgs: 2 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        removeCSS: { minArgs: 1, maxArgs: 2 },
                        sendMessage: { minArgs: 2, maxArgs: 3 },
                        setZoom: { minArgs: 1, maxArgs: 2 },
                        setZoomSettings: { minArgs: 1, maxArgs: 2 },
                        update: { minArgs: 1, maxArgs: 2 },
                      },
                      topSites: { get: { minArgs: 0, maxArgs: 0 } },
                      webNavigation: {
                        getAllFrames: { minArgs: 1, maxArgs: 1 },
                        getFrame: { minArgs: 1, maxArgs: 1 },
                      },
                      webRequest: {
                        handlerBehaviorChanged: { minArgs: 0, maxArgs: 0 },
                      },
                      windows: {
                        create: { minArgs: 0, maxArgs: 1 },
                        get: { minArgs: 1, maxArgs: 2 },
                        getAll: { minArgs: 0, maxArgs: 1 },
                        getCurrent: { minArgs: 0, maxArgs: 1 },
                        getLastFocused: { minArgs: 0, maxArgs: 1 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        update: { minArgs: 2, maxArgs: 2 },
                      },
                    };
                    if (0 === Object.keys(t).length)
                      throw Error(
                        'api-metadata.json has not been included in browser-polyfill',
                      );
                    class r extends WeakMap {
                      constructor(e, t) {
                        (super(t), (this.createItem = e));
                      }
                      get(e) {
                        return (
                          this.has(e) || this.set(e, this.createItem(e)),
                          super.get(e)
                        );
                      }
                    }
                    let a = (e) =>
                        e &&
                        'object' == typeof e &&
                        'function' == typeof e.then,
                      i =
                        (t, r) =>
                        (...a) => {
                          e.runtime.lastError
                            ? t.reject(Error(e.runtime.lastError.message))
                            : r.singleCallbackArg ||
                                (a.length <= 1 && !1 !== r.singleCallbackArg)
                              ? t.resolve(a[0])
                              : t.resolve(a);
                        },
                      s = (e) => (1 == e ? 'argument' : 'arguments'),
                      n = (e, t) =>
                        function (r, ...a) {
                          if (a.length < t.minArgs)
                            throw Error(
                              `Expected at least ${t.minArgs} ${s(t.minArgs)} for ${e}(), got ${a.length}`,
                            );
                          if (a.length > t.maxArgs)
                            throw Error(
                              `Expected at most ${t.maxArgs} ${s(t.maxArgs)} for ${e}(), got ${a.length}`,
                            );
                          return new Promise((s, n) => {
                            if (t.fallbackToNoCallback)
                              try {
                                r[e](...a, i({ resolve: s, reject: n }, t));
                              } catch (i) {
                                (console.warn(
                                  `${e} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,
                                  i,
                                ),
                                  r[e](...a),
                                  (t.fallbackToNoCallback = !1),
                                  (t.noCallback = !0),
                                  s());
                              }
                            else
                              t.noCallback
                                ? (r[e](...a), s())
                                : r[e](...a, i({ resolve: s, reject: n }, t));
                          });
                        },
                      o = (e, t, r) =>
                        new Proxy(t, {
                          apply: (t, a, i) => r.call(a, e, ...i),
                        }),
                      l = Function.call.bind(Object.prototype.hasOwnProperty),
                      u = (e, t = {}, r = {}) => {
                        let a = Object.create(null),
                          i = Object.create(e);
                        return new Proxy(i, {
                          has: (t, r) => r in e || r in a,
                          get(i, s, g) {
                            if (s in a) return a[s];
                            if (!(s in e)) return;
                            let m = e[s];
                            if ('function' == typeof m) {
                              if ('function' == typeof t[s])
                                m = o(e, e[s], t[s]);
                              else if (l(r, s)) {
                                let t = n(s, r[s]);
                                m = o(e, e[s], t);
                              } else m = m.bind(e);
                            } else if (
                              'object' == typeof m &&
                              null !== m &&
                              (l(t, s) || l(r, s))
                            )
                              m = u(m, t[s], r[s]);
                            else {
                              if (!l(r, '*'))
                                return (
                                  Object.defineProperty(a, s, {
                                    configurable: !0,
                                    enumerable: !0,
                                    get: () => e[s],
                                    set(t) {
                                      e[s] = t;
                                    },
                                  }),
                                  m
                                );
                              m = u(m, t[s], r['*']);
                            }
                            return ((a[s] = m), m);
                          },
                          set: (t, r, i, s) => (
                            r in a ? (a[r] = i) : (e[r] = i),
                            !0
                          ),
                          defineProperty: (e, t, r) =>
                            Reflect.defineProperty(a, t, r),
                          deleteProperty: (e, t) =>
                            Reflect.deleteProperty(a, t),
                        });
                      },
                      g = (e) => ({
                        addListener(t, r, ...a) {
                          t.addListener(e.get(r), ...a);
                        },
                        hasListener: (t, r) => t.hasListener(e.get(r)),
                        removeListener(t, r) {
                          t.removeListener(e.get(r));
                        },
                      }),
                      m = new r((e) =>
                        'function' != typeof e
                          ? e
                          : function (t) {
                              let r = u(
                                t,
                                {},
                                { getContent: { minArgs: 0, maxArgs: 0 } },
                              );
                              e(r);
                            },
                      ),
                      c = new r((e) =>
                        'function' != typeof e
                          ? e
                          : function (t, r, i) {
                              let s,
                                n,
                                o = !1,
                                l = new Promise((e) => {
                                  s = function (t) {
                                    ((o = !0), e(t));
                                  };
                                });
                              try {
                                n = e(t, r, s);
                              } catch (e) {
                                n = Promise.reject(e);
                              }
                              let u = !0 !== n && a(n);
                              return (
                                (!0 === n || !!u || !!o) &&
                                (((e) => {
                                  e.then(
                                    (e) => {
                                      i(e);
                                    },
                                    (e) => {
                                      i({
                                        __mozWebExtensionPolyfillReject__: !0,
                                        message:
                                          e &&
                                          (e instanceof Error ||
                                            'string' == typeof e.message)
                                            ? e.message
                                            : 'An unexpected error occurred',
                                      });
                                    },
                                  ).catch((e) => {
                                    console.error(
                                      'Failed to send onMessage rejected reply',
                                      e,
                                    );
                                  });
                                })(u ? n : l),
                                !0)
                              );
                            },
                      ),
                      d = ({ reject: t, resolve: r }, a) => {
                        e.runtime.lastError
                          ? 'The message port closed before a response was received.' ===
                            e.runtime.lastError.message
                            ? r()
                            : t(Error(e.runtime.lastError.message))
                          : a && a.__mozWebExtensionPolyfillReject__
                            ? t(Error(a.message))
                            : r(a);
                      },
                      p = (e, t, r, ...a) => {
                        if (a.length < t.minArgs)
                          throw Error(
                            `Expected at least ${t.minArgs} ${s(t.minArgs)} for ${e}(), got ${a.length}`,
                          );
                        if (a.length > t.maxArgs)
                          throw Error(
                            `Expected at most ${t.maxArgs} ${s(t.maxArgs)} for ${e}(), got ${a.length}`,
                          );
                        return new Promise((e, t) => {
                          let i = d.bind(null, { resolve: e, reject: t });
                          (a.push(i), r.sendMessage(...a));
                        });
                      },
                      h = {
                        devtools: { network: { onRequestFinished: g(m) } },
                        runtime: {
                          onMessage: g(c),
                          onMessageExternal: g(c),
                          sendMessage: p.bind(null, 'sendMessage', {
                            minArgs: 1,
                            maxArgs: 3,
                          }),
                        },
                        tabs: {
                          sendMessage: p.bind(null, 'sendMessage', {
                            minArgs: 2,
                            maxArgs: 3,
                          }),
                        },
                      },
                      f = {
                        clear: { minArgs: 1, maxArgs: 1 },
                        get: { minArgs: 1, maxArgs: 1 },
                        set: { minArgs: 1, maxArgs: 1 },
                      };
                    return (
                      (t.privacy = {
                        network: { '*': f },
                        services: { '*': f },
                        websites: { '*': f },
                      }),
                      u(e, h, t)
                    );
                  })(chrome));
            }),
            'function' == typeof e && e.amd
              ? e('webextension-polyfill', ['module'], i)
              : i(r));
        },
        {},
      ],
      'gW2L7': [
        function (e, t, r) {
          var a = e('@parcel/transformer-js/src/esmodule-helpers.js');
          (a.defineInteropFlag(r),
            a.export(r, 'initialize', () => x),
            a.export(r, 'cleanup', () => E));
          var i = e('../../shared/utils/logger'),
            s = e('./audioAnalysis');
          let n = null,
            o = null,
            l = null,
            u = null,
            g = null,
            m = null,
            c = null,
            d = null,
            p = null,
            h = null,
            f = 'visible',
            A = 0,
            x = (e, t) => {
              let r;
              let a = !1;
              ((d = () => {
                a ||
                  (clearTimeout(r),
                  (r = setTimeout(() => {
                    ((a = !0),
                      Promise.resolve(e()).finally(() => {
                        a = !1;
                      }));
                  }, 300)));
              }),
                (p = t ?? null),
                y(),
                b(),
                w(),
                v(),
                T());
            },
            y = () => {
              if (!d) return;
              l = new MutationObserver((e) => {
                for (let t of e)
                  if (
                    ('attributes' === t.type && 'src' === t.attributeName) ||
                    ('childList' === t.type && t.addedNodes.length > 0)
                  ) {
                    d?.();
                    break;
                  }
              });
              let e = () => {
                  let e = document.getElementById('song-image');
                  e &&
                    l &&
                    l.observe(e, {
                      childList: !0,
                      subtree: !0,
                      attributes: !0,
                      attributeFilter: ['src'],
                    });
                  let t = document.querySelector(
                    'ytmusic-player-bar .thumbnail',
                  );
                  t &&
                    l &&
                    l.observe(t, {
                      childList: !0,
                      subtree: !0,
                      attributes: !0,
                      attributeFilter: ['src'],
                    });
                },
                t = () => {
                  let r = document.getElementById('song-image'),
                    a = document.querySelector('ytmusic-player-bar');
                  (r || a) && l
                    ? (e(), (m = null))
                    : (m = window.setTimeout(t, 1e3));
                };
              t();
            },
            b = () => {
              let e = new URL(window.location.href).searchParams.get('v');
              ((n = () => {
                let t = new URL(window.location.href).searchParams.get('v');
                t &&
                  t !== e &&
                  ((0, i.logger).log('Video ID changed:', e, '->', t),
                  (e = t),
                  (0, s.checkAndReconnectElement)(),
                  p?.(),
                  d?.(),
                  c && clearTimeout(c),
                  (c = setTimeout(() => {
                    ((0, i.logger).log(
                      'Navigation retry - checking for updated album art',
                    ),
                      d?.(),
                      (c = null));
                  }, 1500)));
              }),
                document.addEventListener('yt-navigate-finish', n),
                window.addEventListener('popstate', n));
            },
            w = () => {
              let e = '';
              o = () => {
                let t = document.querySelector('video');
                t &&
                  t.src &&
                  t.src !== e &&
                  ((e = t.src),
                  (0, i.logger).log(
                    'Video source changed - re-extracting colors',
                  ),
                  (0, s.checkAndReconnectElement)(),
                  p?.(),
                  setTimeout(() => {
                    d?.();
                  }, 500));
              };
              let t = (e) => {
                  o &&
                    (e.removeEventListener('play', o),
                    e.removeEventListener('loadeddata', o),
                    e.addEventListener('play', o),
                    e.addEventListener('loadeddata', o));
                },
                r = document.querySelector('video');
              (r && t(r),
                (g = new MutationObserver(() => {
                  let e = document.querySelector('video');
                  e && t(e);
                })));
              let a = document.querySelector('ytmusic-app');
              a && g.observe(a, { childList: !0, subtree: !0 });
            },
            v = () => {
              u = new MutationObserver((e) => {
                for (let t of e)
                  if ('childList' === t.type) {
                    let e = Array.from(t.addedNodes).some(
                        (e) => e instanceof Element && 'player-page' === e.id,
                      ),
                      r = Array.from(t.removedNodes).some(
                        (e) => e instanceof Element && 'player-page' === e.id,
                      );
                    if (e || r) {
                      d?.();
                      break;
                    }
                  }
              });
              let e = document.querySelector('ytmusic-app');
              e && u.observe(e, { childList: !0, subtree: !1 });
            },
            T = () => {
              ((h = setInterval(() => {
                let e = document.visibilityState;
                if (e !== f) {
                  if ('hidden' === e)
                    ((A = Date.now()), (0, i.logger).log('Tab hidden'));
                  else if ('visible' === e && 'hidden' === f) {
                    let e = Date.now() - A;
                    e >= 6e4
                      ? ((0, i.logger).log(
                          `Tab visible after ${Math.round(e / 1e3)}s, refreshing gradient`,
                        ),
                        p?.(),
                        d?.())
                      : (0, i.logger).log(
                          `Tab visible after ${Math.round(e / 1e3)}s, skipping refresh`,
                        );
                  }
                  f = e;
                }
              }, 5e3)),
                (0, i.logger).log('Visibility polling started'));
            },
            E = () => {
              if (
                (h && (clearInterval(h), (h = null), (f = 'visible'), (A = 0)),
                n &&
                  (document.removeEventListener('yt-navigate-finish', n),
                  window.removeEventListener('popstate', n),
                  (n = null)),
                o)
              ) {
                let e = document.querySelector('video');
                (e &&
                  (e.removeEventListener('play', o),
                  e.removeEventListener('loadeddata', o)),
                  (o = null));
              }
              (null !== c && (clearTimeout(c), (c = null)),
                null !== m && (clearTimeout(m), (m = null)),
                l && (l.disconnect(), (l = null)),
                u && (u.disconnect(), (u = null)),
                g && (g.disconnect(), (g = null)),
                (d = null),
                (p = null));
            };
        },
        {
          '../../shared/utils/logger': '4b2II',
          './audioAnalysis': '5x9EN',
          '@parcel/transformer-js/src/esmodule-helpers.js': 'fRZO2',
        },
      ],
    },
    ['5VIml'],
    '5VIml',
    'parcelRequire9d8c',
  ),
  (globalThis.define = t));
