import { fromModel } from '@ts-graphviz/ast';
import {
  type AnyDotObjectModel,
  type EdgeTargetTuple,
  isEdgeModel,
  isNodeModel,
  isRootGraphModel,
  isSubgraphModel,
  MODEL,
  modelOf,
  type NodeModel,
} from '@ts-graphviz/common';
import {
  createModelsContext,
  Digraph,
  Dot,
  Node,
  Subgraph,
} from '@ts-graphviz/core';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { dsl } from './dsl.js';
import { digraph } from './model-factory.js';
import { toDot } from './to-dot.js';

function graph() {
  return dsl(new Digraph('G'));
}

/** Every model in a graph, read from the models (not through a DSL). */
function* modelsIn(g: AnyDotObjectModel): Generator<object> {
  yield g;
  if (g.$$type !== 'Graph' && g.$$type !== 'Subgraph') return;
  yield g.attributes.graph;
  yield g.attributes.node;
  yield g.attributes.edge;
  for (const s of g.statements) {
    if (s.$$type === 'Subgraph') yield* modelsIn(s);
    else yield s;
    if (s.$$type === 'Edge') {
      for (const t of s.targets.flat()) yield t;
    }
  }
}

describe('DOT statements', () => {
  let g: ReturnType<typeof graph>;
  beforeEach(() => {
    g = graph();
  });

  describe('node', () => {
    test('creates a node with the graph’s createNode', () => {
      const createNode = vi.spyOn(modelOf(g), 'createNode');
      const node = g.node('foo');
      expect(createNode).toHaveBeenCalledWith('foo');
      expect(g.$existNode('foo')).toBe(true);
      expect(node.$id).toBe('foo');
    });

    test('gives the node there is, with the attributes applied', () => {
      const created = g.$createNode('foo');
      const createNode = vi.spyOn(modelOf(g), 'createNode');
      const node = g.node('foo', { label: 'Test label' });
      expect(createNode).not.toHaveBeenCalled();
      expect(node).toBe(created);
      expect(node.label).toBe('Test label');
    });

    test('calls the callback with the node', () => {
      const callback = vi.fn();
      const node = g.node('foo', { label: 'Test label' }, callback);
      expect(callback).toHaveBeenCalledWith(node);
      expect(g.node('foo', callback)).toBe(node);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    test('sets the default node attributes', () => {
      expect(g.node({ label: 'Test label' })).toBeUndefined();
      expect(g.$attributes.node.label).toBe('Test label');
    });
  });

  describe('edge', () => {
    let nodes: EdgeTargetTuple;
    beforeEach(() => {
      nodes = [modelOf(g).createNode('foo'), modelOf(g).createNode('bar')];
    });

    test('creates an edge with the graph’s createEdge', () => {
      const createEdge = vi.spyOn(modelOf(g), 'createEdge');
      g.edge(nodes, { label: 'Test label' });
      expect(createEdge).toHaveBeenCalledWith(nodes, { label: 'Test label' });
    });

    test('calls the callback with the edge', () => {
      const callback = vi.fn();
      const edge = g.edge(nodes, { label: 'Test label' }, callback);
      expect(callback).toHaveBeenCalledWith(edge);
      expect(edge.label).toBe('Test label');
      const other = g.edge(nodes, callback);
      expect(callback).toHaveBeenLastCalledWith(other);
    });

    test('ignores null as the attributes (#1593)', () => {
      const edge = g.edge(nodes, null as never);
      expect(edge.$attributes.size).toBe(0);
      expect(g.$edges).toStrictEqual([edge]);
    });

    test('sets the default edge attributes', () => {
      expect(g.edge({ label: 'Test label' })).toBeUndefined();
      expect(g.$attributes.edge.label).toBe('Test label');
    });
  });

  describe('subgraph', () => {
    test('creates one with the graph’s createSubgraph', () => {
      const createSubgraph = vi.spyOn(modelOf(g), 'createSubgraph');
      expect(modelOf(g.subgraph())).toBeInstanceOf(Subgraph);
      expect(createSubgraph).toHaveBeenLastCalledWith();
      g.subgraph('cluster_foo', { label: 'Test label' });
      expect(createSubgraph).toHaveBeenLastCalledWith('cluster_foo');
      expect(g.subgraph({ rank: 'same' }).rank).toBe('same');
    });

    test('gives the subgraph there is with this id', () => {
      const created = g.$createSubgraph('cluster_foo');
      const createSubgraph = vi.spyOn(modelOf(g), 'createSubgraph');
      const subgraph = g.subgraph('cluster_foo', { label: 'Test label' });
      expect(createSubgraph).not.toHaveBeenCalled();
      expect(subgraph).toBe(created);
      expect(subgraph.label).toBe('Test label');
    });

    test('calls the callback with the subgraph', () => {
      const callback = vi.fn();
      const a = g.subgraph(callback);
      expect(callback).toHaveBeenLastCalledWith(a);
      const b = g.subgraph({ rank: 'same' }, callback);
      expect(callback).toHaveBeenLastCalledWith(b);
      const c = g.subgraph('foo', callback);
      expect(callback).toHaveBeenLastCalledWith(c);
      const d = g.subgraph('cluster_foo', { label: 'L' }, callback);
      expect(callback).toHaveBeenLastCalledWith(d);
    });

    test('takes the empty id as an id; no id makes an anonymous one (#1593)', () => {
      const empty = g.subgraph('');
      expect(empty.$id).toBe('');
      expect(g.subgraph('')).toBe(empty);
      const anonymous = g.subgraph();
      expect(anonymous).not.toBe(empty);
      expect(anonymous.$id).toBeUndefined();
      expect(g.$subgraphs).toStrictEqual([empty, anonymous]);
    });

    test('reads ids that are Object.prototype names as ids', () => {
      const s = g.subgraph('constructor');
      expect(g.$getSubgraph('constructor')).toBe(s);
    });
  });

  test('graph sets the default graph attributes', () => {
    g.graph({ label: 'Test label' });
    expect(g.$attributes.graph.label).toBe('Test label');
  });

  test('statements of a subgraph', () => {
    const s = g.subgraph('s');
    s.node({ label: 'n' });
    s.edge({ label: 'e' });
    s.graph({ label: 'g' });
    expect(modelOf(s).attributes.node.get('label')).toBe('n');
    expect(modelOf(s).attributes.edge.get('label')).toBe('e');
    expect(modelOf(s).attributes.graph.get('label')).toBe('g');
  });

  test('edge targets that are missing are rejected', () => {
    const n = g.node('n');
    for (const targets of [[], [n]]) {
      expect(() => g.edge(targets as never)).toThrow(
        expect.objectContaining({
          name: 'TypeError',
          code: 'TSG_ERR_INVALID_EDGE_TARGETS',
        }),
      );
    }
  });
});

describe('attributes by name', () => {
  test('read, write and delete', () => {
    const g = graph();
    const a = g.node('a');
    a.label = 'A';
    expect(modelOf(a).attributes.get('label')).toBe('A');
    expect(a.label).toBe('A');
    delete a.label;
    expect(a.label).toBeUndefined();
    a.label = 'A';
    a.label = undefined;
    expect(modelOf(a).attributes.size).toBe(0);

    g.rankdir = 'LR';
    expect(modelOf(g).get('rankdir')).toBe('LR');
    const e = g.edge(['a', 'b']);
    e.URL = 'https://example.com';
    expect(modelOf(e).attributes.get('URL')).toBe('https://example.com');
    g.$attributes.node.shape = 'box';
    expect(modelOf(g).attributes.node.get('shape')).toBe('box');
  });

  test('id, comment and size are attributes; the members take a $', () => {
    const g = graph();
    const a = g.node('a');
    a.id = 'svg-a';
    a.comment = 'attribute';
    a.$comment = 'DOT comment';
    expect(a.$id).toBe('a');
    expect(modelOf(a).attributes.get('id')).toBe('svg-a');
    expect(modelOf(a).attributes.get('comment')).toBe('attribute');
    expect(modelOf(a).comment).toBe('DOT comment');
    g.size = '7,7';
    expect(g.$size).toBe(1);
    expect(g.$id).toBe('G');
    expect(g.$$type).toBe('Graph');
    expect(g.$attributes.node.$$kind).toBe('Node');
    expect(toDot(g)).toBe(
      [
        'digraph "G" {',
        '  size = "7,7";',
        '  // DOT comment',
        '  "a" [',
        '    id = "svg-a";',
        '    comment = "attribute";',
        '  ];',
        '}',
      ].join('\n'),
    );
  });

  test('the attributes are the own properties', () => {
    const a = graph().node('a', { label: 'A', color: 'red' });
    expect({ ...a }).toStrictEqual({ label: 'A', color: 'red' });
    expect(Object.keys(a)).toStrictEqual(['label', 'color']);
    expect(JSON.parse(JSON.stringify(a))).toStrictEqual({
      label: 'A',
      color: 'red',
    });
    expect('label' in a).toBe(true);
    expect('shape' in a).toBe(false);
    expect('$id' in a).toBe(true);
  });

  test('names on Object.prototype are attributes, not inherited members', () => {
    const a = graph().node('a');
    expect(a.constructor).toBeUndefined();
    expect(a.toString).toBeUndefined();
    expect(a.hasOwnProperty).toBeUndefined();
    expect((a as unknown as { then?: unknown }).then).toBeUndefined();
    const g = graph() as unknown as Record<string, unknown>;
    expect(g.constructor).toBeUndefined();
    expect(g.toString).toBeUndefined();
    expect(Reflect.get(g, '__proto__')).toBeUndefined();
  });

  test('something added to Object.prototype is not a statement or attribute', () => {
    const proto = Object.prototype as Record<string, unknown>;
    proto.label = 'polluted';
    proto.node = () => 'polluted';
    try {
      const g = graph();
      const a = g.node('a');
      expect(a.label).toBeUndefined();
      expect(g.node).not.toBe(proto.node);
      expect(g.node('b').$id).toBe('b');
    } finally {
      delete proto.label;
      delete proto.node;
    }
  });

  test('statements and symbols cannot be written', () => {
    const g = graph();
    const unwritable = expect.objectContaining({
      name: 'TypeError',
      code: 'TSG_ERR_UNWRITABLE_PROPERTY',
    });
    expect(() => {
      (g as unknown as Record<string, unknown>).node = 1;
    }).toThrow(unwritable);
    expect(() => {
      (g as unknown as Record<symbol, unknown>)[Symbol.iterator] = 1;
    }).toThrow(unwritable);
    expect(() => Object.defineProperty(g, 'label', { value: 'x' })).toThrow(
      unwritable,
    );
    const dot = dsl(new Dot());
    expect(() => {
      (dot as unknown as Record<string, unknown>).label = 'x';
    }).toThrow(unwritable);
  });

  test('symbols other than MODEL read as undefined', () => {
    const g = graph();
    expect((g as unknown as Record<symbol, unknown>)[Symbol.iterator]).toBe(
      undefined,
    );
    expect(
      (g as unknown as Record<symbol, unknown>)[Symbol.toPrimitive],
    ).toBeUndefined();
  });
});

describe('models that cannot be extended', () => {
  test('a frozen or sealed model has a DSL that works', () => {
    const node = Object.freeze(new Node('a'));
    const a = dsl(node);
    a.label = 'A';
    expect(a.id).toBeUndefined();
    expect(a.$id).toBe('a');
    expect(Object.keys(a)).toStrictEqual(['label']);
    expect({ ...a }).toStrictEqual({ label: 'A' });
    expect(a).toBeInstanceOf(Node);
    const g = dsl(Object.seal(new Digraph('G')));
    g.rankdir = 'LR';
    expect(Object.keys(g)).toStrictEqual(['rankdir']);
    expect(g.node('b').$id).toBe('b');
  });

  test('a DSL itself cannot be frozen, sealed or given a prototype', () => {
    const a = graph().node('a');
    expect(() => Object.freeze(a)).toThrow(TypeError);
    expect(() => Object.seal(a)).toThrow(TypeError);
    expect(() => Object.preventExtensions(a)).toThrow(TypeError);
    expect(() => Object.setPrototypeOf(a, null)).toThrow(TypeError);
    expect(Object.isExtensible(a)).toBe(true);
  });
});

describe('the rules', () => {
  test('1. model methods run on the model (its private fields)', () => {
    const g = graph();
    expect(() => g.$createNode('a')).not.toThrow();
    expect(() => g.$createSubgraph('s')).not.toThrow();
    expect(g.$nodes).toHaveLength(1);
  });

  test('2. a model holds models, never DSLs', () => {
    const g = digraph('G', (g) => {
      const a = g.node('a');
      const b = g.node('b');
      const s = g.subgraph('s', (s) => s.node('c'));
      g.edge([a, [b, s.node('c').$port('p')], 'd']);
      g.$addSubgraph(s);
      g.$addNode(a);
    });
    for (const model of modelsIn(modelOf(g))) {
      expect(model[MODEL as never]).toBeUndefined();
      expect(modelOf(model)).toBe(model);
    }
    expect(modelOf(g).subgraphs).toHaveLength(1);
  });

  test('2. arguments are passed as models', () => {
    const g = graph();
    const s = g.subgraph('s');
    const e = g.edge(['a', 'b']);
    expect(g.$existSubgraph(s)).toBe(true);
    expect(g.$existEdge(e)).toBe(true);
    g.$removeEdge(e);
    expect(g.$edges).toStrictEqual([]);
    g.$removeSubgraph(s);
    expect(g.$subgraphs).toStrictEqual([]);
  });

  test('2. a model’s methods receive models, arrays included', () => {
    // A model class of your own may not unwrap what it is given.
    const received: unknown[] = [];
    class Recording extends Digraph {
      override addNode(node: NodeModel): void {
        received.push(node);
        super.addNode(node);
      }
      override createEdge(
        ...args: Parameters<Digraph['createEdge']>
      ): ReturnType<Digraph['createEdge']> {
        received.push(args[0]);
        return super.createEdge(...args);
      }
    }
    const g = dsl(new Recording());
    const a = g.$createNode('a');
    const b = g.$createNode('b');
    received.length = 0;
    g.$addNode(a);
    g.edge([a, [b, 'c']]);
    g.$createEdge([b, a]);
    expect(received).toStrictEqual([
      modelOf(a),
      [modelOf(a), [modelOf(b), 'c']],
      [modelOf(b), modelOf(a)],
    ]);
    expect(received[0]).toBe(modelOf(a));
  });

  test('2. the caller’s arrays are copied, not changed', () => {
    const g = graph();
    const a = g.node('a');
    const group = [a, 'b'] as const;
    const targets = [group, a] as const;
    g.edge(targets);
    expect(targets[0]).toBe(group);
    expect(group[0]).toBe(a);
  });

  test('3. models read through a DSL are DSLs', () => {
    const g = graph();
    const a = g.node('a');
    const s = g.subgraph('s');
    const e = g.edge([a, ['b', a]]);
    expect(g.$nodes[0]).toBe(a);
    expect(g.$getNode('a')).toBe(a);
    expect(g.$subgraphs[0]).toBe(s);
    expect(g.$statements).toStrictEqual([a, s, e]);
    expect(e.$targets[0]).toBe(a);
    expect((e.$targets[1] as unknown[])[1]).toBe(a);
    expect(g.$attributes.node).toBe(dsl(modelOf(g).attributes.node));
    expect(g.$attributes).toBe(g.$attributes);
  });

  test('4. a model has one DSL', () => {
    const model = new Digraph();
    const g = dsl(model);
    expect(dsl(model)).toBe(g);
    expect(dsl(g)).toBe(g);
    expect(g.node).toBe(g.node);
    expect(g.$createNode).toBe(g.$createNode);
    expect(modelOf(g)).toBe(model);
  });

  test('dsl takes only models', () => {
    for (const value of [null, 1, 'a', {}, { $$type: 'Other' }, []]) {
      expect(() => dsl(value as never)).toThrow(
        expect.objectContaining({
          name: 'TypeError',
          code: 'TSG_ERR_NOT_A_MODEL',
        }),
      );
    }
  });

  test('MODEL answers only to the DSL itself', () => {
    const g = graph();
    expect(g[MODEL]).toBe(modelOf(g));
    const child = Object.create(g);
    expect(child[MODEL]).toBeUndefined();
  });
});

describe('arrays of DSLs', () => {
  test('find a model by its DSL', () => {
    const g = graph();
    const a = g.node('a');
    const b = g.node('b');
    const nodes = g.$nodes;
    expect(nodes.includes(modelOf(b) as never)).toBe(true);
    expect(nodes.indexOf(modelOf(b) as never)).toBe(1);
    expect(nodes.lastIndexOf(modelOf(a) as never)).toBe(0);
    expect(nodes.includes(new Node('a') as never)).toBe(false);
    expect(nodes.indexOf(b)).toBe(1);
  });

  test('stay plain arrays', () => {
    const g = graph();
    g.node('a');
    const nodes = g.$nodes;
    expect(Array.isArray(nodes)).toBe(true);
    expect(Object.keys(nodes)).toStrictEqual(['0']);
  });
});

describe('the readers take a DSL', () => {
  const g = digraph('G', { label: 'root' }, (g) => {
    g.node('a', { label: 'A' });
    g.edge(['a', 'b']);
    g.subgraph('cluster_s', (s) => s.node('c'));
  });

  test('toDot and fromModel', () => {
    expect(toDot(g)).toBe(toDot(modelOf(g)));
    expect(fromModel(g)).toStrictEqual(fromModel(modelOf(g)));
    expect(toDot(g.$nodes[0])).toBe(toDot(modelOf(g).nodes[0]));
  });

  test('the guards', () => {
    expect(isRootGraphModel(g)).toBe(true);
    expect(isNodeModel(g.$nodes[0])).toBe(true);
    expect(isEdgeModel(g.$edges[0])).toBe(true);
    expect(isSubgraphModel(g.$subgraphs[0])).toBe(true);
    expect(isNodeModel(g)).toBe(false);
  });
});

describe('custom models', () => {
  test('the statements use the classes of the models context', () => {
    class MyNode extends Node {
      public mine = true;
    }
    const createNode = vi.fn();
    class MyDigraph extends Digraph {
      override createNode(id: string): NodeModel {
        createNode(id);
        return super.createNode(id);
      }
    }
    const model = new MyDigraph();
    model.with(createModelsContext({ Node: MyNode }));
    const g = dsl(model);
    const a = g.node('a');
    expect(createNode).toHaveBeenCalledWith('a');
    expect(modelOf(a)).toBeInstanceOf(MyNode);
    expect((a as unknown as { $mine: boolean }).$mine).toBe(true);
  });

  test('a class’s own node() is reached with $node()', () => {
    class Custom extends Digraph {
      node(id: string) {
        return this.createNode(`custom-${id}`);
      }
    }
    const g = dsl(new Custom());
    expect(g.node('a').$id).toBe('a');
    const custom = (
      g as unknown as { $node(id: string): { $id: string } }
    ).$node('b');
    expect(custom.$id).toBe('custom-b');
  });
});
