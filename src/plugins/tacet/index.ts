import { session, app, BrowserWindow } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';
import type { MenuItemConstructorOptions } from 'electron';

export type TacetPluginConfig = {
  enabled: boolean;
};

let tacetExtensionId: string | null = null;
let popupWindow: BrowserWindow | null = null;
let offscreenWindow: BrowserWindow | null = null;

export default createPlugin({
  name: () => 'Tacet (Sing-along & Crossfade)',
  description: () => 'Vocal separation for karaoke and crossfade between tracks',
  restartNeeded: true,
  config: {
    enabled: false,
  } as TacetPluginConfig,

  menu: async ({ getConfig }) => {
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
    ];

    return menuItems;
  },

  backend: {
    async start({ getConfig }) {
      const config = await getConfig();
      if (!config.enabled) return;

      const basePath = app.isPackaged
        ? process.resourcesPath
        : path.join(__dirname, '../../');

      // 1. Load the Chrome extension
      const extensionPath = path.join(basePath, 'extensions', 'tacet');

      try {
        const ext = await session.defaultSession.loadExtension(extensionPath);
        tacetExtensionId = ext.id;
        console.log('[Tacet] Extension loaded! ID:', ext.id);

        // 2. Create hidden BrowserWindow for offscreen separation work
        offscreenWindow = new BrowserWindow({
          show: false,
          webPreferences: {
            contextIsolation: false,
            nodeIntegration: false,
            sandbox: false,
            // Allow WebGPU for ONNX separation
            webgl: true,
            backgroundThrottling: false,
          },
        });

        // Load the offscreen HTML from the extension assets
        const offscreenUrl = `chrome-extension://${ext.id}/assets/offscreen.html`;
        await offscreenWindow.loadURL(offscreenUrl);
        console.log('[Tacet] Offscreen window created and loaded');
      } catch (err) {
        console.error('[Tacet] Failed to load extension or offscreen window:', err);
      }
    },
    stop() {
      if (offscreenWindow) {
        offscreenWindow.destroy();
        offscreenWindow = null;
      }
      if (popupWindow) {
        popupWindow.destroy();
        popupWindow = null;
      }
    }
  },
});
