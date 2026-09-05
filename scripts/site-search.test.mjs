import assert from 'node:assert/strict';
import test from 'node:test';
import { searchSite } from '../lib/site-search.mjs';

const entries = [
  {
    title: 'Projects',
    description: 'Discord bots and tools.',
    href: '/projects',
    group: 'Pages',
  },
  {
    title: 'Pogy-Bot',
    description: 'Discord music and moderation.',
    href: '/projects#pogy-bot',
    group: 'Projects',
    keywords: 'JavaScript React MongoDB',
  },
  {
    title: 'REM-AIO',
    description: 'Discord music bot.',
    href: '/projects#rem-aio',
    group: 'Projects',
    keywords: 'Python SQLite',
  },
  {
    title: 'Credits',
    description: 'Fonts and icons.',
    href: '/credits',
    group: 'Pages',
  },
];

test('blank search keeps the full index and never mutates it', () => {
  const frozen = Object.freeze([...entries]);
  assert.deepEqual(searchSite(frozen, '  '), entries);
  assert.notEqual(searchSite(frozen, ''), frozen);
});

test('search ignores case and punctuation in project names', () => {
  assert.equal(searchSite(entries, 'POGY bot')[0].href, '/projects#pogy-bot');
  assert.equal(searchSite(entries, 'rem-aio')[0].title, 'REM-AIO');
});

test('all query words must match, including technology keywords', () => {
  assert.deepEqual(
    searchSite(entries, 'python music').map((entry) => entry.title),
    ['REM-AIO'],
  );
  assert.deepEqual(searchSite(entries, 'python react'), []);
});

test('matching titles rank before incidental description matches', () => {
  const results = searchSite(
    [
      ...entries,
      {
        title: 'Discord',
        description: 'Community.',
        href: '/discord',
        group: 'Pages',
      },
    ],
    'discord',
  );
  assert.equal(results[0].title, 'Discord');
  assert.deepEqual(
    results.slice(1).map((entry) => entry.title),
    ['Projects', 'Pogy-Bot', 'REM-AIO'],
  );
});

test('unmatched text produces a real empty result', () => {
  assert.deepEqual(searchSite(entries, '<script>alert(1)</script>'), []);
  assert.deepEqual(searchSite(entries, 'somewhere else'), []);
});
