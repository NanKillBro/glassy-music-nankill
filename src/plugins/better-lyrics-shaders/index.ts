import { session, app } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';

// 1. Định nghĩa kiểu dữ liệu cho Config (Chỉ giữ lại enabled)
export type BetterLyricsShadersConfig = {
  enabled: boolean;
};

export default createPlugin({
  name: () => 'Better Lyrics Shaders',
  description: () => 'Adds shader effects to lyrics background',
  restartNeeded: false,

  // 2. Config mặc định
  config: {
    enabled: true,
  } as BetterLyricsShadersConfig,

  backend: {
    // 3. Sửa backend để luôn đọc folder 'bls'
    async start({ getConfig }) {
      const config = await getConfig();

      const basePath = app.isPackaged
        ? process.resourcesPath
        : path.join(__dirname, '../../../../');

      // Cố định thư mục là 'bls'
      const extensionPath = path.join(basePath, 'extensions', 'bls');

      console.log(`Loading Better Lyrics Shaders from:`, extensionPath);

      if (config.enabled) {
        session.defaultSession.loadExtension(extensionPath)
          .then((ext) => {
            console.log(`Better Lyrics Shaders loaded! ID:`, ext.id);
          })
          .catch((err) => {
            console.error(`Failed to load Better Lyrics Shaders:`, err);
          });
      }
    },
  },
});