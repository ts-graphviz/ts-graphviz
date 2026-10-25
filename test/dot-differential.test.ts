import { execFileSync } from 'node:child_process';
import { digraph, fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

const hasDot = (() => {
  try {
    execFileSync('dot', ['-V'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

// Strings over an alphabet of DOT syntax characters, written with toDot and
// read by the real `dot`: the graph Graphviz builds keeps the nodes, the edge
// and the attributes that were set, and nothing more.
const ALPHABET = [
  '\\',
  '\\',
  '"',
  '<',
  '>',
  '\n',
  '\r',
  ';',
  '[',
  ']',
  '=',
  ' ',
  'a',
  '/',
  '*',
  '#',
  '-',
  '{',
  '}',
  '&',
];

describe.skipIf(!hasDot)('toDot output as Graphviz reads it', () => {
  it('adds no nodes, edges or attributes, whatever the strings', () => {
    let seed = 1;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const text = () =>
      Array.from(
        { length: Math.floor(rand() * 12) },
        () => ALPHABET[Math.floor(rand() * ALPHABET.length)],
      ).join('');
    for (let i = 0; i < 300; i++) {
      const id = text() || 'x';
      const g = digraph('G');
      g.node(id, {
        label: (rand() < 0.2 ? [text()] : text()) as string,
        tooltip: text(),
        [text() || 'k']: text(),
      } as never);
      g.edge([id, 'other']);
      const dot = toDot(g);
      const model = fromDot(
        execFileSync('dot', ['-Tcanon'], { input: dot, encoding: 'utf8' }),
      );
      expect(model.nodes.length).toBeLessThanOrEqual(2);
      expect(model.edges).toHaveLength(1);
      expect(model.subgraphs).toHaveLength(0);
      expect(
        model.nodes.reduce((n, node) => n + node.attributes.size, 0),
      ).toBeLessThanOrEqual(3);
    }
  });
});
