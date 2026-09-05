import { PIXEL_PAD_COLUMNS, PIXEL_PAD_ROWS } from './pixel-pad.mjs';

export const PIXEL_PAD_STORAGE_KEY = 'devrock:pixel-pad:v1';

const PIXEL_COUNT = PIXEL_PAD_COLUMNS * PIXEL_PAD_ROWS;

/**
 * Only the drawing is saved. Undo history, theme and personal data stay out.
 * @param {unknown} pixels
 * @returns {string | null}
 */
export function serializePixelDrawing(pixels) {
  if (
    !Array.isArray(pixels) ||
    pixels.length !== PIXEL_COUNT ||
    !Array.from(pixels).every((pixel) => typeof pixel === 'boolean')
  ) {
    return null;
  }

  return JSON.stringify({
    version: 1,
    columns: PIXEL_PAD_COLUMNS,
    rows: PIXEL_PAD_ROWS,
    pixels: pixels.map((pixel) => (pixel ? '1' : '0')).join(''),
  });
}

/**
 * Reject unrelated versions, malformed payloads and differently sized grids.
 * @param {unknown} value
 * @returns {boolean[] | null}
 */
export function parsePixelDrawing(value) {
  if (typeof value !== 'string' || value.length > 1024) return null;

  try {
    const drawing = JSON.parse(value);
    if (
      !drawing ||
      typeof drawing !== 'object' ||
      Array.isArray(drawing) ||
      drawing.version !== 1 ||
      drawing.columns !== PIXEL_PAD_COLUMNS ||
      drawing.rows !== PIXEL_PAD_ROWS ||
      typeof drawing.pixels !== 'string' ||
      drawing.pixels.length !== PIXEL_COUNT ||
      /[^01]/.test(drawing.pixels)
    ) {
      return null;
    }

    return drawing.pixels.split('').map((pixel) => pixel === '1');
  } catch {
    return null;
  }
}
