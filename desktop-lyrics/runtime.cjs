const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  screen,
} = require('electron');
const path = require('node:path');
const { readLyrics } = require('./reader.cjs');
const { installBridge } = require('./bridge.cjs');
function createDesktopLyrics({ window: mainWindow, directory = __dirname }) {
  const channel = 'glassy-desktop-lyrics-action';
  const toggleKey = 'Alt+Shift+L';
  const lockKey = 'Alt+Shift+K';
  const sizes = [
    [360, 145],
    [580, 230],
    [820, 320],
  ];
  let overlay = null;
  let source = null;
  let sourceDestroyed = null;
  let lastData = { current: '', next: '', connected: false };
  const bridgeScript = `(${installBridge.toString()})(${readLyrics.toString()})`;
  let pinned = true;
  let locked = false;
  let lockAvailable = false;
  let sizeIndex = 1;
  let lastPayload = '';
  let registeredToggle = false;
  let started = false;

  function findPlayer() {
    return [mainWindow].find((window) => {
      if (window.isDestroyed() || window === overlay) return false;
      try {
        return (
          new URL(window.webContents.getURL()).hostname === 'music.youtube.com'
        );
      } catch {
        return false;
      }
    });
  }

  function update() {
    if (!overlay || overlay.isDestroyed()) return;
    const payload = { ...lastData, pinned };
    const serialized = JSON.stringify(payload);
    if (serialized === lastPayload) return;
    overlay.webContents.send('glassy-desktop-lyrics-update', payload);
    lastPayload = serialized;
  }

  function stopBridge() {
    const previous = source;
    source = null;
    if (previous && !previous.webContents.isDestroyed()) {
      if (sourceDestroyed)
        previous.webContents.removeListener('destroyed', sourceDestroyed);
      void previous.webContents
        .executeJavaScript('window.__glassyDesktopBridge?.dispose()')
        .catch(() => {});
    }
    sourceDestroyed = null;
    lastData = { current: '', next: '', connected: false };
  }

  function startBridge(force = false) {
    const player = findPlayer();
    if (!force && source === player) return;
    stopBridge();
    if (!player) {
      update();
      return;
    }
    source = player;
    sourceDestroyed = () => {
      source = null;
      sourceDestroyed = null;
      lastData = { current: '', next: '', connected: false };
      update();
    };
    player.webContents.once('destroyed', sourceDestroyed);
    void player.webContents.executeJavaScript(bridgeScript).catch(() => {
      if (source === player) {
        stopBridge();
        update();
      }
    });
  }

  function onData(event, data) {
    if (
      !source ||
      event.sender !== source.webContents ||
      !overlay ||
      overlay.isDestroyed() ||
      !data ||
      typeof data !== 'object'
    )
      return;
    const text = (value, limit) =>
      typeof value === 'string' ? value.slice(0, limit) : '';
    const number = (value) => (Number.isFinite(value) ? value : 0);
    const words = Array.isArray(data.words)
      ? data.words.slice(0, 160).map((word) => ({
          text: text(word?.text, 200),
          space: !!word?.space,
          time: number(word?.time),
          duration: Math.max(0, Math.min(60, number(word?.duration))),
        }))
      : [];
    const typography =
      data.typography && typeof data.typography === 'object'
        ? {
            family: text(data.typography.family, 300),
            weight: text(data.typography.weight, 20),
            spacing: text(data.typography.spacing, 30),
            fontStyle: text(data.typography.fontStyle, 30),
            lineHeight: Math.max(
              1,
              Math.min(2, number(data.typography.lineHeight) || 1.4),
            ),
          }
        : undefined;
    lastData = {
      current: text(data.current, 1500),
      next: text(data.next, 1000),
      words,
      typography,
      playing: !!data.playing,
      currentTime: number(data.currentTime),
      sentAt: number(data.sentAt),
      connected: true,
    };
    update();
  }

  function unlock() {
    if (!overlay || overlay.isDestroyed()) return;
    locked = !locked;
    overlay.setIgnoreMouseEvents(locked, { forward: true });
  }

  function open() {
    if (!started) return;
    if (overlay && !overlay.isDestroyed()) {
      overlay.show();
      overlay.focus();
      return;
    }
    const area = screen.getPrimaryDisplay().workArea;
    const [width, height] = sizes[sizeIndex];
    overlay = new BrowserWindow({
      title: 'Letras en el escritorio',
      width,
      height,
      x: Math.round(area.x + (area.width - width) / 2),
      y: Math.round(area.y + area.height - height - 45),
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      resizable: false,
      maximizable: false,
      alwaysOnTop: pinned,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(directory, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });
    const target = overlay;
    locked = false;
    lastPayload = '';
    target.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    target.webContents.on('will-navigate', (event) => event.preventDefault());
    target.once('ready-to-show', () => {
      if (target.isDestroyed()) return;
      target.show();
      const player = findPlayer();
      if (player) player.minimize();
    });
    target.webContents.once('did-finish-load', () => {
      if (target !== overlay || target.isDestroyed()) return;
      update();
      startBridge();
    });
    target.once('closed', () => {
      if (target !== overlay) return;
      stopBridge();
      overlay = null;
      lastPayload = '';
    });
    void target
      .loadFile(path.join(directory, 'overlay.html'))
      .catch((error) => {
        console.error('[DesktopLyrics] Could not open overlay:', error);
        if (!target.isDestroyed()) target.close();
      });
  }

  function onAction(event, action) {
    if (!overlay || event.sender !== overlay.webContents) return;
    if (action === 'close') overlay.close();
    if (action === 'pin') {
      pinned = !pinned;
      overlay.setAlwaysOnTop(pinned);
      void update();
    }
    if (action === 'lock' && lockAvailable) unlock();
    if (action === 'size') {
      sizeIndex = (sizeIndex + 1) % sizes.length;
      const [width, height] = sizes[sizeIndex];
      const [left, top] = overlay.getPosition();
      const area = screen.getDisplayMatching(overlay.getBounds()).workArea;
      overlay.setBounds({
        width,
        height,
        x: Math.max(area.x, Math.min(left, area.x + area.width - width)),
        y: Math.max(area.y, Math.min(top, area.y + area.height - height)),
      });
    }
    if (action === 'player') {
      const player = findPlayer();
      if (player) {
        if (player.isMinimized()) player.restore();
        player.show();
        player.focus();
      }
    }
  }

  function close() {
    if (overlay && !overlay.isDestroyed()) overlay.close();
  }
  function toggle() {
    if (overlay && !overlay.isDestroyed()) close();
    else open();
  }
  function onPlayerLoad() {
    if (overlay && !overlay.isDestroyed()) startBridge(true);
  }
  function start() {
    if (started) return;
    started = true;
    ipcMain.on(channel, onAction);
    ipcMain.on('glassy-desktop-lyrics-data', onData);
    mainWindow.webContents.on('did-finish-load', onPlayerLoad);
    mainWindow.once('closed', stop);
    app.once('will-quit', stop);
    registeredToggle = globalShortcut.register(toggleKey, toggle);
    lockAvailable = globalShortcut.register(lockKey, unlock);
    if (!registeredToggle)
      console.warn('[DesktopLyrics] Alt+Shift+L ocupado; usar el menú.');
  }
  function stop() {
    if (!started) return;
    started = false;
    close();
    stopBridge();
    ipcMain.removeListener(channel, onAction);
    ipcMain.removeListener('glassy-desktop-lyrics-data', onData);
    mainWindow.webContents.removeListener('did-finish-load', onPlayerLoad);
    mainWindow.removeListener('closed', stop);
    app.removeListener('will-quit', stop);
    if (registeredToggle) globalShortcut.unregister(toggleKey);
    if (lockAvailable) globalShortcut.unregister(lockKey);
    registeredToggle = false;
    lockAvailable = false;
  }
  return {
    start,
    stop,
    open,
    close,
    toggle,
    isOpen: () => !!overlay && !overlay.isDestroyed(),
  };
}
module.exports = { createDesktopLyrics };
