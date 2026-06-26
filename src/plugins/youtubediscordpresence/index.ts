import { session, app, BrowserWindow } from 'electron';
import path from 'path';

import { Platform } from '@/types/plugins';
import { createPlugin } from '@/utils';

// ID này lấy từ manifest key của ydp
const EXTENSION_ID = 'hnmeidgkfcbpjjjpmjmpehjdljlaeaaa';

export default createPlugin({
  name: () => 'Discord Rich Presence (XFG16)',
  description: () => 'An alternative version of the default Discord Rich Presence plugin, made by XFG16. It requires setting up some additional things to work, details at https://github.com/XFG16/YouTubeDiscordPresence.',
  restartNeeded: true,
  platform: Platform.Windows,
  config: {
    enabled: false,
  },
  menu: async () => {
    return [
      {
        label: 'Open Settings',
        click: () => {
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
            },
          });

          settingsWin.setBackgroundColor('#00000000');

          const optionsUrl = `chrome-extension://${EXTENSION_ID}/popup.html`;

          settingsWin.loadURL(optionsUrl).catch((err) => {
            console.error('Cannot open settings page:', err);
            settingsWin.loadURL(`chrome-extension://${EXTENSION_ID}/action/default_popup.html`);
          });

          // Inject frameless window UI after the page loads
          settingsWin.webContents.on('dom-ready', () => {
            settingsWin.webContents.executeJavaScript(`
              (function() {
                try {
                  // --- Inject Styles ---
                  const style = document.createElement('style');
                  style.textContent = \`
                    :root, html {
                      background: transparent !important;
                      background-color: transparent !important;
                      width: 100% !important;
                      min-width: 100% !important;
                      max-width: 100% !important;
                      overflow: hidden !important;
                    }
                    
                    body {
                      background: transparent !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      overflow: hidden !important;
                      height: 100vh !important;
                    }

                    #glassy-wrapper {
                      position: fixed;
                      inset: 0;
                      background: radial-gradient(circle at top left, rgba(30, 30, 40, 0.85), rgba(15, 15, 18, 0.95));
                      backdrop-filter: blur(40px) saturate(180%);
                      -webkit-backdrop-filter: blur(40px) saturate(180%);
                      border-radius: 16px;
                      border: 1px solid rgba(255, 255, 255, 0.12);
                      overflow: hidden;
                      display: flex;
                      flex-direction: column;
                      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                      clip-path: inset(0 round 16px);
                      -webkit-app-region: drag;
                      z-index: 999999;
                      animation: glassyAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    }

                    #glassy-wrapper.closing {
                      animation: glassyDisappear 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
                      pointer-events: none;
                    }

                    #glassy-wrapper::before {
                      content: "";
                      position: absolute;
                      top: -15%;
                      left: -15%;
                      width: 70%;
                      height: 70%;
                      background: radial-gradient(circle, rgba(123, 97, 255, 0.18) 0%, rgba(123, 97, 255, 0) 70%);
                      z-index: -1;
                      pointer-events: none;
                      filter: blur(40px);
                    }

                    #glassy-wrapper::after {
                      content: "";
                      position: absolute;
                      bottom: -15%;
                      right: -15%;
                      width: 70%;
                      height: 70%;
                      background: radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, rgba(0, 242, 254, 0) 70%);
                      z-index: -1;
                      pointer-events: none;
                      filter: blur(40px);
                    }

                    @keyframes glassyGlowPulse {
                      0% {
                        opacity: 0.7;
                        transform: scale(0.95) translate(0, 0);
                      }
                      100% {
                        opacity: 1;
                        transform: scale(1.05) translate(5%, 5%);
                      }
                    }

                    @keyframes glassyAppear {
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

                    @keyframes glassyDisappear {
                      0% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                        filter: blur(0px);
                      }
                      40% { opacity: 0.8; }
                      100% {
                        opacity: 0;
                        transform: scale(0.9) translateY(25px);
                        filter: blur(12px);
                      }
                    }

                    #glassy-titlebar {
                      height: 42px;
                      min-height: 42px;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      padding: 0 16px;
                      -webkit-app-region: drag !important;
                      user-select: none;
                      z-index: 10002 !important;
                      position: relative;
                    }

                    #glassy-titlebar-label {
                      font-family: 'Segoe UI', sans-serif;
                      font-size: 13px;
                      font-weight: 600;
                      color: rgba(255,255,255,0.85);
                      letter-spacing: 0.3px;
                    }

                    #glassy-close-btn {
                      -webkit-app-region: no-drag;
                      width: 30px;
                      height: 30px;
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 50%;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      cursor: pointer;
                      transition: all 0.3s;
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      backdrop-filter: blur(10px);
                    }

                    #glassy-close-btn:hover {
                      background: rgba(255, 80, 80, 0.8);
                      transform: scale(1.1);
                    }

                    #glassy-close-btn svg {
                      width: 13px;
                      height: 13px;
                      fill: #fff;
                    }

                    #glassy-content {
                      flex: 1;
                      overflow: auto;
                      -webkit-app-region: no-drag;
                      border-radius: 0 0 16px 16px;
                      padding: 1.25rem 2rem 1rem !important;
                      box-sizing: border-box;
                      background: rgba(20, 20, 25, 0.5);
                      border-top: 1px solid rgba(255,255,255,0.08);
                    }
                  \`;
                  document.head.appendChild(style);

                  const wrapper = document.createElement('div');
                  wrapper.id = 'glassy-wrapper';

                  const titlebar = document.createElement('div');
                  titlebar.id = 'glassy-titlebar';
                  titlebar.innerHTML = \`
                    <span id="glassy-titlebar-label">YouTube Discord Presence Settings</span>
                    <div id="glassy-close-btn">
                      <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </div>
                  \`;

                  const contentArea = document.createElement('div');
                  contentArea.id = 'glassy-content';

                  while (document.body.firstChild) {
                    contentArea.appendChild(document.body.firstChild);
                  }

                  wrapper.appendChild(titlebar);
                  wrapper.appendChild(contentArea);

                  document.body.appendChild(wrapper);

                  const closeBtn = document.getElementById('glassy-close-btn');
                  if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                      if (wrapper.classList.contains('closing')) return;
                      wrapper.classList.add('closing');
                      setTimeout(() => {
                        document.title = '__GLASSY_CLOSE__';
                      }, 50);
                    });
                  }
                } catch (e) {
                  console.error('Error in glassy script:', e);
                }
              })();
            `).then(() => {
              settingsWin.show();
            }).catch(console.error);
          });

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
    ];
  },
  backend: {
    async start({ getConfig }) {
      const config = await getConfig();

      const basePath = app.isPackaged
        ? process.resourcesPath
        : path.join(__dirname, '../../');

      const extensionPath = path.join(basePath, 'extensions', 'ydp');

      console.log('Loading YouTube Discord Presence from:', extensionPath);

      if (config.enabled) {
        session.defaultSession.loadExtension(extensionPath)
          .then((ext) => {
            console.log('YouTube Discord Presence loaded! ID:', ext.id);
          })
          .catch((err) => {
            console.error('Failed to load YouTube Discord Presence:', err);
          });
      }
    },
  },
});