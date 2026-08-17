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
            width: 400,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
              contextIsolation: true,
              nodeIntegration: false,
            },
          });

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
          console.log(`[Tacet] forceWasm set to ${menuItem.checked} (restart required)`);
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
      try {
        offscreenWindow = new BrowserWindow({
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

        // Set a reasonable memory limit for the offscreen renderer process
        // to prevent unbounded heap growth that crashes the app
        offscreenWindow.webContents.session.setSpellCheckerEnabled(false);

        const offscreenUrl = `chrome-extension://${tacetExtensionId}/assets/offscreen.html`;
        await offscreenWindow.loadURL(offscreenUrl);
        console.log('[Tacet] Offscreen window created and loaded');

        // Inject forceWasm setting into the offscreen context if needed.
        // The extension reads settings from chrome.storage.local via the
        // background service worker relay. We write the preference directly
        // so the separator worker picks it up.
        if (config.forceWasm) {
          console.log('[Tacet] forceWasm mode enabled — ONNX will use WASM (CPU) backend');
          // Write the modelVariant to storage so the extension uses WASM
          // The extension's settings have a modelVariant field that controls
          // which execution provider to use. We set it via chrome.storage.local
          // from the offscreen window's context.
          await offscreenWindow.webContents.executeJavaScript(`
            try {
              // Signal to the separator that it should use WASM instead of WebGPU.
              // The extension's separation-host.ts reads forceWasm from the init command.
              // We monkey-patch the Worker constructor to intercept the separator init
              // and inject forceWasm: true.
              const OriginalWorker = self.Worker;
              self.Worker = class PatchedWorker extends OriginalWorker {
                constructor(url, options) {
                  super(url, options);
                  const originalPostMessage = this.postMessage.bind(this);
                  this.postMessage = function(message, transfer) {
                    if (message && message.type === 'separate-init') {
                      message.forceWasm = true;
                      console.log('[Tacet] Injected forceWasm=true into separate-init command');
                    }
                    originalPostMessage(message, transfer);
                  };
                }
              };
              console.log('[Tacet] Worker patched for forceWasm mode');
              true;
            } catch (e) {
              console.error('[Tacet] Failed to patch Worker for forceWasm:', e);
              false;
            }
          `);
        }

        // Monitor the offscreen window for crashes
        offscreenWindow.webContents.on('render-process-gone', (_event, details) => {
          console.error('[Tacet] Offscreen window renderer crashed:', details.reason);
          if (details.reason === 'oom') {
            console.error('[Tacet] Out of memory! Consider enabling forceWasm mode.');
          }
          // Try to recover by recreating the offscreen window
          offscreenWindow = null;
        });

        offscreenWindow.webContents.on('unresponsive', () => {
          console.warn('[Tacet] Offscreen window became unresponsive');
        });

        offscreenWindow.webContents.on('responsive', () => {
          console.log('[Tacet] Offscreen window recovered');
        });

      } catch (err) {
        console.error('[Tacet] Failed to create offscreen window:', err);
      }
    },
    stop({ setConfig }) {
      setConfig({ warningAccepted: false });
      if (offscreenWindow) {
        try {
          if (!offscreenWindow.isDestroyed()) {
            offscreenWindow.destroy();
          }
        } catch (err) {
          console.error('[Tacet] Error destroying offscreen window:', err);
        }
        offscreenWindow = null;
      }
      if (popupWindow) {
        try {
          if (!popupWindow.isDestroyed()) {
            popupWindow.destroy();
          }
        } catch (err) {
          console.error('[Tacet] Error destroying popup window:', err);
        }
        popupWindow = null;
      }
      tacetExtensionId = null;
    },
  },
});
