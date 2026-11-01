const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktopLyrics', {
  action: (action) => ipcRenderer.send('glassy-desktop-lyrics-action', action),
  onUpdate: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('glassy-desktop-lyrics-update', listener);
    return () =>
      ipcRenderer.removeListener('glassy-desktop-lyrics-update', listener);
  },
});
