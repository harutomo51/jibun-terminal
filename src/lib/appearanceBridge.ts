import type { AppearanceBridgeApi } from '../../electron/appearance/types';

export function getAppearanceBridge(): AppearanceBridgeApi {
  if (!window.appearanceApi) {
    throw new Error('Appearance preload API is unavailable.');
  }

  return window.appearanceApi;
}
