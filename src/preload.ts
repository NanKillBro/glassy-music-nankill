import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
  webFrame,
} from 'electron';
import is from 'electron-is';

import { loadI18n, setLanguage } from '@/i18n';

import * as config from './config';
import {
  forceLoadPreloadPlugin,
  forceUnloadPreloadPlugin,
  loadAllPreloadPlugins,
} from './loader/preload';

const markElectronHost = (): void => {
  document.documentElement?.setAttribute('data-electron-host', '');
};
if (document.documentElement) markElectronHost();
else
  document.addEventListener('readystatechange', markElectronHost, {
    once: true,
  });

// @ts-expect-error dummy
globalThis.customElements = { define() { } };

new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      const elem = node as HTMLElement;
      if (elem.tagName !== 'SCRIPT') continue;

      const script = elem as HTMLScriptElement;
      if (
        !script.getAttribute('src')?.endsWith('custom-elements-es5-adapter.js')
      )
        continue;

      script.remove();

      observer.disconnect();
      return;
    }
  }
}).observe(document, { subtree: true, childList: true });

loadI18n().then(async () => {
  await setLanguage(config.get('options.language') ?? 'en');
  await loadAllPreloadPlugins();
});

ipcRenderer.on('plugin:unload', async (_, id: string) => {
  await forceUnloadPreloadPlugin(id);
});
ipcRenderer.on('plugin:enable', async (_, id: string) => {
  await forceLoadPreloadPlugin(id);
});

contextBridge.exposeInMainWorld('mainConfig', config);
contextBridge.exposeInMainWorld('electronIs', is);
contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => ipcRenderer.on(channel, listener),
  off: (channel: string, listener: (...args: unknown[]) => void) =>
    ipcRenderer.off(channel, listener),
  once: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => ipcRenderer.once(channel, listener),
  send: (channel: string, ...args: unknown[]) =>
    ipcRenderer.send(channel, ...args),
  removeListener: (channel: string, listener: (...args: unknown[]) => void) =>
    ipcRenderer.removeListener(channel, listener),
  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),
  invoke: async (channel: string, ...args: unknown[]): Promise<unknown> =>
    ipcRenderer.invoke(channel, ...args),
  sendSync: (channel: string, ...args: unknown[]): unknown =>
    ipcRenderer.sendSync(channel, ...args),
  sendToHost: (channel: string, ...args: unknown[]) =>
    ipcRenderer.sendToHost(channel, ...args),
});
contextBridge.exposeInMainWorld('reload', () =>
  ipcRenderer.send('peard:reload'),
);
contextBridge.exposeInMainWorld(
  'ELECTRON_RENDERER_URL',
  process.env.ELECTRON_RENDERER_URL,
);

// Fallback for the main-process request block: freeze the native WAAPI globals
// in the main world at document-start so the legacy polyfill cannot replace
// them, including copies served from the service-worker cache.
const waapiLockScript = `(() => {
  const findDescriptor = (object, key) => {
    for (let target = object; target; target = Object.getPrototypeOf(target)) {
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (descriptor) return descriptor;
    }
  };
  const lock = (object, key) => {
    const descriptor = findDescriptor(object, key);
    if (!descriptor) return;
    try {
      Object.defineProperty(
        object,
        key,
        'get' in descriptor || 'set' in descriptor
          ? { get: descriptor.get, set: descriptor.set, enumerable: descriptor.enumerable, configurable: false }
          : { value: descriptor.value, writable: false, enumerable: descriptor.enumerable, configurable: false },
      );
    } catch {}
  };
  for (const key of [
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'getComputedStyle',
    'Animation',
    'KeyframeEffect',
    'AnimationEffect',
    'AnimationTimeline',
  ]) {
    lock(window, key);
  }
  for (const key of ['animate', 'getAnimations']) {
    lock(Element.prototype, key);
  }
  lock(Document.prototype, 'timeline');
  lock(document, 'timeline');
})();`;

if (config.get('options.disableWebAnimationsPolyfill') ?? true) {
  let lockPending = true;
  webFrame.executeJavaScript(waapiLockScript, true, () => {
    lockPending = false;
  });
  // HACK: Wait for the script to be executed
  while (lockPending);
}

const [path, script] = ipcRenderer.sendSync('get-renderer-script') as [
  string | null,
  string,
];
let blocked = true;
if (path) {
  webFrame.executeJavaScriptInIsolatedWorld(
    0,
    [
      {
        code: script,
        url: path,
      },
    ],
    true,
    () => (blocked = false),
  );
} else {
  webFrame.executeJavaScript(script, true, () => (blocked = false));
}

// HACK: Wait for the script to be executed
while (blocked);
