///<reference types="vite/client" />
import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { describe, test } from 'vitest';

import { type MediaModule, mediaDot, mediaSvg } from './render.js';

const hasDot = spawnSync('dot', ['-V']).status === 0;

// The DOT each media example produces. The SVG images are rendered from it
// by `pnpm media:generate` (media/generate.ts), not here: they depend on the
// Graphviz version, and a test must not write into the source tree.
for (const [file, getModule] of Object.entries({
  ...import.meta.glob<MediaModule>('./*.dot.ts'),
  ...import.meta.glob<MediaModule>('./*.dot.tsx'),
})) {
  test.concurrent(file, async ({ expect }) => {
    const { name } = path.parse(file);
    await expect(mediaDot(await getModule())).toMatchFileSnapshot(name);
  });
}

// What `pnpm media:generate` writes, without writing it: each example
// renders to an SVG image (its exact markup depends on the Graphviz version).
describe.skipIf(!hasDot)('media images', () => {
  for (const [file, getModule] of Object.entries({
    ...import.meta.glob<MediaModule>('./*.dot.ts'),
    ...import.meta.glob<MediaModule>('./*.dot.tsx'),
  })) {
    test.concurrent(file, async ({ expect }) => {
      const svg = await mediaSvg(mediaDot(await getModule()));
      expect(svg).toMatch(/^<svg[\s\S]*<\/svg>$/);
    });
  }
});
