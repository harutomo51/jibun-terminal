export const MIN_TERMINAL_OPACITY = 0.35;
export const MAX_TERMINAL_OPACITY = 1;

export function normalizeOpacity(value: number): number {
  const clamped = Math.min(MAX_TERMINAL_OPACITY, Math.max(MIN_TERMINAL_OPACITY, value));
  return Math.round(clamped * 100) / 100;
}
