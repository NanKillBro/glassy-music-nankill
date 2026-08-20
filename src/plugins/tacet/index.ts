import path from 'path';

import { app, BrowserWindow, dialog, session, type MenuItemConstructorOptions } from 'electron';

import * as rootConfig from '@/config';
import { t } from '@/i18n';
import { restart } from '@/providers/app-controls';
import { createPlugin } from '@/utils';

export type TacetPluginConfig = {
  enabled: boolean;
  forceWasm: boolean;
  warningAccepted?: boolean;
};

let tacetExtensionId: string | null = null;
let popupWindow: BrowserWindow | null = null;
let offscreenWindow: BrowserWindow | null = null;

// -- Keeping the process mortal ---------------------------------------------

// Electron holds the process open until every BrowserWindow is gone, and the
// hidden offscreen window is one of them. So the app's own 'window-all-closed'
// never fires, app.quit() is never reached, and the process outlives the window
// the listener closed — forever, with a separation worker still in it. What
// follows is that event, counted over the windows the app opened rather than the
// ones this plugin did.
const watchedWindows = new WeakSet<BrowserWindow>();
let watchingAppWindows = false;
let windowsReleased = false;

function isPluginWindow(window: BrowserWindow): boolean {
  return window === offscreenWindow || window === popupWindow;
}

function releaseWindowsIfAppIsGone(): void {
  // 'closed' can arrive while the window is still listed, so the count is taken
  // on the next tick.
  setImmediate(() => {
    if (windowsReleased || !tacetExtensionId) return;
    if (BrowserWindow.getAllWindows().some((window) => !isPluginWindow(window))) {
      return;
    }
    windowsReleased = true;
    console.log(
      '[Tacet] The app has no windows of its own left, closing this plugin\'s so the process can exit',
    );
    cancelOffscreenRestart();
    destroyWindow('offscreen');
    destroyWindow('popup');
  });
}

function watchWindow(window: BrowserWindow): void {
  if (watchedWindows.has(window)) return;
  watchedWindows.add(window);
  window.once('closed', releaseWindowsIfAppIsGone);
}

function watchAppWindows(): void {
  for (const window of BrowserWindow.getAllWindows()) watchWindow(window);
  if (watchingAppWindows) return;
  watchingAppWindows = true;
  app.on('browser-window-created', (_event, window) => watchWindow(window));
}

function destroyWindow(which: 'offscreen' | 'popup'): void {
  const window = which === 'offscreen' ? offscreenWindow : popupWindow;
  if (which === 'offscreen') offscreenWindow = null;
  else popupWindow = null;
  if (!window) return;
  try {
    if (!window.isDestroyed()) window.destroy();
  } catch (err) {
    console.error(`[Tacet] Error destroying the ${which} window:`, err);
  }
}

// The offscreen document is where separation actually happens, and it is the one
// context with no window a listener can open devtools on — so without this its
// console goes nowhere. The extension gates its own logging behind a setting, so
// this stays quiet unless that setting is on.
function forwardConsole(window: BrowserWindow, label: string): void {
  window.webContents.on('console-message', (details) => {
    const line = `[Tacet][${label}] ${details.message}`;
    if (details.level === 'error') console.error(line);
    else if (details.level === 'warning') console.warn(line);
    else console.log(line);
  });
}

// A crashed renderer leaves the feature dead until the app restarts, so it gets
// rebuilt. The delay grows so that a fault which reappears immediately — a driver
// that cannot allocate, a model that will not compile — stops rather than spins.
const OFFSCREEN_RESTART_DELAYS_MS = [2_000, 10_000, 30_000];
let offscreenRestarts = 0;
let offscreenRestartTimer: NodeJS.Timeout | null = null;

function cancelOffscreenRestart(): void {
  if (offscreenRestartTimer) clearTimeout(offscreenRestartTimer);
  offscreenRestartTimer = null;
}

