import { session, app } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';

export default createPlugin({
  name: () => 'Better Lyrics Shaders',
  restartNeeded: true,
  config: {
    enabled: true,
  },
  backend: {
    start() {
      const basePath = app.isPackaged 
        ? process.resourcesPath 
        : path.join(__dirname, '../../../../');

      const extensionPath = path.join(basePath, 'extensions', 'bls');
      
      console.log('Loading Better Lyrics Shaders from:', extensionPath);

      session.defaultSession.loadExtension(extensionPath)
        .then((ext) => {
          console.log('Better Lyrics Shaders loaded! ID:', ext.id);
        })
        .catch((err) => {
          console.error('Failed to load Better Lyrics Shaders:', err);
        });
    },
  },
});