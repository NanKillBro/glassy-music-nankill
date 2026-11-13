function installBridge(readLyrics) {
  window.__glassyDesktopBridge?.dispose();
  let disposed = false;
  let timeout = null;
  let previous = '';
  let lastEvent = 0;
  let lastTime = null;
  let lastClock = null;
  let lastPlaying = null;
  let timing = null;
  let seekVersion = 0;
  let cachedLine = null;
  let cachedText = '';
  let cachedData = null;
  let lastStyleRead = 0;
  let readerState = {};
  let videoId = null;
  const style = document.createElement('style');
  style.textContent =
    'html[data-glassy-desktop-only] [id^="better-lyrics-kawarp-"],html[data-glassy-desktop-only] .blyrics-background {display:none!important}';
  document.head.appendChild(style);
  const visibility = () =>
    document.documentElement.toggleAttribute(
      'data-glassy-desktop-only',
      document.hidden,
    );
  visibility();
  function emit() {
    clearTimeout(timeout);
    timeout = null;
    if (disposed) return;
    let lines = document.querySelectorAll(
      '.blyrics-container .blyrics--line.blyrics--active',
    );
    if (!lines.length)
      lines = document.querySelectorAll(
        '.blyrics-container .blyrics--line.blyrics--animating',
      );
    if (!lines.length)
      lines = document.querySelectorAll(
        '.blyrics-container .blyrics-current-lyric',
      );
    const line =
      lines[0] || (readerState.line?.isConnected ? readerState.line : null);
    const text = (line?.textContent || '').slice(0, 3000);
    if (
      !cachedData ||
      cachedLine !== line ||
      text !== cachedText ||
      Date.now() - lastStyleRead >= 2000
    ) {
      cachedData = readLyrics(
        timing?.currentTime ?? document.querySelector('video')?.currentTime,
        readerState,
      );
      cachedLine = readerState.line || line;
      cachedText = text;
      lastStyleRead = Date.now();
    }
    const data = cachedData;
    const playing = timing?.playing ?? !document.querySelector('video')?.paused;
    const signature = JSON.stringify({ ...data, playing, seekVersion });
    if (signature === previous) return;
    previous = signature;
    const elapsed =
      playing && lastClock !== null
        ? Math.max(0, (Date.now() - lastClock) / 1000)
        : 0;
    window.ipcRenderer.send('glassy-desktop-lyrics-data', {
      ...data,
      playing,
      currentTime: timing
        ? timing.currentTime + elapsed
        : document.querySelector('video')?.currentTime || 0,
      sentAt: Date.now(),
    });
  }
  function onTime(event) {
    const detail = event.detail;
    if (!detail || !Number.isFinite(detail.currentTime)) return;
    const clock = Date.now();
    const expected =
      lastTime === null
        ? detail.currentTime
        : lastTime + (lastPlaying ? (clock - lastClock) / 1000 : 0);
    if (
      (detail.videoId && detail.videoId !== videoId) ||
      Math.abs(detail.currentTime - expected) > 0.5
    ) {
      seekVersion++;
      readerState = {};
      cachedData = null;
      if (detail.videoId) videoId = detail.videoId;
    }
    timing = { currentTime: detail.currentTime, playing: !!detail.playing };
    lastTime = detail.currentTime;
    lastClock = clock;
    lastPlaying = !!detail.playing;
    lastEvent = clock;
    if (timeout === null) timeout = setTimeout(emit, 80);
  }
  document.addEventListener('blyrics-send-player-time', onTime);
  document.addEventListener('visibilitychange', visibility);
  const fallback = setInterval(() => {
    if (Date.now() - lastEvent > 1000) emit();
  }, 500);
  function dispose() {
    if (disposed) return;
    disposed = true;
    clearTimeout(timeout);
    clearInterval(fallback);
    document.removeEventListener('blyrics-send-player-time', onTime);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', dispose);
    document.documentElement.removeAttribute('data-glassy-desktop-only');
    style.remove();
    timing = null;
    cachedLine = null;
    cachedData = null;
    cachedText = '';
    readerState = {};
    previous = '';
    delete window.__glassyDesktopBridge;
  }
  window.addEventListener('pagehide', dispose, { once: true });
  window.__glassyDesktopBridge = { dispose };
  emit();
  return true;
}
module.exports = { installBridge };
