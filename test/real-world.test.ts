///<reference types="vite/client" />

import path from 'node:path';
import {
  type ASTNode,
  DotSyntaxError,
  parse,
  stringify,
} from '@ts-graphviz/ast';
import { describe, test } from 'vitest';

describe('Ability to parse real-world DOT files and the structure of the output ASTs should not change', () => {
  for (const [file, getContents] of Object.entries(
    import.meta.glob<string>('./dot/*.dot', {
      query: 'raw',
      import: 'default',
    }),
  )) {
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
  }
});

describe('Structure other than AST location is preserved even after going through the stringify function', () => {
  function removeLocation(node: ASTNode) {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'location') {
        delete node[key];
      } else if (typeof value === 'object') {
        removeLocation(value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          removeLocation(item);
        }
      }
    }
  }

  for (const [file, getContents] of Object.entries(
    import.meta.glob<string>('./dot/*.dot', {
      query: 'raw',
      import: 'default',
    }),
  )) {
    test.concurrent(file, async ({ expect }) => {
      const dot = await getContents();
      const parsed = parse(dot);
      const serialized = stringify(parsed);
      const reparsed = parse(serialized);
      expect(removeLocation(parsed)).toEqual(removeLocation(reparsed));
    });
  }
});