async function createOffscreenWindow(forceWasm: boolean): Promise<void> {
  if (!tacetExtensionId) {
    console.error('[Tacet] Cannot create the offscreen window without an extension id');
    return;
  }

  // Starting twice — which happens on macOS when the window is closed and the app
  // reactivated — must not leave the first one holding a session behind.
  destroyWindow('offscreen');

  try {
    const created = new BrowserWindow({
      show: false,
      width: 1,
      height: 1,
      webPreferences: {
        // contextIsolation must be false so the offscreen page can use
        // chrome.runtime.sendMessage to communicate with the background
        // service worker (the extension's internal messaging).
        contextIsolation: false,
        nodeIntegration: false,
        sandbox: false,
        // Enable WebGL/WebGPU for ONNX Runtime
        webgl: true,
        // Prevent Chromium from throttling the hidden window's timers/workers
        backgroundThrottling: false,
      },
    });
    offscreenWindow = created;

    created.webContents.session.setSpellCheckerEnabled(false);
    forwardConsole(created, 'offscreen');

    // The execution provider has to be settled before the page builds its first
    // inference session, so it travels in the url rather than through storage,
    // which the page only reads after it has already started.
    const query = forceWasm ? '?forceWasm=1' : '';
    if (forceWasm) {
      console.log('[Tacet] forceWasm mode enabled — ONNX will use the WASM (CPU) backend');
    }

    // Watch for crashes before the load, so a fault during startup is caught too.
    created.webContents.on('render-process-gone', (_event, details) => {
      if (offscreenWindow === created) offscreenWindow = null;
      if (!created.isDestroyed()) created.destroy();

      // A window we tore down on purpose is not a crash to recover from.
      if (details.reason === 'clean-exit' || details.reason === 'killed') return;
      if (!tacetExtensionId) return;

      console.error('[Tacet] Offscreen window renderer crashed:', details.reason);
      if (details.reason === 'oom') {
        console.error('[Tacet] Out of memory! Consider enabling forceWasm mode.');
      }

      const delayMs = OFFSCREEN_RESTART_DELAYS_MS[offscreenRestarts];
      if (delayMs === undefined) {
        console.error(
          `[Tacet] Offscreen window crashed ${offscreenRestarts} times, not rebuilding it again`,
        );
        return;
      }
      offscreenRestarts++;
      console.log(`[Tacet] Rebuilding the offscreen window in ${delayMs / 1000}s`);
      cancelOffscreenRestart();
      offscreenRestartTimer = setTimeout(() => {
        offscreenRestartTimer = null;
        if (!tacetExtensionId) return;
        createOffscreenWindow(forceWasm).catch((err) => {
          console.error('[Tacet] Failed to rebuild the offscreen window:', err);
        });
      }, delayMs);
    });

    created.webContents.on('unresponsive', () => {
      console.warn('[Tacet] Offscreen window became unresponsive');
    });

    created.webContents.on('responsive', () => {
      console.log('[Tacet] Offscreen window recovered');
    });

    await created.loadURL(
      `chrome-extension://${tacetExtensionId}/assets/offscreen.html${query}`,
    );
    console.log('[Tacet] Offscreen window created and loaded');
  } catch (err) {
    console.error('[Tacet] Failed to create offscreen window:', err);
  }
}

// Domains from the extension's host_permissions that need to be accessible
const ALLOWED_HOSTS = [
  'music.youtube.com',
  'www.youtube.com',
  '*.googlevideo.com',
  'models.betterlyrics.org',
];

function isAllowedHost(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ALLOWED_HOSTS.some((pattern) => {
      if (pattern.startsWith('*.')) {
        return url.hostname.endsWith(pattern.slice(1));
      }
      return url.hostname === pattern;
    });
  } catch {
    return false;
  }
}

