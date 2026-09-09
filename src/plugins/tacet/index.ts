import path from 'path';

import { app, BrowserWindow, dialog, session, type MenuItemConstructorOptions } from 'electron';

import * as rootConfig from '@/config';
import { t } from '@/i18n';
import { restart } from '@/providers/app-controls';
import { createPlugin } from '@/utils';

export type TacetPluginConfig = {
  enabled: boolean;
  forceWasm: boolean;
  /**
   * The experimental warning was accepted for this run. It is asked once
   * separation is actually switched on, not when the plugin is enabled — see
   * SEPARATION_MODE_MARKER below.
   */
  warningAccepted?: boolean;
  /** The "restart to finish enabling" offer has already been made this run. */
  restartOffered?: boolean;
  /** Conflicting plugins the listener chose to keep enabled anyway. */
  acceptedConflicts?: string[];
};

let tacetExtensionId: string | null = null;
let popupWindow: BrowserWindow | null = null;
let offscreenWindow: BrowserWindow | null = null;

// -- Knowing which separation mode the listener picked -----------------------

// The experimental warning is about separation: that is what loads a 163 MB model,
// runs a neural network over every segment of the track and can take the app with
// it. Everything else this plugin does — the crossfade, the fader dock — is cheap,
// so enabling the plugin is not on its own worth a modal.
//
// The mode lives in the extension's own `chrome.storage.local` under `blk-settings`
// ("off" | "on-demand" | "every-track", src/settings/separation-mode.ts), which the
// main process has no api for: extension storage is a LevelDB inside the session and
// Electron exposes no reader for it. What the main process does have is a window on
// an extension page — the offscreen document — so the page is asked to read the mode
// and to report every later change, and it reports over its console, which is
// already forwarded here. That avoids a preload handing `ipcRenderer` to a page whose
// contextIsolation is off, and avoids patching the extension (the tracked sources
// there stay upstream-pristine; see extensions-src/tacet-glassy/CLAUDE.md).
type TacetSeparationMode = 'off' | 'on-demand' | 'every-track';

const SETTINGS_STORAGE_KEY = 'blk-settings';
const SEPARATION_MODE_MARKER = '__TACET_SEPARATION_MODE__';

function isSeparationMode(value: string): value is TacetSeparationMode {
  return value === 'off' || value === 'on-demand' || value === 'every-track';
}

// Named after the row the listener just changed — "Sing-along" in the extension's
// settings window — so the warning is recognisable as an answer to it.
const SEPARATION_MODE_DETAIL: Record<Exclude<TacetSeparationMode, 'off'>, string> = {
  'on-demand':
    'Sing-along is set to "Only when I ask": tapping the button separates the track you are on.',
  'every-track':
    'Sing-along is set to "Every track": each one is separated as it plays, without being asked.',
};

// Assigned by backend.start and cleared by stop(). The reports arrive on a
// module-scope listener, but everything they lead to needs the plugin's config, and
// a module-scope reference to '@/config' would break the renderer bundle — see the
// note above CONFLICTING_PLUGINS.
let onSeparationModeReport: ((mode: TacetSeparationMode) => void) | null = null;

const SEPARATION_MODE_WATCHER_SCRIPT = `
(() => {
  const KEY = ${JSON.stringify(SETTINGS_STORAGE_KEY)};
  const MARKER = ${JSON.stringify(SEPARATION_MODE_MARKER)};
  if (window.__tacetSeparationModeWatched) return 'already watching';
  window.__tacetSeparationModeWatched = true;

  const modeOf = (value) => {
    const settings = value && typeof value === 'object' ? value : {};
    const mode = settings.separationMode;
    if (mode === 'off' || mode === 'on-demand' || mode === 'every-track') return mode;
    // No mode stored yet: the extension falls back to the two booleans it used to
    // keep (resolveSeparationMode in src/settings/settings.ts), and so must this,
    // or a profile from before that migration reads as off while separation is on.
    const sang = settings.singAlongEnabled;
    const auto = settings.autoSeparateEnabled;
    if (typeof sang !== 'boolean' && typeof auto !== 'boolean') return 'off';
    if (sang === false) return 'off';
    return auto === false ? 'on-demand' : 'every-track';
  };

  const report = (value) => {
    console.log(MARKER + ' ' + modeOf(value));
  };

  chrome.storage.local
    .get(KEY)
    .then((stored) => report(stored[KEY]))
    .catch((error) => {
      console.error('failed to read the separation mode for the host', error);
    });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !(KEY in changes)) return;
    report(changes[KEY].newValue);
  });

  return 'watching';
})();
`;

