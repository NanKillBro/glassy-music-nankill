const assert = require('node:assert/strict');
const vm = require('node:vm');
const {EventEmitter} = require('node:events');
const {installBridge} = require('../desktop-lyrics/bridge.cjs');
const docEvents = new EventEmitter();
const winEvents = new EventEmitter();
const timeouts = new Map();
const intervals = new Map();
let sequence = 0;
let clock = 1000;
let styles = 0;
let messages = 0;
let text = 'original';
let playing = true;
let position = 0;
let reads = 0;
const lyricLine = {get textContent() {return text;}};
const context = {
  Date: {now: () => clock},
  window: {
    ipcRenderer: {send: () => messages++},
    addEventListener: (name, handler) => winEvents.on(name, handler),
    removeEventListener: (name, handler) => winEvents.off(name, handler),
  },
  document: {
    hidden: false,
    documentElement: {toggleAttribute() {}, removeAttribute() {}},
    createElement: () => ({remove: () => styles--}),
    head: {appendChild: () => styles++},
    addEventListener: (name, handler) => docEvents.on(name, handler),
    removeEventListener: (name, handler) => docEvents.off(name, handler),
    querySelector: () => ({paused: !playing, currentTime: position}),
    querySelectorAll: () => [lyricLine],
  },
  setTimeout: handler => {const id = ++sequence; timeouts.set(id, {handler, due: clock + 80}); return id;},
  clearTimeout: id => timeouts.delete(id),
  setInterval: handler => {const id = ++sequence; intervals.set(id, handler); return id;},
  clearInterval: id => intervals.delete(id),
  readLyrics: () => {reads++; return {current: text, next: '', words: []};},
};
vm.createContext(context);
function install() {vm.runInContext(`(${installBridge.toString()})(readLyrics)`, context);}
function tick() {
  clock += 20;
  if (playing) position += .02;
  docEvents.emit('blyrics-send-player-time', {detail: {currentTime: position, playing}});
  for (const [id, timer] of [...timeouts]) if (timer.due <= clock) {timeouts.delete(id); timer.handler();}
}
install();
for (let index = 0; index < 3000; index++) tick();
assert.equal(messages, 1);
assert.ok(reads <= 32, `Expected cached style/word reads, got ${reads}`);
text = 'changed';
for (let index = 0; index < 5; index++) tick();
assert.equal(messages, 2);
playing = false;
for (let index = 0; index < 5; index++) tick();
assert.equal(messages, 3);
position += 10;
for (let index = 0; index < 5; index++) tick();
assert.equal(messages, 4);
for (let index = 0; index < 1000; index++) {
  install();
  assert.equal(docEvents.listenerCount('blyrics-send-player-time'), 1);
  assert.equal(docEvents.listenerCount('visibilitychange'), 1);
  assert.equal(winEvents.listenerCount('pagehide'), 1);
  assert.equal(styles, 1);
  assert.equal(intervals.size, 1);
  tick();
  context.window.__glassyDesktopBridge.dispose();
  assert.equal(timeouts.size, 0);
  assert.equal(intervals.size, 0);
  assert.equal(styles, 0);
  assert.equal(docEvents.eventNames().length, 0);
  assert.equal(winEvents.eventNames().length, 0);
}
console.log('Passed: 3000 clock events -> one unchanged-lyric message; line/pause/seek updates; 1000 install/dispose cycles leave zero timers, listeners and styles.');
