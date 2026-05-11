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
        
        html {
            background: transparent !important;
        }

        body {
            font-family: 'Baloo 2', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: transparent !important;
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

        /* --- Outer Wrapper (holds the gradient, border-radius, and drag region) --- */
        .window-wrapper {
            position: absolute;
            inset: 0;
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite, windowAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-app-region: drag;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
            clip-path: inset(0 round 20px);
        }

        @keyframes windowAppear {
            0% {
                opacity: 0;
                transform: scale(0.85) translateY(40px);
                filter: blur(15px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
                filter: blur(0px);
            }
        }

        @keyframes windowDisappear {
            0% {
                opacity: 1;
                transform: scale(1) translateY(0);
                filter: blur(0px);
            }
            40% {
                opacity: 0.8;
            }
            100% {
                opacity: 0;
                transform: scale(0.9) translateY(25px);
                filter: blur(12px);
            }
        }

        .window-wrapper.closing {
            animation: gradientBG 15s ease infinite, windowDisappear 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
            pointer-events: none;
        }
        
        /* Interactive elements should not be draggable */
        .scroll-area, a, .close-btn, .container {
            -webkit-app-region: no-drag;
        }
        
        /* --- Close Button --- */
        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 100;
            transition: all 0.3s;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .close-btn:hover {
            background: rgba(255, 80, 80, 0.8);
            transform: scale(1.1);
        }
        
        .close-btn svg {
            width: 14px;
            height: 14px;
            fill: #fff;
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
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            padding: 20px 35px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
            -webkit-app-region: no-drag;
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

    <div class="window-wrapper">

    <!-- Close Button -->
    <div class="close-btn" id="closeBtn" title="Đóng">
        <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
    </div>

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
                <span class="log-version">Version 3.12.7-beta</span>
                <span class="log-tag">BETA</span>
            </div>
            <ul>
                <li>Upstreamed to commit: <code style="">0b3dab6</code></li>
                <li>Updated Better Lyrics to <code>v2.3.0-canary 1</code></li>
                <li>Updated MERGE THEME from <span style="color:#00f2fe">v20</span> to <span style="color:#00f2fe">v21</span></li>
                <li>New share UI and toast UI</li>
                <li>New Colors UI</li>
                <li>New MacOS icons</li>
                <li>New fullscreen lyrics without fullscreen</li>
                <li>New Resync Lyrics button</li>
                <li>New Crossfade animated artwork</li>
                <li>Fixed text alignment on different languages</li>
                <li>Fixed share menu and add to playlist menu doesn't have animation</li>
                <li>Fixed crossfade artwork sometime not work or weird behavior</li>
            </ul>
        </div>
        <div class="log-entry">
            <div class="log-header">
                <span class="log-version">Version 3.12.6-beta</span>
                <span class="log-tag">BETA</span>
            </div>
            <ul>
                <li>Upstreamed to commit: <code style="">6aa7cdb</code></li>
                <li>Updated Better Lyrics to commit: <code style="">baf075d</code></li>
                <li>Updated Better Lyrics Shaders to commit: <code style="">6ce176e</code></li>
                <li>Updated MERGE THEME from <span style="color:#00f2fe">v19</span> to <span style="color:#00f2fe">v20</span></li>
                <li>New tabs UI</li>
                <li>Remove old scroll effect, new GlassyFlow v4</li>
                <li>Fixed static lyrics not unblurring</li>
            </ul>
        </div>
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
    </div> <!-- /window-wrapper -->

    <script>
        document.getElementById('closeBtn').addEventListener('click', () => {
            const wrapper = document.querySelector('.window-wrapper');
            if (wrapper.classList.contains('closing')) return;
            wrapper.classList.add('closing');
            // Signal main process to start opacity fadeout + destroy
            setTimeout(() => {
                document.title = '__GLASSY_CLOSE__';
            }, 50); // small delay so CSS animation starts rendering first
        });
    </script>
</body>
</html>`

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

// ===================== Font Settings Window =====================
let fontSettingsWindow: BrowserWindow | null = null;

const openFontSettingsWindow = (parentWin: BrowserWindow) => {
  if (fontSettingsWindow && !fontSettingsWindow.isDestroyed()) {
    fontSettingsWindow.focus();
    return;
  }

  const currentFonts = config.get('options.customFonts') ?? {
    youtubeUI: { enabled: false, family: 'Inter', size: 14, sizeUnit: 'px', weight: 400 },
    lyrics: { enabled: false, family: 'Satoshi', size: 3, sizeUnit: 'rem', weight: 700 },
  };

  fontSettingsWindow = new BrowserWindow({
    parent: parentWin,
    width: 580,
    height: 700,
    resizable: false,
    title: 'Font Settings',
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

  fontSettingsWindow.once('ready-to-show', () => {
    fontSettingsWindow?.show();
  });

  const ytEnabled = currentFonts.youtubeUI?.enabled ?? false;
  const lyEnabled = currentFonts.lyrics?.enabled ?? false;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { background: transparent !important; }

        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: transparent !important;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
            user-select: none;
        }

        .window-wrapper {
            position: absolute;
            inset: 0;
            background: linear-gradient(-45deg, #667eea, #764ba2, #6B8DD6, #8E37D7);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite, windowAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-app-region: drag;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
            clip-path: inset(0 round 20px);
        }

        @keyframes windowAppear {
            0% { opacity: 0; transform: scale(0.85) translateY(40px); filter: blur(15px); }
            100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
        }

        @keyframes windowDisappear {
            0% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
            100% { opacity: 0; transform: scale(0.9) translateY(25px); filter: blur(12px); }
        }

        .window-wrapper.closing {
            animation: gradientBG 15s ease infinite, windowDisappear 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
            pointer-events: none;
        }

        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .container, .close-btn, button, input, select, label {
            -webkit-app-region: no-drag;
        }

        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 100;
            transition: all 0.3s;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        .close-btn:hover {
            background: rgba(255, 80, 80, 0.8);
            transform: scale(1.1);
        }
        .close-btn svg { width: 14px; height: 14px; fill: #fff; }

        .container {
            width: calc(100% - 50px);
            height: calc(100% - 50px);
            background: rgba(20, 20, 20, 0.65);
            backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            padding: 28px 30px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
        }

        .container::-webkit-scrollbar { width: 5px; }
        .container::-webkit-scrollbar-track { background: transparent; }
        .container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }

        h1 {
            font-size: 26px;
            font-weight: 700;
            background: linear-gradient(to right, #a78bfa, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
            margin-bottom: 6px;
        }

        .subtitle {
            text-align: center;
            color: rgba(255,255,255,0.5);
            font-size: 13px;
            margin-bottom: 20px;
        }

        /* Toggle Switch */
        .toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 14px 18px;
            margin-bottom: 20px;
        }
        .toggle-row span { font-size: 15px; font-weight: 600; }
        .toggle-row .status { font-size: 12px; color: rgba(255,255,255,0.4); margin-left: 8px; }

        .switch {
            position: relative;
            width: 48px;
            height: 26px;
            flex-shrink: 0;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background: rgba(255,255,255,0.15);
            transition: 0.35s;
            border-radius: 26px;
        }
        .slider::before {
            content: '';
            position: absolute;
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background: white;
            transition: 0.35s;
            border-radius: 50%;
        }
        .switch input:checked + .slider {
            background: linear-gradient(135deg, #a78bfa, #818cf8);
        }
        .switch input:checked + .slider::before {
            transform: translateX(22px);
        }

        /* Small Switch */
        .switch.small {
            width: 36px;
            height: 20px;
        }
        .switch.small .slider::before {
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
        }
        .switch.small input:checked + .slider::before {
            transform: translateX(16px);
        }

        /* Section */
        .section {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 18px;
            margin-bottom: 16px;
            transition: opacity 0.3s;
        }
        .section.disabled {
            opacity: 0.35;
            pointer-events: none;
        }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 14px;
            display: flex;
            align-items: center;
        }
        .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(255,255,255,0.08);
            margin-left: 12px;
        }

        .field {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 8px;
        }
        .field:last-child { margin-bottom: 0; }
        .field label {
            font-size: 13px;
            color: rgba(255,255,255,0.7);
            width: 70px;
            flex-shrink: 0;
        }
        .field input[type="text"],
        .field input[type="number"] {
            flex: 1;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 10px;
            padding: 8px 12px;
            color: #fff;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
            outline: none;
            transition: border-color 0.2s;
        }
        .field input:focus {
            border-color: rgba(167, 139, 250, 0.6);
        }
        .field select {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 10px;
            padding: 8px 10px;
            color: #fff;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
            outline: none;
            cursor: pointer;
            appearance: none;
            min-width: 60px;
        }
        .field select option { background: #2a2a3a; color: #fff; }

        /* Weight presets */
        .weight-presets {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        .weight-presets button {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 4px 8px;
            color: rgba(255,255,255,0.7);
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Inter', sans-serif;
        }
        .weight-presets button:hover {
            background: rgba(167,139,250,0.3);
            color: #fff;
        }
        .weight-presets button.active {
            background: rgba(167,139,250,0.4);
            border-color: rgba(167,139,250,0.6);
            color: #fff;
        }

        /* Save button */
        .save-btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 14px;
            background: linear-gradient(135deg, #a78bfa, #818cf8);
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Inter', sans-serif;
            margin-top: 6px;
            letter-spacing: 0.3px;
        }
        .save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(129, 140, 248, 0.4);
        }
        .save-btn:active {
            transform: translateY(0);
        }

        /* Help docs */
        .help-box {
            background: rgba(167,139,250,0.08);
            border: 1px solid rgba(167,139,250,0.2);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 18px;
            font-size: 12px;
            line-height: 1.7;
            color: rgba(255,255,255,0.6);
        }
        .help-box summary {
            cursor: pointer;
            font-weight: 600;
            color: rgba(255,255,255,0.8);
            font-size: 13px;
            margin-bottom: 6px;
        }
        .help-box code {
            background: rgba(0,0,0,0.3);
            color: #a78bfa;
            padding: 1px 5px;
            border-radius: 4px;
            font-family: 'Consolas', monospace;
            font-size: 11px;
        }
        .help-box ul { padding-left: 16px; margin: 4px 0; }
        .help-box li { margin-bottom: 2px; }

        /* Section toggle */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
        }
        .section-body.disabled {
            opacity: 0.35;
            pointer-events: none;
        }

        /* Validation */
        .field input.invalid, .field select.invalid {
            border-color: rgba(255,100,100,0.6) !important;
            background: rgba(255,50,50,0.08) !important;
        }
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(255,80,80,0.9);
            color: #fff;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            opacity: 0;
            transition: all 0.3s;
            z-index: 999;
            pointer-events: none;
            backdrop-filter: blur(10px);
        }
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        .toast.success {
            background: rgba(80,200,120,0.9);
        }
    </style>
</head>
<body>
    <div class="window-wrapper" id="windowWrapper">
        <div class="close-btn" id="closeBtn" title="Close">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </div>

        <div class="container">
            <h1>Font Settings</h1>
            <div class="subtitle">Customize fonts for YouTube Music UI and Lyrics</div>

            <!-- Help Docs -->
            <details class="help-box">
                <summary>ℹ️ How to use — click to expand</summary>
                <p><strong>Font Family:</strong> Enter a font name installed on your computer.</p>
                <ul>
                    <li>Common: <code>Inter</code>, <code>Arial</code>, <code>Segoe UI</code>, <code>Roboto</code></li>
                    <li>If the font is not found, the browser will use a fallback.</li>
                </ul>
                <p><strong>Font Size:</strong> Numbers only. <code>px</code> = fixed, <code>rem</code> = relative.</p>
                <p><strong>Font Weight:</strong> 100 (thin) → 900 (black). Common: 400 (regular), 700 (bold).</p>
            </details>

            <!-- YouTube Music UI Section -->
            <div class="section" id="ytSection">
                <div class="section-header">
                    <div class="section-title" style="margin-bottom:0">YouTube Music UI & Song Info</div>
                    <label class="switch">
                        <input type="checkbox" id="ytEnabled" ${ytEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="section-body ${!ytEnabled ? 'disabled' : ''}" id="ytBody">
                    <div class="field">
                        <label>Family</label>
                        <input type="text" id="ytFamily" value="${currentFonts.youtubeUI.family}" placeholder="Inter, Arial, ...">
                    </div>
                    <div class="field" style="justify-content: space-between; background: rgba(167,139,250,0.05); border: 1px solid rgba(167,139,250,0.1); padding: 10px 12px; border-radius: 10px; margin-top: -2px; margin-bottom: 14px;">
                        <div style="display:flex; align-items:center; gap:6px;" title="Type exact font name from fonts.google.com. We will download it automatically!">
                            <span style="font-size:13px; color:#a78bfa;">Load from Google Fonts</span>
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:rgba(167,139,250,0.2); color:#a78bfa; font-size:10px; font-weight:bold; cursor:help;">i</span>
                        </div>
                        <label class="switch small">
                            <input type="checkbox" id="ytGoogleFont" ${currentFonts.youtubeUI.useGoogleFont ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="field">
                        <label style="display:flex; align-items:center; gap:4px;" title="This size only applies to the Song Info text (title & artist) to preserve YouTube Music's default visual hierarchy.">
                            Size
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:rgba(255,255,255,0.2); color:rgba(255,255,255,0.8); font-size:10px; font-weight:bold; cursor:help;">i</span>
                        </label>
                        <input type="number" id="ytSize" value="${currentFonts.youtubeUI.size}" min="1" max="200" step="0.1">
                        <select id="ytSizeUnit">
                            <option value="px" ${currentFonts.youtubeUI.sizeUnit === 'px' ? 'selected' : ''}>px</option>
                            <option value="rem" ${currentFonts.youtubeUI.sizeUnit === 'rem' ? 'selected' : ''}>rem</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Weight</label>
                        <input type="number" id="ytWeight" value="${currentFonts.youtubeUI.weight}" min="100" max="900" step="100">
                        <div class="weight-presets" data-target="ytWeight">
                            <button data-val="300">Light</button>
                            <button data-val="400">Regular</button>
                            <button data-val="500">Medium</button>
                            <button data-val="600">Semi</button>
                            <button data-val="700">Bold</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lyrics Section -->
            <div class="section" id="lyricsSection">
                <div class="section-header">
                    <div class="section-title" style="margin-bottom:0">Lyrics (Better Lyrics)</div>
                    <label class="switch">
                        <input type="checkbox" id="lyricsEnabled" ${lyEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="section-body ${!lyEnabled ? 'disabled' : ''}" id="lyricsBody">
                    <div class="field">
                        <label>Family</label>
                        <input type="text" id="lyricsFamily" value="${currentFonts.lyrics.family}" placeholder="Satoshi, ...">
                    </div>
                    <div class="field" style="justify-content: space-between; background: rgba(167,139,250,0.05); border: 1px solid rgba(167,139,250,0.1); padding: 10px 12px; border-radius: 10px; margin-top: -2px; margin-bottom: 14px;">
                        <div style="display:flex; align-items:center; gap:6px;" title="Type exact font name from fonts.google.com. We will download it automatically!">
                            <span style="font-size:13px; color:#a78bfa;">Load from Google Fonts</span>
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border-radius:50%; background:rgba(167,139,250,0.2); color:#a78bfa; font-size:10px; font-weight:bold; cursor:help;">i</span>
                        </div>
                        <label class="switch small">
                            <input type="checkbox" id="lyricsGoogleFont" ${currentFonts.lyrics.useGoogleFont ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="field">
                        <label>Size</label>
                        <input type="number" id="lyricsSize" value="${currentFonts.lyrics.size}" min="0.1" max="200" step="0.1">
                        <select id="lyricsSizeUnit">
                            <option value="px" ${currentFonts.lyrics.sizeUnit === 'px' ? 'selected' : ''}>px</option>
                            <option value="rem" ${currentFonts.lyrics.sizeUnit === 'rem' ? 'selected' : ''}>rem</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Weight</label>
                        <input type="number" id="lyricsWeight" value="${currentFonts.lyrics.weight}" min="100" max="900" step="100">
                        <div class="weight-presets" data-target="lyricsWeight">
                            <button data-val="400">Regular</button>
                            <button data-val="500">Medium</button>
                            <button data-val="600">Semi</button>
                            <button data-val="700">Bold</button>
                            <button data-val="800">Extra</button>
                        </div>
                    </div>
                </div>
            </div>

            <button class="save-btn" id="saveBtn">Save & Apply</button>
        </div>
        <div class="toast" id="toast"></div>
    </div>

    <script>
        // Per-section toggles
        const ytToggle = document.getElementById('ytEnabled');
        const lyricsToggle = document.getElementById('lyricsEnabled');
        const ytBody = document.getElementById('ytBody');
        const lyricsBody = document.getElementById('lyricsBody');

        ytToggle.addEventListener('change', () => {
            ytBody.classList.toggle('disabled', !ytToggle.checked);
        });
        lyricsToggle.addEventListener('change', () => {
            lyricsBody.classList.toggle('disabled', !lyricsToggle.checked);
        });

        // Weight preset buttons
        document.querySelectorAll('.weight-presets').forEach(group => {
            const targetId = group.dataset.target;
            const input = document.getElementById(targetId);
            group.querySelectorAll('button').forEach(btn => {
                if (btn.dataset.val === input.value) btn.classList.add('active');
                btn.addEventListener('click', () => {
                    input.value = btn.dataset.val;
                    group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
            input.addEventListener('input', () => {
                group.querySelectorAll('button').forEach(b => {
                    b.classList.toggle('active', b.dataset.val === input.value);
                });
            });
        });

        // Toast
        function showToast(msg, isSuccess) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.className = 'toast show' + (isSuccess ? ' success' : '');
            setTimeout(() => { toast.className = 'toast'; }, 2500);
        }

        // Validation helpers
        function validateNumber(el, min, max) {
            const v = parseFloat(el.value);
            if (isNaN(v) || v < min || v > max) { el.classList.add('invalid'); return null; }
            el.classList.remove('invalid');
            return v;
        }
        function validateText(el) {
            const v = el.value.trim();
            if (!v || /[<>{}]/.test(v)) { el.classList.add('invalid'); return null; }
            el.classList.remove('invalid');
            return v;
        }
        function validateWeight(el) {
            const v = parseInt(el.value);
            if (isNaN(v) || v < 100 || v > 900) { el.classList.add('invalid'); return null; }
            el.classList.remove('invalid');
            return v;
        }

        // Close
        document.getElementById('closeBtn').addEventListener('click', () => {
            const wrapper = document.getElementById('windowWrapper');
            if (wrapper.classList.contains('closing')) return;
            wrapper.classList.add('closing');
            setTimeout(() => { document.title = '__FONT_CLOSE__'; }, 50);
        });

        // Save with validation
        document.getElementById('saveBtn').addEventListener('click', () => {
            document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
            let hasError = false;

            let ytF = 'Inter', ytS = 14, ytW = 400;
            if (ytToggle.checked) {
                const f = validateText(document.getElementById('ytFamily'));
                const s = validateNumber(document.getElementById('ytSize'), 1, 200);
                const w = validateWeight(document.getElementById('ytWeight'));
                if (!f || s === null || !w) hasError = true;
                else { ytF = f; ytS = s; ytW = w; }
            } else {
                ytF = document.getElementById('ytFamily').value.trim() || 'Inter';
                ytS = parseFloat(document.getElementById('ytSize').value) || 14;
                ytW = parseInt(document.getElementById('ytWeight').value) || 400;
            }

            let lyF = 'Satoshi', lyS = 3, lyW = 700;
            if (lyricsToggle.checked) {
                const f = validateText(document.getElementById('lyricsFamily'));
                const s = validateNumber(document.getElementById('lyricsSize'), 0.1, 200);
                const w = validateWeight(document.getElementById('lyricsWeight'));
                if (!f || s === null || !w) hasError = true;
                else { lyF = f; lyS = s; lyW = w; }
            } else {
                lyF = document.getElementById('lyricsFamily').value.trim() || 'Satoshi';
                lyS = parseFloat(document.getElementById('lyricsSize').value) || 3;
                lyW = parseInt(document.getElementById('lyricsWeight').value) || 700;
            }

            if (hasError) {
                showToast('⚠️ Invalid values — check highlighted fields', false);
                return;
            }

            const data = {
                youtubeUI: { enabled: ytToggle.checked, useGoogleFont: document.getElementById('ytGoogleFont').checked, family: ytF, size: ytS, sizeUnit: document.getElementById('ytSizeUnit').value, weight: ytW },
                lyrics: { enabled: lyricsToggle.checked, useGoogleFont: document.getElementById('lyricsGoogleFont').checked, family: lyF, size: lyS, sizeUnit: document.getElementById('lyricsSizeUnit').value, weight: lyW },
            };
            document.title = '__FONT_SAVE__' + JSON.stringify(data);
            showToast('✅ Saved & Applied!', true);
        });
    </script>
</body>
</html>`;

  fontSettingsWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  fontSettingsWindow.webContents.on('page-title-updated', (event, title) => {
    event.preventDefault();

    if (title === '__FONT_CLOSE__') {
      if (!fontSettingsWindow || fontSettingsWindow.isDestroyed()) return;
      setTimeout(() => {
        if (!fontSettingsWindow || fontSettingsWindow.isDestroyed()) return;
        let opacity = 1;
        const steps = 18;
        const interval = 280 / steps;
        const fadeTimer = setInterval(() => {
          opacity -= 1 / steps;
          if (opacity <= 0) {
            clearInterval(fadeTimer);
            if (fontSettingsWindow && !fontSettingsWindow.isDestroyed()) {
              fontSettingsWindow.destroy();
              fontSettingsWindow = null;
            }
          } else if (fontSettingsWindow && !fontSettingsWindow.isDestroyed()) {
            fontSettingsWindow.setOpacity(Math.max(0, opacity));
          } else {
            clearInterval(fadeTimer);
          }
        }, interval);
      }, 120);
      return;
    }

    if (title.startsWith('__FONT_SAVE__')) {
      try {
        const data = JSON.parse(title.replace('__FONT_SAVE__', ''));
        config.set('options.customFonts', data);
        // Send to renderer for live CSS update
        parentWin.webContents.send('peard:custom-fonts-changed', data);
      } catch (err) {
        console.error('Failed to parse font settings:', err);
      }
    }
  });

  fontSettingsWindow.on('closed', () => {
    fontSettingsWindow = null;
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
        { type: 'separator' },
        {
          label: 'Change Fonts...',
          click() {
            openFontSettingsWindow(win);
          },
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
