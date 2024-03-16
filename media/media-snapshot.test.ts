import fs from 'node:fs/promises';
///<reference types="vite/client" />
import path from 'node:path';

import { toStream } from '@ts-graphviz/adapter';
import { RootGraphModel } from '@ts-graphviz/common';
import { optimize } from 'svgo';
import { toDot } from 'ts-graphviz';
import { test } from 'vitest';

async function streamToString(stream: NodeJS.ReadableStream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf-8');
}

interface TSGraphvizModule {
  default: RootGraphModel;
  meta?: {
    exportTo?: string[];
  };
}

for (const [file, getModule] of Object.entries({
  ...import.meta.glob<TSGraphvizModule>('./*.dot.ts'),
  ...import.meta.glob<TSGraphvizModule>('./*.dot.tsx'),
})) {
  test.concurrent(file, async ({ expect }) => {
    const { name } = path.parse(file);
    const { dot, exportTo } = await getModule().then((module) => {
      return {
        dot: `${toDot(module.default)}\n`,
        exportTo: module.meta?.exportTo,
      };
    });
    expect(dot).toMatchFileSnapshot(name);

    const svg = await toStream(dot, {
      format: 'svg',
    })
      .then((stream) => streamToString(stream))
      .then((svg) => optimize(svg))
      .then((result) => result.data);

    expect(svg).toMatchFileSnapshot(`${name.slice(0, -4)}.svg`);

    if (exportTo) {
      for (const to of exportTo) {
        await fs.writeFile(path.resolve(process.cwd(), to), svg);
      }
    }
  });
}
