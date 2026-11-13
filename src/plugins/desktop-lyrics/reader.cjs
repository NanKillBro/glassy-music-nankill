function readLyrics(currentTime = NaN, state = {}) {
  function lineText(line) {
    if (!line) return '';
    const words = line.querySelectorAll(
      '.blyrics--word[data-content]:not(.blyrics--romanized .blyrics--word)',
    );
    if (!words.length) return (line.textContent || '').trim();
    return Array.from(
      words,
      (word) =>
        (word.dataset.content || '') +
        (word.classList.contains('blyrics--has-trailing-space') ? ' ' : ''),
    )
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
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
    const text = lineText(line);
    let next = line.nextElementSibling;
    while (next && !next.classList.contains('blyrics--line'))
      next = next.nextElementSibling;
    const words = Array.from(
      line.querySelectorAll(
        '.blyrics--word[data-content]:not(.blyrics--romanized .blyrics--word)',
      ),
    )
      .slice(0, 160)
      .map((word) => ({
        text: (word.dataset.content || '').slice(0, 200),
        space: word.classList.contains('blyrics--has-trailing-space'),
        time: Number(word.dataset.time),
        duration: Number(word.dataset.duration),
      }));
    const element = line.querySelector('.blyrics--word') || line;
    const style = getComputedStyle(element);
    const lineStyle = getComputedStyle(line);
    return {
      current: text.slice(0, 1500),
      next: lineText(next).slice(0, 1000),
      words,
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
