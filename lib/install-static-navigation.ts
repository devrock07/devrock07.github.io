import { createStaticNavigationFetch } from './static-navigation.mjs';

// Run before hydration/prefetch effects, only in the exported client build.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const buildId = process.env.__VINEXT_BUILD_ID;
  const compatibilityId = process.env.__VINEXT_RSC_COMPATIBILITY_ID;

  if (buildId && compatibilityId) {
    window.fetch = createStaticNavigationFetch({
      fetch: window.fetch.bind(window),
      origin: window.location.origin,
      buildId,
      compatibilityId,
    });
  }
}
