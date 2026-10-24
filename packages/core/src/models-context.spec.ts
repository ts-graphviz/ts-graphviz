import { isTsGraphvizError } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { Digraph } from './Digraph.js';
import { Dot } from './Dot.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { GraphBase } from './GraphBase.js';
import { createModelsContext, defaultModelsContext } from './models-context.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

function getError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
}

describe('defaultModelsContext', () => {
  it('holds the core classes and is frozen', () => {
    const models = defaultModelsContext();
    expect(models).toStrictEqual({ Dot, Graph, Digraph, Subgraph, Node, Edge });
    expect(Object.isFrozen(models)).toBe(true);
    expect(defaultModelsContext()).toBe(models);
  });
});

describe('createModelsContext', () => {
  it('overrides only the given classes', () => {
    class MyNode extends Node {}
    const models = createModelsContext({ Node: MyNode, Edge: undefined });
    expect(models.Node).toBe(MyNode);
    expect(models.Edge).toBe(Edge);
    expect(models.Digraph).toBe(Digraph);
    expect(Object.isFrozen(models)).toBe(true);
  });

  it('is used by graphs for the models they create', () => {
    class MyNode extends Node {}
    class MySubgraph extends Subgraph {}
    const g = new Digraph();
    g.with(createModelsContext({ Node: MyNode, Subgraph: MySubgraph }));
    expect(g.createNode('a')).toBeInstanceOf(MyNode);
    const sub = g.createSubgraph('cluster_0', { label: 'x' });
    expect(sub).toBeInstanceOf(MySubgraph);
    expect(sub.id).toBe('cluster_0');
    expect(sub.get('label')).toBe('x');
    expect(sub.createNode('b')).toBeInstanceOf(MyNode);
    expect(g.createSubgraph({ label: 'y' }).id).toBeUndefined();
  });

  it('with() keeps the classes it is not given', () => {
    class MyNode extends Node {}
    class MyEdge extends Edge {}
    const g = new Graph();
    g.with({ Node: MyNode });
    g.with({ Edge: MyEdge });
    expect(g.createNode('a')).toBeInstanceOf(MyNode);
    expect(g.createEdge(['a', 'b'])).toBeInstanceOf(MyEdge);
  });

  it('a bare GraphBase subclass needs with() or defaultModels()', () => {
    class Bare extends GraphBase<'Graph'> {
      get $$type() {
        return 'Graph' as const;
      }
    }
    expect(() => new Bare().createNode('a')).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_NO_MODELS_CONTEXT' }),
    );
    expect(isTsGraphvizError(getError(() => new Bare().createNode('a')))).toBe(
      true,
    );
    const g = new Bare();
    g.with(defaultModelsContext());
    expect(g.createNode('a')).toBeInstanceOf(Node);
  });
});
