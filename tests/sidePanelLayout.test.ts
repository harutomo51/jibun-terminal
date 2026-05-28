import { describe, expect, it } from 'vitest';
import {
  clampSidePanelWidth,
  SIDE_PANEL_DEFAULT_WIDTH,
  SIDE_PANEL_MIN_MAIN_WIDTH,
  SIDE_PANEL_MIN_WIDTH
} from '../src/lib/sidePanelLayout';

describe('clampSidePanelWidth', () => {
  it('clamps below the minimum width', () => {
    expect(clampSidePanelWidth(50, 1200)).toBe(SIDE_PANEL_MIN_WIDTH);
  });

  it('clamps above the available space so main panel keeps room', () => {
    const viewportWidth = 1200;
    expect(clampSidePanelWidth(1500, viewportWidth)).toBe(viewportWidth - SIDE_PANEL_MIN_MAIN_WIDTH);
  });

  it('returns the requested width when within bounds', () => {
    expect(clampSidePanelWidth(420, 1600)).toBe(420);
  });

  it('rounds to integer pixels', () => {
    expect(clampSidePanelWidth(380.6, 1600)).toBe(381);
  });

  it('falls back to default for non-finite input', () => {
    expect(clampSidePanelWidth(Number.NaN, 1600)).toBe(SIDE_PANEL_DEFAULT_WIDTH);
  });

  it('honours the minimum width even on tiny viewports', () => {
    expect(clampSidePanelWidth(400, 480)).toBe(SIDE_PANEL_MIN_WIDTH);
  });
});
