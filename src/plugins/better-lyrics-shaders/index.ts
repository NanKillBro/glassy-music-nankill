import { session, app } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';
import { t } from '@/i18n'; // Import nếu muốn dùng đa ngôn ngữ, không thì hardcode string cũng được

// 1. Định nghĩa kiểu dữ liệu cho Config
export type BetterLyricsShadersConfig = {
  enabled: boolean;
  lowPerformanceMode: boolean; // Option mới
};

export default createPlugin({
  name: () => 'Better Lyrics Shaders',
  description: () => 'Adds shader effects to lyrics background',
  // 2. Bắt buộc phải restart vì extension chỉ load được khi khởi động session
  restartNeeded: true, 
  
  // 3. Config mặc định
  config: {
    enabled: true,
    lowPerformanceMode: false,
  } as BetterLyricsShadersConfig,

  // 4. Tạo Menu trong Settings
  menu: async ({ getConfig, setConfig }) => {
    const config = await getConfig();
    return [
      {
        label: 'Low Performance Mode (For Weak PC / Restart Required)',
        type: 'checkbox',
        checked: config.lowPerformanceMode,
        click: (item) => {
          // Lưu config khi user tick vào
          setConfig({ lowPerformanceMode: item.checked });
        },
      },
    ];
  },

  backend: {
    // 5. Sửa backend để đọc config và chọn folder
    async start({ getConfig }) {
      const config = await getConfig(); // Lấy config hiện tại
      
      const basePath = app.isPackaged 
        ? process.resourcesPath 
        : path.join(__dirname, '../../../../');

      // Logic chọn folder dựa trên config
      // Nếu lowPerformanceMode = true -> bls-low, ngược lại -> bls
      const folderName = config.lowPerformanceMode ? 'bls-low' : 'bls';
      const extensionPath = path.join(basePath, 'extensions', folderName);
      
      console.log(`Loading Better Lyrics Shaders (${folderName}) from:`, extensionPath);

      if (config.enabled) {
        session.defaultSession.loadExtension(extensionPath)
          .then((ext) => {
            console.log(`Better Lyrics Shaders (${folderName}) loaded! ID:`, ext.id);
          })
          .catch((err) => {
            console.error(`Failed to load Better Lyrics Shaders (${folderName}):`, err);
          });
      }
    },
  },
});