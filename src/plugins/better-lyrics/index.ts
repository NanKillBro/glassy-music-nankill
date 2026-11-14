import fs from 'fs';
import path from 'path';

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  session,
  webFrame,
  type MenuItemConstructorOptions,
} from 'electron';

import * as config from '@/config';
import { restart } from '@/providers/app-controls';
import { openFontSettingsWindow } from '@/providers/font-settings';
import { createPlugin } from '@/utils';

import { settingsWindowThemeCss } from './settings-theme';
import {
  GLASSY_THEME_LOCK_ATTRIBUTE,
  GLASSY_THEME_LOCK_KEY,
  isGlassyMergeTheme,
} from './theme';

// ID này lấy từ manifest key bạn cung cấp, hoặc bạn xem log cũ (mjfeakl...)
// Nếu build xong mở không lên thì check log xem ID thực tế là gì rồi thay vào đây
const EXTENSION_ID = 'effdbpeggelllpfkjppbokhmmiinhlmg';

// Where the settings UI lives inside the extension, if its manifest cannot be read.
// The two engines disagree: the old one emits options_ui/page.html and
// action/default_popup.html, while the new one's build tool names both index.html
// under options/ and action/. Loading the wrong pair fails with ERR_FILE_NOT_FOUND.
const FALLBACK_SETTINGS_PAGES = {
  old: { optionsPage: 'options_ui/page.html', popupPage: 'action/default_popup.html' },
  new: { optionsPage: 'options/index.html', popupPage: 'action/index.html' },
} as const;

function extensionDir(isNewEngine: boolean): string {
  const basePath = app.isPackaged
    ? process.resourcesPath
    : path.join(__dirname, '../../');
  return path.join(basePath, 'extensions', isNewEngine ? 'bl-dev' : 'bl');
}

// Reads the settings page paths out of the extension's own manifest so an upstream
// rename cannot silently break the menu item again. Falls back to the known-good
// pair for the engine when the manifest is missing, unreadable, or does not declare
// the fields.
function resolveSettingsPages(isNewEngine: boolean): {
  optionsPage: string;
  popupPage: string;
} {
  const fallback = FALLBACK_SETTINGS_PAGES[isNewEngine ? 'new' : 'old'];

  try {
    const manifestPath = path.join(extensionDir(isNewEngine), 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      options_ui?: { page?: unknown };
      action?: { default_popup?: unknown };
    };

    const page = manifest.options_ui?.page;
    const popup = manifest.action?.default_popup;

    return {
      optionsPage: typeof page === 'string' && page ? page : fallback.optionsPage,
      popupPage: typeof popup === 'string' && popup ? popup : fallback.popupPage,
    };
  } catch (err) {
    console.error('[BetterLyrics] Could not read manifest for settings page:', err);
    return fallback;
  }
}

