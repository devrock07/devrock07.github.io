import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const outputDirectory = join(process.cwd(), 'dist', 'client');

for (const route of ['projects', 'credits']) {
  const routeDirectory = join(outputDirectory, route);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(
    join(outputDirectory, `${route}.html`),
    join(routeDirectory, 'index.html'),
  );
}