export default createPlugin({
  name: () => 'Better Lyrics Tacet',
  description: () => 'Vocal separation for karaoke and crossfade between tracks',
  restartNeeded: false,
  config: {
    enabled: false,
    forceWasm: false,
    warningAccepted: false,
  } as TacetPluginConfig,

  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();
    if (!config.enabled) return [];

    const menuItems: MenuItemConstructorOptions[] = [
      {
        label: 'Open Settings',
        click: () => {
          if (!tacetExtensionId) {
            console.error('[Tacet] Extension ID not available yet');
            return;
          }

          if (popupWindow) {
            if (popupWindow.isMinimized()) popupWindow.restore();
            popupWindow.focus();
            return;
          }

          popupWindow = new BrowserWindow({
            width: 430,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
              contextIsolation: true,
              nodeIntegration: false,
            },
          });
          forwardConsole(popupWindow, 'settings');

          popupWindow.loadURL(`chrome-extension://${tacetExtensionId}/popup.html`);

          popupWindow.on('closed', () => {
            popupWindow = null;
          });
        },
      },
      {
        label: 'Force WASM (CPU) Mode',
        type: 'checkbox',
        checked: config.forceWasm,
        click: async (menuItem) => {
          await setConfig({ forceWasm: menuItem.checked });
          console.log(`[Tacet] forceWasm set to ${menuItem.checked}`);
          // The offscreen page settles its execution provider at load, so the new
          // value only means anything to a fresh one.
          if (tacetExtensionId) {
            cancelOffscreenRestart();
            offscreenRestarts = 0;
            await createOffscreenWindow(menuItem.checked);
          }
        },
      },
    ];

    return menuItems;
  },

  backend: {
    async start({ getConfig, setConfig, window }) {
      const config = await getConfig();
      if (!config.enabled) return;

      const targetWindow =
        window ?? BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];

      if (!config.warningAccepted) {
        const dialogOptions: Electron.MessageBoxOptions = {
          type: 'warning',
          title: 'Better Lyrics Tacet — Experimental Plugin',
          message: 'Better Lyrics Tacet is still in active development.',
          detail:
            'This plugin may not work properly and can cause the application to freeze and consume massive RAM usage.\n\nDo you want to proceed?',
          buttons: ['Enable Anyway', 'Disable Plugin'],
          defaultId: 0,
          cancelId: 1,
        };

        const choice =
          targetWindow && !targetWindow.isDestroyed()
            ? await dialog.showMessageBox(targetWindow, dialogOptions)
            : await dialog.showMessageBox(dialogOptions);

        if (choice.response === 1) {
          rootConfig.plugins.disable('tacet');
          return;
        }

        await setConfig({ warningAccepted: true });

        const restartOptions: Electron.MessageBoxOptions = {
          type: 'info',
          buttons: [
            t('main.dialog.need-to-restart.buttons.restart-now'),
            t('main.dialog.need-to-restart.buttons.later'),
          ],
          title: t('main.dialog.need-to-restart.title'),
          message: t('main.dialog.need-to-restart.message', {
            pluginName: 'Better Lyrics Tacet',
          }),
          detail: t('main.dialog.need-to-restart.detail', {
            pluginName: 'Better Lyrics Tacet',
          }),
          defaultId: 0,
          cancelId: 1,
        };

        const restartChoice =
          targetWindow && !targetWindow.isDestroyed()
            ? await dialog.showMessageBox(targetWindow, restartOptions)
            : await dialog.showMessageBox(restartOptions);

        if (restartChoice.response === 0) {
          restart();
          return;
        }
      }

      const basePath = app.isPackaged
        ? process.resourcesPath
        : path.join(__dirname, '../../');

      const extensionPath = path.join(basePath, 'extensions', 'tacet');

      // -- 1. Set up permission handlers for extension host_permissions --
      // Allow the extension to fetch from its declared host_permissions domains.
      // Without this, requests to models.betterlyrics.org and *.googlevideo.com
      // will fail with net::ERR_FAILED in the offscreen context.
      session.defaultSession.webRequest.onBeforeSendHeaders(
        {
          urls: [
            'https://models.betterlyrics.org/*',
            'https://*.googlevideo.com/*',
          ],
        },
        (details, callback) => {
          // Remove the Origin header that Electron adds which causes CORS issues
          // for cross-origin requests from chrome-extension:// context
          const headers = { ...details.requestHeaders };
          if (headers['Origin']?.startsWith('chrome-extension://')) {
            delete headers['Origin'];
          }
          callback({ requestHeaders: headers });
        },
      );

      // Allow WebGPU and other permissions needed by the extension
      session.defaultSession.setPermissionRequestHandler(
        (webContents, permission, callback) => {
          // Allow all permissions for extension pages
          const url = webContents.getURL();
          if (url.startsWith('chrome-extension://')) {
            callback(true);
            return;
          }
          // Allow WebGPU for YouTube Music (needed by content scripts)
          if (permission === 'media' || isAllowedHost(url)) {
            callback(true);
            return;
          }
          callback(false);
        },
      );

      // -- 2. Load the Chrome extension --
      try {
        const ext = await session.defaultSession.loadExtension(extensionPath);
        tacetExtensionId = ext.id;
        console.log('[Tacet] Extension loaded! ID:', ext.id);
      } catch (err) {
        console.error('[Tacet] Failed to load extension:', err);
        return;
      }

      // -- 3. Create the offscreen BrowserWindow --
      // In Chrome, the extension creates an "offscreen document" via chrome.offscreen API.
      // Electron doesn't support chrome.offscreen, so we manually create a hidden
      // BrowserWindow that loads the extension's offscreen.html page.
      // This window hosts the separation pipeline (SeparationHost + separator Worker).
      windowsReleased = false;
      watchAppWindows();
      await createOffscreenWindow(config.forceWasm);
    },
    stop({ setConfig }) {
      setConfig({ warningAccepted: false });
      // Cleared first: the crash handler treats a missing id as "the plugin is
      // gone" and will not rebuild the window we are about to tear down.
      tacetExtensionId = null;
      cancelOffscreenRestart();
      offscreenRestarts = 0;
      destroyWindow('offscreen');
      destroyWindow('popup');
    },
  },
});
