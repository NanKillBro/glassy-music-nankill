import { BrowserWindow } from 'electron';

import bgutilsSource from '../../../node_modules/bgutils-js/bundle/index.cjs?raw';

// BotGuard refuses to run from the main process (no real DOM) and the YTM page
// blocks string evaluation with Trusted Types. A hidden window on a CSP-free
// same-origin page gives us a real DOM where BotGuard can mint tokens.
const MINTER_URL = 'https://music.youtube.com/robots.txt';
const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
const WINDOW_WIDTH = 1280;
const WINDOW_HEIGHT = 720;
const PAGE_LOAD_TIMEOUT_MS = 20_000;
const BOOTSTRAP_TIMEOUT_MS = 30_000;
const MINT_TIMEOUT_MS = 20_000;

export interface PoTokenMinter {
  mint: (videoID: string) => Promise<string | null>;
  reset: () => Promise<void>;
  dispose: () => Promise<void>;
}

const buildBootstrap = () => `
var module = { exports: {} };
var exports = module.exports;
${bgutilsSource}
;window.__crossfadeBg = { BG: core_exports, buildURL, getHeaders };
(() => {
  let minterPromise = null;
  let expiresAt = 0;

  const getMinter = () => {
    if (minterPromise && Date.now() < expiresAt) return minterPromise;

    minterPromise = (async () => {
      const { BG, buildURL, getHeaders } = window.__crossfadeBg;
      const bgConfig = {
        fetch: window.fetch.bind(window),
        globalObj: window,
        identifier: 'crossfade',
        requestKey: ${JSON.stringify(REQUEST_KEY)},
      };
      const challenge = await BG.Challenge.create(bgConfig);
      const interpreter =
        challenge?.interpreterJavascript
          .privateDoNotAccessOrElseSafeScriptWrappedValue;
      if (!interpreter) throw new Error('BotGuard challenge has no interpreter');

      new Function(interpreter)();

      const botguard = await BG.BotGuardClient.create({
        program: challenge.program,
        globalName: challenge.globalName,
        globalObj: window,
      });
      const webPoSignalOutput = [];
      const botguardResponse = await botguard.snapshot({ webPoSignalOutput });
      const response = await fetch(buildURL('GenerateIT', false), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify([${JSON.stringify(REQUEST_KEY)}, botguardResponse]),
      });
      if (!response.ok) throw new Error('GenerateIT HTTP ' + response.status);

      const [integrityToken, ttl] = await response.json();
      if (!integrityToken) throw new Error('No integrity token');

      const minter = await BG.WebPoMinter.create(
        { integrityToken },
        webPoSignalOutput,
      );
      expiresAt = Date.now() + Math.max((ttl || 3600) - 60, 60) * 1000;
      return minter;
    })();

    minterPromise.catch(() => {
      minterPromise = null;
      expiresAt = 0;
    });
    return minterPromise;
  };

  window.__crossfadeMintPoToken = async (videoID) =>
    (await getMinter()).mintAsWebsafeString(videoID);
  window.__crossfadeResetPoToken = () => {
    minterPromise = null;
    expiresAt = 0;
  };
})();
'ok'
`;

const withTimeout = async <T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${ms}ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const createPoTokenMinter = (parent: BrowserWindow): PoTokenMinter => {
  let windowPromise: Promise<BrowserWindow | null> | null = null;

  const createWindow = async (): Promise<BrowserWindow | null> => {
    if (parent.isDestroyed()) return null;

    let hidden: BrowserWindow | null = null;
    try {
      hidden = new BrowserWindow({
        parent,
        show: false,
        skipTaskbar: true,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        webPreferences: {
          backgroundThrottling: false,
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });

      await withTimeout(
        hidden.loadURL(MINTER_URL),
        PAGE_LOAD_TIMEOUT_MS,
        'PoToken page load',
      );
      const result: unknown = await withTimeout(
        hidden.webContents.executeJavaScript(buildBootstrap(), true),
        BOOTSTRAP_TIMEOUT_MS,
        'PoToken bootstrap',
      );
      if (result !== 'ok') throw new Error('PoToken bootstrap failed');
      return hidden;
    } catch (error) {
      console.warn('[Crossfade PoToken] Hidden window setup failed:', error);
      if (hidden && !hidden.isDestroyed()) hidden.destroy();
      return null;
    }
  };

  const getWindow = async (): Promise<BrowserWindow | null> => {
    if (windowPromise) {
      const existing = await windowPromise;
      if (existing && !existing.isDestroyed()) return existing;
      windowPromise = null;
    }
    windowPromise = createWindow();
    return windowPromise;
  };

  const mint = async (videoID: string): Promise<string | null> => {
    const hidden = await getWindow();
    if (!hidden) return null;

    try {
      const token: unknown = await withTimeout(
        hidden.webContents.executeJavaScript(
          `window.__crossfadeMintPoToken?.(${JSON.stringify(videoID)}) ?? null`,
          true,
        ),
        MINT_TIMEOUT_MS,
        `PoToken mint for ${videoID}`,
      );
      return typeof token === 'string' && token.length > 0 ? token : null;
    } catch (error) {
      console.warn(`[Crossfade PoToken] Mint failed for ${videoID}:`, error);
      return null;
    }
  };

  const reset = async (): Promise<void> => {
    const hidden = windowPromise ? await windowPromise : null;
    if (!hidden || hidden.isDestroyed()) return;
    try {
      await hidden.webContents.executeJavaScript(
        'window.__crossfadeResetPoToken?.()',
        true,
      );
    } catch {
      // The next mint recreates the window if it is gone.
    }
  };

  const dispose = async (): Promise<void> => {
    const hidden = windowPromise ? await windowPromise : null;
    windowPromise = null;
    if (hidden && !hidden.isDestroyed()) hidden.destroy();
  };

  return { mint, reset, dispose };
};
