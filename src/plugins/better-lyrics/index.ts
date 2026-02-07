import { session, app, BrowserWindow } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';

// ID này lấy từ manifest key bạn cung cấp
const EXTENSION_ID = 'effdbpeggelllpfkjppbokhmmiinhlmg'; 

// Định nghĩa kiểu dữ liệu cho Config để code rõ ràng hơn
export type BetterLyricsConfig = {
  enabled: boolean;
  useAlternativeFade: boolean; // Option mới
};

export default createPlugin({
  name: () => 'Better Lyrics',
  restartNeeded: true, // Bắt buộc restart khi đổi folder extension
  
  // Config mặc định
  config: {
    enabled: true,
    useAlternativeFade: false,
  } as BetterLyricsConfig,

  // Menu cài đặt
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();
    
    return [
      {
        // Checkbox cho tùy chọn mới
        label: 'Alternative Fade Method (Fix visual issues / Restart Required)',
        type: 'checkbox',
        checked: config.useAlternativeFade,
        click: (item) => {
          // Lưu config khi user tick vào
          setConfig({ useAlternativeFade: item.checked });
        },
      },
      {
        // Nút mở Settings cũ của bạn
        label: 'Open Settings',
        click: () => {
          const settingsWin = new BrowserWindow({
            width: 700,
            height: 700,
            autoHideMenuBar: true,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
            },
          });

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
    // Chuyển thành async để lấy config
    async start({ getConfig }) {
      const config = await getConfig();

      const basePath = app.isPackaged 
        ? process.resourcesPath 
        : path.join(__dirname, '../../../../');

      // LOGIC CHÍNH: Chọn folder dựa trên config
      // Nếu useAlternativeFade = true -> dùng 'bl-m2', ngược lại -> dùng 'bl'
      const folderName = config.useAlternativeFade ? 'bl-m2' : 'bl';
      
      const extensionPath = path.join(basePath, 'extensions', folderName);
      
      console.log(`Loading Better Lyrics (${folderName}) from:`, extensionPath);

      if (config.enabled) {
        session.defaultSession.loadExtension(extensionPath)
          .then((ext) => {
            console.log(`Better Lyrics (${folderName}) loaded! ID:`, ext.id);
            // Lưu ý: ID của 2 thư mục phải giống nhau trong manifest.json để settings không bị reset
          })
          .catch((err) => {
            console.error(`Failed to load Better Lyrics (${folderName}):`, err);
          });
      }
    },
  },
});