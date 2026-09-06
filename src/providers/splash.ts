import SplashHtmlAsset from '@assets/splash.html?asset';
import { BrowserWindow } from 'electron';
import is from 'electron-is';

import { APPLICATION_NAME } from '@/i18n';
import { LoggerPrefix } from '@/utils';

/**
 * A small window shown from the moment the app process is ready, so launching
 * is acknowledged on screen immediately.
 *
 * Everything the app does before the main window can appear is invisible: the
 * main window is created with `show: false` and only shown on `ready-to-show`,
 * which for a window pointed at a remote URL means the *first paint of a remote
 * page* — after i18n, after every enabled backend plugin has started, and after
 * a network round trip. None of that is slow by accident, it just has nothing to
 * show. This fills that gap and names the stage it is in, so a slow launch also
 * says which part was slow.
 *
 * Status text arrives by `executeJavaScript` rather than IPC on purpose: the
 * page needs no preload, which would mean a second preload entry in the build.
 */

const SPLASH_SIZE = 500;

// Membership, not identity, so the window stays recognisable even after the
// reference below is dropped during teardown. The `browser-window-created`
// handler in src/index.ts must be able to tell this window from the main one.
const splashWindows = new WeakSet<BrowserWindow>();

// `browser-window-created` is emitted *synchronously from inside* the
// BrowserWindow constructor, so it reaches every listener before the constructor
// returns — which is before the set above can possibly contain this window. A
// listener asking "is this the splash?" during that call would be told no.
//
// This is not a hypothetical: it is what made the app unquittable. src/index.ts
// binds the main window's setup to the first non-splash window, so the splash
// claimed it, and the main window never got the 'will-prevent-unload' handler
// that overrides the page's own beforeunload. Closing it then did nothing —
// 'close' fired, 'closed' never did, and the process stayed alive with no way
// out but the task manager.
//
// Construction is synchronous, so for the whole time this is true the only
// window being created is the splash.
let constructingSplash = false;

// How long a replayed stage stays on screen before the next one replaces it.
const REPLAY_STEP = 220;

let splashWindow: BrowserWindow | null = null;
let pageLoaded = false;
// Stages reached before the page finished loading. Creating the window and
// loading its document takes long enough that boot is typically two stages in by
// the time anything can be displayed, so these are replayed rather than
// collapsed to the newest — otherwise the early stages are never seen at all and
// the first thing on screen is already 'Connecting…'.
const pendingStatuses: string[] = [];
let replayTimeout: NodeJS.Timeout | undefined;

const pushStatus = (text: string) => {
  if (!splashWindow || splashWindow.isDestroyed()) return;

  splashWindow.webContents
    .executeJavaScript(`window.__splashStatus?.(${JSON.stringify(text)})`)
    // A splash race must never be able to break boot.
    .catch(() => {});
};

const replayPendingStatuses = () => {
  // Cleared first, so `replayTimeout === undefined` always means "no replay is
  // pending" rather than "a timeout that already fired".
  clearTimeout(replayTimeout);
  replayTimeout = undefined;

  const next = pendingStatuses.shift();
  if (next === undefined) return;

  pushStatus(next);

  // A live stage arriving mid-replay is appended, so it still shows last.
  if (pendingStatuses.length > 0) {
    replayTimeout = setTimeout(replayPendingStatuses, REPLAY_STEP);
  }
};

export const isSplashWindow = (win: BrowserWindow | null | undefined) =>
  !!win && (constructingSplash || splashWindows.has(win));

export const isSplashOpen = () => !!splashWindow && !splashWindow.isDestroyed();

export const createSplashWindow = (icon: string): BrowserWindow | null => {
  if (splashWindow && !splashWindow.isDestroyed()) return splashWindow;

  try {
    constructingSplash = true;
    const win = new BrowserWindow({
      icon,
      title: APPLICATION_NAME,
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      center: true,
      frame: false,
      // `resizable: false` is applied after construction, not here. Passing it to
      // the constructor of a frameless window on Windows makes Electron subtract
      // the invisible resize-border metrics from the requested size — a 500×500
      // request lands as 452×476. Setting it afterwards keeps the exact size, and
      // a later center() call would shrink it the same way, so `center: true`
      // does that job at construction instead.
      maximizable: false,
      minimizable: false,
      fullscreenable: false,
      // Painted before the document is, so the window never flashes white.
      backgroundColor: '#0b0b0f',
      show: true,
      // Not always-on-top: a new window already has focus, so it starts on top
      // anyway, and staying there would only fight the main window during the
      // handoff and sit over whatever the user switched to meanwhile.
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        spellcheck: false,
        // The progress bar should keep moving while the window is unfocused.
        backgroundThrottling: false,
        devTools: is.dev(),
      },
    });

    // The window exists, so membership can carry the answer from here on and the
    // flag is no longer needed. Cleared before anything below can throw.
    splashWindows.add(win);
    constructingSplash = false;

    win.setResizable(false);

    splashWindow = win;
    pageLoaded = false;
    pendingStatuses.length = 0;

    // setApplicationMenu() lands while this window is still open; a frameless
    // window has nowhere to draw a menu bar, but say so explicitly.
    if (!is.macOS()) win.setMenu(null);

    win.once('closed', () => {
      if (splashWindow !== win) return;
      splashWindow = null;
      pageLoaded = false;
      pendingStatuses.length = 0;
      clearTimeout(replayTimeout);
      replayTimeout = undefined;
    });

    win.webContents.once('did-finish-load', () => {
      pageLoaded = true;
      replayPendingStatuses();
    });

    win.loadFile(SplashHtmlAsset).catch((error: unknown) => {
      console.warn(`${LoggerPrefix} Could not load the splash screen:`, error);
    });

    return win;
  } catch (error) {
    // A missing splash is not a reason to fail a launch. Leaving the flag set
    // would be: every later window would then be mistaken for the splash, and the
    // main window would never be set up at all.
    constructingSplash = false;
    console.warn(`${LoggerPrefix} Could not create the splash screen:`, error);
    return null;
  }
};

export const setSplashStatus = (text: string) => {
  if (!splashWindow || splashWindow.isDestroyed()) return;

  // Queued either because the page cannot show anything yet, or because a replay
  // is still running and this stage must not jump ahead of it.
  if (!pageLoaded || replayTimeout !== undefined) {
    pendingStatuses.push(text);

    // The replay only self-schedules while more remain, so an arrival after it
    // drained has to restart it.
    if (pageLoaded && replayTimeout === undefined) {
      replayTimeout = setTimeout(replayPendingStatuses, REPLAY_STEP);
    }
    return;
  }

  pushStatus(text);
};

export const closeSplashWindow = () => {
  const win = splashWindow;
  splashWindow = null;
  pageLoaded = false;
  pendingStatuses.length = 0;
  clearTimeout(replayTimeout);
  replayTimeout = undefined;
  if (!win || win.isDestroyed()) return;

  try {
    // destroy(), not close(): unconditional and immediate, with no 'close' event
    // for anything to cancel.
    win.destroy();
  } catch (error) {
    console.error(`${LoggerPrefix} Could not close the splash screen:`, error);
  }
};
