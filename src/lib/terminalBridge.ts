import type { TerminalBridgeApi } from '../../electron/terminal/types';

export function getTerminalBridge(): TerminalBridgeApi {
  if (!window.terminalApi) {
    throw new Error('Terminal preload API is unavailable.');
  }

  return window.terminalApi;
}
