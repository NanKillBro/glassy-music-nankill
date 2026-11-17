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

test('composite renderer reads the primary words once and preserves DOM spaces', async (t) => {
  const { Window } = await import('happy-dom');
  const window = new Window();
  t.after(() => window.happyDOM.abort());
  const word = (text, time) =>
    `<span class="blyrics--word" data-content="${text}" data-time="${time}" data-duration="0.5">${text}</span>`;
  const run =
    `<span class="blyrics-word-group">${word('Keep', 10)}</span> ` +
    `<span class="blyrics-word-group">${word('go', 11)}${word('ing,', 11.5)}</span> ` +
    `<span class="blyrics-word-group">${word('go', 12)}</span> ` +
    `<span class="blyrics-word-group">${word('go', 13)}</span>`;
  // Braccato 1.21 renders separate highlight/base runs. Spaces are text nodes,
  // and one word can contain several timed syllables without spaces between them.
  window.document.body.innerHTML = `<div class="blyrics-container">
    <div class="blyrics--line blyrics--active" data-time="10">
      <div class="blyrics-line-main" style="font-family: Verdana; font-weight: 700">
        <span class="blyrics-bidi-run blyrics-highlight-run" aria-hidden="true">${run.replaceAll('blyrics--word"', 'blyrics--word blyrics-word-highlight"')}</span>
        <span class="blyrics-bidi-run">${run}</span>
      </div>
      <div class="blyrics-background-line">backing vocals</div>
      <div class="blyrics--romanized">romanized copy</div>
      <div class="blyrics--translated">translated copy</div>
    </div>
    <div class="blyrics--line" data-time="15">
      <div class="blyrics-line-main"><span class="blyrics-bidi-run">Next line</span></div>
    </div>
  </div>`;
  const context = vm.createContext({
    document: window.document,
    getComputedStyle: window.getComputedStyle.bind(window),
  });
  const result = vm.runInContext(`(${readLyrics.toString()})(10)`, context);
  assert.equal(result.current, 'Keep going, go go');
  assert.equal(result.next, 'Next line');
  assert.deepEqual(
    Array.from(result.words, (word) => word.space),
    [true, false, true, true, false],
  );
  assert.deepEqual(
    Array.from(result.words, (word) => word.time),
    [10, 11, 11.5, 12, 13],
  );
  assert.equal(result.typography.family, 'Verdana');
  assert.equal(result.typography.weight, '700');
});
