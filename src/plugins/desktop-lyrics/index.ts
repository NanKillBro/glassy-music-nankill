import { createRequire } from 'node:module';
import path from 'node:path';

import { app } from 'electron';

import { Platform } from '@/types/plugins';
import { createPlugin } from '@/utils';

type DesktopLyricsController = {
  start(): void;
  stop(): void;
  open(): void;
  close(): void;
};

let controller: DesktopLyricsController | null = null;
let generation = 0;

export default createPlugin({
  name: () => 'Desktop Lyrics',
  description: () =>
    'Optional transparent desktop lyrics powered by Better Lyrics',
  platform: Platform.Windows,
  restartNeeded: false,
  config: {
    enabled: false,
    openAtStartup: false,
  },
  menu: async ({ getConfig, setConfig, refresh }) => {
    const settings = await getConfig();
    return [
      { label: 'Show desktop lyrics', click: () => controller?.open() },
      { label: 'Hide desktop lyrics', click: () => controller?.close() },
      { type: 'separator' },
      {
        label: 'Open on startup',
        type: 'checkbox',
        checked: settings.openAtStartup,
        click: async (item) => {
          await setConfig({ openAtStartup: item.checked });
          await refresh();
        },
      },
    ];
  },
  backend: {
    async start({ window, getConfig }) {
      const request = ++generation;
      const settings = await getConfig();
      if (request !== generation || !settings.enabled) return;
      controller?.stop();
      const directory = app.isPackaged
        ? path.join(process.resourcesPath, 'desktop-lyrics')
        : path.resolve(import.meta.dirname, '../../desktop-lyrics');
      const require = createRequire(import.meta.url);
      const runtime = require(path.join(directory, 'runtime.cjs')) as {
        createDesktopLyrics(options: {
          window: typeof window;
          directory: string;
        }): DesktopLyricsController;
      };
      controller = runtime.createDesktopLyrics({ window, directory });
      controller.start();
      if (settings.openAtStartup) controller.open();
    },
    stop() {
      generation++;
      controller?.stop();
      controller = null;
    },
  },
});
