import { defaultModelsContext } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import type { GraphASTNode } from '../../types.js';
import { toModel } from './to-model.js';

// ASTs built in code, outside the types: shapes JSON cannot express.
type Raw = Record<string, unknown>;
const literal = (value: string): Raw => ({
  type: 'Literal',
  value,
  kind: 'bare',
});
const node = (id: string): Raw => ({
  type: 'Node',
  id: literal(id),
  children: [],
});
const graph = (...children: Raw[]) =>
  ({
    type: 'Graph',
    directed: true,
    strict: false,
    children,
  }) as unknown as GraphASTNode;

const convert = (ast: GraphASTNode, maxSharedNodes?: number) =>
  toModel(ast, { models: defaultModelsContext(), maxSharedNodes });

const thrown = (f: () => unknown): unknown => {
  try {
    f();
  } catch (e) {
    return e;
  }
  throw new Error('expected a throw');
};

describe('toModel of an AST that contains itself', { tags: ['SM-5'] }, () => {
  it.each([
    [
      'a subgraph among its own statements',
      () => {
        const s: Raw = { type: 'Subgraph', children: [node('a')] };
        (s.children as Raw[]).push(s);
        return graph(s);
      },
    ],
    [
      'a subgraph as a target of its own edge',
      () => {
        const s: Raw = { type: 'Subgraph', children: [] };
        (s.children as Raw[]).push({
          type: 'Edge',
          targets: [s, { type: 'NodeRef', id: literal('b') }],
          children: [],
        });
        return graph(s);
      },
    ],
  ])('throws TSG_ERR_CYCLIC_STRUCTURE for %s', (_, build) => {
    // An uncoded RangeError (call stack exhausted) before.
    const error = thrown(() => convert(build()));
    expect(error).toBeInstanceOf(TypeError);
    expect(error).toMatchObject({ code: 'TSG_ERR_CYCLIC_STRUCTURE' });
  });
});

describe('toModel of an AST that shares nodes', { tags: ['SM-5'] }, () => {
  /** A subgraph that holds the next one twice, k levels deep. */
  const doubling = (k: number): Raw => {
    let inner = node('a');
    for (let i = 0; i < k; i++) {
      inner = { type: 'Subgraph', children: [inner, inner] };
    }
    return inner;
  };

  it('stops a subgraph shared at every level from converting 2^k times', () => {
    // k = 20 took 10 s before; k = 40 would never finish.
    const start = performance.now();
    const error = thrown(() => convert(graph(doubling(40))));
    expect(performance.now() - start).toBeLessThan(1000);
    expect(error).toBeInstanceOf(RangeError);
    expect(error).toMatchObject({
      code: 'TSG_ERR_SHARED_NODE_COUNT_EXCEEDED',
    });
  });

  it('converts a shared subgraph in each place within maxSharedNodes', () => {
    // 1 + 3 + 7 + 7 node objects reached again (see the printer's test).
    const ast = graph(doubling(3));
    expect(convert(ast, 18).subgraphs[0].subgraphs).toHaveLength(2);
    expect(() => convert(ast, 17)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_SHARED_NODE_COUNT_EXCEEDED' }),
    );
    expect(() => convert(graph(doubling(12)), 0)).not.toThrow();
  });
});

describe('toModel of deeply nested subgraphs', { tags: ['SM-5'] }, () => {
  it('collects the nodes of each level once, not once per level above', () => {
    // Counted, not timed: each level's statements are read a fixed number
    // of times (before, every level walked every level below it again, about
    // levels² / 2 reads). A shallow tree keeps clear of the call stack, which
    // the recursive conversion uses at every level.
    const levels = 200;
    let reads = 0;
    let inner: Raw = node('a');
    for (let i = 0; i < levels; i++) {
      const children = [
        { type: 'Attribute', key: literal('color'), value: literal('red') },
        inner,
      ];
      inner = { type: 'Subgraph' };
      Object.defineProperty(inner, 'children', {
        get: () => {
          reads++;
          return children;
        },
        enumerable: true,
      });
    }
    convert(graph(inner));
    expect(reads).toBeLessThanOrEqual(4 * levels);
  });
});

describe('the error for an AST node no plugin converts', {
  tags: ['SM-5'],
}, () => {
  it('describes a type that is not a string without converting it', () => {
    // A template literal threw an uncoded TypeError for a symbol.
    const ast = { type: Symbol('x') } as unknown as GraphASTNode;
    expect(() => convert(ast)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_NO_PLUGIN' }),
    );
  });
});
