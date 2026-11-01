import type {
  AnyReadonlyDotObjectModel,
  SubgraphModel,
} from '@ts-graphviz/common';
import { Digraph, Edge, Subgraph } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { fromModel } from './from-model.js';

const thrown = (f: () => unknown): unknown => {
  try {
    f();
  } catch (e) {
    return e;
  }
  throw new Error('expected a throw');
};

describe('fromModel of a model that contains itself', {
  tags: ['SM-5'],
}, () => {
  it.each([
    ['an anonymous subgraph', undefined],
    ['a subgraph with an id', 's'],
  ])(
    'throws TSG_ERR_CYCLIC_STRUCTURE for %s among its own statements',
    (_, id) => {
      // The public API allows it; an uncoded RangeError (call stack
      // exhausted) before.
      const g = new Digraph();
      const s = new Subgraph(id);
      g.addSubgraph(s);
      s.addSubgraph(s);
      const error = thrown(() => fromModel(g));
      expect(error).toBeInstanceOf(TypeError);
      expect(error).toMatchObject({ code: 'TSG_ERR_CYCLIC_STRUCTURE' });
    },
  );

  it('throws TSG_ERR_CYCLIC_STRUCTURE for a cycle through several subgraphs', () => {
    const g = new Digraph();
    const a = new Subgraph('a');
    const b = new Subgraph('b');
    g.addSubgraph(a);
    a.addSubgraph(b);
    b.addSubgraph(a);
    expect(() => fromModel(g)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_CYCLIC_STRUCTURE' }),
    );
  });

  it('throws TSG_ERR_CYCLIC_STRUCTURE for a graph among its own statements', () => {
    const g = new Digraph();
    g.addSubgraph(g as unknown as SubgraphModel);
    expect(() => fromModel(g)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_CYCLIC_STRUCTURE' }),
    );
  });
});

describe('fromModel of a model that shares subgraphs', {
  tags: ['SM-5'],
}, () => {
  /** k levels, each holding two subgraphs that both hold the level below. */
  const doubling = (k: number) => {
    let inner = new Subgraph();
    inner.createNode('a');
    for (let i = 0; i < k; i++) {
      const left = new Subgraph();
      const right = new Subgraph();
      left.addSubgraph(inner);
      right.addSubgraph(inner);
      inner = new Subgraph();
      inner.addSubgraph(left);
      inner.addSubgraph(right);
    }
    const g = new Digraph();
    g.addSubgraph(inner);
    return g;
  };

  it('converts a shared subgraph in each place', () => {
    const ast = fromModel(doubling(2));
    expect(JSON.stringify(ast).match(/"value":"a"/g)).toHaveLength(4);
  });

  it('counts every copy toward maxASTNodes', () => {
    expect(() => fromModel(doubling(20))).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_AST_NODE_COUNT_EXCEEDED' }),
    );
  });
});

describe('the error for a model no plugin converts', { tags: ['SM-5'] }, () => {
  it('describes a $$type that is not a string without converting it', () => {
    // A template literal threw an uncoded TypeError for a symbol.
    const model = {
      $$type: Symbol('x'),
    } as unknown as AnyReadonlyDotObjectModel;
    expect(() => fromModel(model)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_NO_PLUGIN' }),
    );
  });
});

describe('the errors for an edge target', { tags: ['SM-5'] }, () => {
  it.each([
    ['port', { port: `${'p'.repeat(1_000_000)}:x` }, 'TSG_ERR_INVALID_PORT'],
    [
      'compass point',
      { compass: 'c'.repeat(1_000_000) },
      'TSG_ERR_INVALID_EDGE_TARGETS',
    ],
  ])('quote at most a short part of the %s', (_, fields, code) => {
    const g = new Digraph();
    g.addEdge(new Edge([{ id: 'a', ...fields }, { id: 'b' }] as never));
    const error = thrown(() => fromModel(g));
    expect(error).toMatchObject({ code });
    expect((error as Error).message.length).toBeLessThan(200);
  });
});