export default createPlugin({
  name: () => 'Better Lyrics',
  restartNeeded: false,
  config: {
    enabled: true,
    enableV4Scroll: true,
    // Turbo is the default: same spring motion as 'glassyflow', but baked into
    // WAAPI keyframes so it runs on the compositor instead of writing style
    // every frame. 'glassyflow' stays available as a fallback.
    scrollingMode: 'glassyflow-turbo' as
      | 'glassyflow'
      | 'glassyflow-turbo'
      | 'smooth',
    activeTheme: 'glassy-merge-theme' as string,
    engine: 'new' as 'old' | 'new',
  },
  // THÊM PHẦN NÀY: Tạo menu để mở cài đặt
  menu: async ({ getConfig, setConfig, window, refresh }) => {
    const pluginConfig = await getConfig();
    const currentEngine = pluginConfig.engine || 'new';
    const isNewEngine = currentEngine === 'new';

    const menuItems: MenuItemConstructorOptions[] = [
      {
        label: 'Open Settings',
        click: () => {
          // Create a temp preload script for the settings window
          const preloadCode = `
            const { contextBridge, ipcRenderer } = require('electron');
            contextBridge.exposeInMainWorld('electronBL', {
              getActiveTheme: () => ipcRenderer.invoke('bl-get-active-theme'),
              setActiveTheme: (name) => ipcRenderer.invoke('bl-set-active-theme', name),
              getEngine: () => ipcRenderer.invoke('bl-get-engine'),
              setEngine: (engine) => ipcRenderer.invoke('bl-set-engine', engine),
            });
          `;
          const preloadPath = path.join(
            app.getPath('temp'),
            'bl-settings-preload.js',
          );
          fs.writeFileSync(preloadPath, preloadCode);

          const settingsWin = new BrowserWindow({
            width: 600,
            height: 700,
            autoHideMenuBar: true,
            frame: false,
            transparent: true,
            show: false,
            hasShadow: false,
            backgroundColor: '#00000000',
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
              preload: preloadPath,
            },
          });

          // Force canvas transparency for chrome-extension pages
          settingsWin.setBackgroundColor('#00000000');

          const { optionsPage, popupPage } = resolveSettingsPages(isNewEngine);

          settingsWin
            .loadURL(`chrome-extension://${EXTENSION_ID}/${optionsPage}`)
            .catch((err) => {
              console.error('Cannot open settings page:', err);
              settingsWin.loadURL(
                `chrome-extension://${EXTENSION_ID}/${popupPage}`,
              );
            });

          // Inject frameless window UI after the page loads
          settingsWin.webContents.on('dom-ready', () => {
            settingsWin.webContents
              .executeJavaScript(`
              (function() {
                // --- Inject Styles ---
                const style = document.createElement('style');
                style.textContent = ${JSON.stringify(settingsWindowThemeCss(isNewEngine))};
                document.head.appendChild(style);

                // --- Move original body children into wrapper ---
                const wrapper = document.createElement('div');
                wrapper.id = 'glassy-wrapper';

                const titlebar = document.createElement('div');
                titlebar.id = 'glassy-titlebar';
                titlebar.innerHTML = \`
                  <span id="glassy-titlebar-label">Better Lyrics Settings${
                    isNewEngine
                      ? ' <span style="font-size: 0.7rem; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); padding: 1px 6px; border-radius: 8px; margin-left: 6px; font-weight: 600; vertical-align: middle;">Beta Engine</span>'
                      : ''
                  }</span>
                  <div id="glassy-close-btn">
                    <svg viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </div>
                \`;

                const contentArea = document.createElement('div');
                contentArea.id = 'glassy-content';

                // Move all existing body children into the content area
                while (document.body.firstChild) {
                  contentArea.appendChild(document.body.firstChild);
                }

                ${
                  isNewEngine
                    ? `
                const expBanner = document.createElement('div');
                expBanner.style.cssText = 'background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); color: #93c5fd; padding: 10px 14px; border-radius: 12px; margin: 12px var(--page-pad) 0; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(10px);';
                expBanner.innerHTML = '✨ <span><strong>New Engine (Beta):</strong> You are using the new WAAPI animation engine. This feature is in active development with continuous improvements.</span>';
                contentArea.insertBefore(expBanner, contentArea.firstChild);
                `
                    : ''
                }

                wrapper.appendChild(titlebar);
                wrapper.appendChild(contentArea);

                // Move modals and absolute elements out of the scrollable content area
                // so they don't scroll with the content and position properly
                const fixedSelector = ${JSON.stringify(
                  isNewEngine
                    ? '.ui-modal'
                    : '.modal-overlay, #status-css, #status, #sync-indicator',
                )};
                const fixedElements = contentArea.querySelectorAll(fixedSelector);
                fixedElements.forEach(el => wrapper.appendChild(el));

                document.body.appendChild(wrapper);

                // --- Close button handler ---
                document.getElementById('glassy-close-btn').addEventListener('click', () => {
                  if (wrapper.classList.contains('closing')) return;
                  wrapper.classList.add('closing');
                  setTimeout(() => {
                    document.title = '__GLASSY_CLOSE__';
                  }, 50);
                });

                // --- Tab arrows injector (legacy options page only) ---
                if (!${isNewEngine}) {
                const checkAndInject = setInterval(() => {
                  const tabWrapper = document.querySelector('.tab-scroll-wrapper');
                  if (tabWrapper && !tabWrapper.querySelector('.tab-arrow')) {
                    clearInterval(checkAndInject);
                    const tabContainer = tabWrapper.querySelector('.tab-container');
                    if (tabContainer) {
                      const leftArrow = document.createElement('div');
                      leftArrow.className = 'tab-arrow tab-arrow-left';
                      leftArrow.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>';
                      
                      const rightArrow = document.createElement('div');
                      rightArrow.className = 'tab-arrow tab-arrow-right';
                      rightArrow.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>';
                      
                      tabWrapper.insertBefore(leftArrow, tabContainer);
                      tabWrapper.appendChild(rightArrow);
                      
                      leftArrow.addEventListener('click', () => {
                        tabContainer.scrollBy({ left: -150, behavior: 'smooth' });
                      });
                      rightArrow.addEventListener('click', () => {
                        tabContainer.scrollBy({ left: 150, behavior: 'smooth' });
                      });

                      // Center active tab on click
                      const tabs = tabContainer.querySelectorAll('.tab');
                      tabs.forEach(tab => {
                        tab.addEventListener('click', (e) => {
                          const tabRect = e.target.getBoundingClientRect();
                          const containerRect = tabContainer.getBoundingClientRect();
                          const scrollLeft = tabContainer.scrollLeft + (tabRect.left - containerRect.left) - (containerRect.width / 2) + (tabRect.width / 2);
                          tabContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                        });
                      });
                    }
                  }
                }, 100);
                setTimeout(() => clearInterval(checkAndInject), 5000); // safety timeout
                }
              })();
            `)
              .then(() => {
                settingsWin.show();
              })
              .catch(console.error);
          });

          // Handle close animation at Electron level
          settingsWin.webContents.on('page-title-updated', (event, title) => {
            event.preventDefault();
            if (title !== '__GLASSY_CLOSE__') return;
            if (settingsWin.isDestroyed()) return;

            setTimeout(() => {
              if (settingsWin.isDestroyed()) return;
              let opacity = 1;
              const steps = 18;
              const interval = 280 / steps;
              const fadeTimer = setInterval(() => {
                opacity -= 1 / steps;
                if (opacity <= 0) {
                  clearInterval(fadeTimer);
                  if (!settingsWin.isDestroyed()) {
                    settingsWin.destroy();
                  }
                } else if (!settingsWin.isDestroyed()) {
                  settingsWin.setOpacity(Math.max(0, opacity));
                } else {
                  clearInterval(fadeTimer);
                }
              }, interval);
            }, 120);
          });
        },
      },
      {
        label: 'Change Fonts...',
        click: () => {
          openFontSettingsWindow(window);
        },
      },
      {
        label: 'Engine',
        submenu: [
          {
            label: 'Old engine (Stable)',
            sublabel: 'Legacy CSS/JS engine',
            toolTip:
              'Uses the legacy CSS & JS animation engine. Stable with rich visuals, but performance is heavier with known unfixable limitations. Only receives Glassy Music updates. Supports all three scrolling modes.',
            type: 'radio',
            checked: currentEngine === 'old',
            click: async () => {
              if (currentEngine === 'old') return;
              await setConfig({ engine: 'old' });
              await refresh?.();
              const result = await dialog.showMessageBox(window, {
                type: 'info',
                title: 'Engine Changed',
                message:
                  'Better Lyrics engine has been changed to Old engine. The app needs to restart to apply the change.',
                buttons: ['Restart Now', 'Later'],
                defaultId: 0,
                cancelId: 1,
              });

              if (result.response === 0) {
                restart();
              }
            },
          },
          {
            label: 'New engine (Beta)',
            sublabel: 'New WAAPI engine',
            toolTip:
              'Uses the new WAAPI animation engine. Delivers higher performance, better sync/seek handling, and supports all three scrolling modes. Note: This engine is currently in Beta and under active development.',
            type: 'radio',
            checked: currentEngine === 'new',
            click: async () => {
              if (currentEngine === 'new') return;
              await setConfig({ engine: 'new' });
              await refresh?.();
              const result = await dialog.showMessageBox(window, {
                type: 'info',
                title: 'Engine Changed',
                message:
                  'Better Lyrics engine has been changed to New engine (Beta). The app needs to restart to apply the change.',
                buttons: ['Restart Now', 'Later'],
                defaultId: 0,
                cancelId: 1,
              });

              if (result.response === 0) {
                restart();
              }
            },
          },
        ],
      },
    ];

    const currentScrolling = pluginConfig.scrollingMode || 'glassyflow-turbo';

    // Both engines can pick any of the three modes. 'smooth' means "let the
    // engine do its own scrolling" — the new engine's built-in WAAPI scroll, or
    // BetterLyrics' native CSS scroll on the legacy engine — and injects no
    // scroll script at all.
    menuItems.push({
      label: 'Scrolling',
      submenu: [
        {
          label: 'Smooth Scrolling',
          sublabel: "Engine's built-in scrolling (Lightweight & responsive)",
          toolTip:
            'Leaves line transitions to the lyrics engine itself — no scroll script is injected. The lightest option, and the most responsive.',
          type: 'radio',
          checked: currentScrolling === 'smooth',
          click: async () => {
            if (currentScrolling === 'smooth') return;
            await setConfig({ scrollingMode: 'smooth' });
            await refresh?.();
            const result = await dialog.showMessageBox(window, {
              type: 'info',
              title: 'Scrolling Mode Changed',
              message:
                'Scrolling mode has been changed to Smooth Scrolling. The app needs to restart to apply the change.',
              buttons: ['Restart Now', 'Later'],
              defaultId: 0,
              cancelId: 1,
            });

            if (result.response === 0) {
              restart();
            }
          },
        },
        {
          label: 'GlassyFlow Scrolling',
          sublabel:
            'Signature fluid scrolling (Custom spring physics & motion)',
          toolTip:
            "Injects Glassy Music's custom GlassyFlow engine featuring dynamic spring physics and signature fluid motion curves.",
          type: 'radio',
          checked: currentScrolling === 'glassyflow',
          click: async () => {
            if (currentScrolling === 'glassyflow') return;
            await setConfig({ scrollingMode: 'glassyflow' });
            await refresh?.();
            const result = await dialog.showMessageBox(window, {
              type: 'info',
              title: 'Scrolling Mode Changed',
              message:
                'Scrolling mode has been changed to GlassyFlow Scrolling. The app needs to restart to apply the change.',
              buttons: ['Restart Now', 'Later'],
              defaultId: 0,
              cancelId: 1,
            });

            if (result.response === 0) {
              restart();
            }
          },
        },
        {
          label: 'GlassyFlow Turbo',
          sublabel: 'Same spring motion, GPU-composited (No main-thread cost)',
          toolTip:
            'The same GlassyFlow spring physics, solved ahead of time and handed to the compositor instead of being stepped every frame. Identical motion, but the main thread stays free — far smoother on heavy pages and high-refresh displays.',
          type: 'radio',
          checked: currentScrolling === 'glassyflow-turbo',
          click: async () => {
            if (currentScrolling === 'glassyflow-turbo') return;
            await setConfig({ scrollingMode: 'glassyflow-turbo' });
            await refresh?.();
            const result = await dialog.showMessageBox(window, {
              type: 'info',
              title: 'Scrolling Mode Changed',
              message:
                'Scrolling mode has been changed to GlassyFlow Turbo. The app needs to restart to apply the change.',
              buttons: ['Restart Now', 'Later'],
              defaultId: 0,
              cancelId: 1,
            });

            if (result.response === 0) {
              restart();
            }
          },
        },
      ],
    });

    return menuItems;
  },
  backend: {
    async start({ getConfig, setConfig, window }) {
      const pluginConfig = await getConfig();
      const isNewEngine = pluginConfig.engine !== 'old';
      const extensionPath = extensionDir(isNewEngine);
      const isGlassyTheme = isGlassyMergeTheme(pluginConfig.activeTheme);

      console.log(
        '[BetterLyrics] Engine:',
        isNewEngine ? 'New engine (Beta) [bl-dev]' : 'Old engine [bl]',
      );
      console.log(
        '[BetterLyrics] Active theme:',
        pluginConfig.activeTheme || 'glassy-merge-theme (default)',
      );

      // --- Manage album-color-theme-modded and better-lyrics-shaders based on active theme ---
      if (isGlassyTheme) {
        config.plugins.setOptions(
          'album-color-theme-modded',
          { enabled: true },
          [],
        );
        config.plugins.setOptions(
          'better-lyrics-shaders',
          { enabled: true },
          [],
        );
        console.log(
          '[BetterLyrics] Glassy theme active → album-color-theme-modded and better-lyrics-shaders enabled',
        );
      } else {
        config.plugins.setOptions(
          'album-color-theme-modded',
          { enabled: false },
          [],
        );
        console.log(
          '[BetterLyrics] Non-Glassy theme active → album-color-theme-modded disabled',
        );
      }

      console.log('Loading Better Lyrics from:', extensionPath);

      session.defaultSession
        .loadExtension(extensionPath)
        .then((ext) => {
          console.log('Better Lyrics loaded! ID:', ext.id);
        })
        .catch((err) => {
          console.error('Failed to load Better Lyrics:', err);
        });

      // (The merge theme and glassyflow scripts have been moved to the preload script for instant execution without IPC delay)

      // --- Fix 2: Block BL custom styles in Glassy mode (old engine only; new engine uses #blyrics-custom-style for @braccato/core theme settings) ---
      if (isGlassyTheme && !isNewEngine) {
        const blockBLStylesScript = `
          (function() {
            // Remove any existing BL custom style tag
            var existing = document.getElementById('blyrics-custom-style');
            if (existing) {
              existing.remove();
              console.log('[BL-GlassyBlock] Removed existing blyrics-custom-style');
            }

            // Watch for new BL custom style tags and remove them
            var observer = new MutationObserver(function(mutations) {
              for (var i = 0; i < mutations.length; i++) {
                var addedNodes = mutations[i].addedNodes;
                for (var j = 0; j < addedNodes.length; j++) {
                  var node = addedNodes[j];
                  if (node.id === 'blyrics-custom-style') {
                    node.remove();
                    console.log('[BL-GlassyBlock] Blocked blyrics-custom-style injection');
                  }
                }
              }
            });

            observer.observe(document.head, { childList: true });
            console.log('[BL-GlassyBlock] MutationObserver active, blocking BL custom styles');
          })();
        `;

        window.webContents.on('dom-ready', () => {
          window.webContents
            .executeJavaScript(blockBLStylesScript)
            .catch((err: Error) => {
              console.error(
                '[BetterLyrics] Failed to inject Glassy style blocker:',
                err,
              );
            });
        });
        console.log('[BetterLyrics] Queued Glassy style blocker');
      }

      // --- IPC handler for theme changes from BL settings UI ---
      ipcMain.removeHandler('bl-set-active-theme');
      ipcMain.handle(
        'bl-set-active-theme',
        async (_event, themeName: string) => {
          const currentTheme =
            (await getConfig()).activeTheme || 'glassy-merge-theme';
          if (currentTheme === themeName) return { changed: false };

          await setConfig({ activeTheme: themeName });
          console.log(
            `[BetterLyrics] Theme changed: ${currentTheme} → ${themeName}`,
          );

          // Show restart dialog
          const result = await dialog.showMessageBox(window, {
            type: 'info',
            title: 'Theme Changed',
            message:
              'Theme has been changed. The app needs to restart to apply the new theme.',
            buttons: ['Restart Now', 'Later'],
            defaultId: 0,
            cancelId: 1,
          });

          if (result.response === 0) {
            restart();
          }

          return { changed: true, theme: themeName };
        },
      );

      // --- IPC handler to get current theme ---
      ipcMain.removeHandler('bl-get-active-theme');
      ipcMain.handle('bl-get-active-theme', async () => {
        const cfg = await getConfig();
        return cfg.activeTheme || 'glassy-merge-theme';
      });

      // --- IPC handler for engine changes ---
      ipcMain.removeHandler('bl-set-engine');
      ipcMain.handle('bl-set-engine', async (_event, engine: 'old' | 'new') => {
        const currentEngine = (await getConfig()).engine || 'new';
        if (currentEngine === engine) return { changed: false };

        await setConfig({ engine });
        console.log(
          `[BetterLyrics] Engine changed: ${currentEngine} → ${engine}`,
        );

        const result = await dialog.showMessageBox(window, {
          type: 'info',
          title: 'Engine Changed',
          message: `Better Lyrics engine has been changed to ${engine === 'new' ? 'New engine (Beta)' : 'Old engine'}. The app needs to restart to apply the change.`,
          buttons: ['Restart Now', 'Later'],
          defaultId: 0,
          cancelId: 1,
        });

        if (result.response === 0) {
          restart();
        }

        return { changed: true, engine };
      });

      // --- IPC handler to get current engine ---
      ipcMain.removeHandler('bl-get-engine');
      ipcMain.handle('bl-get-engine', async () => {
        const cfg = await getConfig();
        return cfg.engine || 'new';
      });
    },
  },
  preload: {
    async start({ getConfig }) {
      const pluginConfig = await getConfig();
      const isGlassyTheme = isGlassyMergeTheme(pluginConfig.activeTheme);

      // The shaders content script reads these to pin itself to default settings.
      // Published on two channels because they fail in different ways: the DOM is
      // shared by every world on the page but is not yet built this early, while
      // localStorage is available immediately. Either one is enough.
      // Both branches run so a flag left behind by a previous session on the
      // glassy theme is cleared when the user switches away from it.
      const publishThemeLock = () => {
        try {
          if (isGlassyTheme) {
            localStorage.setItem(GLASSY_THEME_LOCK_KEY, '1');
          } else {
            localStorage.removeItem(GLASSY_THEME_LOCK_KEY);
          }
        } catch (err) {
          console.error(
            '[BetterLyrics Preload] Could not publish the theme lock flag:',
            err,
          );
        }

        const root = document.documentElement;
        if (!root) return;
        if (isGlassyTheme) {
          root.setAttribute(GLASSY_THEME_LOCK_ATTRIBUTE, '1');
        } else {
          root.removeAttribute(GLASSY_THEME_LOCK_ATTRIBUTE);
        }
      };

      publishThemeLock();
      // YouTube Music replaces the document element during its own boot, which
      // would drop the attribute set above.
      window.addEventListener('DOMContentLoaded', publishThemeLock);

      const isNewEngine = pluginConfig.engine !== 'old';
      const engineFolder = isNewEngine ? 'bl-dev' : 'bl';

      let basePath = path.join(__dirname, '../../');
      if (!fs.existsSync(path.join(basePath, 'extensions', engineFolder))) {
        basePath = process.resourcesPath;
      }

      const blExtRoot = path.join(basePath, 'extensions', engineFolder);
      const scriptsToInject: string[] = [];

      // 1. Eagerly read theme files only if Glassy Merge Theme is active
      if (isGlassyTheme) {
        const mergeThemeFiles = ['mergetheme.js', 'fix.js'];
        for (const fileName of mergeThemeFiles) {
          try {
            const jsPath = path.join(blExtRoot, fileName);
            if (fs.existsSync(jsPath)) {
              scriptsToInject.push(fs.readFileSync(jsPath, 'utf8'));
            }
          } catch (err) {
            console.error(
              `[BetterLyrics Preload] Failed to read ${fileName}:`,
              err,
            );
          }
        }
      }

      // 2. Which scroll script to inject, for EITHER engine and ANY theme. 'smooth'
      // means the engine handles its own scrolling, so nothing is injected.
      const scrollScripts: Record<string, string | null> = {
        'glassyflow': 'glassyflow.js',
        'glassyflow-turbo': 'glassyflow-turbo.js',
        'smooth': null,
      };
      const scrollMode = pluginConfig.scrollingMode ?? 'glassyflow-turbo';
      // An unknown value (config written by a newer build, then downgraded)
      // falls back to the original rAF engine rather than silently disabling
      // scrolling altogether — for a corrupt/unrecognised value, the
      // longest-serving path is the safer landing spot even though Turbo is
      // now the default.
      const scrollScript =
        scrollMode in scrollScripts
          ? scrollScripts[scrollMode]
          : 'glassyflow.js';

      if (pluginConfig.enableV4Scroll !== false && scrollScript) {
        try {
          const jsPath = path.join(blExtRoot, scrollScript);
          if (fs.existsSync(jsPath)) {
            scriptsToInject.push(fs.readFileSync(jsPath, 'utf8'));
          }
        } catch (err) {
          console.error(
            `[BetterLyrics Preload] Failed to read ${scrollScript}:`,
            err,
          );
        }
      }

      // 3. Inject natively via webFrame instantly upon DOMContentLoaded
      if (scriptsToInject.length > 0) {
        window.addEventListener('DOMContentLoaded', async () => {
          for (const scriptCode of scriptsToInject) {
            try {
              await webFrame.executeJavaScript(scriptCode);
            } catch (err) {
              console.error(
                '[BetterLyrics Preload] Failed to execute injected script via webFrame:',
                err,
              );
            }
          }
          console.log(
            '[BetterLyrics Preload] Successfully injected scripts securely via webFrame.',
          );
        });
      }
    },
  },
  renderer: {
    observer: null as MutationObserver | null,
    onPlayerApiReady() {
      const setupButton = () => {
        const topRow = document.querySelector(
          '.top-row-buttons.ytmusic-player',
        );
        if (!topRow) return;

        if (topRow.querySelector('.fullscreen-lyrics-button')) return;

        const btn = document.createElement('yt-icon-button');
        btn.className = 'fullscreen-lyrics-button style-scope ytmusic-player';
        btn.setAttribute('title', 'Fullscreen lyrics without fullscreen');
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('aria-label', 'Fullscreen lyrics without fullscreen');

        btn.innerHTML = `
          <button id="button" class="style-scope yt-icon-button" aria-label="Fullscreen lyrics without fullscreen" style="color: inherit; background: transparent; border: none; padding: 0; cursor: pointer;">
            <span class="yt-icon-shape style-scope yt-icon yt-spec-icon-shape" style="width: 24px; height: 24px; display: block; fill: currentColor; color: inherit;">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: block; width: 100%; height: 100%; fill: currentColor;">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 8h6v2H7V8zm0 4h4v2H7v-2zm0 4h7v2H7v-2zm9-9v4.55c-.39-.24-.85-.38-1.34-.38-1.47 0-2.66 1.19-2.66 2.66s1.19 2.66 2.66 2.66 2.66-1.19 2.66-2.66V9h2V7h-3z"></path>
              </svg>
            </span>
          </button>
          <yt-interaction id="interaction" class="circular style-scope yt-icon-button">
            <div class="stroke style-scope yt-interaction"></div>
            <div class="fill style-scope yt-interaction"></div>
          </yt-interaction>
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const originalFullscreenElement = Object.getOwnPropertyDescriptor(
            Document.prototype,
            'fullscreenElement',
          );
          const originalRequestFullscreen = Element.prototype.requestFullscreen;

          Object.defineProperty(document, 'fullscreenElement', {
            get: () => document.documentElement,
            configurable: true,
          });

          Element.prototype.requestFullscreen = function () {
            document.dispatchEvent(new Event('fullscreenchange'));
            return Promise.resolve();
          };

          const restore = () => {
            if (originalFullscreenElement) {
              Object.defineProperty(
                document,
                'fullscreenElement',
                originalFullscreenElement,
              );
            } else {
              delete (document as any).fullscreenElement;
            }
            Element.prototype.requestFullscreen = originalRequestFullscreen;
          };

          const clickFullscreen = () => {
            const fsBtn = document.querySelector<HTMLElement>(
              'yt-icon-button.fullscreen-button.ytmusic-player',
            );
            if (fsBtn) {
              fsBtn.click();
              window.dispatchEvent(new Event('resize'));
              setTimeout(restore, 500);
            } else {
              restore();
            }
          };

          const fsBtn = document.querySelector<HTMLElement>(
            'yt-icon-button.fullscreen-button.ytmusic-player',
          );
          if (fsBtn) {
            clickFullscreen();
          } else {
            const playerBar =
              document.querySelector<HTMLElement>('ytmusic-player-bar');
            if (playerBar) {
              playerBar.click();
              setTimeout(clickFullscreen, 500);
            } else {
              restore();
            }
          }
        });

        const fsBtn = topRow.querySelector('.fullscreen-button');
        if (fsBtn) {
          topRow.insertBefore(btn, fsBtn);
        } else {
          topRow.appendChild(btn);
        }
      };

      setupButton();

      this.observer = new MutationObserver(() => {
        setupButton();
      });

      const target =
        document.querySelector('.top-row-buttons.ytmusic-player') ||
        document.body;
      this.observer.observe(target, { childList: true, subtree: true });
    },
    stop() {
      this.observer?.disconnect();
      document.querySelector('.fullscreen-lyrics-button')?.remove();
    },
  },
});
