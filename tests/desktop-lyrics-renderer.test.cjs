const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
let callback;
let onHide;
let unsubscribed = false;
let liveAnimations = 0;
let replacements = 0;
function element() {
  return {
    style: {}, textContent: '', children: [],
    appendChild(node) {this.children.push(node);},
    replaceChildren(fragment) {this.children = fragment.children; replacements++;},
    addEventListener() {}, setAttribute() {},
    animate() {liveAnimations++; let cancelled = false; return {cancel() {if (!cancelled) {cancelled = true; liveAnimations--;}}};},
  };
}
const elements = {current: element(), next: element(), toolbar: element(), pin: element()};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../desktop-lyrics/overlay.js'), 'utf8'), {
  Date: {now: () => 1000},
  document: {
    getElementById: name => elements[name],
    createElement: element, createTextNode: text => ({textContent: text}), createDocumentFragment: element,
    documentElement: {style: {setProperty() {}}},
  },
  window: {desktopLyrics: {onUpdate: handler => {callback = handler; return () => {unsubscribed = true;};}}, addEventListener: (_name, handler) => {onHide = handler;}},
});
const payload = {
  current: 'Hola mundo', next: '', pinned: true, connected: true, playing: true, sentAt: 1000, currentTime: 0,
  typography: {family: 'Verdana', weight: '700', spacing: 'normal', fontStyle: 'normal', lineHeight: 1.4},
  words: [{text: 'Hola', space: true, time: 1, duration: 1}, {text: 'mundo', space: false, time: 2, duration: 1}],
};
for (let index = 0; index < 1000; index++) callback(payload);
assert.equal(replacements, 1);
assert.equal(liveAnimations, 2);
assert.equal(elements.current.style.fontFamily, 'Verdana');
assert.equal(elements.current.style.fontWeight, '700');
for (let index = 0; index < 1000; index++) {
  callback({...payload, current: String(index)});
  assert.equal(liveAnimations, 2);
}
onHide();
assert.equal(liveAnimations, 0);
assert.equal(unsubscribed, true);
console.log('Passed: Verdana/700 inherited; 1000 identical updates -> one DOM replacement; 1000 line changes keep two animations; unload cancels all and unsubscribes.');
