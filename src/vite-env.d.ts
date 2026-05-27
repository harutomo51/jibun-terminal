/// <reference types="vite/client" />

import type { TerminalBridgeApi } from '../electron/terminal/types';
import type { FileTreeBridgeApi } from '../electron/fileTree/types';

declare global {
  interface Window {
    terminalApi?: TerminalBridgeApi;
    fileTreeApi?: FileTreeBridgeApi;
  }
}
