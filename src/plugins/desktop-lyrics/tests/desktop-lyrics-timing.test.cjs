const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readLyrics } = require('../reader.cjs');

test('outgoing line survives early scroll, end of word and gap until next start', () => {
  const createLine = (text, time) => ({
    textContent: text,
    dataset: { time: String(time) },
    isConnected: true,
    classList: { contains: () => true },
    querySelectorAll: () => [],
    querySelector: () => null,
  });
  const first = createLine('outgoing', 10);
  const second = createLine('incoming', 15);
  first.nextElementSibling = second;
  let active = [first];
  const container = {
    querySelectorAll: (selector) =>
      selector.includes('--active') ? active : [],
  };
  const context = vm.createContext({
    document: { querySelectorAll: () => [container] },
    getComputedStyle: () => ({
      fontFamily: 'Verdana',
      fontWeight: '700',
      letterSpacing: 'normal',
      fontStyle: 'normal',
      fontSize: '34px',
      lineHeight: '47.6px',
    }),
    state: {},
    time: 10,
  });
  function read(time) {
    context.time = time;
    return vm.runInContext(`(${readLyrics.toString()})(time, state)`, context);
  }
  assert.equal(read(10).current, 'outgoing');
  active = [first, second]; // incoming has been selected early for scrolling
  assert.equal(read(12).current, 'outgoing');
  active = []; // last word ended, neither line is active during the gap
  assert.equal(read(13).current, 'outgoing');
  active = [second]; // source marks incoming active before its timestamp
  assert.equal(read(14.9).current, 'outgoing');
  assert.equal(read(15).current, 'incoming');
  assert.equal(read(15).next, '');
  // A seek resets bridge reader state instead of holding a later line.
  context.state = {};
  active = [first];
  assert.equal(read(10).current, 'outgoing');
  first.isConnected = false;
  active = [];
  assert.equal(read(11).current, '');
  assert.equal(context.state.line, null);
});
