import { session, app, BrowserWindow } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';

// ID này lấy từ manifest key bạn cung cấp, hoặc bạn xem log cũ (mjfeakl...)
// Nếu build xong mở không lên thì check log xem ID thực tế là gì rồi thay vào đây
const EXTENSION_ID = 'effdbpeggelllpfkjppbokhmmiinhlmg'; 

export default createPlugin({
  name: () => 'Better Lyrics',
  restartNeeded: true,
  config: {
    enabled: true,
  },
  // THÊM PHẦN NÀY: Tạo menu để mở cài đặt
  menu: async () => {
    return [
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
    start() {
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
    },
  },
});