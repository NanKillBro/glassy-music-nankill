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
    lyricsScroll: 'spring',
  },
  // THÊM PHẦN NÀY: Tạo menu để mở cài đặt
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();

    return [
      {
        label: 'Lyrics Scroll (Restart Required)',
        submenu: [
          {
            label: 'Normal Smooth Scroll',
            type: 'radio',
            checked: config.lyricsScroll === 'normal',
            click: () => setConfig({ lyricsScroll: 'normal' }),
          },
          {
            label: 'Staggered Animation',
            type: 'radio',
            checked: config.lyricsScroll === 'staggered',
            click: () => setConfig({ lyricsScroll: 'staggered' }),
          },
          {
            label: 'Spring Scroll',
            type: 'radio',
            checked: config.lyricsScroll === 'spring' || !config.lyricsScroll,
            click: () => setConfig({ lyricsScroll: 'spring' }),
          },
        ],
      },
      {
        label: 'Open Settings',
        click: () => {
          // Tạo một cửa sổ popup mới
          const settingsWin = new BrowserWindow({
            width: 700,
            height: 700,
            autoHideMenuBar: true,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
            },
          });

          // Load trang options của extension
          // Lưu ý: options_ui/page.html là đường dẫn trong manifest bạn gửi
          const optionsUrl = `chrome-extension://${EXTENSION_ID}/options_ui/page.html`;

          settingsWin.loadURL(optionsUrl).catch((err) => {
            console.error('Cannot open settings page:', err);
            // Fallback nếu sai đường dẫn
            settingsWin.loadURL(`chrome-extension://${EXTENSION_ID}/action/default_popup.html`);
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

      if (config.lyricsScroll === 'staggered' || config.lyricsScroll === 'spring' || !config.lyricsScroll) {
        const isSpring = config.lyricsScroll === 'spring' || !config.lyricsScroll;
        const jsName = isSpring ? 'v2.js' : 'v1.js';
        const jsPath = path.join(basePath, 'extensions', 'bl-scroll', jsName);

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