export const SIDE_PANEL_MIN_WIDTH = 220;
export const SIDE_PANEL_DEFAULT_WIDTH = 300;
export const SIDE_PANEL_MIN_MAIN_WIDTH = 360;
const STORAGE_KEY = 'quarterdeck:side-panel-width';

export function clampSidePanelWidth(width: number, viewportWidth: number): number {
  if (!Number.isFinite(width)) {
    return SIDE_PANEL_DEFAULT_WIDTH;
  }

  const ceiling = Math.max(SIDE_PANEL_MIN_WIDTH, viewportWidth - SIDE_PANEL_MIN_MAIN_WIDTH);
  return Math.min(ceiling, Math.max(SIDE_PANEL_MIN_WIDTH, Math.round(width)));
}

export function loadSidePanelWidth(): number {
  if (typeof window === 'undefined') {
    return SIDE_PANEL_DEFAULT_WIDTH;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return SIDE_PANEL_DEFAULT_WIDTH;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      return SIDE_PANEL_DEFAULT_WIDTH;
    }

    return clampSidePanelWidth(parsed, window.innerWidth);
  } catch (error) {
    console.warn('Failed to read side panel width from storage', error);
    return SIDE_PANEL_DEFAULT_WIDTH;
  }
}

export function saveSidePanelWidth(width: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, String(Math.round(width)));
  } catch (error) {
    console.warn('Failed to persist side panel width', error);
  }
}
