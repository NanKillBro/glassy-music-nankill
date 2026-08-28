import prompt from 'custom-electron-prompt';
import {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  Menu,
  type MenuItem,
  shell,
} from 'electron';
import is from 'electron-is';
import { satisfies } from 'semver';
import { languageResources } from 'virtual:i18n';
import { allPlugins } from 'virtual:plugins';

import { APPLICATION_NAME, setLanguage, t } from '@/i18n';

import * as config from './config';
import { getAllMenuTemplate, loadAllMenuPlugins } from './loader/menu';
import { restart } from './providers/app-controls';
import { startingPages } from './providers/extracted-data';
import promptOptions from './providers/prompt-options';

import packageJson from '../package.json';
import aboutHtmlRaw from './about.html?raw';

export type MenuTemplate = Electron.MenuItemConstructorOptions[];

// True only if in-app-menu was loaded on launch
const inAppMenuActive = await config.plugins.isEnabled('in-app-menu');

const pluginEnabledMenu = async (
  plugin: string,
  label = '',
  description?: string ,
  isNew = false,
  hasSubmenu = false,
  refreshMenu: (() => void) | undefined = undefined,
): Promise<Electron.MenuItemConstructorOptions> => {
  const betterLyricsConfig = config.plugins.getOptions<{ activeTheme?: string }>('better-lyrics');
  const isGlassyTheme = betterLyricsConfig?.activeTheme === 'glassy-merge-theme' || !betterLyricsConfig?.activeTheme;

  const lockedPlugins = ['better-lyrics'];
  if (isGlassyTheme) {
    lockedPlugins.push('album-color-theme-modded', 'better-lyrics-shaders');
  }

  // 1. Kiểm tra xem plugin này có nằm trong danh sách bị khóa không
  const isLocked = lockedPlugins.includes(plugin);

  // 2. Logic "Hardcore": Nếu bị khóa, ép config luôn bật ngay lập tức
  // (Đề phòng trường hợp file config.json cũ đang lưu là false)
  if (isLocked) {
    config.plugins.enable(plugin);
  }

  return {
    label: label || plugin,
    sublabel: isNew ? t('main.menu.plugins.new') : undefined,
    toolTip: description,
    type: 'checkbox',
    visible: (!isGlassyTheme && plugin === 'album-color-theme-modded') ? false : true,

    // 3. Hiển thị dấu tích: Nếu Locked thì luôn True, ngược lại thì lấy theo config
    checked: isLocked ? true : await config.plugins.isEnabled(plugin),

    // 4. Khóa thao tác: Nếu Locked thì Disable (xám mờ đi) để không click được
    enabled: !isLocked,

    click(item: Electron.MenuItem) {
      // Safety check: Nếu bị khóa thì không làm gì cả (dù UI đã chặn rồi)
      if (isLocked) return;

      if (item.checked) {
        config.plugins.enable(plugin);
      } else {
        config.plugins.disable(plugin);
      }

      if (hasSubmenu) {
        refreshMenu?.();
      }
    },
  };
};

export const refreshMenu = async (win: BrowserWindow) => {
  await setApplicationMenu(win);
  if (inAppMenuActive) {
    win.webContents.send('refresh-in-app-menu');
  }
};

// ... existing imports

// Biến lưu giữ cửa sổ About để kiểm tra xem nó đã mở chưa
let aboutWindow: BrowserWindow | null = null;

