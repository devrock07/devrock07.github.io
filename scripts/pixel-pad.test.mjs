import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createPixelPadState,
  pixelPadReducer,
  PIXEL_PAD_COLUMNS,
  PIXEL_PAD_ROWS,
  tracePixelLine,
} from '../lib/pixel-pad.mjs';

test('the initial doodle has 160 independently editable pixels', () => {
  const first = createPixelPadState();
  const second = createPixelPadState();
  assert.equal(first.pixels.length, PIXEL_PAD_COLUMNS * PIXEL_PAD_ROWS);
  assert.ok(first.pixels.some(Boolean));
  assert.ok(first.pixels.some((filled) => !filled));
  assert.deepEqual(first, second);
  assert.notEqual(first.pixels, second.pixels);
});

test('fast strokes are continuous in either direction', () => {
  for (const [from, to] of [
    [
      { x: 0, y: 0 },
      { x: 15, y: 9 },
    ],
    [
      { x: 15, y: 9 },
      { x: 0, y: 0 },
    ],
    [
      { x: 4, y: 0 },
      { x: 4, y: 9 },
    ],
    [
      { x: 0, y: 2 },
      { x: 15, y: 2 },
    ],
  ]) {
    const line = tracePixelLine(from, to);
    assert.deepEqual(line[0], from);
    assert.deepEqual(line.at(-1), to);
    assert.equal(
      line.length,
      Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) + 1,
    );
    line.slice(1).forEach((point, index) => {
      assert.ok(Math.abs(point.x - line[index].x) <= 1);
      assert.ok(Math.abs(point.y - line[index].y) <= 1);
    });
  }
});

test('one undo restores the entire pointer stroke', () => {
  const before = pixelPadReducer(createPixelPadState(), { type: 'clear' });
  let state = pixelPadReducer(before, {
    type: 'begin',
    point: { x: 0, y: 0 },
    filled: true,
  });
  state = pixelPadReducer(state, {
    type: 'paint',
    from: { x: 0, y: 0 },
    to: { x: 15, y: 0 },
    filled: true,
  });
  state = pixelPadReducer(state, {
    type: 'paint',
    from: { x: 15, y: 0 },
    to: { x: 15, y: 9 },
    filled: true,
  });
  state = pixelPadReducer(state, { type: 'finish' });
  assert.equal(state.pixels.filter(Boolean).length, 25);
  assert.equal(state.history.length, before.history.length + 1);
  assert.deepEqual(
    pixelPadReducer(state, { type: 'undo' }).pixels,
    before.pixels,
  );
});

test('erasing and clearing can both be undone without mutating old state', () => {
  const initial = createPixelPadState();
  const original = [...initial.pixels];
  const index = initial.pixels.findIndex(Boolean);
  const point = {
    x: index % PIXEL_PAD_COLUMNS,
    y: Math.floor(index / PIXEL_PAD_COLUMNS),
  };
  let state = pixelPadReducer(initial, { type: 'begin', point, filled: false });
  state = pixelPadReducer(state, { type: 'finish' });
  assert.equal(state.pixels[index], false);
  assert.deepEqual(initial.pixels, original);
  assert.deepEqual(pixelPadReducer(state, { type: 'undo' }).pixels, original);
  const cleared = pixelPadReducer(state, { type: 'clear' });
  assert.ok(cleared.pixels.every((filled) => !filled));
  assert.deepEqual(
    pixelPadReducer(cleared, { type: 'undo' }).pixels,
    state.pixels,
  );
});

test('unchanged strokes do not consume undo history', () => {
  const state = createPixelPadState();
  const same = pixelPadReducer(
    pixelPadReducer(state, {
      type: 'begin',
      point: { x: 0, y: 0 },
      filled: false,
    }),
    { type: 'finish' },
  );
  assert.deepEqual(same, state);
});

test('keyboard pixel toggles are individually undoable and history is bounded', () => {
  let state = createPixelPadState();
  const point = { x: 0, y: 0 };
  state = pixelPadReducer(state, { type: 'toggle', point });
  assert.equal(state.pixels[0], true);
  assert.equal(pixelPadReducer(state, { type: 'undo' }).pixels[0], false);
  for (let index = 0; index < 80; index += 1)
    state = pixelPadReducer(state, { type: 'toggle', point });
  assert.equal(state.history.length, 32);
});

test('invalid points and paint without an active stroke do not modify the drawing', () => {
  const state = createPixelPadState();
  for (const point of [
    { x: -1, y: 0 },
    { x: 16, y: 0 },
    { x: 0, y: 10 },
    { x: NaN, y: 0 },
    { x: 0.5, y: 0 },
  ]) {
    assert.deepEqual(tracePixelLine(point, { x: 0, y: 0 }), []);
    assert.equal(pixelPadReducer(state, { type: 'toggle', point }), state);
  }
  assert.equal(
    pixelPadReducer(state, {
      type: 'paint',
      from: { x: 0, y: 0 },
      to: { x: 1, y: 0 },
      filled: true,
    }),
    state,
  );
});
