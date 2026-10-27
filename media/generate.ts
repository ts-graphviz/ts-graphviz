/**
 * Render the media examples (media/*.dot.ts and media/*.dot.tsx) to the SVG
 * images the READMEs show. Run with `pnpm media:generate`; it needs
 * Graphviz `dot` on the PATH.
 *
 * Each example `<name>.dot.ts(x)` is written to `media/<name>.svg`, and to
 * every path of its `meta.exportTo` (relative to the repository root).
 * The SVG depends on the Graphviz version, so the tests do not check it:
 * media/media-snapshot.test.ts checks the DOT each example produces
 * (media/<name>.dot), and this script is how the images are updated.
 *
 * The examples import the packages' sources (through the tsconfig paths)
 * and use JSX, so they are loaded with Vite's module runner, as the tests
 * load them.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { createServer, createServerModuleRunner } from 'vite';

import type * as Render from './render.ts';

const root = resolve(import.meta.dirname, '..');
const mediaDir = join(root, 'media');

const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  resolve: { tsconfigPaths: true },
  server: { middlewareMode: true, hmr: false, ws: false },
});
const runner = createServerModuleRunner(server.environments.ssr, {
  hmr: false,
});

try {
  const { mediaDot, mediaSvg } = await runner.import<typeof Render>(
    join(mediaDir, 'render.ts'),
  );

  const sources = readdirSync(mediaDir)
    .filter((file) => /\.dot\.tsx?$/.test(file))
    .sort();
  for (const file of sources) {
    const name = file.replace(/\.dot\.tsx?$/, '');
    const module = await runner.import<Render.MediaModule>(
      join(mediaDir, file),
    );
    const svg = await mediaSvg(mediaDot(module));

    const outputs = [
      join(mediaDir, `${name}.svg`),
      ...(module.meta?.exportTo ?? []).map((to) => resolve(root, to)),
    ];
    for (const output of outputs) {
      writeFileSync(output, svg);
      console.log(`wrote ${output.slice(root.length + 1)}`);
    }
  }
} finally {
  await runner.close();
  await server.close();
}
