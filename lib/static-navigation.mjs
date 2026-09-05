export const staticRoutes = Object.freeze({
  '/': 'index',
  '/projects': 'projects',
  '/credits': 'credits',
});

export function readPagePayload(payload, pathname) {
  const rootLine = payload.match(/^0:(\{[^\r\n]*\})\r?$/m);
  const root = rootLine ? JSON.parse(rootLine[1]) : null;

  if (root?.__route !== `route:${pathname}`) {
    throw new Error(`Invalid navigation payload for ${pathname}`);
  }

  const buildId = root.__artifactCompatibility?.deploymentVersion;
  if (typeof buildId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(buildId)) {
    throw new Error(`Missing navigation build ID for ${pathname}`);
  }

  return { buildId };
}

// GitHub Pages serves files without Vinext's request-header routing. Adapt
// only our exported page requests; the framework still owns navigation,
// history, prefetching, scroll restoration, and the persistent React layout.
export function createStaticNavigationFetch({
  fetch: originalFetch,
  origin,
  buildId,
  compatibilityId,
}) {
  return async function staticNavigationFetch(input, init) {
    const url = new URL(input instanceof Request ? input.url : input, origin);
    const method =
      init?.method ?? (input instanceof Request ? input.method : 'GET');
    const requestHeaders = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const isPageRequest =
      requestHeaders.get('RSC') === '1' ||
      requestHeaders.get('Accept')?.includes('text/x-component');

    if (
      method.toUpperCase() !== 'GET' ||
      url.origin !== origin ||
      !Object.hasOwn(staticRoutes, pathname) ||
      !isPageRequest
    ) {
      return originalFetch(input, init);
    }

    const request = new Request(input instanceof Request ? input : url, init);
    // Build-specific paths keep an open tab from receiving a newer build's
    // payload after deployment. Missing old files use the router's fallback.
    const assetUrl = new URL(
      `/_navigation/${buildId}/${staticRoutes[pathname]}.rsc`,
      origin,
    );
    const response = await originalFetch(new Request(assetUrl, request));
    const headers = new Headers(response.headers);
    let body = response.body;

    if (response.ok) {
      const payload = await response.text();
      if (readPagePayload(payload, pathname).buildId !== buildId) {
        throw new Error('Navigation payload belongs to a different build');
      }
      body = payload;
      headers.set('Content-Type', 'text/x-component');
      headers.set('X-Vinext-RSC-Compatibility-Id', compatibilityId);
      headers.delete('Content-Length');
      headers.delete('Content-Encoding');
    }

    const result = new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    // The router must see the page URL, including its query, not the asset URL.
    Object.defineProperty(result, 'url', { value: url.href });
    return result;
  };
}
