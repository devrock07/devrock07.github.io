import assert from 'node:assert/strict';
import test from 'node:test';
import { filterProjects, projectSlugFromHash } from '../lib/project-filter.mjs';

const projects = Object.freeze(
  [
    {
      name: 'AniMc',
      slug: 'animc',
      state: 'active / Svelte',
      summary: 'Minecraft pixel tools',
      build: 'SvelteKit TypeScript Canvas',
    },
    {
      name: 'Pogy-Bot',
      slug: 'pogy-bot',
      state: 'archive / JavaScript',
      summary: 'Discord music',
      build: 'React MongoDB Lavalink',
    },
    {
      name: 'Shafed-Billi',
      slug: 'shafed-billi',
      state: 'active / JavaScript',
      summary: 'Discord music',
      build: 'Node.js MongoDB',
    },
    {
      name: 'arrkiii',
      slug: 'arrkiii',
      state: 'archive / JavaScript',
      summary: 'Discord moderation',
      build: 'React MongoDB',
    },
    {
      name: 'REM-AIO',
      slug: 'rem-aio',
      state: 'active / Python',
      summary: 'Discord moderation',
      build: 'Python SQLite',
    },
    {
      name: 'astryx',
      slug: 'astryx',
      state: 'archive / JavaScript',
      summary: 'Discord moderation',
      build: 'Node.js PostgreSQL',
    },
  ].map(Object.freeze),
);

test('all projects keep the original pinned order without mutation', () => {
  const result = filterProjects(projects);
  assert.deepEqual(result, projects);
  assert.notEqual(result, projects);
  assert.deepEqual(filterProjects(projects, '  '), projects);
});

test('active and archived filters preserve relative pinned order', () => {
  assert.deepEqual(
    filterProjects(projects, '', 'active').map(({ slug }) => slug),
    ['animc', 'shafed-billi', 'rem-aio'],
  );
  assert.deepEqual(
    filterProjects(projects, '', 'archived').map(({ slug }) => slug),
    ['pogy-bot', 'arrkiii', 'astryx'],
  );
});

test('search matches name, description, language, and stack without case or punctuation sensitivity', () => {
  assert.equal(filterProjects(projects, 'POGY bot')[0].slug, 'pogy-bot');
  assert.equal(filterProjects(projects, 'typescript pixel')[0].slug, 'animc');
  assert.equal(filterProjects(projects, 'python sqlite')[0].slug, 'rem-aio');
  assert.deepEqual(
    filterProjects(projects, 'discord').map(({ slug }) => slug),
    ['pogy-bot', 'shafed-billi', 'arrkiii', 'rem-aio', 'astryx'],
  );
});

test('query and status intersect and genuinely unmatched results stay empty', () => {
  assert.deepEqual(
    filterProjects(projects, 'music', 'active').map(({ slug }) => slug),
    ['shafed-billi'],
  );
  assert.deepEqual(filterProjects(projects, 'python', 'archived'), []);
  assert.deepEqual(filterProjects(projects, 'python mongodb'), []);
  assert.deepEqual(filterProjects(projects, '<script>alert(1)</script>'), []);
});

test('project anchors resolve only known slugs and tolerate malformed hashes', () => {
  assert.equal(projectSlugFromHash(projects, '#pogy-bot'), 'pogy-bot');
  assert.equal(projectSlugFromHash(projects, '#rem%2Daio'), 'rem-aio');
  assert.equal(projectSlugFromHash(projects, '#missing'), null);
  assert.equal(projectSlugFromHash(projects, '#%broken'), null);
  assert.equal(projectSlugFromHash(projects, '#main-content'), null);
  assert.equal(projectSlugFromHash(projects, ''), null);
});
