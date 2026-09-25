'use strict';

/**
 * Electron main process for desktop.
 * Security: contextIsolation + sandbox + no nodeIntegration.
 * Renderer is the Angular web app (dev URL or packaged dist).
 */
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;
const DEV_URL = process.env.SENBILAN_DESKTOP_URL || 'http://localhost:4200';

/** @type {BrowserWindow | null} */
let mainWindow = null;

const ALLOWED_EXTERNAL = /^(https?:|mailto:)/i;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    title: 'Senbilan Manage',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (ALLOWED_EXTERNAL.test(url)) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (isDev) {
    void mainWindow.loadURL(DEV_URL);
  } else {
    const indexHtml = path.join(__dirname, '../../../dist/apps/web/browser/index.html');
    void mainWindow.loadFile(indexHtml);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const registerIpc = () => {
  ipcMain.handle('desktop:minimize', () => {
    mainWindow?.minimize();
  });
  ipcMain.handle('desktop:maximize', () => {
    if (!mainWindow) {
      return;
    }
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle('desktop:close', () => {
    mainWindow?.close();
  });
  ipcMain.handle('desktop:openExternal', async (_event, url) => {
    if (typeof url !== 'string' || !ALLOWED_EXTERNAL.test(url)) {
      throw new Error('Blocked external URL');
    }
    await shell.openExternal(url);
  });
};

app.whenReady().then(() => {
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
