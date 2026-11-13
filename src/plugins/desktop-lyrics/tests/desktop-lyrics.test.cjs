const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const { readLyrics } = require('../reader.cjs');
const { installBridge } = require('../bridge.cjs');
const path = require('node:path');
const readCode = `(${readLyrics.toString()})()`;
function read(containers) {
  return JSON.parse(
    JSON.stringify(
      vm.runInNewContext(readCode, {
        document: { querySelectorAll: () => containers },
        getComputedStyle: () => ({
          fontFamily: 'Verdana',
          fontWeight: '700',
          letterSpacing: 'normal',
          fontStyle: 'normal',
          lineHeight: '47.6px',
          fontSize: '34px',
        }),
      }),
    ),
  );
}
assert.deepEqual(read([]), { current: '', next: '' });
const next = {
  textContent: 'próxima línea',
  classList: { contains: () => true },
  querySelectorAll: () => [],
};
const active = {
  textContent: '<img onerror=alert(1)> primera línea',
  nextElementSibling: next,
  querySelectorAll: () => [],
  querySelector: () => null,
};
assert.equal(
  read([{ querySelectorAll: () => [active] }]).current,
  active.textContent,
);
assert.equal(
  read([{ querySelectorAll: () => [active] }]).typography.family,
  'Verdana',
);
const long = { ...active, textContent: 'z'.repeat(3000) };
assert.equal(read([{ querySelectorAll: () => [long] }]).current.length, 1500);
assert.equal(
  read([{ querySelectorAll: () => [active, active] }]).current,
  active.textContent,
);
const canonical = {
  ...active,
  querySelectorAll: () => [
    { dataset: { content: 'Hola' }, classList: { contains: () => true } },
    { dataset: { content: 'mundo' }, classList: { contains: () => false } },
  ],
};
assert.equal(
  read([{ querySelectorAll: () => [canonical] }]).current,
  'Hola mundo',
);