const TURN_SEPARATION_OFF_SCRIPT = `
(async () => {
  const KEY = ${JSON.stringify(SETTINGS_STORAGE_KEY)};
  const stored = await chrome.storage.local.get(KEY);
  const current = stored[KEY];
  const base = current && typeof current === 'object' ? current : {};
  await chrome.storage.local.set({ [KEY]: Object.assign({}, base, { separationMode: 'off' }) });
  return 'off';
})();
`;

function watchSeparationMode(window: BrowserWindow): void {
  const { webContents } = window;

  webContents.on('console-message', (details) => {
    if (!details.message.startsWith(SEPARATION_MODE_MARKER)) return;
    const reported = details.message.slice(SEPARATION_MODE_MARKER.length).trim();
    if (!isSeparationMode(reported)) {
      console.error(`[Tacet] Unknown separation mode reported: ${reported}`);
      return;
    }
    console.log(`[Tacet] Separation mode is ${reported}`);
    onSeparationModeReport?.(reported);
  });

  // On 'did-finish-load' rather than after the loadURL below, so that a reload —
  // or a rebuild after a renderer crash — reinstalls the watcher with the page.
  webContents.on('did-finish-load', () => {
    webContents.executeJavaScript(SEPARATION_MODE_WATCHER_SCRIPT).catch((err) => {
      console.error('[Tacet] Failed to watch the separation mode:', err);
    });
  });
}

// Writing the setting back is the same channel in reverse, and it is the honest
// answer to "no" here: the listener turned separation on from the extension's own
// settings window, so that is where the refusal has to land. Disabling the whole
// plugin instead would take the crossfade and the fader with it — and close the
// window they were just looking at.
async function turnSeparationOff(): Promise<void> {
  const target = offscreenWindow;
  if (!target || target.isDestroyed()) {
    console.error('[Tacet] Cannot turn separation off, there is no offscreen window');
    return;
  }

  await target.webContents.executeJavaScript(TURN_SEPARATION_OFF_SCRIPT);
  console.log('[Tacet] Separation turned back off, the warning was declined');

  // The settings window reads the mode once, when it builds the row, and its own
  // storage.onChanged handler only re-checks which panels are live (popup.tsx) — so
  // the select would go on showing the mode that was just declined.
  if (popupWindow && !popupWindow.isDestroyed()) popupWindow.reload();
}

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
  // Every app window is also where content scripts run, so this is the hook that
  // gets their logging into the terminal.
  forwardExtensionConsoleFrom(window);
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

// Writes one forwarded line to the main-process console. Kept trivial on
// purpose: it dispatches to the matching console method and swallows any failure.
// The write is wrapped because this runs inside Electron `console-message`
// handlers — a throw here (which is exactly what an undefined reference did
// before) escapes back into an event handler, and a packaged Linux app launched
// from a `.desktop` entry can have no usable stdout, so the write itself can
// EPIPE. Losing a diagnostic line must never take a handler down with it.
function emitForwarded(level: 'error' | 'warn' | 'log', line: string): void {
  try {
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  } catch {
    // Nothing we can do if even logging fails; do not let it propagate.
  }
}

// The offscreen document is where separation actually happens, and it is the one
// context with no window a listener can open devtools on — so without this its
// console goes nowhere. The extension gates its own logging behind a setting, so
// this stays quiet unless that setting is on.
function forwardConsole(window: BrowserWindow, label: string): void {
  window.webContents.on('console-message', (details) => {
    // The separation-mode reports below travel over this console; they are a
    // channel, not a diagnostic, and watchSeparationMode logs what they mean.
    if (details.message.startsWith(SEPARATION_MODE_MARKER)) return;
    const line = `[Tacet][${label}] ${details.message}`;
    if (details.level === 'error') emitForwarded('error', line);
    else if (details.level === 'warning') emitForwarded('warn', line);
    else emitForwarded('log', line);
  });
}

