import { describe, expect, it } from 'vitest';
import { sanitize } from '../../sanitize/sanitize.js';
import { stringify } from '../printer/stringify.js';
import { parse } from './parse.js';

// Token boundaries as Graphviz's lexer draws them (checked with Graphviz
// 2.43, `dot -Tcanon`). A different boundary means a different graph, and
// can hide an attribute from sanitize.
const reprint = (dot: string) => stringify(parse(dot)).replace(/\s+/g, ' ');

describe('[SM-1] token boundaries', () => {
  describe('a numeral ends where letters start', () => {
    it.each([
      // dot: graph [image=...]; node 1
      ['digraph { 1image="x" }', 'digraph { 1; image = "x"; }'],
      // dot: a -> 1; b
      ['digraph { a -> 1b }', 'digraph { a -> 1; b; }'],
      ['digraph { 1.5x }', 'digraph { 1.5; x; }'],
      ['digraph { -1fontpath="/tmp" }', 'digraph { -1; fontpath = "/tmp"; }'],
    ])('%j', (dot, expected) => {
      expect(reprint(dot)).toBe(expected);
    });

    it.each([
      'digraph { 1image="/etc/hostname" }',
      'digraph { 1stylesheet="https://example.com/x.css" }',
      'digraph { 1.5shapefile="/etc/hostname"; a [shape=epsf] }',
      'digraph { -1fontpath="/tmp" }',
    ])('so sanitize sees the attribute in %j', (dot) => {
      expect(() => sanitize(dot, { format: 'svg' })).toThrow(
        expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' }),
      );
    });
  });

  describe('keywords are never bare ids', () => {
    it.each([
      'digraph { subgraph; }',
      'digraph { node; }',
      'digraph { edge; a }',
      'digraph { graph; }',
      'digraph { a -> subgraph }',
      'digraph { SubGraph -> a }',
    ])('rejects %j, as dot does', (dot) => {
      expect(() => parse(dot)).toThrow();
    });

    it('reads `a -> subgraph s { ... }` as an edge to a subgraph or not at all', () => {
      // dot: subgraph s { b c }, a -> b, a -> c. Edges to subgraphs are not
      // supported yet; the parser must not read `subgraph` as a node.
      expect(() => parse('digraph { a -> subgraph s { b c } }')).toThrow();
    });

    it.each([
      ['digraph { subgraphx }', 'digraph { subgraphx; }'],
      ['digraph { nodex [color=red] }', 'digraph { nodex [ color = red; ]; }'],
      ['digraph { edges -> graphs }', 'digraph { edges -> graphs; }'],
      ['digraph { "subgraph" -> "node" }', 'digraph { "subgraph" -> "node"; }'],
    ])('reads an id that only starts with a keyword: %j', (dot, expected) => {
      expect(reprint(dot)).toBe(expected);
    });
  });

  describe('headers may span lines', () => {
    it.each([
      ['strict\ndigraph\nG\n{ a }', 'strict digraph G { a; }'],
      [
        'digraph { subgraph cluster_a\n{ a } }',
        'digraph { subgraph cluster_a { a; } }',
      ],
      ['digraph { subgraph\n{ a } }', 'digraph { subgraph { a; } }'],
    ])('%j', (dot, expected) => {
      expect(reprint(dot)).toBe(expected);
    });
  });
});
