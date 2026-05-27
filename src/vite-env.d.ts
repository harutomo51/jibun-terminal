/// <reference types="vite/client" />

import type { TerminalBridgeApi } from '../electron/terminal/types';
import type { FileTreeBridgeApi } from '../electron/fileTree/types';
import type { FilePreviewBridgeApi } from '../electron/filePreview/types';
import type { AppearanceBridgeApi } from '../electron/appearance/types';

declare global {
  interface Window {
    terminalApi?: TerminalBridgeApi;
    fileTreeApi?: FileTreeBridgeApi;
    filePreviewApi?: FilePreviewBridgeApi;
    appearanceApi?: AppearanceBridgeApi;
  }
}
