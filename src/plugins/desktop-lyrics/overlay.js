const current = document.getElementById('current');
const next = document.getElementById('next');
const lyrics = document.getElementById('lyrics');
let lineAnimation = null;
let fontSize = 34;
let animations = [];
let previousLine = '';
let previousTiming = '';
let previousStyle = '';
let spans = [];
function cancelAnimations() {
  for (const animation of animations) animation.cancel();
  animations = [];
}
document.getElementById('toolbar').addEventListener('click', (event) => {
  const action = event.target.closest('button')?.dataset.action;
  if (!action) return;
  if (action === 'smaller' || action === 'larger') {
    fontSize = Math.max(
      16,
      Math.min(76, fontSize + (action === 'larger' ? 2 : -2)),
    );
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
  } else window.desktopLyrics.action(action);
});
const unsubscribe = window.desktopLyrics.onUpdate((data) => {
  const typography = data.typography;
  const styleKey = JSON.stringify(typography);
  if (typography && previousStyle !== styleKey) {
    for (const element of [current, next]) {
      element.style.fontFamily = typography.family;
      element.style.fontWeight = typography.weight;
      element.style.letterSpacing = typography.spacing;
      element.style.fontStyle = typography.fontStyle;
    }
    current.style.lineHeight = String(typography.lineHeight);
    previousStyle = styleKey;
  }
  const words = Array.isArray(data.words) ? data.words : [];
  const text =
    data.current || (data.connected ? '♪' : 'Open Glassy Music and its lyrics');
  const lineKey = JSON.stringify([text, words]);
  if (lineKey !== previousLine) {
    cancelAnimations();
    spans = [];
    const fragment = document.createDocumentFragment();
    if (words.length && data.current) {
      for (const word of words) {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word.text;
        fragment.appendChild(span);
        if (word.space) fragment.appendChild(document.createTextNode(' '));
        spans.push(span);
      }
    } else fragment.appendChild(document.createTextNode(text));
    current.replaceChildren(fragment);
    lineAnimation?.cancel();
    lineAnimation = null;
    if (
      previousLine &&
      data.current &&
      !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      const animation = lyrics.animate(
        [
          { opacity: 0.6, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 200, easing: 'ease-out' },
      );
      lineAnimation = animation;
      animation.onfinish = () => {
        if (lineAnimation !== animation) return;
        lineAnimation = null;
        animation.cancel();
      };
    }
    previousLine = lineKey;
  }
  const timingKey = JSON.stringify([
    data.currentTime,
    data.playing,
    data.sentAt,
    lineKey,
  ]);
  if (previousTiming !== timingKey) {
    cancelAnimations();
    const elapsed = data.playing
      ? Math.max(0, (Date.now() - data.sentAt) / 1000)
      : 0;
    const time = Number(data.currentTime) + elapsed;
    for (let index = 0; index < spans.length; index++) {
      const word = words[index];
      const span = spans[index];
      const duration = Math.max(0.08, Number(word.duration) || 0);
      if (!Number.isFinite(word.time) || word.time + duration <= time) {
        span.style.opacity = '1';
        continue;
      }
      span.style.opacity = String(
        Math.max(0.4, Math.min(1, 0.4 + (0.6 * (time - word.time)) / duration)),
      );
      if (!data.playing) continue;
      const animation = span.animate([{ opacity: 0.4 }, { opacity: 1 }], {
        duration: duration * 1000,
        delay: (word.time - time) * 1000,
        fill: 'both',
      });
      animations.push(animation);
    }
    previousTiming = timingKey;
  }
  if (next.textContent !== data.next) next.textContent = data.next || '';
  document
    .getElementById('pin')
    .setAttribute('aria-pressed', String(data.pinned));
});
window.addEventListener(
  'pagehide',
  () => {
    cancelAnimations();
    unsubscribe();
    lineAnimation?.cancel();
    lineAnimation = null;
    spans = [];
  },
  { once: true },
);
