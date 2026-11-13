import { buildDocument } from './document.cjs';
import css from './overlay.css?inline';
import html from './overlay.html?raw';
import script from './overlay.js?raw';
import preload from './preload.cjs?asset';
import { createDesktopLyrics as createController } from './runtime.cjs';

import type { BrowserWindow } from 'electron';

export function createDesktopLyrics(window: BrowserWindow) {
  return createController({
    window,
    html: buildDocument(html, css, script),
    preload,
  });
}
