'use strict';

/**
 * Preload — exposes only the typed DesktopBridgeApi surface.
 * Never expose ipcRenderer or Node APIs to the renderer.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('senbilanDesktop', {
  minimize: () => ipcRenderer.invoke('desktop:minimize'),
  maximize: () => ipcRenderer.invoke('desktop:maximize'),
  close: () => ipcRenderer.invoke('desktop:close'),
  openExternal: (url) => ipcRenderer.invoke('desktop:openExternal', url),
});
