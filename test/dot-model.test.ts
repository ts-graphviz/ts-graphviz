import { fromModel, parse, toModel } from '@ts-graphviz/ast';
import { isDotModel, isRootGraphModel } from '@ts-graphviz/common';
import { Digraph, Dot, digraph, fromDot, Graph, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

describe('Dot model', () => {
  describe('core', () => {
    it('holds root graphs in order and deduplicates them', () => {
      const a = new Digraph('a');
      const b = new Graph('b');
      const dot = new Dot([a]);
      dot.addGraph(b);
      dot.addGraph(a);
      expect(dot.$$type).toBe('Dot');
      expect(dot.graphs).toStrictEqual([a, b]);
      expect(dot.existGraph(b)).toBe(true);
      dot.removeGraph(a);
      expect(dot.graphs).toStrictEqual([b]);
      expect(isDotModel(dot)).toBe(true);
      expect(isRootGraphModel(dot)).toBe(false);
    });
  });

  describe('fromModel / toModel symmetry', () => {
    it('maps a Dot model to a Dot AST and a root graph to a Graph AST', () => {
      const g = digraph('g');
      expect(fromModel(g).type).toBe('Graph');
      expect(fromModel(new Dot([g])).type).toBe('Dot');
    });

    it('round-trips multiple graphs and comments', () => {
      const source = [
        '// file header',
        '',
        '// first graph',
        'digraph "a" {',
        '  x;',
        '}',
        'graph "b" {',
        '  y;',
        '}',
        '// trailing',
        '',
      ].join('\n');
      const model = toModel(parse(source));
      expect(model.$$type).toBe('Dot');
      expect(model.graphs.map((g) => g.id)).toStrictEqual(['a', 'b']);
      expect(model.graphs[0].comment).toBe('first graph');
      expect(model.comment).toBe('file header\ntrailing');

      // The Dot model's own comment is written at the top; each graph's comment precedes it.
      expect(toDot(model)).toMatchInlineSnapshot(`
        "// file header
        // trailing
        // first graph
        digraph "a" {
          "x";
        }
        graph "b" {
          "y";
        }"
      `);
    });
  });

  describe('toDot', () => {
    it('still writes the comment of a root graph before the graph statement', () => {
      const g = digraph('g', (g) => {
        g.comment = 'hello';
        g.node('a');
      });
      expect(toDot(g)).toMatchInlineSnapshot(`
        "// hello
        digraph "g" {
          "a";
        }"
      `);
    });
  });

  describe('fromDot', () => {
    it('returns the first root graph of a DOT source', () => {
      const g = fromDot('digraph a {} graph b {}');
      expect(isRootGraphModel(g)).toBe(true);
      expect(g.id).toBe('a');
    });

    it('throws when the source has no graph', () => {
      expect(() => fromDot('// only a comment')).toThrow(/no graph/);
    });
  });
});
