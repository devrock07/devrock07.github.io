import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { createPixelCursors } from '../lib/pixel-cursors.mjs';

function decodeCursor(cursor) {
  const match = cursor.match(
    /^url\("data:image\/svg\+xml,([^"]+)"\) (\d+) (\d+), (default|pointer|text)$/,
  );
  assert.ok(match, 'Native cursor must include a hotspot and fallback');
  return {
    svg: decodeURIComponent(match[1]),
    x: Number(match[2]),
    y: Number(match[3]),
    kind: match[4],
  };
}

test('three distinct, compact 24px SVG cursors have correctly placed hotspots', () => {
  const cursors = createPixelCursors(92);
  assert.deepEqual(Object.keys(cursors), [
    '--cursor-default',
    '--cursor-pointer',
    '--cursor-text',
  ]);
  const expectedHotspots = {
    default: [0, 0],
    pointer: [9, 0],
    text: [9, 11],
  };
  const images = new Set();
  for (const cursor of Object.values(cursors)) {
    const { svg, x, y, kind } = decodeCursor(cursor);
    assert.deepEqual([x, y], expectedHotspots[kind]);
    assert.match(svg, /width="24" height="24" viewBox="0 0 16 16"/);
    assert.match(svg, /shape-rendering="crispEdges"/);
    assert.doesNotMatch(svg, /<script|<foreignObject|<animate|var\(/);
    assert.equal((svg.match(/<path /g) ?? []).length, 2);
    images.add(svg);
  }
  assert.equal(images.size, 3);
});

test('all hue positions match the site accent in night and paper themes', () => {
  const previous = { night: new Set(), paper: new Set() };
  for (let hue = 0; hue < 360; hue += 1) {
    for (const paper of [false, true]) {
      const cursors = createPixelCursors(hue, paper);
      for (const cursor of Object.values(cursors)) {
        const { svg } = decodeCursor(cursor);
        assert.ok(
          svg.includes(
            `fill="oklch(${paper ? '50% 0.12' : '76% 0.15'} ${hue}deg)"`,
          ),
        );
        assert.ok(svg.includes(`fill="${paper ? '#1c211f' : '#eee7d8'}"`));
      }
      previous[paper ? 'paper' : 'night'].add(cursors['--cursor-default']);
    }
  }
  assert.equal(previous.night.size, 360);
  assert.equal(previous.paper.size, 360);
});

test('invalid hue values cannot leak into SVG paint or markup', () => {
  for (const hue of [NaN, Infinity, undefined, null, '<script>', '92']) {
    assert.deepEqual(createPixelCursors(hue), createPixelCursors(92));
  }
  assert.deepEqual(createPixelCursors(-1), createPixelCursors(0));
  assert.deepEqual(createPixelCursors(999), createPixelCursors(359));
  assert.deepEqual(createPixelCursors(123.6), createPixelCursors(124));
});

test('accent-filled surfaces use contrasting cursor outlines at every hue', () => {
  for (let hue = 0; hue < 360; hue += 1) {
    for (const paper of [false, true]) {
      const standard = createPixelCursors(hue, paper);
      const onAccent = createPixelCursors(hue, paper, true);
      assert.equal(Object.keys(onAccent).length, 3);
      for (const kind of ['default', 'pointer', 'text']) {
        const normal = decodeCursor(standard[`--cursor-${kind}`]);
        const contrast = decodeCursor(onAccent[`--cursor-${kind}-on-accent`]);
        assert.deepEqual([contrast.x, contrast.y], [normal.x, normal.y]);
        assert.equal(
          contrast.svg,
          normal.svg.replace(
            paper ? '#1c211f' : '#eee7d8',
            paper ? '#eee7d8' : '#121514',
          ),
          'Only the outline changes; keep the compact shape and synced hue',
        );
      }
    }
  }
});

test('contact text selection reverses the surface colors, including link text', async () => {
  const css = await readFile(
    new URL('../app/globals.css', import.meta.url),
    'utf8',
  );
  assert.match(
    css,
    /\.contact::selection,\s*\.contact \*::selection\s*\{\s*background: var\(--on-clay\);\s*color: var\(--clay\);\s*\}/,
  );
  for (const kind of ['default', 'pointer', 'text']) {
    assert.ok(
      css.includes(`--cursor-${kind}: var(--cursor-${kind}-on-accent,`),
    );
  }
});

test('custom cursors are limited to fine pointers with native accessibility fallbacks', async () => {
  const css = await readFile(
    new URL('../app/globals.css', import.meta.url),
    'utf8',
  );
  const cursorRules = css.slice(
    css.indexOf(
      '@media (hover: hover) and (pointer: fine) and (forced-colors: none)',
    ),
  );
  assert.ok(cursorRules.includes('var(--cursor-default, auto)'));
  assert.ok(cursorRules.includes('var(--cursor-pointer, pointer)'));
  assert.ok(cursorRules.includes('var(--cursor-text, text)'));
  assert.match(cursorRules, /cursor: not-allowed/);
  assert.doesNotMatch(css, /cursor:\s*none/);
});
