///<reference types="vite/client" />

import { type ASTNode, parse, stringify } from '@ts-graphviz/ast';
import { describe, it } from 'vitest';

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

/**
 * Counts the AST nodes of `ast` by type, and by kind for the types that
 * have one (literals, attribute lists, comments), as one sorted line such
 * as `Attribute=3 Dot=1 Graph=1 Literal:bare=8 ...`.
 */
function summarize(ast: ASTNode): string {
  const counts = new Map<string, number>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (value === null || typeof value !== 'object') return;
    const node = value as Record<string, unknown>;
    if (typeof node.type === 'string') {
      const key =
        typeof node.kind === 'string' ? `${node.type}:${node.kind}` : node.type;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const [key, child] of Object.entries(node)) {
      if (key !== 'location') visit(child);
    }
  };
  visit(ast);
  return [...counts]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, count]) => `${key}=${count}`)
    .join(' ');
}

describe('Real-world DOT file parsing', () => {
  forEachDotFile((file, getContents) => {
    it.concurrent(`parses ${file} into the expected numbers of AST nodes`, async ({
      expect,
    }) => {
      const dot = await getContents();
      expect(summarize(parse(dot))).toMatchSnapshot();
    });
  });
});

describe('AST stringify round-trip consistency', () => {
  function removeNoise(node: ASTNode) {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'location') {
        delete node[key];
      } else if (Array.isArray(value)) {
        // @ts-expect-error
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
    it.concurrent(`retains AST structure after stringify for ${file}`, async ({
      expect,
    }) => {
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
