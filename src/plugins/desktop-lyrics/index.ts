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
  platform: Platform.Windows | Platform.Linux,
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
      const { createDesktopLyrics } = await import('./backend');
      if (request !== generation) return;
      controller?.stop();
      controller = createDesktopLyrics(window);
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
