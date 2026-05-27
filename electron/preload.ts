import { contextBridge, ipcRenderer } from 'electron';
import { FILE_PREVIEW_CHANNELS, type FilePreviewBridgeApi, type FilePreviewOpenResult } from './filePreview/types';
import { FILE_TREE_CHANNELS, type FileTreeBridgeApi, type FileTreeResult } from './fileTree/types';
import { TERMINAL_CHANNELS, type TerminalBridgeApi, type TerminalCwdChangePayload, type TerminalExitPayload, type TerminalResizePayload, type TerminalStartResult } from './terminal/types';

const terminalApi: TerminalBridgeApi = {
  start: () => ipcRenderer.invoke(TERMINAL_CHANNELS.start) as Promise<TerminalStartResult>,
  input: (data: string) => ipcRenderer.invoke(TERMINAL_CHANNELS.input, data) as Promise<void>,
  resize: (payload: TerminalResizePayload) => ipcRenderer.invoke(TERMINAL_CHANNELS.resize, payload) as Promise<void>,
  restart: () => ipcRenderer.invoke(TERMINAL_CHANNELS.restart) as Promise<TerminalStartResult>,
  onData: (callback: (data: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: string) => callback(data);
    ipcRenderer.on(TERMINAL_CHANNELS.onData, listener);
    return () => ipcRenderer.off(TERMINAL_CHANNELS.onData, listener);
  },
  onExit: (callback: (payload: TerminalExitPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: TerminalExitPayload) => callback(payload);
    ipcRenderer.on(TERMINAL_CHANNELS.onExit, listener);
    return () => ipcRenderer.off(TERMINAL_CHANNELS.onExit, listener);
  },
  onCwdChange: (callback: (payload: TerminalCwdChangePayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: TerminalCwdChangePayload) => callback(payload);
    ipcRenderer.on(TERMINAL_CHANNELS.onCwdChange, listener);
    return () => ipcRenderer.off(TERMINAL_CHANNELS.onCwdChange, listener);
  }
};

const fileTreeApi: FileTreeBridgeApi = {
  list: () => ipcRenderer.invoke(FILE_TREE_CHANNELS.list) as Promise<FileTreeResult>
};

const filePreviewApi: FilePreviewBridgeApi = {
  open: (relativePath: string) => ipcRenderer.invoke(FILE_PREVIEW_CHANNELS.open, relativePath) as Promise<FilePreviewOpenResult>
};

contextBridge.exposeInMainWorld('terminalApi', terminalApi);
contextBridge.exposeInMainWorld('fileTreeApi', fileTreeApi);
contextBridge.exposeInMainWorld('filePreviewApi', filePreviewApi);
