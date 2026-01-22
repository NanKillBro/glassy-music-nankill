import { session, app } from 'electron';
import path from 'path';
import { createPlugin } from '@/utils';

export default createPlugin({
  name: () => 'Youtube NonStop',
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
      
      console.log('Loading Youtube NonStop from:', extensionPath);

      session.defaultSession.loadExtension(extensionPath)
        .then((ext) => {
          console.log('Youtube NonStoploaded! ID:', ext.id);
        })
        .catch((err) => {
          console.error('Failed to load Youtube NonStop:', err);
        });
    },
  },
});