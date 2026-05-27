import { describe, expect, it } from 'vitest';
import { APPEARANCE_CHANNELS, type AppearanceCommand } from '../electron/appearance/types';

describe('APPEARANCE_CHANNELS', () => {
  it('keeps appearance menu IPC channel names explicit and stable', () => {
    expect(APPEARANCE_CHANNELS).toEqual({
      onCommand: 'appearance:onCommand'
    });
  });
});

describe('AppearanceCommand', () => {
  it('supports opening the panel and cycling backgrounds from the File menu', () => {
    const commands: AppearanceCommand[] = ['open-settings', 'cycle-background'];

    expect(commands).toContain('open-settings');
    expect(commands).toContain('cycle-background');
  });
});
