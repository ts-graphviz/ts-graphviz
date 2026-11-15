import { describe, expect, it } from 'vitest';
import { Digraph } from './Digraph.js';
import { Dot } from './Dot.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { createModelKit, defaultModelKit } from './model-kit.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

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

  it('is the default kit when no class differs from the default ones', () => {
    expect(createModelKit()).toBe(defaultModelKit);
    expect(createModelKit({})).toBe(defaultModelKit);
    expect(createModelKit({ Node, Edge: undefined })).toBe(defaultModelKit);
    expect(createModelKit(defaultModelKit)).toBe(defaultModelKit);
    class MyNode extends Node {}
    expect(createModelKit({ Node: MyNode })).not.toBe(defaultModelKit);
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
    expect(kit.createSubgraph(undefined, { rank: 'min' }).id).toBeUndefined();
    expect(calls).toStrictEqual([
      ['cluster_0', { label: 'x' }],
      [{ rank: 'same' }],
      [],
      [undefined, { rank: 'min' }],
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

  it('its graphs keep no kit: a graph holds whatever is added to it', () => {
    class MyNode extends Node {}
    const kit = createModelKit({ Node: MyNode });
    const g = kit.createDigraph();
    const plain = defaultModelKit.createNode('a');
    const mine = kit.createNode('b');
    g.addNode(plain);
    g.addNode(mine);
    expect(g.nodes).toStrictEqual([plain, mine]);
    expect('with' in g).toBe(false);
    expect('createNode' in g).toBe(false);
  });
});
