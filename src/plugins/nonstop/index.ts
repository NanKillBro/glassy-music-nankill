import { session, app } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';

export default createPlugin({
  name: () => 'NonStop',
  restartNeeded: true,
  config: {
    enabled: true,
  },
  backend: {
    start() {
      const basePath = app.isPackaged
        ? process.resourcesPath
        : path.join(__dirname, '../../../../');

      const extensionPath = path.join(basePath, 'extensions', 'nt');

      console.log('Loading NonStop from:', extensionPath);

      session.defaultSession.loadExtension(extensionPath)
        .then((ext) => {
          console.log('NonStop loaded! ID:', ext.id);
        })
        .catch((err) => {
          console.error('Failed to load NonStop:', err);
        });
    },
  },
});