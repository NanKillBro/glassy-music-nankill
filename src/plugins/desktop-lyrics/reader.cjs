function readLyrics(currentTime = NaN, state = {}) {
  function lineContent(line) {
    if (!line) return { text: '', words: [] };
    // The composite engine mirrors the text in a highlight run. Read only the
    // main base run so highlights, backing vocals and decorations are excluded.
    const main = line.querySelector?.('.blyrics-line-main');
    const content =
      main?.querySelector('.blyrics-bidi-run:not(.blyrics-highlight-run)') ||
      main ||
      line;
    const elements = Array.from(
      content.querySelectorAll(
        '.blyrics--word[data-content]:not(.blyrics-word-highlight):not(.blyrics-highlight-run .blyrics--word):not(.blyrics--romanized .blyrics--word)',
      ),
    ).slice(0, 160);
    const range = content.ownerDocument?.createRange();
    const words = elements.map((word, index) => {
      let space = word.classList.contains('blyrics--has-trailing-space');
      // Composite words carry no trailing-space class; their gaps are DOM text
      // nodes between groups. Adjacent syllables must remain joined.
      if (!space && range && elements[index + 1]) {
        range.setStartAfter(word);
        range.setEndBefore(elements[index + 1]);
        space = /\s/.test(range.toString());
      }
      return {
        text: (word.dataset.content || '').slice(0, 200),
        space,
        time: Number(word.dataset.time),
        duration: Number(word.dataset.duration),
      };
    });
    return {
      text: words.length
        ? words
            .map((word) => word.text + (word.space ? ' ' : ''))
            .join('')
            .replace(/\s+/g, ' ')
            .trim()
        : (content.textContent || '').trim(),
      words,
      element: elements[0] || content,
    };
  }
  const containers = document.querySelectorAll('.blyrics-container');
  for (const container of containers) {
    let active = container.querySelectorAll('.blyrics--line.blyrics--active');
    // BL may mark the incoming line active for scrolling before it is sung.
    // Prefer the outgoing active line instead of jumping to the last match.
    let line = active[0];
    const retained =
      state.container === container && state.line?.isConnected
        ? state.line
        : null;
    if (!line && retained) line = retained;
    if (!active.length)
      active = container.querySelectorAll('.blyrics--line.blyrics--animating');
    if (!active.length)
      active = container.querySelectorAll('.blyrics-current-lyric');
    line ||= active[0];
    if (!line) continue;
    const start = Number(line.dataset?.time);
    if (
      retained &&
      line !== retained &&
      Number.isFinite(currentTime) &&
      Number.isFinite(start) &&
      start > currentTime
    )
      line = retained;
    state.container = container;
    state.line = line;
    const current = lineContent(line);
    let next = line.nextElementSibling;
    while (next && !next.classList.contains('blyrics--line'))
      next = next.nextElementSibling;
    const style = getComputedStyle(current.element);
    const lineStyle = getComputedStyle(line);
    return {
      current: current.text.slice(0, 1500),
      next: lineContent(next).text.slice(0, 1000),
      words: current.words,
      typography: {
        family: style.fontFamily.slice(0, 300),
        weight: style.fontWeight,
        spacing: style.letterSpacing,
        fontStyle: style.fontStyle,
        lineHeight: Math.max(
          1,
          Math.min(
            2,
            parseFloat(lineStyle.lineHeight) / parseFloat(lineStyle.fontSize) ||
              1.4,
          ),
        ),
      },
    };
  }
  state.container = null;
  state.line = null;
  return { current: '', next: '' };
}
module.exports = { readLyrics };
