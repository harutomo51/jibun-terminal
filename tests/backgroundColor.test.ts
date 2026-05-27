import { describe, expect, it } from 'vitest';
import { normalizeHexColor } from '../src/lib/backgroundColor';

describe('normalizeHexColor', () => {
  it('accepts a 6 digit hex color', () => {
    expect(normalizeHexColor('#2f6fed')).toBe('#2f6fed');
  });

  it('expands a 3 digit hex color', () => {
    expect(normalizeHexColor('#abc')).toBe('#aabbcc');
  });

  it('accepts a hex color without the leading hash', () => {
    expect(normalizeHexColor('0f172a')).toBe('#0f172a');
  });

  it('falls back when the value is not a hex color', () => {
    expect(normalizeHexColor('tomato', '#10131a')).toBe('#10131a');
  });
});
