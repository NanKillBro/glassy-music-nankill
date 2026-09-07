import path from 'path';
import {
  app,
  BrowserWindow,
  session,
  type MenuItemConstructorOptions,
} from 'electron';
import { createPlugin } from '@/utils';

// 1. Định nghĩa kiểu dữ liệu cho Config (Chỉ giữ lại enabled)
export type BetterLyricsShadersConfig = {
  enabled: boolean;
};

let extensionId: string | null = null;
let popupWindow: BrowserWindow | null = null;

function getExtensionPath(): string {
  const basePath = app.isPackaged
    ? process.resourcesPath
    : path.join(__dirname, '../../');
  return path.join(basePath, 'extensions', 'bls');
}

async function getOrLoadExtensionId(): Promise<string | null> {
  if (extensionId) return extensionId;

  const extensionPath = getExtensionPath();
  const loaded = session.defaultSession
    .getAllExtensions()
    .find(
      (ext) =>
        ext.name === 'Better Lyrics Shaders' ||
        path.resolve(ext.path) === path.resolve(extensionPath),
    );

  if (loaded) {
    extensionId = loaded.id;
    return extensionId;
  }

  try {
    const ext = await session.defaultSession.loadExtension(extensionPath);
    extensionId = ext.id;
    return extensionId;
  } catch (err) {
    console.error('[Better Lyrics Shaders] Failed to load extension:', err);
    return null;
  }
}

export default createPlugin({
  name: () => 'Better Lyrics Shaders',
  description: () => 'Adds shader effects to lyrics background',
  restartNeeded: false,

  // 2. Config mặc định
  config: {
    enabled: true,
  } as BetterLyricsShadersConfig,

  menu: async (): Promise<MenuItemConstructorOptions[]> => {
    return [
      {
        label: 'Open Settings',
        click: async () => {
          const extId = await getOrLoadExtensionId();
          if (!extId) {
            console.error(
              '[Better Lyrics Shaders] Extension ID not available yet',
            );
            return;
          }

          if (popupWindow && !popupWindow.isDestroyed()) {
            if (popupWindow.isMinimized()) popupWindow.restore();
            popupWindow.focus();
            return;
          }

          popupWindow = new BrowserWindow({
            width: 430,
            height: 600,
            useContentSize: true,
            autoHideMenuBar: true,
            webPreferences: {
              contextIsolation: true,
              nodeIntegration: false,
            },
          });

          popupWindow.loadURL(`chrome-extension://${extId}/popup.html`);

          popupWindow.on('closed', () => {
            popupWindow = null;
          });
        },
      },
    ];
  },

  backend: {
    // 3. Sửa backend để luôn đọc folder 'bls'
    async start({ getConfig }) {
      const config = await getConfig();
      const extensionPath = getExtensionPath();

      console.log(`Loading Better Lyrics Shaders from:`, extensionPath);

      if (config.enabled) {
        session.defaultSession
          .loadExtension(extensionPath)
          .then((ext) => {
            extensionId = ext.id;
            console.log(`Better Lyrics Shaders loaded! ID:`, ext.id);
          })
          .catch((err) => {
            console.error(`Failed to load Better Lyrics Shaders:`, err);
          });
      }
    },
  },
});
