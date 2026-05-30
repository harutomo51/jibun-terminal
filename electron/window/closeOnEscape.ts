import type { BrowserWindow } from 'electron';

/**
 * Closes the given window when the Escape key is pressed.
 * Uses `before-input-event` so it works without page scripts or relaxed CSP.
 */
export function closeWindowOnEscape(window: BrowserWindow): void {
  window.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && input.key === 'Escape') {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
  });
}
