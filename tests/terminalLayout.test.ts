import { describe, expect, it } from 'vitest';
import {
  collectTerminalPaneIds,
  createInitialTerminalLayout,
  removeTerminalPane,
  splitTerminalPane
} from '../src/lib/terminalLayout';

describe('terminal layout tree', () => {
  it('splits only the targeted pane', () => {
    const first = splitTerminalPane(createInitialTerminalLayout('pane-1'), 'pane-1', 'pane-2', 'vertical');
    const second = splitTerminalPane(first, 'pane-2', 'pane-3', 'horizontal');

    expect(second).toEqual({
      type: 'split',
      direction: 'vertical',
      children: [
        { type: 'pane', paneId: 'pane-1' },
        {
          type: 'split',
          direction: 'horizontal',
          children: [
            { type: 'pane', paneId: 'pane-2' },
            { type: 'pane', paneId: 'pane-3' }
          ]
        }
      ]
    });
  });

  it('collapses the sibling when a pane is removed', () => {
    const layout = splitTerminalPane(createInitialTerminalLayout('pane-1'), 'pane-1', 'pane-2', 'vertical');

    expect(removeTerminalPane(layout, 'pane-2')).toEqual({ type: 'pane', paneId: 'pane-1' });
  });

  it('collects pane ids in visual order', () => {
    const layout = splitTerminalPane(
      splitTerminalPane(createInitialTerminalLayout('pane-1'), 'pane-1', 'pane-2', 'vertical'),
      'pane-1',
      'pane-3',
      'horizontal'
    );

    expect(collectTerminalPaneIds(layout)).toEqual(['pane-1', 'pane-3', 'pane-2']);
  });
});
