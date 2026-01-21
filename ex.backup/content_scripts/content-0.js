(() => {
  "use strict";
  let e, t;
  var i = {},
    r = {};
  function n(e) {
    var t = r[e];
    if (void 0 !== t) return t.exports;
    var s = (r[e] = { exports: {} });
    return i[e](s, s.exports, n), s.exports;
  }
  (n.rv = () => "1.6.8"), (n.ruid = "bundler=rspack@1.6.8");
  let s = "tab-header style-scope ytmusic-player-page",
    a = "blyrics-container",
    l = "blyrics--active",
    o = "blyrics-rtl",
    c = "blyrics--word",
    u = "blyrics-background-lyric",
    d = "blyrics--animating",
    m = "blyrics--paused",
    y = "blyrics--pre-animating",
    g = "blyrics-user-scrolling",
    h = "blyrics-footer",
    p = "#song-image>#thumbnail>#img",
    f = "#tab-renderer",
    M =
      "#tab-renderer > ytmusic-message-renderer > yt-formatted-string.text.style-scope.ytmusic-message-renderer",
    b = "blyrics-loader",
    N = "blyrics-wrapper",
    w = "blyrics-spacing-element",
    L = "blyrics-dfs",
    S = "https://lrclibup.boidu.dev/",
    E = "https://lyrics.api.dacubeking.com/",
    I = [
      "ja",
      "ru",
      "ko",
      "zh-CN",
      "zh-TW",
      "zh",
      "bn",
      "th",
      "el",
      "he",
      "ar",
      "ta",
      "te",
      "ml",
      "kn",
      "gu",
      "pa",
      "mr",
      "ur",
      "si",
      "my",
      "ka",
      "km",
      "lo",
      "fa",
    ],
    T = "[BetterLyrics] Error:",
    A =
      "[BetterLyrics] (Safe to ignore) Lyrics wrapper is not visible, unable to inject lyrics",
    x = "[BetterLyrics] Unable to translate lyrics due to error",
    D = "[BetterLyrics] Server Error:",
    v = "No lyrics found for this song",
    C = "ytmusic-player-bar",
    j = "is-advertisement",
    z = "blyrics-ad-overlay";
  async function k(e) {
    return await chrome.storage.local.get(e);
  }
  async function O(e) {
    return await chrome.storage.local.get(e);
  }
  async function P(e) {
    if (!e.startsWith("__COMPRESSED__")) return e;
    try {
      if ("undefined" != typeof DecompressionStream) {
        let t = e.substring(14),
          i = atob(t),
          r = new Uint8Array(i.length);
        for (let e = 0; e < i.length; e++) r[e] = i.charCodeAt(e);
        let n = new Blob([r])
            .stream()
            .pipeThrough(new DecompressionStream("gzip")),
          s = await new Response(n).blob();
        return await s.text();
      }
    } catch (e) {
      tZ(T, "Decompression failed:", e);
    }
    return e.substring(14);
  }
  async function R() {
    let e = await k(["customCSS_chunked", "customCSS_chunkCount"]);
    if (!e.customCSS_chunked || !e.customCSS_chunkCount) return null;
    let t = Array.from(
        { length: e.customCSS_chunkCount },
        (e, t) => `customCSS_chunk_${t}`
      ),
      i = await k(t),
      r = [];
    for (let t = 0; t < e.customCSS_chunkCount; t++) {
      let e = i[`customCSS_chunk_${t}`];
      if (!e) return tZ(T, `Missing CSS chunk ${t}`), null;
      r.push(e);
    }
    return r.join("");
  }
  function B(e, t) {
    chrome.storage.local.get(e, t);
  }
  async function U() {
    try {
      let e = await O(["cssStorageType", "customCSS", "cssCompressed"]),
        t = null,
        i = !1;
      if ("chunked" === e.cssStorageType)
        (t = await R()), (i = e.cssCompressed || !1);
      else if ("local" === e.cssStorageType) {
        let e = await k(["customCSS", "cssCompressed"]);
        (t = e.customCSS ?? null), (i = e.cssCompressed || !1);
      } else (t = e.customCSS ?? null), (i = e.cssCompressed || !1);
      t && ((i || t.startsWith("__COMPRESSED__")) && (t = await P(t)), tK(t));
    } catch (e) {
      tZ(T, e);
      try {
        let e = await R();
        if (e) {
          let t = await O("cssCompressed"),
            i = e;
          (t.cssCompressed || i.startsWith("__COMPRESSED__")) &&
            (i = await P(i)),
            tK(i);
          return;
        }
        let t = await k(["customCSS", "cssCompressed"]);
        if (t.customCSS) {
          let e = t.customCSS;
          (t.cssCompressed || e.startsWith("__COMPRESSED__")) &&
            (e = await P(e)),
            tK(e);
          return;
        }
        let i = await O(["customCSS", "cssCompressed"]);
        if (i.customCSS) {
          let e = i.customCSS;
          (i.cssCompressed || e.startsWith("__COMPRESSED__")) &&
            (e = await P(e)),
            tK(e);
        }
      } catch (e) {
        tZ(T, e);
      }
    }
  }
  async function V(e) {
    try {
      let t = (await chrome.storage.local.get(e))[e];
      if (!t) return null;
      let { value: i, expiry: r } = t;
      if (r && Date.now() > r)
        return await chrome.storage.local.remove(e), null;
      if ("string" == typeof i && i.startsWith("__COMPRESSED__"))
        return await P(i);
      return i;
    } catch (e) {
      return tZ(T, e), null;
    }
  }
  async function Q(e, t, i) {
    try {
      let r = { type: "transient", value: t, expiry: Date.now() + i };
      await chrome.storage.local.set({ [e]: r }),
        tZ("[BetterLyrics] Set transient storage for key: ", e),
        await Y();
    } catch (e) {
      tZ(T, e);
    }
  }
  async function _() {
    try {
      let e = await chrome.storage.local.get(null),
        t = Object.keys(e).filter((e) => e.startsWith("blyrics_")),
        i = new Set(t.map((e) => e.split("_")[1])),
        r = t.reduce((t, i) => {
          let r = e[i];
          return t + JSON.stringify(r).length;
        }, 0);
      return { count: i.size, size: r };
    } catch (e) {
      return tZ(T, e), { count: 0, size: 0 };
    }
  }
  async function Y() {
    let e = await _();
    await chrome.storage.local.set({ cacheInfo: e });
  }
  async function F() {
    try {
      let e = await chrome.storage.local.get(null),
        t = Object.keys(e).filter((e) => e.startsWith("blyrics_"));
      await chrome.storage.local.remove(t), await Y();
    } catch (e) {
      tZ(T, e);
    }
  }
  async function W() {
    try {
      let e = Date.now(),
        t = await chrome.storage.local.get(null),
        i = [];
      Object.keys(t).forEach((r) => {
        if (r.startsWith("blyrics_")) {
          let n = t[r];
          n.expiry && e >= n.expiry && i.push(r);
        }
      }),
        i.length && (await chrome.storage.local.remove(i));
    } catch (e) {
      tZ(T, e);
    }
  }
  let $ = { romanization: new Map(), translation: new Map() };
  async function q(e, t) {
    let i = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${t}&dt=t&q=${encodeURIComponent(
        e
      )}`,
      r = `${t}_${e}`;
    return $.translation.has(r)
      ? $.translation.get(r)
      : fetch(i, { cache: "force-cache" })
          .then((e) => e.json())
          .then((t) => {
            let i = t[2],
              n = "";
            if (
              (t[0].forEach((e) => {
                n += e[0];
              }),
              e.trim().toLowerCase() === n.trim().toLowerCase() &&
                "" !== e.trim())
            )
              return null;
            {
              let e = { originalLanguage: i, translatedText: n };
              return $.translation.set(r, e), e;
            }
          })
          .catch((e) => (tZ(x, e), null));
  }
  async function H(e, t) {
    return $.romanization.has(t)
      ? $.romanization.get(t)
      : fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${e}&tl=${e}-Latn&dt=t&dt=rm&q=${encodeURIComponent(
            t
          )}`,
          { cache: "force-cache" }
        )
          .then((e) => e.json())
          .then((e) => {
            let i = e[0][1][3];
            return (void 0 === i && (i = e[0][1][2]),
            t.trim().toLowerCase() === i.trim().toLowerCase() &&
              "" !== t.trim())
              ? null
              : ($.romanization.set(t, i), i);
          })
          .catch((e) => (tZ(x, e), null));
  }
  function G(e) {
    B({ isTranslateEnabled: !1, translationLanguage: "en" }, (t) => {
      t.isTranslateEnabled && e(t);
    });
  }
  function Z() {
    $.romanization.clear(), $.translation.clear();
  }
  function J() {
    var e, t;
    K(
      () => {
        let e = document.getElementById("layout"),
          t = document.getElementById("player-page");
        e && t && (e.setAttribute(L, ""), t.setAttribute(L, ""));
      },
      () => {
        let e = document.getElementById("layout"),
          t = document.getElementById("player-page");
        e && t && (e.removeAttribute(L), t.removeAttribute(L));
      }
    ),
      (e = () => {
        let e = document.getElementById("blyrics-disable-effects");
        e && e.remove();
      }),
      (t = async () => {
        let e = document.getElementById("blyrics-disable-effects");
        e ||
          (((e = document.createElement("style")).id =
            "blyrics-disable-effects"),
          (e.textContent = await fetch(
            chrome.runtime.getURL("css/disablestylizedanimations.css")
          ).then((e) => e.text())),
          document.head.appendChild(e));
      }),
      B({ isStylizedAnimationsEnabled: !0 }, (i) => {
        i.isStylizedAnimationsEnabled ? e() : t();
      });
  }
  function K(e, t) {
    B({ isFullScreenDisabled: !1 }, (i) => {
      i.isFullScreenDisabled ? e() : t();
    });
  }
  function X(e, t) {
    B({ isAlbumArtEnabled: !0 }, (i) => {
      i.isAlbumArtEnabled ? e() : t();
    });
  }
  let ee = null,
    et = null;
  function ei() {
    B({ isCursorAutoHideEnabled: !0 }, (e) => {
      e.isCursorAutoHideEnabled
        ? (() => {
            let e = !0;
            function t() {
              (ee = null),
                document
                  .getElementById("layout")
                  .setAttribute("cursor-hidden", ""),
                (e = !1);
            }
            function i() {
              ee && window.clearTimeout(ee),
                e ||
                  (document
                    .getElementById("layout")
                    .removeAttribute("cursor-hidden"),
                  (e = !0)),
                (ee = window.setTimeout(t, 3e3));
            }
            et && document.removeEventListener("mousemove", et),
              (et = i),
              document.addEventListener("mousemove", i);
          })()
        : (() => {
            ee && window.clearTimeout(ee),
              document
                .getElementById("layout")
                .removeAttribute("cursor-hidden"),
              et &&
                (document.removeEventListener("mousemove", et), (et = null));
          })();
    });
  }
  function er() {
    B(
      {
        isTranslateEnabled: !1,
        isRomanizationEnabled: !1,
        translationLanguage: "en",
      },
      (e) => {
        (tU.isTranslateEnabled = e.isTranslateEnabled),
          (tU.isRomanizationEnabled = e.isRomanizationEnabled),
          (tU.translationLanguage = e.translationLanguage || "en");
      }
    );
  }
  let en = !1,
    es = !1;
  function ea() {
    let e = document.querySelector("ytmusic-app-layout");
    if (!e) return !1;
    let t = e.getAttribute("player-ui-state");
    return "PLAYER_PAGE_OPEN" === t || "FULLSCREEN" === t;
  }
  let el = null;
  async function eo() {
    if (!("wakeLock" in navigator))
      return void tZ(T, "Wake Lock API not supported in this browser.");
    try {
      (el = await navigator.wakeLock.request("screen")).addEventListener(
        "release",
        () => {
          el = null;
        }
      );
    } catch (e) {
      tZ(T, "Wake Lock request failed:", e);
    }
  }
  function ec() {
    "visible" === document.visibilityState && null === el && eo();
  }
  let eu = 0,
    ed = [0, 0, 0];
  function em() {
    if (
      "true" ===
        document.getElementsByClassName(s)[1].getAttribute("aria-selected") &&
      tU.areLyricsTicking
    ) {
      if (tQ.skipScrolls > 0) {
        tQ.skipScrolls--, tQ.skipScrollsDecayTimes.shift();
        return;
      }
      ew() ||
        (tQ.scrollResumeTime < Date.now() &&
          tZ("[BetterLyrics] Pausing Lyrics Autoscroll Due to User Scroll"),
        (tQ.scrollResumeTime = Date.now() + 25e3));
    }
  }
  function ey(e) {
    ea() ||
      !tU.lastVideoId ||
      (e.preventDefault(),
      e.stopPropagation(),
      e instanceof KeyboardEvent && e.stopImmediatePropagation(),
      en ||
        new Promise((e) => {
          if (en) return void e();
          (en = !0), (es = !0);
          let t = document.querySelector("ytmusic-player-bar");
          t && t.click(),
            new Promise((e, t) => {
              let i = Date.now(),
                r = setInterval(() => {
                  if (ea()) {
                    clearInterval(r), setTimeout(e, 100);
                    return;
                  }
                  Date.now() - i > 3e3 &&
                    (clearInterval(r), t(Error("Player page load timeout")));
                }, 50);
            })
              .then(() => {
                (en = !1), e();
              })
              .catch((t) => {
                tZ(T, "Player page open timeout", t), (en = !1), (es = !1), e();
              });
        }).then(() => {
          let e = document.querySelector(".fullscreen-button");
          if (e) e.click();
          else {
            let e = new KeyboardEvent("keydown", {
              key: "f",
              code: "KeyF",
              keyCode: 70,
              which: 70,
              bubbles: !0,
              cancelable: !0,
            });
            document.dispatchEvent(e);
          }
        }));
  }
  let eg = {
      syllable:
        '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48" fill-opacity="0.5"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z" fill-opacity="0.5"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
      word: '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48" fill-opacity="0.5"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
      line: '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
      unsynced:
        '<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="636" y="239" width="389.981" height="233.271" rx="48" fill-opacity="0.5"/><path d="M0 335C0 289.745 0 267.118 14.0589 253.059C28.1177 239 50.7452 239 96 239H213C243.17 239 258.255 239 267.627 248.373C277 257.745 277 272.83 277 303V408C277 438.17 277 453.255 267.627 462.627C258.255 472 243.17 472 213 472H96C50.7452 472 28.1177 472 14.0589 457.941C0 443.882 0 421.255 0 376V335Z" fill-opacity="0.5"/><path d="M337 304C337 273.83 337 258.745 346.373 249.373C355.745 240 370.83 240 401 240H460C505.255 240 527.882 240 541.941 254.059C556 268.118 556 290.745 556 336V377C556 422.255 556 444.882 541.941 458.941C527.882 473 505.255 473 460 473H401C370.83 473 355.745 473 346.373 463.627C337 454.255 337 439.17 337 409V304Z" fill-opacity="0.5"/><rect y="552.271" width="1024" height="233" rx="48" fill-opacity="0.5"/></svg>',
    },
    eh = {
      syllable: "#fde69b",
      word: "#aad1ff",
      line: "#c9f8da",
      unsynced: "rgba(255, 255, 255, 0.7)",
    },
    ep = {
      "bLyrics-richsynced": { name: "Better Lyrics", syncType: "syllable" },
      "bLyrics-synced": { name: "Better Lyrics", syncType: "line" },
      "legato-synced": { name: "Better Lyrics Legato", syncType: "line" },
      "musixmatch-richsync": { name: "Musixmatch", syncType: "word" },
      "musixmatch-synced": { name: "Musixmatch", syncType: "line" },
      "lrclib-synced": { name: "LRCLib", syncType: "line" },
      "lrclib-plain": { name: "LRCLib", syncType: "unsynced" },
      "yt-captions": { name: "Youtube Captions", syncType: "line" },
      "yt-lyrics": { name: "Youtube", syncType: "unsynced" },
    },
    ef = null,
    eM = null,
    eb = !1;
  function eN(e = !1) {
    if (!eL()) {
      e || eA(), (eb = !0);
      try {
        clearTimeout(tU.loaderAnimationEndTimeout);
        let t = document.querySelector(f),
          i = document.getElementById(b);
        i || ((i = document.createElement("div")).id = b);
        let r = i.hasAttribute("active");
        i.setAttribute("active", ""),
          i.removeAttribute("no-sync-available"),
          e
            ? i.setAttribute("small-loader", "")
            : i.removeAttribute("small-loader"),
          r ||
            (t.prepend(i),
            (i.hidden = !1),
            (i.style.display = "inline-block !important"),
            i.scrollIntoView({
              behavior: "instant",
              block: "start",
              inline: "start",
            }));
      } catch (e) {
        tZ(e);
      }
    }
  }
  function ew() {
    try {
      if (!eb) return !1;
      let e = document.getElementById(b);
      if (e)
        return e.hasAttribute("active") || "true" === e.dataset.animatingOut;
    } catch (e) {
      tZ(e);
    }
    return !1;
  }
  function eL() {
    let e = document.querySelector(C);
    return e?.hasAttribute(j) ?? !1;
  }
  function eS() {
    let e = document.querySelector(f);
    if (!e) return;
    let t = document.getElementById(b);
    t && t.removeAttribute("active");
    let i = document.getElementById(z);
    i || (((i = document.createElement("div")).id = z), e.prepend(i)),
      i.setAttribute("active", "");
  }
  function eE() {
    let e = document.getElementById(z);
    e && e.removeAttribute("active");
  }
  function eI(e) {
    let t = new Image();
    (t.src = e),
      (t.onload = () => {
        document
          .getElementById("layout")
          .style.setProperty("--blyrics-background-img", `url('${e}')`);
      });
  }
  async function eT() {
    let e = document.createElement("link");
    (e.rel = "preload"),
      (e.as = "image"),
      (e.href = "https://better-lyrics.boidu.dev/icon-512.png"),
      document.head.appendChild(e);
    let t = document.createElement("link");
    (t.href = "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap"),
      (t.rel = "stylesheet"),
      document.head.appendChild(t);
    let i = document.createElement("link");
    (i.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&family=Noto+Sans+Armenian:wght@100..900&family=Noto+Sans+Bengali:wght@100..900&family=Noto+Sans+Devanagari:wght@100..900&family=Noto+Sans+Georgian:wght@100..900&family=Noto+Sans+Gujarati:wght@100..900&family=Noto+Sans+HK:wght@100..900&family=Noto+Sans+Hebrew:wght@100..900&family=Noto+Sans+JP:wght@100..900&family=Noto+Sans+KR:wght@100..900&family=Noto+Sans+Kannada:wght@100..900&family=Noto+Sans+Khmer:wght@100..900&family=Noto+Sans+Lao+Looped:wght@100..900&family=Noto+Sans+Lao:wght@100..900&family=Noto+Sans+Malayalam:wght@100..900&family=Noto+Sans+Marchen&family=Noto+Sans+Meetei+Mayek:wght@100..900&family=Noto+Sans+Multani&family=Noto+Sans+NKo&family=Noto+Sans+Old+Permic&family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+Shavian&family=Noto+Sans+Sinhala:wght@100..900&family=Noto+Sans+Sunuwar&family=Noto+Sans+TC:wght@100..900&family=Noto+Sans+Takri&family=Noto+Sans+Tamil:wght@100..900&family=Noto+Sans+Telugu:wght@100..900&family=Noto+Sans+Thai+Looped:wght@100..900&family=Noto+Sans+Thai:wght@100..900&family=Noto+Sans+Vithkuqi:wght@400..700&family=Noto+Sans+Warang+Citi&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"),
      (i.rel = "stylesheet"),
      document.head.appendChild(i);
    let r = ["css/ytmusic.css", "css/blyrics.css", "css/themesong.css"],
      n = "",
      s = await Promise.all(
        r.map((e) => fetch(chrome.runtime.getURL(e), { cache: "no-store" }))
      );
    for (let e = 0; e < r.length; e++)
      (n += `/* ${r[e]} */
`),
        (n += await s[e].text());
    let a = document.createElement("style");
    (a.textContent = n), document.head.appendChild(a);
  }
  function eA() {
    (tQ.scrollPos = -1), eM && (eM.disconnect(), (eM = null));
    let e = document.querySelector(M)?.parentElement;
    e && (e.style.display = "");
    let t = document.getElementsByClassName(h)[0];
    t && t.remove(), tq().setAttribute("autoscroll-hidden", "true");
    let i = document.querySelector(".blyrics-no-lyrics-button-container");
    i && i.remove();
    try {
      let e = document.getElementById(N);
      e && (e.innerHTML = "");
    } catch (e) {
      tZ(e);
    }
  }
  function ex(e, t) {
    let i = encodeURIComponent(`${t.trim()} - ${e.trim()}`);
    return `https://genius.com/search?q=${i}`;
  }
  let eD = (e, t, i = 2, r = !1) => {
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
    ev = /[^\p{Script_Extensions=Latin}\p{Script_Extensions=Common}]/u;
  function eC(e) {
    return ev.test(e);
  }
  let ej = new ResizeObserver((e) => {
    for (let t of e)
      t.target.id === N &&
        tU.lyricData &&
        t.target.clientWidth !== tU.lyricData.lyricWidth &&
        eP();
  });
  function ez(e, t = !1) {
    let i = e.lyrics;
    if (!i || 0 === i.length)
      throw Error("[BetterLyrics] No lyrics found for the current song");
    tZ("[BetterLyrics] Lyrics found, injecting into the page");
    let r = document.querySelector(M)?.parentElement;
    r && r.classList.add("blyrics-hidden");
    try {
      document.getElementsByClassName(a)[0].innerHTML = "";
    } catch (e) {
      tZ(
        "[BetterLyrics] (Safe to ignore) Lyrics tab is not disabled, unable to enable it"
      );
    }
    !(function (e, t = !1) {
      let i = e.lyrics;
      eA(), ej.disconnect();
      let r = (function () {
        let e = document.querySelector(f);
        e.removeEventListener("scroll", em), e.addEventListener("scroll", em);
        let t = document.getElementById(N);
        if (t)
          return (
            (t.innerHTML = ""), (t.style.top = ""), (t.style.transition = ""), t
          );
        let i = document.createElement("div");
        return (
          (i.id = N),
          e.appendChild(i),
          tZ("[BetterLyrics] Lyrics wrapper created"),
          i
        );
      })();
      r.innerHTML = "";
      let n = document.createElement("div");
      (n.className = a),
        r.appendChild(n),
        r.removeAttribute("is-empty"),
        G((e) => {
          tZ(
            "[BetterLyrics] Translation enabled, translating lyrics. Language: ",
            e.translationLanguage
          );
        });
      let s = i.every((e) => 0 === e.startTimeMs);
      t
        ? eN(!0)
        : (function (e = !1) {
            try {
              let t = document.getElementById(b);
              if (
                (t &&
                  e &&
                  (t.setAttribute("small-loader", ""),
                  tG(t),
                  t.setAttribute("no-sync-available", "")),
                t?.hasAttribute("active"))
              ) {
                clearTimeout(tU.loaderAnimationEndTimeout),
                  (t.dataset.animatingOut = "true"),
                  t.removeAttribute("active"),
                  t.addEventListener("transitionend", function e(i) {
                    clearTimeout(tU.loaderAnimationEndTimeout),
                      (t.dataset.animatingOut = "false"),
                      (eb = !1),
                      t.removeEventListener("transitionend", e),
                      tZ("[BetterLyrics] Loader Transition Ended");
                  });
                let e = 1e3,
                  i = window
                    .getComputedStyle(t)
                    .getPropertyValue("transition-delay");
                i && (e += tH(i)),
                  (tU.loaderAnimationEndTimeout = window.setTimeout(() => {
                    (t.dataset.animatingOut = String(!1)),
                      (eb = !1),
                      tZ("[BetterLyrics] Loader Animation Didn't End");
                  }, e));
              }
            } catch (e) {
              tZ(e);
            }
          })(s && i[0].words !== v);
      let l = new Promise(async (t) => {
          if (e.language) t(e.language);
          else {
            let e = "",
              r = 0;
            for (let t of i)
              if (((e += t.words.trim() + "\n"), ++r >= 10)) break;
            let n = await q(e, "en"),
              s = n?.originalLanguage || "";
            return (
              tZ("[BetterLyrics] Lang was missing. Determined it is: " + s),
              t(s)
            );
          }
        }),
        o = [],
        u = s ? "none" : "synced";
      i.forEach((t, r) => {
        var d, m, y, g, h;
        let p;
        if (t.isInstrumental) {
          let e,
            a,
            l,
            c,
            u,
            m,
            y,
            g,
            h,
            p,
            f,
            M,
            b,
            N,
            w,
            L,
            S,
            E =
              ((d = t.durationMs),
              (e = document.createElement("div")).classList.add(
                "blyrics--instrumental"
              ),
              e.style.setProperty("--blyrics-duration", `${d}ms`),
              (a = "http://www.w3.org/2000/svg"),
              (l = document.createElementNS(a, "svg")).classList.add(
                "blyrics--instrumental-icon"
              ),
              l.setAttribute("viewBox", "0 0 24 24"),
              (c = document.createElementNS(a, "defs")),
              (u = `blyrics-glow-${r}`),
              (m = `blyrics-wave-clip-${r}`),
              (y = document.createElementNS(a, "filter")).setAttribute("id", u),
              y.setAttribute("x", "-100%"),
              y.setAttribute("y", "-100%"),
              y.setAttribute("width", "300%"),
              y.setAttribute("height", "300%"),
              (g = document.createElementNS(a, "feGaussianBlur")).setAttribute(
                "in",
                "SourceGraphic"
              ),
              g.setAttribute("stdDeviation", "5"),
              g.setAttribute("result", "blur"),
              y.appendChild(g),
              (h = document.createElementNS(a, "feColorMatrix")).setAttribute(
                "in",
                "blur"
              ),
              h.setAttribute("type", "matrix"),
              h.setAttribute(
                "values",
                "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"
              ),
              h.setAttribute("result", "fadedBlur"),
              y.appendChild(h),
              (p = document.createElementNS(a, "feMerge")),
              (f = document.createElementNS(a, "feMergeNode")).setAttribute(
                "in",
                "fadedBlur"
              ),
              p.appendChild(f),
              (M = document.createElementNS(a, "feMergeNode")).setAttribute(
                "in",
                "SourceGraphic"
              ),
              p.appendChild(M),
              y.appendChild(p),
              c.appendChild(y),
              (b = document.createElementNS(a, "clipPath")).setAttribute(
                "id",
                m
              ),
              b.classList.add("blyrics--wave-clip"),
              (N = document.createElementNS(a, "path")).classList.add(
                "blyrics--wave-path"
              ),
              N.setAttribute(
                "d",
                "M -4 3 Q 1 2 5 3 Q 10 4 14 3 Q 18 2 22 3 Q 26 4 30 3 L 30 30 L -4 30 Z"
              ),
              b.appendChild(N),
              c.appendChild(b),
              l.appendChild(c),
              (w = document.createElementNS(a, "path")).classList.add(
                "blyrics--instrumental-bg"
              ),
              w.setAttribute(
                "d",
                "M10 21q-1.65 0-2.825-1.175T6 17t1.175-2.825T10 13q.575 0 1.063.138t.937.412V4q0-.425.288-.712T13 3h4q.425 0 .713.288T18 4v2q0 .425-.288.713T17 7h-3v10q0 1.65-1.175 2.825T10 21"
              ),
              l.appendChild(w),
              (L = document.createElementNS(a, "g")).setAttribute(
                "filter",
                `url(#${u})`
              ),
              (S = document.createElementNS(a, "path")).classList.add(
                "blyrics--instrumental-fill"
              ),
              S.setAttribute("clip-path", `url(#${m})`),
              S.setAttribute(
                "d",
                "M10 21q-1.65 0-2.825-1.175T6 17t1.175-2.825T10 13q.575 0 1.063.138t.937.412V4q0-.425.288-.712T13 3h4q.425 0 .713.288T18 4v2q0 .425-.288.713T17 7h-3v10q0 1.65-1.175 2.825T10 21"
              ),
              L.appendChild(S),
              l.appendChild(L),
              e.appendChild(l),
              e);
          E.classList.add("blyrics--line"),
            (E.dataset.time = String(t.startTimeMs / 1e3)),
            (E.dataset.duration = String(t.durationMs / 1e3)),
            (E.dataset.lineNumber = String(r)),
            (E.dataset.instrumental = "true");
          let I = (function (e, t) {
            for (let i = t - 1; i >= 0; i--)
              if (!e[i].isInstrumental && e[i].agent) return e[i].agent;
            for (let i = t + 1; i < e.length; i++)
              if (!e[i].isInstrumental && e[i].agent) return e[i].agent;
          })(i, r);
          if ((I && (E.dataset.agent = I), !s)) {
            let e = t.startTimeMs / 1e3;
            E.addEventListener("click", () => {
              tZ(`[BetterLyrics] Seeking to ${e.toFixed(2)}s`),
                (document.body.dataset.blyricsSeekTime = String(e)),
                document.dispatchEvent(new CustomEvent("blyrics-seek-to")),
                (tQ.scrollResumeTime = 0);
            });
          }
          let T = {
            lyricElement: E,
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
            o.push(T), n.appendChild(E);
          } catch (e) {
            tZ(A);
          }
          return;
        }
        t.parts || (t.parts = []),
          (0 === t.parts.length ||
            tU.animationSettings.disableRichSynchronization) &&
            ((t.parts = []),
            t.words.split(" ").forEach((e, i) => {
              (e = e.trim().length < 1 ? e : e + " "),
                t.parts.push({
                  startTimeMs:
                    t.startTimeMs +
                    i * tU.animationSettings.lineSyncedWordDelayMs,
                  words: e,
                  durationMs: 0,
                });
            })),
          t.parts.every((e) => 0 === e.durationMs) || (u = "richsync");
        let f = document.createElement("div");
        f.classList.add("blyrics--line");
        let M = {
          lyricElement: f,
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
        ek(t.parts, M, f),
          eO(f, 1),
          (f.dataset.time = String(M.time)),
          (f.dataset.duration = String(M.duration)),
          (f.dataset.lineNumber = String(r)),
          f.style.setProperty("--blyrics-duration", t.durationMs + "ms"),
          t.agent && (f.dataset.agent = t.agent),
          s
            ? (f.style.cursor = "unset")
            : f.addEventListener("click", (e) => {
                let t,
                  i = e.target,
                  r = f.closest(`.${a}`);
                if (r?.dataset.sync === "richsync") {
                  let r = i.closest(`.${c}`);
                  if (!r) {
                    let t = f.querySelectorAll(`.${c}`),
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
                  t = parseFloat(r.dataset.time || "0");
                } else t = parseFloat(f.dataset.time || "0");
                tZ(`[BetterLyrics] Seeking to ${t.toFixed(2)}s`),
                  (document.body.dataset.blyricsSeekTime = String(t)),
                  document.dispatchEvent(new CustomEvent("blyrics-seek-to")),
                  (tQ.scrollResumeTime = 0);
              });
        let b = () => {
            eO(f, 4);
            let e = document.createElement("div");
            return (
              e.classList.add("blyrics--romanized"),
              (e.style.order = "5"),
              f.appendChild(e),
              e
            );
          },
          N = ((m = t.words), $.romanization.get(m) || null),
          w =
            (((e.language && I.includes(e.language)) || eC(t.words)) &&
              t.romanization) ||
            null !== N;
        t.romanization && (N = t.romanization),
          w && tU.isRomanizationEnabled
            ? N !== t.words &&
              (t.timedRomanization &&
              t.timedRomanization.length > 0 &&
              !tU.animationSettings.disableRichSynchronization
                ? ek(t.timedRomanization, M, b())
                : (b().textContent = "\n" + N))
            : l.then((e) => {
                var i;
                (i = async () => {
                  let i = eC(t.words);
                  if (I.includes(e) || i) {
                    let r = e;
                    if (
                      (i && !I.includes(e) && (r = "auto"),
                      "♪" !== t.words.trim() && "" !== t.words.trim())
                    ) {
                      let e;
                      (e = t.romanization
                        ? t.romanization
                        : await H(r, t.words)) &&
                        !eR(e, t.words) &&
                        ((b().textContent = e), t$());
                    }
                  }
                }),
                  B({ isRomanizationEnabled: !1 }, (e) => {
                    e.isRomanizationEnabled && i(e);
                  });
              });
        let L = () => {
            eO(f, 6);
            let e = document.createElement("div");
            return (
              e.classList.add("blyrics--translated"),
              (e.style.order = "7"),
              f.appendChild(e),
              e
            );
          },
          S = tU.translationLanguage;
        if (
          t.translation &&
          ((g = S),
          (h = t.translation.lang),
          g.split("-")[0] === h.split("-")[0])
        )
          p = {
            originalLanguage: t.translation.lang,
            translatedText: t.translation.text,
          };
        else {
          let e;
          (y = t.words), (e = `${S}_${y}`), (p = $.translation.get(e) || null);
        }
        p && tU.isTranslateEnabled
          ? eR(p.translatedText, t.words) ||
            (L().textContent = "\n" + p.translatedText)
          : l.then((e) => {
              G(async (i) => {
                let r = i.translationLanguage || "en";
                if (
                  (e !== r || eC(t.words)) &&
                  "♪" !== t.words.trim() &&
                  "" !== t.words.trim()
                ) {
                  let e;
                  (e =
                    t.translation && r === t.translation.lang
                      ? {
                          originalLanguage: t.translation.lang,
                          translatedText: t.translation.text,
                        }
                      : await q(t.words, r)) &&
                    !eR(e.translatedText, t.words) &&
                    ((L().textContent = "\n" + e.translatedText), t$());
                }
              });
            });
        try {
          o.push(M), n.appendChild(f);
        } catch (e) {
          tZ(A);
        }
      }),
        (tQ.skipScrolls = 2),
        (tQ.skipScrollsDecayTimes = []);
      for (let e = 0; e < tQ.skipScrolls; e++)
        tQ.skipScrollsDecayTimes.push(Date.now() + 2e3);
      (tQ.scrollResumeTime = 0),
        i[0].words !== v
          ? (function (e, t, i, r, n, s, l) {
              0 !== document.getElementsByClassName(h).length &&
                document.getElementsByClassName(h)[0].remove();
              let o = document.getElementsByClassName(a)[0],
                c = document.createElement("div");
              c.classList.add(h),
                o.appendChild(c),
                (function (e, t, i, r) {
                  try {
                    let n = document.getElementsByClassName(h)[0];
                    n.innerHTML = "";
                    let s = document.createElement("div");
                    s.className = `${h}__container`;
                    let a = document.createElement("img");
                    (a.src = "https://better-lyrics.boidu.dev/icon-512.png"),
                      (a.alt = "Better Lyrics Logo"),
                      (a.width = 20),
                      (a.height = 20),
                      s.appendChild(a),
                      s.appendChild(document.createTextNode("Source: "));
                    let l = document.createElement("a");
                    (l.target = "_blank"),
                      (l.id = "betterLyricsFooterLink"),
                      s.appendChild(l);
                    let o = document.createElement("img");
                    (o.src =
                      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNhYWEiIGQ9Ik0xOS4yNyA1LjMzQzE3Ljk0IDQuNzEgMTYuNSA0LjI2IDE1IDRhLjA5LjA5IDAgMCAwLS4wNy4wM2MtLjE4LjMzLS4zOS43Ni0uNTMgMS4wOWExNi4wOSAxNi4wOSAwIDAgMC00LjggMGMtLjE0LS4zNC0uMzUtLjc2LS41NC0xLjA5Yy0uMDEtLjAyLS4wNC0uMDMtLjA3LS4wM2MtMS41LjI2LTIuOTMuNzEtNC4yNyAxLjMzYy0uMDEgMC0uMDIuMDEtLjAzLjAyYy0yLjcyIDQuMDctMy40NyA4LjAzLTMuMSAxMS45NWMwIC4wMi4wMS4wNC4wMy4wNWMxLjggMS4zMiAzLjUzIDIuMTIgNS4yNCAyLjY1Yy4wMy4wMS4wNiAwIC4wNy0uMDJjLjQtLjU1Ljc2LTEuMTMgMS4wNy0xLjc0Yy4wMi0uMDQgMC0uMDgtLjA0LS4wOWMtLjU3LS4yMi0xLjExLS40OC0xLjY0LS43OGMtLjA0LS4wMi0uMDQtLjA4LS4wMS0uMTFjLjExLS4wOC4yMi0uMTcuMzMtLjI1Yy4wMi0uMDIuMDUtLjAyLjA3LS4wMWMzLjQ0IDEuNTcgNy4xNSAxLjU3IDEwLjU1IDBjLjAyLS4wMS4wNS0uMDEuMDcuMDFjLjExLjA5LjIyLjE3LjMzLjI2Yy4wNC4wMy4wNC4wOS0uMDEuMTFjLS41Mi4zMS0xLjA3LjU2LTEuNjQuNzhjLS4wNC4wMS0uMDUuMDYtLjA0LjA5Yy4zMi42MS42OCAxLjE5IDEuMDcgMS43NGMuMDMuMDEuMDYuMDIuMDkuMDFjMS43Mi0uNTMgMy40NS0xLjMzIDUuMjUtMi42NWMuMDItLjAxLjAzLS4wMy4wMy0uMDVjLjQ0LTQuNTMtLjczLTguNDYtMy4xLTExLjk1Yy0uMDEtLjAxLS4wMi0uMDItLjA0LS4wMk04LjUyIDE0LjkxYy0xLjAzIDAtMS44OS0uOTUtMS44OS0yLjEycy44NC0yLjEyIDEuODktMi4xMmMxLjA2IDAgMS45Ljk2IDEuODkgMi4xMmMwIDEuMTctLjg0IDIuMTItMS44OSAyLjEybTYuOTcgMGMtMS4wMyAwLTEuODktLjk1LTEuODktMi4xMnMuODQtMi4xMiAxLjg5LTIuMTJjMS4wNiAwIDEuOS45NiAxLjg5IDIuMTJjMCAxLjE3LS44MyAyLjEyLTEuODkgMi4xMiIvPjwvc3ZnPg=="),
                      (o.alt = "Better Lyrics Discord"),
                      (o.width = 20),
                      (o.height = 20);
                    let c = document.createElement("a");
                    (c.className = `${h}__discord`),
                      (c.href = "https://discord.gg/UsHE3d5fWF"),
                      (c.target = "_blank"),
                      c.appendChild(o);
                    let u = document.createElement("div");
                    u.className = `${h}__container`;
                    let d = document.createElement("a"),
                      m = new URL(S);
                    e && m.searchParams.append("title", e),
                      t && m.searchParams.append("artist", t),
                      i && m.searchParams.append("album", i),
                      r && m.searchParams.append("duration", r.toString()),
                      (l.target = "_blank"),
                      (d.href = m.toString()),
                      (d.textContent = "Add Lyrics to LRCLib"),
                      (d.target = "_blank"),
                      (d.rel = "noreferrer noopener"),
                      (d.style.height = "100%"),
                      u.appendChild(d);
                    let y = document.createElement("div");
                    y.className = `${h}__container`;
                    let g = document.createElement("a");
                    (g.href = ex(e, t)),
                      (g.target = "_blank"),
                      (g.textContent = "Search on Genius"),
                      (g.style.height = "100%");
                    let p = document.createElement("img");
                    (p.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMTU4XzUpIj4KPHBhdGggZD0iTTEwMjYgNTEyQzEwMjYgNzk0Ljc3IDc5Ni43NyAxMDI0IDUxNCAxMDI0QzIzMS4yMyAxMDI0IDIgNzk0Ljc3IDIgNTEyQzIgMjI5LjIzIDIzMS4yMyAwIDUxNCAwQzc5Ni43NyAwIDEwMjYgMjI5LjIzIDEwMjYgNTEyWiIgZmlsbD0iI0Y2RjA2OSIvPgo8cGF0aCBkPSJNNzcyLjE1MiA0NjkuMzI3Qzc3MS45MTkgNDU2LjAxOCA3NzAuNTE5IDQ0Mi44NjMgNzY4LjM0MyA0MjkuNzg2Qzc1OS44NjkgMzgwLjQxNyA3MzkuMDM1IDMzNi44NTEgNzA2LjYxOCAyOTguNzAyQzcwMy4yNzYgMjk0Ljc1NiA2OTkuNzc3IDI5MC45NjQgNjk2LjEyNCAyODcuMjVDNjkzLjg2OSAyODQuOTI5IDY5MC45OTMgMjg0LjY5NiA2ODguNzM5IDI4Ni4yNDRDNjg2LjU2MiAyODcuNzE0IDY4NS45NCAyODkuOTU4IDY4Ni44NzMgMjkzLjEzMUM2ODcuMTA2IDI5My45MDUgNjg3LjQxNyAyOTQuNjAxIDY4Ny42NSAyOTUuMjk4QzcwMC4wODggMzI4LjMzOSA3MDYuNDYzIDM2Mi40NjQgNzA2LjY5NiAzOTcuNzVDNzA2LjM4NSA0MDQuMTczIDcwNi4wNzQgNDEwLjU5NSA3MDUuNzYzIDQxNy4wMThDNzA0LjgzIDQzNC41ODMgNzAyLjAzMiA0NTEuODM5IDY5Ny42MDEgNDY4Ljc4NkM2ODMuMzc1IDUyMy4zMzkgNjU1Ljg1NSA1NzAuMjMyIDYxNC4zNDMgNjA4LjUzNkM1NjAuMjM3IDY1OC40NDYgNDk1Ljk0NyA2ODQuMTM3IDQyMi4yNTEgNjg2LjIyNkM0MDMuNjcxIDY4Ni43NjggMzg1LjI0NyA2ODUuMjIgMzY2Ljk3OSA2ODIuMDQ4QzM0OC4zMjIgNjc4Ljg3NSAzMzAuMDUzIDY3My45MjMgMzEyLjQwNiA2NjcuMTEzQzMwOC41MTkgNjY1LjY0MyAzMDUuNzk5IDY2Ni4zMzkgMzA0LjI0NCA2NjkuMDQ4QzMwMi42ODkgNjcxLjYwMSAzMDMuMzExIDY3NCAzMDYuMzQzIDY3Ni44NjNDMzA4LjkwOCA2NzkuMjYyIDMxMS40NzMgNjgxLjU4MyAzMTQuMTE3IDY4My45MDVDMzY0LjgwMiA3MjcuNjI1IDQyMy44MDYgNzUwLjE0MyA0OTAuNzM5IDc1Mi4wNzdDNTA2LjkwOCA3NTIuNTQyIDUyMy4wNzggNzUxLjMwNCA1MzkuMDkyIDc0OC42NzNDNTk2Ljc3NCA3MzkuMzg3IDY0Ny4xNDggNzE0Ljg1NyA2ODguNzM5IDY3NEM3NDUuNzk5IDYxNy45NzYgNzczLjcwNyA1NDkuNDk0IDc3Mi4xNTIgNDY5LjMyN1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0zMjguMjY1IDU0NC41NDJDMzMwLjUxOSA1NDIuODM5IDMzMC45MDggNTQwLjU5NSAzMjkuNjY0IDUzNi44MDRDMzI5LjUwOSA1MzYuNDE3IDMyOS40MzEgNTM2LjEwNyAzMjkuMjc2IDUzNS43MkMzMTkuNjM2IDUwOC42MzcgMzE2LjkxNSA0ODAuNzggMzIxLjAzNSA0NTIuMzgxQzMyNi40NzcgNDE1LjAwNiAzNDIuNDEzIDM4Mi42NjEgMzY4LjM3OCAzNTUuMjY4QzM3MC40NzcgMzUzLjAyNCAzNzEuNDg4IDM1MC43OCAzNzEuNDg4IDM0Ny42ODVDMzcxLjQxIDMzOC4wMTIgMzcxLjQxIDMyOC4zMzkgMzcxLjQxIDMxOC42NjdDMzcxLjQxIDMwOS4xNDkgMzcxLjQxIDI5OS41NTQgMzcxLjQxIDI5MC4wMzZDMzcxLjQxIDI4My44NDUgMzY5LjU0NCAyODEuOTExIDM2My4zMjUgMjgxLjkxMUMzNDQuMTI0IDI4MS45MTEgMzI1IDI4MS45MTEgMzA1Ljc5OSAyODEuODMzQzMwMi42MTEgMjgxLjgzMyAzMDAuMDQ2IDI4Mi43NjIgMjk3Ljc5MiAyODQuOTI5QzI2NS45MTkgMzE1LjgwNCAyNDguOTcyIDM1My40ODggMjQ2LjMyOSAzOTcuNTE4QzI0NS4zMTggNDE0LjMxIDI0Ny4yNjEgNDMwLjk0NiAyNTEuNjE1IDQ0Ny4yNzRDMjYyLjQ5OCA0ODcuOTc2IDI4NS41MDkgNTIwLjA4OSAzMjAuNDEzIDU0My43NjhDMzIzLjkxMiA1NDYuMTY3IDMyNS45MzMgNTQ2LjMyMSAzMjguMjY1IDU0NC41NDJaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNNDM0LjUzNCA0MjMuMjA4QzQzOS4yNzYgNDU4LjQ5NCA0NzIuNzgxIDQ4My40MTEgNTA4LjA3NCA0NzcuNzYyQzUzOS40MDMgNDcyLjczMiA1NjIuMTggNDQ2LjE5IDU2Mi4xOCA0MTQuNTQyQzU2Mi4xOCA0MDguMTk2IDU2Mi4xOCA0MDEuOTI5IDU2Mi4xOCAzOTUuNTgzQzU2Mi4xOCAzODcuMzA0IDU2Mi4xOCAzNzkuMTAxIDU2Mi4xOCAzNzAuODIxQzU2Mi4xOCAzNjUuNTYgNTYzLjU4IDM2NC4yNDQgNTY4Ljg2NiAzNjQuMTY3QzU3My43NjMgMzY0LjA4OSA1NzguNzM5IDM2NC4yNDQgNTgzLjYzNiAzNjQuMDg5QzU4OC4xNDUgMzYzLjkzNSA1OTAuMTY2IDM2MS4yMjYgNTg5LjM4OSAzNTYuODkzQzU4OS4yMzMgMzU2LjExOSA1ODkuMTU1IDM1NS4zNDUgNTg5IDM1NC42NDlDNTgzLjA5MiAzMjkuODEgNTcyLjM2NCAzMDcuMzY5IDU1Ni44MTYgMjg3LjA5NUM1NTMuOTQgMjgzLjM4MSA1NTAuNzUzIDI4MS45ODggNTQ2LjI0NCAyODIuMDY1QzUzMy4xODQgMjgyLjIyIDUyMC4xMjQgMjgyLjA2NSA1MDYuOTg2IDI4Mi4xNDNDNTA1LjU4NyAyODIuMTQzIDUwNC4xMSAyODIuMjIgNTAyLjcxIDI4Mi40NTJDNDk5LjQ0NSAyODIuOTk0IDQ5Ny45NjggMjg0LjU0MiA0OTcuNTAyIDI4Ny43OTJDNDk3LjM0NiAyODkuMDMgNDk3LjQyNCAyOTAuMzQ1IDQ5Ny40MjQgMjkxLjY2MUM0OTcuNDI0IDMxMS45MzUgNDk3LjQyNCAzMzIuMTMxIDQ5Ny40MjQgMzUyLjQwNUM0OTcuNDI0IDM2MC43NjIgNDk1Ljc5MiAzNjguODEgNDkyLjM3MSAzNzYuNDdDNDgyLjI2NSAzOTguNjAxIDQ2NC43NzQgNDEwLjkwNSA0NDAuNjc1IDQxNC4xNTVDNDM1LjYyMiA0MTQuODUxIDQzNC4xNDUgNDE2LjQ3NiA0MzQuMzc4IDQyMS40MjlDNDM0LjQ1NiA0MjEuODkzIDQzNC40NTYgNDIyLjU4OSA0MzQuNTM0IDQyMy4yMDhaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE1OF81Ij4KPHJlY3Qgd2lkdGg9IjEwMjQiIGhlaWdodD0iMTAyNCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4="),
                      (p.alt = "Genius"),
                      (p.width = 20),
                      (p.height = 20),
                      y.appendChild(p),
                      y.appendChild(g),
                      n.appendChild(s),
                      n.appendChild(y),
                      n.appendChild(u),
                      n.appendChild(c),
                      n.removeAttribute("is-empty");
                  } catch (e) {
                    tZ(
                      "[BetterLyrics] (Safe to ignore) Footer is not visible, unable to inject source link"
                    );
                  }
                })(i, r, n, s);
              let u = document.getElementById("betterLyricsFooterLink");
              t = t || "https://better-lyrics.boidu.dev/";
              let d = l ? ep[l] : null;
              if (((u.textContent = ""), (u.href = t), d)) {
                var m;
                let e, t;
                u.appendChild(document.createTextNode(d.name));
                let i = document.createElement("span");
                (i.style.opacity = "0.5"),
                  (i.style.marginLeft = "6px"),
                  (i.style.display = "inline-flex"),
                  (i.style.verticalAlign = "middle"),
                  (i.style.color = eh[d.syncType]);
                let r =
                  ((m = eg[d.syncType]),
                  (t = (e = new DOMParser().parseFromString(m, "image/svg+xml"))
                    .documentElement) instanceof SVGElement &&
                  !e.querySelector("parsererror")
                    ? t
                    : null);
                r && i.appendChild(r), u.appendChild(i);
              } else u.textContent = e || "boidu.dev";
            })(
              e.source,
              e.sourceHref,
              e.song,
              e.artist,
              e.album,
              e.duration,
              e.providerKey
            )
          : (function (e, t, i, r) {
              let n = document.getElementById(N);
              if (!n) return;
              let s = document.createElement("div");
              s.className = "blyrics-no-lyrics-button-container";
              let a = document.createElement("button");
              (a.className = "blyrics-no-lyrics-button"),
                (a.textContent = "Add Lyrics to LRCLib");
              let l = new URL(S);
              e && l.searchParams.append("title", e),
                t && l.searchParams.append("artist", t),
                i && l.searchParams.append("album", i),
                r && l.searchParams.append("duration", r.toString()),
                a.addEventListener("click", () => {
                  window.open(l.toString(), "_blank");
                });
              let o = document.createElement("button");
              (o.className = "blyrics-no-lyrics-button"),
                (o.textContent = "Search on Genius"),
                o.addEventListener("click", () => {
                  window.open(ex(e, t), "_blank");
                }),
                s.appendChild(a),
                s.appendChild(o),
                n.appendChild(s);
            })(e.song, e.artist, e.album, e.duration);
      let d = document.createElement("div");
      (d.id = w),
        (d.style.height = "100px"),
        (d.textContent = ""),
        (d.style.padding = "0"),
        (d.style.margin = "0"),
        n.appendChild(d),
        (n.dataset.sync = u),
        (n.dataset.loaderVisible = String(t)),
        i[0].words === v && (n.dataset.noLyrics = "true");
      let m = {
        lines: o,
        syncType: u,
        lyricWidth: n.clientWidth,
        isMusicVideoSynced: !0 === e.musicVideoSynced,
      };
      e.segmentMap && tR(m, e.segmentMap),
        (tU.lyricData = m),
        s
          ? tZ(
              "[BetterLyrics] Syncing lyrics disabled due to all lyrics having a start time of 0"
            )
          : ((tU.areLyricsTicking = !0), eP(), ej.observe(r)),
        (tU.areLyricsLoaded = !0);
    })(e, t);
  }
  function ek(e, t, i) {
    var r, n;
    let s,
      a,
      l,
      d,
      m = [],
      y = !0,
      g = [];
    e.forEach((e) => {
      let i,
        r =
          ((i = e.words),
          /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u.test(
            i
          ));
      !r &&
        e.words.trim().length > 0 &&
        ((y = !1),
        m.reverse().forEach((e) => {
          g.push(e);
        }),
        (m = []));
      let n = document.createElement("span");
      n.classList.add(c),
        0 === e.durationMs && n.classList.add("blyrics-zero-dur-animate"),
        r && n.classList.add(o);
      let s = {
        time: e.startTimeMs / 1e3,
        duration: e.durationMs / 1e3,
        lyricElement: n,
        animationStartTimeMs: 1 / 0,
      };
      (n.textContent = e.words),
        (n.dataset.time = String(s.time)),
        (n.dataset.duration = String(s.duration)),
        (n.dataset.content = e.words),
        n.style.setProperty("--blyrics-duration", e.durationMs + "ms"),
        e.isBackground && n.classList.add(u),
        0 === e.words.trim().length && (n.style.display = "inline"),
        t.parts.push(s),
        r ? m.push(n) : g.push(n);
    }),
      y && m.length > 0
        ? (i.classList.add(o),
          m.forEach((e) => {
            g.push(e);
          }))
        : m.length > 0 &&
          m.reverse().forEach((e) => {
            g.push(e);
          }),
      (r = i),
      (n = g),
      (s = /([\s\u200B\u00AD\p{Dash_Punctuation}])/gu),
      (a = []),
      (l = !1),
      (d = () => {
        if (a.length > 0) {
          let e = document.createElement("span");
          a.forEach((t) => {
            e.appendChild(t);
          }),
            l && e.classList.add(u),
            r.appendChild(e),
            (a = []);
        }
      }),
      n.forEach((e) => {
        let t = l !== e.classList.contains(u),
          i = 1 !== e.textContent.length || " " !== e.textContent[0];
        t || a.push(e),
          ((e.textContent.length > 0 &&
            s.test(e.textContent[e.textContent.length - 1])) ||
            t) &&
            d(),
          t && i && (a.push(e), (l = e.classList.contains(u)));
      }),
      d();
  }
  function eO(e, t) {
    let i = document.createElement("span");
    i.classList.add("blyrics--break"),
      (i.style.order = String(t)),
      e.appendChild(i);
  }
  function eP() {
    if (tU.lyricData && tU.areLyricsTicking) {
      let e = document.getElementsByClassName(a)[0],
        t = tU.lyricData;
      (t.lyricWidth = e.clientWidth),
        t.lines.forEach((t) => {
          var i, r;
          let n,
            s,
            a =
              ((i = e),
              (r = t.lyricElement),
              (n = i.getBoundingClientRect()),
              new DOMRect(
                (s = r.getBoundingClientRect()).x - n.x,
                s.y - n.y,
                s.width,
                s.height
              ));
          (t.position = a.y), (t.height = a.height);
        });
    }
  }
  function eR(e, t) {
    return (
      (e = e
        .toLowerCase()
        .replaceAll(/(\p{P})/gu, "")
        .trim()) ===
      (t = t
        .toLowerCase()
        .replaceAll(/(\p{P})/gu, "")
        .trim())
    );
  }
  let eB = [
    "ti",
    "ar",
    "al",
    "au",
    "lr",
    "length",
    "by",
    "offset",
    "re",
    "tool",
    "ve",
    "#",
  ];
  function eU(e) {
    if (!e) return 0;
    if ("number" == typeof e) return e;
    let t = e.split(":"),
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
      return console.error(`Error parsing time string: ${e}`, t), 0;
    }
  }
  function eV(e, t) {
    let i = e.split("\n"),
      r = [],
      n = {};
    if (
      (i.forEach((e) => {
        let t,
          i = (e = e.trim()).match(/^[\[](\w+):(.*)[\]]$/);
        if (i && eB.includes(i[1])) {
          n[i[1]] = i[2];
          return;
        }
        let s = /[\[](\d+:\d+\.\d+)[\]]/g,
          a = [];
        for (; null !== (t = s.exec(e)); ) a.push(eU(t[1]));
        if (0 === a.length) return;
        let l = e.replace(s, "").trim(),
          o = [],
          c = null,
          u = "";
        l.split(/<(\d+:\d+\.\d+)>/g).forEach((e, t) => {
          if (t % 2 == 0)
            e.length > 0 && " " === e[0] && (e = e.substring(1)),
              e.length > 0 &&
                " " === e[e.length - 1] &&
                (e = e.substring(0, e.length - 1)),
              (u += e),
              o.length > 0 &&
                o[o.length - 1].startTimeMs &&
                (o[o.length - 1].words += e);
          else {
            let t = eU(e);
            null !== c && o.length > 0 && (o[o.length - 1].durationMs = t - c),
              o.push({ startTimeMs: t, words: "", durationMs: 0 }),
              (c = t);
          }
        });
        let d = Math.min(...a),
          m = Math.max(...a);
        r.push({
          startTimeMs: d,
          words: u.trim(),
          durationMs: m - d,
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
            (r.durationMs = Math.max(t.startTimeMs - r.startTimeMs, 0)),
              (e.durationMs = Math.max(i - e.startTimeMs, 0));
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
      isNaN(e) &&
        ((e = 0), tZ("[BetterLyrics] Invalid offset in lyrics: " + n.offset)),
        (e *= 1e3),
        r.forEach((t) => {
          (t.startTimeMs -= e),
            t.parts?.forEach((t) => {
              t.startTimeMs -= e;
            });
        });
    }
    return r;
  }
  function eQ(e) {
    let t = [];
    return (
      e.split("\n").forEach((e) => {
        t.push({ startTimeMs: 0, words: e, durationMs: 0 });
      }),
      t
    );
  }
  let e_ = {
      preserveOrder: !1,
      attributeNamePrefix: "@_",
      attributesGroupName: !1,
      textNodeName: "#text",
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
    eY =
      ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",
    eF = RegExp(
      "^" +
        ("[" + eY + "][" + eY) +
        "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    );
  function eW(e, t) {
    let i = [],
      r = t.exec(e);
    for (; r; ) {
      let n = [];
      n.startIndex = t.lastIndex - r[0].length;
      let s = r.length;
      for (let e = 0; e < s; e++) n.push(r[e]);
      i.push(n), (r = t.exec(e));
    }
    return i;
  }
  let e$ = function (e) {
    return null != eF.exec(e);
  };
  e =
    "function" != typeof Symbol ? "@@xmlMetadata" : Symbol("XML Node Metadata");
  class eq {
    constructor(e) {
      (this.tagname = e), (this.child = []), (this[":@"] = {});
    }
    add(e, t) {
      "__proto__" === e && (e = "#__proto__"), this.child.push({ [e]: t });
    }
    addChild(t, i) {
      "__proto__" === t.tagname && (t.tagname = "#__proto__"),
        t[":@"] && Object.keys(t[":@"]).length > 0
          ? this.child.push({ [t.tagname]: t.child, ":@": t[":@"] })
          : this.child.push({ [t.tagname]: t.child }),
        void 0 !== i &&
          (this.child[this.child.length - 1][e] = { startIndex: i });
    }
    static getMetaDataSymbol() {
      return e;
    }
  }
  class eH {
    constructor(e) {
      this.suppressValidationErr = !e;
    }
    readDocType(e, t) {
      let i = {};
      if (
        "O" === e[t + 3] &&
        "C" === e[t + 4] &&
        "T" === e[t + 5] &&
        "Y" === e[t + 6] &&
        "P" === e[t + 7] &&
        "E" === e[t + 8]
      ) {
        t += 9;
        let r = 1,
          n = !1,
          s = !1;
        for (; t < e.length; t++)
          if ("<" !== e[t] || s)
            if (">" === e[t]) {
              if (
                (s
                  ? "-" === e[t - 1] && "-" === e[t - 2] && ((s = !1), r--)
                  : r--,
                0 === r)
              )
                break;
            } else "[" === e[t] ? (n = !0) : e[t];
          else {
            if (n && eZ(e, "!ENTITY", t)) {
              let r, n;
              (t += 7),
                ([r, n, t] = this.readEntityExp(
                  e,
                  t + 1,
                  this.suppressValidationErr
                )),
                -1 === n.indexOf("&") &&
                  (i[r] = { regx: RegExp(`&${r};`, "g"), val: n });
            } else if (n && eZ(e, "!ELEMENT", t)) {
              t += 8;
              let { index: i } = this.readElementExp(e, t + 1);
              t = i;
            } else if (n && eZ(e, "!ATTLIST", t)) t += 8;
            else if (n && eZ(e, "!NOTATION", t)) {
              t += 9;
              let { index: i } = this.readNotationExp(
                e,
                t + 1,
                this.suppressValidationErr
              );
              t = i;
            } else if (eZ(e, "!--", t)) s = !0;
            else throw Error("Invalid DOCTYPE");
            r++;
          }
        if (0 !== r) throw Error("Unclosed DOCTYPE");
      } else throw Error("Invalid Tag instead of DOCTYPE");
      return { entities: i, i: t };
    }
    readEntityExp(e, t) {
      t = eG(e, t);
      let i = "";
      for (; t < e.length && !/\s/.test(e[t]) && '"' !== e[t] && "'" !== e[t]; )
        (i += e[t]), t++;
      if ((eJ(i), (t = eG(e, t)), !this.suppressValidationErr)) {
        if ("SYSTEM" === e.substring(t, t + 6).toUpperCase())
          throw Error("External entities are not supported");
        else if ("%" === e[t])
          throw Error("Parameter entities are not supported");
      }
      let r = "";
      return ([t, r] = this.readIdentifierVal(e, t, "entity")), [i, r, --t];
    }
    readNotationExp(e, t) {
      t = eG(e, t);
      let i = "";
      for (; t < e.length && !/\s/.test(e[t]); ) (i += e[t]), t++;
      this.suppressValidationErr || eJ(i), (t = eG(e, t));
      let r = e.substring(t, t + 6).toUpperCase();
      if (!this.suppressValidationErr && "SYSTEM" !== r && "PUBLIC" !== r)
        throw Error(`Expected SYSTEM or PUBLIC, found "${r}"`);
      (t += r.length), (t = eG(e, t));
      let n = null,
        s = null;
      if ("PUBLIC" === r)
        ([t, n] = this.readIdentifierVal(e, t, "publicIdentifier")),
          (t = eG(e, t)),
          ('"' === e[t] || "'" === e[t]) &&
            ([t, s] = this.readIdentifierVal(e, t, "systemIdentifier"));
      else if (
        "SYSTEM" === r &&
        (([t, s] = this.readIdentifierVal(e, t, "systemIdentifier")),
        !this.suppressValidationErr && !s)
      )
        throw Error("Missing mandatory system identifier for SYSTEM notation");
      return {
        notationName: i,
        publicIdentifier: n,
        systemIdentifier: s,
        index: --t,
      };
    }
    readIdentifierVal(e, t, i) {
      let r = "",
        n = e[t];
      if ('"' !== n && "'" !== n)
        throw Error(`Expected quoted string, found "${n}"`);
      for (t++; t < e.length && e[t] !== n; ) (r += e[t]), t++;
      if (e[t] !== n) throw Error(`Unterminated ${i} value`);
      return [++t, r];
    }
    readElementExp(e, t) {
      t = eG(e, t);
      let i = "";
      for (; t < e.length && !/\s/.test(e[t]); ) (i += e[t]), t++;
      if (!this.suppressValidationErr && !e$(i))
        throw Error(`Invalid element name: "${i}"`);
      t = eG(e, t);
      let r = "";
      if ("E" === e[t] && eZ(e, "MPTY", t)) t += 4;
      else if ("A" === e[t] && eZ(e, "NY", t)) t += 2;
      else if ("(" === e[t]) {
        for (t++; t < e.length && ")" !== e[t]; ) (r += e[t]), t++;
        if (")" !== e[t]) throw Error("Unterminated content model");
      } else if (!this.suppressValidationErr)
        throw Error(`Invalid Element Expression, found "${e[t]}"`);
      return { elementName: i, contentModel: r.trim(), index: t };
    }
    readAttlistExp(e, t) {
      t = eG(e, t);
      let i = "";
      for (; t < e.length && !/\s/.test(e[t]); ) (i += e[t]), t++;
      eJ(i), (t = eG(e, t));
      let r = "";
      for (; t < e.length && !/\s/.test(e[t]); ) (r += e[t]), t++;
      if (!eJ(r)) throw Error(`Invalid attribute name: "${r}"`);
      t = eG(e, t);
      let n = "";
      if ("NOTATION" === e.substring(t, t + 8).toUpperCase()) {
        if (((n = "NOTATION"), (t += 8), (t = eG(e, t)), "(" !== e[t]))
          throw Error(`Expected '(', found "${e[t]}"`);
        t++;
        let i = [];
        for (; t < e.length && ")" !== e[t]; ) {
          let r = "";
          for (; t < e.length && "|" !== e[t] && ")" !== e[t]; )
            (r += e[t]), t++;
          if (!eJ((r = r.trim()))) throw Error(`Invalid notation name: "${r}"`);
          i.push(r), "|" === e[t] && (t = eG(e, ++t));
        }
        if (")" !== e[t]) throw Error("Unterminated list of notations");
        t++, (n += " (" + i.join("|") + ")");
      } else {
        for (; t < e.length && !/\s/.test(e[t]); ) (n += e[t]), t++;
        if (
          !this.suppressValidationErr &&
          ![
            "CDATA",
            "ID",
            "IDREF",
            "IDREFS",
            "ENTITY",
            "ENTITIES",
            "NMTOKEN",
            "NMTOKENS",
          ].includes(n.toUpperCase())
        )
          throw Error(`Invalid attribute type: "${n}"`);
      }
      t = eG(e, t);
      let s = "";
      return (
        "#REQUIRED" === e.substring(t, t + 8).toUpperCase()
          ? ((s = "#REQUIRED"), (t += 8))
          : "#IMPLIED" === e.substring(t, t + 7).toUpperCase()
          ? ((s = "#IMPLIED"), (t += 7))
          : ([t, s] = this.readIdentifierVal(e, t, "ATTLIST")),
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
  let eG = (e, t) => {
    for (; t < e.length && /\s/.test(e[t]); ) t++;
    return t;
  };
  function eZ(e, t, i) {
    for (let r = 0; r < t.length; r++) if (t[r] !== e[i + r + 1]) return !1;
    return !0;
  }
  function eJ(e) {
    if (e$(e)) return e;
    throw Error(`Invalid entity name ${e}`);
  }
  let eK = /^[-+]?0x[a-fA-F0-9]+$/,
    eX = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/,
    e0 = { hex: !0, leadingZeros: !0, decimalPoint: ".", eNotation: !0 },
    e1 = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
  class e4 {
    constructor(e) {
      if (
        ((this.options = e),
        (this.currentNode = null),
        (this.tagsNodeStack = []),
        (this.docTypeEntities = {}),
        (this.lastEntities = {
          apos: { regex: /&(apos|#39|#x27);/g, val: "'" },
          gt: { regex: /&(gt|#62|#x3E);/g, val: ">" },
          lt: { regex: /&(lt|#60|#x3C);/g, val: "<" },
          quot: { regex: /&(quot|#34|#x22);/g, val: '"' },
        }),
        (this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" }),
        (this.htmlEntities = {
          space: { regex: /&(nbsp|#160);/g, val: " " },
          cent: { regex: /&(cent|#162);/g, val: "\xa2" },
          pound: { regex: /&(pound|#163);/g, val: "\xa3" },
          yen: { regex: /&(yen|#165);/g, val: "\xa5" },
          euro: { regex: /&(euro|#8364);/g, val: "€" },
          copyright: { regex: /&(copy|#169);/g, val: "\xa9" },
          reg: { regex: /&(reg|#174);/g, val: "\xae" },
          inr: { regex: /&(inr|#8377);/g, val: "₹" },
          num_dec: {
            regex: /&#([0-9]{1,7});/g,
            val: (e, t) => String.fromCodePoint(Number.parseInt(t, 10)),
          },
          num_hex: {
            regex: /&#x([0-9a-fA-F]{1,6});/g,
            val: (e, t) => String.fromCodePoint(Number.parseInt(t, 16)),
          },
        }),
        (this.addExternalEntities = e2),
        (this.parseXml = e9),
        (this.parseTextData = e3),
        (this.resolveNameSpace = e5),
        (this.buildAttributesMap = e8),
        (this.isItStopNode = ti),
        (this.replaceEntitiesValue = te),
        (this.readStopNodeData = ts),
        (this.saveTextToParentTag = tt),
        (this.addChild = e6),
        (this.ignoreAttributesFn = (function (e) {
          return "function" == typeof e
            ? e
            : Array.isArray(e)
            ? (t) => {
                for (let i of e)
                  if (
                    ("string" == typeof i && t === i) ||
                    (i instanceof RegExp && i.test(t))
                  )
                    return !0;
              }
            : () => !1;
        })(this.options.ignoreAttributes)),
        this.options.stopNodes && this.options.stopNodes.length > 0)
      ) {
        (this.stopNodesExact = new Set()), (this.stopNodesWildcard = new Set());
        for (let e = 0; e < this.options.stopNodes.length; e++) {
          const t = this.options.stopNodes[e];
          "string" == typeof t &&
            (t.startsWith("*.")
              ? this.stopNodesWildcard.add(t.substring(2))
              : this.stopNodesExact.add(t));
        }
      }
    }
  }
  function e2(e) {
    let t = Object.keys(e);
    for (let i = 0; i < t.length; i++) {
      let r = t[i];
      this.lastEntities[r] = { regex: RegExp("&" + r + ";", "g"), val: e[r] };
    }
  }
  function e3(e, t, i, r, n, s, a) {
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
        ? ta(e, this.options.parseTagValue, this.options.numberParseOptions)
        : e;
    }
  }
  function e5(e) {
    if (this.options.removeNSPrefix) {
      let t = e.split(":"),
        i = "/" === e.charAt(0) ? "/" : "";
      if ("xmlns" === t[0]) return "";
      2 === t.length && (e = i + t[1]);
    }
    return e;
  }
  let e7 = RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?", "gm");
  function e8(e, t) {
    if (!0 !== this.options.ignoreAttributes && "string" == typeof e) {
      let i = eW(e, e7),
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
            "__proto__" === a && (a = "#__proto__"),
            void 0 !== s)
          ) {
            this.options.trimValues && (s = s.trim()),
              (s = this.replaceEntitiesValue(s));
            let e = this.options.attributeValueProcessor(r, s, t);
            null == e
              ? (n[a] = s)
              : typeof e != typeof s || e !== s
              ? (n[a] = e)
              : (n[a] = ta(
                  s,
                  this.options.parseAttributeValue,
                  this.options.numberParseOptions
                ));
          } else this.options.allowBooleanAttributes && (n[a] = !0);
      }
      if (Object.keys(n).length) {
        if (this.options.attributesGroupName) {
          let e = {};
          return (e[this.options.attributesGroupName] = n), e;
        }
        return n;
      }
    }
  }
  let e9 = function (e) {
    e = e.replace(/\r\n?/g, "\n");
    let t = new eq("!xml"),
      i = t,
      r = "",
      n = "",
      s = new eH(this.options.processEntities);
    for (let a = 0; a < e.length; a++)
      if ("<" === e[a])
        if ("/" === e[a + 1]) {
          let t = tr(e, ">", a, "Closing Tag is not closed."),
            s = e.substring(a + 2, t).trim();
          if (this.options.removeNSPrefix) {
            let e = s.indexOf(":");
            -1 !== e && (s = s.substr(e + 1));
          }
          this.options.transformTagName &&
            (s = this.options.transformTagName(s)),
            i && (r = this.saveTextToParentTag(r, i, n));
          let l = n.substring(n.lastIndexOf(".") + 1);
          if (s && -1 !== this.options.unpairedTags.indexOf(s))
            throw Error(`Unpaired tag can not be used as closing tag: </${s}>`);
          let o = 0;
          l && -1 !== this.options.unpairedTags.indexOf(l)
            ? ((o = n.lastIndexOf(".", n.lastIndexOf(".") - 1)),
              this.tagsNodeStack.pop())
            : (o = n.lastIndexOf(".")),
            (n = n.substring(0, o)),
            (i = this.tagsNodeStack.pop()),
            (r = ""),
            (a = t);
        } else if ("?" === e[a + 1]) {
          let t = tn(e, a, !1, "?>");
          if (!t) throw Error("Pi Tag is not closed.");
          if (
            ((r = this.saveTextToParentTag(r, i, n)),
            (this.options.ignoreDeclaration && "?xml" === t.tagName) ||
              this.options.ignorePiTags)
          );
          else {
            let e = new eq(t.tagName);
            e.add(this.options.textNodeName, ""),
              t.tagName !== t.tagExp &&
                t.attrExpPresent &&
                (e[":@"] = this.buildAttributesMap(t.tagExp, n)),
              this.addChild(i, e, n, a);
          }
          a = t.closeIndex + 1;
        } else if ("!--" === e.substr(a + 1, 3)) {
          let t = tr(e, "--\x3e", a + 4, "Comment is not closed.");
          if (this.options.commentPropName) {
            let s = e.substring(a + 4, t - 2);
            (r = this.saveTextToParentTag(r, i, n)),
              i.add(this.options.commentPropName, [
                { [this.options.textNodeName]: s },
              ]);
          }
          a = t;
        } else if ("!D" === e.substr(a + 1, 2)) {
          let t = s.readDocType(e, a);
          (this.docTypeEntities = t.entities), (a = t.i);
        } else if ("![" === e.substr(a + 1, 2)) {
          let t = tr(e, "]]>", a, "CDATA is not closed.") - 2,
            s = e.substring(a + 9, t);
          r = this.saveTextToParentTag(r, i, n);
          let l = this.parseTextData(s, i.tagname, n, !0, !1, !0, !0);
          void 0 == l && (l = ""),
            this.options.cdataPropName
              ? i.add(this.options.cdataPropName, [
                  { [this.options.textNodeName]: s },
                ])
              : i.add(this.options.textNodeName, l),
            (a = t + 2);
        } else {
          let s = tn(e, a, this.options.removeNSPrefix),
            l = s.tagName,
            o = s.rawTagName,
            c = s.tagExp,
            u = s.attrExpPresent,
            d = s.closeIndex;
          if (this.options.transformTagName) {
            let e = this.options.transformTagName(l);
            c === l && (c = e), (l = e);
          }
          i &&
            r &&
            "!xml" !== i.tagname &&
            (r = this.saveTextToParentTag(r, i, n, !1));
          let m = i;
          m &&
            -1 !== this.options.unpairedTags.indexOf(m.tagname) &&
            ((i = this.tagsNodeStack.pop()),
            (n = n.substring(0, n.lastIndexOf(".")))),
            l !== t.tagname && (n += n ? "." + l : l);
          let y = a;
          if (
            this.isItStopNode(this.stopNodesExact, this.stopNodesWildcard, n, l)
          ) {
            let t = "";
            if (c.length > 0 && c.lastIndexOf("/") === c.length - 1)
              "/" === l[l.length - 1]
                ? ((l = l.substr(0, l.length - 1)),
                  (n = n.substr(0, n.length - 1)),
                  (c = l))
                : (c = c.substr(0, c.length - 1)),
                (a = s.closeIndex);
            else if (-1 !== this.options.unpairedTags.indexOf(l))
              a = s.closeIndex;
            else {
              let i = this.readStopNodeData(e, o, d + 1);
              if (!i) throw Error(`Unexpected end of ${o}`);
              (a = i.i), (t = i.tagContent);
            }
            let r = new eq(l);
            l !== c && u && (r[":@"] = this.buildAttributesMap(c, n)),
              t && (t = this.parseTextData(t, l, n, !0, u, !0, !0)),
              (n = n.substr(0, n.lastIndexOf("."))),
              r.add(this.options.textNodeName, t),
              this.addChild(i, r, n, y);
          } else {
            if (c.length > 0 && c.lastIndexOf("/") === c.length - 1) {
              if (
                ("/" === l[l.length - 1]
                  ? ((l = l.substr(0, l.length - 1)),
                    (n = n.substr(0, n.length - 1)),
                    (c = l))
                  : (c = c.substr(0, c.length - 1)),
                this.options.transformTagName)
              ) {
                let e = this.options.transformTagName(l);
                c === l && (c = e), (l = e);
              }
              let e = new eq(l);
              l !== c && u && (e[":@"] = this.buildAttributesMap(c, n)),
                this.addChild(i, e, n, y),
                (n = n.substr(0, n.lastIndexOf(".")));
            } else {
              let e = new eq(l);
              this.tagsNodeStack.push(i),
                l !== c && u && (e[":@"] = this.buildAttributesMap(c, n)),
                this.addChild(i, e, n, y),
                (i = e);
            }
            (r = ""), (a = d);
          }
        }
      else r += e[a];
    return t.child;
  };
  function e6(e, t, i, r) {
    this.options.captureMetaData || (r = void 0);
    let n = this.options.updateTag(t.tagname, i, t[":@"]);
    !1 === n || ("string" == typeof n && (t.tagname = n), e.addChild(t, r));
  }
  let te = function (e) {
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
  function tt(e, t, i, r) {
    return (
      e &&
        (void 0 === r && (r = 0 === t.child.length),
        void 0 !==
          (e = this.parseTextData(
            e,
            t.tagname,
            i,
            !1,
            !!t[":@"] && 0 !== Object.keys(t[":@"]).length,
            r
          )) &&
          "" !== e &&
          t.add(this.options.textNodeName, e),
        (e = "")),
      e
    );
  }
  function ti(e, t, i, r) {
    return !!((t && t.has(r)) || (e && e.has(i)));
  }
  function tr(e, t, i, r) {
    let n = e.indexOf(t, i);
    if (-1 !== n) return n + t.length - 1;
    throw Error(r);
  }
  function tn(e, t, i, r = ">") {
    let n = (function (e, t, i = ">") {
      let r,
        n = "";
      for (let s = t; s < e.length; s++) {
        let t = e[s];
        if (r) t === r && (r = "");
        else if ('"' === t || "'" === t) r = t;
        else if (t === i[0]) {
          if (!i[1]) return { data: n, index: s };
          else if (e[s + 1] === i[1]) return { data: n, index: s };
        } else "	" === t && (t = " ");
        n += t;
      }
    })(e, t + 1, r);
    if (!n) return;
    let s = n.data,
      a = n.index,
      l = s.search(/\s/),
      o = s,
      c = !0;
    -1 !== l && ((o = s.substring(0, l)), (s = s.substring(l + 1).trimStart()));
    let u = o;
    if (i) {
      let e = o.indexOf(":");
      -1 !== e && (c = (o = o.substr(e + 1)) !== n.data.substr(e + 1));
    }
    return {
      tagName: o,
      tagExp: s,
      closeIndex: a,
      attrExpPresent: c,
      rawTagName: u,
    };
  }
  function ts(e, t, i) {
    let r = i,
      n = 1;
    for (; i < e.length; i++)
      if ("<" === e[i])
        if ("/" === e[i + 1]) {
          let s = tr(e, ">", i, `${t} is not closed`);
          if (e.substring(i + 2, s).trim() === t && 0 == --n)
            return { tagContent: e.substring(r, i), i: s };
          i = s;
        } else if ("?" === e[i + 1])
          i = tr(e, "?>", i + 1, "StopNode is not closed.");
        else if ("!--" === e.substr(i + 1, 3))
          i = tr(e, "--\x3e", i + 3, "StopNode is not closed.");
        else if ("![" === e.substr(i + 1, 2))
          i = tr(e, "]]>", i, "StopNode is not closed.") - 2;
        else {
          let r = tn(e, i, ">");
          r &&
            ((r && r.tagName) === t &&
              "/" !== r.tagExp[r.tagExp.length - 1] &&
              n++,
            (i = r.closeIndex));
        }
  }
  function ta(e, t, i) {
    if (t && "string" == typeof e) {
      let t = e.trim();
      return (
        "true" === t ||
        ("false" !== t &&
          (function (e, t = {}) {
            if (((t = Object.assign({}, e0, t)), !e || "string" != typeof e))
              return e;
            let i = e.trim();
            if (void 0 !== t.skipLike && t.skipLike.test(i)) return e;
            {
              if ("0" === e) return 0;
              if (t.hex && eK.test(i)) {
                var r,
                  n = i;
                if (parseInt) return parseInt(n, 16);
                if (Number.parseInt) return Number.parseInt(n, 16);
                if (window && window.parseInt) return window.parseInt(n, 16);
                throw Error(
                  "parseInt, Number.parseInt, window.parseInt are not supported"
                );
              }
              if (i.includes("e") || i.includes("E"))
                return (function (e, t, i) {
                  if (!i.eNotation) return e;
                  let r = t.match(e1);
                  if (!r) return e;
                  {
                    let n = r[1] || "",
                      s = -1 === r[3].indexOf("e") ? "E" : "e",
                      a = r[2],
                      l = n ? e[a.length + 1] === s : e[a.length] === s;
                    return a.length > 1 && l
                      ? e
                      : 1 === a.length &&
                        (r[3].startsWith(`.${s}`) || r[3][0] === s)
                      ? Number(t)
                      : i.leadingZeros && !l
                      ? Number((t = (r[1] || "") + r[3]))
                      : e;
                  }
                })(e, i, t);
              let s = eX.exec(i);
              if (!s) return e;
              {
                let n = s[1] || "",
                  a = s[2],
                  l =
                    ((r = s[3]) &&
                      -1 !== r.indexOf(".") &&
                      ("." === (r = r.replace(/0+$/, ""))
                        ? (r = "0")
                        : "." === r[0]
                        ? (r = "0" + r)
                        : "." === r[r.length - 1] &&
                          (r = r.substring(0, r.length - 1))),
                    r),
                  o = n ? "." === e[a.length + 1] : "." === e[a.length];
                if (!t.leadingZeros && (a.length > 1 || (1 === a.length && !o)))
                  return e;
                {
                  let r = Number(i),
                    s = String(r);
                  if (0 === r) return r;
                  if (-1 !== s.search(/[eE]/))
                    if (t.eNotation) return r;
                    else return e;
                  if (-1 !== i.indexOf("."))
                    if ("0" === s) return r;
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
    return void 0 !== e ? e : "";
  }
  let tl = eq.getMetaDataSymbol(),
    to = { allowBooleanAttributes: !1, unpairedTags: [] };
  function tc(e) {
    return " " === e || "	" === e || "\n" === e || "\r" === e;
  }
  function tu(e, t) {
    let i = t;
    for (; t < e.length; t++)
      if ("?" == e[t] || " " == e[t]) {
        let r = e.substr(i, t - i);
        if (t > 5 && "xml" === r)
          return tg(
            "InvalidXml",
            "XML declaration allowed only at the start of the document.",
            th(e, t)
          );
        if ("?" != e[t] || ">" != e[t + 1]) continue;
        t++;
        break;
      }
    return t;
  }
  function td(e, t) {
    if (e.length > t + 5 && "-" === e[t + 1] && "-" === e[t + 2]) {
      for (t += 3; t < e.length; t++)
        if ("-" === e[t] && "-" === e[t + 1] && ">" === e[t + 2]) {
          t += 2;
          break;
        }
    } else if (
      e.length > t + 8 &&
      "D" === e[t + 1] &&
      "O" === e[t + 2] &&
      "C" === e[t + 3] &&
      "T" === e[t + 4] &&
      "Y" === e[t + 5] &&
      "P" === e[t + 6] &&
      "E" === e[t + 7]
    ) {
      let i = 1;
      for (t += 8; t < e.length; t++)
        if ("<" === e[t]) i++;
        else if (">" === e[t] && 0 == --i) break;
    } else if (
      e.length > t + 9 &&
      "[" === e[t + 1] &&
      "C" === e[t + 2] &&
      "D" === e[t + 3] &&
      "A" === e[t + 4] &&
      "T" === e[t + 5] &&
      "A" === e[t + 6] &&
      "[" === e[t + 7]
    ) {
      for (t += 8; t < e.length; t++)
        if ("]" === e[t] && "]" === e[t + 1] && ">" === e[t + 2]) {
          t += 2;
          break;
        }
    }
    return t;
  }
  let tm = RegExp(
    "(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?",
    "g"
  );
  function ty(e, t) {
    let i = eW(e, tm),
      r = {};
    for (let e = 0; e < i.length; e++) {
      if (0 === i[e][1].length)
        return tg(
          "InvalidAttr",
          "Attribute '" + i[e][2] + "' has no space in starting.",
          tp(i[e])
        );
      if (void 0 !== i[e][3] && void 0 === i[e][4])
        return tg(
          "InvalidAttr",
          "Attribute '" + i[e][2] + "' is without value.",
          tp(i[e])
        );
      if (void 0 === i[e][3] && !t.allowBooleanAttributes)
        return tg(
          "InvalidAttr",
          "boolean attribute '" + i[e][2] + "' is not allowed.",
          tp(i[e])
        );
      let n = i[e][2];
      if (!e$(n))
        return tg(
          "InvalidAttr",
          "Attribute '" + n + "' is an invalid name.",
          tp(i[e])
        );
      if (r.hasOwnProperty(n))
        return tg(
          "InvalidAttr",
          "Attribute '" + n + "' is repeated.",
          tp(i[e])
        );
      r[n] = 1;
    }
    return !0;
  }
  function tg(e, t, i) {
    return { err: { code: e, msg: t, line: i.line || i, col: i.col } };
  }
  function th(e, t) {
    let i = e.substring(0, t).split(/\r?\n/);
    return { line: i.length, col: i[i.length - 1].length + 1 };
  }
  function tp(e) {
    return e.startIndex + e[1].length;
  }
  class tf {
    constructor(e) {
      (this.externalEntities = {}), (this.options = Object.assign({}, e_, e));
    }
    parse(e, t) {
      if ("string" != typeof e && e.toString) e = e.toString();
      else if ("string" != typeof e)
        throw Error("XML data is accepted in String or Bytes[] form.");
      if (t) {
        !0 === t && (t = {});
        let i = (function (e, t) {
          t = Object.assign({}, to, t);
          let i = [],
            r = !1,
            n = !1;
          "\uFEFF" === e[0] && (e = e.substr(1));
          for (let s = 0; s < e.length; s++)
            if ("<" === e[s] && "?" === e[s + 1]) {
              if (((s += 2), (s = tu(e, s)).err)) return s;
            } else if ("<" === e[s]) {
              let a = s;
              if ("!" === e[++s]) {
                s = td(e, s);
                continue;
              }
              {
                let l = !1;
                "/" === e[s] && ((l = !0), s++);
                let o = "";
                for (
                  ;
                  s < e.length &&
                  ">" !== e[s] &&
                  " " !== e[s] &&
                  "	" !== e[s] &&
                  "\n" !== e[s] &&
                  "\r" !== e[s];
                  s++
                )
                  o += e[s];
                if (
                  ("/" === (o = o.trim())[o.length - 1] &&
                    ((o = o.substring(0, o.length - 1)), s--),
                  !e$(o))
                )
                  return tg(
                    "InvalidTag",
                    0 === o.trim().length
                      ? "Invalid space after '<'."
                      : "Tag '" + o + "' is an invalid name.",
                    th(e, s)
                  );
                let c = (function (e, t) {
                  let i = "",
                    r = "",
                    n = !1;
                  for (; t < e.length; t++) {
                    if ('"' === e[t] || "'" === e[t])
                      "" === r ? (r = e[t]) : r !== e[t] || (r = "");
                    else if (">" === e[t] && "" === r) {
                      n = !0;
                      break;
                    }
                    i += e[t];
                  }
                  return "" === r && { value: i, index: t, tagClosed: n };
                })(e, s);
                if (!1 === c)
                  return tg(
                    "InvalidAttr",
                    "Attributes for '" + o + "' have open quote.",
                    th(e, s)
                  );
                let u = c.value;
                if (((s = c.index), "/" === u[u.length - 1])) {
                  let i = s - u.length,
                    n = ty((u = u.substring(0, u.length - 1)), t);
                  if (!0 !== n)
                    return tg(n.err.code, n.err.msg, th(e, i + n.err.line));
                  r = !0;
                } else if (l)
                  if (!c.tagClosed)
                    return tg(
                      "InvalidTag",
                      "Closing tag '" + o + "' doesn't have proper closing.",
                      th(e, s)
                    );
                  else {
                    if (u.trim().length > 0)
                      return tg(
                        "InvalidTag",
                        "Closing tag '" +
                          o +
                          "' can't have attributes or invalid starting.",
                        th(e, a)
                      );
                    if (0 === i.length)
                      return tg(
                        "InvalidTag",
                        "Closing tag '" + o + "' has not been opened.",
                        th(e, a)
                      );
                    let t = i.pop();
                    if (o !== t.tagName) {
                      let i = th(e, t.tagStartPos);
                      return tg(
                        "InvalidTag",
                        "Expected closing tag '" +
                          t.tagName +
                          "' (opened in line " +
                          i.line +
                          ", col " +
                          i.col +
                          ") instead of closing tag '" +
                          o +
                          "'.",
                        th(e, a)
                      );
                    }
                    0 == i.length && (n = !0);
                  }
                else {
                  let l = ty(u, t);
                  if (!0 !== l)
                    return tg(
                      l.err.code,
                      l.err.msg,
                      th(e, s - u.length + l.err.line)
                    );
                  if (!0 === n)
                    return tg(
                      "InvalidXml",
                      "Multiple possible root nodes found.",
                      th(e, s)
                    );
                  -1 !== t.unpairedTags.indexOf(o) ||
                    i.push({ tagName: o, tagStartPos: a }),
                    (r = !0);
                }
                for (s++; s < e.length; s++)
                  if ("<" === e[s])
                    if ("!" === e[s + 1]) {
                      s = td(e, ++s);
                      continue;
                    } else if ("?" === e[s + 1]) {
                      if ((s = tu(e, ++s)).err) return s;
                    } else break;
                  else if ("&" === e[s]) {
                    let t = (function (e, t) {
                      if (";" === e[++t]) return -1;
                      if ("#" === e[t]) {
                        var i = ++t;
                        let r = /\d/;
                        for (
                          "x" === e[i] && (i++, (r = /[\da-fA-F]/));
                          i < e.length;
                          i++
                        ) {
                          if (";" === e[i]) return i;
                          if (!e[i].match(r)) break;
                        }
                        return -1;
                      }
                      let r = 0;
                      for (; t < e.length; t++, r++)
                        if (!e[t].match(/\w/) || !(r < 20)) {
                          if (";" === e[t]) break;
                          return -1;
                        }
                      return t;
                    })(e, s);
                    if (-1 == t)
                      return tg(
                        "InvalidChar",
                        "char '&' is not expected.",
                        th(e, s)
                      );
                    s = t;
                  } else if (!0 === n && !tc(e[s]))
                    return tg("InvalidXml", "Extra text at the end", th(e, s));
                "<" === e[s] && s--;
              }
            } else {
              if (tc(e[s])) continue;
              return tg(
                "InvalidChar",
                "char '" + e[s] + "' is not expected.",
                th(e, s)
              );
            }
          return r
            ? 1 == i.length
              ? tg(
                  "InvalidTag",
                  "Unclosed tag '" + i[0].tagName + "'.",
                  th(e, i[0].tagStartPos)
                )
              : !(i.length > 0) ||
                tg(
                  "InvalidXml",
                  "Invalid '" +
                    JSON.stringify(
                      i.map((e) => e.tagName),
                      null,
                      4
                    ).replace(/\r?\n/g, "") +
                    "' found.",
                  { line: 1, col: 1 }
                )
            : tg("InvalidXml", "Start tag expected.", 1);
        })(e, t);
        if (!0 !== i) throw Error(`${i.err.msg}:${i.err.line}:${i.err.col}`);
      }
      let i = new e4(this.options);
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
                    if (":@" !== i) return i;
                  }
                })(l),
                c = "";
              if (((c = void 0 === r ? o : r + "." + o), o === i.textNodeName))
                void 0 === n ? (n = l[o]) : (n += "" + l[o]);
              else if (void 0 === o) continue;
              else if (l[o]) {
                let t = e(l[o], i, c),
                  r = (function (e, t) {
                    let { textNodeName: i } = t,
                      r = Object.keys(e).length;
                    return (
                      0 === r ||
                      (1 === r &&
                        (!!e[i] || "boolean" == typeof e[i] || 0 === e[i]))
                    );
                  })(t, i);
                void 0 !== l[tl] && (t[tl] = l[tl]),
                  l[":@"]
                    ? (function (e, t, i, r) {
                        if (t) {
                          let n = Object.keys(t),
                            s = n.length;
                          for (let a = 0; a < s; a++) {
                            let s = n[a];
                            r.isArray(s, i + "." + s, !0, !0)
                              ? (e[s] = [t[s]])
                              : (e[s] = t[s]);
                          }
                        }
                      })(t, l[":@"], c, i)
                    : 1 !== Object.keys(t).length ||
                      void 0 === t[i.textNodeName] ||
                      i.alwaysCreateTextNode
                    ? 0 === Object.keys(t).length &&
                      (i.alwaysCreateTextNode
                        ? (t[i.textNodeName] = "")
                        : (t = ""))
                    : (t = t[i.textNodeName]),
                  void 0 !== s[o] && s.hasOwnProperty(o)
                    ? (Array.isArray(s[o]) || (s[o] = [s[o]]), s[o].push(t))
                    : i.isArray(o, c, r)
                    ? (s[o] = [t])
                    : (s[o] = t);
              }
            }
            return (
              "string" == typeof n
                ? n.length > 0 && (s[i.textNodeName] = n)
                : void 0 !== n && (s[i.textNodeName] = n),
              s
            );
          })(r, this.options);
    }
    addEntity(e, t) {
      if (-1 !== t.indexOf("&")) throw Error("Entity value can't have '&'");
      if (-1 !== e.indexOf("&") || -1 !== e.indexOf(";"))
        throw Error(
          "An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'"
        );
      if ("&" === t) throw Error("An entity with value '&' is not permitted");
      this.externalEntities[e] = t;
    }
    static getMetaDataSymbol() {
      return eq.getMetaDataSymbol();
    }
  }
  function tM(e, t, i = !1) {
    let r = "",
      n = [],
      s = !1;
    return (
      e.forEach((e) => {
        let a = !1,
          l = [e];
        for (let o of (e[":@"] &&
          "x-bg" === e[":@"]["@_role"] &&
          ((a = !0), (l = e.span)),
        l))
          if (o["#text"] && (!i || l.length <= 1)) {
            r += o["#text"];
            let e = n[n.length - 1];
            n.push({
              startTimeMs: e ? e.startTimeMs + e.durationMs : t,
              durationMs: 0,
              words: o["#text"],
              isBackground: a,
            });
          } else if (o.span) {
            let e = o.span[0]["#text"],
              t = eU(o[":@"]?.["@_begin"]),
              i = eU(o[":@"]?.["@_end"]);
            n.push({
              startTimeMs: t,
              durationMs: i - t,
              isBackground: a,
              words: e,
            }),
              (r += e),
              (s = !0);
          }
      }),
      s || (n = []),
      { parts: n, text: r, isWordSynced: s }
    );
  }
  async function tb(e, t) {
    let i = new tf({
        ignoreAttributes: !1,
        attributeNamePrefix: "@_",
        attributesGroupName: !1,
        textNodeName: "#text",
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
      c = l[":@"],
      u = o.flatMap((e) => e.div);
    if (!(u.length > 0 && void 0 !== u[0][":@"])) {
      (t.sourceMap["bLyrics-richsynced"].lyricSourceResult = null),
        (t.sourceMap["bLyrics-richsynced"].filled = !0),
        (t.sourceMap["bLyrics-synced"].lyricSourceResult = null),
        (t.sourceMap["bLyrics-synced"].filled = !0);
      return;
    }
    let d = !1;
    u.forEach((e) => {
      let t = e[":@"],
        i = eU(t?.["@_begin"]),
        r = eU(t?.["@_end"]),
        s = tM(e.p, i);
      s.isWordSynced && (d = !0),
        n.set(t?.["@_key"] || n.size.toString(), {
          agent: t?.["@_agent"],
          durationMs: r - i,
          parts: s.parts,
          startTimeMs: i,
          words: s.text,
          romanization: void 0,
          timedRomanization: void 0,
          translation: void 0,
        });
    });
    let m = a[0].metadata.find((e) => e.iTunesMetadata);
    if (m) {
      let e = m.iTunesMetadata.find((e) => e.translations),
        t = m.iTunesMetadata.find((e) => e.transliterations);
      if (e && e.translations && e.translations.length > 0) {
        let t = e.translations[0][":@"]["@_lang"];
        e.translations[0].translation.forEach((e) => {
          let i = e.text[0]["#text"],
            r = e[":@"]["@_for"];
          if (t && i && r) {
            let e = n.get(r);
            e && (e.translation = { text: i, lang: t });
          }
        });
      }
      t &&
        t.transliterations &&
        t.transliterations.length > 0 &&
        t.transliterations[0].transliteration.forEach((e) => {
          let t = e[":@"]["@_for"];
          if (t) {
            let i = n.get(t),
              r = i.startTimeMs,
              s = tM(e.text, r, !1);
            (i.romanization = s.text), (i.timedRomanization = s.parts);
          }
        });
    }
    let y = Array.from(n.values());
    y = (function (e, t) {
      if (0 === e.length) return e;
      let i = [],
        r = (e, t) => ({
          startTimeMs: e,
          durationMs: t,
          words: "",
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
      return a > 5e3 && i.push(r(s, a)), i;
    })(y, eU(c["@_dur"]));
    let g = {
      cacheAllowed: !0,
      language: c["@_lang"],
      lyrics: y,
      musicVideoSynced: !1,
      source: "boidu.dev",
      sourceHref: "https://boidu.dev/",
    };
    d
      ? ((t.sourceMap["bLyrics-richsynced"].lyricSourceResult = g),
        (t.sourceMap["bLyrics-synced"].lyricSourceResult = null))
      : ((t.sourceMap["bLyrics-richsynced"].lyricSourceResult = null),
        (t.sourceMap["bLyrics-synced"].lyricSourceResult = g)),
      (t.sourceMap["bLyrics-synced"].filled = !0),
      (t.sourceMap["bLyrics-richsynced"].filled = !0);
  }
  async function tN(e) {
    let t = new URL("https://lyrics-api.boidu.dev/getLyrics");
    t.searchParams.append("s", e.song),
      t.searchParams.append("a", e.artist),
      t.searchParams.append("d", String(e.duration)),
      null != e.album && t.searchParams.append("al", e.album);
    let i = await fetch(t.toString(), {
      signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
    });
    if (!i.ok) {
      (e.sourceMap["bLyrics-richsynced"].filled = !0),
        (e.sourceMap["bLyrics-richsynced"].lyricSourceResult = null),
        (e.sourceMap["bLyrics-synced"].filled = !0),
        (e.sourceMap["bLyrics-synced"].lyricSourceResult = null);
      return;
    }
    let r = await i.json().then((e) => e.ttml);
    await tb(r, e);
  }
  async function tw(e) {
    async function t(e = !1) {
      if (e)
        tZ("[BetterLyrics] Forcing new token, removing any existing one."),
          await chrome.storage.local.remove("jwtToken");
      else {
        let e = await chrome.storage.local.get("jwtToken");
        if (e.jwtToken)
          if (
            !(function (e) {
              try {
                let t = e.split(".")[1];
                if (!t) return !0;
                let i = t.replace(/-/g, "+").replace(/_/g, "/"),
                  r = atob(i),
                  n = JSON.parse(r).exp;
                if (!n) return !0;
                return Date.now() / 1e3 > n;
              } catch (e) {
                return (
                  console.error(
                    "[BetterLyrics] Error decoding JWT on client-side:",
                    e
                  ),
                  !0
                );
              }
            })(e.jwtToken)
          )
            return (
              tZ(
                "[BetterLyrics] \uD83D\uDD11 Using valid, non-expired JWT for bypass."
              ),
              e.jwtToken
            );
          else
            tZ(
              "[BetterLyrics]Local JWT has expired. Removing and requesting a new one."
            ),
              await chrome.storage.local.remove("jwtToken");
      }
      try {
        tZ(
          "[BetterLyrics] No valid JWT found, initiating Turnstile challenge..."
        );
        let e = await new Promise((e, t) => {
            let i = document.createElement("iframe");
            (i.src = "https://lyrics.api.dacubeking.com/challenge"),
              (i.style.position = "fixed"),
              (i.style.bottom =
                "calc(20px + var(--ytmusic-player-bar-height))"),
              (i.style.right = "20px"),
              (i.style.width = "0px"),
              (i.style.height = "0px"),
              (i.style.border = "none"),
              (i.style.zIndex = "999999"),
              document.body.appendChild(i);
            let r = (r) => {
                if (r.source === i.contentWindow)
                  switch (r.data.type) {
                    case "turnstile-token":
                      tZ(
                        "[BetterLyrics] ✅ Received Success Token:",
                        r.data.token
                      ),
                        n(),
                        e(r.data.token);
                      break;
                    case "turnstile-error":
                      console.error(
                        "[BetterLyrics] ❌ Received Challenge Error:",
                        r.data.error
                      ),
                        n(),
                        t(
                          Error(
                            `[BetterLyrics] Turnstile challenge error: ${r.data.error}`
                          )
                        );
                      break;
                    case "turnstile-expired":
                      console.warn("⚠️ Token expired. Resetting challenge."),
                        i.contentWindow.postMessage(
                          { type: "reset-turnstile" },
                          "*"
                        );
                      break;
                    case "turnstile-timeout":
                      console.warn("[BetterLyrics] ⏳ Challenge timed out."),
                        n(),
                        t(
                          Error("[BetterLyrics] Turnstile challenge timed out.")
                        );
                  }
              },
              n = () => {
                window.removeEventListener("message", r),
                  document.body.contains(i) && document.body.removeChild(i);
              };
            window.addEventListener("message", r);
          }),
          t = await fetch(E + "verify-turnstile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: e }),
            credentials: "include",
          });
        if (!t.ok) throw Error(`API verification failed: ${t.statusText}`);
        let i = (await t.json()).jwt;
        if (!i) throw Error("No JWT returned from API after verification.");
        return (
          await chrome.storage.local.set({ jwtToken: i }),
          tZ("[BetterLyrics] ✅ New JWT received and stored."),
          i
        );
      } catch (e) {
        return (
          console.error("[BetterLyrics] Authentication process failed:", e),
          null
        );
      }
    }
    async function i(t) {
      let i = new URL(E + "lyrics");
      return (
        i.searchParams.append("song", e.song),
        i.searchParams.append("artist", e.artist),
        i.searchParams.append("duration", String(e.duration)),
        i.searchParams.append("videoId", e.videoId),
        e.album && i.searchParams.append("album", e.album),
        i.searchParams.append(
          "alwaysFetchMetadata",
          String(e.alwaysFetchMetadata)
        ),
        await fetch(i.toString(), {
          signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
          headers: { Authorization: `Bearer ${t}` },
          credentials: "include",
        })
      );
    }
    let r = await t();
    if (!r) {
      console.error(
        "[BetterLyrics] Could not obtain an initial authentication token. Aborting lyrics fetch."
      ),
        [
          "musixmatch-synced",
          "musixmatch-richsync",
          "lrclib-synced",
          "lrclib-plain",
        ].forEach((t) => {
          e.sourceMap[t].filled = !0;
        });
      return;
    }
    let n = await i(r);
    if (403 === n.status) {
      if (
        (console.warn(
          "[BetterLyrics] Request was blocked (403 Forbidden), possibly by WAF. Forcing new Turnstile challenge."
        ),
        !(r = await t(!0)))
      ) {
        console.error(
          "[BetterLyrics] Could not obtain a new token after WAF block. Aborting."
        ),
          [
            "musixmatch-synced",
            "musixmatch-richsync",
            "lrclib-synced",
            "lrclib-plain",
          ].forEach((t) => {
            e.sourceMap[t].filled = !0;
          });
        return;
      }
      tZ("[BetterLyrics] Retrying API call with new token..."),
        (n = await i(r));
    }
    if (!n.ok) {
      console.error(
        `[BetterLyrics] API request failed with status: ${n.status}`
      ),
        [
          "musixmatch-synced",
          "musixmatch-richsync",
          "lrclib-synced",
          "lrclib-plain",
        ].forEach((t) => {
          e.sourceMap[t].filled = !0;
        });
      return;
    }
    let s = await n.json();
    if (
      (s.album && tZ("[BetterLyrics] Found Album: " + s.album),
      s.musixmatchWordByWordLyrics)
    ) {
      let t = eV(s.musixmatchWordByWordLyrics, Number(e.duration));
      !(function (e) {
        for (let t of e)
          if (t.parts)
            for (let e = 1; e < t.parts.length; e++) {
              let i = t.parts[e],
                r = t.parts[e - 1];
              if (
                " " === i.words &&
                " " !== r.words &&
                (15 >= Math.abs(i.durationMs - r.durationMs) ||
                  i.durationMs <= 100)
              ) {
                let e = i.durationMs;
                (r.durationMs += e), (i.durationMs -= e), (i.startTimeMs += e);
              }
            }
        let t = 0,
          i = 0;
        for (let r of e)
          if (r.parts && 0 !== r.parts.length)
            for (let e = 0; e < r.parts.length - 2; e++) {
              let n = r.parts[e];
              " " !== n.words && (n.durationMs <= 100 && t++, i++);
            }
        if (i > 0 && t / i > 0.5) {
          tZ("Found a lot of short duration lyrics, fudging durations");
          for (let t = 0; t < e.length; t++) {
            let i = e[t];
            if (i.parts && 0 !== i.parts.length)
              for (let r = 0; r < i.parts.length; r++) {
                let n = i.parts[r];
                if (" " !== n.words && n.durationMs <= 400) {
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
                    : " " === s.words
                    ? ((n.durationMs += s.durationMs),
                      (s.startTimeMs += s.durationMs),
                      (s.durationMs = 0))
                    : (n.durationMs = s.startTimeMs - n.startTimeMs);
                }
              }
          }
        }
      })(t),
        (e.sourceMap["musixmatch-richsync"].lyricSourceResult = {
          lyrics: t,
          source: "Musixmatch",
          sourceHref: "https://www.musixmatch.com",
          musicVideoSynced: !1,
          album: s.album,
          artist: s.artist,
          song: s.song,
          duration: s.duration,
          cacheAllowed: !0,
        });
    } else
      e.sourceMap["musixmatch-richsync"].lyricSourceResult = {
        lyrics: null,
        source: "Musixmatch",
        sourceHref: "https://www.musixmatch.com",
        musicVideoSynced: !1,
        album: s.album,
        artist: s.artist,
        song: s.song,
        duration: s.duration,
        cacheAllowed: !0,
      };
    if (s.musixmatchSyncedLyrics) {
      let t = eV(s.musixmatchSyncedLyrics, Number(e.duration));
      e.sourceMap["musixmatch-synced"].lyricSourceResult = {
        lyrics: t,
        source: "Musixmatch",
        sourceHref: "https://www.musixmatch.com",
        musicVideoSynced: !1,
      };
    }
    if (s.lrclibSyncedLyrics) {
      let t = eV(s.lrclibSyncedLyrics, Number(e.duration));
      e.sourceMap["lrclib-synced"].lyricSourceResult = {
        lyrics: t,
        source: "LRCLib",
        sourceHref: "https://lrclib.net",
        musicVideoSynced: !1,
      };
    }
    if (s.lrclibPlainLyrics) {
      let t = eQ(s.lrclibPlainLyrics);
      e.sourceMap["lrclib-plain"].lyricSourceResult = {
        lyrics: t,
        source: "LRCLib",
        sourceHref: "https://lrclib.net",
        musicVideoSynced: !1,
        cacheAllowed: !1,
      };
    }
    if (s.goLyricsApiTtml) {
      let t = JSON.parse(s.goLyricsApiTtml);
      await tb(t.ttml, e);
    }
    [
      "musixmatch-synced",
      "musixmatch-richsync",
      "lrclib-synced",
      "lrclib-plain",
      "bLyrics-richsynced",
      "bLyrics-synced",
    ].forEach((t) => {
      e.sourceMap[t].filled = !0;
    });
  }
  async function tL(e) {
    let t = new URL("https://lrclib.net/api/get");
    t.searchParams.append("track_name", e.song),
      t.searchParams.append("artist_name", e.artist),
      e.album && t.searchParams.append("album_name", e.album),
      t.searchParams.append("duration", String(e.duration));
    let i = await fetch(t.toString(), {
      headers: {
        "Lrclib-Client":
          "BetterLyrics Extension (https://github.com/better-lyrics/better-lyrics)",
      },
      signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
    });
    i.ok ||
      ((e.sourceMap["lrclib-synced"].filled = !0),
      (e.sourceMap["lrclib-plain"].filled = !0),
      (e.sourceMap["lrclib-synced"].lyricSourceResult = null),
      (e.sourceMap["lrclib-plain"].lyricSourceResult = null));
    let r = await i.json();
    r &&
      (tZ("[BetterLyrics] Lyrics found from LRCLIB"),
      r.syncedLyrics &&
        (e.sourceMap["lrclib-synced"].lyricSourceResult = {
          lyrics: eV(r.syncedLyrics, r.duration),
          source: "LRCLib",
          sourceHref: "https://lrclib.net",
          musicVideoSynced: !1,
        }),
      r.plainLyrics &&
        (e.sourceMap["lrclib-plain"].lyricSourceResult = {
          lyrics: eQ(r.plainLyrics),
          source: "LRCLib",
          sourceHref: "https://lrclib.net",
          musicVideoSynced: !1,
          cacheAllowed: !1,
        })),
      (e.sourceMap["lrclib-synced"].filled = !0),
      (e.sourceMap["lrclib-plain"].filled = !0);
  }
  let tS = new Map(),
    tE = new Map(),
    tI = new Map(),
    tT = new Map(),
    tA = null;
  async function tx(e, t = 250) {
    if (tE.has(e)) return tE.get(e);
    {
      let i = 0;
      return await new Promise((r) => {
        let n = setInterval(() => {
          if ((tE.has(e) && (clearInterval(n), r(tE.get(e))), tI.get(e))) {
            let t = tI.get(e).counterpartVideoId;
            t && tE.has(t) && (clearInterval(n), r(tE.get(t)));
          }
          i > t &&
            (clearInterval(n),
            tZ("Failed to sniff lyrics"),
            r({ hasLyrics: !1, lyrics: "", sourceText: "" })),
            (i += 1);
        }, 20);
      });
    }
  }
  async function tD(e, t = 250) {
    if (tI.has(e)) return tI.get(e);
    {
      let i = 0;
      return await new Promise((r) => {
        let n = setInterval(() => {
          if (tI.has(e)) {
            let t = tI.get(e);
            clearInterval(n), r(t);
          }
          i > t &&
            (clearInterval(n),
            tZ("Failed to find Segment Map for video"),
            r(null)),
            (i += 1);
        }, 20);
      });
    }
  }
  async function tv(e) {
    for (let t = 0; t < 250; t++) {
      if (tT.has(e)) return tT.get(e);
      await new Promise((e) => setTimeout(e, 20));
    }
    tZ("Song album information didn't come in time for: ", e);
  }
  let tC = "2.0.0",
    tj = [
      "bLyrics-richsynced",
      "musixmatch-richsync",
      "yt-captions",
      "bLyrics-synced",
      "lrclib-synced",
      "legato-synced",
      "musixmatch-synced",
      "yt-lyrics",
      "lrclib-plain",
    ];
  function tz(e) {
    return tj.includes(e);
  }
  let tk = [],
    tO = {
      "bLyrics-richsynced": tN,
      "bLyrics-synced": tN,
      "musixmatch-richsync": tw,
      "musixmatch-synced": tw,
      "lrclib-synced": tL,
      "lrclib-plain": tL,
      "yt-captions": async function e(e) {
        let t = e.audioTrackData;
        if (0 === t.captionTracks.length) return;
        let i = null;
        if (1 === t.captionTracks.length) i = t.captionTracks[0].languageCode;
        else
          for (let e in t.captionTracks) {
            let r = t.captionTracks[e];
            if (r.displayName.includes("auto-generated")) {
              i = r.languageCode;
              break;
            }
          }
        i ||
          (tZ("Found Caption Tracks, but couldn't determine the default", t),
          (e.sourceMap["yt-captions"].filled = !0),
          (e.sourceMap["yt-captions"].lyricSourceResult = null));
        let r = null;
        for (let e in t.captionTracks) {
          let n = t.captionTracks[e];
          if (
            !n.displayName.includes("auto-generated") &&
            n.languageCode === i
          ) {
            r = new URL(n.url);
            break;
          }
        }
        if (!r) {
          tZ(
            "Only found auto generated lyrics for youtube captions, not using",
            t
          ),
            (e.sourceMap["yt-captions"].filled = !0),
            (e.sourceMap["yt-captions"].lyricSourceResult = null);
          return;
        }
        (r = new URL(r)).searchParams.set("fmt", "json3");
        let n = await fetch(r.toString(), {
            method: "GET",
            signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
          }).then((e) => e.json()),
          s = [];
        n.events.forEach((e) => {
          let t = "";
          for (let i in e.segs) t += e.segs[i].utf8;
          for (let e of ((t = t.replace(/\n/g, " ")),
          "♪\uD834\uDD60\uD834\uDD61\uD834\uDD62\uD834\uDD63\uD834\uDD64"))
            (t = t.trim()).startsWith(e) && (t = t.substring(1)),
              t.endsWith(e) && (t = t.substring(0, t.length - 1));
          (t = t.trim()),
            s.push({
              startTimeMs: e.tStartMs,
              words: t,
              durationMs: e.dDurationMs,
            });
        }),
          s.every((e) => e.words.toUpperCase() === e.words) &&
            s.every(
              (e) => (
                (e.words =
                  e.words.substring(0, 1).toUpperCase() +
                  e.words.substring(1).toLowerCase()),
                !0
              )
            ),
          (e.sourceMap["yt-captions"].filled = !0),
          (e.sourceMap["yt-captions"].lyricSourceResult = {
            lyrics: s,
            language: i,
            source: "Youtube Captions",
            sourceHref: "",
            musicVideoSynced: !0,
          });
      },
      "yt-lyrics": async function e(e) {
        let t = await tx(e.videoId);
        if (t.hasLyrics) {
          let i = t.lyrics,
            r = t.sourceText.substring(8) + " (via YT)",
            n = eQ(i);
          (e.sourceMap["yt-lyrics"].lyricSourceResult = {
            lyrics: n,
            text: i,
            source: r,
            sourceHref: "",
            musicVideoSynced: !1,
            cacheAllowed: !1,
          }),
            (e.sourceMap["yt-lyrics"].filled = !0);
        }
      },
      "legato-synced": async function e(e) {
        let t = () => {
          (e.sourceMap["legato-synced"].filled = !0),
            (e.sourceMap["legato-synced"].lyricSourceResult = null);
        };
        try {
          let i = new URL("https://lyrics-api.boidu.dev/kugou/getLyrics");
          i.searchParams.append("s", e.song),
            i.searchParams.append("a", e.artist),
            i.searchParams.append("d", String(e.duration)),
            e.album && i.searchParams.append("al", e.album);
          let r = await fetch(i.toString(), {
            signal: AbortSignal.any([e.signal, AbortSignal.timeout(1e4)]),
          });
          if (!r.ok) return void t();
          let n = await r.json();
          if (!n.lyrics) return void t();
          (e.sourceMap["legato-synced"].lyricSourceResult = {
            lyrics: eV(n.lyrics, 1e3 * e.duration),
            source: "Better Lyrics Legato",
            sourceHref: "https://boidu.dev/",
            musicVideoSynced: !1,
          }),
            (e.sourceMap["legato-synced"].filled = !0);
        } catch (e) {
          tZ(T, "Legato provider error:", e), t();
        }
      },
    };
  async function tP(e, t) {
    let i = e.sourceMap[t];
    if (!i.filled) {
      let r = `blyrics_${e.videoId}_${t}`,
        n = await V(r);
      if (n) {
        let e = JSON.parse(n);
        if (e && e.version && e.version === tC)
          return (
            (i.filled = !0), (i.lyricSourceResult = e), (i.resultCached = !0), e
          );
      }
      await i.lyricSourceFiller(e);
    }
    return (
      tj.forEach((t) => {
        let i = e.sourceMap[t];
        i.filled &&
          !i.resultCached &&
          i.lyricSourceResult &&
          !1 !== i.lyricSourceResult.cacheAllowed &&
          ((i.resultCached = !0),
          Q(
            `blyrics_${e.videoId}_${t}`,
            JSON.stringify({ version: tC, ...i.lyricSourceResult }),
            2592e6
          ));
      }),
      i.lyricSourceResult
    );
  }
  function tR(e, t) {
    if (
      t &&
      e &&
      ((e.isMusicVideoSynced = !e.isMusicVideoSynced), "none" !== e.syncType)
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
        (i.time = i.time + r),
          (i.lyricElement.dataset.time = String(i.time)),
          i.parts.forEach((e) => {
            (e.time = e.time + r),
              (e.lyricElement.dataset.time = String(e.time));
          });
      }
  }
  async function tB(e, t) {
    var i;
    let r,
      n = e.song,
      a = e.artist,
      l = e.videoId,
      o = Number(e.duration),
      c = e.audioTrackData,
      u = 0 !== e.contentRect.width && 0 !== e.contentRect.height;
    if (!l) return void tZ(D, "Invalid video id");
    let d = await tD(l, 1),
      m = !1,
      y =
        (d &&
          d.counterpartVideoId &&
          d.counterpartVideoId === tU.lastLoadedVideoId) ||
        tU.lastLoadedVideoId === l,
      g = d?.segmentMap || null;
    y && g
      ? (tR(tU.lyricData, g),
        (tU.areLyricsTicking = !0),
        tZ("Switching between audio/video: Skipping Loader", g))
      : (tZ("Not Switching between audio/video", y, g),
        eN(),
        Z(),
        (d = await tD(l)),
        (g = d?.segmentMap || null),
        (tU.areLyricsLoaded = !1),
        (tU.areLyricsTicking = !1)),
      u &&
        d &&
        d.counterpartVideoId &&
        d.segmentMap &&
        (tZ("Switching VideoId to Audio Id"),
        (m = !0),
        (l = d.counterpartVideoId));
    let h = document.getElementsByClassName(s)[1];
    if (
      (console.assert(null != h), "true" !== h.getAttribute("aria-selected"))
    ) {
      (tU.areLyricsLoaded = !1),
        (tU.areLyricsTicking = !1),
        (tU.lyricInjectionFailed = !0),
        tZ(
          "[BetterLyrics] (Safe to ignore) Lyrics tab is hidden, skipping lyrics fetch"
        );
      return;
    }
    (n = n.trim()), (a = (a = a.trim()).replace(", & ", ", "));
    let p = await tv(l);
    if ((p || (p = ""), !n || !a))
      return void tZ(D, "Empty song or artist name");
    tZ("[BetterLyrics] Fetching lyrics for:", n, a);
    let f = null,
      M = {
        song: n,
        artist: a,
        duration: o,
        videoId: l,
        audioTrackData: c,
        album: p,
        sourceMap:
          ((i = (e) => ({
            filled: !1,
            lyricSourceResult: null,
            resultCached: !1,
            lyricSourceFiller: e,
          })),
          Object.fromEntries(Object.entries(tO).map(([e, t]) => [e, i(t, e)]))),
        alwaysFetchMetadata: m,
        signal: t,
      },
      b = tP(M, "yt-lyrics").then(
        (e) => (
          !tU.areLyricsLoaded &&
            e &&
            (tZ(
              "[BetterLyrics] Temporarily Using YT Music Lyrics while we wait for synced lyrics to load"
            ),
            ez(
              {
                ...e,
                song: M.song,
                artist: M.artist,
                duration: M.duration,
                videoId: M.videoId,
                album: M.album || "",
                segmentMap: null,
              },
              !0
            )),
          e
        )
      );
    try {
      let e = await tP(M, "musixmatch-richsync");
      e &&
        e.album &&
        e.album.length > 0 &&
        p !== e.album &&
        (M.album = e.album),
        e &&
          e.song &&
          e.song.length > 0 &&
          n !== e.song &&
          (tZ("Using '" + e.song + "' for song instead of '" + n + "'"),
          (M.song = e.song)),
        e &&
          e.artist &&
          e.artist.length > 0 &&
          a !== e.artist &&
          (tZ("Using '" + e.artist + "' for artist instead of '" + a + "'"),
          (M.artist = e.artist)),
        e &&
          e.duration &&
          o !== e.duration &&
          (tZ("Using '" + e.duration + "' for duration instead of '" + o + "'"),
          (M.duration = e.duration));
    } catch (e) {
      tZ(e);
    }
    for (let e of tk) {
      if (t.aborted) return;
      try {
        let t = await tP(M, e);
        if (t && t.lyrics && t.lyrics.length > 0) {
          let i = await b;
          if (null !== i) {
            let e = "";
            t.lyrics.forEach((t) => {
              e += t.words + "\n";
            });
            let r = eD(e.toLowerCase(), i.text.toLowerCase());
            if (r < 0.5) {
              tZ(
                `Got lyrics from ${t.source}, but they don't match yt lyrics. Rejecting: Match: ${r}%`
              );
              continue;
            }
          }
          (f = t), (r = e);
          break;
        }
      } catch (e) {
        tZ(e);
      }
    }
    if (
      (f ||
        (f = {
          lyrics: [{ startTimeMs: 0, words: v, durationMs: 0 }],
          source: "Unknown",
          sourceHref: "",
          musicVideoSynced: !1,
          cacheAllowed: !1,
        }),
      !f.lyrics)
    )
      throw Error("Lyrics.lyrics is null or undefined. Report this bug");
    u === (!0 === f.musicVideoSynced) && (g = null),
      tZ("Got Lyrics from " + f.source);
    let N = {
      song: M.song,
      artist: M.artist,
      album: M.album || "",
      duration: M.duration,
      videoId: M.videoId,
      segmentMap: g,
      providerKey: r,
      ...f,
    };
    (tU.lastLoadedVideoId = e.videoId), t.aborted || ez(N);
  }
  let tU = {
    suppressZeroTime: 0,
    areLyricsTicking: !1,
    lyricData: null,
    areLyricsLoaded: !1,
    lyricInjectionFailed: !1,
    lastVideoId: null,
    lastVideoDetails: null,
    lyricInjectionPromise: null,
    queueLyricInjection: !1,
    queueAlbumArtInjection: !1,
    shouldInjectAlbumArt: "Unknown",
    queueSongDetailsInjection: !1,
    loaderAnimationEndTimeout: void 0,
    lastLoadedVideoId: null,
    lyricAbortController: null,
    animationSettings: {
      disableRichSynchronization: !1,
      lineSyncedWordDelayMs: 50,
    },
    isTranslateEnabled: !1,
    isRomanizationEnabled: !1,
    translationLanguage: "en",
  };
  function tV() {
    tU.lastVideoId = null;
  }
  let tQ = {
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
      lastFirstActiveElement: -1,
      doneFirstInstantScroll: !0,
    },
    t_ = new Map();
  function tY(e, t) {
    let i = t_.get(t);
    return (
      void 0 === i &&
        ((i = tH(window.getComputedStyle(e).getPropertyValue(t))),
        t_.set(t, i)),
      i
    );
  }
  let tF = new Map();
  // --- BẮT ĐẦU FIX: Thêm biến cache ra ngoài ---
let cached_LyricsHeight = 0; // Thay cho M
let cached_ViewportHeight = 0; // Thay cho N
let cached_LyricsContainer = null; // Cache element t
let cached_ScrollContainer = null; // Cache element b

// Reset cache khi resize màn hình
window.addEventListener('resize', () => {
    cached_LyricsHeight = 0;
    cached_ViewportHeight = 0;
});
// --- KẾT THÚC FIX ---
  function tW(e, t, i = !0, r = !0) {
    let n = Date.now();
    if (ew() || !tU.areLyricsTicking || (0 === e && !i)) return;
    (tQ.lastTime = e), (tQ.lastPlayState = i), (tQ.lastEventCreationTime = t);
    let o = n - t;
    i || (o = 0), (e += o / 1e3);
    let c = document.getElementsByClassName(s)[1];
    console.assert(null != c);
    let u = document
      .getElementById("player-page")
      ?.getAttribute("player-ui-state");
    if (
      "true" !== c.getAttribute("aria-selected") ||
      !(
        !u ||
        "PLAYER_PAGE_OPEN" === u ||
        "FULLSCREEN" === u ||
        "MINIPLAYER_IN_PLAYER_PAGE" === u
      )
    ) {
      tQ.doneFirstInstantScroll = !1;
      return;
    }
    if (eL()) return void eS();
    eE();
    try {
      let t = document.getElementsByClassName(a)[0];
      if (!t) {
        (tU.areLyricsTicking = !1),
          tZ(
            "[BetterLyrics] No lyrics element found on the page, skipping lyrics injection"
          );
        return;
      }
      let s = tU.lyricData;
      if (!s) {
        (tU.areLyricsTicking = !1),
          tZ("Lyrics are ticking, but lyricData are null!");
        return;
      }
      let o = tU.lyricData.lines;
      "richsync" === s.syncType
        ? (e += tY(t, "--blyrics-richsync-timing-offset") / 1e3)
        : (e += tY(t, "--blyrics-timing-offset") / 1e3);
      let c = e + tY(t, "--blyrics-scroll-timing-offset") / 1e3,
        u = null,
        h = o[0],
        p = 999;
      o.every((t, r) => {
        let s = t.time,
          a = 1 / 0;
        if (
          (r + 1 < o.length && (a = o[r + 1].time),
          c >= s && (c < a || c < s + t.duration))
        ) {
          (h = t), (p = a - c);
          let e = c < a - 0.3 || c < s + t.duration - 0.3;
          null == u &&
            (e || tQ.lastFirstActiveElement === r) &&
            ((u = t), (tQ.lastFirstActiveElement = r)),
            (tQ.selectedElementIndex = r),
            t.isScrolled ||
              (t.lyricElement.classList.add(l), (t.isScrolled = !0));
        } else
          t.isScrolled &&
            (t.lyricElement.classList.remove(l), (t.isScrolled = !1));
        let g = 2;
        i || (g = 0);
        let f = Math.max(a, s + t.duration + 0.05);
        if (e + g >= s && e < f) {
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
                    ? (e.lyricElement.classList.remove(d),
                      e.lyricElement.classList.remove(y))
                    : e.lyricElement.classList.add(m);
                });
          }
          t.isAnimating ||
            ([t, ...t.parts].forEach((t) => {
              let i = t.duration,
                r = t.time,
                s = e - r;
              t.lyricElement.classList.remove(d),
                t.lyricElement.classList.remove(m),
t.lyricElement.style.setProperty("--blyrics-swipe-delay", -s - 0.1 * i + "s");
t.lyricElement.style.setProperty("--blyrics-anim-delay", -s + "s");
t.lyricElement.classList.add(y);

// --- FIX BY GEMINI: Xóa tG, dùng requestAnimationFrame ---
// Kỹ thuật này giúp kích hoạt animation frame tiếp theo mà KHÔNG gây lag 1.3s
requestAnimationFrame(() => {
    t.lyricElement.classList.add(d);
});
// ---------------------------------------------------------

t.animationStartTimeMs = n - 1e3 * s;
            }),
            (t.isAnimating = !0),
            (t.isAnimationPlayStatePlaying = !0),
            (t.accumulatedOffsetMs = 0));
        } else
          t.isSelected &&
            ([t, ...t.parts].forEach((e) => {
              e.lyricElement.style.setProperty("--blyrics-swipe-delay", ""),
                e.lyricElement.style.setProperty("--blyrics-anim-delay", ""),
                e.lyricElement.classList.remove(d),
                e.lyricElement.classList.remove(y),
                e.lyricElement.classList.remove(m),
                (e.animationStartTimeMs = 1 / 0);
            }),
            (t.isSelected = !1),
            (t.isAnimating = !1));
        return !0;
      }),
        tQ.lastFirstActiveElement === tQ.selectedElementIndex &&
          (tQ.lastFirstActiveElement = -1);
// --- FIX BỞI GEMINI: Chỉ đo lại khi cần thiết ---
// 1. Lấy element container cuộn (b)
let b = cached_ScrollContainer;
if (!b || !b.isConnected) {
    b = document.querySelector(f); // Chỉ query lại nếu chưa có hoặc đã bị xóa
    cached_ScrollContainer = b;
    cached_ViewportHeight = 0; // Reset height cache vì element mới
}

// 2. Lấy chiều cao Lyrics (M)
// Nếu chưa có cache hoặc cache = 0 thì mới đo
if (cached_LyricsHeight === 0 && t) {
     cached_LyricsHeight = t.getBoundingClientRect().height;
}
let M = cached_LyricsHeight;

// 3. Lấy chiều cao Viewport (N)
if (cached_ViewportHeight === 0 && b) {
    cached_ViewportHeight = b.getBoundingClientRect().height;
}
let N = cached_ViewportHeight;

let L = b ? b.scrollTop : 0;
// --- HẾT PHẦN FIX ---
      if (tQ.scrollResumeTime < Date.now() || -1 === tQ.scrollPos) {
        tQ.wasUserScrolling &&
          (tq().setAttribute("autoscroll-hidden", "true"),
          t.classList.remove(g),
          (tQ.wasUserScrolling = !1)),
          null == u && (u = h);
        let e = 0.37 * N - h.height / 2,
          i = h.position - e;
        if (
          ((i = Math.min(i, u.position)),
          (i = Math.max(i, h.position - N + h.height)),
          (i = Math.min(i, h.position)),
          (i = Math.max(0, i)),
          0 !== L ||
            tQ.doneFirstInstantScroll ||
            ((r = !1),
            (tQ.doneFirstInstantScroll = !0),
            (tQ.nextScrollAllowedTime = 0)),
          Math.abs(L - i) > 2 && Date.now() > tQ.nextScrollAllowedTime)
        ) {
          if (r) {
            (t.style.transitionTimingFunction = ""),
              (t.style.transitionProperty = ""),
              (t.style.transitionDuration = "");
            let e = tY(t, "transition-duration");
            e > 1e3 * p - 50 && (e = 1e3 * p - 50),
              e < 200 && (e = 200),
              (t.style.transition = "transform 0s ease-in-out 0s"),
              (t.style.transform = `translate(0px, ${-(L - i)}px)`),
              tG(t),
              e < 500
                ? ((t.style.transitionProperty = "transform"),
                  (t.style.transitionTimingFunction = "ease"))
                : (t.style.transition = ""),
              (t.style.transitionDuration = `${e}ms`),
              (t.style.transform = "translate(0px, 0px)"),
              (tQ.nextScrollAllowedTime = e + Date.now() + 20);
          }
          let e = Math.max(0.63 * N, N - M);
          (document.getElementById(w).style.height = `${e.toFixed(0)}px`),
            (L = i),
            (tQ.scrollPos = i);
        }
      } else
        tQ.wasUserScrolling ||
          (tq().removeAttribute("autoscroll-hidden"),
          t.classList.add(g),
          (tQ.wasUserScrolling = !0));
      Math.abs(L - b.scrollTop) > 1 &&
        ((b.scrollTop = L),
        (tQ.skipScrolls += 1),
        tQ.skipScrollsDecayTimes.push(Date.now() + 2e3));
      let S = 0;
      for (
        ;
        S < tQ.skipScrollsDecayTimes.length &&
        !(tQ.skipScrollsDecayTimes[S] > n);
        S++
      );
      (tQ.skipScrollsDecayTimes = tQ.skipScrollsDecayTimes.slice(S)),
        (tQ.skipScrolls -= S),
        tQ.skipScrolls < 1 && (tQ.skipScrolls = 1);
    } catch (e) {
      e.message?.includes("undefined") ||
        tZ("[BetterLyrics] Error in lyrics check interval:", e);
    }
  }
  function t$() {
    tU.areLyricsTicking &&
      (eP(), tW(tQ.lastTime, tQ.lastEventCreationTime, tQ.lastPlayState, !1));
  }
  function tq() {
    let e = document.getElementById("autoscroll-resume-button");
    if (!e) {
      let t = document.createElement("div");
      (t.id = "autoscroll-resume-wrapper"),
        (t.className = "autoscroll-resume-wrapper"),
        ((e = document.createElement("button")).id =
          "autoscroll-resume-button"),
        (e.innerText = "Resume Autoscroll"),
        e.classList.add("autoscroll-resume-button"),
        e.setAttribute("autoscroll-hidden", "true"),
        e.addEventListener("click", () => {
          (tQ.scrollResumeTime = 0),
            e.setAttribute("autoscroll-hidden", "true");
        }),
        document.querySelector("#side-panel > tp-yt-paper-tabs").after(t),
        t.appendChild(e);
    }
    return e;
  }
  function tH(e) {
    return e
      ? e.endsWith("ms")
        ? parseFloat(e.slice(0, -2))
        : e.endsWith("s")
        ? 1e3 * parseFloat(e.slice(0, -1))
        : 0
      : 0;
  }
  function tG(e) {
    e.offsetHeight;
  }
  let tZ = (...e) => {
    B({ isLogsEnabled: !0 }, (t) => {
      t.isLogsEnabled && console.log(e);
    });
  };
  function tJ() {
    B({ isLogsEnabled: !0 }, (e) => {
      tZ = e.isLogsEnabled ? console.log.bind(window.console) : function () {};
    });
  }
  function tK(e) {
    let t = (function (e) {
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
      })(e),
      i = !1,
      r = "true" === t.get("blyrics-disable-richsync");
    r !== tU.animationSettings.disableRichSynchronization &&
      ((i = !0), (tU.animationSettings.disableRichSynchronization = r));
    let n = Number(t.get("blyrics-line-synced-animation-delay") || 50);
    n !== tU.animationSettings.lineSyncedWordDelayMs &&
      ((i = !0), (tU.animationSettings.lineSyncedWordDelayMs = n)),
      i && tV();
    let s = document.getElementById("blyrics-custom-style");
    s
      ? (s.textContent = e)
      : (((s = document.createElement("style")).id = "blyrics-custom-style"),
        (s.textContent = e),
        document.head.appendChild(s)),
      t_.clear(),
      tF.clear();
  }
  async function tX() {
    let e, t;
    tJ(),
      await eT(),
      (function e() {
        let t = document.querySelector(C),
          i = document.querySelector(f);
        if (!t || !i) return void setTimeout(e, 1e3);
        let r = document.getElementById(z);
        r || (((r = document.createElement("div")).id = z), i.prepend(r)),
          eL() && eS(),
          new MutationObserver(() => {
            eL() ? eS() : eE();
          }).observe(t, { attributes: !0, attributeFilter: [j] });
      })(),
      (function e() {
        let t = document.getElementsByClassName(s)[1];
        t
          ? (t.removeAttribute("disabled"),
            t.setAttribute("aria-disabled", "false"),
            new MutationObserver((e) => {
              e.forEach((e) => {
                "disabled" === e.attributeName &&
                  (t.removeAttribute("disabled"),
                  t.setAttribute("aria-disabled", "false"));
              });
            }).observe(t, { attributes: !0 }))
          : setTimeout(() => {
              e();
            }, 1e3);
      })(),
      document.addEventListener(
        "keydown",
        (e) => {
          if (
            ("f" !== e.key && "F" !== e.key) ||
            e.metaKey ||
            e.ctrlKey ||
            e.altKey
          )
            return;
          let t = e.target;
          "INPUT" === t.tagName ||
            "TEXTAREA" === t.tagName ||
            t.isContentEditable ||
            ey(e);
        },
        { capture: !0 }
      ),
      (function e() {
        let t = document.querySelector("ytmusic-app-layout");
        if (!t) return void setTimeout(e, 1e3);
        let i = !1;
        new MutationObserver(() => {
          let e = "FULLSCREEN" === t.getAttribute("player-ui-state");
          i &&
            !e &&
            (function () {
              if (!es) return;
              es = !1;
              let e = document.querySelector(".toggle-player-page-button");
              e && e.click();
            })(),
            (i = e);
        }).observe(t, { attributes: !0, attributeFilter: ["player-ui-state"] });
      })(),
      (function e() {
        let t = document.querySelector("#song-media-window .fullscreen-button");
        t
          ? t.addEventListener("click", ey, { capture: !0 })
          : setTimeout(e, 1e3);
      })(),
      ei(),
      J(),
      (function e(t, i) {
        let r = document.querySelector("ytmusic-app-layout");
        if (!r) return void setTimeout(() => e(t, i), 1e3);
        let n = r.hasAttribute("player-fullscreened");
        new MutationObserver(() => {
          let e = r.hasAttribute("player-fullscreened");
          !n && e ? t() : n && !e && i(), (n = e);
        }).observe(r, {
          attributes: !0,
          attributeFilter: ["player-fullscreened"],
        });
      })(
        () => void (eo(), document.addEventListener("visibilitychange", ec)),
        () =>
          void (el && (el.release(), (el = null)),
          document.removeEventListener("visibilitychange", ec))
      ),
      er(),
      chrome.storage.onChanged.addListener(async (e, t) => {
        if (
          ("sync" === t || "local" === t) &&
          e.customCSS &&
          e.customCSS.newValue
        ) {
          let t = e.customCSS.newValue;
          t.startsWith("__COMPRESSED__") && (t = await P(t)), tK(t);
        }
      }),
      U(),
      await W(),
      await Y(),
      chrome.runtime.onMessage.addListener((e, t, i) => {
        if ("updateCSS" === e.action)
          e.css
            ? (tK(e.css), eP())
            : U().then(() => {
                eP();
              });
        else if ("updateSettings" === e.action)
          Z(),
            tJ(),
            ei(),
            J(),
            er(),
            (tU.shouldInjectAlbumArt = "Unknown"),
            X(
              () => (tU.shouldInjectAlbumArt = !0),
              () => {
                let e;
                (tU.shouldInjectAlbumArt = !1),
                  ef && (ef.disconnect(), (ef = null)),
                  (e = document.getElementById("layout")) &&
                    (e.style.removeProperty("--blyrics-background-img"),
                    tZ("[BetterLyrics] Album art removed from the layout"));
              }
            ),
            tV();
        else if ("clearCache" === e.action)
          try {
            F(), tV(), i({ success: !0 });
          } catch {
            i({ success: !1 });
          }
      }),
      (function e() {
        let t = document.getElementsByClassName(
            "tab-content style-scope tp-yt-paper-tab"
          ),
          [i, r, n] = Array.from(t);
        if (void 0 !== i && void 0 !== r && void 0 !== n) {
          for (let e = 0; e < t.length; e++)
            t[e].addEventListener("click", () => {
              let t = document.querySelector(f);
              (ed[eu] = t.scrollTop),
                (t.scrollTop = ed[e]),
                setTimeout(() => {
                  (t.scrollTop = ed[e]),
                    (tU.areLyricsTicking =
                      tU.areLyricsLoaded &&
                      tU.lyricData?.syncType !== "none" &&
                      1 === e);
                }, 0),
                (eu = e),
                1 !== e && (tU.areLyricsTicking = !1);
            });
          r.addEventListener("click", () => {
            tq().classList.remove("blyrics-hidden"),
              tU.areLyricsLoaded ||
                (tZ("[BetterLyrics] Lyrics tab clicked, fetching lyrics"),
                eA(),
                eN(),
                tV());
          });
          let e = () => {
            tq().classList.add("blyrics-hidden");
          };
          i.addEventListener("click", e), n.addEventListener("click", e);
        } else setTimeout(() => e(), 1e3);
      })(),
      document.addEventListener("blyrics-send-player-time", (e) => {
        var t, i;
        let r,
          n,
          a,
          l,
          o,
          c,
          u = e.detail,
          d = u.videoId,
          m = u.song + " " + u.artist;
        if (d !== tU.lastVideoId || m !== tU.lastVideoDetails) {
          if (
            ((tU.areLyricsTicking = !1),
            (tU.lastVideoId = d),
            (tU.lastVideoDetails = m),
            !u.song || !u.artist)
          )
            return void tZ(
              "Lyrics switched: Still waiting for metadata ",
              u.videoId
            );
          tZ("[BetterLyrics] Song has been switched", u.videoId),
            (tU.queueLyricInjection = !0),
            (tU.queueAlbumArtInjection = !0),
            (tU.queueSongDetailsInjection = !0),
            (tU.suppressZeroTime = Date.now() + 5e3);
        }
        if (
          (tU.queueSongDetailsInjection &&
            u.song &&
            u.artist &&
            document.getElementById("main-panel") &&
            ((tU.queueSongDetailsInjection = !1),
            (t = u.song),
            (i = u.artist),
            console.assert(null != (r = document.getElementById("main-panel"))),
            (n = document.getElementById("blyrics-song-info")),
            (a = document.getElementById("blyrics-watermark")),
            n?.remove(),
            a?.remove(),
            ((l = document.createElement("p")).id = "blyrics-title"),
            (l.textContent = t),
            ((o = document.createElement("p")).id = "blyrics-artist"),
            (o.textContent = i),
            ((c = document.createElement("div")).id = "blyrics-song-info"),
            c.appendChild(l),
            c.appendChild(o),
            r.appendChild(c)),
          tU.queueAlbumArtInjection &&
            !0 === tU.shouldInjectAlbumArt &&
            ((tU.queueAlbumArtInjection = !1),
            (function (e) {
              if (!e) return;
              ef && ef.disconnect();
              let t = () => {
                  let t = document.querySelector(p);
                  t.src.startsWith("data:image")
                    ? eI("https://img.youtube.com/vi/" + e + "/0.jpg")
                    : eI(t.src);
                },
                i = document.querySelector(p),
                r = new MutationObserver(() => {
                  t(),
                    tZ(
                      "[BetterLyrics] Album art added to the layout from mutation event"
                    );
                });
              r.observe(i, { attributes: !0 }),
                (ef = r),
                t(),
                tZ("[BetterLyrics] Album art added to the layout");
            })(d)),
          tU.lyricInjectionFailed)
        ) {
          let e = document.getElementsByClassName(s)[1];
          if (e && "true" !== e.getAttribute("aria-selected")) return;
        }
        if (tU.queueLyricInjection || tU.lyricInjectionFailed) {
          let e = document.getElementsByClassName(s)[1];
          e &&
            ((tU.queueLyricInjection = !1),
            (tU.lyricInjectionFailed = !1),
            "true" !== e.getAttribute("aria-selected") &&
              B({ isAutoSwitchEnabled: !1 }, (t) => {
                t.isAutoSwitchEnabled &&
                  (() => {
                    e.click(),
                      tZ(
                        "[BetterLyrics] Auto switch enabled, switching to lyrics tab"
                      ),
                      tq().classList.remove("blyrics-hidden");
                  })();
              }),
            (function e(t) {
              tU.lyricInjectionPromise
                ? (tU.lyricAbortController?.abort("New song is being loaded"),
                  tU.lyricInjectionPromise.then(() => {
                    (tU.lyricInjectionPromise = null), e(t);
                  }))
                : ((tU.lyricAbortController = new AbortController()),
                  (tU.lyricInjectionPromise = tB(
                    t,
                    tU.lyricAbortController.signal
                  ).catch((e) => {
                    tZ(T, e),
                      (tU.areLyricsLoaded = !1),
                      (tU.lyricInjectionFailed = !0);
                  })));
            })(u));
        }
        (tU.suppressZeroTime < Date.now() || 0 !== u.currentTime) &&
          tW(u.currentTime, u.browserTime, u.playing);
      }),
      (function e() {
        let t = document.getElementById("side-panel");
        t
          ? (new MutationObserver((e) => {
              K(
                () => {},
                () =>
                  e.forEach((e) => {
                    if ("inert" === e.attributeName) {
                      e.target.removeAttribute("inert");
                      let t = document.getElementsByClassName(s)[1];
                      t &&
                        "true" !== t.getAttribute("aria-selected") &&
                        t.click();
                    }
                  })
              );
            }).observe(t, { attributes: !0 }),
            t.removeAttribute("inert"))
          : setTimeout(() => {
              e();
            }, 1e3);
      })(),
      (e = (e) => {
        let t = document.getElementById(N);
        t &&
          (e
            ? t.setAttribute("blyrics-alt-hover", "")
            : t.removeAttribute("blyrics-alt-hover"));
      }),
      document.addEventListener("keydown", (t) => {
        "Alt" === t.key && e(!0);
      }),
      document.addEventListener("keyup", (t) => {
        "Alt" === t.key && e(!1);
      }),
      window.addEventListener("blur", () => {
        e(!1);
      }),
      (t = (e) => {
        let t = e ?? [...tj];
        tj.every((e) => t.includes(e) || t.includes(`d_${e}`)) ||
          ((t = [...tj]),
          tZ("Invalid preferred provider list, resetting to default"));
        let i = t.filter(tz);
        tZ("[BetterLyrics] Switching to provider = ", i), (tk = i);
      }),
      chrome.storage.onChanged.addListener((e, i) => {
        "sync" === i &&
          e.preferredProviderList &&
          t(e.preferredProviderList.newValue);
      }),
      chrome.storage.local.get({ preferredProviderList: null }, function (e) {
        t(e.preferredProviderList);
      }),
      tZ(
        "%c[BetterLyrics] Loaded Successfully. Logs are enabled by default. You can disable them in the extension options.",
        "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
      ),
      X(
        () => (tU.shouldInjectAlbumArt = !0),
        () => (tU.shouldInjectAlbumArt = !1)
      );
  }
  document.addEventListener("DOMContentLoaded", tX),
    (t = new URL(window.location.href)).searchParams.has("v") &&
      (tA = t.searchParams.get("v")),
    document.addEventListener("blyrics-send-response", (e) => {
      if (!(e instanceof CustomEvent)) return;
      let { url: t, requestJson: i, responseJson: r } = e.detail;
      if (t.includes("https://music.youtube.com/youtubei/v1/next")) {
        let e =
          r.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
            ?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer?.content
            ?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents;
        if (
          (e ||
            (e =
              r.onResponseReceivedEndpoints?.[0]?.queueUpdateCommand
                ?.inlineContents?.playlistPanelRenderer?.contents),
          e)
        )
          for (let t of e) {
            let e =
                t?.playlistPanelVideoWrapperRenderer?.counterpart?.[0]
                  ?.counterpartRenderer?.playlistPanelVideoRenderer?.videoId,
              i =
                t?.playlistPanelVideoWrapperRenderer?.primaryRenderer
                  ?.playlistPanelVideoRenderer?.videoId,
              r =
                t?.playlistPanelVideoWrapperRenderer?.counterpart?.[0]
                  ?.segmentMap;
            if (e && i) {
              let t = null;
              if (r && r.segment) {
                for (let e of r.segment)
                  (e.counterpartVideoStartTimeMilliseconds = Number(
                    e.counterpartVideoStartTimeMilliseconds
                  )),
                    (e.primaryVideoStartTimeMilliseconds = Number(
                      e.primaryVideoStartTimeMilliseconds
                    )),
                    (e.durationMilliseconds = Number(e.durationMilliseconds));
                for (let e of ((t = { segment: [], reversed: !0 }), r.segment))
                  t.segment.push({
                    primaryVideoStartTimeMilliseconds:
                      e.counterpartVideoStartTimeMilliseconds,
                    counterpartVideoStartTimeMilliseconds:
                      e.primaryVideoStartTimeMilliseconds,
                    durationMilliseconds: e.durationMilliseconds,
                  });
              }
              tI.set(i, { counterpartVideoId: e, segmentMap: r }),
                tI.set(e, { counterpartVideoId: i, segmentMap: t });
            } else {
              let e = t?.playlistPanelVideoRenderer?.videoId;
              e && tI.set(e, { counterpartVideoId: null, segmentMap: null });
            }
          }
        let t = i.videoId,
          n = i.playlistId;
        t || (t = r.currentVideoEndpoint?.watchEndpoint?.videoId),
          n || (n = r.currentVideoEndpoint?.watchEndpoint?.playlistId);
        let s =
          r?.playerOverlays?.playerOverlayRenderer?.browserMediaSession
            ?.browserMediaSessionRenderer?.album?.runs[0]?.text;
        if ((tT.set(t, s), tI.has(t))) {
          let e = tI.get(t).counterpartVideoId;
          e && tT.set(e, s);
        }
        if (!t) return;
        let a =
          r.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
            ?.watchNextTabbedResultsRenderer?.tabs[1]?.tabRenderer;
        if (a && a.unselectable)
          tE.set(t, { hasLyrics: !1, lyrics: "", sourceText: "" });
        else {
          let e = a.endpoint?.browseEndpoint?.browseId;
          e && tS.set(e, t);
        }
      } else if (t.includes("https://music.youtube.com/youtubei/v1/browse")) {
        let e = i.browseId,
          t = tS.get(e);
        if (
          (void 0 !== e && void 0 === t && null !== tA && (t = tA),
          void 0 !== t)
        ) {
          let i =
              r.contents?.sectionListRenderer?.contents?.[0]
                ?.musicDescriptionShelfRenderer?.description?.runs?.[0]?.text,
            n =
              r.contents?.sectionListRenderer?.contents?.[0]
                ?.musicDescriptionShelfRenderer?.footer?.runs?.[0]?.text;
          i && n
            ? (tE.set(t, { hasLyrics: !0, lyrics: i, sourceText: n }),
              t === tA && (tS.set(e, t), (tA = null)))
            : tE.set(t, { hasLyrics: !1, lyrics: null, sourceText: null });
        }
      }
    });
})();
//# sourceMappingURL=content-0.js.map
