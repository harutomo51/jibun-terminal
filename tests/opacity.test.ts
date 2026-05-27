import { describe, expect, it } from 'vitest';
import { normalizeOpacity } from '../src/lib/opacity';

describe('normalizeOpacity', () => {
  it('keeps opacity values inside the allowed range', () => {
    expect(normalizeOpacity(0.78)).toBe(0.78);
  });

  it('clamps values below the minimum', () => {
    expect(normalizeOpacity(0.1)).toBe(0.35);
  });

  it('clamps values above the maximum', () => {
    expect(normalizeOpacity(1.5)).toBe(1);
  });

  it('rounds to two decimals for slider-friendly values', () => {
    expect(normalizeOpacity(0.777)).toBe(0.78);
  });
});
