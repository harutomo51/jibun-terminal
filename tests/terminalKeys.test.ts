import { describe, expect, it } from 'vitest';
import { shouldForwardTabToPty } from '../src/lib/terminalKeys';

describe('shouldForwardTabToPty', () => {
  it('forwards plain Tab to the PTY', () => {
    expect(shouldForwardTabToPty({ key: 'Tab', altKey: false, ctrlKey: false, metaKey: false })).toBe(true);
  });

  it('does not override modified Tab shortcuts', () => {
    expect(shouldForwardTabToPty({ key: 'Tab', altKey: false, ctrlKey: true, metaKey: false })).toBe(false);
    expect(shouldForwardTabToPty({ key: 'Tab', altKey: true, ctrlKey: false, metaKey: false })).toBe(false);
  });

  it('ignores other keys', () => {
    expect(shouldForwardTabToPty({ key: 'Enter', altKey: false, ctrlKey: false, metaKey: false })).toBe(false);
  });
});
