///<reference types="vite/client" />
import path from 'node:path';
import { toStream } from '@ts-graphviz/adapter';
import { optimize } from 'svgo';
import { test } from 'vitest';
import { toDot } from '../src/to-dot.js';

async function streamToString(stream: NodeJS.ReadableStream) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf-8');
}

for (const [file, getContents] of Object.entries(
  import.meta.glob<string>('../media/*.canvas', {
    query: 'raw',
    import: 'default',
  }),
)) {
  test.concurrent(path.relative('..', file), async ({ expect }) => {
    const jsoncanvas = JSON.parse(await getContents());
    // const { name } = path.parse(file);
    // const snapshot = path.format({
    //   ...path.parse(file),
    //   base: '',
    //   ext: '.dot',
    // });
    const dot = toDot(jsoncanvas);
    expect(dot).toMatchFileSnapshot(
      path.format({
        ...path.parse(file),
        base: '',
        ext: '.dot',
      }),
    );
    const svg = await toStream(dot, {
      format: 'svg',
    })
      .then((stream) => streamToString(stream))
      .then((svg) => optimize(svg))
      .then((result) => result.data);

    expect(svg).toMatchFileSnapshot(
      path.format({
        ...path.parse(file),
        base: '',
        ext: '.svg',
      }),
    );
  });
}