// Hàm mở cửa sổ About Custom
const openAboutWindow = (parentWin: BrowserWindow) => {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    parent: parentWin,
    // modal removed — prevents parent window flash on close
    width: 600,
    height: 700,
    resizable: false,
    title: "About Glassy Music",
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  aboutWindow.once('ready-to-show', () => {
    aboutWindow?.show();
  });

  // Nội dung HTML/CSS nạp từ file riêng
  const htmlContent = aboutHtmlRaw.replace('${packageJson.version}', packageJson.version);

  // Load chuỗi HTML dưới dạng Data URI
  aboutWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  // Handle close animation at the Electron level (compositor, not renderer)
  aboutWindow.webContents.on('page-title-updated', (event, title) => {
    event.preventDefault();
    if (title !== '__GLASSY_CLOSE__') return;
    if (!aboutWindow || aboutWindow.isDestroyed()) return;

    // Delay opacity fade by 120ms so CSS scale/blur is visible first
    setTimeout(() => {
      if (!aboutWindow || aboutWindow.isDestroyed()) return;
      let opacity = 1;
      const steps = 18;
      const interval = 280 / steps; // faster fade since we delayed
      const fadeTimer = setInterval(() => {
        opacity -= 1 / steps;
        if (opacity <= 0) {
          clearInterval(fadeTimer);
          if (aboutWindow && !aboutWindow.isDestroyed()) {
            aboutWindow.destroy();
            aboutWindow = null;
          }
        } else if (aboutWindow && !aboutWindow.isDestroyed()) {
          aboutWindow.setOpacity(Math.max(0, opacity));
        } else {
          clearInterval(fadeTimer);
        }
      }, interval);
    }, 120);
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
};



export const mainMenuTemplate = async (
  win: BrowserWindow,
): Promise<MenuTemplate> => {
  const innerRefreshMenu = () => refreshMenu(win);
  const { navigationHistory } = win.webContents;
  await loadAllMenuPlugins(win);

  const allPluginsStubs = await allPlugins();

  const menuResult = await Promise.all(
    Object.entries(getAllMenuTemplate()).map(async ([id, template]) => {
      const plugin = allPluginsStubs[id];
      const pluginLabel = plugin?.name?.() ?? id;
      const pluginDescription = plugin?.description?.() ?? undefined;
      const isNew = plugin?.addedVersion
        ? satisfies(packageJson.version, plugin.addedVersion)
        : false;

      if (!(await config.plugins.isEnabled(id))) {
        return [
          id,
          await pluginEnabledMenu(
            id,
            pluginLabel,
            pluginDescription,
            isNew,
            true,
            innerRefreshMenu,
          ),
        ] as const;
      }

      return [
        id,
        {
          label: pluginLabel,
          sublabel: isNew ? t('main.menu.plugins.new') : undefined,
          toolTip: pluginDescription,
          submenu: [
            await pluginEnabledMenu(
              id,
              t('main.menu.plugins.enabled'),
              undefined,
              false,
              true,
              innerRefreshMenu,
            ),
            { type: 'separator' },
            ...template,
          ],
        } satisfies Electron.MenuItemConstructorOptions,
      ] as const;
    }),
  );

  const availablePlugins = Object.keys(await allPlugins());
  const pluginMenus = await Promise.all(
    availablePlugins
      .sort((a, b) => {
        const aPluginLabel = allPluginsStubs[a]?.name?.() ?? a;
        const bPluginLabel = allPluginsStubs[b]?.name?.() ?? b;

        return aPluginLabel.localeCompare(bPluginLabel);
      })
      .map(async (id) => {
        const predefinedTemplate = menuResult.find((it) => it[0] === id);
        if (predefinedTemplate) return predefinedTemplate[1];

        const plugin = allPluginsStubs[id];
        const pluginLabel = plugin?.name?.() ?? id;
        const pluginDescription = plugin?.description?.() ?? undefined;
        const isNew = plugin?.addedVersion
          ? satisfies(packageJson.version, plugin.addedVersion)
          : false;

        return pluginEnabledMenu(
          id,
          pluginLabel,
          pluginDescription,
          isNew,
          true,
          innerRefreshMenu,
        );
      }),
  );

  const langResources = await languageResources();
  const availableLanguages = Object.keys(langResources);

  return [
    {
      label: t('main.menu.plugins.label'),
      submenu: pluginMenus,
    },
    {
      label: t('main.menu.options.label'),
      submenu: [
        {
          label: t('main.menu.options.submenu.resume-on-start'),
          type: 'checkbox',
          checked: config.get('options.resumeOnStart'),
          click(item: MenuItem) {
            config.setMenuOption('options.resumeOnStart', item.checked);
          },
        },
        {
          label: t('main.menu.options.submenu.starting-page.label'),
          submenu: (() => {
            const subMenuArray: Electron.MenuItemConstructorOptions[] =
              Object.keys(startingPages).map((name) => ({
                label: name,
                type: 'radio',
                checked: config.get('options.startingPage') === name,
                click() {
                  config.set('options.startingPage', name);
                },
              }));
            subMenuArray.unshift({
              label: t('main.menu.options.submenu.starting-page.unset'),
              type: 'radio',
              checked: config.get('options.startingPage') === '',
              click() {
                config.set('options.startingPage', '');
              },
            });
            return subMenuArray;
          })(),
        },
        {
          label: t('main.menu.options.submenu.visual-tweaks.label'),
          submenu: [
            {
              label: t(
                'main.menu.options.submenu.visual-tweaks.submenu.remove-upgrade-button',
              ),
              type: 'checkbox',
              checked: config.get('options.removeUpgradeButton'),
              click(item: MenuItem) {
                config.setMenuOption(
                  'options.removeUpgradeButton',
                  item.checked,
                );
              },
            },
            {
              label: t(
                'main.menu.options.submenu.visual-tweaks.submenu.custom-window-title.label',
              ),
              async click() {
                const output = await prompt(
                  {
                    title: t(
                      'main.menu.options.submenu.visual-tweaks.submenu.custom-window-title.label',
                    ),
                    label: t(
                      'main.menu.options.submenu.visual-tweaks.submenu.custom-window-title.prompt.label',
                    ),
                    value: config.get('options.customWindowTitle') || '',
                    type: 'input',
                    inputAttrs: {
                      type: 'text',
                      placeholder: t(
                        'main.menu.options.submenu.visual-tweaks.submenu.custom-window-title.prompt.placeholder',
                        {
                          applicationName: APPLICATION_NAME,
                        },
                      ),
                    },
                    width: 500,
                    ...promptOptions(),
                  },
                  win,
                );
                if (typeof output === 'string') {
                  config.setMenuOption('options.customWindowTitle', output);
                }
              },
            },
            {
              label: t(
                'main.menu.options.submenu.visual-tweaks.submenu.like-buttons.label',
              ),
              submenu: [
                {
                  label: t(
                    'main.menu.options.submenu.visual-tweaks.submenu.like-buttons.default',
                  ),
                  type: 'radio',
                  checked: !config.get('options.likeButtons'),
                  click() {
                    config.set('options.likeButtons', '');
                  },
                },
                {
                  label: t(
                    'main.menu.options.submenu.visual-tweaks.submenu.like-buttons.force-show',
                  ),
                  type: 'radio',
                  checked: config.get('options.likeButtons') === 'force',
                  click() {
                    config.set('options.likeButtons', 'force');
                  },
                },
                {
                  label: t(
                    'main.menu.options.submenu.visual-tweaks.submenu.like-buttons.hide',
                  ),
                  type: 'radio',
                  checked: config.get('options.likeButtons') === 'hide',
                  click() {
                    config.set('options.likeButtons', 'hide');
                  },
                },
                {
                  label: t(
                    'main.menu.options.submenu.visual-tweaks.submenu.like-buttons.swap',
                  ),
                  type: 'checkbox',
                  checked: config.get('options.swapLikeButtonsOrder'),
                  click(item: MenuItem) {
                    config.setMenuOption(
                      'options.swapLikeButtonsOrder',
                      item.checked,
                    );
                  },
                },
              ],
            },
          ],
        },
        {
          label: t('main.menu.options.submenu.single-instance-lock'),
          type: 'checkbox',
          checked: true,
          click(item: MenuItem) {
            if (!item.checked && app.hasSingleInstanceLock()) {
              app.releaseSingleInstanceLock();
            } else if (item.checked && !app.hasSingleInstanceLock()) {
              app.requestSingleInstanceLock();
            }
          },
        },
        {
          label: t('main.menu.options.submenu.always-on-top'),
          type: 'checkbox',
          checked: config.get('options.alwaysOnTop'),
          click(item: MenuItem) {
            config.setMenuOption('options.alwaysOnTop', item.checked);
            win.setAlwaysOnTop(item.checked);
          },
        },
        ...((is.windows() || is.linux()
          ? [
            {
              label: t('main.menu.options.submenu.hide-menu.label'),
              type: 'checkbox',
              checked: config.get('options.hideMenu'),
              click(item) {
                config.setMenuOption('options.hideMenu', item.checked);
                if (item.checked && !config.get('options.hideMenuWarned')) {
                  dialog.showMessageBox(win, {
                    type: 'info',
                    title: t(
                      'main.menu.options.submenu.hide-menu.dialog.title',
                    ),
                    message: t(
                      'main.menu.options.submenu.hide-menu.dialog.message',
                    ),
                  });
                }
              },
            },
          ]
          : []) satisfies Electron.MenuItemConstructorOptions[]),
        ...((is.windows() || is.macOS()
          ? // Only works on Win/Mac
          // https://www.electronjs.org/docs/api/app#appsetloginitemsettingssettings-macos-windows
          [
            {
              label: t('main.menu.options.submenu.start-at-login'),
              type: 'checkbox',
              checked: config.get('options.startAtLogin'),
              click(item) {
                config.setMenuOption('options.startAtLogin', item.checked);
              },
            },
          ]
          : []) satisfies Electron.MenuItemConstructorOptions[]),
        {
          label: t('main.menu.options.submenu.tray.label'),
          submenu: [
            {
              label: t('main.menu.options.submenu.tray.submenu.disabled'),
              type: 'radio',
              checked: !config.get('options.tray'),
              click() {
                config.setMenuOption('options.tray', false);
                config.setMenuOption('options.appVisible', true);
              },
            },
            {
              label: t(
                'main.menu.options.submenu.tray.submenu.enabled-and-show-app',
              ),
              type: 'radio',
              checked:
                config.get('options.tray') && config.get('options.appVisible'),
              click() {
                config.setMenuOption('options.tray', true);
                config.setMenuOption('options.appVisible', true);
              },
            },
            {
              label: t(
                'main.menu.options.submenu.tray.submenu.enabled-and-hide-app',
              ),
              type: 'radio',
              checked:
                config.get('options.tray') && !config.get('options.appVisible'),
              click() {
                config.setMenuOption('options.tray', true);
                config.setMenuOption('options.appVisible', false);
              },
            },
            { type: 'separator' },
            {
              label: t(
                'main.menu.options.submenu.tray.submenu.play-pause-on-click',
              ),
              type: 'checkbox',
              checked: config.get('options.trayClickPlayPause'),
              click(item: MenuItem) {
                config.setMenuOption(
                  'options.trayClickPlayPause',
                  item.checked,
                );
              },
            },
          ],
        },
        {
          label: t('main.menu.options.submenu.language.label') + ' (Language)',
          submenu: [
            {
              label: t(
                'main.menu.options.submenu.language.submenu.to-help-translate',
              ),
              type: 'normal',
              click() {
                const url = 'https://bit.ly/48n5YF7';
                shell.openExternal(url);
              },
            } as Electron.MenuItemConstructorOptions,
          ].concat(
            availableLanguages
              .map(
                (lang): Electron.MenuItemConstructorOptions => ({
                  label: `${langResources[lang].translation.language?.name ?? 'Unknown'} (${langResources[lang].translation.language?.['local-name'] ?? 'Unknown'})`,
                  type: 'checkbox',
                  checked: (config.get('options.language') ?? 'en') === lang,
                  click() {
                    config.setMenuOption('options.language', lang);
                    refreshMenu(win);
                    setLanguage(lang);
                    dialog.showMessageBox(win, {
                      title: t(
                        'main.menu.options.submenu.language.dialog.title',
                      ),
                      message: t(
                        'main.menu.options.submenu.language.dialog.message',
                      ),
                    });
                  },
                }),
              )
              .sort((a, b) => a.label!.localeCompare(b.label!)),
          ),
        },
        { type: 'separator' },
        {
          label: t('main.menu.options.submenu.advanced-options.label'),
          submenu: [
            {
              label: t(
                'main.menu.options.submenu.advanced-options.submenu.set-proxy.label',
              ),
              type: 'normal',
              async click(item: MenuItem) {
                await setProxy(item, win);
              },
            },
            {
              label: t(
                'main.menu.options.submenu.advanced-options.submenu.override-user-agent',
              ),
              type: 'checkbox',
              checked: config.get('options.overrideUserAgent'),
              click(item: MenuItem) {
                config.setMenuOption('options.overrideUserAgent', item.checked);
              },
            },
            {
              label: t(
                'main.menu.options.submenu.advanced-options.submenu.disable-hardware-acceleration',
              ),
              type: 'checkbox',
              checked: config.get('options.disableHardwareAcceleration'),
              click(item: MenuItem) {
                config.setMenuOption(
                  'options.disableHardwareAcceleration',
                  item.checked,
                );
              },
            },
            {
              label: 'Disable Minimum Window Size',
              type: 'checkbox',
              checked: config.get('options.disableMinSize'),
              click(item: MenuItem) {
                if (item.checked) {
                  dialog.showMessageBox(win, {
                    type: 'warning',
                    title: 'Disable Minimum Window Size',
                    message: 'Disabling this can make the app freely adjust window size, but making the window size too small can cause layout breaking and may require restarting the app to fix the issue. Only turn this off if you know what you are doing.',
                    buttons: ['Cancel', 'Turn Off'],
                    defaultId: 0,
                    cancelId: 0,
                  }).then(({ response }) => {
                    if (response === 1) {
                      config.setMenuOption('options.disableMinSize', true);
                      dialog.showMessageBox(win, {
                        type: 'info',
                        title: 'Restart Required',
                        message: 'A restart is required for this setting to apply.',
                      });
                    } else {
                      item.checked = false;
                    }
                  });
                } else {
                  config.setMenuOption('options.disableMinSize', false);
                  dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Restart Required',
                    message: 'A restart is required for this setting to apply.',
                  });
                }
              },
            },
            {
              label: t(
                'main.menu.options.submenu.advanced-options.submenu.restart-on-config-changes',
              ),
              type: 'checkbox',
              checked: config.get('options.restartOnConfigChanges'),
              click(item: MenuItem) {
                config.setMenuOption(
                  'options.restartOnConfigChanges',
                  item.checked,
                );
              },
            },
            {
              label: t(
                'main.menu.options.submenu.advanced-options.submenu.auto-reset-app-cache',
              ),
              type: 'checkbox',
              checked: config.get('options.autoResetAppCache'),
              click(item: MenuItem) {
                config.setMenuOption('options.autoResetAppCache', item.checked);
              },
            },
            { type: 'separator' },
            is.macOS()
              ? {
                label: t(
                  'main.menu.options.submenu.advanced-options.submenu.toggle-dev-tools',
                ),
                // Cannot use "toggleDevTools" role in macOS
                click() {
                  const { webContents } = win;
                  if (webContents.isDevToolsOpened()) {
                    webContents.closeDevTools();
                  } else {
                    webContents.openDevTools();
                  }
                },
              }
              : {
                label: t(
                  'main.menu.options.submenu.advanced-options.submenu.toggle-dev-tools',
                ),
                role: 'toggleDevTools',
              },
            {
              label: t(
                'main.menu.options.submenu.advanced-options.submenu.edit-config-json',
              ),
              click() {
                config.edit();
              },
            },
          ],
        },
      ],
    },
    {
      label: t('main.menu.view.label'),
      submenu: [
        {
          label: t('main.menu.view.submenu.reload'),
          role: 'reload',
        },
        {
          label: t('main.menu.view.submenu.force-reload'),
          role: 'forceReload',
        },
        { type: 'separator' },
        {
          label: t('main.menu.view.submenu.zoom-in'),
          role: 'zoomIn',
          accelerator: 'CmdOrCtrl+=',
          visible: false,
        },
        {
          label: t('main.menu.view.submenu.zoom-in'),
          role: 'zoomIn',
          accelerator: 'CmdOrCtrl+Plus',
        },
        {
          label: t('main.menu.view.submenu.zoom-out'),
          role: 'zoomOut',
          accelerator: 'CmdOrCtrl+-',
        },
        {
          label: t('main.menu.view.submenu.zoom-out'),
          role: 'zoomOut',
          accelerator: 'CmdOrCtrl+Shift+-',
          visible: false,
        },
        {
          label: t('main.menu.view.submenu.reset-zoom'),
          role: 'resetZoom',
        },
        { type: 'separator' },
        {
          label: t('main.menu.view.submenu.toggle-fullscreen'),
          role: 'togglefullscreen',
        },
        {
          label: 'Fullscreen lyrics without fullscreen',
          click() {
            const script = `
              (function() {
                // --- Mock the Fullscreen API so YTM updates its UI without OS fullscreen ---
                const originalFullscreenElement = Object.getOwnPropertyDescriptor(Document.prototype, 'fullscreenElement');
                const originalRequestFullscreen = Element.prototype.requestFullscreen;

                Object.defineProperty(document, 'fullscreenElement', {
                  get: () => document.documentElement,
                  configurable: true,
                });

                Element.prototype.requestFullscreen = function() {
                  document.dispatchEvent(new Event('fullscreenchange'));
                  return Promise.resolve();
                };

                // --- Restore originals after a short delay ---
                const restore = () => {
                  if (originalFullscreenElement) {
                    Object.defineProperty(document, 'fullscreenElement', originalFullscreenElement);
                  } else {
                    delete document.fullscreenElement;
                  }
                  Element.prototype.requestFullscreen = originalRequestFullscreen;
                };

                const clickFullscreen = () => {
                  const btn = document.querySelector('yt-icon-button.fullscreen-button.ytmusic-player');
                  if (btn) {
                    btn.click();
                    // Trigger resize event immediately to help Better Lyrics recalculate
                    window.dispatchEvent(new Event('resize'));
                    setTimeout(restore, 500);
                  } else {
                    restore();
                  }
                };

                // --- Try clicking the fullscreen button; open the player page first if needed ---
                const fsBtn = document.querySelector('yt-icon-button.fullscreen-button.ytmusic-player');
                if (fsBtn) {
                  clickFullscreen();
                } else {
                  const playerBar = document.querySelector('ytmusic-player-bar');
                  if (playerBar) {
                    playerBar.click();
                    setTimeout(clickFullscreen, 500);
                  } else {
                    restore();
                  }
                }
              })();
            `;
            win.webContents.executeJavaScript(script, true);
          },
        },
        { type: 'separator' },
        {
          label: 'Resync Lyrics',
          click() {
            win.webContents.executeJavaScript(`window.dispatchEvent(new Event('resize'));`, true);
          }
        },

      ],
    },
    {
      label: t('main.menu.navigation.label'),
      submenu: [
        {
          label: t('main.menu.navigation.submenu.go-back'),
          click() {
            if (navigationHistory.canGoBack()) {
              navigationHistory.goBack();
            }
          },
        },
        {
          label: t('main.menu.navigation.submenu.go-forward'),
          click() {
            if (navigationHistory.canGoForward()) {
              navigationHistory.goForward();
            }
          },
        },
        {
          label: t('main.menu.navigation.submenu.copy-current-url'),
          click() {
            const currentURL = win.webContents.getURL();
            clipboard.writeText(currentURL);
          },
        },
        {
          label: t('main.menu.navigation.submenu.restart'),
          click: restart,
        },
        {
          label: t('main.menu.navigation.submenu.quit'),
          role: 'quit',
        },
      ],
    },
    {
      label: t('main.menu.about'),
      submenu: [
        {
          label: t('main.menu.about'), // Hoặc hardcode chữ "About"
          click: () => openAboutWindow(win), // Gọi hàm mở cửa sổ custom
        }
      ],
    },
  ];
};
export const setApplicationMenu = async (win: Electron.BrowserWindow) => {
  const menuTemplate: MenuTemplate = [...(await mainMenuTemplate(win))];
  if (process.platform === 'darwin') {
    const { name } = app;
    menuTemplate.unshift({
      label: name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'selectAll' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'close' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

async function setProxy(item: Electron.MenuItem, win: BrowserWindow) {
  const output = await prompt(
    {
      title: t(
        'main.menu.options.submenu.advanced-options.submenu.set-proxy.prompt.title',
      ),
      label: t(
        'main.menu.options.submenu.advanced-options.submenu.set-proxy.prompt.label',
      ),
      value: config.get('options.proxy'),
      type: 'input',
      inputAttrs: {
        type: 'url',
        placeholder: t(
          'main.menu.options.submenu.advanced-options.submenu.set-proxy.prompt.placeholder',
        ),
      },
      width: 450,
      ...promptOptions(),
    },
    win,
  );

  if (typeof output === 'string') {
    config.setMenuOption('options.proxy', output);
    item.checked = output !== '';
  } else {
    // User pressed cancel
    item.checked = !item.checked; // Reset checkbox
  }
}
