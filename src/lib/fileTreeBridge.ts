import type { FileTreeBridgeApi } from '../../electron/fileTree/types';

export function getFileTreeBridge(): FileTreeBridgeApi {
  if (!window.fileTreeApi) {
    throw new Error('File tree preload API is unavailable.');
  }

  return window.fileTreeApi;
}
