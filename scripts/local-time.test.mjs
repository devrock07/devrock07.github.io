import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatLocalTime } from '../lib/local-time.mjs';

test('the clock uses India time independently of the visitor timezone', () => {
  assert.equal(
    formatLocalTime(new Date('2026-09-05T00:00:00Z')).time,
    '05:30:00',
  );
  assert.equal(
    formatLocalTime(new Date('2026-09-05T18:45:12Z')).time,
    '00:15:12',
  );
  assert.match(
    formatLocalTime(new Date('2026-09-05T18:45:12Z')).date,
    /06 Sept/,
  );
});

test('midnight uses 00 rather than 24', () => {
  assert.equal(
    formatLocalTime(new Date('2026-09-05T18:30:00Z')).time,
    '00:00:00',
  );
});
