import { fromModel, parse, toModel } from '@ts-graphviz/ast';
import { isDotModel, isRootGraphModel } from '@ts-graphviz/common';
import {
  Digraph,
  Dot,
  defaultModelKit,
  digraph,
  fromDot,
  Graph,
  modelOf,
  toDot,
} from 'ts-graphviz';
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
      expect(fromModel(new Dot([modelOf(g)])).type).toBe('Dot');
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
      const model = toModel(parse(source), { models: defaultModelKit });
      expect(model.$$type).toBe('Dot');
      expect(model.graphs.map((g) => g.id)).toStrictEqual(['a', 'b']);
      // Both comments lead the first graph, in order; the one after the
      // last graph is the source's own, at its end.
      expect(model.graphs[0].comments.map((c) => c.text)).toEqual([
        'file header',
        'first graph',
      ]);
      expect(model.comments.map((c) => [c.text, c.position])).toEqual([
        ['trailing', 'end'],
      ]);

      // The comments are written back where they were.
      expect(toDot(model)).toMatchInlineSnapshot(`
        "// file header

        // first graph
        digraph "a" {
          "x";
        }
        graph "b" {
          "y";
        }
        // trailing"
      `);
    });
  });

  describe('parser', () => {
    it('validates edge operators per root graph', () => {
      // edge operator checks must not leak from one root graph into the next
      const model = toModel(parse('digraph { a -> b } graph { c -- d }'), {
        models: defaultModelKit,
      });
      expect(model.graphs.map((g) => g.directed)).toStrictEqual([true, false]);
      expect(() => parse('digraph { a -> b } graph { c -> d }')).toThrow(
        /"--" operator/,
      );
    });
  });

  describe('toDot', () => {
    it('still writes the comment of a root graph before the graph statement', () => {
      const g = digraph('g', (g) => {
        g.addComment('hello');
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
    it('returns the root graph of a DOT source', () => {
      const g = fromDot('digraph a {}');
      expect(isRootGraphModel(g)).toBe(true);
      expect(g.id).toBe('a');
    });

    it('throws when the source has no graph', () => {
      expect(() => fromDot('// only a comment')).toThrow(
        expect.objectContaining({ code: 'TSG_ERR_NO_GRAPH' }),
      );
    });
  });
});