// The extension's background service worker has no window either, and the
// forwarding above only covers windows this plugin creates — so everything the
// background logged has been invisible, including the censuses written to name a
// context that is talking in a loop. Service worker consoles arrive on the
// session instead of on a webContents.
let backgroundConsoleForwarded = false;

function forwardBackgroundConsole(): void {
  if (backgroundConsoleForwarded) return;
  backgroundConsoleForwarded = true;

  // Attached to the session, which outlives this plugin, so it is attached once
  // and reads the extension id at the moment a line arrives — null while the
  // plugin is off, which is when it forwards nothing.
  session.defaultSession.serviceWorkers.on('console-message', (_event, details) => {
    if (!tacetExtensionId) return;
    // Other extensions have service workers too. An empty sourceUrl is let
    // through: it cannot be attributed, and losing the diagnostic is worse than
    // a stray line from a neighbour.
    if (details.sourceUrl && !details.sourceUrl.includes(tacetExtensionId)) {
      return;
    }
    // 0..3 is verbose, info, warning, error.
    const line = `[Tacet][background] ${details.message}`;
    if (details.level >= 3) emitForwarded('error', line);
    else if (details.level === 2) emitForwarded('warn', line);
    else emitForwarded('log', line);
  });
}

// The content scripts and the page-world playback graph log from the app's own
// window, which this plugin does not own — so the orchestrator, the one context
// that says what it is doing and why, is invisible in the terminal. It can be
// forwarded, filtered to the lines the extension wrote (the rest of that console
// belongs to YouTube Music and to the app), but it is off unless asked for:
// devtools on the main window already shows it, and the orchestrator narrates
// every stage message it receives, which is a lot of lines for a terminal that is
// normally being read for something else. Set TACET_PAGE_LOGS=1 to get it while
// hunting something.
const EXTENSION_LOG_PREFIX = '[Tacet]';

