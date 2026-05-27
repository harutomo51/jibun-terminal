import type { FilePreviewBridgeApi } from '../../electron/filePreview/types';

export function getFilePreviewBridge(): FilePreviewBridgeApi {
  if (!window.filePreviewApi) {
    throw new Error('File preview preload API is unavailable.');
  }

  return window.filePreviewApi;
}
