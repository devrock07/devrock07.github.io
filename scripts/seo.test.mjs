import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { before, test } from 'node:test';

const outputDirectory = join(import.meta.dirname, '..', 'dist', 'client');
const origin = 'https://devv.is-a.dev';
const imagePath = '/social/dev-bhakat-preview-v1.png';
const routes = [
  ['/', 'index', 'Dev Bhakat — Web Developer & Bot Builder'],
  ['/projects', 'projects', 'Projects — Dev Bhakat'],
  ['/credits', 'credits', 'Credits — Dev Bhakat'],
];
const pages = new Map();
const namedEntities = {
  amp: '&',
  apos: "'",
  quot: '"',
  lt: '<',
  gt: '>',
  nbsp: '\u00a0',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  copy: '©',
  reg: '®',
  trade: '™',
};

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
    if (!name.startsWith('#')) return namedEntities[name] ?? entity;
    const hexadecimal = name[1].toLowerCase() === 'x';
    const code = Number.parseInt(
      name.slice(hexadecimal ? 2 : 1),
      hexadecimal ? 16 : 10,
    );
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
      ? String.fromCodePoint(code)
      : '\ufffd';
  });
}

function attributes(source) {
  const result = {};
  for (const match of source.matchAll(
    /([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
  )) {
    result[match[1].toLowerCase()] = decodeEntities(
      match[2] ?? match[3] ?? match[4] ?? '',
    );
  }
  return result;
}

function withoutScripts(html) {
  return html.replace(
    /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    '',
  );
}

function tags(html, tag) {
  const pattern = new RegExp(`<${tag}\\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>`, 'gi');
  return Array.from(withoutScripts(html).matchAll(pattern), (match) =>
    attributes(match[1]),
  );
}

function visibleText(html) {
  return decodeEntities(withoutScripts(html).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function single(values, label) {
  assert.equal(
    values.length,
    1,
    `Expected exactly one ${label}, found ${values.length}`,
  );
  return values[0];
}

function meta(page, name) {
  return single(
    page.meta.filter((tag) => (tag.name ?? tag.property) === name),
    `${page.path} ${name}`,
  ).content;
}

function hasType(node, type) {
  return [node?.['@type']].flat().includes(type);
}

function jsonNodes(value) {
  if (!value || typeof value !== 'object') return [];
  return [value, ...Object.values(value).flatMap(jsonNodes)];
}

function typedNode(page, type) {
  return single(
    page.nodes.filter((node) => hasType(node, type)),
    `${page.path} ${type}`,
  );
}

before(async () => {
  await Promise.all(
    routes.map(async ([path, file, title]) => {
      const html = await readFile(
        join(outputDirectory, `${file}.html`),
        'utf8',
      );
      const head = single(
        Array.from(html.matchAll(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/gi)),
        `${path} head`,
      )[1];
      const documents = Array.from(
        html.matchAll(
          /<script\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi,
        ),
      )
        .filter((match) => attributes(match[1]).type === 'application/ld+json')
        // Script contents are raw text in HTML: entity decoding here would hide invalid JSON-LD.
        .map((match) => JSON.parse(match[2]));
      pages.set(path, {
        path,
        file,
        title,
        html,
        head,
        documents,
        meta: tags(head, 'meta'),
        nodes: documents.flatMap(jsonNodes),
      });
    }),
  );
});

for (const [path] of routes) {
  test(`${path} exposes one complete, consistent metadata set in the raw HTML head`, () => {
    const page = pages.get(path);
    const title = single(
      Array.from(
        withoutScripts(page.head).matchAll(
          /<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi,
        ),
      ),
      `${path} title`,
    )[1];
    assert.equal(decodeEntities(title), page.title);
    const description = meta(page, 'description');
    assert.ok(description?.trim(), `${path} description is empty`);
    const canonical = single(
      tags(page.head, 'link').filter((tag) =>
        tag.rel?.split(/\s+/).includes('canonical'),
      ),
      `${path} canonical`,
    ).href;
    // Vinext omits the root slash when serializing an otherwise absolute URL.
    assert.equal(
      path === '/' ? new URL(canonical).href : canonical,
      `${origin}${path}`,
    );
    assert.equal(meta(page, 'og:url'), canonical);
    assert.equal(meta(page, 'og:title'), page.title);
    assert.equal(meta(page, 'og:description'), description);
    assert.equal(meta(page, 'og:site_name'), 'Dev Bhakat');
    assert.equal(meta(page, 'og:type'), 'website');
    assert.match(meta(page, 'og:locale'), /^[a-z]{2}_[A-Z]{2}$/);
    assert.equal(meta(page, 'og:image'), `${origin}${imagePath}`);
    assert.equal(meta(page, 'og:image:type'), 'image/png');
    assert.ok(meta(page, 'og:image:alt')?.trim(), `${path} image alt is empty`);
    assert.equal(meta(page, 'twitter:card'), 'summary_large_image');
    assert.equal(meta(page, 'twitter:title'), page.title);
    assert.equal(meta(page, 'twitter:description'), description);
    assert.equal(meta(page, 'twitter:image'), meta(page, 'og:image'));
    const robots = meta(page, 'robots')
      .toLowerCase()
      .split(',')
      .map((value) => value.trim());
    assert.ok(
      robots.includes('index') && robots.includes('follow'),
      `${path} must allow indexing and link following`,
    );
    for (const tag of page.meta.filter((tag) =>
      /^(robots|googlebot)$/i.test(tag.name ?? ''),
    )) {
      assert.doesNotMatch(tag.content, /\b(noindex|nofollow|none)\b/i);
    }
  });
}

test('structured data identifies the portfolio owner and website truthfully', () => {
  for (const page of pages.values()) {
    assert.ok(page.documents.length > 0, `${page.path} is missing JSON-LD`);
    for (const document of page.documents)
      assert.equal(document['@context'], 'https://schema.org');
    const person = typedNode(page, 'Person');
    const website = typedNode(page, 'WebSite');
    assert.equal(person['@id'], `${origin}/#person`);
    assert.equal(person.name, 'Dev Bhakat');
    assert.equal(person.url, `${origin}/`);
    assert.ok([person.alternateName].flat().includes('devrock07'));
    assert.equal(website['@id'], `${origin}/#website`);
    assert.equal(website.name, 'Dev Bhakat');
    assert.equal(website.url, `${origin}/`);
    const visibleLinks = new Set(tags(page.html, 'a').map((tag) => tag.href));
    assert.deepEqual(
      [...person.sameAs].sort((left, right) => left.localeCompare(right)),
      [
        'https://github.com/devrock07',
        'https://www.instagram.com/d4vrock/',
        'https://www.youtube.com/@ZenithSenpai',
      ].sort((left, right) => left.localeCompare(right)),
    );
    for (const profile of person.sameAs)
      assert.ok(
        visibleLinks.has(profile),
        `${profile} is not visibly linked on ${page.path}`,
      );
    assert.equal(
      page.nodes.filter(
        (node) =>
          hasType(node, 'Organization') || hasType(node, 'LocalBusiness'),
      ).length,
      0,
    );
  }
  const home = pages.get('/');
  const profile = typedNode(home, 'ProfilePage');
  assert.equal(profile['@id'], `${origin}/#profile-page`);
  assert.equal(profile.url, `${origin}/`);
  assert.equal(profile.mainEntity['@id'], `${origin}/#person`);
  assert.equal(profile.isPartOf['@id'], `${origin}/#website`);
  assert.match(visibleText(home.html), /Dev Bhakat/);
  assert.match(visibleText(home.html), /devrock07/);
  assert.match(visibleText(home.html), /Jamshedpur/);
});

test('projects structured data matches the six visible repositories in order', () => {
  const page = pages.get('/projects');
  const collection = typedNode(page, 'CollectionPage');
  assert.equal(collection.url, `${origin}/projects`);
  assert.equal(collection.isPartOf['@id'], `${origin}/#website`);
  assert.ok(hasType(collection.mainEntity, 'ItemList'));
  const entries = collection.mainEntity.itemListElement;
  assert.equal(entries.length, 6);
  if (collection.mainEntity.numberOfItems !== undefined)
    assert.equal(collection.mainEntity.numberOfItems, 6);
  const visibleProjects = Array.from(
    withoutScripts(page.html).matchAll(
      /<article\b([^>]*)>([\s\S]*?)<\/article\s*>/gi,
    ),
  )
    .filter((match) =>
      attributes(match[1]).class?.split(/\s+/).includes('project'),
    )
    .map((match) => ({
      name: visibleText(
        single(
          Array.from(match[2].matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/gi)),
          'project heading',
        )[1],
      ),
      url: single(
        tags(match[2], 'a').filter((tag) =>
          tag.href?.startsWith('https://github.com/devrock07/'),
        ),
        'project repository link',
      ).href,
    }));
  assert.equal(visibleProjects.length, 6);
  assert.deepEqual(
    entries.map((entry, index) => {
      assert.ok(hasType(entry, 'ListItem'));
      assert.equal(entry.position, index + 1);
      assert.ok(hasType(entry.item, 'SoftwareSourceCode'));
      return { name: entry.item.name, url: entry.item.url };
    }),
    visibleProjects,
  );
});

test('the shared social image is a small PNG with the advertised dimensions', async () => {
  const image = await readFile(join(outputDirectory, imagePath.slice(1)));
  assert.ok(
    image.length > 24 && image.length < 5 * 1024 * 1024,
    'Social image must be below 5 MiB',
  );
  assert.deepEqual(
    image.subarray(0, 8),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  assert.equal(image.toString('ascii', 12, 16), 'IHDR');
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  assert.equal(width, 1731);
  assert.equal(height, 909);
  for (const page of pages.values()) {
    assert.equal(meta(page, 'og:image:width'), String(width));
    assert.equal(meta(page, 'og:image:height'), String(height));
  }
});

test('robots.txt allows portfolio crawlers and points to the canonical sitemap', async () => {
  const robots = await readFile(join(outputDirectory, 'robots.txt'), 'utf8');
  const groups = [];
  const sitemaps = [];
  let group;
  for (const line of robots.split(/\r?\n/)) {
    const directive = line
      .replace(/#.*$/, '')
      .match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (!directive) continue;
    const [, rawName, value] = directive;
    const name = rawName.toLowerCase();
    if (name === 'sitemap') sitemaps.push(value);
    if (name === 'user-agent') {
      if (!group || group.rules.length)
        groups.push((group = { agents: [], rules: [] }));
      group.agents.push(value.toLowerCase());
    } else if ((name === 'allow' || name === 'disallow') && value && group) {
      group.rules.push({ name, value });
    }
  }
  assert.deepEqual(sitemaps, [`${origin}/sitemap.xml`]);
  assert.ok(
    groups.some((entry) => entry.agents.includes('*')),
    'robots.txt must address all crawlers',
  );
  for (const crawler of ['*', 'googlebot', 'discordbot', 'twitterbot']) {
    const specific = groups.filter((entry) => entry.agents.includes(crawler));
    const applicable = specific.length
      ? specific
      : groups.filter((entry) => entry.agents.includes('*'));
    for (const path of [...routes.map(([route]) => route), imagePath]) {
      const matching = applicable
        .flatMap((entry) => entry.rules)
        .filter((rule) => {
          const pattern = rule.value
            .replace(/[.+?^{}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');
          return new RegExp(`^${pattern}`).test(path);
        })
        .sort(
          (left, right) =>
            right.value.length - left.value.length ||
            (left.name === 'allow' ? -1 : 1),
        );
      assert.notEqual(
        matching[0]?.name,
        'disallow',
        `${crawler} cannot crawl ${path}`,
      );
    }
  }
});

test('the sitemap contains exactly the three canonical page URLs', async () => {
  const sitemap = await readFile(join(outputDirectory, 'sitemap.xml'), 'utf8');
  assert.match(
    sitemap,
    /<urlset\b[^>]*xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/,
  );
  const urls = Array.from(
    sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/g),
    (match) => decodeEntities(match[1].trim()),
  );
  assert.deepEqual(
    urls.sort((left, right) => left.localeCompare(right)),
    routes
      .map(([path]) => `${origin}${path}`)
      .sort((left, right) => left.localeCompare(right)),
  );
});

test('GitHub Pages directory copies retain the same complete HTML', async () => {
  for (const [path, file] of routes) {
    if (path === '/') continue;
    const directoryCopy = await readFile(
      join(outputDirectory, file, 'index.html'),
      'utf8',
    );
    assert.equal(
      directoryCopy,
      pages.get(path).html,
      `${path}/index.html differs from ${file}.html`,
    );
  }
});
