import { isTsGraphvizError } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { Digraph } from './Digraph.js';
import { Dot } from './Dot.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { GraphBase } from './GraphBase.js';
import { createModelKit, defaultModelKit } from './model-kit.js';
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

describe('defaultModelKit', () => {
  it('holds the core classes', () => {
    expect(defaultModelKit).toMatchObject({
      Dot,
      Graph,
      Digraph,
      Subgraph,
      Node,
      Edge,
    });
  });

  it('cannot be modified', () => {
    class MyNode extends Node {}
    expect(Object.isFrozen(defaultModelKit)).toBe(true);
    expect(() => {
      (defaultModelKit as { Node: unknown }).Node = MyNode;
    }).toThrow(TypeError);
    expect(() => {
      (defaultModelKit as { createNode: unknown }).createNode = () => {};
    }).toThrow(TypeError);
    expect(defaultModelKit.createNode('a')).not.toBeInstanceOf(MyNode);
  });

  it('creates the core models', () => {
    expect(defaultModelKit.createDigraph('G')).toBeInstanceOf(Digraph);
    expect(defaultModelKit.createGraph('G')).toBeInstanceOf(Graph);
    expect(defaultModelKit.createSubgraph('s')).toBeInstanceOf(Subgraph);
    expect(defaultModelKit.createNode('a')).toBeInstanceOf(Node);
    expect(defaultModelKit.createEdge(['a', 'b'])).toBeInstanceOf(Edge);
  });
});

describe('createModelKit', { tags: ['SM-5'] }, () => {
  it('overrides only the given classes', () => {
    class MyNode extends Node {}
    const kit = createModelKit({ Node: MyNode, Edge: undefined });
    expect(kit.Node).toBe(MyNode);
    expect(kit.Edge).toBe(Edge);
    expect(kit.Digraph).toBe(Digraph);
    expect(Object.isFrozen(kit)).toBe(true);
    expect(kit.createNode('a')).toBeInstanceOf(MyNode);
    expect(kit.createEdge(['a', 'b'])).toBeInstanceOf(Edge);
  });

  it('takes own properties only', () => {
    class MyNode extends Node {}
    const kit = createModelKit(Object.create({ Node: MyNode }));
    expect(kit.Node).toBe(Node);
  });

  it('takes the classes of another kit', () => {
    class MyNode extends Node {}
    class MyEdge extends Edge {}
    const kit = createModelKit({
      ...createModelKit({ Node: MyNode }),
      Edge: MyEdge,
    });
    expect(kit.createNode('a')).toBeInstanceOf(MyNode);
    expect(kit.createEdge(['a', 'b'])).toBeInstanceOf(MyEdge);
  });

  it('creates root graphs with the arguments of their constructors', () => {
    const kit = createModelKit();
    const g = kit.createDigraph('G', true, { label: 'x' });
    expect(g.id).toBe('G');
    expect(g.directed).toBe(true);
    expect(g.strict).toBe(true);
    expect(g.get('label')).toBe('x');
    const u = kit.createGraph({ label: 'y' });
    expect(u.id).toBeUndefined();
    expect(u.directed).toBe(false);
    expect(u.strict).toBe(false);
    expect(u.get('label')).toBe('y');
  });

  it('creates subgraphs with the argument shape it was called with', () => {
    const calls: unknown[][] = [];
    class MySubgraph extends Subgraph {
      constructor(...args: unknown[]) {
        super(...(args as []));
        calls.push(args);
      }
    }
    const kit = createModelKit({ Subgraph: MySubgraph });
    const sub = kit.createSubgraph('cluster_0', { label: 'x' });
    expect(sub).toBeInstanceOf(MySubgraph);
    expect(sub.id).toBe('cluster_0');
    expect(sub.get('label')).toBe('x');
    expect(kit.createSubgraph({ rank: 'same' }).id).toBeUndefined();
    expect(kit.createSubgraph().id).toBeUndefined();
    expect(calls).toStrictEqual([
      ['cluster_0', { label: 'x' }],
      [{ rank: 'same' }],
      [undefined, undefined],
    ]);
  });

  it('create* only creates: nothing is added to a graph', () => {
    const kit = createModelKit();
    const g = kit.createDigraph('G');
    const a = kit.createNode('a', { color: 'red' });
    const e = kit.createEdge([a, 'b', ['c', 'd:p:n']], { color: 'blue' });
    kit.createSubgraph('s');
    expect(g.statements).toStrictEqual([]);
    expect(a.get('color')).toBe('red');
    expect(e.get('color')).toBe('blue');
    expect(e.targets).toEqual([
      a,
      { id: 'b' },
      [{ id: 'c' }, { id: 'd', port: 'p', compass: 'n' }],
    ]);
    g.addEdge(e);
    // An edge refers to nodes; it does not put them in the graph.
    expect(g.nodes).toStrictEqual([]);
    expect(g.edges).toStrictEqual([e]);
  });

  it('the create* functions work taken off the kit', () => {
    class MyNode extends Node {}
    const { createNode, createDigraph } = createModelKit({ Node: MyNode });
    expect(createNode('a')).toBeInstanceOf(MyNode);
    expect(createDigraph('G').id).toBe('G');
  });

  it('graphs of a kit create from its classes', () => {
    class MyNode extends Node {}
    class MySubgraph extends Subgraph {}
    const kit = createModelKit({ Node: MyNode, Subgraph: MySubgraph });
    const g = kit.createDigraph();
    expect(g.createNode('a')).toBeInstanceOf(MyNode);
    const sub = g.createSubgraph('s');
    expect(sub).toBeInstanceOf(MySubgraph);
    expect(sub.createNode('b')).toBeInstanceOf(MyNode);
    expect(kit.createSubgraph('t').createNode('c')).toBeInstanceOf(MyNode);
  });

  it('is used by graphs for the models they create', () => {
    class MyNode extends Node {}
    class MySubgraph extends Subgraph {}
    const g = new Digraph();
    g.with({ Node: MyNode, Subgraph: MySubgraph });
    expect(g.createNode('a')).toBeInstanceOf(MyNode);
    const sub = g.createSubgraph('cluster_0', { label: 'x' });
    expect(sub).toBeInstanceOf(MySubgraph);
    expect(sub.id).toBe('cluster_0');
    expect(sub.get('label')).toBe('x');
    expect(sub.createNode('b')).toBeInstanceOf(MyNode);
    expect(g.createSubgraph({ rank: 'same' }).id).toBeUndefined();
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
    g.with(defaultModelKit);
    expect(g.createNode('a')).toBeInstanceOf(Node);
  });
});
