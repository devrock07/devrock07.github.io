export const DEFAULT_ACCENT_HUE = 92;
export const THEME_STORAGE_KEY = 'dev-bhakat-theme';
export const ACCENT_STORAGE_KEY = 'dev-bhakat-accent-hue';

export function parseStoredAccentHue(value: string | null) {
  if (value === null || value.trim() === '') return DEFAULT_ACCENT_HUE;

  const hue = Number(value);
  return Number.isFinite(hue) && hue >= 0 && hue <= 359
    ? Math.round(hue)
    : DEFAULT_ACCENT_HUE;
}
