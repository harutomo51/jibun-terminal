import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { readFileTree } from './fileTree/fileTree';
import { FILE_TREE_CHANNELS } from './fileTree/types';
import { PtyManager } from './terminal/ptyManager';
import { TERMINAL_CHANNELS, type TerminalResizePayload } from './terminal/types';

let mainWindow: BrowserWindow | null = null;
const ptyManager = new PtyManager();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 780,
    minHeight: 480,
    title: 'fun-terminal-win11',
    backgroundColor: '#10131a',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  ptyManager.onData((data) => {
    mainWindow?.webContents.send(TERMINAL_CHANNELS.onData, data);
  });

  ptyManager.onExit((payload) => {
    mainWindow?.webContents.send(TERMINAL_CHANNELS.onExit, payload);
  });

  ptyManager.onCwdChange((payload) => {
    mainWindow?.webContents.send(TERMINAL_CHANNELS.onCwdChange, payload);
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    ptyManager.dispose();
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  ptyManager.dispose();
});

app.on('window-all-closed', () => {
  ptyManager.dispose();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers(): void {
  ipcMain.handle(FILE_TREE_CHANNELS.list, () => readFileTree(ptyManager.getCurrentCwd()));
  ipcMain.handle(TERMINAL_CHANNELS.start, () => ptyManager.start());
  ipcMain.handle(TERMINAL_CHANNELS.restart, () => ptyManager.restart());
  ipcMain.handle(TERMINAL_CHANNELS.input, (_event, data: string) => {
    try {
      ptyManager.write(data);
    } catch (error) {
      console.error('Failed to write PTY input', error);
      throw error;
    }
  });
  ipcMain.handle(TERMINAL_CHANNELS.resize, (_event, payload: TerminalResizePayload) => {
    try {
      ptyManager.resize(payload);
    } catch (error) {
      console.error('Failed to resize PTY', error);
      throw error;
    }
  });
}
