import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createPixelPadState } from '../lib/pixel-pad.mjs';
import {
  parsePixelDrawing,
  PIXEL_PAD_STORAGE_KEY,
  serializePixelDrawing,
} from '../lib/pixel-pad-storage.mjs';

test('pixel drawings round-trip through a versioned local payload', () => {
  const pixels = createPixelPadState().pixels;
  const payload = serializePixelDrawing(pixels);
  assert.match(PIXEL_PAD_STORAGE_KEY, /:v1$/);
  assert.deepEqual(parsePixelDrawing(payload), pixels);
  assert.notEqual(parsePixelDrawing(payload), pixels);
  assert.deepEqual(Object.keys(JSON.parse(payload)), [
    'version',
    'columns',
    'rows',
    'pixels',
  ]);
});

test('empty and completely filled drawings survive reloads', () => {
  for (const filled of [false, true]) {
    const pixels = Array(160).fill(filled);
    assert.deepEqual(parsePixelDrawing(serializePixelDrawing(pixels)), pixels);
  }
});

test('parsing rejects missing, corrupt and excessive storage data safely', () => {
  for (const payload of [
    null,
    undefined,
    '',
    '{',
    'null',
    'false',
    '0',
    '[]',
    '{}',
    ' '.repeat(1025),
    { version: 1 },
  ]) {
    assert.equal(parsePixelDrawing(payload), null);
  }
});

test('stored drawings must match the exact version, dimensions and cell format', () => {
  const valid = JSON.parse(serializePixelDrawing(Array(160).fill(false)));
  for (const invalid of [
    { version: 2 },
    { version: '1' },
    { columns: 15 },
    { columns: '16' },
    { rows: 9 },
    { rows: null },
    { pixels: '0'.repeat(159) },
    { pixels: '0'.repeat(161) },
    { pixels: `${'0'.repeat(159)}x` },
    { pixels: `${'0'.repeat(159)}\n` },
    { pixels: Array(160).fill(false) },
    { pixels: null },
  ]) {
    assert.equal(parsePixelDrawing(JSON.stringify({ ...valid, ...invalid })), null);
  }
});

test('serialization rejects non-boolean, sparse and incorrectly sized grids', () => {
  for (const pixels of [
    undefined,
    null,
    '0'.repeat(160),
    [],
    Array(159).fill(false),
    Array(161).fill(false),
    Array(160),
    Array(160).fill(0),
    [...Array(159).fill(false), 'true'],
  ]) {
    assert.equal(serializePixelDrawing(pixels), null);
  }
});

test('serialization and parsing do not mutate or share the drawing cells', () => {
  const pixels = Object.freeze(createPixelPadState().pixels);
  const payload = serializePixelDrawing(pixels);
  const restored = parsePixelDrawing(payload);
  restored[0] = !restored[0];
  assert.notDeepEqual(restored, pixels);
  assert.deepEqual(parsePixelDrawing(payload), pixels);
});
