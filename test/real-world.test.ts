///<reference types="vite/client" />

import path from 'node:path';
import { describe, test } from 'vitest';

import {
  type ASTNode,
  DotSyntaxError,
  parse,
  stringify,
} from '@ts-graphviz/ast';

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

describe('Ability to parse real-world DOT files and the structure of the output ASTs should not change', () => {
  forEachDotFile((file, getContents) => {
    test.concurrent(file, async ({ expect }) => {
      try {
        const dot = await getContents();
        const snapshot = path.format({
          ...path.parse(file),
          base: '',
          ext: '.snapshot',
        });
        expect(parse(dot)).toMatchFileSnapshot(snapshot);
      } catch (e) {
        if (e instanceof DotSyntaxError) {
          console.log(e.location);
        }
        throw e;
      }
    });
  });
});

describe('Structure other than AST position and comments is retained after the stringify function.', () => {
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
    test.concurrent(file, async ({ expect }) => {
      const dot = await getContents();
      const parsed = parse(dot);
      const serialized = stringify(parsed);
      const reparsed = parse(serialized);
      removeNoise(parsed);
      removeNoise(reparsed);
      expect(parsed).toEqual(reparsed);
    });
  });
});
