// A 16-tile drawing rendered as a compact 24px cursor. A is accent; X is outline.
const CURSOR_SIZE = 24;
const DRAWING_SIZE = 16;
const shapes = {
  default: {
    hotspot: [0, 0],
    rows: [
      'X',
      'XX',
      'XAX',
      'XAAX',
      'XAAAX',
      'XAAAAX',
      'XAAAAAX',
      'XAAAAAAX',
      'XAAAAAAAX',
      'XAAAAXXXXX',
      'XAAXAX',
      'XAX.AX',
      'XX..XAX',
      'X...XAX',
      '.....XX',
    ],
  },
  pointer: {
    hotspot: [6, 0],
    rows: [
      '.....XXX',
      '.....XAX',
      '.....XAX',
      '.....XAX',
      '.....XAXXXX',
      '.....XAXAXXX',
      '.XXX.XAXAXAXX',
      '.XAXXXAAAAAAX',
      '.XAAXAAAAAAAX',
      '..XAAAAAAAAAX',
      '...XAAAAAAAAX',
      '....XAAAAAAAX',
      '....XAAAAAAX',
      '.....XAAAAAX',
      '.....XXXXXXX',
    ],
  },
  text: {
    hotspot: [6, 7],
    rows: [
      '',
      '...XXX.XXX',
      '...XAXXXAX',
      '....XXAXX',
      '.....XAX',
      '.....XAX',
      '.....XAX',
      '.....XAX',
      '.....XAX',
      '.....XAX',
      '.....XAX',
      '....XXAXX',
      '...XAXXXAX',
      '...XXX.XXX',
    ],
  },
};

function tilePath(rows, tile) {
  return rows
    .flatMap((row, y) =>
      Array.from(row.matchAll(new RegExp(`${tile}+`, 'g')), (match) => {
        const width = match[0].length;
        return `M${match.index} ${y}h${width}v1h-${width}z`;
      }),
    )
    .join('');
}

const cursorPaths = Object.entries(shapes).map(([kind, shape]) => ({
  kind,
  hotspot: shape.hotspot
    .map((coordinate) => Math.round((coordinate * CURSOR_SIZE) / DRAWING_SIZE))
    .join(' '),
  outline: tilePath(shape.rows, 'X'),
  accent: tilePath(shape.rows, 'A'),
}));

export function createPixelCursors(accentHue, paperMode = false) {
  const hue = Number.isFinite(accentHue)
    ? Math.max(0, Math.min(359, Math.round(accentHue)))
    : 92;
  // Literal colors are necessary: standalone SVG images cannot inherit CSS vars.
  const accent = paperMode
    ? `oklch(50% 0.12 ${hue}deg)`
    : `oklch(76% 0.15 ${hue}deg)`;
  const outline = paperMode ? '#1c211f' : '#eee7d8';

  return Object.fromEntries(
    cursorPaths.map(
      ({ kind, hotspot, outline: edgePath, accent: fillPath }) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CURSOR_SIZE}" height="${CURSOR_SIZE}" viewBox="0 0 ${DRAWING_SIZE} ${DRAWING_SIZE}" shape-rendering="crispEdges"><path fill="${outline}" d="${edgePath}"/><path fill="${accent}" d="${fillPath}"/></svg>`;
        return [
          `--cursor-${kind}`,
          `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspot}, ${kind}`,
        ];
      },
    ),
  );
}