function forwardExtensionConsoleFrom(window: BrowserWindow): void {
  if (process.env.TACET_PAGE_LOGS !== '1') return;
  window.webContents.on('console-message', (details) => {
    if (!details.message.startsWith(EXTENSION_LOG_PREFIX)) return;
    // This plugin's own windows have their console forwarded in full already,
    // and this may be one of them: 'browser-window-created' fires before the
    // window is assigned, so the question is asked when a line arrives instead.
    if (isPluginWindow(window)) return;
    const line = `[Tacet][page] ${details.message}`;
    if (details.level === 'error') emitForwarded('error', line);
    else if (details.level === 'warning') emitForwarded('warn', line);
    else emitForwarded('log', line);
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
    watchSeparationMode(created);

    // The execution provider has to be settled before the page builds its first
    // inference session, so it travels in the url rather than through storage,
    // which the page only reads after it has already started.
    // `owner=host` marks the window *this plugin* created. Electron 42 does
    // implement chrome.offscreen — measured, contrary to an earlier note here —
    // but hasDocument() answers false while this plain BrowserWindow is loaded,
    // because a window is not registered with the offscreen document manager.
    // So the extension's own ensureOffscreenDocument() used to create a *second*
    // live copy of the page on top of this one, and every track was separated
    // twice. The extension side no longer creates one (patch 11
    // `host-owns-offscreen-document`); this marker stays because without it the
    // two are indistinguishable in the devtools target list — same url, same
    // <title>. Anything appearing WITHOUT the marker was not created here.
    const query = `?owner=host${forceWasm ? '&forceWasm=1' : ''}`;
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

// -- Plugins that cannot share the player with Tacet ------------------------

// Tacet rewires this page's audio. It takes the media element source the
// renderer publishes as window.__blyricsAudio, cuts that source's direct line to
// the speakers and feeds it through a gain of its own, which is how the original
// track is faded down while the separated stems play. Anything else that gives
// the audio a second path to the destination hands the listener a copy Tacet's
// gain does not control, so the vocals it just removed keep playing.
//
// Deliberately not listed, each checked rather than assumed: precise-volume and
// exponential-volume (they set the element's volume, upstream of the source, so
// it scales the stems too), custom-output-device (it moves the shared context,
// which Tacet follows), skip-silences (its analyser is a tap that never reaches
// the destination — though its seeking desyncs the stem deck, which then restarts
// at the playhead) and better-lyrics-shaders (it reads the bus the renderer
// published instead of building its own).
//
// Strings only here, and no function. Everything that acts on this list lives
// inside backend.start, because module-scope code in a plugin file is bundled
// into the renderer script — plugin-loader.mts strips the backend/preload/menu
// properties of the createPlugin literal and nothing else — and from there a
// reference to '@/config' drags electron-store's module-scope `new Store()`
// along with it. Its node imports do not exist in the renderer's isolated world,
// so the whole renderer script throws while being evaluated: no menu bar, no
// window.__blyricsAudio, and this plugin left unable to capture any audio at
// all. It costs 190 kB in dist/renderer/*.iife.js, which is how to check for it:
// grep that bundle for `clearInvalidConfig` and expect zero hits.
const CONFLICTING_PLUGINS = [
  {
    id: 'crossfade',
    nameKey: 'plugins.crossfade.name',
    reason:
      'plays its own second copy of the track through Howler and fades the player against it, then skips to the next song early. That copy still has its vocals and never passes through the karaoke mix. Tacet also has its own crossfade, timed against the end of the track.',
  },
  {
    id: 'equalizer',
    nameKey: 'plugins.equalizer.name',
    reason:
      'connects the player straight to the speakers through its filters (source → filter → destination), a second path the karaoke mix does not control, so the vocals stay audible.',
  },
  {
    id: 'pitch-shift',
    nameKey: 'plugins.pitch-shift.name',
    reason:
      'claims the same media element source, cutting its direct line to the speakers and routing it through a pitch-shifting worklet instead. Whichever of the two attaches last takes the source away from the other, so one of them is left playing nothing.',
  },
] as const;

let pluginRunning = false;
let conflictWatcherInstalled = false;
let conflictDialogOpen = false;

export default createPlugin({
  name: () => 'Better Lyrics Tacet',
  description: () => 'Vocal separation for karaoke and crossfade between tracks',
  restartNeeded: false,
  config: {
    enabled: false,
    forceWasm: false,
    warningAccepted: false,
    restartOffered: false,
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

      // Enabling this plugin mid-session loads the extension into a session whose
      // player page is already open, and content scripts only run at navigation — so
      // the fader and the orchestrator are absent from the page until the app
      // restarts. Hence the offer, made once per enable (stop() clears the flag on
      // the way out) and never at boot, where start() runs before the page is loaded
      // and the extension is therefore in place in time.
      //
      // The experimental warning used to be raised here as well. It is now raised
      // when separation is switched on instead, which is the thing it warns about;
      // see onSeparationModeReport below.
      const restartAlreadyOffered =
        // warningAccepted is what marked a completed enable flow before this flag
        // existed, and that flow always ended in this offer. Without reading it, an
        // existing profile would be asked to restart once more, for nothing.
        config.restartOffered ?? config.warningAccepted ?? false;

      if (!restartAlreadyOffered) {
        await setConfig({ restartOffered: true });

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

      pluginRunning = true;

      // Local, not module scope — see the note above CONFLICTING_PLUGINS.
      //
      // Whichever window is focused first, so the separation warning lands on the
      // settings window when that is where the mode was just changed. The offscreen
      // window is the one that can never be it: 1×1 and never shown, a dialog
      // parented to it would have nowhere to appear.
      const dialogParent = (): BrowserWindow | null => {
        const candidates = [
          BrowserWindow.getFocusedWindow(),
          targetWindow,
          ...BrowserWindow.getAllWindows(),
        ];
        for (const candidate of candidates) {
          if (candidate && !candidate.isDestroyed() && candidate !== offscreenWindow) {
            return candidate;
          }
        }
        return null;
      };

      const warnAboutConflicts = async (): Promise<void> => {
        if (conflictDialogOpen) return;

        const accepted = (await getConfig()).acceptedConflicts ?? [];
        const conflicts: { id: string; label: string; reason: string }[] = [];
        for (const { id, nameKey, reason } of CONFLICTING_PLUGINS) {
          if (accepted.includes(id)) continue;
          if (!(await rootConfig.plugins.isEnabled(id))) continue;
          conflicts.push({ id, label: t(nameKey), reason });
        }
        if (conflicts.length === 0) return;

        const single = conflicts.length === 1;
        const dialogOptions: Electron.MessageBoxOptions = {
          type: 'warning',
          title: 'Better Lyrics Tacet — Conflicting Plugins',
          message: single
            ? `${conflicts[0].label} cannot be used together with Better Lyrics Tacet.`
            : `${conflicts.length} enabled plugins cannot be used together with Better Lyrics Tacet.`,
          detail:
            `${conflicts.map(({ label, reason }) => `• ${label} — ${reason}`).join('\n\n')}\n\n` +
            'Tacet takes over the player\'s audio to fade the original track out and the separated stems in. While these plugins are enabled the karaoke mix and Tacet\'s own crossfade will not work correctly.',
          buttons: [
            single ? 'Disable That Plugin' : 'Disable Those Plugins',
            'Keep Them Enabled',
          ],
          defaultId: 0,
          cancelId: 1,
        };

        conflictDialogOpen = true;
        try {
          const parent = dialogParent();
          const choice = parent
            ? await dialog.showMessageBox(parent, dialogOptions)
            : await dialog.showMessageBox(dialogOptions);

          if (choice.response === 0) {
            for (const { id, label } of conflicts) {
              console.log(`[Tacet] Disabling ${label} (${id}), it conflicts with this plugin`);
              rootConfig.plugins.disable(id);
            }
            return;
          }

          // Asked and answered. The same question is not worth a second dialog,
          // and this is forgotten when the plugin is turned off, like the
          // experimental warning above.
          await setConfig({
            acceptedConflicts: [...accepted, ...conflicts.map(({ id }) => id)],
          });
          console.log(
            `[Tacet] Keeping ${conflicts.map(({ id }) => id).join(', ')} enabled at the listener's request`,
          );
        } finally {
          conflictDialogOpen = false;
        }
      };

      // The app awaits every plugin's start() before it loads the player page and
      // installs the menu (loadAllMainPlugins, in src/index.ts), so a dialog opened
      // from here would hold the whole boot behind a modal parented to a window that
      // is not on screen yet. An empty url means loadURL has not been called, which
      // is the case during that initial load and no other time.
      const whenThePageIsUp = (ask: () => void): void => {
        if (
          targetWindow &&
          !targetWindow.isDestroyed() &&
          !targetWindow.webContents.getURL()
        ) {
          targetWindow.webContents.once('did-finish-load', ask);
        } else {
          ask();
        }
      };

      const askAboutConflicts = (): void => {
        warnAboutConflicts().catch((err) => {
          console.error('[Tacet] Failed to warn about a plugin conflict:', err);
        });
      };

      whenThePageIsUp(askAboutConflicts);

      // A conflict can also be created after this plugin has started, by enabling
      // one of those plugins from the menu. rootConfig.watch has no unsubscribe,
      // so the listener goes on once and asks whether the plugin is still running.
      if (!conflictWatcherInstalled) {
        conflictWatcherInstalled = true;
        rootConfig.watch((newValue, oldValue) => {
          if (!pluginRunning) return;

          const enabledIn = (value: unknown, id: string): boolean =>
            (value as { plugins?: Record<string, { enabled?: boolean }> } | undefined)
              ?.plugins?.[id]?.enabled === true;

          const turnedOn = CONFLICTING_PLUGINS.some(
            ({ id }) => enabledIn(newValue, id) && !enabledIn(oldValue, id),
          );
          if (turnedOn) askAboutConflicts();
        });
      }

      // -- The experimental warning ------------------------------------------

      // Raised the first time separation is switched on, and once per enable: the
      // answer is remembered in warningAccepted, which stop() clears, so turning the
      // plugin off and on again asks once more. The offscreen page reports the mode
      // as soon as it loads too, which covers the case of a profile that already had
      // separation on before this plugin was enabled.
      let separationWarningOpen = false;

      const warnAboutSeparation = async (
        mode: Exclude<TacetSeparationMode, 'off'>,
      ): Promise<void> => {
        if (separationWarningOpen || !pluginRunning) return;
        if ((await getConfig()).warningAccepted) return;

        const dialogOptions: Electron.MessageBoxOptions = {
          type: 'warning',
          title: 'Better Lyrics Tacet — Experimental Feature',
          message: 'Vocal separation in Better Lyrics Tacet is still in active development.',
          detail:
            `${SEPARATION_MODE_DETAIL[mode]}\n\n` +
            'Separating a track runs a neural network on this machine. It may not work properly and can cause the application to freeze and consume massive RAM usage.\n\nDo you want to proceed?',
          buttons: ['Turn It On Anyway', 'Keep Separation Off'],
          defaultId: 0,
          cancelId: 1,
        };

        separationWarningOpen = true;
        try {
          const parent = dialogParent();
          const choice = parent
            ? await dialog.showMessageBox(parent, dialogOptions)
            : await dialog.showMessageBox(dialogOptions);

          if (choice.response === 1) {
            await turnSeparationOff();
            return;
          }

          await setConfig({ warningAccepted: true });
          console.log(`[Tacet] Separation accepted at the listener's request (${mode})`);
        } finally {
          separationWarningOpen = false;
        }
      };

      onSeparationModeReport = (mode) => {
        // "off" is the default and the state the refusal above writes back, so it is
        // the one mode that has nothing to warn about.
        if (mode === 'off') return;
        whenThePageIsUp(() => {
          warnAboutSeparation(mode).catch((err) => {
            console.error('[Tacet] Failed to warn about separation:', err);
          });
        });
      };

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
        forwardBackgroundConsole();
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
      setConfig({ warningAccepted: false, restartOffered: false, acceptedConflicts: [] });
      onSeparationModeReport = null;

      // The host offers a restart itself when a plugin declaring restartNeeded is
      // toggled (the config watcher in src/index.ts), but it offers it on the way in
      // as well — where start() already makes that offer for itself, so the two
      // dialogs would land on top of each other. Hence restartNeeded: false, and the
      // offer is made here instead for the way out, which is the only path that
      // reaches stop(): forceUnloadMainPlugin is called from the watcher when the
      // plugin is disabled, and unloadAllMainPlugins — the one caller that would fire
      // on the way to quitting — is never used.
      //
      // A restart genuinely is needed: the extension stays registered in the
      // session for the life of the process, and the separation worker's model
      // stays in the GPU's memory with it.
      //
      // Skipped when the plugin never ran — start() returns before this is set when
      // the plugin is disabled, and when the listener answered its offer by
      // restarting, in which case a second offer is noise.
      const wasRunning = pluginRunning;
      pluginRunning = false;

      if (wasRunning) {
        // Still before destroyWindow below, so isPluginWindow can tell this
        // plugin's own windows from the app's.
        const parent = BrowserWindow.getAllWindows().find(
          (window) => !window.isDestroyed() && !isPluginWindow(window),
        );
        const dialogOptions: Electron.MessageBoxOptions = {
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

        // Not awaited: the teardown below should happen whether the listener
        // restarts now or later, and stop() is not a place to hold the app up.
        const question = parent
          ? dialog.showMessageBox(parent, dialogOptions)
          : dialog.showMessageBox(dialogOptions);
        question
          .then((answer) => {
            if (answer.response === 0) restart();
          })
          .catch((err) => {
            console.error('[Tacet] Failed to offer a restart:', err);
          });
      }

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
