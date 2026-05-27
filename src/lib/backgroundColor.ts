const HEX_COLOR_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHexColor(value: string, fallback = '#10131a'): string {
  const match = value.trim().match(HEX_COLOR_PATTERN);
  if (!match) {
    return fallback;
  }

  const hex = match[1].toLowerCase();
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  return `#${hex}`;
}
