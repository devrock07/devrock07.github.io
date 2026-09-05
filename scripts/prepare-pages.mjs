import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { readPagePayload, staticRoutes } from '../lib/static-navigation.mjs';

const outputDirectory = join(process.cwd(), 'dist', 'client');

const { buildId } = readPagePayload(
  await readFile(join(outputDirectory, 'index.rsc'), 'utf8'),
  '/',
);
const navigationDirectory = join(outputDirectory, '_navigation', buildId);
await mkdir(navigationDirectory, { recursive: true });

for (const [pathname, file] of Object.entries(staticRoutes)) {
  const payloadFile = join(outputDirectory, `${file}.rsc`);
  const payload = await readFile(payloadFile, 'utf8');
  if (readPagePayload(payload, pathname).buildId !== buildId) {
    throw new Error(`Navigation build mismatch for ${pathname}`);
  }
  await copyFile(payloadFile, join(navigationDirectory, `${file}.rsc`));

  if (pathname === '/') continue;
  const routeDirectory = join(outputDirectory, file);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(
    join(outputDirectory, `${file}.html`),
    join(routeDirectory, 'index.html'),
  );
}
