export const PIXEL_PAD_COLUMNS = 16;
export const PIXEL_PAD_ROWS = 10;

const INITIAL_DRAWING = [
  '................',
  '....#......#....',
  '....##....##....',
  '....########....',
  '...##########...',
  '...##.####.##...',
  '...####..####...',
  '....########....',
  '......####......',
  '................',
];

/** @typedef {{ x: number, y: number }} PixelPoint */
/** @typedef {{ pixels: boolean[], history: boolean[][], strokeStart: boolean[] | null }} PixelPadState */
/**
 * @typedef {{ type: 'begin', point: PixelPoint, filled: boolean }
 *   | { type: 'paint', from: PixelPoint, to: PixelPoint, filled: boolean }
 *   | { type: 'finish' }
 *   | { type: 'toggle', point: PixelPoint }
 *   | { type: 'clear' }
 *   | { type: 'undo' }
 * } PixelPadAction
 */

/** @returns {PixelPadState} */
export function createPixelPadState() {
  return {
    pixels: INITIAL_DRAWING.join('')
      .split('')
      .map((pixel) => pixel === '#'),
    history: [],
    strokeStart: null,
  };
}

/** @param {PixelPoint} point */
function isInside(point) {
  return (
    Number.isInteger(point.x) &&
    Number.isInteger(point.y) &&
    point.x >= 0 &&
    point.x < PIXEL_PAD_COLUMNS &&
    point.y >= 0 &&
    point.y < PIXEL_PAD_ROWS
  );
}

/**
 * Fill between pointer samples so a quick stroke does not leave gaps.
 * @param {PixelPoint} from
 * @param {PixelPoint} to
 * @returns {PixelPoint[]}
 */
export function tracePixelLine(from, to) {
  if (!isInside(from) || !isInside(to)) return [];

  const points = [];
  let { x, y } = from;
  const dx = Math.abs(to.x - x);
  const dy = -Math.abs(to.y - y);
  const stepX = x < to.x ? 1 : -1;
  const stepY = y < to.y ? 1 : -1;
  let error = dx + dy;

  while (true) {
    points.push({ x, y });
    if (x === to.x && y === to.y) return points;
    const doubledError = 2 * error;
    if (doubledError >= dy) {
      error += dy;
      x += stepX;
    }
    if (doubledError <= dx) {
      error += dx;
      y += stepY;
    }
  }
}

/** @param {boolean[]} pixels @param {PixelPoint[]} points @param {boolean} filled */
function paint(pixels, points, filled) {
  const indices = points
    .filter(isInside)
    .map(({ x, y }) => y * PIXEL_PAD_COLUMNS + x);
  if (indices.every((index) => pixels[index] === filled)) return pixels;
  const next = [...pixels];
  for (const index of indices) next[index] = filled;
  return next;
}

/** @param {PixelPadState} state @param {boolean[]} pixels */
function commit(state, pixels) {
  if (pixels.every((pixel, index) => pixel === state.pixels[index]))
    return state;
  return {
    pixels,
    history: [...state.history, state.pixels].slice(-32),
    strokeStart: null,
  };
}

/** @param {PixelPadState} state @returns {PixelPadState} */
function finishStroke(state) {
  if (!state.strokeStart) return state;
  return commit(
    { ...state, pixels: state.strokeStart, strokeStart: null },
    state.pixels,
  );
}

/** @param {PixelPadState} state @param {PixelPadAction} action @returns {PixelPadState} */
export function pixelPadReducer(state, action) {
  switch (action.type) {
    case 'begin': {
      const finished = finishStroke(state);
      return {
        ...finished,
        strokeStart: finished.pixels,
        pixels: paint(finished.pixels, [action.point], action.filled),
      };
    }
    case 'paint':
      return state.strokeStart
        ? {
            ...state,
            pixels: paint(
              state.pixels,
              tracePixelLine(action.from, action.to),
              action.filled,
            ),
          }
        : state;
    case 'finish':
      return finishStroke(state);
    case 'toggle': {
      if (!isInside(action.point)) return state;
      const finished = finishStroke(state);
      const index = action.point.y * PIXEL_PAD_COLUMNS + action.point.x;
      return commit(
        finished,
        paint(finished.pixels, [action.point], !finished.pixels[index]),
      );
    }
    case 'clear':
      return commit(
        finishStroke(state),
        Array(PIXEL_PAD_COLUMNS * PIXEL_PAD_ROWS).fill(false),
      );
    case 'undo': {
      const finished = finishStroke(state);
      const previous = finished.history.at(-1);
      return previous
        ? {
            pixels: previous,
            history: finished.history.slice(0, -1),
            strokeStart: null,
          }
        : finished;
    }
    default:
      return state;
  }
}
