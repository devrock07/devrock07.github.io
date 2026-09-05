import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

import {
  createStaticNavigationFetch,
  readPagePayload,
  staticRoutes,
} from '../lib/static-navigation.mjs';
import { navigationPlanner } from '../node_modules/vinext/dist/server/navigation-planner.js';
import { createRscRequestUrl } from '../node_modules/vinext/dist/server/app-rsc-cache-busting.js';

const outputDirectory = join(import.meta.dirname, '..', 'dist', 'client');
const compatibilityId = 'navigation-test-compatibility';
const requestHeaders = { RSC: '1', Accept: 'text/x-component' };
let origin;
let buildId;
let server;
let navigateFetch;
const requests = [];

before(async () => {
  ({ buildId } = readPagePayload(
    await readFile(join(outputDirectory, 'index.rsc'), 'utf8'),
    '/',
  ));
  // A plain static server, with the same lack of RSC routing/headers as Pages.
  server = createServer(async (request, response) => {
    const url = new URL(request.url, origin);
    requests.push(url.pathname);
    const file = Object.values(staticRoutes).find(
      (name) => url.pathname === `/_navigation/${buildId}/${name}.rsc`,
    );
    if (!file) {
      response.writeHead(404, { 'Content-Type': 'text/html' });
      response.end('<h1>Not found</h1>');
      return;
    }
    const payload = await readFile(
      join(outputDirectory, '_navigation', buildId, `${file}.rsc`),
    );
    response.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    response.end(payload);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  navigateFetch = createStaticNavigationFetch({
    fetch,
    origin,
    buildId,
    compatibilityId,
  });
});

after(() => new Promise((resolve) => server?.close(resolve)));

function classifyResponse(response, href) {
  return navigationPlanner.classifyRscFetchResult({
    clientCompatibilityId: compatibilityId,
    compatibilityIdHeader: response.headers.get(
      'X-Vinext-RSC-Compatibility-Id',
    ),
    currentHref: href,
    effectiveHistoryUpdateMode: 'push',
    hasBody: response.body !== null,
    isRscContentType:
      response.headers.get('Content-Type') === 'text/x-component',
    origin,
    redirectDepth: 0,
    requestPreviousNextUrl: null,
    responseOk: response.ok,
    responseUrl: response.url,
    source: 'live',
    streamedRedirectTarget: null,
    streamedRedirectType: null,
  });
}

test('all exported pages pass the real router checks without a hard navigation', async () => {
  for (const href of [
    '/',
    '/projects',
    '/credits',
    '/projects/',
    '/credits/?via=nav',
    '/#contact',
  ]) {
    const requestUrl = await createRscRequestUrl(
      href,
      new Headers(requestHeaders),
    );
    const response = await navigateFetch(requestUrl, {
      headers: requestHeaders,
    });
    assert.equal(
      classifyResponse(response, href).kind,
      'proceedToCommit',
      href,
    );
    assert.equal(response.url, new URL(requestUrl, origin).href);
    const pathname = new URL(href, origin).pathname.replace(/\/+$/, '') || '/';
    const payload = await response.text();
    assert.equal(readPagePayload(payload, pathname).buildId, buildId);
    const root = JSON.parse(payload.match(/^0:(\{[^\r\n]*\})\r?$/m)[1]);
    assert.deepEqual(root.__layoutIds, ['layout:/']);
    assert.equal(root.__rootLayout, '/');
    assert.equal(
      requests.at(-1),
      `/_navigation/${buildId}/${staticRoutes[pathname]}.rsc`,
    );
  }
});

test('HTML, external links, files and unknown routes bypass the adapter', async () => {
  const calls = [];
  const passthrough = createStaticNavigationFetch({
    fetch: async (...args) => {
      calls.push(args);
      return new Response('unchanged');
    },
    origin,
    buildId,
    compatibilityId,
  });
  for (const [input, init] of [
    ['/projects', undefined],
    ['https://example.com/projects', { headers: requestHeaders }],
    ['/fonts/redaction/LICENSE.txt', { headers: requestHeaders }],
    ['/missing', { headers: requestHeaders }],
  ]) {
    assert.equal(await (await passthrough(input, init)).text(), 'unchanged');
    assert.equal(calls.at(-1)[0], input);
    assert.equal(calls.at(-1)[1], init);
  }
});

test('POST Request bodies remain readable by the original fetch', async () => {
  const input = new Request(`${origin}/projects`, {
    method: 'POST',
    headers: requestHeaders,
    body: 'keep this body',
  });
  const passthrough = createStaticNavigationFetch({
    fetch: async (request) => {
      assert.equal(request, input);
      assert.equal(request.bodyUsed, false);
      return new Response(await request.text());
    },
    origin,
    buildId,
    compatibilityId,
  });
  assert.equal(await (await passthrough(input)).text(), 'keep this body');
});

test('an aborted navigation cancels its asset request', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    navigateFetch('/projects', {
      headers: requestHeaders,
      signal: controller.signal,
    }),
    { name: 'AbortError' },
  );
});

test('a missing old build falls back to the real page URL', async () => {
  const oldFetch = createStaticNavigationFetch({
    fetch,
    origin,
    buildId: 'old-build',
    compatibilityId,
  });
  const href = '/projects/?via=nav#animc';
  const requestUrl = await createRscRequestUrl(
    href,
    new Headers(requestHeaders),
  );
  const response = await oldFetch(requestUrl, { headers: requestHeaders });
  const decision = classifyResponse(response, href);
  assert.equal(decision.kind, 'hardNavigate');
  assert.equal(decision.url, href);
  await response.body.cancel();
});

test('wrong routes, HTML and other builds cannot be passed off as valid RSC', async () => {
  const payload = await readFile(join(outputDirectory, 'projects.rsc'), 'utf8');
  for (const body of [
    '<html>not an RSC payload</html>',
    payload.replaceAll('route:/projects', 'route:/credits'),
    payload.replaceAll(buildId, 'another-build'),
  ]) {
    const badFetch = createStaticNavigationFetch({
      fetch: async () => new Response(body),
      origin,
      buildId,
      compatibilityId,
    });
    await assert.rejects(badFetch('/projects', { headers: requestHeaders }));
  }
});
