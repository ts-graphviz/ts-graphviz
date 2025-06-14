///<reference types="vite/client" />

import path from 'node:path';
import { describe, it } from 'vitest';

import { type ASTNode, parse, stringify } from '@ts-graphviz/ast';

function forEachDotFile(
  callback: (file: string, getContents: () => Promise<string>) => void,
) {
  for (const [file, getContents] of Object.entries(
    import.meta.glob<string>('./dot/*.dot', {
      query: 'raw',
      import: 'default',
    }),
  )) {
    callback(file, getContents);
  }
}

describe('Real-world DOT file AST snapshots', () => {
  forEachDotFile((file, getContents) => {
    it.concurrent(
      `parses AST and matches snapshot for ${file}`,
      async ({ expect }) => {
        try {
          const dot = await getContents();
          const snapshot = path.format({
            ...path.parse(file),
            base: '',
            ext: '.snapshot',
          });
          await expect(parse(dot)).toMatchFileSnapshot(snapshot);
        } catch (e) {
          console.log(e);
          throw e;
        }
      },
    );
  });
});

describe('AST stringify round-trip consistency', () => {
  function removeNoise(node: ASTNode) {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'location') {
        delete node[key];
      } else if (Array.isArray(value)) {
        // @ts-ignore
        node[key] = value.filter((item) => {
          if (item.type === 'Comment') {
            return false;
          }
          removeNoise(item);
          return true;
        });
      } else if (typeof value === 'object') {
        removeNoise(value);
      }
    }
  }

  forEachDotFile((file, getContents) => {
    it.concurrent(
      `retains AST structure after stringify for ${file}`,
      async ({ expect }) => {
        const dot = await getContents();
        const parsed = parse(dot);
        const serialized = stringify(parsed);
        const reparsed = parse(serialized);
        removeNoise(parsed);
        removeNoise(reparsed);
        expect(parsed).toEqual(reparsed);
      },
    );
  });
});
