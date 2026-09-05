import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterStamps,
  readStampFilters,
  stampCategories,
  stampViewHref,
} from '../lib/stamp-filter.mjs';

const stamps = Object.freeze([
  {
    id: 'a',
    name: 'Your Name.',
    category: 'Anime & manga',
    note: 'A film by Makoto Shinkai.',
    line: 'FILM',
  },
  {
    id: 'b',
    name: 'Mushoku Tensei',
    category: 'Anime & manga',
    note: 'Jobless Reincarnation.',
    line: 'SERIES',
  },
  {
    id: 'c',
    name: 'GitHub',
    category: 'Apps',
    note: 'Code lives here.',
    line: 'APP',
  },
]);

test('stamp filters default safely and reject unknown or prototype category names', () => {
  for (const query of [
    '',
    '?category=unknown',
    '?category=__proto__',
    '?category=constructor',
  ]) {
    assert.deepEqual(readStampFilters(query), {
      category: 'All stamps',
      query: '',
    });
  }
});

test('every category and special query survives a shareable URL round trip', () => {
  for (const category of stampCategories) {
    const query = 'Your Name. & sunshine / + #';
    const url = new URL(stampViewHref(category, query), 'https://example.test');
    assert.equal(url.pathname, '/stamps');
    assert.equal(url.hash, '');
    assert.deepEqual(readStampFilters(url.search), { category, query });
  }
  assert.equal(stampViewHref('All stamps', ''), '/stamps');
  assert.equal(stampViewHref('Anime & manga'), '/stamps?category=anime');
});

test('stamp search preserves order and supports alternate title words and punctuation', () => {
  assert.deepEqual(filterStamps(stamps, 'All stamps', ''), stamps);
  assert.notEqual(filterStamps(stamps, 'All stamps', ''), stamps);
  assert.deepEqual(
    filterStamps(stamps, 'Anime & manga').map((stamp) => stamp.id),
    ['a', 'b'],
  );
  assert.deepEqual(
    filterStamps(stamps, 'Anime & manga', 'JOBLESS reincarnation').map(
      (stamp) => stamp.id,
    ),
    ['b'],
  );
  assert.deepEqual(
    filterStamps(stamps, 'All stamps', 'YOUR-name.').map((stamp) => stamp.id),
    ['a'],
  );
  assert.deepEqual(filterStamps(stamps, 'Apps', 'Your Name'), []);
  assert.deepEqual(
    filterStamps(stamps, 'All stamps', 'not in the collection'),
    [],
  );
});

test('shared search is bounded and preserves spaces while typing', () => {
  assert.equal(readStampFilters('?q=hello+').query, 'hello ');
  assert.equal(readStampFilters(`?q=${'x'.repeat(500)}`).query.length, 100);
  assert.equal(
    readStampFilters(stampViewHref('Apps', 'x'.repeat(500)).split('?')[1]).query
      .length,
    100,
  );
});
