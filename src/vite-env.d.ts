/// <reference types="vite/client" />

import type { TerminalBridgeApi } from '../electron/terminal/types';

declare global {
  interface Window {
    terminalApi?: TerminalBridgeApi;
  }
}
