import { session, app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { createPlugin } from '@/utils';

// ID này lấy từ manifest key bạn cung cấp, hoặc bạn xem log cũ (mjfeakl...)
// Nếu build xong mở không lên thì check log xem ID thực tế là gì rồi thay vào đây
const EXTENSION_ID = 'effdbpeggelllpfkjppbokhmmiinhlmg';

export default createPlugin({
  name: () => 'Better Lyrics',
  restartNeeded: true,
  config: {
    enabled: true,
    enableV4Scroll: true,
  },
  // THÊM PHẦN NÀY: Tạo menu để mở cài đặt
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();

    return [
      {
        label: 'GlassyFlow v4 (Restart Required)',
        type: 'checkbox',
        checked: config.enableV4Scroll !== false,
        click: () => setConfig({ enableV4Scroll: config.enableV4Scroll === false ? true : false }),
      },
      {
        label: 'Open Settings',
        click: () => {
          const settingsWin = new BrowserWindow({
            width: 700,
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

          // Force canvas transparency for chrome-extension pages
          settingsWin.setBackgroundColor('#00000000');


          const optionsUrl = `chrome-extension://${EXTENSION_ID}/options_ui/page.html`;

          settingsWin.loadURL(optionsUrl).catch((err) => {
            console.error('Cannot open settings page:', err);
            settingsWin.loadURL(`chrome-extension://${EXTENSION_ID}/action/default_popup.html`);
          });

          // Inject frameless window UI after the page loads
          settingsWin.webContents.on('dom-ready', () => {
            settingsWin.webContents.executeJavaScript(`
              (function() {
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
                    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
                    background-size: 400% 400%;
                    animation: glassyGradient 15s ease infinite, glassyAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
                    -webkit-app-region: drag;
                    z-index: 999999;
                  }

                  #glassy-wrapper.closing {
                    animation: glassyGradient 15s ease infinite, glassyDisappear 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
                    pointer-events: none;
                  }

                  @keyframes glassyGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
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

                  /* Ensure the original nav doesn't capture drag */
                  nav, nav * {
                    -webkit-app-region: no-drag !important;
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
                    z-index: 10;
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
                    border-radius: 0 0 20px 20px;
                    padding: 1.25rem 2rem 1rem !important; /* Restore original body padding */
                    box-sizing: border-box;
                    background: rgba(30, 31, 34, 0.75); /* Dark glass layer for readability */
                    backdrop-filter: blur(25px) saturate(180%);
                    -webkit-backdrop-filter: blur(25px) saturate(180%);
                    border-top: 1px solid rgba(255,255,255,0.05);
                  }
                \`;
                document.head.appendChild(style);

                // --- Move original body children into wrapper ---
                const wrapper = document.createElement('div');
                wrapper.id = 'glassy-wrapper';

                const titlebar = document.createElement('div');
                titlebar.id = 'glassy-titlebar';
                titlebar.innerHTML = \`
                  <span id="glassy-titlebar-label">Better Lyrics Settings</span>
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

                wrapper.appendChild(titlebar);
                wrapper.appendChild(contentArea);
                document.body.appendChild(wrapper);

                // --- Close button handler ---
                document.getElementById('glassy-close-btn').addEventListener('click', () => {
                  if (wrapper.classList.contains('closing')) return;
                  wrapper.classList.add('closing');
                  setTimeout(() => {
                    document.title = '__GLASSY_CLOSE__';
                  }, 50);
                });
              })();
            `).then(() => {
              settingsWin.show();
            }).catch(console.error);
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
    ];
  },
  backend: {
    async start({ getConfig, window }) {
      const config = await getConfig();
      const basePath = app.isPackaged
        ? process.resourcesPath
        : path.join(__dirname, '../../../../');

      const extensionPath = path.join(basePath, 'extensions', 'bl');

      console.log('Loading Better Lyrics from:', extensionPath);

      session.defaultSession.loadExtension(extensionPath)
        .then((ext) => {
          console.log('Better Lyrics loaded! ID:', ext.id);
          // Nếu ID in ra khác với ID bạn điền ở trên, hãy sửa lại biến EXTENSION_ID nhé
        })
        .catch((err) => {
          console.error('Failed to load Better Lyrics:', err);
        });

      if (config.enableV4Scroll !== false) {
        const jsPath = path.join(basePath, 'extensions', 'bl-scroll', 'v4.js');

        try {
          const jsCode = fs.readFileSync(jsPath, 'utf8');
          window.webContents.on('dom-ready', () => {
            window.webContents.executeJavaScript(jsCode).catch(console.error);
          });
        } catch (err) {
          console.error('Failed to load lyrics scroll script:', err);
        }
      }
    },
  },
});