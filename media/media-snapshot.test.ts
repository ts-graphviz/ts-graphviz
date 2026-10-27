///<reference types="vite/client" />
import path from 'node:path';

import { test } from 'vitest';

import { type MediaModule, mediaDot } from './render.js';

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
