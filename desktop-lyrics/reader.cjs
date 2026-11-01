function readLyrics() {
  function lineText(line) {
    if (!line) return '';
    const words = line.querySelectorAll('.blyrics--word[data-content]:not(.blyrics--romanized .blyrics--word)');
    if (!words.length) return (line.textContent || '').trim();
    return Array.from(words, word => (word.dataset.content || '') + (word.classList.contains('blyrics--has-trailing-space') ? ' ' : '')).join('').replace(/\s+/g, ' ').trim();
  }
  const containers = document.querySelectorAll('.blyrics-container');
  for (const container of containers) {
    let active = container.querySelectorAll('.blyrics--line.blyrics--active');
    if (!active.length) active = container.querySelectorAll('.blyrics--line.blyrics--animating');
    if (!active.length) active = container.querySelectorAll('.blyrics-current-lyric');
    if (!active.length) continue;
    const text = lineText(active[active.length - 1]);
    let next = active[active.length - 1].nextElementSibling;
    while (next && !next.classList.contains('blyrics--line')) next = next.nextElementSibling;
    const line = active[active.length - 1];
    const words = Array.from(line.querySelectorAll('.blyrics--word[data-content]:not(.blyrics--romanized .blyrics--word)')).slice(0, 160).map(word => ({
      text: (word.dataset.content || '').slice(0, 200),
      space: word.classList.contains('blyrics--has-trailing-space'),
      time: Number(word.dataset.time), duration: Number(word.dataset.duration),
    }));
    const element = line.querySelector('.blyrics--word') || line;
    const style = getComputedStyle(element);
    const lineStyle = getComputedStyle(line);
    return {
      current: text.slice(0, 1500), next: lineText(next).slice(0, 1000), words,
      typography: {
        family: style.fontFamily.slice(0, 300), weight: style.fontWeight,
        spacing: style.letterSpacing, fontStyle: style.fontStyle,
        lineHeight: Math.max(1, Math.min(2, parseFloat(lineStyle.lineHeight) / parseFloat(lineStyle.fontSize) || 1.4)),
      },
    };
  }
  return {current: '', next: ''};
}
module.exports = {readLyrics};
