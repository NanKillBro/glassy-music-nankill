(() => {
  'use strict';
  let e, t, i, r;
  var n = {},
    s = {};
  function a(e) {
    var t = s[e];
    if (void 0 !== t) return t.exports;
    var i = (s[e] = { exports: {} });
    return (n[e](i, i.exports, a), i.exports);
  }
  ((a.rv = () => '1.6.8'), (a.ruid = 'bundler=rspack@1.6.8'));
  let l = 'tab-header style-scope ytmusic-player-page',
    o = 'blyrics-container',
    u = 'blyrics--active',
    c = 'blyrics-rtl',
    d = 'blyrics--word',
    h = 'blyrics-background-lyric',
    p = 'blyrics--animating',
    m = 'blyrics--paused',
    g = 'blyrics--pre-animating',
    f = 'blyrics-user-scrolling',
    y = 'blyrics--translated',
    b = 'blyrics--romanized',
    M = 'blyrics-footer',
    v = '#tab-renderer',
    w =
      '#tab-renderer > ytmusic-message-renderer > yt-formatted-string.text.style-scope.ytmusic-message-renderer',
    N = 'blyrics-loader',
    S = 'blyrics-wrapper',
    E = 'blyrics-spacing-element',
    x = 'blyrics-dfs',
    I = 'blyrics-hidden',
    L =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMTU4XzUpIj4KPHBhdGggZD0iTTEwMjYgNTEyQzEwMjYgNzk0Ljc3IDc5Ni43NyAxMDI0IDUxNCAxMDI0QzIzMS4yMyAxMDI0IDIgNzk0Ljc3IDIgNTEyQzIgMjI5LjIzIDIzMS4yMyAwIDUxNCAwQzc5Ni43NyAwIDEwMjYgMjI5LjIzIDEwMjYgNTEyWiIgZmlsbD0iI0Y2RjA2OSIvPgo8cGF0aCBkPSJNNzcyLjE1MiA0NjkuMzI3Qzc3MS45MTkgNDU2LjAxOCA3NzAuNTE5IDQ0Mi44NjMgNzY4LjM0MyA0MjkuNzg2Qzc1OS44NjkgMzgwLjQxNyA3MzkuMDM1IDMzNi44NTEgNzA2LjYxOCAyOTguNzAyQzcwMy4yNzYgMjk0Ljc1NiA2OTkuNzc3IDI5MC45NjQgNjk2LjEyNCAyODcuMjVDNjkzLjg2OSAyODQuOTI5IDY5MC45OTMgMjg0LjY5NiA2ODguNzM5IDI4Ni4yNDRDNjg2LjU2MiAyODcuNzE0IDY4NS45NCAyODkuOTU4IDY4Ni44NzMgMjkzLjEzMUM2ODcuMTA2IDI5My45MDUgNjg3LjQxNyAyOTQuNjAxIDY4Ny42NSAyOTUuMjk4QzcwMC4wODggMzI4LjMzOSA3MDYuNDYzIDM2Mi40NjQgNzA2LjY5NiAzOTcuNzVDNzA2LjM4NSA0MDQuMTczIDcwNi4wNzQgNDEwLjU5NSA3MDUuNzYzIDQxNy4wMThDNzA0LjgzIDQzNC41ODMgNzAyLjAzMiA0NTEuODM5IDY5Ny42MDEgNDY4Ljc4NkM2ODMuMzc1IDUyMy4zMzkgNjU1Ljg1NSA1NzAuMjMyIDYxNC4zNDMgNjA4LjUzNkM1NjAuMjM3IDY1OC40NDYgNDk1Ljk0NyA2ODQuMTM3IDQyMi4yNTEgNjg2LjIyNkM0MDMuNjcxIDY4Ni43NjggMzg1LjI0NyA2ODUuMjIgMzY2Ljk3OSA2ODIuMDQ4QzM0OC4zMjIgNjc4Ljg3NSAzMzAuMDUzIDY3My45MjMgMzEyLjQwNiA2NjcuMTEzQzMwOC41MTkgNjY1LjY0MyAzMDUuNzk5IDY2Ni4zMzkgMzA0LjI0NCA2NjkuMDQ4QzMwMi42ODkgNjcxLjYwMSAzMDMuMzExIDY3NCAzMDYuMzQzIDY3Ni44NjNDMzA4LjkwOCA2NzkuMjYyIDMxMS40NzMgNjgxLjU4MyAzMTQuMTE3IDY4My45MDVDMzY0LjgwMiA3MjcuNjI1IDQyMy44MDYgNzUwLjE0MyA0OTAuNzM5IDc1Mi4wNzdDNTA2LjkwOCA3NTIuNTQyIDUyMy4wNzggNzUxLjMwNCA1MzkuMDkyIDc0OC42NzNDNTk2Ljc3NCA3MzkuMzg3IDY0Ny4xNDggNzE0Ljg1NyA2ODguNzM5IDY3NEM3NDUuNzk5IDYxNy45NzYgNzczLjcwNyA1NDkuNDk0IDc3Mi4xNTIgNDY5LjMyN1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0zMjguMjY1IDU0NC41NDJDMzMwLjUxOSA1NDIuODM5IDMzMC45MDggNTQwLjU5NSAzMjkuNjY0IDUzNi44MDRDMzI5LjUwOSA1MzYuNDE3IDMyOS40MzEgNTM2LjEwNyAzMjkuMjc2IDUzNS43MkMzMTkuNjM2IDUwOC42MzcgMzE2LjkxNSA0ODAuNzggMzIxLjAzNSA0NTIuMzgxQzMyNi40NzcgNDE1LjAwNiAzNDIuNDEzIDM4Mi42NjEgMzY4LjM3OCAzNTUuMjY4QzM3MC40NzcgMzUzLjAyNCAzNzEuNDg4IDM1MC43OCAzNzEuNDg4IDM0Ny42ODVDMzcxLjQxIDMzOC4wMTIgMzcxLjQxIDMyOC4zMzkgMzcxLjQxIDMxOC42NjdDMzcxLjQxIDMwOS4xNDkgMzcxLjQxIDI5OS41NTQgMzcxLjQxIDI5MC4wMzZDMzcxLjQxIDI4My44NDUgMzY5LjU0NCAyODEuOTExIDM2My4zMjUgMjgxLjkxMUMzNDQuMTI0IDI4MS45MTEgMzI1IDI4MS45MTEgMzA1Ljc5OSAyODEuODMzQzMwMi42MTEgMjgxLjgzMyAzMDAuMDQ2IDI4Mi43NjIgMjk3Ljc5MiAyODQuOTI5QzI2NS45MTkgMzE1LjgwNCAyNDguOTcyIDM1My40ODggMjQ2LjMyOSAzOTcuNTE4QzI0NS4zMTggNDE0LjMxIDI0Ny4yNjEgNDMwLjk0NiAyNTEuNjE1IDQ0Ny4yNzRDMjYyLjQ5OCA0ODcuOTc2IDI4NS41MDkgNTIwLjA4OSAzMjAuNDEzIDU0My43NjhDMzIzLjkxMiA1NDYuMTY3IDMyNS45MzMgNTQ2LjMyMSAzMjguMjY1IDU0NC41NDJaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNNDM0LjUzNCA0MjMuMjA4QzQzOS4yNzYgNDU4LjQ5NCA0NzIuNzgxIDQ4My40MTEgNTA4LjA3NCA0NzcuNzYyQzUzOS40MDMgNDcyLjczMiA1NjIuMTggNDQ2LjE5IDU2Mi4xOCA0MTQuNTQyQzU2Mi4xOCA0MDguMTk2IDU2Mi4xOCA0MDEuOTI5IDU2Mi4xOCAzOTUuNTgzQzU2Mi4xOCAzODcuMzA0IDU2Mi4xOCAzNzkuMTAxIDU2Mi4xOCAzNzAuODIxQzU2Mi4xOCAzNjUuNTYgNTYzLjU4IDM2NC4yNDQgNTY4Ljg2NiAzNjQuMTY3QzU3My43NjMgMzY0LjA4OSA1NzguNzM5IDM2NC4yNDQgNTgzLjYzNiAzNjQuMDg5QzU4OC4xNDUgMzYzLjkzNSA1OTAuMTY2IDM2MS4yMjYgNTg5LjM4OSAzNTYuODkzQzU4OS4yMzMgMzU2LjExOSA1ODkuMTU1IDM1NS4zNDUgNTg5IDM1NC42NDlDNTgzLjA5MiAzMjkuODEgNTcyLjM2NCAzMDcuMzY5IDU1Ni44MTYgMjg3LjA5NUM1NTMuOTQgMjgzLjM4MSA1NTAuNzUzIDI4MS45ODggNTQ2LjI0NCAyODIuMDY1QzUzMy4xODQgMjgyLjIyIDUyMC4xMjQgMjgyLjA2NSA1MDYuOTg2IDI4Mi4xNDNDNTA1LjU4NyAyODIuMTQzIDUwNC4xMSAyODIuMjIgNTAyLjcxIDI4Mi40NTJDNDk5LjQ0NSAyODIuOTk0IDQ5Ny45NjggMjg0LjU0MiA0OTcuNTAyIDI4Ny43OTJDNDk3LjM0NiAyODkuMDMgNDk3LjQyNCAyOTAuMzQ1IDQ5Ny40MjQgMjkxLjY2MUM0OTcuNDI0IDMxMS45MzUgNDk3LjQyNCAzMzIuMTMxIDQ5Ny40MjQgMzUyLjQwNUM0OTcuNDI0IDM2MC43NjIgNDk1Ljc5MiAzNjguODEgNDkyLjM3MSAzNzYuNDdDNDgyLjI2NSAzOTguNjAxIDQ2NC43NzQgNDEwLjkwNSA0NDAuNjc1IDQxNC4xNTVDNDM1LjYyMiA0MTQuODUxIDQzNC4xNDUgNDE2LjQ3NiA0MzQuMzc4IDQyMS40MjlDNDM0LjQ1NiA0MjEuODkzIDQzNC40NTYgNDIyLjU4OSA0MzQuNTM0IDQyMy4yMDhaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE1OF81Ij4KPHJlY3Qgd2lkdGg9IjEwMjQiIGhlaWdodD0iMTAyNCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4=',
    k = 'https://lrclibup.boidu.dev/',
    T = 'https://lyrics.api.dacubeking.com/',
    A = {
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'zh-CN': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'ru': 'Russian',
      'hi': 'Hindi',
      'ar': 'Arabic',
      'th': 'Thai',
      'el': 'Greek',
      'he': 'Hebrew',
      'bn': 'Bengali',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ml': 'Malayalam',
      'kn': 'Kannada',
      'gu': 'Gujarati',
      'pa': 'Punjabi',
      'mr': 'Marathi',
      'ur': 'Urdu',
      'si': 'Sinhala',
      'my': 'Burmese',
      'ka': 'Georgian',
      'km': 'Khmer',
      'lo': 'Lao',
      'fa': 'Persian',
    },
    C = '[BetterLyrics]',
    D = '[BetterLyrics:Content]',
    j = '[BetterLyrics] Error:',
    z =
      '[BetterLyrics] (Safe to ignore) Lyrics wrapper is not visible, unable to inject lyrics',
    O = '[BetterLyrics] Unable to translate lyrics due to error',
    R = '[BetterLyrics] Server Error:',
    P = 'ytmusic-player-bar',
    V = 'is-advertisement',
    U = 'blyrics-ad-overlay',
    $ = [
      {
        key: 'bLyrics-richsynced',
        displayName: 'Better Lyrics',
        syncType: 'syllable',
        priority: 0,
      },
      {
        key: 'musixmatch-richsync',
        displayName: 'Musixmatch',
        syncType: 'word',
        priority: 1,
      },
      {
        key: 'yt-captions',
        displayName: 'Youtube Captions',
        syncType: 'line',
        priority: 2,
      },
      {
        key: 'bLyrics-synced',
        displayName: 'Better Lyrics',
        syncType: 'line',
        priority: 3,
      },
      {
        key: 'lrclib-synced',
        displayName: 'LRCLib',
        syncType: 'line',
        priority: 4,
      },
      {
        key: 'legato-synced',
        displayName: 'Legato',
        syncType: 'line',
        priority: 5,
      },
      {
        key: 'musixmatch-synced',
        displayName: 'Musixmatch',
        syncType: 'line',
        priority: 6,
      },
      {
        key: 'yt-lyrics',
        displayName: 'Youtube',
        syncType: 'unsynced',
        priority: 7,
      },
      {
        key: 'lrclib-plain',
        displayName: 'LRCLib',
        syncType: 'unsynced',
        priority: 8,
      },
    ],
    B = $.map((e) => e.key);
  function _(e, t) {
    return chrome.i18n.getMessage(e, t) || e;
  }
  let F = (e, t, i = 2, r = !1) => {
      if (
        (r || ((e = e.toLowerCase()), (t = t.toLowerCase())),
        e.length < i || t.length < i)
      )
        return 0;
      let n = new Map();
      for (let t = 0; t < e.length - (i - 1); t++) {
        let r = e.substring(t, t + i);
        n.set(r, n.has(r) ? n.get(r) + 1 : 1);
      }
      let s = 0;
      for (let e = 0; e < t.length - (i - 1); e++) {
        let r = t.substring(e, e + i),
          a = n.has(r) ? n.get(r) : 0;
        a > 0 && (n.set(r, a - 1), s++);
      }
      return (2 * s) / (e.length + t.length - (i - 1) * 2);
    },
    W = (e) =>
      /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u.test(
        e,
      ),
    Y = /[^\p{Script_Extensions=Latin}\p{Script_Extensions=Common}]/u;
  function Q(e) {
    return Y.test(e);
  }
  let q = [
    [/\p{Script=Hiragana}|\p{Script=Katakana}/u, 'ja'],
    [/\p{Script=Hangul}/u, 'ko'],
    [/\p{Script=Han}/u, 'zh'],
    [/\p{Script=Cyrillic}/u, 'ru'],
    [/\p{Script=Devanagari}/u, 'hi'],
    [/\p{Script=Arabic}/u, 'ar'],
    [/\p{Script=Thai}/u, 'th'],
    [/\p{Script=Greek}/u, 'el'],
    [/\p{Script=Hebrew}/u, 'he'],
    [/\p{Script=Bengali}/u, 'bn'],
    [/\p{Script=Tamil}/u, 'ta'],
    [/\p{Script=Telugu}/u, 'te'],
    [/\p{Script=Malayalam}/u, 'ml'],
    [/\p{Script=Kannada}/u, 'kn'],
    [/\p{Script=Gujarati}/u, 'gu'],
    [/\p{Script=Gurmukhi}/u, 'pa'],
    [/\p{Script=Sinhala}/u, 'si'],
    [/\p{Script=Myanmar}/u, 'my'],
    [/\p{Script=Georgian}/u, 'ka'],
    [/\p{Script=Khmer}/u, 'km'],
    [/\p{Script=Lao}/u, 'lo'],
  ];
  function G(e) {
    for (let [t, i] of q) if (t.test(e)) return i;
    return null;
  }
  var H =
      (((i = H || {}).SYNTAX_ERROR = 'SYNTAX_ERROR'),
      (i.UNEXPECTED_TOKEN = 'UNEXPECTED_TOKEN'),
      (i.UNCLOSED_BLOCK = 'UNCLOSED_BLOCK'),
      (i.UNCLOSED_STRING = 'UNCLOSED_STRING'),
      (i.UNDEFINED_VARIABLE = 'UNDEFINED_VARIABLE'),
      (i.INVALID_VARIABLE_NAME = 'INVALID_VARIABLE_NAME'),
      (i.UNDEFINED_FUNCTION = 'UNDEFINED_FUNCTION'),
      (i.UNDEFINED_MIXIN = 'UNDEFINED_MIXIN'),
      (i.WRONG_ARG_COUNT = 'WRONG_ARG_COUNT'),
      (i.MISSING_RETURN = 'MISSING_RETURN'),
      (i.INVALID_LOOP_RANGE = 'INVALID_LOOP_RANGE'),
      (i.MAX_ITERATIONS = 'MAX_ITERATIONS'),
      (i.MAX_OUTPUT_RULES = 'MAX_OUTPUT_RULES'),
      (i.MAX_NESTING_DEPTH = 'MAX_NESTING_DEPTH'),
      (i.MAX_INPUT_SIZE = 'MAX_INPUT_SIZE'),
      (i.TIMEOUT = 'TIMEOUT'),
      (i.TYPE_ERROR = 'TYPE_ERROR'),
      (i.INVALID_UNIT = 'INVALID_UNIT'),
      (i.DIVISION_BY_ZERO = 'DIVISION_BY_ZERO'),
      i),
    Z = [1, 10, 100, 1e3],
    X = Math.PI / 180,
    K = 180 / Math.PI,
    J = 1 / 2.4,
    ee =
      /^oklch\s*\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/,
    et = /^#([0-9a-f]{3,8})$/i,
    ei =
      /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/,
    er = {
      black: [0, 0, 0],
      white: [255, 255, 255],
      red: [255, 0, 0],
      green: [0, 128, 0],
      blue: [0, 0, 255],
      yellow: [255, 255, 0],
      cyan: [0, 255, 255],
      magenta: [255, 0, 255],
      gray: [128, 128, 128],
      grey: [128, 128, 128],
      silver: [192, 192, 192],
      maroon: [128, 0, 0],
      olive: [128, 128, 0],
      lime: [0, 255, 0],
      aqua: [0, 255, 255],
      teal: [0, 128, 128],
      navy: [0, 0, 128],
      fuchsia: [255, 0, 255],
      purple: [128, 0, 128],
      orange: [255, 165, 0],
      pink: [255, 192, 203],
      brown: [165, 42, 42],
      transparent: [0, 0, 0],
    };
  function en(e) {
    let t = Math.round(Math.max(0, Math.min(255, e))).toString(16);
    return 1 === t.length ? '0' + t : t;
  }
  function es(e, t) {
    let i = Z[t];
    return Math.round(e * i) / i;
  }
  function ea(e) {
    return (e /= 255) <= 0.04045
      ? e / 12.92
      : Math.pow((e + 0.055) / 1.055, 2.4);
  }
  function el(e) {
    return e <= 0
      ? 0
      : e >= 1
        ? 255
        : Math.round(
            (e <= 0.0031308 ? 12.92 * e : 1.055 * Math.pow(e, J) - 0.055) * 255,
          );
  }
  function eo(e) {
    switch (e.type) {
      case 'number':
        if (Number.isInteger(e.value)) return `${e.value}${e.unit}`;
        let t = Math.round(1e6 * e.value) / 1e6,
          i = t.toString();
        return i.includes('e') || i.includes('E')
          ? `${t.toFixed(10).replace(/\.?0+$/, '')}${e.unit}`
          : `${t}${e.unit}`;
      case 'string':
        return e.quoted ? `"${e.value}"` : e.value;
      case 'color':
        return (function (e) {
          let { r: t, g: i, b: r, a: n, format: s, original: a } = e;
          if (a) return a;
          switch (s) {
            case 'oklch': {
              let e,
                s,
                a,
                l,
                o,
                u,
                c,
                d,
                h,
                p,
                [m, g, f] =
                  ((e = ea(t)),
                  (h = Math.sqrt(
                    (c =
                      1.9779984951 *
                        (l = Math.cbrt(
                          0.4122214708 * e +
                            0.5363325363 * (s = ea(i)) +
                            0.0514459929 * (a = ea(r)),
                        )) -
                      2.428592205 *
                        (o = Math.cbrt(
                          0.2119034982 * e +
                            0.6806995451 * s +
                            0.1073969566 * a,
                        )) +
                      0.4505937099 *
                        (u = Math.cbrt(
                          0.0883024619 * e +
                            0.2817188376 * s +
                            0.6299787005 * a,
                        ))) *
                      c +
                      (d =
                        0.0259040371 * l + 0.7827717662 * o - 0.808675766 * u) *
                        d,
                  )),
                  (p = Math.atan2(d, c) * K) < 0 && (p += 360),
                  [
                    0.2104542553 * l + 0.793617785 * o - 0.0040720468 * u,
                    h,
                    p,
                  ]);
              return 1 === n
                ? `oklch(${es(100 * m, 1)}% ${es(g, 3)} ${es(f, 3)})`
                : `oklch(${es(100 * m, 1)}% ${es(g, 3)} ${es(f, 3)} / ${es(n, 2)})`;
            }
            case 'hsl': {
              let [e, s, a] = (function (e, t, i) {
                e /= 255;
                let r = Math.max(e, (t /= 255), (i /= 255)),
                  n = Math.min(e, t, i),
                  s = (r + n) / 2,
                  a = 0,
                  l = 0;
                if (r !== n) {
                  let o = r - n;
                  switch (((l = s > 0.5 ? o / (2 - r - n) : o / (r + n)), r)) {
                    case e:
                      a = ((t - i) / o + 6 * (t < i)) * 60;
                      break;
                    case t:
                      a = ((i - e) / o + 2) * 60;
                      break;
                    case i:
                      a = ((e - t) / o + 4) * 60;
                  }
                }
                return [a, 100 * l, 100 * s];
              })(t, i, r);
              return 1 === n
                ? `hsl(${es(e, 1)}, ${es(s, 1)}%, ${es(a, 1)}%)`
                : `hsla(${es(e, 1)}, ${es(s, 1)}%, ${es(a, 1)}%, ${es(n, 2)})`;
            }
            case 'rgb':
              return 1 === n
                ? `rgb(${Math.round(t)}, ${Math.round(i)}, ${Math.round(r)})`
                : `rgba(${Math.round(t)}, ${Math.round(i)}, ${Math.round(r)}, ${es(n, 2)})`;
            default:
              return 1 === n
                ? `#${en(t)}${en(i)}${en(r)}`
                : `rgba(${Math.round(t)}, ${Math.round(i)}, ${Math.round(r)}, ${es(n, 2)})`;
          }
        })(e);
      case 'boolean':
        return e.value ? 'true' : 'false';
      case 'list':
        return e.values.map(eo).join(',' === e.separator ? ', ' : ' ');
      case 'map':
        let r = [];
        return (
          e.entries.forEach((e, t) => {
            r.push(`${t}: ${eo(e)}`);
          }),
          `(${r.join(', ')})`
        );
      case 'null':
        return 'null';
    }
  }
  function eu(e) {
    let t = e.trim().toLowerCase(),
      i = er[t];
    if (i)
      return {
        type: 'color',
        r: i[0],
        g: i[1],
        b: i[2],
        a: +('transparent' !== t),
        format: 'hex',
        original: t,
      };
    let r = t.match(et);
    if (r) {
      let e = r[1],
        t,
        i,
        n,
        s = 1;
      if (3 === e.length)
        ((t = parseInt(e[0] + e[0], 16)),
          (i = parseInt(e[1] + e[1], 16)),
          (n = parseInt(e[2] + e[2], 16)));
      else if (4 === e.length)
        ((t = parseInt(e[0] + e[0], 16)),
          (i = parseInt(e[1] + e[1], 16)),
          (n = parseInt(e[2] + e[2], 16)),
          (s = parseInt(e[3] + e[3], 16) / 255));
      else if (6 === e.length)
        ((t = parseInt(e.slice(0, 2), 16)),
          (i = parseInt(e.slice(2, 4), 16)),
          (n = parseInt(e.slice(4, 6), 16)));
      else {
        if (8 !== e.length) return null;
        ((t = parseInt(e.slice(0, 2), 16)),
          (i = parseInt(e.slice(2, 4), 16)),
          (n = parseInt(e.slice(4, 6), 16)),
          (s = parseInt(e.slice(6, 8), 16) / 255));
      }
      return { type: 'color', r: t, g: i, b: n, a: s, format: 'hex' };
    }
    let n = t.match(ei);
    if (n)
      return {
        type: 'color',
        r: parseInt(n[1], 10),
        g: parseInt(n[2], 10),
        b: parseInt(n[3], 10),
        a: n[4] ? parseFloat(n[4]) : 1,
        format: 'rgb',
      };
    let s = t.match(ee);
    if (s) {
      var a;
      let e,
        t,
        i,
        r,
        n,
        l,
        o,
        u,
        c,
        d = parseFloat(s[1]);
      '%' === s[2] && (d /= 100);
      let h = parseFloat(s[3]),
        p = parseFloat(s[4]),
        m = 1;
      s[5] && ((m = parseFloat(s[5])), '%' === s[6] && (m /= 100));
      let [g, f, y] =
        ((r =
          (a = d) +
          0.3963377774 * (t = h * Math.cos((e = p * X))) +
          0.2158037573 * (i = h * Math.sin(e))),
        (n = a - 0.1055613458 * t - 0.0638541728 * i),
        (l = a - 0.0894841775 * t - 1.291485548 * i),
        [
          el(
            4.0767416621 * (o = r * r * r) -
              3.3077115913 * (u = n * n * n) +
              0.2309699292 * (c = l * l * l),
          ),
          el(-1.2684380046 * o + 2.6097574011 * u - 0.3413193965 * c),
          el(-0.0041960863 * o - 0.7034186147 * u + 1.707614701 * c),
        ]);
      return { type: 'color', r: g, g: f, b: y, a: m, format: 'oklch' };
    }
    return null;
  }
  function ec(e, t = 0) {
    if ('number' === e.type) return e.value;
    if ('string' === e.type) {
      let i = parseFloat(e.value);
      return isNaN(i) ? t : i;
    }
    return t;
  }
  function ed(e) {
    return 'color' === e.type ? e : 'string' === e.type ? eu(e.value) : null;
  }
  function eh(e) {
    return eo(e).replace(/^["']|["']$/g, '');
  }
  function ep(e, t, i) {
    ((e = ((e % 360) + 360) % 360), (t = Math.max(0, Math.min(100, t)) / 100));
    let r =
        (1 - Math.abs(2 * (i = Math.max(0, Math.min(100, i)) / 100) - 1)) * t,
      n = r * (1 - Math.abs(((e / 60) % 2) - 1)),
      s = i - r / 2,
      a = 0,
      l = 0,
      o = 0;
    return (
      e < 60
        ? ((a = r), (l = n), (o = 0))
        : e < 120
          ? ((a = n), (l = r), (o = 0))
          : e < 180
            ? ((a = 0), (l = r), (o = n))
            : e < 240
              ? ((a = 0), (l = n), (o = r))
              : e < 300
                ? ((a = n), (l = 0), (o = r))
                : ((a = r), (l = 0), (o = n)),
      [
        Math.round((a + s) * 255),
        Math.round((l + s) * 255),
        Math.round((o + s) * 255),
      ]
    );
  }
  function em(e, t, i) {
    e /= 255;
    let r = Math.max(e, (t /= 255), (i /= 255)),
      n = Math.min(e, t, i),
      s = (r + n) / 2,
      a = 0,
      l = 0;
    if (r !== n) {
      let o = r - n;
      switch (((l = s > 0.5 ? o / (2 - r - n) : o / (r + n)), r)) {
        case e:
          a = ((t - i) / o + 6 * (t < i)) * 60;
          break;
        case t:
          a = ((i - e) / o + 2) * 60;
          break;
        case i:
          a = ((e - t) / o + 4) * 60;
      }
    }
    return [a, 100 * l, 100 * s];
  }
  function eg(e, t, i = !1) {
    let [r, n, s] = em(e.r, e.g, e.b),
      [a, l, o] = ep(r, n, i ? Math.max(0, s - t) : Math.min(100, s + t));
    return { type: 'color', r: a, g: l, b: o, a: e.a, format: e.format };
  }
  function ef(e, t, i = !1) {
    let [r, n, s] = em(e.r, e.g, e.b),
      [a, l, o] = ep(r, i ? Math.max(0, n - t) : Math.min(100, n + t), s);
    return { type: 'color', r: a, g: l, b: o, a: e.a, format: e.format };
  }
  var ey = {
    'lighten'(e) {
      let t = ed(e[0]),
        i = ec(e[1], 10);
      return t ? eg(t, i) : e[0];
    },
    'darken'(e) {
      let t = ed(e[0]),
        i = ec(e[1], 10);
      return t ? eg(t, i, !0) : e[0];
    },
    'saturate'(e) {
      let t = ed(e[0]),
        i = ec(e[1], 10);
      return t ? ef(t, i) : e[0];
    },
    'desaturate'(e) {
      let t = ed(e[0]),
        i = ec(e[1], 10);
      return t ? ef(t, i, !0) : e[0];
    },
    'adjust-hue'(e) {
      let t = ed(e[0]),
        i = ec(e[1], 0);
      if (!t) return e[0];
      let [r, n, s] = em(t.r, t.g, t.b),
        [a, l, o] = ep(r + i, n, s);
      return { type: 'color', r: a, g: l, b: o, a: t.a, format: t.format };
    },
    'rgba'(e) {
      if (2 === e.length) {
        let t = ed(e[0]),
          i = ec(e[1], 1);
        return t
          ? { type: 'color', r: t.r, g: t.g, b: t.b, a: i, format: t.format }
          : e[0];
      }
      return {
        type: 'color',
        r: Math.round(ec(e[0], 0)),
        g: Math.round(ec(e[1], 0)),
        b: Math.round(ec(e[2], 0)),
        a: e[3] ? ec(e[3], 1) : 1,
        format: 'rgb',
      };
    },
    'rgb': (e) => ({
      type: 'color',
      r: Math.round(ec(e[0], 0)),
      g: Math.round(ec(e[1], 0)),
      b: Math.round(ec(e[2], 0)),
      a: 1,
      format: 'rgb',
    }),
    'hsl'(e) {
      let [t, i, r] = ep(ec(e[0], 0), ec(e[1], 0), ec(e[2], 0));
      return { type: 'color', r: t, g: i, b: r, a: 1, format: 'hsl' };
    },
    'hsla'(e) {
      let t = ec(e[0], 0),
        i = ec(e[1], 0),
        r = ec(e[2], 0),
        n = e[3] ? ec(e[3], 1) : 1,
        [s, a, l] = ep(t, i, r);
      return { type: 'color', r: s, g: a, b: l, a: n, format: 'hsl' };
    },
    'mix'(e) {
      let t = ed(e[0]),
        i = ed(e[1]),
        r = e[2] ? ec(e[2], 50) / 100 : 0.5;
      if (!t || !i) return e[0];
      let n = 2 * r - 1,
        s = t.a - i.a,
        a = ((n * s == -1 ? n : (n + s) / (1 + n * s)) + 1) / 2,
        l = 1 - a;
      return {
        type: 'color',
        r: Math.round(t.r * a + i.r * l),
        g: Math.round(t.g * a + i.g * l),
        b: Math.round(t.b * a + i.b * l),
        a: t.a * r + i.a * (1 - r),
        format: t.format,
      };
    },
    'red': (e) => ({ type: 'number', value: ed(e[0])?.r ?? 0, unit: '' }),
    'green': (e) => ({ type: 'number', value: ed(e[0])?.g ?? 0, unit: '' }),
    'blue': (e) => ({ type: 'number', value: ed(e[0])?.b ?? 0, unit: '' }),
    'alpha': (e) => ({ type: 'number', value: ed(e[0])?.a ?? 1, unit: '' }),
    'opacity': (e) => ({ type: 'number', value: ed(e[0])?.a ?? 1, unit: '' }),
    'hue'(e) {
      let t = ed(e[0]);
      if (!t) return { type: 'number', value: 0, unit: 'deg' };
      let [i] = em(t.r, t.g, t.b);
      return { type: 'number', value: i, unit: 'deg' };
    },
    'saturation'(e) {
      let t = ed(e[0]);
      if (!t) return { type: 'number', value: 0, unit: '%' };
      let [, i] = em(t.r, t.g, t.b);
      return { type: 'number', value: i, unit: '%' };
    },
    'lightness'(e) {
      let t = ed(e[0]);
      if (!t) return { type: 'number', value: 0, unit: '%' };
      let [, , i] = em(t.r, t.g, t.b);
      return { type: 'number', value: i, unit: '%' };
    },
    'complement'(e) {
      let t = ed(e[0]);
      if (!t) return e[0];
      let [i, r, n] = em(t.r, t.g, t.b),
        [s, a, l] = ep(i + 180, r, n);
      return { type: 'color', r: s, g: a, b: l, a: t.a, format: t.format };
    },
    'invert'(e) {
      let t = ed(e[0]);
      return t
        ? {
            type: 'color',
            r: 255 - t.r,
            g: 255 - t.g,
            b: 255 - t.b,
            a: t.a,
            format: t.format,
          }
        : e[0];
    },
    'grayscale'(e) {
      let t = ed(e[0]);
      return t ? ef(t, 100, !0) : e[0];
    },
    'percentage': (e) => ({
      type: 'number',
      value: 100 * ec(e[0], 0),
      unit: '%',
    }),
    'round': (e) => ({
      type: 'number',
      value: Math.round(ec(e[0], 0)),
      unit: 'number' === e[0].type ? e[0].unit : '',
    }),
    'ceil': (e) => ({
      type: 'number',
      value: Math.ceil(ec(e[0], 0)),
      unit: 'number' === e[0].type ? e[0].unit : '',
    }),
    'floor': (e) => ({
      type: 'number',
      value: Math.floor(ec(e[0], 0)),
      unit: 'number' === e[0].type ? e[0].unit : '',
    }),
    'abs': (e) => ({
      type: 'number',
      value: Math.abs(ec(e[0], 0)),
      unit: 'number' === e[0].type ? e[0].unit : '',
    }),
    'min'(e) {
      let t = e.map((e) => ec(e, 1 / 0)),
        i = t.indexOf(Math.min(...t));
      return {
        type: 'number',
        value: Math.min(...t),
        unit: e[i]?.type === 'number' ? e[i].unit : '',
      };
    },
    'max'(e) {
      let t = e.map((e) => ec(e, -1 / 0)),
        i = t.indexOf(Math.max(...t));
      return {
        type: 'number',
        value: Math.max(...t),
        unit: e[i]?.type === 'number' ? e[i].unit : '',
      };
    },
    'random'(e) {
      let t = e.length > 0 ? ec(e[0], 1) : 1;
      return t <= 1
        ? { type: 'number', value: Math.random(), unit: '' }
        : {
            type: 'number',
            value: Math.floor(Math.random() * t) + 1,
            unit: '',
          };
    },
    'unit': (e) =>
      'number' === e[0].type
        ? { type: 'string', value: e[0].unit, quoted: !0 }
        : { type: 'string', value: '', quoted: !0 },
    'unitless': (e) =>
      'number' === e[0].type
        ? { type: 'boolean', value: '' === e[0].unit }
        : { type: 'boolean', value: !0 },
    'str-length': (e) => ({ type: 'number', value: eh(e[0]).length, unit: '' }),
    'str-slice'(e) {
      let t = eh(e[0]),
        i = Math.floor(ec(e[1], 1)) - 1,
        r = e[2] ? Math.floor(ec(e[2], t.length)) : t.length;
      return { type: 'string', value: t.slice(i, r), quoted: !1 };
    },
    'str-index'(e) {
      let t = eh(e[0]),
        i = eh(e[1]),
        r = t.indexOf(i);
      return { type: 'number', value: -1 === r ? 0 : r + 1, unit: '' };
    },
    'str-insert'(e) {
      let t = eh(e[0]),
        i = eh(e[1]),
        r = Math.floor(ec(e[2], 1)) - 1;
      return {
        type: 'string',
        value: t.slice(0, r) + i + t.slice(r),
        quoted: !1,
      };
    },
    'to-upper-case': (e) => ({
      type: 'string',
      value: eh(e[0]).toUpperCase(),
      quoted: !1,
    }),
    'to-lower-case': (e) => ({
      type: 'string',
      value: eh(e[0]).toLowerCase(),
      quoted: !1,
    }),
    'quote': (e) => ({ type: 'string', value: eh(e[0]), quoted: !0 }),
    'unquote': (e) => ({ type: 'string', value: eh(e[0]), quoted: !1 }),
    'length'(e) {
      let t = e[0];
      return 'list' === t.type
        ? { type: 'number', value: t.values.length, unit: '' }
        : 'map' === t.type
          ? { type: 'number', value: t.entries.size, unit: '' }
          : { type: 'number', value: 1, unit: '' };
    },
    'nth'(e) {
      let t = e[0],
        i = Math.floor(ec(e[1], 1));
      return 'list' === t.type &&
        (i < 0 && (i = t.values.length + i + 1), i >= 1 && i <= t.values.length)
        ? t.values[i - 1]
        : { type: 'null' };
    },
    'join'(e) {
      let t = e[0],
        i = e[1],
        r = e[2] ? eh(e[2]) : ',';
      return {
        type: 'list',
        values: [
          ...('list' === t.type ? t.values : [t]),
          ...('list' === i.type ? i.values : [i]),
        ],
        separator: ' ' === r ? ' ' : ',',
      };
    },
    'append'(e) {
      let t = e[0],
        i = e[1],
        r = e[2] ? eh(e[2]) : ',',
        n = 'list' === t.type ? [...t.values] : [t];
      return (
        n.push(i),
        { type: 'list', values: n, separator: ' ' === r ? ' ' : ',' }
      );
    },
    'index'(e) {
      let t = e[0],
        i = e[1];
      if ('list' !== t.type) return { type: 'null' };
      let r = eo(i),
        n = t.values.findIndex((e) => eo(e) === r);
      return { type: 'number', value: -1 === n ? 0 : n + 1, unit: '' };
    },
    'map-get'(e) {
      let t = e[0],
        i = eh(e[1]);
      return ('map' === t.type && t.entries.get(i)) || { type: 'null' };
    },
    'map-keys'(e) {
      let t = e[0];
      if ('map' === t.type) {
        let e = [];
        return (
          t.entries.forEach((t, i) => {
            e.push({ type: 'string', value: i, quoted: !1 });
          }),
          { type: 'list', values: e, separator: ',' }
        );
      }
      return { type: 'list', values: [], separator: ',' };
    },
    'map-values'(e) {
      let t = e[0];
      if ('map' === t.type) {
        let e = [];
        return (
          t.entries.forEach((t) => {
            e.push(t);
          }),
          { type: 'list', values: e, separator: ',' }
        );
      }
      return { type: 'list', values: [], separator: ',' };
    },
    'map-has-key'(e) {
      let t = e[0],
        i = eh(e[1]);
      return 'map' === t.type
        ? { type: 'boolean', value: t.entries.has(i) }
        : { type: 'boolean', value: !1 };
    },
    'type-of': (e) => ({ type: 'string', value: e[0].type, quoted: !1 }),
    'inspect': (e) => ({ type: 'string', value: eo(e[0]), quoted: !0 }),
    'if'(e) {
      let t = e[0],
        i = e[1],
        r = e[2] || { type: 'null' };
      return ('boolean' === t.type ? t.value : 'null' !== t.type) ? i : r;
    },
  };
  function eb(e, t) {
    let i = null;
    for (let r = 0; r < e.length; r++) {
      let n = e[r];
      if (i) {
        n === i && '\\' !== e[r - 1] && (i = null);
        continue;
      }
      if ('"' === n || "'" === n) {
        i = n;
        continue;
      }
      if (n === t) return r;
    }
    return -1;
  }
  var eM = {
    'px': {
      px: 1,
      em: 1 / 16,
      rem: 1 / 16,
      pt: 0.75,
      pc: 9,
      in: 96,
      cm: 37.8,
      mm: 3.78,
    },
    'em': { px: 16, em: 1, rem: 1 },
    'rem': { px: 16, rem: 1, em: 1 },
    'pt': { px: 4 / 3, pt: 1 },
    'pc': { px: 1 / 9, pc: 1 },
    'in': { px: 1 / 96, in: 1, cm: 2.54, mm: 25.4 },
    'cm': { px: 1 / 37.8, cm: 1, mm: 10, in: 1 / 2.54 },
    'mm': { px: 1 / 3.78, mm: 1, cm: 0.1 },
    '%': { '%': 1 },
    'deg': { deg: 1, rad: Math.PI / 180, turn: 1 / 360, grad: 0.9 },
    'rad': { rad: 1, deg: 180 / Math.PI, turn: 1 / (2 * Math.PI) },
    'turn': { turn: 1, deg: 360, rad: 2 * Math.PI },
    's': { s: 1, ms: 1e3 },
    'ms': { ms: 1, s: 0.001 },
  };
  function ev(e = null) {
    return { variables: new Map(), parent: e };
  }
  function ew(e, t) {
    let i = t.startsWith('$') ? t : `$${t}`,
      r = e;
    for (; r; ) {
      if (r.variables.has(i)) return r.variables.get(i);
      r = r.parent;
    }
  }
  function eN(e, t, i) {
    let r = t.startsWith('$') ? t : `$${t}`,
      n = e;
    for (; n; ) {
      if (n.variables.has(r)) return void n.variables.set(r, i);
      n = n.parent;
    }
    e.variables.set(r, i);
  }
  function eS(e) {
    let t = e.trim();
    if ('' === t || 'null' === t) return { type: 'null' };
    if ('true' === t) return { type: 'boolean', value: !0 };
    if ('false' === t) return { type: 'boolean', value: !1 };
    let i = eu(t);
    if (i) return i;
    let r = t.match(/^(-?\d*\.?\d+(?:e[+-]?\d+)?)([\w%]*)$/i);
    return r
      ? { type: 'number', value: parseFloat(r[1]), unit: r[2] || '' }
      : (t.startsWith('"') && t.endsWith('"')) ||
          (t.startsWith("'") && t.endsWith("'"))
        ? { type: 'string', value: t.slice(1, -1), quoted: !0 }
        : t.startsWith('(') && t.endsWith(')')
          ? eb(t.slice(1, -1).trim(), ':') > 0
            ? eA(t)
            : ek(t)
          : !(function (e) {
                let t = 0,
                  i = null;
                for (let r = 0; r < e.length; r++) {
                  let n = e[r];
                  if (i) {
                    n === i && '\\' !== e[r - 1] && (i = null);
                    continue;
                  }
                  if ('"' === n || "'" === n) {
                    i = n;
                    continue;
                  }
                  if ('(' === n || '[' === n || '{' === n) {
                    t++;
                    continue;
                  }
                  if (')' === n || ']' === n || '}' === n) {
                    t--;
                    continue;
                  }
                  if (0 === t && ',' === n) return !0;
                }
                return !1;
              })(t)
            ? { type: 'string', value: t, quoted: !1 }
            : ek(t);
  }
  function eE(e) {
    switch (e.type) {
      case 'null':
        return !1;
      case 'boolean':
        return e.value;
      case 'string':
        return '' !== e.value;
      case 'number':
        return 0 !== e.value;
      case 'list':
        return e.values.length > 0;
      case 'map':
        return e.entries.size > 0;
      case 'color':
        return !0;
    }
  }
  function ex(e) {
    return 'string' === e.type ? e.value : eo(e);
  }
  function eI(e, t, i) {
    if ('+' === i && ('string' === e.type || 'string' === t.type))
      return { type: 'string', value: ex(e) + ex(t), quoted: !1 };
    if ('number' === e.type && 'number' === t.type) {
      let r,
        n = t.value,
        s = e.unit || t.unit;
      if (e.unit && t.unit && e.unit !== t.unit) {
        let i = eL(t.value, t.unit, e.unit);
        (null !== i && (n = i), (s = e.unit));
      }
      switch (i) {
        case '+':
          r = e.value + n;
          break;
        case '-':
          r = e.value - n;
          break;
        case '*':
          ((r = e.value * n), e.unit && t.unit && (s = e.unit));
          break;
        case '/':
          if (0 === n)
            return { error: 'DIVISION_BY_ZERO', message: 'Division by zero' };
          ((r = e.value / n), e.unit === t.unit && (s = ''));
          break;
        case '%':
          if (0 === n)
            return { error: 'DIVISION_BY_ZERO', message: 'Modulo by zero' };
          r = e.value % n;
          break;
        default:
          return { error: 'TYPE_ERROR', message: `Unknown operator: ${i}` };
      }
      return { type: 'number', value: r, unit: s };
    }
    return 'color' === e.type && 'number' === t.type && '*' === i
      ? {
          type: 'color',
          r: Math.round(e.r * t.value),
          g: Math.round(e.g * t.value),
          b: Math.round(e.b * t.value),
          a: e.a,
        }
      : {
          error: 'TYPE_ERROR',
          message: `Cannot perform ${i} on ${e.type} and ${t.type}`,
        };
  }
  function eL(e, t, i) {
    if (t === i || !t || !i) return e;
    let r = eM[t];
    return r && void 0 !== r[i] ? e * r[i] : null;
  }
  function ek(e) {
    let t = e.trim();
    return t.startsWith('(') && t.endsWith(')')
      ? eT(t.slice(1, -1).trim())
      : eT(t);
  }
  function eT(e) {
    let t = e.includes(',') ? ',' : ' ';
    return {
      type: 'list',
      values: eC(e, t).map((e) => eS(e.trim())),
      separator: t,
    };
  }
  function eA(e) {
    let t = e.trim();
    if (!t.startsWith('(') || !t.endsWith(')'))
      return { type: 'map', entries: new Map() };
    let i = t.slice(1, -1).trim(),
      r = new Map();
    for (let e of eC(i, ',')) {
      let t = eb(e, ':');
      if (-1 === t) continue;
      let i = e.slice(0, t).trim(),
        n = e.slice(t + 1).trim();
      r.set(i, eS(n));
    }
    return { type: 'map', entries: r };
  }
  function eC(e, t) {
    let i = [],
      r = '',
      n = 0,
      s = null;
    for (let a = 0; a < e.length; a++) {
      let l = e[a];
      if (s) {
        ((r += l), l === s && '\\' !== e[a - 1] && (s = null));
        continue;
      }
      if ('"' === l || "'" === l) {
        ((s = l), (r += l));
        continue;
      }
      if ('(' === l || '[' === l || '{' === l) {
        (n++, (r += l));
        continue;
      }
      if (')' === l || ']' === l || '}' === l) {
        (n--, (r += l));
        continue;
      }
      if (0 === n && l === t[0]) {
        (' ' === t && r.trim()) || ',' === t ? (i.push(r), (r = '')) : (r += l);
        continue;
      }
      r += l;
    }
    return (r.trim() && i.push(r), i);
  }
  function eD(e, t) {
    let i = [],
      r = '',
      n = 0,
      s = null,
      a = 0;
    for (; a < e.length; ) {
      let l = e[a];
      if (s) {
        ((r += l), l === s && '\\' !== e[a - 1] && (s = null), a++);
        continue;
      }
      if ('"' === l || "'" === l) {
        ((s = l), (r += l), a++);
        continue;
      }
      if ('(' === l || '[' === l || '{' === l) {
        (n++, (r += l), a++);
        continue;
      }
      if (')' === l || ']' === l || '}' === l) {
        (n--, (r += l), a++);
        continue;
      }
      if (0 === n && e.slice(a, a + t.length) === t) {
        (i.push(r), (r = ''), (a += t.length));
        continue;
      }
      ((r += l), a++);
    }
    return (r && i.push(r), i);
  }
  var ej = {
      maxIterations: 1e4,
      maxOutputRules: 5e4,
      maxNestingDepth: 64,
      maxInputSize: 1048576,
      timeout: 5e3,
      strictMode: !1,
      minify: !1,
      preserveBangComments: !0,
    },
    ez = class {
      constructor(e = {}) {
        ((this.input = ''),
          (this.pos = 0),
          (this.valueStartPos = 0),
          (this.evaluator = (function (e) {
            function t(i, r, n) {
              let s = i.trim();
              if (!s) return { type: 'null' };
              if (s.startsWith('$')) {
                let e = s.split(/[^$\w-]/)[0],
                  t = ew(r, e);
                if (!t) return { type: 'string', value: s, quoted: !1 };
                if (e === s) return t;
              }
              let a = s.match(/^([\w-]+)\s*\(/);
              if (a) {
                let e = a[1],
                  i = e.length,
                  l = (function (e, t) {
                    let i = 0,
                      r = null;
                    for (let n = t; n < e.length; n++) {
                      let t = e[n];
                      if (r) {
                        t === r && '\\' !== e[n - 1] && (r = null);
                        continue;
                      }
                      if ('"' === t || "'" === t) {
                        r = t;
                        continue;
                      }
                      if ('(' === t) i++;
                      else if (')' === t && 0 == --i) return n;
                    }
                    return -1;
                  })(s, i);
                if (-1 !== l) {
                  if (
                    /^(url|var|calc|clamp|attr|env|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|color|hwb|lab|lch|oklab|oklch)$/i.test(
                      e,
                    ) &&
                    !n?.has(e) &&
                    !ey[e]
                  )
                    return { type: 'string', value: s, quoted: !1 };
                  let a = (function (e, i, r) {
                    let n = [];
                    for (let s of eC(e, ',')) n.push(t(s.trim(), i, r));
                    return n;
                  })(s.slice(i + 1, l), r, n);
                  if (n?.has(e)) {
                    let t = n.get(e)(...a);
                    return 'string' == typeof t ? eS(t) : t;
                  }
                  if (ey[e]) {
                    let t = ey[e](a);
                    return 'string' == typeof t ? eS(t) : t;
                  }
                  return { type: 'string', value: s, quoted: !1 };
                }
              }
              let l = eD(s, ' or ');
              if (l.length > 1) {
                for (let e of l)
                  if (eE(t(e, r, n))) return { type: 'boolean', value: !0 };
                return { type: 'boolean', value: !1 };
              }
              let o = eD(s, ' and ');
              if (o.length > 1) {
                for (let e of o)
                  if (!eE(t(e, r, n))) return { type: 'boolean', value: !1 };
                return { type: 'boolean', value: !0 };
              }
              for (let e of ['==', '!=', '>=', '<=', '>', '<']) {
                let i = eD(s, e);
                if (2 === i.length)
                  return {
                    type: 'boolean',
                    value: (function (e, t, i) {
                      if ('==' === i || '!=' === i) {
                        let r = (function e(t, i) {
                          if (t.type !== i.type) return !1;
                          switch (t.type) {
                            case 'number':
                              return t.value === i.value && t.unit === i.unit;
                            case 'string':
                            case 'boolean':
                              return t.value === i.value;
                            case 'color':
                              return (
                                t.r === i.r &&
                                t.g === i.g &&
                                t.b === i.b &&
                                t.a === i.a
                              );
                            case 'null':
                              return !0;
                            case 'list':
                              return (
                                t.values.length === i.values.length &&
                                t.values.every((t, r) => e(t, i.values[r]))
                              );
                            case 'map':
                              if (t.entries.size !== i.entries.size) return !1;
                              for (let [r, n] of t.entries) {
                                let t = i.entries.get(r);
                                if (!t || !e(n, t)) return !1;
                              }
                              return !0;
                          }
                        })(e, t);
                        return '==' === i ? r : !r;
                      }
                      if ('number' === e.type && 'number' === t.type) {
                        let r = e.value,
                          n = eL(t.value, t.unit, e.unit) ?? t.value;
                        switch (i) {
                          case '<':
                            return r < n;
                          case '>':
                            return r > n;
                          case '<=':
                            return r <= n;
                          case '>=':
                            return r >= n;
                        }
                      }
                      if ('string' === e.type && 'string' === t.type)
                        switch (i) {
                          case '<':
                            return e.value < t.value;
                          case '>':
                            return e.value > t.value;
                          case '<=':
                            return e.value <= t.value;
                          case '>=':
                            return e.value >= t.value;
                        }
                      return !1;
                    })(t(i[0], r, n), t(i[1], r, n), e),
                  };
              }
              if (s.startsWith('not ') || s.startsWith('not('))
                return {
                  type: 'boolean',
                  value: !eE(t((s.startsWith('not('), s.slice(4)), r, n)),
                };
              let u = (function (i, r, n) {
                let s = 0,
                  a = null;
                for (let l = i.length - 1; l >= 0; l--) {
                  let o = i[l];
                  if (a) {
                    o === a && '\\' !== i[l - 1] && (a = null);
                    continue;
                  }
                  if ('"' === o || "'" === o) {
                    a = o;
                    continue;
                  }
                  if (')' === o || ']' === o || '}' === o) {
                    s++;
                    continue;
                  }
                  if ('(' === o || '[' === o || '{' === o) {
                    s--;
                    continue;
                  }
                  if (0 === s && ('+' === o || '-' === o)) {
                    if (0 === l) continue;
                    let s = i[l - 1];
                    if ('e' === s || 'E' === s) continue;
                    if ('-' === o) {
                      if (!/\s/.test(s) && ')' !== s && ']' !== s && '}' !== s)
                        continue;
                      let e = i[l + 1];
                      if (e && /[a-zA-Z]/.test(e)) continue;
                    }
                    let a = i.slice(0, l).trim(),
                      u = i.slice(l + 1).trim();
                    if (a && u) {
                      let i = eI(t(a, r, n), t(u, r, n), o);
                      return 'error' in i
                        ? (e({
                            type: 'error',
                            code: i.error,
                            message: i.message,
                          }),
                          { type: 'null' })
                        : i;
                    }
                  }
                }
                return (function (i, r, n) {
                  let s = 0,
                    a = null;
                  for (let l = i.length - 1; l >= 0; l--) {
                    let o = i[l];
                    if (a) {
                      o === a && '\\' !== i[l - 1] && (a = null);
                      continue;
                    }
                    if ('"' === o || "'" === o) {
                      a = o;
                      continue;
                    }
                    if (')' === o || ']' === o || '}' === o) {
                      s++;
                      continue;
                    }
                    if ('(' === o || '[' === o || '{' === o) {
                      s--;
                      continue;
                    }
                    if (0 === s && ('*' === o || '/' === o || '%' === o)) {
                      let s = i.slice(0, l).trim(),
                        a = i.slice(l + 1).trim();
                      if (s && a) {
                        let i = eI(t(s, r, n), t(a, r, n), o);
                        return 'error' in i
                          ? (e({
                              type: 'error',
                              code: i.error,
                              message: i.message,
                            }),
                            { type: 'null' })
                          : i;
                      }
                    }
                  }
                  if (i.startsWith('(') && i.endsWith(')')) {
                    let e = i.slice(1, -1).trim();
                    return e
                      ? -1 !== eb(e, ',') || eb(e, ':') > 0
                        ? eS(i)
                        : t(e, r, n)
                      : { type: 'list', values: [], separator: ' ' };
                  }
                  return null;
                })(i, r, n);
              })(s, r, n);
              if (u) return u;
              if (s.includes(' ') && s.includes('$')) {
                let e = eC(s, ' ');
                if (e.length > 1)
                  return {
                    type: 'list',
                    values: e.map((e) => t(e.trim(), r, n)),
                    separator: ' ',
                  };
              }
              return eS(s);
            }
            return {
              evaluate: t,
              evaluateCondition: function (e, i) {
                return eE(t(e, i));
              },
            };
          })((e) => this.addError(e))),
          (this.inMixinContext = !1),
          (this.inRulesetContext = !1),
          (this.config = { ...ej, ...e }));
      }
      compile(e) {
        if (this.config.maxInputSize > 0 && e.length > this.config.maxInputSize)
          return {
            css: '',
            errors: [
              {
                type: 'error',
                code: 'MAX_INPUT_SIZE',
                message: `Input exceeds maximum size of ${this.config.maxInputSize} bytes`,
              },
            ],
            warnings: [],
            stats: {
              iterations: 0,
              rules: 0,
              duration: 0,
              inputSize: e.length,
              outputSize: 0,
            },
          };
        ((this.input = e),
          (this.pos = 0),
          (this.state = {
            config: this.config,
            scope: ev(),
            mixins: new Map(),
            functions: new Map(),
            iterations: 0,
            rules: 0,
            startTime: Date.now(),
            errors: [],
            warnings: [],
            output: [],
            selectorStack: [],
            atRuleStack: [],
          }));
        try {
          this.parseStylesheet();
        } catch (e) {
          e instanceof eO
            ? this.addError({
                type: 'error',
                code: e.code,
                message: e.message,
                start: e.location,
              })
            : this.addError({
                type: 'error',
                code: 'SYNTAX_ERROR',
                message: String(e),
              });
        }
        let t = this.formatOutput();
        return {
          css: t,
          errors: this.state.errors,
          warnings: this.state.warnings,
          stats: {
            iterations: this.state.iterations,
            rules: this.state.rules,
            duration: Date.now() - this.state.startTime,
            inputSize: e.length,
            outputSize: t.length,
          },
        };
      }
      checkLimits() {
        if (
          this.config.maxIterations > 0 &&
          this.state.iterations >= this.config.maxIterations
        )
          throw new eO(
            'MAX_ITERATIONS',
            'Maximum iterations exceeded',
            this.location(),
          );
        if (
          this.config.timeout > 0 &&
          Date.now() - this.state.startTime >= this.config.timeout
        )
          throw new eO('TIMEOUT', 'Compilation timeout', this.location());
        if (
          this.config.maxOutputRules > 0 &&
          this.state.rules >= this.config.maxOutputRules
        )
          throw new eO(
            'MAX_OUTPUT_RULES',
            'Maximum output rules exceeded',
            this.location(),
          );
      }
      addError(e) {
        if (
          (this.state.errors.push({ type: 'error', ...e }),
          this.config.strictMode)
        )
          throw new eO(e.code, e.message, e.start);
      }
      addWarning(e) {
        this.state.warnings.push({ type: 'warning', ...e });
      }
      location() {
        return this.locationAt(this.pos);
      }
      locationAt(e) {
        let t = 1,
          i = 0;
        for (let r = 0; r < e && r < this.input.length; r++)
          this.input[r] ===
          `
`
            ? (t++, (i = 0))
            : i++;
        return { line: t, column: i, offset: e };
      }
      peek(e = 0) {
        return this.input[this.pos + e] || '';
      }
      advance(e = 1) {
        let t = this.input.slice(this.pos, this.pos + e);
        return ((this.pos += e), t);
      }
      skipWhitespace() {
        for (; this.pos < this.input.length; ) {
          let e = this.peek();
          if (
            ' ' === e ||
            '	' === e ||
            e ===
              `
` ||
            '\r' === e
          )
            this.advance();
          else if ('/' === e && '/' === this.peek(1))
            this.skipSingleLineComment();
          else {
            '/' === e && this.peek(1);
            break;
          }
        }
      }
      skipSingleLineComment() {
        for (
          ;
          this.pos < this.input.length &&
          this.peek() !==
            `
`;
        )
          this.advance();
        this.peek() ===
          `
` && this.advance();
      }
      readMultiLineComment() {
        let e = this.pos,
          t = '!' === this.peek(2);
        for (this.advance(2); this.pos < this.input.length; ) {
          if ('*' === this.peek() && '/' === this.peek(1)) {
            this.advance(2);
            break;
          }
          this.advance();
        }
        let i = this.input.slice(e, this.pos);
        return t || !this.config.minify ? i : '';
      }
      parseStylesheet() {
        for (
          ;
          this.pos < this.input.length &&
          (this.checkLimits(),
          this.skipWhitespace(),
          !(this.pos >= this.input.length));
        ) {
          let e = this.peek();
          if ('@' === e) this.parseAtRule();
          else if ('$' === e) this.parseVariableDeclaration();
          else if ('/' === e && '*' === this.peek(1)) {
            let e = this.readMultiLineComment();
            e && this.state.output.push(e);
          } else {
            if ('}' === e) break;
            ';' === e ? this.advance() : this.parseRuleset();
          }
        }
      }
      parseVariableDeclaration() {
        let e = this.readVariable();
        if ((this.skipWhitespace(), ':' !== this.peek()))
          return void this.addError({
            code: 'SYNTAX_ERROR',
            message: `Expected ':' after variable name ${e}`,
            start: this.location(),
          });
        (this.advance(), this.skipWhitespace());
        let t = this.readUntil(';', !0).trim();
        ';' === this.peek() && this.advance();
        let i = this.evaluateExpression(t);
        eN(this.state.scope, e, i);
      }
      readVariable() {
        let e = this.advance();
        for (; this.pos < this.input.length && this.isIdentChar(this.peek()); )
          e += this.advance();
        return e;
      }
      parseAtRule() {
        let e = this.readAtKeyword();
        switch (e) {
          case '@mixin':
            this.parseMixin();
            break;
          case '@function':
            this.parseFunction();
            break;
          case '@include':
            this.parseInclude();
            break;
          case '@if':
            this.parseIf();
            break;
          case '@for':
            this.parseFor();
            break;
          case '@each':
            this.parseEach();
            break;
          case '@return':
            break;
          default:
            this.parseNativeAtRule(e);
        }
      }
      readAtKeyword() {
        let e = this.advance();
        for (; this.pos < this.input.length && this.isIdentChar(this.peek()); )
          e += this.advance();
        return e;
      }
      parseMixin() {
        this.skipWhitespace();
        let e = this.readIdent();
        this.skipWhitespace();
        let t = this.parseParamDefinitions();
        if ((this.skipWhitespace(), '{' !== this.peek()))
          return void this.addError({
            code: 'SYNTAX_ERROR',
            message: "Expected '{' after mixin definition",
            start: this.location(),
          });
        let i = this.readBlock();
        this.state.mixins.set(e, {
          name: e,
          params: t,
          body: i,
          start: this.location(),
        });
      }
      parseFunction() {
        this.skipWhitespace();
        let e = this.readIdent();
        this.skipWhitespace();
        let t = this.parseParamDefinitions();
        if ((this.skipWhitespace(), '{' !== this.peek()))
          return void this.addError({
            code: 'SYNTAX_ERROR',
            message: "Expected '{' after function definition",
            start: this.location(),
          });
        let i = this.readBlock();
        this.state.functions.set(e, {
          name: e,
          params: t,
          body: i,
          start: this.location(),
        });
      }
      parseParamDefinitions() {
        let e = [];
        if ('(' !== this.peek()) return e;
        for (
          this.advance();
          this.pos < this.input.length &&
          ')' !== this.peek() &&
          (this.skipWhitespace(), ')' !== this.peek());
        ) {
          let t;
          if ('$' !== this.peek()) {
            this.advance();
            continue;
          }
          let i = this.readVariable();
          this.skipWhitespace();
          let r = !1;
          ('.' === this.peek() &&
            '.' === this.peek(1) &&
            '.' === this.peek(2) &&
            ((r = !0), this.advance(3), this.skipWhitespace()),
            ':' === this.peek() &&
              (this.advance(),
              this.skipWhitespace(),
              (t = this.readParamDefault())),
            e.push({ name: i, defaultValue: t, variadic: r }),
            this.skipWhitespace(),
            ',' === this.peek() && this.advance());
        }
        return (')' === this.peek() && this.advance(), e);
      }
      readParamDefault() {
        let e = '',
          t = 0;
        for (; this.pos < this.input.length; ) {
          let i = this.peek();
          if (0 === t && (',' === i || ')' === i)) break;
          (('(' === i || '[' === i || '{' === i) && t++,
            (')' === i || ']' === i || '}' === i) && t--,
            (e += this.advance()));
        }
        return e.trim();
      }
      parseInclude() {
        this.skipWhitespace();
        let e = this.readIdent();
        this.skipWhitespace();
        let t = [],
          i = new Map();
        if ('(' === this.peek()) {
          for (
            this.advance();
            this.pos < this.input.length &&
            ')' !== this.peek() &&
            (this.skipWhitespace(), ')' !== this.peek());
          ) {
            let e = this.readArgument(),
              r = e.trim().match(/^(\$[\w-]+)\s*:\s*(.+)$/s);
            (r ? i.set(r[1], r[2]) : t.push(e),
              this.skipWhitespace(),
              ',' === this.peek() && this.advance());
          }
          ')' === this.peek() && this.advance();
        }
        (this.skipWhitespace(), ';' === this.peek() && this.advance());
        let r = this.state.mixins.get(e);
        r
          ? this.executeMixin(r, t, i)
          : this.addError({
              code: 'UNDEFINED_MIXIN',
              message: `Undefined mixin: ${e}`,
              start: this.location(),
            });
      }
      executeMixin(e, t, i = new Map()) {
        let r = ev(this.state.scope),
          n = 0;
        for (let s = 0; s < e.params.length; s++) {
          let a = e.params[s];
          if (a.variadic) {
            let e = t.slice(n).map((e) => this.evaluateExpression(e));
            eN(r, a.name, { type: 'list', values: e, separator: ',' });
            break;
          }
          if (i.has(a.name)) {
            let e = this.evaluateExpression(i.get(a.name));
            eN(r, a.name, e);
            continue;
          }
          let l = t[n++] || a.defaultValue || '',
            o = this.evaluateExpression(l);
          eN(r, a.name, o);
        }
        let s = this.state.scope,
          a = this.pos,
          l = this.input,
          o = this.inMixinContext;
        ((this.state.scope = r),
          (this.input = e.body),
          (this.pos = 0),
          (this.inMixinContext = !0),
          this.parseMixinBody(),
          (this.state.scope = s),
          (this.pos = a),
          (this.input = l),
          (this.inMixinContext = o));
      }
      parseMixinBody() {
        for (
          ;
          this.pos < this.input.length &&
          (this.checkLimits(),
          this.skipWhitespace(),
          !(this.pos >= this.input.length));
        ) {
          let e = this.peek();
          if ('@' === e) {
            let e = this.peekAtKeyword();
            '@include' === e
              ? (this.advance(8), this.parseInclude())
              : '@if' === e
                ? (this.advance(3), this.parseIf())
                : '@for' === e
                  ? (this.advance(4), this.parseFor())
                  : '@each' === e
                    ? (this.advance(5), this.parseEach())
                    : this.parseAtRule();
          } else if ('$' === e) this.parseVariableDeclaration();
          else if ('/' === e && '*' === this.peek(1)) {
            let e = this.readMultiLineComment();
            e && this.state.output.push(e);
          } else {
            if ('}' === e) break;
            if (
              '&' === e ||
              '.' === e ||
              '[' === e ||
              '*' === e ||
              '#' === e ||
              (':' === e && this.looksLikeSelector())
            )
              this.parseRuleset();
            else {
              let e = this.parseDeclaration();
              e
                ? this.state.output.push(e)
                : '}' !== this.peek() && this.advance();
            }
          }
        }
      }
      parseIf() {
        this.skipWhitespace();
        let e = [],
          t = this.readUntil('{', !1).trim(),
          i = this.readBlock();
        for (
          e.push({ condition: t, block: i });
          this.skipWhitespace(),
            '@else' === this.input.slice(this.pos, this.pos + 5);
        )
          if (
            (this.advance(5),
            this.skipWhitespace(),
            'if' === this.input.slice(this.pos, this.pos + 2))
          ) {
            (this.advance(2), this.skipWhitespace());
            let t = this.readUntil('{', !1).trim(),
              i = this.readBlock();
            e.push({ condition: t, block: i });
          } else if ('{' === this.peek()) {
            let t = this.readBlock();
            e.push({ condition: null, block: t });
            break;
          } else break;
        for (let t of e)
          if (null === t.condition) {
            this.executeBlock(t.block);
            break;
          } else if (this.evaluateCondition(t.condition)) {
            this.executeBlock(t.block);
            break;
          }
      }
      parseFor() {
        if (
          (this.skipWhitespace(),
          this.state.iterations++,
          this.checkLimits(),
          '$' !== this.peek())
        )
          return void this.addError({
            code: 'SYNTAX_ERROR',
            message: 'Expected variable in @for',
            start: this.location(),
          });
        let e = this.readVariable();
        this.skipWhitespace();
        let t = this.readUntil('{', !1).trim(),
          i = this.readBlock(),
          r = t.match(/from\s+(.+?)\s+(through|to)\s+(.+?)(?:\s+by\s+(.+))?$/i);
        if (!r)
          return void this.addError({
            code: 'SYNTAX_ERROR',
            message: 'Invalid @for syntax',
            start: this.location(),
          });
        let n = this.evaluateExpression(r[1]),
          s = this.evaluateExpression(r[3]),
          a = r[4]
            ? this.evaluateExpression(r[4])
            : { type: 'number', value: 1 },
          l = 'through' === r[2].toLowerCase();
        if ('number' !== n.type || 'number' !== s.type || 'number' !== a.type)
          return void this.addError({
            code: 'TYPE_ERROR',
            message: '@for requires numeric values',
            start: this.location(),
          });
        let o = n.value,
          u = s.value,
          c = Math.abs(a.value) || 1,
          d = u >= o ? 1 : -1,
          h = ev(this.state.scope),
          p = this.state.scope,
          m = o;
        for (; d > 0 ? (l ? m <= u : m < u) : l ? m >= u : m > u; )
          (this.state.iterations++,
            this.checkLimits(),
            eN(h, e, { type: 'number', value: m, unit: '' }),
            (this.state.scope = h),
            this.executeBlock(i),
            (m += c * d));
        this.state.scope = p;
      }
      parseEach() {
        (this.skipWhitespace(), this.state.iterations++, this.checkLimits());
        let e = [];
        for (; '$' === this.peek(); )
          (e.push(this.readVariable()),
            this.skipWhitespace(),
            ',' === this.peek() && (this.advance(), this.skipWhitespace()));
        let t = this.readUntil('{', !1).trim(),
          i = this.readBlock(),
          r = t.match(/^in\s+(.+)$/i);
        if (!r)
          return void this.addError({
            code: 'SYNTAX_ERROR',
            message: "Invalid @each syntax, expected 'in'",
            start: this.location(),
          });
        let n = r[1].trim(),
          s;
        s =
          n.startsWith('(') && eb(n.slice(1), ':') > 0
            ? eA(n)
            : n.startsWith('$')
              ? this.evaluateExpression(n)
              : ek(n);
        let a = ev(this.state.scope),
          l = this.state.scope;
        if ('map' === s.type)
          s.entries.forEach((t, r) => {
            (this.state.iterations++,
              this.checkLimits(),
              e.length >= 1 &&
                eN(a, e[0], { type: 'string', value: r, quoted: !1 }),
              e.length >= 2 && eN(a, e[1], t),
              (this.state.scope = a),
              this.executeBlock(i));
          });
        else if ('list' === s.type)
          for (let t of s.values) {
            if ((this.state.iterations++, this.checkLimits(), 1 === e.length))
              eN(a, e[0], t);
            else if ('list' === t.type && e.length > 1)
              for (let i = 0; i < e.length && i < t.values.length; i++)
                eN(a, e[i], t.values[i]);
            ((this.state.scope = a), this.executeBlock(i));
          }
        else
          (this.state.iterations++,
            this.checkLimits(),
            eN(a, e[0], s),
            (this.state.scope = a),
            this.executeBlock(i));
        this.state.scope = l;
      }
      parseNativeAtRule(e) {
        this.skipWhitespace();
        let t = this.readUntil('{;', !1);
        if ((this.skipWhitespace(), '{' === this.peek())) {
          let i = this.interpolate(e),
            r = this.substituteVariables(this.interpolate(t.trim()));
          this.state.atRuleStack.push(`${i} ${r}`);
          let n = this.location();
          this.advance();
          let s = this.state.output;
          ((this.state.output = []),
            [
              '@font-face',
              '@page',
              '@counter-style',
              '@font-feature-values',
              '@property',
            ].includes(e)
              ? this.parseDeclarationBlock()
              : this.parseStylesheet(),
            '}' === this.peek()
              ? this.advance()
              : this.addError({
                  code: 'UNCLOSED_BLOCK',
                  message: `Unclosed block: missing closing brace for "${i} ${r}"`,
                  start: n,
                  end: this.location(),
                }));
          let a = this.state.output.join(
            this.config.minify
              ? ''
              : `
`,
          );
          ((this.state.output = s),
            a.trim() &&
              this.state.output.push(
                `${i} ${r} {${
                  this.config.minify
                    ? ''
                    : `
`
                }${a}${
                  this.config.minify
                    ? ''
                    : `
`
                }}`,
              ),
            this.state.atRuleStack.pop());
        } else
          (';' === this.peek() && this.advance(),
            this.state.output.push(
              `${this.interpolate(e)} ${this.substituteVariables(this.interpolate(t.trim()))};`,
            ));
      }
      parseDeclarationBlock() {
        for (
          ;
          this.pos < this.input.length &&
          (this.skipWhitespace(), '}' !== this.peek());
        ) {
          if ('/' === this.peek() && '*' === this.peek(1)) {
            let e = this.readMultiLineComment();
            e && this.state.output.push(e);
            continue;
          }
          let e = this.parseDeclaration();
          e
            ? this.state.output.push('  ' + e + ';')
            : '}' !== this.peek() && this.advance();
        }
      }
      parseRuleset() {
        let e = this.pos,
          t = this.readUntil('{', !1);
        if ((this.skipWhitespace(), '{' !== this.peek())) {
          ((this.pos = e),
            this.readUntil(';}', !0),
            ';' === this.peek() && this.advance());
          return;
        }
        let i = this.location();
        (this.advance(), this.state.rules++, this.checkLimits());
        let r = this.parseSelectors(t),
          n = this.resolveSelectors(r);
        this.state.selectorStack.push(n.join(', '));
        let s = [],
          a = [],
          l = this.inRulesetContext;
        this.inRulesetContext = !0;
        let o = !1;
        for (; this.pos < this.input.length; ) {
          if ((this.skipWhitespace(), '}' === this.peek())) {
            (this.advance(), (o = !0));
            break;
          }
          let e = this.peek();
          if ('/' === e && '*' === this.peek(1)) {
            this.readMultiLineComment();
            continue;
          }
          if ('@' === e) {
            let e = this.peekAtKeyword();
            if ('@include' === e) {
              this.advance(8);
              let e = this.state.output;
              for (let e of ((this.state.output = []),
              this.parseInclude(),
              this.state.output))
                e.includes('{') ? a.push(e) : s.push(e);
              this.state.output = e;
            } else if ('@if' === e) {
              this.advance(3);
              let e = this.state.output;
              for (let e of ((this.state.output = []),
              this.parseIf(),
              this.state.output))
                e.includes('{') ? a.push(e) : s.push(e);
              this.state.output = e;
            } else if ('@for' === e) {
              this.advance(4);
              let e = this.state.output;
              for (let e of ((this.state.output = []),
              this.parseFor(),
              this.state.output))
                e.includes('{') ? a.push(e) : s.push(e);
              this.state.output = e;
            } else if ('@each' === e) {
              this.advance(5);
              let e = this.state.output;
              for (let e of ((this.state.output = []),
              this.parseEach(),
              this.state.output))
                e.includes('{') ? a.push(e) : s.push(e);
              this.state.output = e;
            } else if (
              '@media' === e ||
              '@supports' === e ||
              '@container' === e
            ) {
              let e = this.state.output;
              ((this.state.output = []),
                this.parseAtRule(),
                a.push(...this.state.output),
                (this.state.output = e));
            } else this.parseAtRule();
            continue;
          }
          if ('$' === e) {
            this.parseVariableDeclaration();
            continue;
          }
          if (
            '&' === e ||
            '.' === e ||
            '[' === e ||
            ':' === e ||
            '*' === e ||
            ('#' === e && '{' !== this.peek(1)) ||
            (this.isIdentStart(e) && this.looksLikeSelector()) ||
            (('+' === e || '>' === e || '~' === e) && this.looksLikeSelector())
          ) {
            let e = this.state.output;
            ((this.state.output = []),
              this.parseRuleset(),
              a.push(...this.state.output),
              (this.state.output = e));
            continue;
          }
          let t = this.parseDeclaration();
          t ? s.push(t) : '}' !== this.peek() && this.advance();
        }
        if (
          (o ||
            this.addError({
              code: 'UNCLOSED_BLOCK',
              message: `Unclosed block: missing closing brace for "${t.trim()}"`,
              start: i,
              end: this.location(),
            }),
          (this.inRulesetContext = l),
          this.state.selectorStack.pop(),
          s.length > 0)
        ) {
          let e = s.join(
              this.config.minify
                ? ';'
                : `;
  `,
            ),
            t = n.join(this.config.minify ? ',' : ', ');
          this.config.minify
            ? this.state.output.push(`${t}{${e}}`)
            : this.state.output.push(`${t} {
  ${e};
}`);
        }
        this.state.output.push(...a);
      }
      peekAtKeyword() {
        let e = this.pos,
          t = '';
        for (
          ;
          e < this.input.length &&
          ('@' === this.input[e] || this.isIdentChar(this.input[e]));
        )
          ((t += this.input[e]), e++);
        return t;
      }
      looksLikeSelector() {
        let e = this.pos,
          t = 0;
        for (; e < this.input.length; ) {
          let i = this.input[e];
          if ('#' === i && '{' === this.input[e + 1]) {
            let t = 1;
            for (e += 2; e < this.input.length && t > 0; )
              ('{' === this.input[e] && t++, '}' === this.input[e] && t--, e++);
            continue;
          }
          if ('{' === i) return !0;
          if (('}' === i && 0 === t) || (';' === i && 0 === t)) break;
          if (':' === i) {
            let t = this.input[e + 1];
            if (
              (':' === t || ' ' === t || /[a-z]/i.test(t)) &&
              /^:(hover|focus|active|visited|first-child|last-child|nth-child|before|after|not|where|is|has)/i.test(
                this.input.slice(e),
              )
            )
              return !0;
          }
          ('(' === i && t++, ')' === i && t--, e++);
        }
        return !1;
      }
      parseSelectors(e) {
        let t = [],
          i = '',
          r = 0;
        for (let n = 0; n < e.length; n++) {
          let s = e[n];
          (('(' === s || '[' === s) && r++,
            (')' === s || ']' === s) && r--,
            ',' === s && 0 === r
              ? (i.trim() && t.push(i.trim()), (i = ''))
              : (i += s));
        }
        return (
          i.trim() && t.push(i.trim()),
          t.map((e) => this.interpolate(e))
        );
      }
      resolveSelectors(e) {
        if (0 === this.state.selectorStack.length) return e;
        let t =
            this.state.selectorStack[this.state.selectorStack.length - 1].split(
              /\s*,\s*/,
            ),
          i = [];
        for (let r of t)
          for (let t of e)
            t.includes('&') ? i.push(t.replace(/&/g, r)) : i.push(`${r} ${t}`);
        return i;
      }
      parseDeclaration() {
        let e = this.pos,
          t = '',
          i = !1,
          r = 0;
        for (; this.pos < this.input.length; ) {
          let n = this.peek();
          if ('#' === n && '{' === this.peek(1)) {
            ((i = !0), (r = 1), (t += this.advance(2)));
            continue;
          }
          if (i) {
            ('{' === n && r++,
              '}' === n && 0 == --r && (i = !1),
              (t += this.advance()));
            continue;
          }
          if (':' === n) break;
          if (';' === n || '}' === n || '{' === n)
            return ((this.pos = e), null);
          t += this.advance();
        }
        if (':' !== this.peek()) return null;
        (this.advance(),
          this.skipWhitespace(),
          (t = this.interpolate(t.trim())),
          (this.valueStartPos = this.pos));
        let n = '',
          s = 0;
        for (i = !1, r = 0; this.pos < this.input.length; ) {
          let e = this.peek();
          if ('#' === e && '{' === this.peek(1)) {
            ((i = !0), (r = 1), (n += this.advance(2)));
            continue;
          }
          if (i) {
            ('{' === e && r++,
              '}' === e && 0 == --r && (i = !1),
              (n += this.advance()));
            continue;
          }
          if (
            (('(' === e || '[' === e) && s++,
            (')' === e || ']' === e) && s--,
            (';' === e || '}' === e) && 0 === s)
          ) {
            ';' === e && this.advance();
            break;
          }
          n += this.advance();
        }
        return ((n = this.processValue(n.trim())), `${t}: ${n}`);
      }
      processValue(e) {
        return (
          (e = this.interpolate(e)),
          (e = this.evaluateFunctionCalls(e)),
          (e = this.substituteVariables(e)),
          (e = this.evaluateMath(e))
        );
      }
      evaluateFunctionCalls(e) {
        let t =
            /^(url|var|calc|min|max|clamp|attr|env|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|color|hwb|lab|lch|oklab|oklch|rgb|rgba|hsl|hsla)$/i,
          i =
            /^(darken|lighten|saturate|desaturate|adjust-hue|rgba|mix|complement|invert|grayscale|red|green|blue|alpha|opacity|hue|saturation|lightness|round|ceil|floor|abs|min|max|percentage|length|nth|index|map-get|map-has-key|type-of|unit|unitless|quote|unquote|str-length|str-slice|str-index|to-upper-case|to-lower-case|if)$/i,
          r = e,
          n = !0,
          s = 0;
        for (; n && s < 100; ) {
          ((n = !1), s++);
          let e = /([a-zA-Z_][\w-]*)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
          r = r.replace(e, (e, r, s, a) => {
            if (t.test(r) && !i.test(r)) return e;
            let l = this.state.functions.has(r);
            if (l || i.test(r))
              try {
                let t = this.evaluateExpression(e);
                if ('null' !== t.type) return ((n = !0), eo(t));
              } catch {}
            if (!i.test(r) && !l) {
              let e = this.evaluateFunctionCalls(s);
              if (e !== s) return ((n = !0), `${r}(${e})`);
            }
            return e;
          });
        }
        return r;
      }
      interpolate(e) {
        let t = '',
          i = 0;
        for (; i < e.length; )
          if ('#' === e[i] && '{' === e[i + 1]) {
            let r = 1,
              n = i + 2;
            for (; n < e.length && r > 0; )
              ('{' === e[n] && r++, '}' === e[n] && r--, n++);
            let s = e.slice(i + 2, n - 1),
              a = this.evaluateExpression(s);
            ('string' === a.type ? (t += a.value) : (t += eo(a)), (i = n));
          } else ((t += e[i]), i++);
        return t;
      }
      substituteVariables(e) {
        return e.replace(/\$[\w-]+/g, (e, t) => {
          let i = ew(this.state.scope, e);
          if (i) return eo(i);
          let r = this.valueStartPos + t;
          return (
            this.addWarning({
              code: 'UNDEFINED_VARIABLE',
              message: `Undefined variable: ${e}`,
              start: this.locationAt(r),
              end: this.locationAt(r + e.length),
            }),
            e
          );
        });
      }
      evaluateMath(e) {
        return this.looksLikeMath(e) && !e.includes('(')
          ? eo(this.evaluateExpression(e))
          : e.replace(/\(([^()]+)\)/g, (t, i, r) => {
              let n = e.slice(0, r);
              return /(?:calc|var|min|max|clamp|url|rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|linear-gradient|radial-gradient|conic-gradient|attr|translateX|translateY|translateZ|translate|translate3d|rotateX|rotateY|rotateZ|rotate|rotate3d|scaleX|scaleY|scaleZ|scale|scale3d|skewX|skewY|skew|perspective|matrix|matrix3d|cubic-bezier|steps|drop-shadow|blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|path|polygon|circle|ellipse|inset|rect|image-set|element|paint|cross-fade|image|symbols|counter|counters|format|local|annotation|stylistic|ornaments|styleset|character-variant|swash|leader|target-counter|target-counters|target-text)\s*$/i.test(
                n,
              )
                ? t
                : this.looksLikeMath(i)
                  ? eo(this.evaluateExpression(i))
                  : t;
            });
      }
      looksLikeMath(e) {
        if (/^(calc|var|min|max|clamp)\s*\(/i.test(e.trim())) return !1;
        let t = /\$/.test(e);
        if (
          e.includes('/') &&
          !t &&
          !/\s\/\s/.test(e) &&
          !/\s[+\-*%]\s/.test(e)
        )
          return !1;
        let i = /\s[+\-*/%]\s/.test(e),
          r = t && /[+\-*/%]/.test(e);
        return (i || r) && (/\d/.test(e) || t);
      }
      evaluateExpression(e) {
        let t = this.interpolate(e),
          i = new Map();
        return (
          this.state.functions.forEach((e, t) => {
            i.set(t, (...t) => this.executeFunction(e, t));
          }),
          this.evaluator.evaluate(t, this.state.scope, i)
        );
      }
      executeFunction(e, t) {
        let i = ev(this.state.scope);
        for (let r = 0; r < e.params.length; r++) {
          let n = e.params[r],
            s =
              t[r] ||
              (n.defaultValue
                ? this.evaluateExpression(n.defaultValue)
                : { type: 'null' });
          eN(i, n.name, s);
        }
        let r = this.state.scope;
        this.state.scope = i;
        let n = this.executeFunctionBody(e.body);
        return ((this.state.scope = r), n);
      }
      executeFunctionBody(e) {
        let t = this.pos,
          i = this.input;
        ((this.input = e), (this.pos = 0));
        let r = { type: 'null' };
        for (
          ;
          this.pos < this.input.length &&
          (this.skipWhitespace(), !(this.pos >= this.input.length));
        )
          if ('@' === this.peek()) {
            let e = this.peekAtKeyword();
            if ('@return' === e) {
              (this.advance(7), this.skipWhitespace());
              let e = this.readUntil(';}', !0).trim();
              (';' === this.peek() && this.advance(),
                (r = this.evaluateExpression(e)));
              break;
            }
            if ('@if' === e) {
              this.advance(3);
              let e = this.executeIfForReturn();
              if (null !== e) {
                r = e;
                break;
              }
            } else if ('@for' === e) {
              this.advance(4);
              let e = this.executeForForReturn();
              if (null !== e) {
                r = e;
                break;
              }
            } else if ('@each' === e) {
              this.advance(5);
              let e = this.executeEachForReturn();
              if (null !== e) {
                r = e;
                break;
              }
            } else
              (this.readUntil(';}', !0), ';' === this.peek() && this.advance());
          } else
            '$' === this.peek()
              ? this.parseVariableDeclaration()
              : (this.readUntil(';}', !0),
                ';' === this.peek() && this.advance());
        return ((this.pos = t), (this.input = i), r);
      }
      executeIfForReturn() {
        this.skipWhitespace();
        let e = [],
          t = this.readUntil('{', !1).trim(),
          i = this.readBlock();
        for (
          e.push({ condition: t, block: i });
          this.skipWhitespace(),
            '@else' === this.input.slice(this.pos, this.pos + 5);
        )
          if (
            (this.advance(5),
            this.skipWhitespace(),
            'if' === this.input.slice(this.pos, this.pos + 2))
          ) {
            (this.advance(2), this.skipWhitespace());
            let t = this.readUntil('{', !1).trim(),
              i = this.readBlock();
            e.push({ condition: t, block: i });
          } else if ('{' === this.peek()) {
            let t = this.readBlock();
            e.push({ condition: null, block: t });
            break;
          } else break;
        for (let t of e)
          if (null === t.condition) {
            let e = this.executeFunctionBody(t.block);
            if ('null' !== e.type) return e;
            break;
          } else if (this.evaluateCondition(t.condition)) {
            let e = this.executeFunctionBody(t.block);
            if ('null' !== e.type) return e;
            break;
          }
        return null;
      }
      executeForForReturn() {
        if (
          (this.skipWhitespace(),
          this.state.iterations++,
          this.checkLimits(),
          '$' !== this.peek())
        )
          return null;
        let e = this.readVariable();
        this.skipWhitespace();
        let t = this.readUntil('{', !1).trim(),
          i = this.readBlock(),
          r = t.match(/from\s+(.+?)\s+(through|to)\s+(.+?)(?:\s+by\s+(.+))?$/i);
        if (!r) return null;
        let n = this.evaluateExpression(r[1]),
          s = this.evaluateExpression(r[3]),
          a = r[4]
            ? this.evaluateExpression(r[4])
            : { type: 'number', value: 1 },
          l = 'through' === r[2].toLowerCase();
        if ('number' !== n.type || 'number' !== s.type || 'number' !== a.type)
          return null;
        let o = n.value,
          u = s.value,
          c = Math.abs(a.value) || 1,
          d = u >= o ? 1 : -1,
          h = ev(this.state.scope),
          p = this.state.scope,
          m = o;
        for (; d > 0 ? (l ? m <= u : m < u) : l ? m >= u : m > u; ) {
          (this.state.iterations++,
            this.checkLimits(),
            eN(h, e, { type: 'number', value: m, unit: '' }),
            (this.state.scope = h));
          let t = this.executeFunctionBody(i);
          if ('null' !== t.type) return ((this.state.scope = p), t);
          m += c * d;
        }
        return ((this.state.scope = p), null);
      }
      executeEachForReturn() {
        (this.skipWhitespace(), this.state.iterations++, this.checkLimits());
        let e = [];
        for (; '$' === this.peek(); )
          (e.push(this.readVariable()),
            this.skipWhitespace(),
            ',' === this.peek() && (this.advance(), this.skipWhitespace()));
        let t = this.readUntil('{', !1).trim(),
          i = this.readBlock(),
          r = t.match(/^in\s+(.+)$/i);
        if (!r) return null;
        let n = r[1].trim(),
          s;
        s =
          n.startsWith('(') && eb(n.slice(1), ':') > 0
            ? eA(n)
            : n.startsWith('$')
              ? this.evaluateExpression(n)
              : ek(n);
        let a = ev(this.state.scope),
          l = this.state.scope;
        if ('map' === s.type)
          for (let [t, r] of s.entries) {
            (this.state.iterations++,
              this.checkLimits(),
              e.length >= 1 &&
                eN(a, e[0], { type: 'string', value: t, quoted: !1 }),
              e.length >= 2 && eN(a, e[1], r),
              (this.state.scope = a));
            let n = this.executeFunctionBody(i);
            if ('null' !== n.type) return ((this.state.scope = l), n);
          }
        else if ('list' === s.type)
          for (let t of s.values) {
            (this.state.iterations++,
              this.checkLimits(),
              1 === e.length && eN(a, e[0], t),
              (this.state.scope = a));
            let r = this.executeFunctionBody(i);
            if ('null' !== r.type) return ((this.state.scope = l), r);
          }
        return ((this.state.scope = l), null);
      }
      evaluateCondition(e) {
        return eE(this.evaluateExpression(e));
      }
      executeBlock(e) {
        let t = this.pos,
          i = this.input;
        ((this.input = e),
          (this.pos = 0),
          this.inMixinContext || this.inRulesetContext
            ? this.parseMixinBody()
            : this.parseStylesheet(),
          (this.pos = t),
          (this.input = i));
      }
      readBlock() {
        if ('{' !== this.peek()) return '';
        let e = this.location();
        this.advance();
        let t = 1,
          i = '',
          r = null;
        for (; this.pos < this.input.length && t > 0; ) {
          let e = this.peek();
          if (r) {
            ((i += this.advance()),
              e === r && '\\' !== this.input[this.pos - 2] && (r = null));
            continue;
          }
          if ('"' === e || "'" === e) {
            ((r = e), (i += this.advance()));
            continue;
          }
          if (('{' === e && t++, '}' === e && 0 == --t)) {
            this.advance();
            break;
          }
          i += this.advance();
        }
        return (
          t > 0 &&
            this.addError({
              code: 'UNCLOSED_BLOCK',
              message: 'Unclosed block: missing closing brace',
              start: e,
              end: this.location(),
            }),
          i
        );
      }
      readUntil(e, t) {
        let i = '',
          r = 0,
          n = null;
        for (; this.pos < this.input.length; ) {
          let s = this.peek();
          if (n) {
            ((i += this.advance()),
              s === n && '\\' !== this.input[this.pos - 2] && (n = null));
            continue;
          }
          if ('"' === s || "'" === s) {
            ((n = s), (i += this.advance()));
            continue;
          }
          if ('#' === s && '{' === this.peek(1)) {
            i += this.advance(2);
            let e = 1;
            for (; this.pos < this.input.length && e > 0; ) {
              let t = this.peek();
              ('{' === t && e++, '}' === t && e--, (i += this.advance()));
            }
            continue;
          }
          if (
            (t &&
              (('(' === s || '[' === s || '{' === s) && r++,
              (')' === s || ']' === s || '}' === s) && r--),
            0 === r && e.includes(s))
          )
            break;
          i += this.advance();
        }
        return i;
      }
      readIdent() {
        let e = '';
        for (; this.pos < this.input.length && this.isIdentChar(this.peek()); )
          e += this.advance();
        return e;
      }
      readArgument() {
        let e = '',
          t = 0,
          i = null;
        for (; this.pos < this.input.length; ) {
          let r = this.peek();
          if (i) {
            ((e += this.advance()),
              r === i && '\\' !== this.input[this.pos - 2] && (i = null));
            continue;
          }
          if ('"' === r || "'" === r) {
            ((i = r), (e += this.advance()));
            continue;
          }
          if (('(' === r && t++, ')' === r)) {
            if (0 === t) break;
            t--;
          }
          if (',' === r && 0 === t) break;
          e += this.advance();
        }
        return e.trim();
      }
      isIdentStart(e) {
        return (
          (e >= 'a' && e <= 'z') ||
          (e >= 'A' && e <= 'Z') ||
          '_' === e ||
          '-' === e
        );
      }
      isIdentChar(e) {
        return this.isIdentStart(e) || (e >= '0' && e <= '9');
      }
      formatOutput() {
        return this.config.minify
          ? this.state.output.join('')
          : this.state.output.join(`

`);
      }
    },
    eO = class extends Error {
      constructor(e, t, i) {
        (super(t),
          (this.code = e),
          (this.location = i),
          (this.name = 'CompilerError'));
      }
    },
    eR = Uint8Array,
    eP = Uint16Array,
    eV = Int32Array,
    eU = new eR([
      0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5,
      5, 5, 5, 0, 0, 0, 0,
    ]),
    e$ = new eR([
      0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
      11, 11, 12, 12, 13, 13, 0, 0,
    ]),
    eB = new eR([
      16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
    ]),
    e_ = function (e, t) {
      for (var i = new eP(31), r = 0; r < 31; ++r) i[r] = t += 1 << e[r - 1];
      for (var n = new eV(i[30]), r = 1; r < 30; ++r)
        for (var s = i[r]; s < i[r + 1]; ++s) n[s] = ((s - i[r]) << 5) | r;
      return { b: i, r: n };
    },
    eF = e_(eU, 2),
    eW = eF.b,
    eY = eF.r;
  ((eW[28] = 258), (eY[258] = 28));
  for (
    var eQ = e_(e$, 0), eq = eQ.b, eG = eQ.r, eH = new eP(32768), eZ = 0;
    eZ < 32768;
    ++eZ
  ) {
    var eX = ((43690 & eZ) >> 1) | ((21845 & eZ) << 1);
    ((eX =
      ((61680 & (eX = ((52428 & eX) >> 2) | ((13107 & eX) << 2))) >> 4) |
      ((3855 & eX) << 4)),
      (eH[eZ] = (((65280 & eX) >> 8) | ((255 & eX) << 8)) >> 1));
  }
  for (
    var eK = function (e, t, i) {
        for (var r, n = e.length, s = 0, a = new eP(t); s < n; ++s)
          e[s] && ++a[e[s] - 1];
        var l = new eP(t);
        for (s = 1; s < t; ++s) l[s] = (l[s - 1] + a[s - 1]) << 1;
        if (i) {
          r = new eP(1 << t);
          var o = 15 - t;
          for (s = 0; s < n; ++s)
            if (e[s])
              for (
                var u = (s << 4) | e[s],
                  c = t - e[s],
                  d = l[e[s] - 1]++ << c,
                  h = d | ((1 << c) - 1);
                d <= h;
                ++d
              )
                r[eH[d] >> o] = u;
        } else
          for (s = 0, r = new eP(n); s < n; ++s)
            e[s] && (r[s] = eH[l[e[s] - 1]++] >> (15 - e[s]));
        return r;
      },
      eJ = new eR(288),
      eZ = 0;
    eZ < 144;
    ++eZ
  )
    eJ[eZ] = 8;
  for (var eZ = 144; eZ < 256; ++eZ) eJ[eZ] = 9;
  for (var eZ = 256; eZ < 280; ++eZ) eJ[eZ] = 7;
  for (var eZ = 280; eZ < 288; ++eZ) eJ[eZ] = 8;
  for (var e0 = new eR(32), eZ = 0; eZ < 32; ++eZ) e0[eZ] = 5;
  var e1 = eK(eJ, 9, 0),
    e2 = eK(eJ, 9, 1),
    e4 = eK(e0, 5, 0),
    e3 = eK(e0, 5, 1),
    e5 = function (e) {
      for (var t = e[0], i = 1; i < e.length; ++i) e[i] > t && (t = e[i]);
      return t;
    },
    e7 = function (e, t, i) {
      var r = (t / 8) | 0;
      return ((e[r] | (e[r + 1] << 8)) >> (7 & t)) & i;
    },
    e8 = function (e, t) {
      var i = (t / 8) | 0;
      return (e[i] | (e[i + 1] << 8) | (e[i + 2] << 16)) >> (7 & t);
    },
    e6 = function (e) {
      return ((e + 7) / 8) | 0;
    },
    e9 = function (e, t, i) {
      return (
        (null == t || t < 0) && (t = 0),
        (null == i || i > e.length) && (i = e.length),
        new eR(e.subarray(t, i))
      );
    },
    te = [
      'unexpected EOF',
      'invalid block type',
      'invalid length/literal',
      'invalid distance',
      'stream finished',
      'no stream handler',
      ,
      'no callback',
      'invalid UTF-8 data',
      'extra field too long',
      'date not in range 1980-2099',
      'filename too long',
      'stream finishing',
      'invalid zip data',
    ],
    tt = function (e, t, i) {
      var r = Error(t || te[e]);
      if (
        ((r.code = e),
        Error.captureStackTrace && Error.captureStackTrace(r, tt),
        !i)
      )
        throw r;
      return r;
    },
    ti = function (e, t, i, r) {
      var n = e.length,
        s = r ? r.length : 0;
      if (!n || (t.f && !t.l)) return i || new eR(0);
      var a = !i,
        l = a || 2 != t.i,
        o = t.i;
      a && (i = new eR(3 * n));
      var u = function (e) {
          var t = i.length;
          if (e > t) {
            var r = new eR(Math.max(2 * t, e));
            (r.set(i), (i = r));
          }
        },
        c = t.f || 0,
        d = t.p || 0,
        h = t.b || 0,
        p = t.l,
        m = t.d,
        g = t.m,
        f = t.n,
        y = 8 * n;
      do {
        if (!p) {
          c = e7(e, d, 1);
          var b = e7(e, d + 1, 3);
          if (((d += 3), b))
            if (1 == b) ((p = e2), (m = e3), (g = 9), (f = 5));
            else if (2 == b) {
              var M = e7(e, d, 31) + 257,
                v = e7(e, d + 10, 15) + 4,
                w = M + e7(e, d + 5, 31) + 1;
              d += 14;
              for (var N = new eR(w), S = new eR(19), E = 0; E < v; ++E)
                S[eB[E]] = e7(e, d + 3 * E, 7);
              d += 3 * v;
              for (
                var x = e5(S), I = (1 << x) - 1, L = eK(S, x, 1), E = 0;
                E < w;
              ) {
                var k = L[e7(e, d, I)];
                d += 15 & k;
                var T = k >> 4;
                if (T < 16) N[E++] = T;
                else {
                  var A = 0,
                    C = 0;
                  for (
                    16 == T
                      ? ((C = 3 + e7(e, d, 3)), (d += 2), (A = N[E - 1]))
                      : 17 == T
                        ? ((C = 3 + e7(e, d, 7)), (d += 3))
                        : 18 == T && ((C = 11 + e7(e, d, 127)), (d += 7));
                    C--;
                  )
                    N[E++] = A;
                }
              }
              var D = N.subarray(0, M),
                j = N.subarray(M);
              ((g = e5(D)), (f = e5(j)), (p = eK(D, g, 1)), (m = eK(j, f, 1)));
            } else tt(1);
          else {
            var T = e6(d) + 4,
              z = e[T - 4] | (e[T - 3] << 8),
              O = T + z;
            if (O > n) {
              o && tt(0);
              break;
            }
            (l && u(h + z),
              i.set(e.subarray(T, O), h),
              (t.b = h += z),
              (t.p = d = 8 * O),
              (t.f = c));
            continue;
          }
          if (d > y) {
            o && tt(0);
            break;
          }
        }
        l && u(h + 131072);
        for (var R = (1 << g) - 1, P = (1 << f) - 1, V = d; ; V = d) {
          var A = p[e8(e, d) & R],
            U = A >> 4;
          if ((d += 15 & A) > y) {
            o && tt(0);
            break;
          }
          if ((A || tt(2), U < 256)) i[h++] = U;
          else if (256 == U) {
            ((V = d), (p = null));
            break;
          } else {
            var $ = U - 254;
            if (U > 264) {
              var E = U - 257,
                B = eU[E];
              (($ = e7(e, d, (1 << B) - 1) + eW[E]), (d += B));
            }
            var _ = m[e8(e, d) & P],
              F = _ >> 4;
            (_ || tt(3), (d += 15 & _));
            var j = eq[F];
            if (F > 3) {
              var B = e$[F];
              ((j += e8(e, d) & ((1 << B) - 1)), (d += B));
            }
            if (d > y) {
              o && tt(0);
              break;
            }
            l && u(h + 131072);
            var W = h + $;
            if (h < j) {
              var Y = s - j,
                Q = Math.min(j, W);
              for (Y + h < 0 && tt(3); h < Q; ++h) i[h] = r[Y + h];
            }
            for (; h < W; ++h) i[h] = i[h - j];
          }
        }
        ((t.l = p),
          (t.p = V),
          (t.b = h),
          (t.f = c),
          p && ((c = 1), (t.m = g), (t.d = m), (t.n = f)));
      } while (!c);
      return h != i.length && a ? e9(i, 0, h) : i.subarray(0, h);
    },
    tr = function (e, t, i) {
      i <<= 7 & t;
      var r = (t / 8) | 0;
      ((e[r] |= i), (e[r + 1] |= i >> 8));
    },
    tn = function (e, t, i) {
      i <<= 7 & t;
      var r = (t / 8) | 0;
      ((e[r] |= i), (e[r + 1] |= i >> 8), (e[r + 2] |= i >> 16));
    },
    ts = function (e, t) {
      for (var i = [], r = 0; r < e.length; ++r)
        e[r] && i.push({ s: r, f: e[r] });
      var n = i.length,
        s = i.slice();
      if (!n) return { t: th, l: 0 };
      if (1 == n) {
        var a = new eR(i[0].s + 1);
        return ((a[i[0].s] = 1), { t: a, l: 1 });
      }
      (i.sort(function (e, t) {
        return e.f - t.f;
      }),
        i.push({ s: -1, f: 25001 }));
      var l = i[0],
        o = i[1],
        u = 0,
        c = 1,
        d = 2;
      for (i[0] = { s: -1, f: l.f + o.f, l: l, r: o }; c != n - 1; )
        ((l = i[i[u].f < i[d].f ? u++ : d++]),
          (o = i[u != c && i[u].f < i[d].f ? u++ : d++]),
          (i[c++] = { s: -1, f: l.f + o.f, l: l, r: o }));
      for (var h = s[0].s, r = 1; r < n; ++r) s[r].s > h && (h = s[r].s);
      var p = new eP(h + 1),
        m = ta(i[c - 1], p, 0);
      if (m > t) {
        var r = 0,
          g = 0,
          f = m - t,
          y = 1 << f;
        for (
          s.sort(function (e, t) {
            return p[t.s] - p[e.s] || e.f - t.f;
          });
          r < n;
          ++r
        ) {
          var b = s[r].s;
          if (p[b] > t) ((g += y - (1 << (m - p[b]))), (p[b] = t));
          else break;
        }
        for (g >>= f; g > 0; ) {
          var M = s[r].s;
          p[M] < t ? (g -= 1 << (t - p[M]++ - 1)) : ++r;
        }
        for (; r >= 0 && g; --r) {
          var v = s[r].s;
          p[v] == t && (--p[v], ++g);
        }
        m = t;
      }
      return { t: new eR(p), l: m };
    },
    ta = function (e, t, i) {
      return -1 == e.s
        ? Math.max(ta(e.l, t, i + 1), ta(e.r, t, i + 1))
        : (t[e.s] = i);
    },
    tl = function (e) {
      for (var t = e.length; t && !e[--t]; );
      for (
        var i = new eP(++t),
          r = 0,
          n = e[0],
          s = 1,
          a = function (e) {
            i[r++] = e;
          },
          l = 1;
        l <= t;
        ++l
      )
        if (e[l] == n && l != t) ++s;
        else {
          if (!n && s > 2) {
            for (; s > 138; s -= 138) a(32754);
            s > 2 &&
              (a(s > 10 ? ((s - 11) << 5) | 28690 : ((s - 3) << 5) | 12305),
              (s = 0));
          } else if (s > 3) {
            for (a(n), --s; s > 6; s -= 6) a(8304);
            s > 2 && (a(((s - 3) << 5) | 8208), (s = 0));
          }
          for (; s--; ) a(n);
          ((s = 1), (n = e[l]));
        }
      return { c: i.subarray(0, r), n: t };
    },
    to = function (e, t) {
      for (var i = 0, r = 0; r < t.length; ++r) i += e[r] * t[r];
      return i;
    },
    tu = function (e, t, i) {
      var r = i.length,
        n = e6(t + 2);
      ((e[n] = 255 & r),
        (e[n + 1] = r >> 8),
        (e[n + 2] = 255 ^ e[n]),
        (e[n + 3] = 255 ^ e[n + 1]));
      for (var s = 0; s < r; ++s) e[n + s + 4] = i[s];
      return (n + 4 + r) * 8;
    },
    tc = function (e, t, i, r, n, s, a, l, o, u, c) {
      (tr(t, c++, i), ++n[256]);
      for (
        var d,
          h,
          p,
          m,
          g = ts(n, 15),
          f = g.t,
          y = g.l,
          b = ts(s, 15),
          M = b.t,
          v = b.l,
          w = tl(f),
          N = w.c,
          S = w.n,
          E = tl(M),
          x = E.c,
          I = E.n,
          L = new eP(19),
          k = 0;
        k < N.length;
        ++k
      )
        ++L[31 & N[k]];
      for (var k = 0; k < x.length; ++k) ++L[31 & x[k]];
      for (
        var T = ts(L, 7), A = T.t, C = T.l, D = 19;
        D > 4 && !A[eB[D - 1]];
        --D
      );
      var j = (u + 5) << 3,
        z = to(n, eJ) + to(s, e0) + a,
        O =
          to(n, f) +
          to(s, M) +
          a +
          14 +
          3 * D +
          to(L, A) +
          2 * L[16] +
          3 * L[17] +
          7 * L[18];
      if (o >= 0 && j <= z && j <= O) return tu(t, c, e.subarray(o, o + u));
      if ((tr(t, c, 1 + (O < z)), (c += 2), O < z)) {
        ((d = eK(f, y, 0)), (h = f), (p = eK(M, v, 0)), (m = M));
        var R = eK(A, C, 0);
        (tr(t, c, S - 257),
          tr(t, c + 5, I - 1),
          tr(t, c + 10, D - 4),
          (c += 14));
        for (var k = 0; k < D; ++k) tr(t, c + 3 * k, A[eB[k]]);
        c += 3 * D;
        for (var P = [N, x], V = 0; V < 2; ++V)
          for (var U = P[V], k = 0; k < U.length; ++k) {
            var $ = 31 & U[k];
            (tr(t, c, R[$]),
              (c += A[$]),
              $ > 15 && (tr(t, c, (U[k] >> 5) & 127), (c += U[k] >> 12)));
          }
      } else ((d = e1), (h = eJ), (p = e4), (m = e0));
      for (var k = 0; k < l; ++k) {
        var B = r[k];
        if (B > 255) {
          var $ = (B >> 18) & 31;
          (tn(t, c, d[$ + 257]),
            (c += h[$ + 257]),
            $ > 7 && (tr(t, c, (B >> 23) & 31), (c += eU[$])));
          var _ = 31 & B;
          (tn(t, c, p[_]),
            (c += m[_]),
            _ > 3 && (tn(t, c, (B >> 5) & 8191), (c += e$[_])));
        } else (tn(t, c, d[B]), (c += h[B]));
      }
      return (tn(t, c, d[256]), c + h[256]);
    },
    td = new eV([
      65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632,
    ]),
    th = new eR(0),
    tp = function (e, t, i, r, n, s) {
      var a = s.z || e.length,
        l = new eR(r + a + 5 * (1 + Math.ceil(a / 7e3)) + n),
        o = l.subarray(r, l.length - n),
        u = s.l,
        c = 7 & (s.r || 0);
      if (t) {
        c && (o[0] = s.r >> 3);
        for (
          var d = td[t - 1],
            h = d >> 13,
            p = 8191 & d,
            m = (1 << i) - 1,
            g = s.p || new eP(32768),
            f = s.h || new eP(m + 1),
            y = Math.ceil(i / 3),
            b = 2 * y,
            M = function (t) {
              return (e[t] ^ (e[t + 1] << y) ^ (e[t + 2] << b)) & m;
            },
            v = new eV(25e3),
            w = new eP(288),
            N = new eP(32),
            S = 0,
            E = 0,
            x = s.i || 0,
            I = 0,
            L = s.w || 0,
            k = 0;
          x + 2 < a;
          ++x
        ) {
          var T = M(x),
            A = 32767 & x,
            C = f[T];
          if (((g[A] = C), (f[T] = A), L <= x)) {
            var D = a - x;
            if ((S > 7e3 || I > 24576) && (D > 423 || !u)) {
              ((c = tc(e, o, 0, v, w, N, E, I, k, x - k, c)),
                (I = S = E = 0),
                (k = x));
              for (var j = 0; j < 286; ++j) w[j] = 0;
              for (var j = 0; j < 30; ++j) N[j] = 0;
            }
            var z = 2,
              O = 0,
              R = p,
              P = (A - C) & 32767;
            if (D > 2 && T == M(x - P))
              for (
                var V = Math.min(h, D) - 1,
                  U = Math.min(32767, x),
                  $ = Math.min(258, D);
                P <= U && --R && A != C;
              ) {
                if (e[x + z] == e[x + z - P]) {
                  for (var B = 0; B < $ && e[x + B] == e[x + B - P]; ++B);
                  if (B > z) {
                    if (((z = B), (O = P), B > V)) break;
                    for (var _ = Math.min(P, B - 2), F = 0, j = 0; j < _; ++j) {
                      var W = (x - P + j) & 32767,
                        Y = g[W],
                        Q = (W - Y) & 32767;
                      Q > F && ((F = Q), (C = W));
                    }
                  }
                }
                ((C = g[(A = C)]), (P += (A - C) & 32767));
              }
            if (O) {
              v[I++] = 0x10000000 | (eY[z] << 18) | eG[O];
              var q = 31 & eY[z],
                G = 31 & eG[O];
              ((E += eU[q] + e$[G]), ++w[257 + q], ++N[G], (L = x + z), ++S);
            } else ((v[I++] = e[x]), ++w[e[x]]);
          }
        }
        for (x = Math.max(x, L); x < a; ++x) ((v[I++] = e[x]), ++w[e[x]]);
        ((c = tc(e, o, u, v, w, N, E, I, k, x - k, c)),
          u ||
            ((s.r = (7 & c) | (o[(c / 8) | 0] << 3)),
            (c -= 7),
            (s.h = f),
            (s.p = g),
            (s.i = x),
            (s.w = L)));
      } else {
        for (var x = s.w || 0; x < a + u; x += 65535) {
          var H = x + 65535;
          (H >= a && ((o[(c / 8) | 0] = u), (H = a)),
            (c = tu(o, c + 1, e.subarray(x, H))));
        }
        s.i = a;
      }
      return e9(l, 0, r + e6(c) + n);
    },
    tm = (function () {
      for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
        for (var i = t, r = 9; --r; ) i = (1 & i && -0x12477ce0) ^ (i >>> 1);
        e[t] = i;
      }
      return e;
    })(),
    tg = function () {
      var e = -1;
      return {
        p: function (t) {
          for (var i = e, r = 0; r < t.length; ++r)
            i = tm[(255 & i) ^ t[r]] ^ (i >>> 8);
          e = i;
        },
        d: function () {
          return ~e;
        },
      };
    },
    tf = function (e, t, i, r, n) {
      if (!n && ((n = { l: 1 }), t.dictionary)) {
        var s = t.dictionary.subarray(-32768),
          a = new eR(s.length + e.length);
        (a.set(s), a.set(e, s.length), (e = a), (n.w = s.length));
      }
      return tp(
        e,
        null == t.level ? 6 : t.level,
        null == t.mem
          ? n.l
            ? Math.ceil(1.5 * Math.max(8, Math.min(13, Math.log(e.length))))
            : 20
          : 12 + t.mem,
        i,
        r,
        n,
      );
    },
    ty = function (e, t, i) {
      for (; i; ++t) ((e[t] = i), (i >>>= 8));
    },
    tb = function (e, t) {
      var i = t.filename;
      if (
        ((e[0] = 31),
        (e[1] = 139),
        (e[2] = 8),
        (e[8] = t.level < 2 ? 4 : 2 * (9 == t.level)),
        (e[9] = 3),
        0 != t.mtime &&
          ty(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)),
        i)
      ) {
        e[3] = 8;
        for (var r = 0; r <= i.length; ++r) e[r + 10] = i.charCodeAt(r);
      }
    },
    tM = function (e) {
      (31 != e[0] || 139 != e[1] || 8 != e[2]) && tt(6, 'invalid gzip data');
      var t = e[3],
        i = 10;
      4 & t && (i += (e[10] | (e[11] << 8)) + 2);
      for (var r = ((t >> 3) & 1) + ((t >> 4) & 1); r > 0; r -= !e[i++]);
      return i + (2 & t);
    },
    tv = function (e) {
      var t = e.length;
      return (
        (e[t - 4] | (e[t - 3] << 8) | (e[t - 2] << 16) | (e[t - 1] << 24)) >>> 0
      );
    },
    tw = 'undefined' != typeof TextEncoder && new TextEncoder(),
    tN = 'undefined' != typeof TextDecoder && new TextDecoder();
  try {
    tN.decode(th, { stream: !0 });
  } catch (e) {}
  var tS = function (e) {
    for (var t = '', i = 0; ; ) {
      var r = e[i++],
        n = (r > 127) + (r > 223) + (r > 239);
      if (i + n > e.length) return { s: t, r: e9(e, i - 1) };
      n
        ? 3 == n
          ? (t += String.fromCharCode(
              55296 |
                ((r =
                  (((15 & r) << 18) |
                    ((63 & e[i++]) << 12) |
                    ((63 & e[i++]) << 6) |
                    (63 & e[i++])) -
                  65536) >>
                  10),
              56320 | (1023 & r),
            ))
          : 1 & n
            ? (t += String.fromCharCode(((31 & r) << 6) | (63 & e[i++])))
            : (t += String.fromCharCode(
                ((15 & r) << 12) | ((63 & e[i++]) << 6) | (63 & e[i++]),
              ))
        : (t += String.fromCharCode(r));
    }
  };
  'function' == typeof queueMicrotask && queueMicrotask;
  let tE = '__COMPRESSED__';
  function tx(e) {
    if (!e.startsWith(tE)) return e;
    try {
      var t;
      let i = e.slice(tE.length),
        r = atob(i),
        n = new Uint8Array(r.length);
      for (let e = 0; e < r.length; e++) n[e] = r.charCodeAt(e);
      return (function (e, t) {
        if (tN) return tN.decode(e);
        var i,
          r = tS(e),
          n = r.s,
          i = r.r;
        return (i.length && tt(8), n);
      })(
        ((t = tM(n)) + 8 > n.length && tt(6, 'invalid gzip data'),
        ti(n.subarray(t, -8), { i: 2 }, new eR(tv(n)), void 0)),
      );
    } catch (t) {
      return (console.warn(C, 'Failed to decompress:', t), e);
    }
  }
  function tI(e) {
    return e.startsWith(tE);
  }
  let tL = [
    'userIdentity',
    'identityRegistered',
    'userThemeRatings',
    'keyCertificate',
  ];
  async function tk(e) {
    return await chrome.storage.local.get(e);
  }
  async function tT(e) {
    return await chrome.storage.local.get(e);
  }
  function tA(e) {
    try {
      var t;
      let i = performance.now(),
        r = ((t = { timeout: 3e3, maxIterations: 1e4 }), new ez(t).compile(e)),
        n = performance.now() - i;
      if (n > 5e3)
        return (
          tU(
            j,
            `rics compilation timeout: took ${n.toFixed(0)}ms
Source:
${tB(e)}`,
          ),
          e
        );
      if (r.errors.length > 0)
        return (
          tU(
            j,
            `rics compilation errors: ${JSON.stringify(r.errors)}
Source:
${tB(e)}`,
          ),
          e
        );
      return r.css;
    } catch (i) {
      let t = i instanceof Error ? i.message : String(i);
      return (
        tU(
          j,
          `rics compilation failed: ${t}
Source:
${tB(e)}`,
        ),
        e
      );
    }
  }
  async function tC() {
    let e = await tk(['customCSS_chunked', 'customCSS_chunkCount']);
    if (!e.customCSS_chunked || !e.customCSS_chunkCount) return null;
    let t = Array.from(
        { length: e.customCSS_chunkCount },
        (e, t) => `customCSS_chunk_${t}`,
      ),
      i = await tk(t),
      r = [];
    for (let t = 0; t < e.customCSS_chunkCount; t++) {
      let e = i[`customCSS_chunk_${t}`];
      if (!e) return (tU(j, `Missing CSS chunk ${t}`), null);
      r.push(e);
    }
    return r.join('');
  }
  function tD(e, t) {
    chrome.storage.local.get(e, t);
  }
  async function tj(e) {
    try {
      let t = (await chrome.storage.local.get(e))[e];
      if (!t) return null;
      let { value: i, expiry: r } = t;
      if (r && Date.now() > r)
        return (await chrome.storage.local.remove(e), null);
      if ('string' == typeof i && tI(i)) return tx(i);
      return i;
    } catch (e) {
      return (tU(j, e), null);
    }
  }
  async function tz(e, t, i) {
    try {
      let r = Date.now() + i,
        n =
          'string' == typeof t
            ? (function (e) {
                try {
                  var t, i, r, n, s, a, l;
                  let o =
                      ((t = (function (e, t) {
                        if (tw) return tw.encode(e);
                        for (
                          var i,
                            r = e.length,
                            n = new eR(e.length + (e.length >> 1)),
                            s = 0,
                            a = function (e) {
                              n[s++] = e;
                            },
                            i = 0;
                          i < r;
                          ++i
                        ) {
                          if (s + 5 > n.length) {
                            var l = new eR(s + 8 + ((r - i) << 1));
                            (l.set(n), (n = l));
                          }
                          var o = e.charCodeAt(i);
                          o < 128
                            ? a(o)
                            : (o < 2048
                                ? a(192 | (o >> 6))
                                : (o > 55295 && o < 57344
                                    ? (a(
                                        240 |
                                          ((o =
                                            (65536 + (1047552 & o)) |
                                            (1023 & e.charCodeAt(++i))) >>
                                            18),
                                      ),
                                      a(128 | ((o >> 12) & 63)))
                                    : a(224 | (o >> 12)),
                                  a(128 | ((o >> 6) & 63))),
                              a(128 | (63 & o)));
                        }
                        return e9(n, 0, s);
                      })(e)),
                      i || (i = {}),
                      (r = tg()),
                      (n = t.length),
                      r.p(t),
                      (l = (a = tf(
                        t,
                        i,
                        10 + ((s = i).filename ? s.filename.length + 1 : 0),
                        8,
                      )).length),
                      tb(a, i),
                      ty(a, l - 8, r.d()),
                      ty(a, l - 4, n),
                      a),
                    u = '';
                  for (let e = 0; e < o.length; e++)
                    u += String.fromCharCode(o[e]);
                  return `${tE}${btoa(u)}`;
                } catch (t) {
                  return (console.warn(C, 'Failed to compress:', t), e);
                }
              })(t)
            : t;
      (await chrome.storage.local.set({
        [e]: { type: 'transient', value: n, expiry: r },
      }),
        tU('[BetterLyrics] Set transient storage for key: ', e),
        await tR());
    } catch (e) {
      tU(j, e);
    }
  }
  async function tO() {
    try {
      let e = await chrome.storage.local.get(null),
        t = Object.keys(e).filter((e) => e.startsWith('blyrics_')),
        i = new Set();
      for (let e of t) {
        let t = (function (e) {
          let t = e.slice(8);
          for (let e of B) {
            let i = `_${e}`;
            if (t.endsWith(i)) return t.slice(0, -i.length);
          }
          return null;
        })(e);
        t && i.add(t);
      }
      let r = t.reduce((t, i) => {
        let r = e[i];
        return t + JSON.stringify(r).length;
      }, 0);
      return { count: i.size, size: r };
    } catch (e) {
      return (tU(j, e), { count: 0, size: 0 });
    }
  }
  async function tR() {
    let e = await tO();
    await chrome.storage.local.set({ cacheInfo: e });
  }
  async function tP() {
    try {
      let e = await chrome.storage.local.get(null),
        t = Object.keys(e).filter(
          (e) => e.startsWith('blyrics_') && !tL.includes(e),
        );
      (await chrome.storage.local.remove(t), await tR());
    } catch (e) {
      tU(j, e);
    }
  }
  async function tV() {
    try {
      let e = Date.now(),
        t = await chrome.storage.local.get(null),
        i = [];
      (Object.keys(t).forEach((r) => {
        if (r.startsWith('blyrics_')) {
          let n = t[r];
          n.expiry && e >= n.expiry && i.push(r);
        }
      }),
        i.length && (await chrome.storage.local.remove(i)));
    } catch (e) {
      tU(j, e);
    }
  }
  let tU = (...e) => {
    tD({ isLogsEnabled: !0 }, (t) => {
      t.isLogsEnabled && console.log(e);
    });
  };
  function t$() {
    tD({ isLogsEnabled: !0 }, (e) => {
      tU = e.isLogsEnabled ? console.log.bind(window.console) : function () {};
    });
  }
  function tB(e) {
    return e.length <= 500
      ? e
      : e.slice(0, 500) + `... (${e.length} chars total)`;
  }
  function t_(e, t) {
    let i = Array.isArray(t) ? (e) => t.includes(e) : (e) => e in t;
    if (i(e)) return !0;
    let r = e.split('-')[0];
    return r !== e && i(r);
  }
  let tF = { romanization: new Map(), translation: new Map() };
  async function tW(e, t, i) {
    let r = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${t}&dt=t&q=${encodeURIComponent(e)}`,
      n = `${t}_${e}`;
    return tF.translation.has(n)
      ? tF.translation.get(n)
      : fetch(r, { cache: 'force-cache', signal: i })
          .then((e) => e.json())
          .then((t) => {
            let i = t[2],
              r = '';
            if (
              (t[0].forEach((e) => {
                r += e[0];
              }),
              e.trim().toLowerCase() === r.trim().toLowerCase() &&
                '' !== e.trim())
            )
              return null;
            {
              let e = { originalLanguage: i, translatedText: r };
              return (tF.translation.set(n, e), e);
            }
          })
          .catch((e) => ('AbortError' === e.name || tU(O, e), null));
  }
  async function tY(e, t, i) {
    return tF.romanization.has(t)
      ? tF.romanization.get(t)
      : fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${e}&tl=${e}-Latn&dt=t&dt=rm&q=${encodeURIComponent(t)}`,
          { cache: 'force-cache', signal: i },
        )
          .then((e) => e.json())
          .then((e) => {
            let i = e[0][1][3];
            return (void 0 === i && (i = e[0][1][2]),
            t.trim().toLowerCase() === i.trim().toLowerCase() &&
              '' !== t.trim())
              ? null
              : (tF.romanization.set(t, i), i);
          })
          .catch((e) => ('AbortError' === e.name || tU(O, e), null));
  }
  function tQ() {
    (tF.romanization.clear(), tF.translation.clear());
  }
  let tq = new Map();
  class tG {
    type;
    value;
    defaultValue;
    requiresLyricReload;
    constructor(e, t, i, r) {
      ((this.type = e),
        (this.value = t),
        (this.defaultValue = i),
        (this.requiresLyricReload = r));
    }
    getNumberValue() {
      return this.value;
    }
    getBooleanValue() {
      return this.value;
    }
    getStringValue() {
      return this.value;
    }
  }
  function tH(e, t, i = !1) {
    let r = typeof t;
    if ('number' !== r && 'boolean' !== r && 'string' !== r)
      throw Error('Invalid type for theme setting');
    let n = new tG(r, t, t, i);
    return (tq.set(e, n), n);
  }
  let tZ = !1;
  function tX(e) {
    var t = (function (e) {
      let t,
        i = new Map(),
        r = /\/\*([\s\S]*?)\*\//g,
        n = /(blyrics-[\w-]+)\s*=\s*([^;]+);/g;
      for (; null !== (t = r.exec(e)); ) {
        let e,
          r = t[1];
        for (; null !== (e = n.exec(r)); ) {
          let t = e[1],
            r = e[2].trim();
          i.set(t, r);
        }
      }
      return i;
    })(e);
    let i = !1;
    for (let [e, r] of (t.forEach((e, t) => {
      let r = tq.get(t);
      if (r) {
        let t = r.value;
        if ('number' === r.type) {
          let t = parseFloat(e);
          isNaN(t) ? (r.value = r.defaultValue) : (r.value = t);
        } else
          'boolean' === r.type
            ? (r.value = 'true' === e.toLowerCase())
            : (r.value = e);
        r.requiresLyricReload && t !== r.value && (i = !0);
      }
    }),
    tq.entries()))
      !t.has(e) &&
        r.value !== r.defaultValue &&
        ((r.value = r.defaultValue), r.requiresLyricReload && (i = !0));
    i && ny();
    let r = document.getElementById('blyrics-custom-style');
    (r
      ? (r.textContent = e)
      : (((r = document.createElement('style')).id = 'blyrics-custom-style'),
        (r.textContent = e),
        document.head.appendChild(r)),
      rt.clear());
  }
  async function tK() {
    var e, t, i, r;
    try {
      let t = await tT(['cssStorageType', 'customCSS', 'cssCompressed']),
        i = null,
        r = !1;
      if ('chunked' === t.cssStorageType)
        ((i = await tC()), (r = t.cssCompressed || !1));
      else if ('local' === t.cssStorageType) {
        let e = await tk(['customCSS', 'cssCompressed']);
        ((i = e.customCSS ?? null), (r = e.cssCompressed || !1));
      } else ((i = t.customCSS ?? null), (r = t.cssCompressed || !1));
      i && ((r || tI(i)) && ((e = i), (i = tx(e))), tX(tA(i)));
    } catch (e) {
      tU(j, e);
      try {
        let e = await tC();
        if (e) {
          let i = await tT(['cssCompressed']),
            r = e;
          ((i.cssCompressed || tI(r)) && ((t = r), (r = tx(t))), tX(tA(r)));
          return;
        }
        let n = await tk(['customCSS', 'cssCompressed']);
        if (n.customCSS) {
          let e = n.customCSS;
          ((n.cssCompressed || tI(e)) && ((i = e), (e = tx(i))), tX(tA(e)));
          return;
        }
        let s = await tT(['customCSS', 'cssCompressed']);
        if (s.customCSS) {
          let e = s.customCSS;
          ((s.cssCompressed || tI(e)) && ((r = e), (e = tx(r))), tX(tA(e)));
        }
      } catch (e) {
        tU(j, e);
      }
    }
  }
  async function tJ(e, t) {
    let i = e.replace('storeTheme:', ''),
      { activeStoreTheme: r } = await tT(['activeStoreTheme']);
    if (r !== i) return;
    let n = t.newValue;
    n?.css &&
      (t.oldValue?.css !== n.css || t.oldValue?.version !== n.version) &&
      (tU(C, 'Store theme updated:', n.title || i), tX(tA(n.css)));
  }
  let t0 = !1;
  function t1() {
    var e, t;
    (t2(
      () => {
        let e = document.getElementById('layout'),
          t = document.getElementById('player-page');
        e && t && (e.setAttribute(x, ''), t.setAttribute(x, ''));
      },
      () => {
        let e = document.getElementById('layout'),
          t = document.getElementById('player-page');
        e && t && (e.removeAttribute(x), t.removeAttribute(x));
      },
    ),
      (e = () => {
        let e = document.getElementById('blyrics-disable-effects');
        e && e.remove();
      }),
      (t = async () => {
        let e = document.getElementById('blyrics-disable-effects');
        e ||
          (((e = document.createElement('style')).id =
            'blyrics-disable-effects'),
          (e.textContent = await fetch(
            chrome.runtime.getURL('css/disablestylizedanimations.css'),
          ).then((e) => e.text())),
          document.head.appendChild(e));
      }),
      tD({ isStylizedAnimationsEnabled: !0 }, (i) => {
        i.isStylizedAnimationsEnabled ? e() : t();
      }));
  }
  function t2(e, t) {
    tD({ isFullScreenDisabled: !1 }, (i) => {
      i.isFullScreenDisabled ? e() : t();
    });
  }
  function t4(e, t) {
    tD({ isAlbumArtEnabled: !0 }, (i) => {
      i.isAlbumArtEnabled ? e() : t();
    });
  }
  let t3 = null,
    t5 = null;
  function t7() {
    tD({ isCursorAutoHideEnabled: !0 }, (e) => {
      e.isCursorAutoHideEnabled
        ? (() => {
            let e = !0;
            function t() {
              ((t3 = null),
                e &&
                  document
                    .getElementById('layout')
                    .setAttribute('cursor-hidden', ''),
                (e = !1));
            }
            function i() {
              (t3 && window.clearTimeout(t3),
                e ||
                  (document
                    .getElementById('layout')
                    .removeAttribute('cursor-hidden'),
                  (e = !0)),
                (t3 = window.setTimeout(t, 3e3)));
            }
            (t5 && document.removeEventListener('mousemove', t5),
              (t5 = i),
              document.addEventListener('mousemove', i));
          })()
        : (() => {
            (t3 && window.clearTimeout(t3),
              document
                .getElementById('layout')
                .removeAttribute('cursor-hidden'),
              t5 &&
                (document.removeEventListener('mousemove', t5), (t5 = null)));
          })();
    });
  }
  function t8() {
    tD(
      {
        isTranslateEnabled: !1,
        isRomanizationEnabled: !1,
        translationLanguage: 'en',
        romanizationDisabledLanguages: [],
        translationDisabledLanguages: [],
      },
      (e) => {
        ((nf.isTranslateEnabled = e.isTranslateEnabled),
          (nf.isRomanizationEnabled = e.isRomanizationEnabled),
          (nf.translationLanguage = e.translationLanguage || 'en'),
          (nf.romanizationDisabledLanguages =
            e.romanizationDisabledLanguages || []),
          (nf.translationDisabledLanguages =
            e.translationDisabledLanguages || []));
      },
    );
  }
  let t6 = !1,
    t9 = !1;
  function ie() {
    let e = document.querySelector('ytmusic-app-layout');
    if (!e) return !1;
    let t = e.getAttribute('player-ui-state');
    return 'PLAYER_PAGE_OPEN' === t || 'FULLSCREEN' === t;
  }
  let it = [
    'ti',
    'ar',
    'al',
    'au',
    'lr',
    'length',
    'by',
    'offset',
    're',
    'tool',
    've',
    '#',
  ];
  function ii(e) {
    if (!e) return 0;
    if ('number' == typeof e) return e;
    let t = e.split(':'),
      i = 0;
    try {
      if (1 === t.length) i = 1e3 * parseFloat(t[0]);
      else if (2 === t.length) {
        let e = parseInt(t[0], 10),
          r = parseFloat(t[1]);
        i = 60 * e * 1e3 + 1e3 * r;
      } else if (3 === t.length) {
        let e = parseInt(t[0], 10),
          r = parseInt(t[1], 10),
          n = parseFloat(t[2]);
        i = 3600 * e * 1e3 + 60 * r * 1e3 + 1e3 * n;
      }
      return Math.round(i);
    } catch (t) {
      return (console.error(`Error parsing time string: ${e}`, t), 0);
    }
  }
  function ir(e, t) {
    let i = e.split('\n'),
      r = [],
      n = {};
    if (
      (i.forEach((e) => {
        let t,
          i = (e = e.trim()).match(/^[\[](\w+):(.*)[\]]$/);
        if (i && it.includes(i[1])) {
          n[i[1]] = i[2];
          return;
        }
        let s = /[\[](\d+:\d+\.\d+)[\]]/g,
          a = [];
        for (; null !== (t = s.exec(e)); ) a.push(ii(t[1]));
        if (0 === a.length) return;
        let l = e.replace(s, '').trim(),
          o = [],
          u = null,
          c = '';
        l.split(/<(\d+:\d+\.\d+)>/g).forEach((e, t) => {
          if (t % 2 == 0)
            (e.length > 0 && ' ' === e[0] && (e = e.substring(1)),
              e.length > 0 &&
                ' ' === e[e.length - 1] &&
                (e = e.substring(0, e.length - 1)),
              (c += e),
              o.length > 0 &&
                o[o.length - 1].startTimeMs &&
                (o[o.length - 1].words += e));
          else {
            let t = ii(e);
            (null !== u && o.length > 0 && (o[o.length - 1].durationMs = t - u),
              o.push({ startTimeMs: t, words: '', durationMs: 0 }),
              (u = t));
          }
        });
        let d = Math.min(...a),
          h = Math.max(...a);
        r.push({
          startTimeMs: d,
          words: c.trim(),
          durationMs: h - d,
          parts: o.length > 0 ? o : void 0,
        });
      }),
      r.forEach((e, i) => {
        if (i + 1 < r.length) {
          let t = r[i + 1];
          if (
            (0 === e.durationMs &&
              (e.durationMs = Math.max(t.startTimeMs - e.startTimeMs, 0)),
            e.parts && e.parts.length > 0)
          ) {
            let i = t.startTimeMs;
            e.parts.forEach((e) => {
              i = Math.max(i, e.startTimeMs);
            });
            let r = e.parts[e.parts.length - 1];
            ((r.durationMs = Math.max(t.startTimeMs - r.startTimeMs, 0)),
              (e.durationMs = Math.max(i - e.startTimeMs, 0)));
          }
        } else if (
          (0 === e.durationMs && (e.durationMs = t - e.startTimeMs),
          e.parts && e.parts.length > 0)
        ) {
          let i = e.parts[e.parts.length - 1];
          i.durationMs = t - i.startTimeMs;
        }
      }),
      n.offset)
    ) {
      let e = Number(n.offset);
      (isNaN(e) && ((e = 0), tU(C, 'Invalid offset in lyrics: ' + n.offset)),
        (e *= 1e3),
        r.forEach((t) => {
          ((t.startTimeMs -= e),
            t.parts?.forEach((t) => {
              t.startTimeMs -= e;
            }));
        }));
    }
    return r;
  }
  function is(e) {
    let t = [];
    return (
      e.split('\n').forEach((e) => {
        t.push({ startTimeMs: 0, words: e, durationMs: 0 });
      }),
      t
    );
  }
  let ia = new Map(),
    il = new Map(),
    io = new Map(),
    iu = new Map(),
    ic = null;
  function id(e, t = 250, i) {
    if (io.has(e)) return Promise.resolve(io.get(e));
    if (i?.aborted) return Promise.resolve(null);
    let r = 0;
    return new Promise((n) => {
      let s = () => {
          (clearInterval(a), n(null));
        },
        a = setInterval(() => {
          if (i?.aborted) {
            (clearInterval(a), i?.removeEventListener('abort', s), n(null));
            return;
          }
          let l = io.get(e);
          if (l) {
            (clearInterval(a), i?.removeEventListener('abort', s), n(l));
            return;
          }
          if (r > t) {
            (clearInterval(a),
              i?.removeEventListener('abort', s),
              tU('Failed to find Segment Map for video'),
              n(null));
            return;
          }
          r += 1;
        }, 20);
      i?.addEventListener('abort', s, { once: !0 });
    });
  }
  async function ih(e, t) {
    for (let i = 0; i < 250; i++) {
      if (t?.aborted) return;
      if (iu.has(e)) return iu.get(e);
      await new Promise((e) => setTimeout(e, 20));
    }
    tU("Song album information didn't come in time for: ", e);
  }
  function ip(e, t) {
    try {
      let i = new URL(e);
      return (
        i &&
        i.pathname.startsWith(t) &&
        'https://music.youtube.com' === i.origin
      );
    } catch (e) {
      return !1;
    }
  }
  let im = null,
    ig = null,
    iy = null,
    ib = null,
    iM = null,
    iv = null,
    iw = !1,
    iN = !1,
    iS = !1,
    iE = !1,
    ix = null;
  async function iI() {
    if (!('wakeLock' in navigator))
      return void tU(j, 'Wake Lock API not supported in this browser.');
    try {
      (im = await navigator.wakeLock.request('screen')).addEventListener(
        'release',
        () => {
          im = null;
        },
      );
    } catch (e) {
      tU(j, 'Wake Lock request failed:', e);
    }
  }
  function iL() {
    'visible' === document.visibilityState && null === im && iI();
  }
  let ik = 0,
    iT = [0, 0, 0];
  function iA() {
    let e = nf.lyricData?.tabSelector;
    if (
      e &&
      'true' === e.getAttribute('aria-selected') &&
      nf.areLyricsTicking
    ) {
      if (re.skipScrolls > 0) {
        (re.skipScrolls--, re.skipScrollsDecayTimes.shift());
        return;
      }
      !iB() &&
        (re.scrollResumeTime < Date.now() &&
          tU('[BetterLyrics] Pausing Lyrics Autoscroll Due to User Scroll'),
        (re.scrollResumeTime = Date.now() + 25e3),
        re.wasUserScrolling ||
          (ra().removeAttribute('autoscroll-hidden'),
          document.getElementsByClassName(o)[0].classList.add(f),
          (re.wasUserScrolling = !0)));
    }
  }
  function iC(e) {
    ie() ||
      !nf.lastVideoId ||
      (e.preventDefault(),
      e.stopPropagation(),
      e instanceof KeyboardEvent && e.stopImmediatePropagation(),
      t6 ||
        new Promise((e) => {
          if (t6) return void e();
          ((t6 = !0), (t9 = !0));
          let t = document.querySelector('ytmusic-player-bar');
          (t && t.click(),
            new Promise((e, t) => {
              let i = Date.now(),
                r = setInterval(() => {
                  if (ie()) {
                    (clearInterval(r), setTimeout(e, 100));
                    return;
                  }
                  Date.now() - i > 3e3 &&
                    (clearInterval(r), t(Error('Player page load timeout')));
                }, 50);
            })
              .then(() => {
                ((t6 = !1), e());
              })
              .catch((t) => {
                (tU(j, 'Player page open timeout', t),
                  (t6 = !1),
                  (t9 = !1),
                  e());
              }));
        }).then(() => {
          let e = document.querySelector('.fullscreen-button');
          if (e) e.click();
          else {
            let e = new KeyboardEvent('keydown', {
              key: 'f',
              code: 'KeyF',
              keyCode: 70,
              which: 70,
              bubbles: !0,
              cancelable: !0,
            });
            document.dispatchEvent(e);
          }
        }));
  }
  let iD = {
      syllable:
        '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48" fill-opacity="0.5"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z" fill-opacity="0.5"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
      word: '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48" fill-opacity="0.5"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
      line: '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
      unsynced:
        '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48" fill-opacity="0.5"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z" fill-opacity="0.5"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z" fill-opacity="0.5"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
    },
    ij = {
      syllable: '#fde69b',
      word: '#aad1ff',
      line: '#c9f8da',
      unsynced: 'rgba(255, 255, 255, 0.7)',
    },
    iz = Object.fromEntries(
      $.map((e) => [e.key, { name: e.displayName, syncType: e.syncType }]),
    );
  function iO(e) {
    let { text: t, href: i, logoSrc: r, logoAlt: n } = e,
      s = document.createElement('div');
    if (((s.className = `${M}__container`), r)) {
      let e = document.createElement('img');
      ((e.src = r),
        (e.alt = n ?? ''),
        (e.width = 20),
        (e.height = 20),
        s.appendChild(e));
    }
    let a = document.createElement('a');
    return (
      (a.href = i),
      (a.target = '_blank'),
      (a.rel = 'noreferrer noopener'),
      (a.textContent = t),
      (a.style.height = '100%'),
      s.appendChild(a),
      s
    );
  }
  let iR = null,
    iP = null,
    iV = !1;
  function iU(e = !1) {
    if (!i_()) {
      (e || iK(), (iV = !0));
      try {
        clearTimeout(nf.loaderAnimationEndTimeout);
        let t = document.querySelector(v),
          i = document.getElementById(N);
        i || ((i = document.createElement('div')).id = N);
        let r = i.hasAttribute('active');
        (i.setAttribute('active', ''),
          i.removeAttribute('no-sync-available'),
          e
            ? i.setAttribute('small-loader', '')
            : i.removeAttribute('small-loader'),
          r ||
            (t.prepend(i),
            (i.hidden = !1),
            (i.style.display = 'inline-block !important'),
            i.scrollIntoView({
              behavior: 'instant',
              block: 'start',
              inline: 'start',
            })));
      } catch (e) {
        tU(e);
      }
    }
  }
  function i$(e = !1) {
    try {
      let t = document.getElementById(N);
      if (
        (t &&
          e &&
          (t.setAttribute('small-loader', ''),
          ro(t),
          t.setAttribute('no-sync-available', '')),
        t?.hasAttribute('active'))
      ) {
        (clearTimeout(nf.loaderAnimationEndTimeout),
          (t.dataset.animatingOut = 'true'),
          t.removeAttribute('active'),
          t.addEventListener('transitionend', function e(i) {
            (clearTimeout(nf.loaderAnimationEndTimeout),
              (t.dataset.animatingOut = 'false'),
              (iV = !1),
              t.removeEventListener('transitionend', e),
              tU('[BetterLyrics] Loader Transition Ended'));
          }));
        let e = 1e3,
          i = window.getComputedStyle(t).getPropertyValue('transition-delay');
        (i && (e += rl(i)),
          (nf.loaderAnimationEndTimeout = window.setTimeout(() => {
            ((t.dataset.animatingOut = String(!1)),
              (iV = !1),
              tU("[BetterLyrics] Loader Animation Didn't End"));
          }, e)));
      }
    } catch (e) {
      tU(e);
    }
  }
  function iB() {
    try {
      if (!iV) return !1;
      let e = document.getElementById(N);
      if (e)
        return e.hasAttribute('active') || 'true' === e.dataset.animatingOut;
    } catch (e) {
      tU(e);
    }
    return !1;
  }
  function i_() {
    let e = document.querySelector(P);
    return e?.hasAttribute(V) ?? !1;
  }
  function iF() {
    let e = document.querySelector(v);
    if (!e) return;
    let t = document.getElementById(N);
    t && t.removeAttribute('active');
    let i = document.getElementById(U);
    (i || (((i = document.createElement('div')).id = U), e.prepend(i)),
      i.setAttribute('active', ''));
  }
  function iW() {
    let e = document.getElementById(U);
    e && e.removeAttribute('active');
  }
  let iY = null;
  function iQ() {
    iq && iZ(iq);
  }
  let iq = null;

// --- Đặt biến này ở NGOÀI hàm iG (đầu file hoặc phạm vi global của module) ---
let backgroundCleanupTimeout = null;
let fadeAnimationTimeout = null;
// ---------------------------------------------------------------------------

// Thay thế toàn bộ function iG(e) bằng đoạn này:
function iG(e) {
  const FADE_DURATION = 2000; // Khớp với thời gian animation trong CSS (1.5s)
  const t = document.getElementById('layout');
  
  // Lấy cả 2 trang để chắc chắn hiệu ứng áp dụng đúng chỗ (THAY ĐỔI Ở ĐÂY)
  const pageBgs = [document.getElementById('browse-page'), document.getElementById('search-page')];

  if (typeof nf !== 'undefined' && nf.shouldInjectAlbumArt) {
    const newImageUrl = e;
    
    // 1. PRELOAD ẢNH
    const imgLoader = new Image();
    imgLoader.src = newImageUrl;

    imgLoader.onload = () => {
      // Nếu có lệnh dọn dẹp cũ đang chờ, hủy nó đi (do người dùng chuyển bài mới)
      if (backgroundCleanupTimeout) clearTimeout(backgroundCleanupTimeout);
      if (fadeAnimationTimeout) clearTimeout(fadeAnimationTimeout);

      // 2. CHUẨN BỊ ẢNH CŨ (LỚP DƯỚI)
      let currentBg = t?.style.getPropertyValue('--blyrics-background-img');
      // Chỉ gán ảnh cũ nếu nó khác ảnh mới
      if (currentBg && currentBg !== 'none' && !currentBg.includes(newImageUrl)) {
          t.style.setProperty('--blyrics-previous-bg', currentBg);
      }

      // 3. RESET ANIMATION (QUAN TRỌNG)
      pageBgs.forEach(bg => {
          if (bg) {
            bg.classList.remove('art-fade-anim');
            void bg.offsetWidth; // Force Reflow: Bắt buộc trình duyệt nhận diện thay đổi ngay lập tức
          }
      });
      // 4. GÁN ẢNH MỚI VÀ CHẠY HIỆU ỨNG
      // Dùng requestAnimationFrame để đảm bảo mượt mà hơn setTimeout
      requestAnimationFrame(() => {
        t?.style.setProperty('--blyrics-background-img', `url('${newImageUrl}')`);
        
        // (THAY ĐỔI Ở ĐÂY: Áp dụng class cho cả 2 trang nếu nó tồn tại)
        pageBgs.forEach(bg => {
            if (bg) bg.classList.add('art-fade-anim');
        });

        // 5. DỌN DẸP SAU KHI FADE XONG
        // Sau khi fade xong (1.5s), ta xóa ảnh cũ đi để tránh nó bị "lòi" ra viền
        backgroundCleanupTimeout = setTimeout(() => {
           t?.style.removeProperty('--blyrics-previous-bg');
        }, FADE_DURATION); 
      });
    };

    // Fallback nếu lỗi tải ảnh
    imgLoader.onerror = () => {
       t?.style.setProperty('--blyrics-background-img', `url('${newImageUrl}')`);
    };

  } else {
    // Tắt tính năng
    t?.style.removeProperty('--blyrics-background-img');
    t?.style.removeProperty('--blyrics-previous-bg');
  }
}
  function iH() {
    return Math.round(
      Math.max(
        document.getElementById('thumbnail')?.getBoundingClientRect().width ||
          0,
        544,
      ),
    );
  }
  function iZ(t) {
    e?.disconnect();
    let i = document.getElementById('blyrics-img');
    (i ||
      (((i = document.createElement('img')).id = 'blyrics-img'),
      (i.draggable = !1),
      i.classList.add('style-scope', 'yt-img-shadow'),
      (i.style.position = 'absolute'),
      (i.style.inset = '0'),
      document.getElementById('thumbnail')?.appendChild(i)),
      iq !== t && ((i.src = t.url), i.classList.remove(I), iG(t.url)),
      (iq = t));
    let r = iH(),
      n = t.url;
    n =
      n && /w\d+-h\d+/.test(n)
        ? n.replace(/w\d+-h\d+/, `w${r}-h${r}`)
        : n.replace(/\/(sd|hq|mq)?default\.jpg/, '/maxresdefault.jpg');
    let s = new Image();
    ((s.src = n), iY?.abort());
    let a = new AbortController();
    ((iY = a),
      (s.onload = () => {
        if (a.signal.aborted) return;
        if (((i.src = s.src), iG(s.src), iH() !== r)) return void iQ();
        let t = document.getElementById('thumbnail');
        (e = new ResizeObserver(() => {
          iH() !== r && (e?.disconnect(), iQ());
        })).observe(t);
      }));
  }
  async function iX() {
    let e = document.createElement('link');
    ((e.rel = 'preload'),
      (e.as = 'image'),
      (e.href = 'https://better-lyrics.boidu.dev/icon-512.png'),
      document.head.appendChild(e));
    let t = document.createElement('link');
    ((t.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap'),
      (t.rel = 'stylesheet'),
      document.head.appendChild(t));
    let i = document.createElement('link');
    for (let e of ((i.href =
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&family=Noto+Sans+Armenian:wght@100..900&family=Noto+Sans+Bengali:wght@100..900&family=Noto+Sans+Devanagari:wght@100..900&family=Noto+Sans+Georgian:wght@100..900&family=Noto+Sans+Gujarati:wght@100..900&family=Noto+Sans+HK:wght@100..900&family=Noto+Sans+Hebrew:wght@100..900&family=Noto+Sans+JP:wght@100..900&family=Noto+Sans+KR:wght@100..900&family=Noto+Sans+Kannada:wght@100..900&family=Noto+Sans+Khmer:wght@100..900&family=Noto+Sans+Lao+Looped:wght@100..900&family=Noto+Sans+Lao:wght@100..900&family=Noto+Sans+Malayalam:wght@100..900&family=Noto+Sans+Marchen&family=Noto+Sans+Meetei+Mayek:wght@100..900&family=Noto+Sans+Multani&family=Noto+Sans+NKo&family=Noto+Sans+Old+Permic&family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+Shavian&family=Noto+Sans+Sinhala:wght@100..900&family=Noto+Sans+Sunuwar&family=Noto+Sans+TC:wght@100..900&family=Noto+Sans+Takri&family=Noto+Sans+Tamil:wght@100..900&family=Noto+Sans+Telugu:wght@100..900&family=Noto+Sans+Thai+Looped:wght@100..900&family=Noto+Sans+Thai:wght@100..900&family=Noto+Sans+Vithkuqi:wght@400..700&family=Noto+Sans+Warang+Citi&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap'),
    (i.rel = 'stylesheet'),
    document.head.appendChild(i),
    ['css/ytmusic/index.css', 'css/blyrics/index.css', 'css/themesong.css'])) {
      let t = document.createElement('link');
      ((t.rel = 'stylesheet'),
        (t.href = chrome.runtime.getURL(e)),
        (t.id = `blyrics-style-${e.replace(/(\/index)?\.css$/, '')}`),
        document.head.appendChild(t));
    }
  }
  function iK() {
    ((re.scrollPos = -1),
      (re.skipScrollsDecayTimes = []),
      (re.lastActiveElements = []),
      (re.lastScrollDebugContext.activeElms = []),
      (re.lastScrollDebugContext.centers = []),
      (re.doneFirstInstantScroll = !1),
      (re.queuedScroll = !1),
      rt.clear(),
      rm && rm.disconnect(),
      iR && (iR.disconnect(), (iR = null)),
      nf.lyricData && ((nf.lyricData.lines = []), (nf.lyricData = null)));
    let e = document.querySelector(w)?.parentElement;
    e && (e.style.display = '');
    let t = document.getElementsByClassName(M)[0];
    (t && t.remove(), ra().setAttribute('autoscroll-hidden', 'true'));
    let i = document.querySelector('.blyrics-no-lyrics-button-container');
    i && i.remove();
    try {
      let e = document.getElementById(S);
      e && e.replaceChildren();
    } catch (e) {
      tU(e);
    }
  }
  function iJ(e, t) {
    let i = encodeURIComponent(`${t.trim()} - ${e.trim()}`);
    return `https://genius.com/search?q=${i}`;
  }
  let i0 = 'blyrics-lyric-debug-canvas',
    i1 = null,
    i2 = null;
  function i4() {
    if (i2) {
      let e = window.devicePixelRatio || 1,
        t = Number(
          getComputedStyle(i2).getPropertyValue('height').slice(0, -2),
        ),
        i = Number(getComputedStyle(i2).getPropertyValue('width').slice(0, -2));
      ((i2.width = i * e), (i2.height = t * e), i1?.scale(e, e));
    }
  }
  let i3 = tH('blyrics-lyric-ending-threshold-s', 0.5),
    i5 = tH('blyrics-early-scroll-consider-s', 0.62),
    i7 = tH('blyrics-queue-scroll-ms', 150),
    i8 = tH('blyrics-debug-renderer', !1),
    i6 = tH('blyrics-target-scroll-pos-ratio', 0.37),
    i9 = tH('blyrics-add-extra-top-padding', !1),
    re = {
      skipScrolls: 0,
      skipScrollsDecayTimes: [],
      scrollResumeTime: 0,
      scrollPos: 0,
      selectedElementIndex: 0,
      nextScrollAllowedTime: 0,
      wasUserScrolling: !1,
      lastTime: 0,
      lastPlayState: !1,
      lastEventCreationTime: 0,
      doneFirstInstantScroll: !0,
      lastActiveElements: [],
      queuedScroll: !1,
      lastScrollDebugContext: {
        activeElms: [],
        centers: [],
        lyricScrollTime: 0,
      },
    },
    rt = new Map();
  function ri(e, t) {
    let i = rt.get(t);
    return (
      void 0 === i &&
        ((i = rl(window.getComputedStyle(e).getPropertyValue(t))),
        rt.set(t, i)),
      i
    );
  }
  function rr(e, t, i = !0, r = !0) {
    let n = Date.now();
    if (iB() || !nf.areLyricsTicking || (0 === e && !i)) return;
    let s =
      Math.abs(e - re.lastTime - (t - re.lastEventCreationTime) / 1e3) > 0.5;
    ((re.lastTime = e), (re.lastPlayState = i), (re.lastEventCreationTime = t));
    let a = n - t;
    (i || (a = 0), (e += a / 1e3));
    let l = nf.lyricData;
    if (!l) {
      ((nf.areLyricsTicking = !1),
        tU('Lyrics are ticking, but lyricData are null!'));
      return;
    }
    let o = l.tabSelector;
    console.assert(null != o);
    let c = document
      .getElementById('player-page')
      ?.getAttribute('player-ui-state');
    if (
      'true' !== o.getAttribute('aria-selected') ||
      !(
        !c ||
        'PLAYER_PAGE_OPEN' === c ||
        'FULLSCREEN' === c ||
        'MINIPLAYER_IN_PLAYER_PAGE' === c
      )
    ) {
      re.doneFirstInstantScroll = !1;
      return;
    }
    if (i_()) return void iF();
    iW();
    try {
      let t = l.lyricsContainer;
      if (!t) {
        ((nf.areLyricsTicking = !1),
          tU(
            '[BetterLyrics] No lyrics element found on the page, skipping lyrics injection',
          ));
        return;
      }
      let a = nf.lyricData.lines;
      'richsync' === l.syncType
        ? (e += ri(t, '--blyrics-richsync-timing-offset') / 1e3)
        : (e += ri(t, '--blyrics-timing-offset') / 1e3);
      let o = e + ri(t, '--blyrics-scroll-timing-offset') / 1e3,
        c = document.querySelector(v),
        h = c.getBoundingClientRect().height,
        y = c.scrollTop,
        b = [],
        M = [],
        w = s;
      if (
        (a.every((t, r) => {
          let s = t.time,
            l = 1 / 0;
          (r + 1 < a.length && (l = a[r + 1].time),
            o >= s - i5.getNumberValue() && (o < l || o < s + t.duration)
              ? (b.push(t),
                !re.lastActiveElements.includes(t) && o >= s && (w = !0),
                (re.selectedElementIndex = r),
                t.isScrolled ||
                  (t.lyricElement.classList.add(u), (t.isScrolled = !0)))
              : t.isScrolled &&
                (t.lyricElement.classList.remove(u), (t.isScrolled = !1)));
          let c = 2;
          i || (c = 0);
          let d = Math.max(l, s + t.duration + 0.05);
          if (e + c >= s && e < d) {
            t.isSelected = !0;
            let r = e - s,
              a = (n - t.animationStartTimeMs) / 1e3 - r;
            if (
              ((t.accumulatedOffsetMs = t.accumulatedOffsetMs / 1.08),
              (t.accumulatedOffsetMs += 1e3 * a * 0.4),
              t.isAnimating &&
                Math.abs(t.accumulatedOffsetMs) > 100 &&
                i &&
                (t.isAnimating = !1),
              i !== t.isAnimationPlayStatePlaying)
            ) {
              t.isAnimationPlayStatePlaying = i;
              let e = [t, ...t.parts];
              i
                ? (e.forEach((e) => {
                    e.lyricElement.classList.remove(m);
                  }),
                  (t.isAnimating = !1))
                : e.forEach((e) => {
                    e.animationStartTimeMs > n
                      ? (e.lyricElement.classList.remove(p),
                        e.lyricElement.classList.remove(g))
                      : e.lyricElement.classList.add(m);
                  });
            }
            t.isAnimating || M.push(t);
          } else
            t.isSelected &&
              ([t, ...t.parts].forEach((e) => {
                (e.lyricElement.style.setProperty('--blyrics-swipe-delay', ''),
                  e.lyricElement.style.setProperty('--blyrics-anim-delay', ''),
                  e.lyricElement.classList.remove(p),
                  e.lyricElement.classList.remove(g),
                  e.lyricElement.classList.remove(m),
                  (e.animationStartTimeMs = 1 / 0));
              }),
              (t.isSelected = !1),
              (t.isAnimating = !1));
          return !0;
        }),
        M.length > 0)
      ) {
        for (let t of M)
          for (let i of [t, ...t.parts]) {
            let t = e - i.time,
              r = -t - 0.1 * i.duration + 's',
              n = -t + 's';
            (i.lyricElement.classList.remove(p),
              i.lyricElement.classList.remove(m),
              i.lyricElement.style.setProperty('--blyrics-swipe-delay', r),
              i.lyricElement.style.setProperty('--blyrics-anim-delay', n),
              i.lyricElement.classList.add(g));
          }
        for (let t of (ro(M[0].lyricElement), M)) {
          for (let i of [t, ...t.parts]) {
            let t = e - i.time;
            (i.lyricElement.classList.add(p),
              (i.animationStartTimeMs = n - 1e3 * t));
          }
          ((t.isAnimating = !0),
            (t.isAnimationPlayStatePlaying = !0),
            (t.accumulatedOffsetMs = 0));
        }
      }
      if (re.scrollResumeTime < Date.now() || -1 === re.scrollPos) {
        (0 == b.length && b.push(l.lines[0]),
          (re.lastActiveElements = b.filter((e) => o >= e.time)));
        let e = h * i6.getNumberValue(),
          i = b[b.length - 1],
          n = b
            .filter(
              (e, t) =>
                o < e.time + e.duration - i3.getNumberValue() ||
                t == b.length - 1,
            )
            .map((e) => e.position + e.height / 2),
          a = n.reduce((e, t) => e + t, 0) / n.length - e;
        if (
          ((a = Math.min(a, b[0].position)),
          (a = Math.max(a, i.position - h + i.height)),
          (a = Math.min(a, i.position)),
          (a = Math.max(0, a)),
          i8.getBooleanValue())
        ) {
          let i = window.getComputedStyle(t).transform,
            r = new DOMMatrix(i).f,
            s = y - r;
          if (
            (!(function (e) {
              if (
                !i1 &&
                (!(function () {
                  let e = document.querySelector('#tab-renderer');
                  if (!e) return console.error("Can't find tab renderer");
                  let t = document.getElementById(i0);
                  (t && t.remove(),
                    ((i2 = document.createElement('canvas')).id = i0),
                    (i2.style.position = 'fixed'),
                    (i2.style.width = '100%'),
                    (i2.style.height = '100%'),
                    (i2.style.order = '100'));
                  let i = document.getElementById('blyrics-wrapper');
                  (e.insertBefore(i2, i), (i1 = i2.getContext('2d')))
                    ? i4()
                    : console.error("Can't find canvas context");
                })(),
                !i1)
              )
                return;
              i1.reset();
              let t = window.devicePixelRatio || 1;
              (i1.scale(t, t), i1.translate(0, -e));
            })(s),
            i1)
          ) {
            function d(e, t, i, r, n) {
              ((i1.strokeStyle = 'red'),
                (i1.fillStyle = 'red'),
                i1.fillText(t, e + 2, s + 45),
                i1.fillText('scroll time: ' + n.toFixed(3), e + 2, s + 60),
                i.forEach((t) => {
                  let i = t.time - n,
                    r = t.time + t.duration,
                    s = r - n;
                  (s < i3.getNumberValue()
                    ? ((i1.strokeStyle = 'gray'), (i1.fillStyle = 'gray'))
                    : i > 0
                      ? ((i1.strokeStyle = 'magenta'),
                        (i1.fillStyle = 'magenta'))
                      : ((i1.strokeStyle = 'orange'),
                        (i1.fillStyle = 'orange')),
                    i1?.beginPath(),
                    i1?.moveTo(e + 5, t.position),
                    i1?.lineTo(e + 5, t.position + t.height),
                    i1?.stroke(),
                    i1?.fillText(
                      'time: start=' +
                        t.time.toFixed(2) +
                        ' end=' +
                        r.toFixed(2),
                      e + 15,
                      t.position,
                    ),
                    i1?.fillText(
                      'till active: ' + i.toFixed(2),
                      e + 15,
                      t.position + 15,
                    ),
                    i1?.fillText(
                      'till end: ' + s.toFixed(2),
                      e + 15,
                      t.position + 30,
                    ));
                }),
                (i1.strokeStyle = 'pink'),
                (i1.fillStyle = 'pink'),
                r.forEach((t) => {
                  (i1?.beginPath(),
                    i1?.arc(e + 5, t, 5, 0, 2 * Math.PI, !1),
                    i1?.fill());
                }));
            }
            ((i1.strokeStyle = 'green'),
              (i1.fillStyle = 'green'),
              i1?.fillText('visible top', 0, y),
              i1?.beginPath(),
              i1?.moveTo(40, y),
              i1?.lineTo(1e3, y),
              i1.stroke(),
              (i1.strokeStyle = 'blue'),
              (i1.fillStyle = 'blue'),
              i1?.fillText('visible bottom', 0, y + h),
              i1?.beginPath(),
              i1?.moveTo(40, y + h),
              i1?.lineTo(1e3, y + h),
              i1.stroke(),
              (i1.strokeStyle = 'yellow'),
              (i1.fillStyle = 'yellow'),
              i1?.fillText('target', 0, y + e),
              i1?.beginPath(),
              i1?.moveTo(40, y + e),
              i1?.lineTo(1e3, y + e),
              i1.stroke(),
              d(0, 'realtime', b, n, o),
              d(
                160,
                'last scroll',
                re.lastScrollDebugContext.activeElms,
                re.lastScrollDebugContext.centers,
                re.lastScrollDebugContext.lyricScrollTime,
              ));
          }
        }
        if (
          (0 !== y ||
            re.doneFirstInstantScroll ||
            ((r = !1),
            (re.doneFirstInstantScroll = !0),
            (re.nextScrollAllowedTime = 0)),
          re.wasUserScrolling || w || re.queuedScroll)
        )
          if (Date.now() > re.nextScrollAllowedTime) {
            if (
              ((re.queuedScroll = !1),
              (re.lastScrollDebugContext.lyricScrollTime = o),
              (re.lastScrollDebugContext.centers = n),
              (re.lastScrollDebugContext.activeElms = b),
              r && Math.abs(y - a) > 2)
            ) {
              ((t.style.transitionTimingFunction = ''),
                (t.style.transitionProperty = ''),
                (t.style.transitionDuration = ''));
              let e = ri(t, 'transition-duration');
              ((t.style.transition = 'none'),
                (t.style.transform = `translate(0px, ${-(y - a)}px)`),
                ro(t),
                (t.style.transition = ''),
                (t.style.transform = 'translate(0px, 0px)'),
                (re.nextScrollAllowedTime = e + Date.now() + 20));
            }
            ((re.scrollPos = y = a),
              (c.scrollTop = y),
              (re.skipScrolls += 1),
              re.skipScrollsDecayTimes.push(Date.now() + 2e3));
          } else
            (re.nextScrollAllowedTime - Date.now() < i7.getNumberValue() ||
              s) &&
              (re.queuedScroll = !0);
      }
      re.wasUserScrolling &&
        re.scrollResumeTime < Date.now() &&
        (ra().setAttribute('autoscroll-hidden', 'true'),
        t.classList.remove(f),
        (re.wasUserScrolling = !1));
      let N = 0;
      for (
        ;
        N < re.skipScrollsDecayTimes.length &&
        !(re.skipScrollsDecayTimes[N] > n);
        N++
      );
      ((re.skipScrollsDecayTimes = re.skipScrollsDecayTimes.slice(N)),
        (re.skipScrolls -= N),
        re.skipScrolls < 1 && (re.skipScrolls = 1));
    } catch (e) {
      e.message?.includes('undefined') ||
        tU('[BetterLyrics] Error in lyrics check interval:', e);
    }
  }
  let rn = !1;
  function rs() {
    nf.areLyricsTicking &&
      !rn &&
      ((rn = !0),
      requestAnimationFrame(() => {
        ((rn = !1),
          rb(),
          rr(re.lastTime, re.lastEventCreationTime, re.lastPlayState, !1));
      }));
  }
  function ra() {
    let e = document.getElementById('autoscroll-resume-button');
    if (!e) {
      let t = document.createElement('div');
      ((t.id = 'autoscroll-resume-wrapper'),
        (t.className = 'autoscroll-resume-wrapper'),
        ((e = document.createElement('button')).id =
          'autoscroll-resume-button'),
        (e.innerText = 'Resume Autoscroll'),
        e.classList.add('autoscroll-resume-button'),
        e.setAttribute('autoscroll-hidden', 'true'),
        e.addEventListener('click', () => {
          ((re.scrollResumeTime = 0),
            e.setAttribute('autoscroll-hidden', 'true'));
        }),
        document.querySelector('#side-panel > tp-yt-paper-tabs').after(t),
        t.appendChild(e));
    }
    return e;
  }
  function rl(e) {
    return e
      ? e.endsWith('ms')
        ? parseFloat(e.slice(0, -2))
        : e.endsWith('s')
          ? 1e3 * parseFloat(e.slice(0, -1))
          : 0
      : 0;
  }
  function ro(e) {
    e.offsetHeight;
  }
  let ru = tH('blyrics-disable-richsync', !1, !0),
    rc = tH('blyrics-line-synced-animation-delay', 50, !0),
    rd = tH('blyrics-long-word-threshold', 1500, !0);
  function rh(e) {
    return t_(e, nf.romanizationDisabledLanguages);
  }
  function rp(e) {
    return t_(e, nf.translationDisabledLanguages);
  }
  let rm = null;
  function rg(e, t = !1, i) {
    let r = e.lyrics;
    if (!r || 0 === r.length)
      throw Error('[BetterLyrics] No lyrics found for the current song');
    tU('[BetterLyrics] Lyrics found, injecting into the page');
    let n = document.querySelector(w)?.parentElement;
    n && n.classList.add('blyrics-hidden');
    try {
      document.getElementsByClassName(o)[0].replaceChildren();
    } catch (e) {
      tU(
        '[BetterLyrics] (Safe to ignore) Lyrics tab is not disabled, unable to enable it',
      );
    }
    !(function (e, t = !1, i) {
      let r = nf.currentInjectionId,
        n = e.lyrics;
      iK();
      let s = (function () {
        let e = document.querySelector(v);
        (e.removeEventListener('scroll', iA), e.addEventListener('scroll', iA));
        let t = document.getElementById(S);
        if (t)
          return (
            t.replaceChildren(),
            (t.style.top = ''),
            (t.style.transition = ''),
            t
          );
        let i = document.createElement('div');
        return (
          (i.id = S),
          e.appendChild(i),
          i.addEventListener('copy', (e) => {
            let t = window.getSelection();
            if (!t || t.isCollapsed) return;
            let i = t.getRangeAt(0).cloneContents(),
              r = i.querySelectorAll('.blyrics--line');
            if (0 === r.length) {
              let t = i.textContent?.replace(/\s+/g, ' ').trim();
              t &&
                e.clipboardData &&
                (e.preventDefault(), e.clipboardData.setData('text/plain', t));
              return;
            }
            let n = [];
            for (let e of r) {
              let t = [
                Array.from(e.querySelectorAll('.blyrics--word'))
                  .map((e) => e.textContent?.trim())
                  .filter(Boolean)
                  .join(' '),
                e.querySelector(`.${b}`)?.textContent?.trim(),
                e.querySelector(`.${y}`)?.textContent?.trim(),
              ].filter(Boolean);
              t.length > 0 && n.push(t.join('\n'));
            }
            n.length > 0 &&
              (e.preventDefault(),
              e.clipboardData?.setData('text/plain', n.join('\n')));
          }),
          tU('[BetterLyrics] Lyrics wrapper created'),
          i
        );
      })();
      s.replaceChildren();
      let a = document.createElement('div');
      ((a.className = o),
        s.appendChild(a),
        s.removeAttribute('is-empty'),
        nf.isTranslateEnabled &&
          tU(
            '[BetterLyrics] Translation enabled, translating lyrics. Language: ',
            nf.translationLanguage,
          ));
      let u = n.every((e) => 0 === e.startTimeMs);
      t ? iU(!0) : i$(u && n[0].words !== _('lyrics_notFound'));
      let h = new Promise((t, r) => {
          if (i?.aborted) return void r(Error('Aborted'));
          let s = () => r(Error('Aborted'));
          if ((i?.addEventListener('abort', s, { once: !0 }), e.language))
            (i?.removeEventListener('abort', s), t(e.language));
          else {
            let e = '',
              r = 0;
            for (let t of n)
              if (((e += t.words.trim() + '\n'), ++r >= 10)) break;
            tW(e, 'en').then((e) => {
              i?.removeEventListener('abort', s);
              let r = e?.originalLanguage || '';
              (tU(C, 'Lang was missing. Determined it is: ' + r), t(r));
            });
          }
        }),
        p = [],
        m = u ? 'none' : 'synced';
      (n.forEach((t, s) => {
        var l, g, f, M, v;
        let w;
        if (t.isInstrumental) {
          let e,
            i,
            r,
            o,
            d,
            h,
            m,
            g,
            f,
            y,
            b,
            M,
            v,
            w,
            N,
            S,
            E,
            x,
            I =
              ((l = t.durationMs),
              (e = document.createElement('div')).classList.add(
                'blyrics--instrumental',
              ),
              e.style.setProperty('--blyrics-duration', `${l}ms`),
              (i = 'http://www.w3.org/2000/svg'),
              (r = document.createElementNS(i, 'svg')).classList.add(
                'blyrics--instrumental-icon',
              ),
              r.setAttribute('viewBox', '0 0 24 24'),
              (o = document.createElementNS(i, 'defs')),
              (d = `blyrics-glow-${s}`),
              (h = `blyrics-wave-clip-${s}`),
              (m = document.createElementNS(i, 'filter')).setAttribute('id', d),
              m.setAttribute('x', '-100%'),
              m.setAttribute('y', '-100%'),
              m.setAttribute('width', '300%'),
              m.setAttribute('height', '300%'),
              (g = document.createElementNS(i, 'feGaussianBlur')).setAttribute(
                'in',
                'SourceGraphic',
              ),
              g.setAttribute('stdDeviation', '5'),
              g.setAttribute('result', 'blur'),
              m.appendChild(g),
              (f = document.createElementNS(i, 'feColorMatrix')).setAttribute(
                'in',
                'blur',
              ),
              f.setAttribute('type', 'matrix'),
              f.setAttribute(
                'values',
                '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0',
              ),
              f.setAttribute('result', 'fadedBlur'),
              m.appendChild(f),
              (y = document.createElementNS(i, 'feMerge')),
              (b = document.createElementNS(i, 'feMergeNode')).setAttribute(
                'in',
                'fadedBlur',
              ),
              y.appendChild(b),
              (M = document.createElementNS(i, 'feMergeNode')).setAttribute(
                'in',
                'SourceGraphic',
              ),
              y.appendChild(M),
              m.appendChild(y),
              o.appendChild(m),
              (v = document.createElementNS(i, 'clipPath')).setAttribute(
                'id',
                h,
              ),
              v.classList.add('blyrics--wave-clip'),
              (w = document.createElementNS(i, 'path')).classList.add(
                'blyrics--wave-rect',
              ),
              w.setAttribute('d', 'M -4 3.9 L 30 3.9 L 30 30 L -4 30 Z'),
              v.appendChild(w),
              (N = document.createElementNS(i, 'path')).classList.add(
                'blyrics--wave-path',
              ),
              N.setAttribute(
                'd',
                'M -4 3 Q 1 2 5 3 Q 10 4 14 3 Q 18 2 22 3 Q 26 4 30 3 L 30 4 L -4 4 Z',
              ),
              v.appendChild(N),
              o.appendChild(v),
              r.appendChild(o),
              (S = document.createElementNS(i, 'path')).classList.add(
                'blyrics--instrumental-bg',
              ),
              S.setAttribute(
                'd',
                'M10 21q-1.65 0-2.825-1.175T6 17t1.175-2.825T10 13q.575 0 1.063.138t.937.412V4q0-.425.288-.712T13 3h4q.425 0 .713.288T18 4v2q0 .425-.288.713T17 7h-3v10q0 1.65-1.175 2.825T10 21',
              ),
              r.appendChild(S),
              (E = document.createElementNS(i, 'g')).setAttribute(
                'filter',
                `url(#${d})`,
              ),
              (x = document.createElementNS(i, 'path')).classList.add(
                'blyrics--instrumental-fill',
              ),
              x.setAttribute('clip-path', `url(#${h})`),
              x.setAttribute(
                'd',
                'M10 21q-1.65 0-2.825-1.175T6 17t1.175-2.825T10 13q.575 0 1.063.138t.937.412V4q0-.425.288-.712T13 3h4q.425 0 .713.288T18 4v2q0 .425-.288.713T17 7h-3v10q0 1.65-1.175 2.825T10 21',
              ),
              E.appendChild(x),
              r.appendChild(E),
              e.appendChild(r),
              e);
          (I.classList.add('blyrics--line'),
            (I.dataset.time = String(t.startTimeMs / 1e3)),
            (I.dataset.duration = String(t.durationMs / 1e3)),
            (I.dataset.lineNumber = String(s)),
            (I.dataset.instrumental = 'true'));
          let L = (function (e, t) {
            for (let i = t - 1; i >= 0; i--)
              if (!e[i].isInstrumental && e[i].agent) return e[i].agent;
            for (let i = t + 1; i < e.length; i++)
              if (!e[i].isInstrumental && e[i].agent) return e[i].agent;
          })(n, s);
          if (
            (L && (I.dataset.agent = L),
            (function (e, t) {
              for (let i = t - 1; i >= 0; i--)
                if (!e[i].isInstrumental && e[i].words?.trim())
                  return W(e[i].words);
              for (let i = t + 1; i < e.length; i++)
                if (!e[i].isInstrumental && e[i].words?.trim())
                  return W(e[i].words);
              return !1;
            })(n, s) && I.classList.add(c),
            !u)
          ) {
            let e = t.startTimeMs / 1e3;
            I.addEventListener('click', () => {
              (tU(C, `Seeking to ${e.toFixed(2)}s`),
                document.dispatchEvent(
                  new CustomEvent('blyrics-seek-to', { detail: e }),
                ),
                (re.scrollResumeTime = 0));
            });
          }
          let k = {
            lyricElement: I,
            time: t.startTimeMs / 1e3,
            duration: t.durationMs / 1e3,
            parts: [],
            isScrolled: !1,
            animationStartTimeMs: 1 / 0,
            isAnimationPlayStatePlaying: !1,
            accumulatedOffsetMs: 0,
            isAnimating: !1,
            isSelected: !1,
            height: -1,
            position: -1,
          };
          try {
            (p.push(k), a.appendChild(I));
          } catch (e) {
            tU(z);
          }
          return;
        }
        (t.parts || (t.parts = []),
          (0 === t.parts.length || ru.getBooleanValue()) &&
            ((t.parts = []),
            t.words.split(' ').forEach((e, i) => {
              ((e = e.trim().length < 1 ? e : e + ' '),
                t.parts.push({
                  startTimeMs: t.startTimeMs + i * rc.getNumberValue(),
                  words: e,
                  durationMs: 0,
                }));
            })),
          t.parts.every((e) => 0 === e.durationMs) || (m = 'richsync'));
        let N = document.createElement('div');
        N.classList.add('blyrics--line');
        let S = {
          lyricElement: N,
          time: t.startTimeMs / 1e3,
          duration: t.durationMs / 1e3,
          parts: [],
          isScrolled: !1,
          animationStartTimeMs: 1 / 0,
          isAnimationPlayStatePlaying: !1,
          accumulatedOffsetMs: 0,
          isAnimating: !1,
          isSelected: !1,
          height: -1,
          position: -1,
        };
        (rf(t.parts, S, N),
          ry(N, 1),
          (N.dataset.time = String(S.time)),
          (N.dataset.duration = String(S.duration)),
          (N.dataset.lineNumber = String(s)),
          N.style.setProperty('--blyrics-duration', t.durationMs + 'ms'),
          t.agent && (N.dataset.agent = t.agent),
          u
            ? (N.style.cursor = 'unset')
            : N.addEventListener('click', (e) => {
                let t,
                  i = e.target,
                  r = N.closest(`.${o}`);
                if (r?.dataset.sync === 'richsync')
                  if (e.altKey) {
                    let r = i.closest(`.${d}`);
                    if (!r) {
                      let t = N.querySelectorAll(`.${d}`),
                        i = 1 / 0;
                      t.forEach((t) => {
                        let n = t.getBoundingClientRect(),
                          s = n.left + n.width / 2,
                          a = n.top + n.height / 2,
                          l = Math.hypot(e.clientX - s, e.clientY - a);
                        l < i && ((i = l), (r = t));
                      });
                    }
                    if (!r) return;
                    t = parseFloat(r.dataset.time || '0');
                  } else t = parseFloat(N.dataset.time || '0');
                else t = parseFloat(N.dataset.time || '0');
                (tU(C, `Seeking to ${t.toFixed(2)}s`),
                  document.dispatchEvent(
                    new CustomEvent('blyrics-seek-to', { detail: t }),
                  ),
                  (re.scrollResumeTime = 0));
              }));
        let E = () => {
            ry(N, 4);
            let e = document.createElement('div');
            return (
              e.classList.add(b),
              (e.style.order = '5'),
              N.appendChild(e),
              e
            );
          },
          x = ((g = t.words), tF.romanization.get(g) || null),
          I =
            (((e.language && t_(e.language, A)) || Q(t.words)) &&
              t.romanization) ||
            null !== x;
        t.romanization && (x = t.romanization);
        let L = e.language && rh(e.language);
        if (I && nf.isRomanizationEnabled && !L) {
          let e = G(t.words);
          (e && rh(e)) ||
            x === t.words ||
            (t.timedRomanization &&
            t.timedRomanization.length > 0 &&
            !ru.getBooleanValue()
              ? rf(t.timedRomanization, S, E())
              : (E().textContent = '\n' + x));
        } else
          L ||
            h
              .then(async (e) => {
                if (
                  !(
                    nf.currentInjectionId !== r ||
                    i?.aborted ||
                    !nf.isRomanizationEnabled ||
                    rh(e)
                  ) &&
                  Q(t.words)
                ) {
                  let n = G(t.words);
                  if (n && rh(n)) return;
                  let s = t_(e, A) ? e : 'auto',
                    a = t.words.trim();
                  if ('♪' === a || '' === a) return;
                  let l = t.romanization ?? (await tY(s, t.words, i));
                  if (!(nf.currentInjectionId !== r || i?.aborted))
                    l && !rM(l, t.words) && ((E().textContent = l), rs());
                }
              })
              .catch(() => {});
        let k = () => {
            ry(N, 6);
            let e = document.createElement('div');
            return (
              e.classList.add(y),
              (e.style.order = '7'),
              N.appendChild(e),
              e
            );
          },
          T = nf.translationLanguage;
        if (
          t.translation &&
          ((M = T),
          (v = t.translation.lang),
          M.split('-')[0] === v.split('-')[0])
        )
          (e.language ||
            console.warn(`${C} Found translations, but no original language`),
            (w = {
              originalLanguage: e.language || '',
              translatedText: t.translation.text,
            }));
        else {
          let e;
          ((f = t.words),
            (e = `${T}_${f}`),
            (w = tF.translation.get(e) || null));
        }
        let D = w?.originalLanguage || e.language,
          j = !!D && rp(D);
        w && nf.isTranslateEnabled && !j
          ? rM(w.translatedText, t.words) ||
            (k().textContent = '\n' + w.translatedText)
          : j ||
            h
              .then(async (e) => {
                if (
                  nf.currentInjectionId !== r ||
                  i?.aborted ||
                  !nf.isTranslateEnabled ||
                  rp(e)
                )
                  return;
                let n = nf.translationLanguage || 'en';
                if (e !== n || Q(t.words)) {
                  let e = t.words.trim();
                  if ('♪' === e || '' === e) return;
                  let s = await tW(t.words, n, i);
                  if (nf.currentInjectionId !== r || i?.aborted) return;
                  s &&
                    !rM(s.translatedText, t.words) &&
                    ((k().textContent = '\n' + s.translatedText), rs());
                }
              })
              .catch(() => {});
        try {
          (p.push(S), a.appendChild(N));
        } catch (e) {
          tU(z);
        }
      }),
        (re.skipScrolls = 2),
        (re.skipScrollsDecayTimes = []));
      for (let e = 0; e < re.skipScrolls; e++)
        re.skipScrollsDecayTimes.push(Date.now() + 2e3);
      ((re.scrollResumeTime = 0),
        n[0].words !== _('lyrics_notFound')
          ? (function (e, t, i, r, n, s, a) {
              0 !== document.getElementsByClassName(M).length &&
                document.getElementsByClassName(M)[0].remove();
              let l = document.getElementsByClassName(o)[0],
                u = document.createElement('div');
              (u.classList.add(M),
                l.appendChild(u),
                (function (e, t, i, r) {
                  try {
                    let n = document.getElementsByClassName(M)[0];
                    n.replaceChildren();
                    let s = document.createElement('div');
                    s.className = `${M}__container`;
                    let a = document.createElement('img');
                    ((a.src = 'https://better-lyrics.boidu.dev/icon-512.png'),
                      (a.alt = 'Better Lyrics Logo'),
                      (a.width = 20),
                      (a.height = 20),
                      s.appendChild(a),
                      s.appendChild(
                        document.createTextNode(_('lyrics_source')),
                      ));
                    let l = document.createElement('a');
                    ((l.target = '_blank'),
                      (l.id = 'betterLyricsFooterLink'),
                      s.appendChild(l));
                    let o = document.createElement('img');
                    ((o.src =
                      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNhYWEiIGQ9Ik0xOS4yNyA1LjMzQzE3Ljk0IDQuNzEgMTYuNSA0LjI2IDE1IDRhLjA5LjA5IDAgMCAwLS4wNy4wM2MtLjE4LjMzLS4zOS43Ni0uNTMgMS4wOWExNi4wOSAxNi4wOSAwIDAgMC00LjggMGMtLjE0LS4zNC0uMzUtLjc2LS41NC0xLjA5Yy0uMDEtLjAyLS4wNC0uMDMtLjA3LS4wM2MtMS41LjI2LTIuOTMuNzEtNC4yNyAxLjMzYy0uMDEgMC0uMDIuMDEtLjAzLjAyYy0yLjcyIDQuMDctMy40NyA4LjAzLTMuMSAxMS45NWMwIC4wMi4wMS4wNC4wMy4wNWMxLjggMS4zMiAzLjUzIDIuMTIgNS4yNCAyLjY1Yy4wMy4wMS4wNiAwIC4wNy0uMDJjLjQtLjU1Ljc2LTEuMTMgMS4wNy0xLjc0Yy4wMi0uMDQgMC0uMDgtLjA0LS4wOWMtLjU3LS4yMi0xLjExLS40OC0xLjY0LS43OGMtLjA0LS4wMi0uMDQtLjA4LS4wMS0uMTFjLjExLS4wOC4yMi0uMTcuMzMtLjI1Yy4wMi0uMDIuMDUtLjAyLjA3LS4wMWMzLjQ0IDEuNTcgNy4xNSAxLjU3IDEwLjU1IDBjLjAyLS4wMS4wNS0uMDEuMDcuMDFjLjExLjA5LjIyLjE3LjMzLjI2Yy4wNC4wMy4wNC4wOS0uMDEuMTFjLS41Mi4zMS0xLjA3LjU2LTEuNjQuNzhjLS4wNC4wMS0uMDUuMDYtLjA0LjA5Yy4zMi42MS42OCAxLjE5IDEuMDcgMS43NGMuMDMuMDEuMDYuMDIuMDkuMDFjMS43Mi0uNTMgMy40NS0xLjMzIDUuMjUtMi42NWMuMDItLjAxLjAzLS4wMy4wMy0uMDVjLjQ0LTQuNTMtLjczLTguNDYtMy4xLTExLjk1Yy0uMDEtLjAxLS4wMi0uMDItLjA0LS4wMk04LjUyIDE0LjkxYy0xLjAzIDAtMS44OS0uOTUtMS44OS0yLjEycy44NC0yLjEyIDEuODktMi4xMmMxLjA2IDAgMS45Ljk2IDEuODkgMi4xMmMwIDEuMTctLjg0IDIuMTItMS44OSAyLjEybTYuOTcgMGMtMS4wMyAwLTEuODktLjk1LTEuODktMi4xMnMuODQtMi4xMiAxLjg5LTIuMTJjMS4wNiAwIDEuOS45NiAxLjg5IDIuMTJjMCAxLjE3LS44MyAyLjEyLTEuODkgMi4xMiIvPjwvc3ZnPg=='),
                      (o.alt = 'Better Lyrics Discord'),
                      (o.width = 20),
                      (o.height = 20));
                    let u = document.createElement('a');
                    ((u.className = `${M}__discord`),
                      (u.href = 'https://discord.gg/UsHE3d5fWF'),
                      (u.target = '_blank'),
                      u.appendChild(o));
                    let c = new URL(k);
                    (e && c.searchParams.append('title', e),
                      t && c.searchParams.append('artist', t),
                      i && c.searchParams.append('album', i),
                      r && c.searchParams.append('duration', r.toString()),
                      (l.target = '_blank'));
                    let d = iO({
                        text: _('lyrics_addToLrclib'),
                        href: c.toString(),
                      }),
                      h = iO({
                        text: _('lyrics_searchOnGenius'),
                        href: iJ(e, t),
                        logoSrc: L,
                        logoAlt: 'Genius',
                      });
                    (n.appendChild(s),
                      n.appendChild(h),
                      n.appendChild(d),
                      n.appendChild(u),
                      n.removeAttribute('is-empty'));
                  } catch (e) {
                    tU(
                      '[BetterLyrics] (Safe to ignore) Footer is not visible, unable to inject source link',
                    );
                  }
                })(i, r, n, s));
              let c = document.getElementById('betterLyricsFooterLink');
              t = t || 'https://better-lyrics.boidu.dev/';
              let d = a ? iz[a] : null;
              if (((c.textContent = ''), (c.href = t), d)) {
                var h;
                let e, t;
                c.appendChild(document.createTextNode(d.name));
                let i = document.createElement('span');
                ((i.style.opacity = '0.5'),
                  (i.style.marginLeft = '6px'),
                  (i.style.display = 'inline-flex'),
                  (i.style.verticalAlign = 'middle'),
                  (i.style.color = ij[d.syncType]));
                let r =
                  ((h = iD[d.syncType]),
                  (t = (e = new DOMParser().parseFromString(h, 'image/svg+xml'))
                    .documentElement) instanceof SVGElement &&
                  !e.querySelector('parsererror')
                    ? t
                    : null);
                (r && i.appendChild(r), c.appendChild(i));
              } else c.textContent = e || 'boidu.dev';
            })(
              e.source,
              e.sourceHref,
              e.song,
              e.artist,
              e.album,
              e.duration,
              e.providerKey,
            )
          : (function (e, t, i, r) {
              let n = document.getElementById(S);
              if (!n) return;
              let s = document.createElement('div');
              s.className = 'blyrics-no-lyrics-button-container';
              let a = new URL(k);
              (e && a.searchParams.append('title', e),
                t && a.searchParams.append('artist', t),
                i && a.searchParams.append('album', i),
                r && a.searchParams.append('duration', r.toString()));
              let l = iO({ text: _('lyrics_addToLrclib'), href: a.toString() }),
                o = iO({
                  text: _('lyrics_searchOnGenius'),
                  href: iJ(e, t),
                  logoSrc: L,
                  logoAlt: 'Genius',
                });
              (s.appendChild(l), s.appendChild(o), n.appendChild(s));
            })(e.song, e.artist, e.album, e.duration));
      let g = document.createElement('div');
      ((g.id = E),
        (g.style.height = '100px'),
        (g.textContent = ''),
        (g.style.padding = '0'),
        (g.style.margin = '0'),
        a.appendChild(g),
        (a.dataset.sync = m),
        (a.dataset.loaderVisible = String(t)),
        n[0].words === _('lyrics_notFound') && (a.dataset.noLyrics = 'true'));
      let f = document.getElementsByClassName(l)[1],
        w = {
          lines: p,
          syncType: m,
          lyricWidth: a.clientWidth,
          lyricHeight: a.clientHeight,
          isMusicVideoSynced: !0 === e.musicVideoSynced,
          tabSelector: f,
          lyricsContainer: a,
        };
      (e.segmentMap && np(w, e.segmentMap),
        (nf.lyricData = w),
        u
          ? tU(
              '[BetterLyrics] Syncing lyrics disabled due to all lyrics having a start time of 0',
            )
          : ((nf.areLyricsTicking = !0),
            rb(),
            (!rm &&
              (rm = new ResizeObserver((e) => {
                for (let t of e)
                  t.target.id === S &&
                    nf.lyricData &&
                    (t.target.clientWidth !== nf.lyricData.lyricWidth ||
                      t.target.clientHeight !== nf.lyricData.lyricHeight) &&
                    rb();
              })),
            rm).observe(s)),
        (nf.areLyricsLoaded = !0));
    })(e, t, i);
  }
  function rf(e, t, i) {
    var r, n;
    let s,
      a,
      l,
      o,
      u = [],
      p = !0,
      m = [];
    (e.forEach((e) => {
      let i = W(e.words);
      !i &&
        e.words.trim().length > 0 &&
        ((p = !1),
        u.reverse().forEach((e) => {
          m.push(e);
        }),
        (u = []));
      let r = document.createElement('span');
      (r.classList.add(d),
        0 === e.durationMs && r.classList.add('blyrics-zero-dur-animate'),
        i && r.classList.add(c));
      let n = {
        time: e.startTimeMs / 1e3,
        duration: e.durationMs / 1e3,
        lyricElement: r,
        animationStartTimeMs: 1 / 0,
      };
      ((r.textContent = e.words),
        (r.dataset.time = String(n.time)),
        (r.dataset.duration = String(n.duration)),
        (r.dataset.content = e.words),
        r.style.setProperty('--blyrics-duration', e.durationMs + 'ms'),
        e.durationMs > rd.getNumberValue() && (r.dataset.longWord = 'true'),
        e.isBackground && r.classList.add(h),
        0 === e.words.trim().length && (r.style.display = 'inline'),
        0 !== e.words.trim().length && t.parts.push(n),
        i ? u.push(r) : m.push(r));
    }),
      p && u.length > 0
        ? (i.classList.add(c),
          u.forEach((e) => {
            m.push(e);
          }))
        : u.length > 0 &&
          u.reverse().forEach((e) => {
            m.push(e);
          }),
      (r = i),
      (n = m),
      (s = /([\s\u200B\u00AD\p{Dash_Punctuation}])/gu),
      (a = []),
      (l = !1),
      (o = () => {
        if (a.length > 0) {
          let e = document.createElement('span');
          (a.forEach((t) => {
            e.appendChild(t);
          }),
            l && e.classList.add(h),
            r.appendChild(e),
            (a = []));
        }
      }),
      n.forEach((e) => {
        let t = l !== e.classList.contains(h),
          i = 1 !== e.textContent.length || ' ' !== e.textContent[0];
        (t || a.push(e),
          ((e.textContent.length > 0 &&
            s.test(e.textContent[e.textContent.length - 1])) ||
            t) &&
            o(),
          t && i && (a.push(e), (l = e.classList.contains(h))));
      }),
      o());
  }
  function ry(e, t) {
    let i = document.createElement('span');
    (i.classList.add('blyrics--break'),
      (i.style.order = String(t)),
      e.appendChild(i));
  }
  function rb() {
    let e, t, i;
    if (
      ((e = document
        .getElementsByClassName(o)[0]
        .getBoundingClientRect().height),
      (i = Math.max(
        (t = document.querySelector(v).getBoundingClientRect().height) *
          (1 - i6.getNumberValue()),
        t - e,
      )),
      (document.getElementById(E).style.height = `${i.toFixed(0)}px`),
      nf.lyricData && nf.areLyricsTicking)
    ) {
      let e = document.getElementsByClassName(o)[0];
      if (i9.getBooleanValue()) {
        let t = document.getElementById('tab-renderer')?.clientHeight;
        t
          ? (e.style.paddingTop = `${t * i6.getNumberValue()}px`)
          : ((e.style.paddingTop = ''),
            tU(
              'Could not find tab renderer height, not adding extra padding top.',
            ));
      }
      let t = nf.lyricData;
      ((t.lyricWidth = e.clientWidth),
        t.lines.forEach((t) => {
          var i;
          let r,
            n,
            s =
              ((i = t.lyricElement),
              (r = e.getBoundingClientRect()),
              new DOMRect(
                (n = i.getBoundingClientRect()).x - r.x,
                n.y - r.y,
                n.width,
                n.height,
              ));
          ((t.position = s.y), (t.height = s.height));
        }),
        (re.wasUserScrolling = !0),
        i4());
    }
  }
  function rM(e, t) {
    return (
      (e = e
        .toLowerCase()
        .replaceAll(/(\p{P})/gu, '')
        .trim()) ===
      (t = t
        .toLowerCase()
        .replaceAll(/(\p{P})/gu, '')
        .trim())
    );
  }
  let rv = {
      preserveOrder: !1,
      attributeNamePrefix: '@_',
      attributesGroupName: !1,
      textNodeName: '#text',
      ignoreAttributes: !0,
      removeNSPrefix: !1,
      allowBooleanAttributes: !1,
      parseTagValue: !0,
      parseAttributeValue: !1,
      trimValues: !0,
      cdataPropName: !1,
      numberParseOptions: { hex: !0, leadingZeros: !0, eNotation: !0 },
      tagValueProcessor: function (e, t) {
        return t;
      },
      attributeValueProcessor: function (e, t) {
        return t;
      },
      stopNodes: [],
      alwaysCreateTextNode: !1,
      isArray: () => !1,
      commentPropName: !1,
      unpairedTags: [],
      processEntities: !0,
      htmlEntities: !1,
      ignoreDeclaration: !1,
      ignorePiTags: !1,
      transformTagName: !1,
      transformAttributeName: !1,
      updateTag: function (e, t, i) {
        return e;
      },
      captureMetaData: !1,
    },
    rw =
      ':A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD',
    rN = RegExp(
      '^' +
        ('[' + rw + '][' + rw) +
        '\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$',
    );
  function rS(e, t) {
    let i = [],
      r = t.exec(e);
    for (; r; ) {
      let n = [];
      n.startIndex = t.lastIndex - r[0].length;
      let s = r.length;
      for (let e = 0; e < s; e++) n.push(r[e]);
      (i.push(n), (r = t.exec(e)));
    }
    return i;
  }
  let rE = function (e) {
    return null != rN.exec(e);
  };
  t =
    'function' != typeof Symbol ? '@@xmlMetadata' : Symbol('XML Node Metadata');
  class rx {
    constructor(e) {
      ((this.tagname = e), (this.child = []), (this[':@'] = {}));
    }
    add(e, t) {
      ('__proto__' === e && (e = '#__proto__'), this.child.push({ [e]: t }));
    }
    addChild(e, i) {
      ('__proto__' === e.tagname && (e.tagname = '#__proto__'),
        e[':@'] && Object.keys(e[':@']).length > 0
          ? this.child.push({ [e.tagname]: e.child, ':@': e[':@'] })
          : this.child.push({ [e.tagname]: e.child }),
        void 0 !== i &&
          (this.child[this.child.length - 1][t] = { startIndex: i }));
    }
    static getMetaDataSymbol() {
      return t;
    }
  }
  class rI {
    constructor(e) {
      this.suppressValidationErr = !e;
    }
    readDocType(e, t) {
      let i = {};
      if (
        'O' === e[t + 3] &&
        'C' === e[t + 4] &&
        'T' === e[t + 5] &&
        'Y' === e[t + 6] &&
        'P' === e[t + 7] &&
        'E' === e[t + 8]
      ) {
        t += 9;
        let r = 1,
          n = !1,
          s = !1;
        for (; t < e.length; t++)
          if ('<' !== e[t] || s)
            if ('>' === e[t]) {
              if (
                (s
                  ? '-' === e[t - 1] && '-' === e[t - 2] && ((s = !1), r--)
                  : r--,
                0 === r)
              )
                break;
            } else '[' === e[t] ? (n = !0) : e[t];
          else {
            if (n && rk(e, '!ENTITY', t)) {
              let r, n;
              ((t += 7),
                ([r, n, t] = this.readEntityExp(
                  e,
                  t + 1,
                  this.suppressValidationErr,
                )),
                -1 === n.indexOf('&') &&
                  (i[r] = { regx: RegExp(`&${r};`, 'g'), val: n }));
            } else if (n && rk(e, '!ELEMENT', t)) {
              t += 8;
              let { index: i } = this.readElementExp(e, t + 1);
              t = i;
            } else if (n && rk(e, '!ATTLIST', t)) t += 8;
            else if (n && rk(e, '!NOTATION', t)) {
              t += 9;
              let { index: i } = this.readNotationExp(
                e,
                t + 1,
                this.suppressValidationErr,
              );
              t = i;
            } else if (rk(e, '!--', t)) s = !0;
            else throw Error('Invalid DOCTYPE');
            r++;
          }
        if (0 !== r) throw Error('Unclosed DOCTYPE');
      } else throw Error('Invalid Tag instead of DOCTYPE');
      return { entities: i, i: t };
    }
    readEntityExp(e, t) {
      t = rL(e, t);
      let i = '';
      for (; t < e.length && !/\s/.test(e[t]) && '"' !== e[t] && "'" !== e[t]; )
        ((i += e[t]), t++);
      if ((rT(i), (t = rL(e, t)), !this.suppressValidationErr)) {
        if ('SYSTEM' === e.substring(t, t + 6).toUpperCase())
          throw Error('External entities are not supported');
        else if ('%' === e[t])
          throw Error('Parameter entities are not supported');
      }
      let r = '';
      return (([t, r] = this.readIdentifierVal(e, t, 'entity')), [i, r, --t]);
    }
    readNotationExp(e, t) {
      t = rL(e, t);
      let i = '';
      for (; t < e.length && !/\s/.test(e[t]); ) ((i += e[t]), t++);
      (this.suppressValidationErr || rT(i), (t = rL(e, t)));
      let r = e.substring(t, t + 6).toUpperCase();
      if (!this.suppressValidationErr && 'SYSTEM' !== r && 'PUBLIC' !== r)
        throw Error(`Expected SYSTEM or PUBLIC, found "${r}"`);
      ((t += r.length), (t = rL(e, t)));
      let n = null,
        s = null;
      if ('PUBLIC' === r)
        (([t, n] = this.readIdentifierVal(e, t, 'publicIdentifier')),
          (t = rL(e, t)),
          ('"' === e[t] || "'" === e[t]) &&
            ([t, s] = this.readIdentifierVal(e, t, 'systemIdentifier')));
      else if (
        'SYSTEM' === r &&
        (([t, s] = this.readIdentifierVal(e, t, 'systemIdentifier')),
        !this.suppressValidationErr && !s)
      )
        throw Error('Missing mandatory system identifier for SYSTEM notation');
      return {
        notationName: i,
        publicIdentifier: n,
        systemIdentifier: s,
        index: --t,
      };
    }
    readIdentifierVal(e, t, i) {
      let r = '',
        n = e[t];
      if ('"' !== n && "'" !== n)
        throw Error(`Expected quoted string, found "${n}"`);
      for (t++; t < e.length && e[t] !== n; ) ((r += e[t]), t++);
      if (e[t] !== n) throw Error(`Unterminated ${i} value`);
      return [++t, r];
    }
    readElementExp(e, t) {
      t = rL(e, t);
      let i = '';
      for (; t < e.length && !/\s/.test(e[t]); ) ((i += e[t]), t++);
      if (!this.suppressValidationErr && !rE(i))
        throw Error(`Invalid element name: "${i}"`);
      t = rL(e, t);
      let r = '';
      if ('E' === e[t] && rk(e, 'MPTY', t)) t += 4;
      else if ('A' === e[t] && rk(e, 'NY', t)) t += 2;
      else if ('(' === e[t]) {
        for (t++; t < e.length && ')' !== e[t]; ) ((r += e[t]), t++);
        if (')' !== e[t]) throw Error('Unterminated content model');
      } else if (!this.suppressValidationErr)
        throw Error(`Invalid Element Expression, found "${e[t]}"`);
      return { elementName: i, contentModel: r.trim(), index: t };
    }
    readAttlistExp(e, t) {
      t = rL(e, t);
      let i = '';
      for (; t < e.length && !/\s/.test(e[t]); ) ((i += e[t]), t++);
      (rT(i), (t = rL(e, t)));
      let r = '';
      for (; t < e.length && !/\s/.test(e[t]); ) ((r += e[t]), t++);
      if (!rT(r)) throw Error(`Invalid attribute name: "${r}"`);
      t = rL(e, t);
      let n = '';
      if ('NOTATION' === e.substring(t, t + 8).toUpperCase()) {
        if (((n = 'NOTATION'), (t += 8), (t = rL(e, t)), '(' !== e[t]))
          throw Error(`Expected '(', found "${e[t]}"`);
        t++;
        let i = [];
        for (; t < e.length && ')' !== e[t]; ) {
          let r = '';
          for (; t < e.length && '|' !== e[t] && ')' !== e[t]; )
            ((r += e[t]), t++);
          if (!rT((r = r.trim()))) throw Error(`Invalid notation name: "${r}"`);
          (i.push(r), '|' === e[t] && (t = rL(e, ++t)));
        }
        if (')' !== e[t]) throw Error('Unterminated list of notations');
        (t++, (n += ' (' + i.join('|') + ')'));
      } else {
        for (; t < e.length && !/\s/.test(e[t]); ) ((n += e[t]), t++);
        if (
          !this.suppressValidationErr &&
          ![
            'CDATA',
            'ID',
            'IDREF',
            'IDREFS',
            'ENTITY',
            'ENTITIES',
            'NMTOKEN',
            'NMTOKENS',
          ].includes(n.toUpperCase())
        )
          throw Error(`Invalid attribute type: "${n}"`);
      }
      t = rL(e, t);
      let s = '';
      return (
        '#REQUIRED' === e.substring(t, t + 8).toUpperCase()
          ? ((s = '#REQUIRED'), (t += 8))
          : '#IMPLIED' === e.substring(t, t + 7).toUpperCase()
            ? ((s = '#IMPLIED'), (t += 7))
            : ([t, s] = this.readIdentifierVal(e, t, 'ATTLIST')),
        {
          elementName: i,
          attributeName: r,
          attributeType: n,
          defaultValue: s,
          index: t,
        }
      );
    }
  }
  let rL = (e, t) => {
    for (; t < e.length && /\s/.test(e[t]); ) t++;
    return t;
  };
  function rk(e, t, i) {
    for (let r = 0; r < t.length; r++) if (t[r] !== e[i + r + 1]) return !1;
    return !0;
  }
  function rT(e) {
    if (rE(e)) return e;
    throw Error(`Invalid entity name ${e}`);
  }
  let rA = /^[-+]?0x[a-fA-F0-9]+$/,
    rC = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/,
    rD = { hex: !0, leadingZeros: !0, decimalPoint: '.', eNotation: !0 },
    rj = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
  class rz {
    constructor(e) {
      if (
        ((this.options = e),
        (this.currentNode = null),
        (this.tagsNodeStack = []),
        (this.docTypeEntities = {}),
        (this.lastEntities = {
          apos: { regex: /&(apos|#39|#x27);/g, val: "'" },
          gt: { regex: /&(gt|#62|#x3E);/g, val: '>' },
          lt: { regex: /&(lt|#60|#x3C);/g, val: '<' },
          quot: { regex: /&(quot|#34|#x22);/g, val: '"' },
        }),
        (this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: '&' }),
        (this.htmlEntities = {
          space: { regex: /&(nbsp|#160);/g, val: ' ' },
          cent: { regex: /&(cent|#162);/g, val: '\xa2' },
          pound: { regex: /&(pound|#163);/g, val: '\xa3' },
          yen: { regex: /&(yen|#165);/g, val: '\xa5' },
          euro: { regex: /&(euro|#8364);/g, val: '€' },
          copyright: { regex: /&(copy|#169);/g, val: '\xa9' },
          reg: { regex: /&(reg|#174);/g, val: '\xae' },
          inr: { regex: /&(inr|#8377);/g, val: '₹' },
          num_dec: {
            regex: /&#([0-9]{1,7});/g,
            val: (e, t) => rH(t, 10, '&#'),
          },
          num_hex: {
            regex: /&#x([0-9a-fA-F]{1,6});/g,
            val: (e, t) => rH(t, 16, '&#x'),
          },
        }),
        (this.addExternalEntities = rO),
        (this.parseXml = r$),
        (this.parseTextData = rR),
        (this.resolveNameSpace = rP),
        (this.buildAttributesMap = rU),
        (this.isItStopNode = rW),
        (this.replaceEntitiesValue = r_),
        (this.readStopNodeData = rq),
        (this.saveTextToParentTag = rF),
        (this.addChild = rB),
        (this.ignoreAttributesFn = (function (e) {
          return 'function' == typeof e
            ? e
            : Array.isArray(e)
              ? (t) => {
                  for (let i of e)
                    if (
                      ('string' == typeof i && t === i) ||
                      (i instanceof RegExp && i.test(t))
                    )
                      return !0;
                }
              : () => !1;
        })(this.options.ignoreAttributes)),
        this.options.stopNodes && this.options.stopNodes.length > 0)
      ) {
        ((this.stopNodesExact = new Set()),
          (this.stopNodesWildcard = new Set()));
        for (let e = 0; e < this.options.stopNodes.length; e++) {
          const t = this.options.stopNodes[e];
          'string' == typeof t &&
            (t.startsWith('*.')
              ? this.stopNodesWildcard.add(t.substring(2))
              : this.stopNodesExact.add(t));
        }
      }
    }
  }
  function rO(e) {
    let t = Object.keys(e);
    for (let i = 0; i < t.length; i++) {
      let r = t[i];
      this.lastEntities[r] = { regex: RegExp('&' + r + ';', 'g'), val: e[r] };
    }
  }
  function rR(e, t, i, r, n, s, a) {
    if (
      void 0 !== e &&
      (this.options.trimValues && !r && (e = e.trim()), e.length > 0)
    ) {
      a || (e = this.replaceEntitiesValue(e));
      let r = this.options.tagValueProcessor(t, e, i, n, s);
      return null == r
        ? e
        : typeof r != typeof e || r !== e
          ? r
          : this.options.trimValues || e.trim() === e
            ? rG(e, this.options.parseTagValue, this.options.numberParseOptions)
            : e;
    }
  }
  function rP(e) {
    if (this.options.removeNSPrefix) {
      let t = e.split(':'),
        i = '/' === e.charAt(0) ? '/' : '';
      if ('xmlns' === t[0]) return '';
      2 === t.length && (e = i + t[1]);
    }
    return e;
  }
  let rV = RegExp('([^\\s=]+)\\s*(=\\s*([\'"])([\\s\\S]*?)\\3)?', 'gm');
  function rU(e, t) {
    if (!0 !== this.options.ignoreAttributes && 'string' == typeof e) {
      let i = rS(e, rV),
        r = i.length,
        n = {};
      for (let e = 0; e < r; e++) {
        let r = this.resolveNameSpace(i[e][1]);
        if (this.ignoreAttributesFn(r, t)) continue;
        let s = i[e][4],
          a = this.options.attributeNamePrefix + r;
        if (r.length)
          if (
            (this.options.transformAttributeName &&
              (a = this.options.transformAttributeName(a)),
            '__proto__' === a && (a = '#__proto__'),
            void 0 !== s)
          ) {
            (this.options.trimValues && (s = s.trim()),
              (s = this.replaceEntitiesValue(s)));
            let e = this.options.attributeValueProcessor(r, s, t);
            null == e
              ? (n[a] = s)
              : typeof e != typeof s || e !== s
                ? (n[a] = e)
                : (n[a] = rG(
                    s,
                    this.options.parseAttributeValue,
                    this.options.numberParseOptions,
                  ));
          } else this.options.allowBooleanAttributes && (n[a] = !0);
      }
      if (Object.keys(n).length) {
        if (this.options.attributesGroupName) {
          let e = {};
          return ((e[this.options.attributesGroupName] = n), e);
        }
        return n;
      }
    }
  }
  let r$ = function (e) {
    e = e.replace(/\r\n?/g, '\n');
    let t = new rx('!xml'),
      i = t,
      r = '',
      n = '',
      s = new rI(this.options.processEntities);
    for (let a = 0; a < e.length; a++)
      if ('<' === e[a])
        if ('/' === e[a + 1]) {
          let t = rY(e, '>', a, 'Closing Tag is not closed.'),
            s = e.substring(a + 2, t).trim();
          if (this.options.removeNSPrefix) {
            let e = s.indexOf(':');
            -1 !== e && (s = s.substr(e + 1));
          }
          (this.options.transformTagName &&
            (s = this.options.transformTagName(s)),
            i && (r = this.saveTextToParentTag(r, i, n)));
          let l = n.substring(n.lastIndexOf('.') + 1);
          if (s && -1 !== this.options.unpairedTags.indexOf(s))
            throw Error(`Unpaired tag can not be used as closing tag: </${s}>`);
          let o = 0;
          (l && -1 !== this.options.unpairedTags.indexOf(l)
            ? ((o = n.lastIndexOf('.', n.lastIndexOf('.') - 1)),
              this.tagsNodeStack.pop())
            : (o = n.lastIndexOf('.')),
            (n = n.substring(0, o)),
            (i = this.tagsNodeStack.pop()),
            (r = ''),
            (a = t));
        } else if ('?' === e[a + 1]) {
          let t = rQ(e, a, !1, '?>');
          if (!t) throw Error('Pi Tag is not closed.');
          if (
            ((r = this.saveTextToParentTag(r, i, n)),
            (this.options.ignoreDeclaration && '?xml' === t.tagName) ||
              this.options.ignorePiTags)
          );
          else {
            let e = new rx(t.tagName);
            (e.add(this.options.textNodeName, ''),
              t.tagName !== t.tagExp &&
                t.attrExpPresent &&
                (e[':@'] = this.buildAttributesMap(t.tagExp, n)),
              this.addChild(i, e, n, a));
          }
          a = t.closeIndex + 1;
        } else if ('!--' === e.substr(a + 1, 3)) {
          let t = rY(e, '--\x3e', a + 4, 'Comment is not closed.');
          if (this.options.commentPropName) {
            let s = e.substring(a + 4, t - 2);
            ((r = this.saveTextToParentTag(r, i, n)),
              i.add(this.options.commentPropName, [
                { [this.options.textNodeName]: s },
              ]));
          }
          a = t;
        } else if ('!D' === e.substr(a + 1, 2)) {
          let t = s.readDocType(e, a);
          ((this.docTypeEntities = t.entities), (a = t.i));
        } else if ('![' === e.substr(a + 1, 2)) {
          let t = rY(e, ']]>', a, 'CDATA is not closed.') - 2,
            s = e.substring(a + 9, t);
          r = this.saveTextToParentTag(r, i, n);
          let l = this.parseTextData(s, i.tagname, n, !0, !1, !0, !0);
          (void 0 == l && (l = ''),
            this.options.cdataPropName
              ? i.add(this.options.cdataPropName, [
                  { [this.options.textNodeName]: s },
                ])
              : i.add(this.options.textNodeName, l),
            (a = t + 2));
        } else {
          let s = rQ(e, a, this.options.removeNSPrefix),
            l = s.tagName,
            o = s.rawTagName,
            u = s.tagExp,
            c = s.attrExpPresent,
            d = s.closeIndex;
          if (this.options.transformTagName) {
            let e = this.options.transformTagName(l);
            (u === l && (u = e), (l = e));
          }
          i &&
            r &&
            '!xml' !== i.tagname &&
            (r = this.saveTextToParentTag(r, i, n, !1));
          let h = i;
          (h &&
            -1 !== this.options.unpairedTags.indexOf(h.tagname) &&
            ((i = this.tagsNodeStack.pop()),
            (n = n.substring(0, n.lastIndexOf('.')))),
            l !== t.tagname && (n += n ? '.' + l : l));
          let p = a;
          if (
            this.isItStopNode(this.stopNodesExact, this.stopNodesWildcard, n, l)
          ) {
            let t = '';
            if (u.length > 0 && u.lastIndexOf('/') === u.length - 1)
              ('/' === l[l.length - 1]
                ? ((l = l.substr(0, l.length - 1)),
                  (n = n.substr(0, n.length - 1)),
                  (u = l))
                : (u = u.substr(0, u.length - 1)),
                (a = s.closeIndex));
            else if (-1 !== this.options.unpairedTags.indexOf(l))
              a = s.closeIndex;
            else {
              let i = this.readStopNodeData(e, o, d + 1);
              if (!i) throw Error(`Unexpected end of ${o}`);
              ((a = i.i), (t = i.tagContent));
            }
            let r = new rx(l);
            (l !== u && c && (r[':@'] = this.buildAttributesMap(u, n)),
              t && (t = this.parseTextData(t, l, n, !0, c, !0, !0)),
              (n = n.substr(0, n.lastIndexOf('.'))),
              r.add(this.options.textNodeName, t),
              this.addChild(i, r, n, p));
          } else {
            if (u.length > 0 && u.lastIndexOf('/') === u.length - 1) {
              if (
                ('/' === l[l.length - 1]
                  ? ((l = l.substr(0, l.length - 1)),
                    (n = n.substr(0, n.length - 1)),
                    (u = l))
                  : (u = u.substr(0, u.length - 1)),
                this.options.transformTagName)
              ) {
                let e = this.options.transformTagName(l);
                (u === l && (u = e), (l = e));
              }
              let e = new rx(l);
              (l !== u && c && (e[':@'] = this.buildAttributesMap(u, n)),
                this.addChild(i, e, n, p),
                (n = n.substr(0, n.lastIndexOf('.'))));
            } else {
              let e = new rx(l);
              (this.tagsNodeStack.push(i),
                l !== u && c && (e[':@'] = this.buildAttributesMap(u, n)),
                this.addChild(i, e, n, p),
                (i = e));
            }
            ((r = ''), (a = d));
          }
        }
      else r += e[a];
    return t.child;
  };
  function rB(e, t, i, r) {
    this.options.captureMetaData || (r = void 0);
    let n = this.options.updateTag(t.tagname, i, t[':@']);
    !1 === n || ('string' == typeof n && (t.tagname = n), e.addChild(t, r));
  }
  let r_ = function (e) {
    if (this.options.processEntities) {
      for (let t in this.docTypeEntities) {
        let i = this.docTypeEntities[t];
        e = e.replace(i.regx, i.val);
      }
      for (let t in this.lastEntities) {
        let i = this.lastEntities[t];
        e = e.replace(i.regex, i.val);
      }
      if (this.options.htmlEntities)
        for (let t in this.htmlEntities) {
          let i = this.htmlEntities[t];
          e = e.replace(i.regex, i.val);
        }
      e = e.replace(this.ampEntity.regex, this.ampEntity.val);
    }
    return e;
  };
  function rF(e, t, i, r) {
    return (
      e &&
        (void 0 === r && (r = 0 === t.child.length),
        void 0 !==
          (e = this.parseTextData(
            e,
            t.tagname,
            i,
            !1,
            !!t[':@'] && 0 !== Object.keys(t[':@']).length,
            r,
          )) &&
          '' !== e &&
          t.add(this.options.textNodeName, e),
        (e = '')),
      e
    );
  }
  function rW(e, t, i, r) {
    return !!((t && t.has(r)) || (e && e.has(i)));
  }
  function rY(e, t, i, r) {
    let n = e.indexOf(t, i);
    if (-1 !== n) return n + t.length - 1;
    throw Error(r);
  }
  function rQ(e, t, i, r = '>') {
    let n = (function (e, t, i = '>') {
      let r,
        n = '';
      for (let s = t; s < e.length; s++) {
        let t = e[s];
        if (r) t === r && (r = '');
        else if ('"' === t || "'" === t) r = t;
        else if (t === i[0]) {
          if (!i[1]) return { data: n, index: s };
          else if (e[s + 1] === i[1]) return { data: n, index: s };
        } else '	' === t && (t = ' ');
        n += t;
      }
    })(e, t + 1, r);
    if (!n) return;
    let s = n.data,
      a = n.index,
      l = s.search(/\s/),
      o = s,
      u = !0;
    -1 !== l && ((o = s.substring(0, l)), (s = s.substring(l + 1).trimStart()));
    let c = o;
    if (i) {
      let e = o.indexOf(':');
      -1 !== e && (u = (o = o.substr(e + 1)) !== n.data.substr(e + 1));
    }
    return {
      tagName: o,
      tagExp: s,
      closeIndex: a,
      attrExpPresent: u,
      rawTagName: c,
    };
  }
  function rq(e, t, i) {
    let r = i,
      n = 1;
    for (; i < e.length; i++)
      if ('<' === e[i])
        if ('/' === e[i + 1]) {
          let s = rY(e, '>', i, `${t} is not closed`);
          if (e.substring(i + 2, s).trim() === t && 0 == --n)
            return { tagContent: e.substring(r, i), i: s };
          i = s;
        } else if ('?' === e[i + 1])
          i = rY(e, '?>', i + 1, 'StopNode is not closed.');
        else if ('!--' === e.substr(i + 1, 3))
          i = rY(e, '--\x3e', i + 3, 'StopNode is not closed.');
        else if ('![' === e.substr(i + 1, 2))
          i = rY(e, ']]>', i, 'StopNode is not closed.') - 2;
        else {
          let r = rQ(e, i, '>');
          r &&
            ((r && r.tagName) === t &&
              '/' !== r.tagExp[r.tagExp.length - 1] &&
              n++,
            (i = r.closeIndex));
        }
  }
  function rG(e, t, i) {
    if (t && 'string' == typeof e) {
      let t = e.trim();
      return (
        'true' === t ||
        ('false' !== t &&
          (function (e, t = {}) {
            if (((t = Object.assign({}, rD, t)), !e || 'string' != typeof e))
              return e;
            let i = e.trim();
            if (void 0 !== t.skipLike && t.skipLike.test(i)) return e;
            {
              if ('0' === e) return 0;
              if (t.hex && rA.test(i)) {
                var r,
                  n = i;
                if (parseInt) return parseInt(n, 16);
                if (Number.parseInt) return Number.parseInt(n, 16);
                if (window && window.parseInt) return window.parseInt(n, 16);
                throw Error(
                  'parseInt, Number.parseInt, window.parseInt are not supported',
                );
              }
              if (i.includes('e') || i.includes('E'))
                return (function (e, t, i) {
                  if (!i.eNotation) return e;
                  let r = t.match(rj);
                  if (!r) return e;
                  {
                    let n = r[1] || '',
                      s = -1 === r[3].indexOf('e') ? 'E' : 'e',
                      a = r[2],
                      l = n ? e[a.length + 1] === s : e[a.length] === s;
                    return a.length > 1 && l
                      ? e
                      : 1 === a.length &&
                          (r[3].startsWith(`.${s}`) || r[3][0] === s)
                        ? Number(t)
                        : i.leadingZeros && !l
                          ? Number((t = (r[1] || '') + r[3]))
                          : e;
                  }
                })(e, i, t);
              let s = rC.exec(i);
              if (!s) return e;
              {
                let n = s[1] || '',
                  a = s[2],
                  l =
                    ((r = s[3]) &&
                      -1 !== r.indexOf('.') &&
                      ('.' === (r = r.replace(/0+$/, ''))
                        ? (r = '0')
                        : '.' === r[0]
                          ? (r = '0' + r)
                          : '.' === r[r.length - 1] &&
                            (r = r.substring(0, r.length - 1))),
                    r),
                  o = n ? '.' === e[a.length + 1] : '.' === e[a.length];
                if (!t.leadingZeros && (a.length > 1 || (1 === a.length && !o)))
                  return e;
                {
                  let r = Number(i),
                    s = String(r);
                  if (0 === r) return r;
                  if (-1 !== s.search(/[eE]/))
                    if (t.eNotation) return r;
                    else return e;
                  if (-1 !== i.indexOf('.'))
                    if ('0' === s) return r;
                    else if (s === l) return r;
                    else if (s === `${n}${l}`) return r;
                    else return e;
                  let o = a ? l : i;
                  return a
                    ? o === s || n + o === s
                      ? r
                      : e
                    : o === s || o === n + s
                      ? r
                      : e;
                }
              }
            }
          })(e, i))
      );
    }
    return void 0 !== e ? e : '';
  }
  function rH(e, t, i) {
    let r = Number.parseInt(e, t);
    return r >= 0 && r <= 1114111 ? String.fromCodePoint(r) : i + e + ';';
  }
  let rZ = rx.getMetaDataSymbol(),
    rX = { allowBooleanAttributes: !1, unpairedTags: [] };
  function rK(e) {
    return ' ' === e || '	' === e || '\n' === e || '\r' === e;
  }
  function rJ(e, t) {
    let i = t;
    for (; t < e.length; t++)
      if ('?' == e[t] || ' ' == e[t]) {
        let r = e.substr(i, t - i);
        if (t > 5 && 'xml' === r)
          return r4(
            'InvalidXml',
            'XML declaration allowed only at the start of the document.',
            r3(e, t),
          );
        if ('?' != e[t] || '>' != e[t + 1]) continue;
        t++;
        break;
      }
    return t;
  }
  function r0(e, t) {
    if (e.length > t + 5 && '-' === e[t + 1] && '-' === e[t + 2]) {
      for (t += 3; t < e.length; t++)
        if ('-' === e[t] && '-' === e[t + 1] && '>' === e[t + 2]) {
          t += 2;
          break;
        }
    } else if (
      e.length > t + 8 &&
      'D' === e[t + 1] &&
      'O' === e[t + 2] &&
      'C' === e[t + 3] &&
      'T' === e[t + 4] &&
      'Y' === e[t + 5] &&
      'P' === e[t + 6] &&
      'E' === e[t + 7]
    ) {
      let i = 1;
      for (t += 8; t < e.length; t++)
        if ('<' === e[t]) i++;
        else if ('>' === e[t] && 0 == --i) break;
    } else if (
      e.length > t + 9 &&
      '[' === e[t + 1] &&
      'C' === e[t + 2] &&
      'D' === e[t + 3] &&
      'A' === e[t + 4] &&
      'T' === e[t + 5] &&
      'A' === e[t + 6] &&
      '[' === e[t + 7]
    ) {
      for (t += 8; t < e.length; t++)
        if (']' === e[t] && ']' === e[t + 1] && '>' === e[t + 2]) {
          t += 2;
          break;
        }
    }
    return t;
  }
  let r1 = RegExp(
    '(\\s*)([^\\s=]+)(\\s*=)?(\\s*([\'"])(([\\s\\S])*?)\\5)?',
    'g',
  );
  function r2(e, t) {
    let i = rS(e, r1),
      r = {};
    for (let e = 0; e < i.length; e++) {
      if (0 === i[e][1].length)
        return r4(
          'InvalidAttr',
          "Attribute '" + i[e][2] + "' has no space in starting.",
          r5(i[e]),
        );
      if (void 0 !== i[e][3] && void 0 === i[e][4])
        return r4(
          'InvalidAttr',
          "Attribute '" + i[e][2] + "' is without value.",
          r5(i[e]),
        );
      if (void 0 === i[e][3] && !t.allowBooleanAttributes)
        return r4(
          'InvalidAttr',
          "boolean attribute '" + i[e][2] + "' is not allowed.",
          r5(i[e]),
        );
      let n = i[e][2];
      if (!rE(n))
        return r4(
          'InvalidAttr',
          "Attribute '" + n + "' is an invalid name.",
          r5(i[e]),
        );
      if (r.hasOwnProperty(n))
        return r4(
          'InvalidAttr',
          "Attribute '" + n + "' is repeated.",
          r5(i[e]),
        );
      r[n] = 1;
    }
    return !0;
  }
  function r4(e, t, i) {
    return { err: { code: e, msg: t, line: i.line || i, col: i.col } };
  }
  function r3(e, t) {
    let i = e.substring(0, t).split(/\r?\n/);
    return { line: i.length, col: i[i.length - 1].length + 1 };
  }
  function r5(e) {
    return e.startIndex + e[1].length;
  }
  class r7 {
    constructor(e) {
      ((this.externalEntities = {}), (this.options = Object.assign({}, rv, e)));
    }
    parse(e, t) {
      if ('string' != typeof e && e.toString) e = e.toString();
      else if ('string' != typeof e)
        throw Error('XML data is accepted in String or Bytes[] form.');
      if (t) {
        !0 === t && (t = {});
        let i = (function (e, t) {
          t = Object.assign({}, rX, t);
          let i = [],
            r = !1,
            n = !1;
          '\uFEFF' === e[0] && (e = e.substr(1));
          for (let s = 0; s < e.length; s++)
            if ('<' === e[s] && '?' === e[s + 1]) {
              if (((s += 2), (s = rJ(e, s)).err)) return s;
            } else if ('<' === e[s]) {
              let a = s;
              if ('!' === e[++s]) {
                s = r0(e, s);
                continue;
              }
              {
                let l = !1;
                '/' === e[s] && ((l = !0), s++);
                let o = '';
                for (
                  ;
                  s < e.length &&
                  '>' !== e[s] &&
                  ' ' !== e[s] &&
                  '	' !== e[s] &&
                  '\n' !== e[s] &&
                  '\r' !== e[s];
                  s++
                )
                  o += e[s];
                if (
                  ('/' === (o = o.trim())[o.length - 1] &&
                    ((o = o.substring(0, o.length - 1)), s--),
                  !rE(o))
                )
                  return r4(
                    'InvalidTag',
                    0 === o.trim().length
                      ? "Invalid space after '<'."
                      : "Tag '" + o + "' is an invalid name.",
                    r3(e, s),
                  );
                let u = (function (e, t) {
                  let i = '',
                    r = '',
                    n = !1;
                  for (; t < e.length; t++) {
                    if ('"' === e[t] || "'" === e[t])
                      '' === r ? (r = e[t]) : r !== e[t] || (r = '');
                    else if ('>' === e[t] && '' === r) {
                      n = !0;
                      break;
                    }
                    i += e[t];
                  }
                  return '' === r && { value: i, index: t, tagClosed: n };
                })(e, s);
                if (!1 === u)
                  return r4(
                    'InvalidAttr',
                    "Attributes for '" + o + "' have open quote.",
                    r3(e, s),
                  );
                let c = u.value;
                if (((s = u.index), '/' === c[c.length - 1])) {
                  let i = s - c.length,
                    n = r2((c = c.substring(0, c.length - 1)), t);
                  if (!0 !== n)
                    return r4(n.err.code, n.err.msg, r3(e, i + n.err.line));
                  r = !0;
                } else if (l)
                  if (!u.tagClosed)
                    return r4(
                      'InvalidTag',
                      "Closing tag '" + o + "' doesn't have proper closing.",
                      r3(e, s),
                    );
                  else {
                    if (c.trim().length > 0)
                      return r4(
                        'InvalidTag',
                        "Closing tag '" +
                          o +
                          "' can't have attributes or invalid starting.",
                        r3(e, a),
                      );
                    if (0 === i.length)
                      return r4(
                        'InvalidTag',
                        "Closing tag '" + o + "' has not been opened.",
                        r3(e, a),
                      );
                    let t = i.pop();
                    if (o !== t.tagName) {
                      let i = r3(e, t.tagStartPos);
                      return r4(
                        'InvalidTag',
                        "Expected closing tag '" +
                          t.tagName +
                          "' (opened in line " +
                          i.line +
                          ', col ' +
                          i.col +
                          ") instead of closing tag '" +
                          o +
                          "'.",
                        r3(e, a),
                      );
                    }
                    0 == i.length && (n = !0);
                  }
                else {
                  let l = r2(c, t);
                  if (!0 !== l)
                    return r4(
                      l.err.code,
                      l.err.msg,
                      r3(e, s - c.length + l.err.line),
                    );
                  if (!0 === n)
                    return r4(
                      'InvalidXml',
                      'Multiple possible root nodes found.',
                      r3(e, s),
                    );
                  (-1 !== t.unpairedTags.indexOf(o) ||
                    i.push({ tagName: o, tagStartPos: a }),
                    (r = !0));
                }
                for (s++; s < e.length; s++)
                  if ('<' === e[s])
                    if ('!' === e[s + 1]) {
                      s = r0(e, ++s);
                      continue;
                    } else if ('?' === e[s + 1]) {
                      if ((s = rJ(e, ++s)).err) return s;
                    } else break;
                  else if ('&' === e[s]) {
                    let t = (function (e, t) {
                      if (';' === e[++t]) return -1;
                      if ('#' === e[t]) {
                        var i = ++t;
                        let r = /\d/;
                        for (
                          'x' === e[i] && (i++, (r = /[\da-fA-F]/));
                          i < e.length;
                          i++
                        ) {
                          if (';' === e[i]) return i;
                          if (!e[i].match(r)) break;
                        }
                        return -1;
                      }
                      let r = 0;
                      for (; t < e.length; t++, r++)
                        if (!e[t].match(/\w/) || !(r < 20)) {
                          if (';' === e[t]) break;
                          return -1;
                        }
                      return t;
                    })(e, s);
                    if (-1 == t)
                      return r4(
                        'InvalidChar',
                        "char '&' is not expected.",
                        r3(e, s),
                      );
                    s = t;
                  } else if (!0 === n && !rK(e[s]))
                    return r4('InvalidXml', 'Extra text at the end', r3(e, s));
                '<' === e[s] && s--;
              }
            } else {
              if (rK(e[s])) continue;
              return r4(
                'InvalidChar',
                "char '" + e[s] + "' is not expected.",
                r3(e, s),
              );
            }
          return r
            ? 1 == i.length
              ? r4(
                  'InvalidTag',
                  "Unclosed tag '" + i[0].tagName + "'.",
                  r3(e, i[0].tagStartPos),
                )
              : !(i.length > 0) ||
                r4(
                  'InvalidXml',
                  "Invalid '" +
                    JSON.stringify(
                      i.map((e) => e.tagName),
                      null,
                      4,
                    ).replace(/\r?\n/g, '') +
                    "' found.",
                  { line: 1, col: 1 },
                )
            : r4('InvalidXml', 'Start tag expected.', 1);
        })(e, t);
        if (!0 !== i) throw Error(`${i.err.msg}:${i.err.line}:${i.err.col}`);
      }
      let i = new rz(this.options);
      i.addExternalEntities(this.externalEntities);
      let r = i.parseXml(e);
      return this.options.preserveOrder || void 0 === r
        ? r
        : (function e(t, i, r) {
            let n,
              s = {};
            for (let a = 0; a < t.length; a++) {
              let l = t[a],
                o = (function (e) {
                  let t = Object.keys(e);
                  for (let e = 0; e < t.length; e++) {
                    let i = t[e];
                    if (':@' !== i) return i;
                  }
                })(l),
                u = '';
              if (((u = void 0 === r ? o : r + '.' + o), o === i.textNodeName))
                void 0 === n ? (n = l[o]) : (n += '' + l[o]);
              else if (void 0 === o) continue;
              else if (l[o]) {
                let t = e(l[o], i, u),
                  r = (function (e, t) {
                    let { textNodeName: i } = t,
                      r = Object.keys(e).length;
                    return (
                      0 === r ||
                      (1 === r &&
                        (!!e[i] || 'boolean' == typeof e[i] || 0 === e[i]))
                    );
                  })(t, i);
                (void 0 !== l[rZ] && (t[rZ] = l[rZ]),
                  l[':@']
                    ? (function (e, t, i, r) {
                        if (t) {
                          let n = Object.keys(t),
                            s = n.length;
                          for (let a = 0; a < s; a++) {
                            let s = n[a];
                            r.isArray(s, i + '.' + s, !0, !0)
                              ? (e[s] = [t[s]])
                              : (e[s] = t[s]);
                          }
                        }
                      })(t, l[':@'], u, i)
                    : 1 !== Object.keys(t).length ||
                        void 0 === t[i.textNodeName] ||
                        i.alwaysCreateTextNode
                      ? 0 === Object.keys(t).length &&
                        (i.alwaysCreateTextNode
                          ? (t[i.textNodeName] = '')
                          : (t = ''))
                      : (t = t[i.textNodeName]),
                  void 0 !== s[o] && s.hasOwnProperty(o)
                    ? (Array.isArray(s[o]) || (s[o] = [s[o]]), s[o].push(t))
                    : i.isArray(o, u, r)
                      ? (s[o] = [t])
                      : (s[o] = t));
              }
            }
            return (
              'string' == typeof n
                ? n.length > 0 && (s[i.textNodeName] = n)
                : void 0 !== n && (s[i.textNodeName] = n),
              s
            );
          })(r, this.options);
    }
    addEntity(e, t) {
      if (-1 !== t.indexOf('&')) throw Error("Entity value can't have '&'");
      if (-1 !== e.indexOf('&') || -1 !== e.indexOf(';'))
        throw Error(
          "An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'",
        );
      if ('&' === t) throw Error("An entity with value '&' is not permitted");
      this.externalEntities[e] = t;
    }
    static getMetaDataSymbol() {
      return rx.getMetaDataSymbol();
    }
  }
  function r8(e, t, i = !1) {
    let r = '',
      n = [],
      s = !1;
    return (
      e.forEach((e) => {
        let a = !1,
          l = [e];
        for (let o of (e[':@'] &&
          'x-bg' === e[':@']['@_role'] &&
          ((a = !0), (l = e.span)),
        l))
          if (o['#text'] && (!i || l.length <= 1)) {
            r += o['#text'];
            let e = n[n.length - 1];
            n.push({
              startTimeMs: e ? e.startTimeMs + e.durationMs : t,
              durationMs: 0,
              words: o['#text'],
              isBackground: a,
            });
          } else if (o.span) {
            let e = o.span[0]['#text'],
              t = ii(o[':@']?.['@_begin']),
              i = ii(o[':@']?.['@_end']);
            (n.push({
              startTimeMs: t,
              durationMs: i - t,
              isBackground: a,
              words: e,
            }),
              (r += e),
              (s = !0));
          }
      }),
      s || (n = []),
      { parts: n, text: r, isWordSynced: s }
    );
  }
  async function r6(e, t) {
    let i = new r7({
        ignoreAttributes: !1,
        attributeNamePrefix: '@_',
        attributesGroupName: !1,
        textNodeName: '#text',
        trimValues: !1,
        removeNSPrefix: !0,
        preserveOrder: !0,
        allowBooleanAttributes: !0,
        parseAttributeValue: !1,
        parseTagValue: !1,
      }),
      r = await i.parse(e),
      n = new Map(),
      s = r[0].tt,
      a = s.find((e) => e.head).head,
      l = s.find((e) => e.body),
      o = l.body,
      u = l[':@'],
      c = (function (e) {
        let t = new Map();
        if (!e || 0 === e.length) return t;
        let i = e.filter((e) => 'agent' in e && e[':@']),
          r = 0;
        return (
          i.forEach((e) => {
            let i = e[':@']?.['@_id'],
              n = e[':@']?.['@_type'];
            i &&
              ('person' === n || 'character' === n
                ? (r++, t.set(i, `v${r}`))
                : t.set(i, 'v1000'));
          }),
          t
        );
      })(a[0].metadata),
      d = o.flatMap((e) => e.div);
    if (!(d.length > 0 && void 0 !== d[0][':@'])) {
      ((t.sourceMap['bLyrics-richsynced'].lyricSourceResult = null),
        (t.sourceMap['bLyrics-richsynced'].filled = !0),
        (t.sourceMap['bLyrics-synced'].lyricSourceResult = null),
        (t.sourceMap['bLyrics-synced'].filled = !0));
      return;
    }
    let h = !1;
    d.forEach((e) => {
      let t = e[':@'],
        i = ii(t?.['@_begin']),
        r = ii(t?.['@_end']),
        s = r8(e.p, i);
      s.isWordSynced && (h = !0);
      let a = t?.['@_agent'],
        l = a ? (c.get(a) ?? a) : void 0;
      n.set(t?.['@_key'] || n.size.toString(), {
        agent: l,
        durationMs: r - i,
        parts: s.parts,
        startTimeMs: i,
        words: s.text,
        romanization: void 0,
        timedRomanization: void 0,
        translation: void 0,
      });
    });
    let p = a[0].metadata,
      m = (e) => {
        let t = p.find((t) => e in t);
        if (t?.[e]) return t[e];
        for (let t of p)
          for (let i of Object.values(t))
            if (Array.isArray(i)) {
              let t = i.find(
                (t) => 'object' == typeof t && null !== t && e in t,
              );
              if (t?.[e]) return t[e];
            }
        return null;
      },
      g = m('translations'),
      f = m('transliterations');
    if (g && g.length > 0) {
      let e = g[0][':@']['@_lang'];
      g[0].translation.forEach((t) => {
        let i = t.text[0]['#text'],
          r = t[':@']['@_for'];
        if (e && i && r) {
          let t = n.get(r);
          t && (t.translation = { text: i, lang: e });
        }
      });
    }
    f &&
      f.length > 0 &&
      f[0].transliteration.forEach((e) => {
        let t = e[':@']['@_for'];
        if (t) {
          let i = n.get(t),
            r = i.startTimeMs,
            s = r8(e.text, r, !1);
          ((i.romanization = s.text), (i.timedRomanization = s.parts));
        }
      });
    let y = Array.from(n.values());
    y = (function (e, t) {
      if (0 === e.length) return e;
      let i = [],
        r = (e, t) => ({
          startTimeMs: e,
          durationMs: t,
          words: '',
          parts: [],
          isInstrumental: !0,
        });
      e[0].startTimeMs > 5e3 && i.push(r(0, e[0].startTimeMs));
      for (let t = 0; t < e.length; t++)
        if ((i.push(e[t]), t < e.length - 1)) {
          let n = e[t].startTimeMs + e[t].durationMs,
            s = e[t + 1].startTimeMs - n;
          s > 5e3 && i.push(r(n, s));
        }
      let n = e[e.length - 1],
        s = n.startTimeMs + n.durationMs,
        a = t - s;
      return (a > 5e3 && i.push(r(s, a)), i);
    })(y, ii(u['@_dur']));
    let b = {
      cacheAllowed: !0,
      language: r[0][':@']['@_lang'] || u['@_lang'],
      lyrics: y,
      musicVideoSynced: !1,
      source: 'boidu.dev',
      sourceHref: 'https://boidu.dev/',
    };
    (h
      ? ((t.sourceMap['bLyrics-richsynced'].lyricSourceResult = b),
        (t.sourceMap['bLyrics-synced'].lyricSourceResult = null))
      : ((t.sourceMap['bLyrics-richsynced'].lyricSourceResult = null),
        (t.sourceMap['bLyrics-synced'].lyricSourceResult = b)),
      (t.sourceMap['bLyrics-synced'].filled = !0),
      (t.sourceMap['bLyrics-richsynced'].filled = !0));
  }
  async function r9(e) {
    let t = new URL('https://lyrics-api.boidu.dev/getLyrics');
    (t.searchParams.append('s', e.song),
      t.searchParams.append('a', e.artist),
      t.searchParams.append('d', String(e.duration)),
      null != e.album && t.searchParams.append('al', e.album));
    let i = await fetch(t.toString(), {
      signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
    });
    if (!i.ok) {
      ((e.sourceMap['bLyrics-richsynced'].filled = !0),
        (e.sourceMap['bLyrics-richsynced'].lyricSourceResult = null),
        (e.sourceMap['bLyrics-synced'].filled = !0),
        (e.sourceMap['bLyrics-synced'].lyricSourceResult = null));
      return;
    }
    let r = await i.json().then((e) => e.ttml);
    await r6(r, e);
  }
  async function ne(e) {
    async function t(e = !1) {
      if (e)
        (tU(C, 'Forcing new token, removing any existing one.'),
          await chrome.storage.local.remove('jwtToken'));
      else {
        let e = await tk(['jwtToken']);
        if (e.jwtToken)
          if (
            !(function (e) {
              try {
                let t = e.split('.')[1];
                if (!t) return !0;
                let i = t.replace(/-/g, '+').replace(/_/g, '/'),
                  r = atob(i),
                  n = JSON.parse(r).exp;
                if (!n) return !0;
                return Date.now() / 1e3 > n;
              } catch (e) {
                return (
                  console.error(C, 'Error decoding JWT on client-side:', e),
                  !0
                );
              }
            })(e.jwtToken)
          )
            return (
              tU(C, 'Using valid, non-expired JWT for bypass.'),
              e.jwtToken
            );
          else
            (tU(C, 'Local JWT has expired. Removing and requesting a new one.'),
              await chrome.storage.local.remove('jwtToken'));
      }
      try {
        tU(C, 'No valid JWT found, initiating Turnstile challenge...');
        let e = await new Promise((e, t) => {
            let i = document.createElement('iframe');
            ((i.src = 'https://lyrics.api.dacubeking.com/challenge'),
              (i.style.position = 'fixed'),
              (i.style.bottom =
                'calc(20px + var(--ytmusic-player-bar-height))'),
              (i.style.right = '20px'),
              (i.style.width = '0px'),
              (i.style.height = '0px'),
              (i.style.border = 'none'),
              (i.style.zIndex = '999999'),
              document.body.appendChild(i));
            let r = (r) => {
                if (r.source === i.contentWindow)
                  switch (r.data.type) {
                    case 'turnstile-token':
                      (tU(C, 'Received Success Token:', r.data.token),
                        n(),
                        e(r.data.token));
                      break;
                    case 'turnstile-error':
                      (console.error(
                        C,
                        'Received Challenge Error:',
                        r.data.error,
                      ),
                        n(),
                        t(
                          Error(
                            `${C} Turnstile challenge error: ${r.data.error}`,
                          ),
                        ));
                      break;
                    case 'turnstile-expired':
                      (console.warn(C, 'Token expired. Resetting challenge.'),
                        i.contentWindow.postMessage(
                          { type: 'reset-turnstile' },
                          '*',
                        ));
                      break;
                    case 'turnstile-timeout':
                      (console.warn(C, 'Challenge timed out.'),
                        n(),
                        t(Error(`${C} Turnstile challenge timed out.`)));
                  }
              },
              n = () => {
                (window.removeEventListener('message', r),
                  document.body.contains(i) && document.body.removeChild(i));
              };
            window.addEventListener('message', r);
          }),
          t = await fetch(T + 'verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: e }),
            credentials: 'include',
          });
        if (!t.ok) throw Error(`API verification failed: ${t.statusText}`);
        let i = (await t.json()).jwt;
        if (!i) throw Error('No JWT returned from API after verification.');
        return (
          await chrome.storage.local.set({ jwtToken: i }),
          tU(C, 'New JWT received and stored.'),
          i
        );
      } catch (e) {
        return (console.error(C, 'Authentication process failed:', e), null);
      }
    }
    async function i(t) {
      let i = new URL(T + 'lyrics');
      return (
        i.searchParams.append('song', e.song),
        i.searchParams.append('artist', e.artist),
        i.searchParams.append('duration', String(e.duration)),
        i.searchParams.append('videoId', e.videoId),
        e.album && i.searchParams.append('album', e.album),
        i.searchParams.append(
          'alwaysFetchMetadata',
          String(e.alwaysFetchMetadata),
        ),
        await fetch(i.toString(), {
          signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
          headers: { Authorization: `Bearer ${t}` },
          credentials: 'include',
        })
      );
    }
    let r = await t();
    if (!r) {
      (console.error(
        C,
        'Could not obtain an initial authentication token. Aborting lyrics fetch.',
      ),
        [
          'musixmatch-synced',
          'musixmatch-richsync',
          'lrclib-synced',
          'lrclib-plain',
        ].forEach((t) => {
          e.sourceMap[t].filled = !0;
        }));
      return;
    }
    let n = await i(r);
    if (403 === n.status) {
      if (
        (console.warn(
          C,
          'Request was blocked (403 Forbidden), possibly by WAF. Forcing new Turnstile challenge.',
        ),
        !(r = await t(!0)))
      ) {
        (console.error(
          C,
          'Could not obtain a new token after WAF block. Aborting.',
        ),
          [
            'musixmatch-synced',
            'musixmatch-richsync',
            'lrclib-synced',
            'lrclib-plain',
          ].forEach((t) => {
            e.sourceMap[t].filled = !0;
          }));
        return;
      }
      (tU(C, 'Retrying API call with new token...'), (n = await i(r)));
    }
    if (!n.ok) {
      (console.error(C, `API request failed with status: ${n.status}`),
        [
          'musixmatch-synced',
          'musixmatch-richsync',
          'lrclib-synced',
          'lrclib-plain',
        ].forEach((t) => {
          e.sourceMap[t].filled = !0;
        }));
      return;
    }
    let s = await n.json();
    if (
      (s.album && tU(C, 'Found Album: ' + s.album),
      s.musixmatchWordByWordLyrics)
    ) {
      let t = ir(s.musixmatchWordByWordLyrics, Number(e.duration));
      (!(function (e) {
        for (let t of e)
          if (t.parts)
            for (let e = 1; e < t.parts.length; e++) {
              let i = t.parts[e],
                r = t.parts[e - 1];
              if (
                ' ' === i.words &&
                ' ' !== r.words &&
                (15 >= Math.abs(i.durationMs - r.durationMs) ||
                  i.durationMs <= 100)
              ) {
                let e = i.durationMs;
                ((r.durationMs += e),
                  (i.durationMs -= e),
                  (i.startTimeMs += e));
              }
            }
        let t = 0,
          i = 0;
        for (let r of e)
          if (r.parts && 0 !== r.parts.length)
            for (let e = 0; e < r.parts.length - 2; e++) {
              let n = r.parts[e];
              ' ' !== n.words && (n.durationMs <= 100 && t++, i++);
            }
        if (i > 0 && t / i > 0.5) {
          tU('Found a lot of short duration lyrics, fudging durations');
          for (let t = 0; t < e.length; t++) {
            let i = e[t];
            if (i.parts && 0 !== i.parts.length)
              for (let r = 0; r < i.parts.length; r++) {
                let n = i.parts[r];
                if (' ' !== n.words && n.durationMs <= 400) {
                  let s;
                  null ===
                  (s =
                    r + 1 < i.parts.length
                      ? i.parts[r + 1]
                      : t + 1 < i.parts.length &&
                          e[t + 1].parts &&
                          e[t + 1].parts.length > 0
                        ? e[t + 1].parts[0]
                        : null)
                    ? (n.durationMs = 300)
                    : ' ' === s.words
                      ? ((n.durationMs += s.durationMs),
                        (s.startTimeMs += s.durationMs),
                        (s.durationMs = 0))
                      : (n.durationMs = s.startTimeMs - n.startTimeMs);
                }
              }
          }
        }
      })(t),
        (e.sourceMap['musixmatch-richsync'].lyricSourceResult = {
          lyrics: t,
          source: 'Musixmatch',
          sourceHref: 'https://www.musixmatch.com',
          musicVideoSynced: !1,
          album: s.album,
          artist: s.artist,
          song: s.song,
          duration: s.duration,
          cacheAllowed: !0,
        }));
    } else
      e.sourceMap['musixmatch-richsync'].lyricSourceResult = {
        lyrics: null,
        source: 'Musixmatch',
        sourceHref: 'https://www.musixmatch.com',
        musicVideoSynced: !1,
        album: s.album,
        artist: s.artist,
        song: s.song,
        duration: s.duration,
        cacheAllowed: !0,
      };
    if (s.musixmatchSyncedLyrics) {
      let t = ir(s.musixmatchSyncedLyrics, Number(e.duration));
      e.sourceMap['musixmatch-synced'].lyricSourceResult = {
        lyrics: t,
        source: 'Musixmatch',
        sourceHref: 'https://www.musixmatch.com',
        musicVideoSynced: !1,
      };
    }
    if (s.lrclibSyncedLyrics) {
      let t = ir(s.lrclibSyncedLyrics, Number(e.duration));
      e.sourceMap['lrclib-synced'].lyricSourceResult = {
        lyrics: t,
        source: 'LRCLib',
        sourceHref: 'https://lrclib.net',
        musicVideoSynced: !1,
      };
    }
    if (s.lrclibPlainLyrics) {
      let t = is(s.lrclibPlainLyrics);
      e.sourceMap['lrclib-plain'].lyricSourceResult = {
        lyrics: t,
        source: 'LRCLib',
        sourceHref: 'https://lrclib.net',
        musicVideoSynced: !1,
        cacheAllowed: !1,
      };
    }
    if (s.goLyricsApiTtml) {
      let t = JSON.parse(s.goLyricsApiTtml);
      await r6(t.ttml, e);
    }
    [
      'musixmatch-synced',
      'musixmatch-richsync',
      'lrclib-synced',
      'lrclib-plain',
      'bLyrics-richsynced',
      'bLyrics-synced',
    ].forEach((t) => {
      e.sourceMap[t].filled = !0;
    });
  }
  async function nt(e) {
    let t = new URL('https://lrclib.net/api/get');
    (t.searchParams.append('track_name', e.song),
      t.searchParams.append('artist_name', e.artist),
      e.album && t.searchParams.append('album_name', e.album),
      t.searchParams.append('duration', String(e.duration)));
    let i = await fetch(t.toString(), {
      headers: {
        'Lrclib-Client':
          'BetterLyrics Extension (https://github.com/better-lyrics/better-lyrics)',
      },
      signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
    });
    i.ok ||
      ((e.sourceMap['lrclib-synced'].filled = !0),
      (e.sourceMap['lrclib-plain'].filled = !0),
      (e.sourceMap['lrclib-synced'].lyricSourceResult = null),
      (e.sourceMap['lrclib-plain'].lyricSourceResult = null));
    let r = await i.json();
    (r &&
      (tU('[BetterLyrics] Lyrics found from LRCLIB'),
      r.syncedLyrics &&
        (e.sourceMap['lrclib-synced'].lyricSourceResult = {
          lyrics: ir(r.syncedLyrics, r.duration),
          source: 'LRCLib',
          sourceHref: 'https://lrclib.net',
          musicVideoSynced: !1,
        }),
      r.plainLyrics &&
        (e.sourceMap['lrclib-plain'].lyricSourceResult = {
          lyrics: is(r.plainLyrics),
          source: 'LRCLib',
          sourceHref: 'https://lrclib.net',
          musicVideoSynced: !1,
          cacheAllowed: !1,
        })),
      (e.sourceMap['lrclib-synced'].filled = !0),
      (e.sourceMap['lrclib-plain'].filled = !0));
  }
  async function ni(e) {
    let t = await (function (e, t = 250, i) {
      if (il.has(e)) return Promise.resolve(il.get(e));
      let r = 0;
      return new Promise((i) => {
        let n = setInterval(() => {
          if (il.has(e)) {
            (clearInterval(n), i(il.get(e)));
            return;
          }
          let s = io.get(e);
          if (s?.counterpartVideoId && il.has(s.counterpartVideoId)) {
            (clearInterval(n), i(il.get(s.counterpartVideoId)));
            return;
          }
          if (r > t) {
            (clearInterval(n),
              tU('Failed to sniff lyrics'),
              i({ hasLyrics: !1, lyrics: '', sourceText: '' }));
            return;
          }
          r += 1;
        }, 20);
      });
    })(e.videoId);
    if (t.hasLyrics) {
      let i = t.lyrics,
        r = t.sourceText.substring(8) + ' (via YT)',
        n = is(i);
      ((e.sourceMap['yt-lyrics'].lyricSourceResult = {
        lyrics: n,
        text: i,
        source: r,
        sourceHref: '',
        musicVideoSynced: !1,
        cacheAllowed: !1,
      }),
        (e.sourceMap['yt-lyrics'].filled = !0));
    }
  }
  async function nr(e) {
    let t = e.audioTrackData;
    if (!t || 0 === t.captionTracks.length) return;
    let i = null;
    if (1 === t.captionTracks.length) i = t.captionTracks[0].languageCode;
    else
      for (let e in t.captionTracks) {
        let r = t.captionTracks[e];
        if (r.displayName.includes('auto-generated')) {
          i = r.languageCode;
          break;
        }
      }
    i ||
      (tU("Found Caption Tracks, but couldn't determine the default", t),
      (e.sourceMap['yt-captions'].filled = !0),
      (e.sourceMap['yt-captions'].lyricSourceResult = null));
    let r = null;
    for (let e in t.captionTracks) {
      let n = t.captionTracks[e];
      if (!n.displayName.includes('auto-generated') && n.languageCode === i) {
        r = new URL(n.url);
        break;
      }
    }
    if (!r) {
      (tU(
        'Only found auto generated lyrics for youtube captions, not using',
        t,
      ),
        (e.sourceMap['yt-captions'].filled = !0),
        (e.sourceMap['yt-captions'].lyricSourceResult = null));
      return;
    }
    (r = new URL(r)).searchParams.set('fmt', 'json3');
    let n = await fetch(r.toString(), {
        method: 'GET',
        signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
      }).then((e) => e.json()),
      s = [];
    (n.events.forEach((e) => {
      let t = '';
      for (let i in e.segs) t += e.segs[i].utf8;
      for (let e of ((t = t.replace(/\n/g, ' ')),
      '♪\uD834\uDD60\uD834\uDD61\uD834\uDD62\uD834\uDD63\uD834\uDD64'))
        ((t = t.trim()).startsWith(e) && (t = t.substring(1)),
          t.endsWith(e) && (t = t.substring(0, t.length - 1)));
      ((t = t.trim()),
        s.push({
          startTimeMs: e.tStartMs,
          words: t,
          durationMs: e.dDurationMs,
        }));
    }),
      s.every((e) => e.words.toUpperCase() === e.words) &&
        s.every(
          (e) => (
            (e.words =
              e.words.substring(0, 1).toUpperCase() +
              e.words.substring(1).toLowerCase()),
            !0
          ),
        ),
      (e.sourceMap['yt-captions'].filled = !0),
      (e.sourceMap['yt-captions'].lyricSourceResult = {
        lyrics: s,
        language: i,
        source: 'Youtube Captions',
        sourceHref: '',
        musicVideoSynced: !0,
      }));
  }
  async function nn(e) {
    let t = () => {
      ((e.sourceMap['legato-synced'].filled = !0),
        (e.sourceMap['legato-synced'].lyricSourceResult = null));
    };
    try {
      let i = new URL('https://lyrics-api.boidu.dev/kugou/getLyrics');
      (i.searchParams.append('s', e.song),
        i.searchParams.append('a', e.artist),
        i.searchParams.append('d', String(e.duration)),
        e.album && i.searchParams.append('al', e.album));
      let r = await fetch(i.toString(), {
        signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
      });
      if (!r.ok) return void t();
      let n = await r.json();
      if (!n.lyrics) return void t();
      ((e.sourceMap['legato-synced'].lyricSourceResult = {
        lyrics: ir(n.lyrics, 1e3 * e.duration),
        source: 'Better Lyrics Legato',
        sourceHref: 'https://boidu.dev/',
        musicVideoSynced: !1,
      }),
        (e.sourceMap['legato-synced'].filled = !0));
    } catch (e) {
      (tU(j, 'Legato provider error:', e), t());
    }
  }
  let ns = '2.0.0',
    na = [...$].sort((e, t) => e.priority - t.priority).map((e) => e.key);
  function nl(e) {
    return B.includes(e);
  }
  let no = [],
    nu = !1,
    nc = {
      'bLyrics-richsynced': r9,
      'bLyrics-synced': r9,
      'musixmatch-richsync': ne,
      'musixmatch-synced': ne,
      'lrclib-synced': nt,
      'lrclib-plain': nt,
      'yt-captions': nr,
      'yt-lyrics': ni,
      'legato-synced': nn,
    };
  function nd() {
    var e;
    return (
      (e = (e) => ({
        filled: !1,
        lyricSourceResult: null,
        resultCached: !1,
        lyricSourceFiller: e,
      })),
      Object.fromEntries(Object.entries(nc).map(([t, i]) => [t, e(i, t)]))
    );
  }
  async function nh(e, t) {
    let i = e.sourceMap[t];
    if (!i.filled) {
      let r = `blyrics_${e.videoId}_${t}`,
        n = await tj(r);
      if (n) {
        let e = JSON.parse(n);
        if (e && e.version && e.version === ns)
          return (
            (i.filled = !0),
            (i.lyricSourceResult = e),
            (i.resultCached = !0),
            e
          );
      }
      await i.lyricSourceFiller(e);
    }
    return (
      na.forEach((t) => {
        let i = e.sourceMap[t];
        i.filled &&
          !i.resultCached &&
          i.lyricSourceResult &&
          !1 !== i.lyricSourceResult.cacheAllowed &&
          ((i.resultCached = !0),
          tz(
            `blyrics_${e.videoId}_${t}`,
            JSON.stringify({ version: ns, ...i.lyricSourceResult }),
            6048e5,
          ));
      }),
      i.lyricSourceResult
    );
  }
  function np(e, t) {
    if (
      t &&
      e &&
      ((e.isMusicVideoSynced = !e.isMusicVideoSynced), 'none' !== e.syncType)
    )
      for (let i of e.lines) {
        i.accumulatedOffsetMs = 1e6;
        let e = 0;
        for (let r of t.segment) {
          let t = 1e3 * i.time;
          if (
            t >= r.counterpartVideoStartTimeMilliseconds &&
            ((e =
              r.primaryVideoStartTimeMilliseconds -
              r.counterpartVideoStartTimeMilliseconds),
            t <=
              r.counterpartVideoStartTimeMilliseconds + r.durationMilliseconds)
          )
            break;
        }
        let r = e / 1e3;
        ((i.time = i.time + r),
          (i.lyricElement.dataset.time = String(i.time)),
          i.parts.forEach((e) => {
            ((e.time = e.time + r),
              (e.lyricElement.dataset.time = String(e.time)));
          }));
      }
  }
  async function nm(e, t) {
    let i = e.song,
      r = e.artist,
      n = e.videoId,
      s = Number(e.duration),
      a = e.audioTrackData,
      o = 0 !== e.contentRect.width && 0 !== e.contentRect.height;
    if (!n) return void tU(R, 'Invalid video id');
    let u = !1;
    try {
      let c,
        d = await id(n, 1, t),
        h = !1,
        p =
          (d &&
            d.counterpartVideoId &&
            d.counterpartVideoId === nf.lastLoadedVideoId) ||
          nf.lastLoadedVideoId === n,
        m = d?.segmentMap || null;
      (p && m
        ? (np(nf.lyricData, m),
          (nf.suppressZeroTime = Date.now() + 5e3),
          (nf.areLyricsTicking = !0),
          tU('Switching between audio/video: Skipping Loader', m))
        : (tU('Not Switching between audio/video', p, m),
          iU(),
          (u = !0),
          tQ(),
          (d = await id(n, 250, t)),
          (m = d?.segmentMap || null),
          (nf.areLyricsLoaded = !1),
          (nf.areLyricsTicking = !1),
          (nf.suppressZeroTime = 0)),
        o &&
          d &&
          d.counterpartVideoId &&
          d.segmentMap &&
          (tU('Switching VideoId to Audio Id'),
          (h = !0),
          (n = d.counterpartVideoId)));
      let g = document.getElementsByClassName(l)[1];
      if (
        (console.assert(null != g), 'true' !== g.getAttribute('aria-selected'))
      ) {
        ((nf.areLyricsLoaded = !1),
          (nf.areLyricsTicking = !1),
          (nf.lyricInjectionFailed = !0),
          tU(
            '[BetterLyrics] (Safe to ignore) Lyrics tab is hidden, skipping lyrics fetch',
          ));
        return;
      }
      ((i = i.trim()), (r = (r = r.trim()).replace(', & ', ', ')));
      let f = await ih(n, t);
      if ((f || (f = ''), !i || !r))
        return void tU(R, 'Empty song or artist name');
      if (t.aborted) return;
      tU('[BetterLyrics] Fetching lyrics for:', i, r);
      let y = null,
        b = nd(),
        M = {
          song: i,
          artist: r,
          duration: s,
          videoId: n,
          audioTrackData: a,
          album: f,
          sourceMap: b,
          alwaysFetchMetadata: h,
          signal: t,
        },
        v = nh(M, 'yt-lyrics').then((e) => {
          if (!nf.areLyricsLoaded && e && !t.aborted) {
            tU(
              C,
              'Temporarily Using YT Music Lyrics while we wait for synced lyrics to load',
            );
            let i = {
              ...e,
              song: M.song,
              artist: M.artist,
              duration: M.duration,
              videoId: M.videoId,
              album: M.album || '',
              segmentMap: null,
            };
            rg(i, !0, t);
          }
          return e;
        });
      try {
        let e = await nh(M, 'musixmatch-richsync');
        (e &&
          e.album &&
          e.album.length > 0 &&
          f !== e.album &&
          (M.album = e.album),
          e &&
            e.song &&
            e.song.length > 0 &&
            i !== e.song &&
            (tU("Using '" + e.song + "' for song instead of '" + i + "'"),
            (M.song = e.song)),
          e &&
            e.artist &&
            e.artist.length > 0 &&
            r !== e.artist &&
            (tU("Using '" + e.artist + "' for artist instead of '" + r + "'"),
            (M.artist = e.artist)),
          e &&
            e.duration &&
            s !== e.duration &&
            (tU(
              "Using '" + e.duration + "' for duration instead of '" + s + "'",
            ),
            (M.duration = e.duration)));
      } catch (e) {
        tU(e);
      }
      for (let e of no) {
        if (t.aborted) return;
        try {
          let t = await nh(M, e);
          if (t && t.lyrics && t.lyrics.length > 0) {
            let i = await v;
            if (null !== i) {
              let e = '';
              t.lyrics.forEach((t) => {
                e += t.words + '\n';
              });
              let r = F(e.toLowerCase(), i.text.toLowerCase());
              if (r < 0.5) {
                tU(
                  `Got lyrics from ${t.source}, but they don't match yt lyrics. Rejecting: Match: ${r}%`,
                );
                continue;
              }
            }
            ((y = t), (c = e));
            break;
          }
        } catch (e) {
          tU(e);
        }
      }
      if (
        (y ||
          (y = {
            lyrics: [
              { startTimeMs: 0, words: _('lyrics_notFound'), durationMs: 0 },
            ],
            source: 'Unknown',
            sourceHref: '',
            musicVideoSynced: !1,
            cacheAllowed: !1,
          }),
        !y.lyrics)
      )
        throw Error('Lyrics.lyrics is null or undefined. Report this bug');
      (o === (!0 === y.musicVideoSynced) && (m = null),
        tU('Got Lyrics from ' + y.source));
      let w = {
        song: M.song,
        artist: M.artist,
        album: M.album || '',
        duration: M.duration,
        videoId: M.videoId,
        segmentMap: m,
        providerKey: c,
        ...y,
      };
      if (((nf.lastLoadedVideoId = e.videoId), t.aborted)) return;
      (rg(w, !1, t), (u = !1));
    } finally {
      u && i$();
    }
  }
  async function ng(e, t) {
    tU(C, 'Prefetching next song', e, t);
    let i = e.song,
      r = e.artist,
      n = e.videoId,
      s = Number(e.duration),
      a = new AbortController().signal,
      l = await id(n, 250, a),
      o = !1;
    (t &&
      l &&
      l.counterpartVideoId &&
      l.segmentMap &&
      ((o = !0), (n = l.counterpartVideoId)),
      (i = i.trim()),
      (r = (r = r.trim()).replace(', & ', ', ')));
    let u = await ih(n, a);
    (u || (u = ''), tU('Prefetching for: ', i, r));
    let c = {
      song: i,
      artist: r,
      duration: s,
      videoId: n,
      audioTrackData: null,
      album: u,
      sourceMap: nd(),
      alwaysFetchMetadata: o,
      signal: a,
    };
    try {
      let e = await nh(c, 'musixmatch-richsync');
      (e &&
        e.album &&
        e.album.length > 0 &&
        u !== e.album &&
        (c.album = e.album),
        e && e.song && e.song.length > 0 && i !== e.song && (c.song = e.song),
        e &&
          e.artist &&
          e.artist.length > 0 &&
          r !== e.artist &&
          (c.artist = e.artist),
        e && e.duration && s !== e.duration && (c.duration = e.duration));
    } catch (e) {
      tU(e);
    }
    for (let e of no) {
      if (a.aborted) return;
      try {
        let t = await nh(c, e);
        if (t && t.lyrics && t.lyrics.length > 0) break;
      } catch (e) {
        tU(e);
      }
    }
  }
  let nf = {
    suppressZeroTime: 0,
    areLyricsTicking: !1,
    lyricData: null,
    areLyricsLoaded: !1,
    lyricInjectionFailed: !1,
    lastVideoId: null,
    lastVideoDetails: null,
    lyricInjectionPromise: null,
    queueLyricInjection: !1,
    shouldInjectAlbumArt: 'Unknown',
    queueSongDetailsInjection: !1,
    loaderAnimationEndTimeout: void 0,
    lastLoadedVideoId: null,
    lyricAbortController: null,
    isTranslateEnabled: !1,
    isRomanizationEnabled: !1,
    romanizationDisabledLanguages: [],
    translationDisabledLanguages: [],
    translationLanguage: 'en',
    hasPreloadedNextSong: !1,
    currentInjectionId: 0,
  };
  function ny() {
    (nf.lyricAbortController?.abort('Reloading lyrics'),
      (nf.lastVideoId = null));
  }
  async function nb() {
    (t$(), await iX());
    let e = {
        '--blyrics-text-searching': _('lyrics_searching'),
        '--blyrics-text-still-searching': _('lyrics_stillSearching'),
        '--blyrics-text-no-synced': _('lyrics_noSyncedLyrics'),
        '--blyrics-text-ad-playing': _('lyrics_adPlaying'),
      },
      t = document.documentElement;
    for (let [i, r] of Object.entries(e)) t.style.setProperty(i, `"${r}"`);
    (!(function e() {
      let t = document.querySelector(P),
        i = document.querySelector(v);
      if (!t || !i) return void setTimeout(e, 1e3);
      iP && iP.disconnect();
      let r = document.getElementById(U);
      (r || (((r = document.createElement('div')).id = U), i.prepend(r)),
        i_() && iF(),
        (iP = new MutationObserver(() => {
          i_() ? iF() : iW();
        })).observe(t, { attributes: !0, attributeFilter: [V] }));
    })(),
      (function e() {
        let t = document.getElementsByClassName(l)[1];
        t
          ? (iy && iy.disconnect(),
            t.removeAttribute('disabled'),
            t.setAttribute('aria-disabled', 'false'),
            (iy = new MutationObserver((e) => {
              e.forEach((e) => {
                'disabled' === e.attributeName &&
                  (t.removeAttribute('disabled'),
                  t.setAttribute('aria-disabled', 'false'));
              });
            })).observe(t, { attributes: !0 }))
          : setTimeout(() => {
              e();
            }, 1e3);
      })(),
      iN ||
        ((iN = !0),
        document.addEventListener(
          'keydown',
          (e) => {
            if (
              ('f' !== e.key && 'F' !== e.key) ||
              e.metaKey ||
              e.ctrlKey ||
              e.altKey
            )
              return;
            let t = e.target;
            'INPUT' === t.tagName ||
              'TEXTAREA' === t.tagName ||
              t.isContentEditable ||
              iC(e);
          },
          { capture: !0 },
        ),
        (function e() {
          let t = document.querySelector('ytmusic-app-layout');
          if (!t) return void setTimeout(e, 1e3);
          iM && iM.disconnect();
          let i = !1;
          (iM = new MutationObserver(() => {
            let e = 'FULLSCREEN' === t.getAttribute('player-ui-state');
            (i &&
              !e &&
              (function () {
                if (!t9) return;
                t9 = !1;
                let e = document.querySelector('.toggle-player-page-button');
                e && e.click();
              })(),
              (i = e));
          })).observe(t, {
            attributes: !0,
            attributeFilter: ['player-ui-state'],
          });
        })(),
        (function e() {
          let t = document.querySelector(
            '#song-media-window .fullscreen-button',
          );
          t
            ? t.addEventListener('click', iC, { capture: !0 })
            : setTimeout(e, 1e3);
        })()),
      t7(),
      t1(),
      (function e(t, i) {
        let r = document.querySelector('ytmusic-app-layout');
        if (!r) return void setTimeout(() => e(t, i), 1e3);
        ig && ig.disconnect();
        let n = r.hasAttribute('player-fullscreened');
        (ig = new MutationObserver(() => {
          let e = r.hasAttribute('player-fullscreened');
          (!n && e ? t() : n && !e && i(), (n = e));
        })).observe(r, {
          attributes: !0,
          attributeFilter: ['player-fullscreened'],
        });
      })(
        () => void (iI(), document.addEventListener('visibilitychange', iL)),
        () =>
          void (im && (im.release(), (im = null)),
          document.removeEventListener('visibilitychange', iL)),
      ),
      t8(),
      tZ ||
        ((tZ = !0),
        chrome.storage.onChanged.addListener(async (e, t) => {
          if (
            ('sync' === t || 'local' === t) &&
            e.customCSS &&
            e.customCSS.newValue
          ) {
            let t = e.customCSS.newValue;
            (tI(t) && (t = tx(t)), tX(tA(t)));
          }
          if ('local' === t)
            for (let t of Object.keys(e))
              t.startsWith('storeTheme:') && (await tJ(t, e[t]));
        }),
        tK()),
      await tV(),
      await tR(),
      t0 ||
        ((t0 = !0),
        chrome.runtime.onMessage.addListener((e, t, i) => {
          if (
            (tU(D, 'Received message:', e.action), 'applyStyles' === e.action)
          )
            (tU(
              D,
              'Processing applyStyles, RICS length:',
              e.ricsSource?.length,
            ),
              e.ricsSource
                ? (tU(D, 'Compiling RICS and applying styles'),
                  tX(tA(e.ricsSource)),
                  rb(),
                  tU(D, 'Styles applied successfully'))
                : (tU(D, 'Loading styles from storage'),
                  tK().then(() => {
                    (rb(), tU(D, 'Styles loaded from storage and applied'));
                  })));
          else if ('updateSettings' === e.action)
            (tQ(),
              t$(),
              t7(),
              t1(),
              t8(),
              (nf.shouldInjectAlbumArt = 'Unknown'),
              t4(
                () => {
                  ((nf.shouldInjectAlbumArt = !0), iQ());
                },
                () => {
                  ((nf.shouldInjectAlbumArt = !1), iQ());
                },
              ),
              ny());
          else if ('clearCache' === e.action)
            try {
              (tP(), ny(), i({ success: !0 }));
            } catch {
              i({ success: !1 });
            }
        })),
      (function e() {
        if (iw) return;
        let t = document.getElementsByClassName(
            'tab-content style-scope tp-yt-paper-tab',
          ),
          [i, r, n] = Array.from(t);
        if (void 0 !== i && void 0 !== r && void 0 !== n) {
          iw = !0;
          for (let e = 0; e < t.length; e++)
            t[e].addEventListener('click', () => {
              let t = document.querySelector(v);
              ((iT[ik] = t.scrollTop),
                (t.scrollTop = iT[e]),
                setTimeout(() => {
                  ((t.scrollTop = iT[e]),
                    (nf.areLyricsTicking =
                      nf.areLyricsLoaded &&
                      nf.lyricData?.syncType !== 'none' &&
                      1 === e));
                }, 0),
                (ik = e),
                1 !== e && (nf.areLyricsTicking = !1));
            });
          r.addEventListener('click', () => {
            (ra().classList.remove('blyrics-hidden'),
              nf.areLyricsLoaded ||
                (tU('[BetterLyrics] Lyrics tab clicked, fetching lyrics'),
                iK(),
                iU(),
                ny()));
          });
          let e = () => {
            ra().classList.add('blyrics-hidden');
          };
          (i.addEventListener('click', e), n.addEventListener('click', e));
        } else setTimeout(() => e(), 1e3);
      })(),
      iE ||
        ((iE = !0),
        document.addEventListener('blyrics-send-player-time', (e) => {
          var t, i, r;
          let n,
            s,
            a,
            o,
            u,
            c,
            d = e.detail,
            h = d.videoId,
            p = d.song + ' ' + d.artist;
          if (h !== nf.lastVideoId || p !== nf.lastVideoDetails) {
            let e, t;
            if (
              ((nf.areLyricsTicking = !1),
              (nf.lastVideoId = h),
              (nf.lastVideoDetails = p),
              (iq = null),
              (e = document.getElementById('blyrics-img')) &&
                ((e.src = ''), e.classList.add(I)),
              (t = document.querySelector('#thumbnail>#img')),
              t?.src && nf.shouldInjectAlbumArt && iG(t.src),
              !d.song || !d.artist)
            )
              return void tU(
                'Lyrics switched: Still waiting for metadata ',
                d.videoId,
              );
            (tU('[BetterLyrics] Song has been switched', d.videoId),
              (nf.queueLyricInjection = !0),
              (nf.queueSongDetailsInjection = !0),
              (nf.hasPreloadedNextSong = !1),
              ix?.abort());
            let i = new AbortController();
            ix = i;
            let r = d.videoId;
            id(d.videoId, 250, i.signal).then(async (e) => {
              nf.lastVideoId === r &&
                ((e?.isVideo &&
                  e.counterpartVideoId &&
                  ((e = await id(e.counterpartVideoId, 250, i.signal)),
                  nf.lastVideoId !== r)) ||
                  (e && iZ(e.smallThumbnail)));
            });
          }
          if (
            (nf.areLyricsTicking &&
              nf.areLyricsLoaded &&
              !nf.hasPreloadedNextSong &&
              ((nf.hasPreloadedNextSong = !0),
              tU(C, 'Trying to preload next song'),
              id(nf.lastVideoId).then(async (e) => {
                if (e && e.nextVideoId) {
                  let t = await id(e.nextVideoId);
                  ((!t || t.isVideo) &&
                    e.counterpartVideoId &&
                    (t = await id(e.counterpartVideoId).then((e) =>
                      e?.nextVideoId ? id(e.nextVideoId) : null,
                    )),
                    t &&
                      (await ng(
                        {
                          song: t.title,
                          artist: t.artist,
                          duration: String(Math.round(t.durationMs / 1e3)),
                          videoId: t.id,
                        },
                        t.isVideo,
                      )));
                }
              })),
            nf.queueSongDetailsInjection &&
              d.song &&
              d.artist &&
              document.getElementById('main-panel') &&
              ((nf.queueSongDetailsInjection = !1),
              (t = d.song),
              (i = d.artist),
              console.assert(
                null != (n = document.getElementById('main-panel')),
              ),
              (s = document.getElementById('blyrics-song-info')),
              (a = document.getElementById('blyrics-watermark')),
              s?.remove(),
              a?.remove(),
              ((o = document.createElement('p')).id = 'blyrics-title'),
              (o.textContent = t),
              ((u = document.createElement('p')).id = 'blyrics-artist'),
              (u.textContent = i),
              ((c = document.createElement('div')).id = 'blyrics-song-info'),
              c.appendChild(o),
              c.appendChild(u),
              n.appendChild(c)),
            nf.lyricInjectionFailed)
          ) {
            let e = document.getElementsByClassName(l)[1];
            if (e && 'true' !== e.getAttribute('aria-selected')) return;
          }
          if (nf.queueLyricInjection || nf.lyricInjectionFailed) {
            let e = document.getElementsByClassName(l)[1];
            if (e) {
              ((nf.queueLyricInjection = !1),
                (nf.lyricInjectionFailed = !1),
                'true' !== e.getAttribute('aria-selected') &&
                  tD({ isAutoSwitchEnabled: !1 }, (t) => {
                    t.isAutoSwitchEnabled &&
                      (() => {
                        (e.click(),
                          tU(
                            '[BetterLyrics] Auto switch enabled, switching to lyrics tab',
                          ),
                          ra().classList.remove('blyrics-hidden'));
                      })();
                  }),
                (r = d),
                nf.lyricInjectionPromise &&
                  (nf.lyricAbortController?.abort('New song is being loaded'),
                  i$()),
                nf.currentInjectionId++,
                (nf.lyricAbortController = new AbortController()),
                (nf.lyricInjectionPromise = nm(
                  r,
                  nf.lyricAbortController.signal,
                ).catch((e) => {
                  (tU(j, e),
                    (nf.areLyricsLoaded = !1),
                    (nf.lyricInjectionFailed = !0));
                })));
            }
          }
          (nf.suppressZeroTime < Date.now() || 0 !== d.currentTime) &&
            rr(d.currentTime, d.browserTime, d.playing);
        })),
      (function e() {
        let t = document.getElementById('side-panel');
        t
          ? (ib && ib.disconnect(),
            (ib = new MutationObserver((e) => {
              t2(
                () => {},
                () =>
                  e.forEach((e) => {
                    if ('inert' === e.attributeName) {
                      e.target.removeAttribute('inert');
                      let t = document.getElementsByClassName(l)[1];
                      t &&
                        'true' !== t.getAttribute('aria-selected') &&
                        t.click();
                    }
                  }),
              );
            })).observe(t, { attributes: !0 }),
            t.removeAttribute('inert'))
          : setTimeout(() => {
              e();
            }, 1e3);
      })(),
      (function () {
        if (iS) return;
        iS = !0;
        let e = (e) => {
          let t = document.getElementById(S);
          t &&
            (e
              ? t.setAttribute('blyrics-alt-hover', '')
              : t.removeAttribute('blyrics-alt-hover'));
        };
        (document.addEventListener('keydown', (t) => {
          'Alt' === t.key && e(!0);
        }),
          document.addEventListener('keyup', (t) => {
            'Alt' === t.key && e(!1);
          }),
          window.addEventListener('blur', () => {
            e(!1);
          }));
      })(),
      (function () {
        if (nu) return;
        nu = !0;
        let e = (e) => {
          let t = e ?? [...na];
          na.every((e) => t.includes(e) || t.includes(`d_${e}`)) ||
            ((t = [...na]),
            tU('Invalid preferred provider list, resetting to default'));
          let i = t.filter(nl);
          (tU('[BetterLyrics] Switching to provider = ', i), (no = i));
        };
        (chrome.storage.onChanged.addListener((t, i) => {
          'sync' === i &&
            t.preferredProviderList &&
            e(t.preferredProviderList.newValue);
        }),
          chrome.storage.local.get(
            { preferredProviderList: null },
            function (t) {
              e(t.preferredProviderList);
            },
          ));
      })(),
      (function e() {
        let t = document.querySelector('#av-id > ytmusic-av-toggle');
        if (!t) return void setTimeout(e, 1e3);
        iv && iv.disconnect();
        let i = (e) => {
          let t = document.querySelector('#player-page');
          t &&
            (e
              ? t.setAttribute('blyrics-video-mode', '')
              : t.removeAttribute('blyrics-video-mode'));
        };
        ((iv = new MutationObserver((e) => {
          for (let r of e)
            'attributes' === r.type &&
              'is-video-playback-mode-selected' === r.attributeName &&
              i('true' === t.getAttribute('is-video-playback-mode-selected'));
        })).observe(t, {
          attributes: !0,
          attributeFilter: ['is-video-playback-mode-selected'],
        }),
          i('true' === t.getAttribute('is-video-playback-mode-selected')),
          tU(C, 'Set up a/v toggle observer'));
      })(),
      tU(
        '%c[BetterLyrics] Loaded Successfully. Logs are enabled by default. You can disable them in the extension options.',
        'background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; ',
      ),
      t4(
        () => {
          ((nf.shouldInjectAlbumArt = !0), iQ());
        },
        () => {
          ((nf.shouldInjectAlbumArt = !1), iQ());
        },
      ));
  }
  (document.addEventListener('DOMContentLoaded', nb),
    (r = new URL(window.location.href)).searchParams.has('v') &&
      (ic = r.searchParams.get('v')),
    document.addEventListener('blyrics-send-response', (e) => {
      if (!(e instanceof CustomEvent)) return;
      let { url: t, requestJson: i, responseJson: r } = e.detail;
      if (ip(t, '/youtubei/v1/next')) {
        let e =
          r.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer
            .watchNextTabbedResultsRenderer.tabs?.[0].tabRenderer.content
            ?.musicQueueRenderer.content?.playlistPanelRenderer.contents;
        if (
          (e ||
            (e = r.continuationContents?.playlistPanelContinuation.contents),
          e ||
            ((e =
              r.onResponseReceivedEndpoints?.[0]?.queueUpdateCommand
                ?.inlineContents?.playlistPanelRenderer?.contents)
              ? tU(
                  'PlaylistPanelRendererContents found in onResponseReceivedEndpoints!',
                )
              : tU('PlaylistPanelRendererContents not found.')),
          e)
        ) {
          let t = e
            .map((e) => {
              let t =
                  e.playlistPanelVideoWrapperRenderer?.counterpart?.[0]
                    ?.counterpartRenderer,
                i = e.playlistPanelVideoRenderer;
              if (
                (i ||
                  (i =
                    e.playlistPanelVideoWrapperRenderer?.primaryRenderer
                      .playlistPanelVideoRenderer),
                !i)
              )
                return null;
              let r = i?.videoId,
                n = i?.title.runs[0].text;
              function s(e) {
                let t,
                  i = !1,
                  r = e.runs
                    .filter((e) => {
                      let t = e.text.trim(),
                        r = t.includes('views') || t.includes('likes');
                      return (
                        r && (i = !0),
                        t.length > 0 && '•' !== t && '&' !== t && !r
                      );
                    })
                    .map((e) => e.text),
                  n = '';
                return (
                  i
                    ? (t = r?.join(', '))
                    : ((n = r[r?.length - 2]),
                      (t = r?.slice(0, -2).join(', '))),
                  [t, n]
                );
              }
              let [a, l] = s(i?.longBylineText),
                o = i.thumbnail.thumbnails,
                u = o[o.length - 1],
                c = o[0],
                d = {
                  id: r,
                  title: n,
                  artist: a,
                  album: l,
                  isVideo: u?.height !== u?.width,
                  durationMs: ii(i.lengthText.runs[0].text),
                  thumbnail: u,
                  smallThumbnail: c,
                };
              if (!t) return { primary: d };
              {
                let i = t?.playlistPanelVideoRenderer.videoId,
                  r = t.playlistPanelVideoRenderer.title.runs[0].text,
                  n = t.playlistPanelVideoRenderer.thumbnail.thumbnails,
                  a = n[n.length - 1],
                  l = n[0],
                  o = a.height !== a.width,
                  [u, c] = s(t?.playlistPanelVideoRenderer.longBylineText);
                return {
                  primary: d,
                  counterpart: {
                    id: i,
                    title: r,
                    artist: u,
                    album: c,
                    isVideo: o,
                    durationMs: ii(
                      t.playlistPanelVideoRenderer.lengthText.runs[0].text,
                    ),
                    segmentMap:
                      e.playlistPanelVideoWrapperRenderer.counterpart[0]
                        .segmentMap,
                    thumbnail: a,
                    smallThumbnail: l,
                  },
                };
              }
            })
            .filter((e) => e);
          for (let [e, i] of t.entries()) {
            if (!i) continue;
            let r = t.length > e + 1 ? t[e + 1] : void 0,
              n = r?.primary.id,
              s = r?.counterpart?.id || n,
              a = i.counterpart;
            if (a) {
              let e = null,
                t = null;
              if (((e = { segment: [], reversed: !1 }), a.segmentMap.segment)) {
                for (let t of a.segmentMap.segment)
                  e.segment.push({
                    counterpartVideoStartTimeMilliseconds: Number(
                      t.counterpartVideoStartTimeMilliseconds,
                    ),
                    primaryVideoStartTimeMilliseconds: Number(
                      t.primaryVideoStartTimeMilliseconds,
                    ),
                    durationMilliseconds: Number(t.durationMilliseconds),
                  });
                for (let i of ((t = { segment: [], reversed: !0 }), e.segment))
                  t.segment.push({
                    primaryVideoStartTimeMilliseconds:
                      i.counterpartVideoStartTimeMilliseconds,
                    counterpartVideoStartTimeMilliseconds:
                      i.primaryVideoStartTimeMilliseconds,
                    durationMilliseconds: i.durationMilliseconds,
                  });
              }
              (io.set(i.primary.id, {
                artist: i.primary.artist,
                nextVideoId: n,
                title: i.primary.title,
                album: i.primary.album,
                isVideo: i.primary.isVideo,
                counterpartVideoId: a.id,
                segmentMap: e,
                durationMs: i.primary.durationMs,
                id: i.primary.id,
                thumbnail: i.primary.thumbnail,
                smallThumbnail: i.primary.smallThumbnail,
              }),
                io.set(a.id, {
                  artist: a.artist,
                  isVideo: a.isVideo,
                  nextVideoId: s,
                  album: a.album,
                  title: a.title,
                  counterpartVideoId: i.primary.id,
                  segmentMap: t,
                  durationMs: a.durationMs,
                  id: a.id,
                  thumbnail: a.thumbnail,
                  smallThumbnail: a.smallThumbnail,
                }),
                iu.set(a.id, a.album));
            } else
              io.set(i.primary.id, {
                artist: i.primary.artist,
                nextVideoId: n,
                title: i.primary.title,
                album: i.primary.album,
                isVideo: i.primary.isVideo,
                counterpartVideoId: null,
                segmentMap: null,
                durationMs: i.primary.durationMs,
                id: i.primary.id,
                thumbnail: i.primary.thumbnail,
                smallThumbnail: i.primary.smallThumbnail,
              });
            iu.set(i.primary.id, i.primary.album);
          }
        }
        r.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer
          .watchNextTabbedResultsRenderer.tabs[0].tabRenderer.content
          ?.musicQueueRenderer.content?.playlistPanelRenderer.continuations?.[0]
          .nextRadioContinuationData.continuation;
        let t = i.videoId,
          n = i.playlistId;
        (t || (t = r.currentVideoEndpoint?.watchEndpoint?.videoId),
          n || (n = r.currentVideoEndpoint?.watchEndpoint?.playlistId));
        let s =
          r?.playerOverlays?.playerOverlayRenderer?.browserMediaSession
            ?.browserMediaSessionRenderer?.album?.runs[0]?.text;
        if ((iu.set(t, s), io.has(t))) {
          let e = io.get(t).counterpartVideoId;
          e && iu.set(e, s);
        }
        if (!t) return;
        let a =
          r.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
            ?.watchNextTabbedResultsRenderer?.tabs[1]?.tabRenderer;
        if (a && a.unselectable)
          il.set(t, { hasLyrics: !1, lyrics: '', sourceText: '' });
        else if (a) {
          let e = a.endpoint?.browseEndpoint?.browseId;
          e && ia.set(e, t);
        }
      } else if (ip(t, '/youtubei/v1/browse')) {
        let e = i.browseId,
          t = ia.get(e);
        if (
          (void 0 !== e && void 0 === t && null !== ic && (t = ic),
          void 0 !== t)
        ) {
          let i =
              r.contents?.sectionListRenderer?.contents?.[0]
                ?.musicDescriptionShelfRenderer?.description?.runs?.[0]?.text,
            n =
              r.contents?.sectionListRenderer?.contents?.[0]
                ?.musicDescriptionShelfRenderer?.footer?.runs?.[0]?.text;
          i && n
            ? (il.set(t, { hasLyrics: !0, lyrics: i, sourceText: n }),
              t === ic && (ia.set(e, t), (ic = null)))
            : il.set(t, { hasLyrics: !1, lyrics: null, sourceText: null });
        }
      }
    }));
})();

//# sourceMappingURL=https://better-lyrics-sourcemaps.dacubeking.com/chrome/v2.2.0.3-ae9858a/content-0.js.map
