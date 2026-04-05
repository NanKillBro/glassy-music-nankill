import is from 'electron-is';
import {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  Menu,
  type MenuItem,
  shell,
} from 'electron';
import prompt from 'custom-electron-prompt';
import { satisfies } from 'semver';

import { allPlugins } from 'virtual:plugins';

import { languageResources } from 'virtual:i18n';

import * as config from './config';

import { restart } from './providers/app-controls';
import { startingPages } from './providers/extracted-data';
import promptOptions from './providers/prompt-options';

import { getAllMenuTemplate, loadAllMenuPlugins } from './loader/menu';
import { APPLICATION_NAME, setLanguage, t } from '@/i18n';

import packageJson from '../package.json';

export type MenuTemplate = Electron.MenuItemConstructorOptions[];

// True only if in-app-menu was loaded on launch
const inAppMenuActive = await config.plugins.isEnabled('in-app-menu');

const LOCKED_PLUGINS = ['better-lyrics', 'better-lyrics-shaders', 'album-color-theme-modded'];

const pluginEnabledMenu = async (
  plugin: string,
  label = '',
  description: string | undefined = undefined,
  isNew = false,
  hasSubmenu = false,
  refreshMenu: (() => void) | undefined = undefined,
): Promise<Electron.MenuItemConstructorOptions> => {
  // 1. Kiểm tra xem plugin này có nằm trong danh sách bị khóa không
  const isLocked = LOCKED_PLUGINS.includes(plugin);

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
    parent: parentWin, // Gắn vào cửa sổ chính
    modal: true,       // (Tùy chọn) Chặn tương tác cửa sổ chính khi mở About
    width: 600,
    height: 700,
    resizable: false,
    title: "About Glassy Music", // Hoặc "Thông tin ứng dụng"
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true, // Ẩn menu mặc định của cửa sổ con
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Nội dung HTML/CSS tích hợp sẵn
  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap" rel="stylesheet">
    <style>
        /* --- Reset & Base --- */
        * { box-sizing: border-box; }
        
        body {
            font-family: 'Baloo 2', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            /* Animated Gradient Background */
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            color: #ffffff;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
            user-select: none;
        }
        
        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* --- Main Container (Deep Glass Effect) --- */
        .container {
            max-width: 650px;
            width: calc(100% - 55px); 
            height: calc(100% - 55px);
            /* Glassmorphism with Saturation boost */
            background: rgba(20, 20, 20, 0.65);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-top: 1px solid rgba(255, 255, 255, 0.3); /* Top highlight */
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            padding: 20px 35px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
        }

        /* --- Header Section --- */
        .header {
            text-align: center;
            margin-bottom: 15px;
            flex-shrink: 0;
            z-index: 1;
            position: relative;
        }

        h1 {
            margin: 0;
            font-size: 34px;
            font-weight: 800;
            /* Multicolor Text Gradient */
            background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 15px rgba(79, 172, 254, 0.5));
            letter-spacing: -0.5px;
            line-height: 1.2;
        }

        .version-badge {
            display: inline-flex;
            align-items: center;
            margin-top: 6px;
            padding: 6px 16px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .version-badge::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #00f2fe;
            border-radius: 50%;
            margin-right: 8px;
            box-shadow: 0 0 10px #00f2fe;
        }

        .dev-by {
            margin-top: 6px;
            font-size: 15px;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .dev-by strong { 
            color: #fff; 
            font-weight: 600;
        }

        .dev-by a {
            color: inherit; /* Kế thừa màu trắng từ thẻ strong cha */
            text-decoration: none; /* Bỏ dấu gạch dưới */
            transition: color 0.3s; /* Hiệu ứng chuyển màu mượt */
        }

        .dev-by a:hover {
            color: #00f2fe; /* Đổi sang màu xanh neon khi di chuột vào (giống theme) */
            text-shadow: 0 0 10px rgba(0, 242, 254, 0.6); /* Thêm hiệu ứng phát sáng */
        }

        /* --- Changelog Box --- */
        .changelog-label {
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 15px;
            font-weight: 700;
            padding-left: 5px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
        }
        
        .changelog-label::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(255,255,255,0.1);
            margin-left: 15px;
        }

        .scroll-area {
            flex-grow: 1;
            overflow-y: auto;
            padding-right: 12px;
            /* Mask gradient bottom */
            mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
        }

        /* Custom Scrollbar */
        .scroll-area::-webkit-scrollbar { width: 5px; }
        .scroll-area::-webkit-scrollbar-track { background: transparent; }
        .scroll-area::-webkit-scrollbar-thumb { 
            background: rgba(255,255,255,0.2); 
            border-radius: 10px; 
        }
        .scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }

        /* --- Log Entry Styling --- */
        .log-entry {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
            /* Animation Slide In */
            animation: slideIn 0.6s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }

        @keyframes slideIn {
            to { opacity: 1; transform: translateY(0); }
        }

        /* Hover effect: Glow border + lighter BG */
        .log-entry:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-4px) scale(1.01);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        /* Decoration bar on the left */
        .log-entry::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
            opacity: 0.8;
        }

        .log-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px dashed rgba(255,255,255,0.15);
        }

        .log-version {
            font-size: 18px;
            color: #fff;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .log-tag {
            font-size: 13px;
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: #444;
            padding: 4px 10px;
            border-radius: 8px;
            font-weight: 800;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 10px rgba(255, 154, 158, 0.3);
        }

        ul { padding-left: 20px; margin: 0; }
        
        li {
            margin-bottom: 10px;
            font-size: 16px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.85);
            position: relative;
        }

        /* Custom Bullet Points */
        li::marker { color: #ff9a9e; }
        
        /* Code snippet styling */
        code {
            background: rgba(0,0,0,0.3);
            color: #00f2fe;
            padding: 3px 6px;
            border-radius: 6px;
            font-family: 'Consolas', monospace;
            font-size: 15px;
            border: 1px solid rgba(0, 242, 254, 0.2);
        }

        /* --- Credits Footer --- */
        .credits {
            margin-top: 10px;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            line-height: 1.6;
            flex-shrink: 0;
        }

        .credits a {
            color: #fff;
            text-decoration: none;
            border-bottom: 1px dotted rgba(255,255,255,0.4);
            transition: all 0.2s;
        }

        .credits a:hover {
            color: #00f2fe;
            border-bottom-color: #00f2fe;
            text-shadow: 0 0 8px rgba(0, 242, 254, 0.6);
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>Glassy Music</h1>
            <div class="version-badge">v${packageJson.version}</div>
            <div class="dev-by">Developed by <strong><a href="https://github.com/NanKillBro" target="_blank">NanKill</a></strong></div>
        </div>

        <div class="changelog-label">What's New</div>

        <div class="scroll-area">
        <div class="log-entry">
            <div class="log-header">
                <span class="log-version">Version 3.12.5-beta</span>
                <span class="log-tag">BETA</span>
            </div>
            <ul>
                <li>Upstreamed to commit: <code style="">c583e90</code></li>
                <li>Updated MERGE THEME from <span style="color:#00f2fe">v18</span> to <span style="color:#00f2fe">v19</span></li>
                <li>Updated Better Lyrics to commit: <code style="">b8ca6de</code></li>
                <li>Added new fixed spring scroll effect (delay)</li>
                <li>Discord RPC Github URL changed</li>
                <li>Fixed some part don't have animation</li>
                <li>Fixed weird crossfade img</li>
                <li>Fixed library button not showing up for premium users</li>
            </ul>
        </div>
        <div class="log-entry">
            <div class="log-header">
                <span class="log-version">Version 3.12.4-beta</span>
                <span class="log-tag">BETA</span>
            </div>
            <ul>
                <li>Upstreamed to commit: <code style="">e3d870a</code></li>
                <li>Updated MERGE THEME from <span style="color:#00f2fe">v17</span> to <span style="color:#00f2fe">v18</span></li>
                <li>Added AM spring scroll effect (with selectable options)</li>
                <li>Redesigned the in-app menu</li>
                <li>Added linear gradient styling to the top bar</li>
                <li>More rounded corners across the UI</li>
                <li>Fixed Discord RPC issue with 32-character limit</li>
                <li>Updated README documentation</li>
            </ul>
        </div>
        <div class="log-entry">
            <div class="log-header">
                <span class="log-version">Version 3.12.3-beta</span>
                <span class="log-tag">BETA</span>
            </div>
            <ul>
                <li>Upstreamed to commit: <code style="">3c67778</code></li>
                <li>Updated MERGE THEME from <span style="color:#00f2fe">v16</span> to <span style="color:#00f2fe">v17</span></li>
                <li>Major UI Update (MT)</li>
            </ul>
        </div>
        <div class="log-entry">
            <div class="log-header">
                <span class="log-version">Version 3.12.2-beta</span>
                <span class="log-tag">BETA</span>
            </div>
            <ul>
                <li>Upstreamed to commit: <code style="">658b3da</code></li>
                <li>Updated Better Lyrics to <code>v2.2.0 stable</code></li>
                <li>Updated Better Lyrics Shaders to <code>v1.1.4</code></li>
                <li>Updated MERGE THEME from <span style="color:#00f2fe">v15</span> to <span style="color:#00f2fe">v16</span></li>
                <li>Minor improvements and optimizations 🛠️</li>
                <li>Removed Low Performance Mode for BLS 🗑️</li>
            </ul>
        </div>
        <div class="log-entry">
                <div class="log-header">
                    <span class="log-version">Version 3.12.1-beta</span>
                    <span class="log-tag">BETA</span>
                </div>
                <ul>
                    <li>Based on commit: <code style="">f50025f</code></li>
                    <li>Update Better Lyrics to <code>2.2.0.3-canary</code></li>
                    <li>Update Better Lyric Shaders to <code>v1.1.3</code></li>
                    <li>Update MERGE THEME from <span style="color:#00f2fe">v14</span> to <span style="color:#00f2fe">v15</span></li>
                    <li>Add fade effect for main background (MT)</li>
                    <li>Add <strong>animated artwork</strong> (BLS)</li>
                    <li>Some performance fix and optimize (BL, U) 🚀</li>
                </ul>
            </div>
            <div class="log-entry">
                <div class="log-header">
                    <span class="log-version">Version 3.12.0-beta</span>
                    <span class="log-tag">BETA</span>
                </div>
                <ul>
                    <li>Based on commit: <code style="">1d72d12</code></li>
                    <li>✨ <strong>Rebrand the whole client</strong></li>
                    <li>Add new <strong>NonStop plugin</strong> 🎵</li>
                    <li>Add new <strong>Adblock</strong></li>
                    <li>Add new <strong>Better Lyrics Shaders</strong></li>
                    <li>Add Low Performance Mode (for BLS)</li>
                    <li>Add <strong>Album Color Theme (Modded)</strong></li>
                    <li>Update MERGE THEME from <span style="color:#00f2fe">V13</span> to <span style="color:#00f2fe">V14</span></li>
                    <li>Update Betterlyrics to <code>v2.2.0.2-canary</code></li>
                    <li>Fixed some small bugs and optimize 🐛</li>
                    <li>Remove Update Check</li>
                    <li>Remove MERGE THEME dynamic background</li>
                </ul>
            </div>
            </div>

        <div class="credits">
            Based on <strong><a href="https://github.com/pear-devs/pear-desktop" target="_blank">pear-desktop</a></strong> by <a href="#" style="pointer-events: none;">th-ch</a>.<br>
            Source code available at <a href="https://github.com/NanKillBro/glassy-music-nankill" target="_blank">NanKillBro/glassy-music-nankill</a>
        </div>
    </div>

</body>
</html>`

  // Load chuỗi HTML dưới dạng Data URI
  aboutWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

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
      .map((id) => {
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