const app = new EventEmitter();
app.whenReady = () => Promise.resolve();
const shortcuts = new Map();
const windows = [];
const timers = new Set();
const ipc = new EventEmitter();
class Window extends EventEmitter {
  static getAllWindows() {
    return windows;
  }
  constructor(options = {}) {
    super();
    this.options = options;
    this.webContents = new EventEmitter();
    this.webContents.getURL = () => this.url || '';
    this.webContents.isDestroyed = () => !!this.destroyed;
    this.webContents.setWindowOpenHandler = (handler) => {
      this.openHandler = handler;
    };
    this.webContents.executeJavaScript = async (code) => {
      if (code.includes('function installBridge'))
        ipc.emit(
          'glassy-desktop-lyrics-data',
          { sender: this.webContents },
          { current: 'letra', next: 'siguiente' },
        );
      return true;
    };
    this.webContents.send = (_channel, payload) => {
      this.payload = payload;
    };
    windows.push(this);
    app.emit('browser-window-created', {}, this);
  }
  isDestroyed() {
    return !!this.destroyed;
  }
  setMinimumSize(width, height) {
    this.minimum = [width, height];
  }
  loadURL(url) {
    this.loadedURL = url;
    this.webContents.emit('did-finish-load');
    this.emit('ready-to-show');
    return Promise.resolve();
  }
  show() {
    this.shown = true;
  }
  focus() {
    this.focused = true;
  }
  minimize() {
    this.minimized = true;
  }
  setAlwaysOnTop(value) {
    this.pinned = value;
  }
  setIgnoreMouseEvents(value) {
    this.locked = value;
  }
  getPosition() {
    return [1, 2];
  }
  getBounds() {
    return { x: 1, y: 2, width: 580, height: 230 };
  }
  setBounds(bounds) {
    this.bounds = bounds;
  }
  close() {
    this.destroyed = true;
    this.emit('closed');
  }
}
const area = { x: 0, y: 0, width: 1920, height: 1080 };
const electron = {
  app,
  BrowserWindow: Window,
  ipcMain: ipc,
  globalShortcut: {
    register: (key, callback) => {
      shortcuts.set(key, callback);
      return true;
    },
    unregister: (key) => shortcuts.delete(key),
  },
  screen: {
    getPrimaryDisplay: () => ({ workArea: area }),
    getDisplayMatching: () => ({ workArea: area }),
  },
  Menu: { getApplicationMenu: () => null },
  MenuItem: class {},
};
const runtime = { exports: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '../runtime.cjs'), 'utf8'),
  {
    module: runtime,
    require: (name) =>
      name === 'electron'
        ? electron
        : name === './reader.cjs'
          ? { readLyrics }
          : name === './bridge.cjs'
            ? { installBridge }
            : require(name),
    __dirname: '.',
    URL,
    console,
    setInterval: (callback) => {
      timers.add(callback);
      return callback;
    },
    clearInterval: (callback) => timers.delete(callback),
  },
);
async function run() {
  await Promise.resolve();
  const player = new Window();
  player.url = 'https://music.youtube.com/watch?v=test';
  const controller = runtime.exports.createDesktopLyrics({
    window: player,
    html: '<!doctype html><title>Desktop Lyrics</title>',
    preload: '/bundled/preload.cjs',
  });
  assert.equal(shortcuts.size, 0);
  assert.equal(ipc.eventNames().length, 0);
  controller.open();
  assert.equal(windows.length, 1);
  controller.start();
  controller.start();
  assert.equal(windows.length, 1);
  assert.equal(shortcuts.size, 2);
  controller.open();
  player.webContents.emit('did-finish-load');
  await new Promise(setImmediate);
  const overlay = windows.at(-1);
  assert.equal(overlay.options.transparent, true);
  assert.equal(overlay.options.frame, false);
  assert.equal(overlay.options.webPreferences.nodeIntegration, false);
  assert.equal(overlay.options.webPreferences.sandbox, true);
  assert.equal(overlay.options.webPreferences.preload, '/bundled/preload.cjs');
  assert.ok(overlay.loadedURL.startsWith('data:text/html;charset=utf-8,'));
  assert.equal(overlay.shown, true);
  assert.equal(player.minimized, true);
  assert.equal(player.minimum, undefined);
  const windowCount = windows.length;
  controller.open();
  assert.equal(windows.length, windowCount);
  assert.equal(timers.size, 0);
  assert.equal(overlay.payload.current, 'letra');
  ipc.emit(
    'glassy-desktop-lyrics-action',
    { sender: player.webContents },
    'close',
  );
  assert.equal(overlay.isDestroyed(), false);
  ipc.emit(
    'glassy-desktop-lyrics-action',
    { sender: overlay.webContents },
    'size',
  );
  assert.equal(overlay.bounds.width, 820);
  ipc.emit(
    'glassy-desktop-lyrics-action',
    { sender: overlay.webContents },
    'lock',
  );
  assert.equal(overlay.locked, true);
  shortcuts.get('Alt+Shift+K')();
  assert.equal(overlay.locked, false);
  shortcuts.get('Alt+Shift+L')();
  assert.equal(timers.size, 0);
  shortcuts.get('Alt+Shift+L')();
  await new Promise(setImmediate);
  assert.equal(timers.size, 0);
  windows.at(-1).close();
  controller.stop();
  for (let index = 0; index < 1000; index++) {
    controller.start();
    shortcuts.get('Alt+Shift+L')();
    windows.at(-1).close();
    controller.stop();
    assert.equal(player.webContents.listenerCount('destroyed'), 0);
    assert.equal(player.webContents.listenerCount('did-finish-load'), 0);
    assert.equal(player.listenerCount('closed'), 0);
    assert.equal(app.listenerCount('will-quit'), 0);
    assert.equal(ipc.eventNames().length, 0);
    assert.equal(shortcuts.size, 0);
  }
  app.emit('will-quit');
  assert.equal(shortcuts.size, 0);
  assert.equal(timers.size, 0);
  console.log(
    'Passed: disabled stays inert; enabling does not open; show is idempotent; hide/reopen; unchanged main size; 1000 enable/open/close/disable cycles leave zero listeners, timers and shortcuts.',
  );
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
