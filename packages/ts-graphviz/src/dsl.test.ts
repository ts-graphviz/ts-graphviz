import { fromModel } from '@ts-graphviz/ast';
import {
  type AnyDotObjectModel,
  type AttributeListAttributes,
  type AttributeListKind,
  type EdgeTargetTuple,
  type EmptySchema,
  type GraphCommonAttributes,
  isEdgeModel,
  isNodeModel,
  isNodeRef,
  isRootGraphModel,
  isSubgraphModel,
  MODEL,
  type ModelKit,
  modelOf,
  type NodeModel,
  type NonClusterSubgraphAttributesObject,
  type StatementAttributeListModel,
  type SubgraphAttributesObject,
  toNodeRef,
  toNodeRefGroup,
} from '@ts-graphviz/common';
import {
  createModelKit,
  Digraph,
  Dot,
  defaultModelKit,
  Edge,
  LegacyDigraph,
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

  /** The default kit, with spies in place of its `create*`. */
  function spyKit() {
    return {
      ...defaultModelKit,
      createNode: vi.fn(defaultModelKit.createNode),
      createEdge: vi.fn(defaultModelKit.createEdge),
      createSubgraph: vi.fn(defaultModelKit.createSubgraph),
    };
  }

  describe('node', () => {
    test('creates a node with the kit and adds it', () => {
      const kit = spyKit();
      const node = dsl(modelOf(g), kit).node('foo');
      expect(kit.createNode).toHaveBeenCalledWith('foo');
      expect(modelOf(g).getNodes('foo')[0]).toBe(modelOf(node));
      expect(modelOf(node).id).toBe('foo');
    });

    test('declares the node again when the graph has one with the id', () => {
      const created = g.node('foo');
      const kit = spyKit();
      const node = dsl(modelOf(g), kit).node('foo', { label: 'Test label' });
      expect(kit.createNode).toHaveBeenCalledWith('foo', {
        label: 'Test label',
      });
      expect(modelOf(g).getNodes('foo')).toStrictEqual([
        modelOf(created),
        modelOf(node),
      ]);
      expect(created.label).toBeUndefined();
      expect(node.label).toBe('Test label');
    });

    test('declares the node again when Object.prototype has a getNode', () => {
      const proto = Object.prototype as {
        getNode?: unknown;
        getSubgraph?: unknown;
      };
      const first = g.node('foo');
      proto.getNode = () => modelOf(first);
      proto.getSubgraph = () => undefined;
      try {
        g.node('foo');
        expect(modelOf(g).getNodes('foo')).toHaveLength(2);
      } finally {
        delete proto.getNode;
        delete proto.getSubgraph;
      }
    });

    test('declares the node again in a graph whose class has a getNode of its own', () => {
      class Finder extends Digraph {
        getNode(id: string): NodeModel | undefined {
          return this.getNodes(id)[0];
        }
      }
      const finder = dsl(new Finder());
      const first = finder.node('foo');
      const second = finder.node('foo');
      expect(second).not.toBe(first);
      expect(modelOf(finder.subgraph('s'))).toBeInstanceOf(Subgraph);
    });

    test('gives the node there is in a legacy graph, with the attributes applied', () => {
      const legacy = dsl(new LegacyDigraph());
      const created = legacy.node('foo');
      const kit = spyKit();
      const node = dsl(modelOf(legacy), kit).node('foo', { label: 'L' });
      expect(kit.createNode).not.toHaveBeenCalled();
      expect(modelOf(node)).toBe(modelOf(created));
      expect(node.label).toBe('L');
    });

    test('calls the callback with the node and the kit', () => {
      const callback = vi.fn();
      const node = g.node('foo', { label: 'Test label' }, callback);
      expect(callback).toHaveBeenCalledWith(node, defaultModelKit);
      const again = g.node('foo', callback);
      expect(callback).toHaveBeenLastCalledWith(again, defaultModelKit);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    test('sets the default node attributes', () => {
      const defaults = g.node({ label: 'Test label' });
      // Before any statement, the leading defaults.
      expect(modelOf(defaults)).toBe(modelOf(g).attributes.node);
      expect(defaults.label).toBe('Test label');
    });
  });

  describe('edge', () => {
    let nodes: EdgeTargetTuple;
    beforeEach(() => {
      nodes = [modelOf(g.node('foo')), modelOf(g.node('bar'))];
    });

    test('creates an edge with the kit and adds it', () => {
      const kit = spyKit();
      const edge = dsl(modelOf(g), kit).edge(nodes, { label: 'Test label' });
      expect(kit.createEdge).toHaveBeenCalledWith(nodes, {
        label: 'Test label',
      });
      expect(modelOf(g).edges).toStrictEqual([modelOf(edge)]);
    });

    test('does not add the nodes the targets refer to', () => {
      g.edge(['x', 'y']);
      expect(modelOf(g).existNode('x')).toBe(false);
      expect(modelOf(g).existNode('y')).toBe(false);
    });

    test('calls the callback with the edge and the kit', () => {
      const callback = vi.fn();
      const edge = g.edge(nodes, { label: 'Test label' }, callback);
      expect(callback).toHaveBeenCalledWith(edge, defaultModelKit);
      expect(edge.label).toBe('Test label');
      const other = g.edge(nodes, callback);
      expect(callback).toHaveBeenLastCalledWith(other, defaultModelKit);
    });

    test('ignores null as the attributes (#1593)', () => {
      const edge = g.edge(nodes, null as never);
      expect(Object.keys(edge)).toStrictEqual([]);
      expect(modelOf(g).edges).toStrictEqual([modelOf(edge)]);
    });

    test('sets the default edge attributes', () => {
      const defaults = g.edge({ label: 'Test label' });
      // After the two nodes, a statement in its place.
      expect(modelOf(g).statements.at(-1)).toBe(modelOf(defaults));
      expect(defaults.label).toBe('Test label');
    });
  });

  describe('subgraph', () => {
    test('creates one with the kit and adds it', () => {
      const kit = spyKit();
      const G = dsl(modelOf(g), kit);
      const anonymous = G.subgraph();
      expect(modelOf(anonymous)).toBeInstanceOf(Subgraph);
      expect(kit.createSubgraph).toHaveBeenLastCalledWith();
      const named = G.subgraph('cluster_foo', { label: 'Test label' });
      expect(kit.createSubgraph).toHaveBeenLastCalledWith('cluster_foo', {
        label: 'Test label',
      });
      expect(G.subgraph({ rank: 'same' }).rank).toBe('same');
      expect(modelOf(g).subgraphs.slice(0, 2)).toStrictEqual([
        modelOf(anonymous),
        modelOf(named),
      ]);
    });

    test('declares the subgraph again when the graph has one with the id', () => {
      const created = g.subgraph('cluster_foo');
      const kit = spyKit();
      const subgraph = dsl(modelOf(g), kit).subgraph('cluster_foo', {
        label: 'Test label',
      });
      expect(kit.createSubgraph).toHaveBeenCalledWith('cluster_foo', {
        label: 'Test label',
      });
      expect(modelOf(g).getSubgraphs('cluster_foo')).toStrictEqual([
        modelOf(created),
        modelOf(subgraph),
      ]);
      expect(subgraph.label).toBe('Test label');
    });

    test('gives the subgraph there is in a legacy graph', () => {
      const legacy = dsl(new LegacyDigraph());
      const created = legacy.subgraph('cluster_foo');
      const kit = spyKit();
      const subgraph = dsl(modelOf(legacy), kit).subgraph('cluster_foo', {
        label: 'L',
      });
      expect(kit.createSubgraph).not.toHaveBeenCalled();
      expect(modelOf(subgraph)).toBe(modelOf(created));
      expect(subgraph.label).toBe('L');
    });

    test('calls the callback with the subgraph and the kit', () => {
      const callback = vi.fn();
      const a = g.subgraph(callback);
      expect(callback).toHaveBeenLastCalledWith(a, defaultModelKit);
      const b = g.subgraph({ rank: 'same' }, callback);
      expect(callback).toHaveBeenLastCalledWith(b, defaultModelKit);
      const c = g.subgraph('foo', callback);
      expect(callback).toHaveBeenLastCalledWith(c, defaultModelKit);
      const d = g.subgraph('cluster_foo', { label: 'L' }, callback);
      expect(callback).toHaveBeenLastCalledWith(d, defaultModelKit);
    });

    test('a subgraph’s DSL creates with the same kit', () => {
      class MyNode extends Node {}
      const kit = createModelKit({ Node: MyNode });
      const G = dsl(modelOf(g), kit);
      G.subgraph('s', (s, given) => {
        expect(given).toBe(kit);
        expect(modelOf(s.node('a'))).toBeInstanceOf(MyNode);
        s.subgraph('t', (t) => {
          expect(modelOf(t.node('b'))).toBeInstanceOf(MyNode);
        });
      });
    });

    test('takes the empty id as an id; no id makes an anonymous one (#1593)', () => {
      const empty = g.subgraph('');
      expect(modelOf(empty).id).toBe('');
      expect(modelOf(g).getSubgraphs('')).toStrictEqual([modelOf(empty)]);
      const anonymous = g.subgraph();
      expect(anonymous).not.toBe(empty);
      expect(modelOf(anonymous).id).toBeUndefined();
      expect(modelOf(g).subgraphs).toStrictEqual([
        modelOf(empty),
        modelOf(anonymous),
      ]);
    });

    test('reads ids that are Object.prototype names as ids', () => {
      const s = g.subgraph('constructor');
      expect(modelOf(g).getSubgraphs('constructor')[0]).toBe(modelOf(s));
    });
  });

  test('graph sets the default graph attributes', () => {
    g.graph({ label: 'Test label' });
    expect(modelOf(g).attributes.graph.get('label')).toBe('Test label');
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
    dsl(modelOf(g).attributes.node).shape = 'box';
    expect(modelOf(g).attributes.node.get('shape')).toBe('box');
  });

  test('id, comment and size are attributes; the names are on the model', () => {
    const g = graph();
    const a = g.node('a');
    a.id = 'svg-a';
    a.comment = 'attribute';
    a.addComment('DOT comment');
    expect(modelOf(a).id).toBe('a');
    expect(modelOf(a).getAttribute('id')).toBe('svg-a');
    expect(modelOf(a).getAttribute('comment')).toBe('attribute');
    expect(modelOf(a).comments.map((c) => c.text)).toStrictEqual([
      'DOT comment',
    ]);
    g.size = '7,7';
    expect(modelOf(g).getAttribute('size')).toBe('7,7');
    expect(modelOf(g).id).toBe('G');
    expect(g.$$type).toBe('Graph');
    expect(dsl(modelOf(g).attributes.node).$$kind).toBe('Node');
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

  test('only the DSL members are not attributes', () => {
    const g = graph();
    const a = g.node('a');
    const e = g.edge(['a', 'b']);
    const any = (x: object) => x as unknown as Record<string, unknown>;
    // The model's other members read as attributes (none set).
    for (const name of ['createNode', 'nodes', 'getAttribute', 'comments']) {
      expect(any(g)[name]).toBeUndefined();
    }
    expect(any(a).getAttribute).toBeUndefined();
    expect(any(e).targets).toBeUndefined();
    expect(any(e).port).toBeUndefined();
    expect(typeof a.port).toBe('function');
    expect(typeof e.addComment).toBe('function');
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
    expect('port' in a).toBe(true);
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
      expect(modelOf(g.node('b')).id).toBe('b');
    } finally {
      delete proto.label;
      delete proto.node;
    }
  });

  test('statements, members and symbols cannot be written', () => {
    const g = graph();
    const unwritable = expect.objectContaining({
      name: 'TypeError',
      code: 'TSG_ERR_UNWRITABLE_PROPERTY',
    });
    expect(() => {
      (g as unknown as Record<string, unknown>).node = 1;
    }).toThrow(unwritable);
    expect(() => {
      (g as unknown as Record<string, unknown>).addComment = 1;
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

  test('in, delete and own properties: attributes, members and statements', () => {
    const g = graph();
    const a = g.node('a', { label: 'A' });
    const symbol = Symbol('s');

    // attributes
    expect('label' in a).toBe(true);
    expect('shape' in a).toBe(false);
    expect(Reflect.getOwnPropertyDescriptor(a, 'label')).toStrictEqual({
      value: 'A',
      writable: true,
      enumerable: true,
      configurable: true,
    });
    expect(Reflect.getOwnPropertyDescriptor(a, 'shape')).toBeUndefined();

    // members: in the DSL, not deletable, not own properties
    expect('port' in a).toBe(true);
    expect('addComment' in a).toBe(true);
    expect(Reflect.getOwnPropertyDescriptor(a, 'port')).toBeUndefined();
    expect(Reflect.deleteProperty(a, 'port')).toBe(true);
    expect(typeof a.port).toBe('function');
    // An attribute named like a member is on the model only.
    modelOf(a).setAttribute('port' as never, 'x' as never);
    expect(typeof a.port).toBe('function');
    expect(Reflect.ownKeys(a)).toStrictEqual(['label']);
    expect(Reflect.getOwnPropertyDescriptor(a, 'port')).toBeUndefined();
    expect(modelOf(a).getAttribute('port' as never)).toBe('x');
    // Writing or deleting the name reaches the member, not the attribute.
    expect(() => {
      (a as unknown as Record<string, unknown>).port = 'y';
    }).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_UNWRITABLE_PROPERTY' }),
    );
    expect(Reflect.deleteProperty(a, 'port')).toBe(true);
    expect(modelOf(a).getAttribute('port' as never)).toBe('x');
    modelOf(a).removeAttribute('port' as never);

    // statements: in a graph, not deletable, not own properties
    expect('node' in g).toBe(true);
    expect(Reflect.deleteProperty(g, 'node')).toBe(true);
    expect(typeof g.node).toBe('function');
    expect(Reflect.getOwnPropertyDescriptor(g, 'node')).toBeUndefined();

    // symbols: none but MODEL
    expect(MODEL in a).toBe(true);
    expect(symbol in a).toBe(false);
    expect(Reflect.deleteProperty(a, symbol)).toBe(true);
    expect(Reflect.getOwnPropertyDescriptor(a, symbol)).toBeUndefined();
    expect(Object.keys(a)).toStrictEqual(['label']);

    expect(Reflect.deleteProperty(a, 'label')).toBe(true);
    expect(modelOf(a).attributes.get('label')).toBeUndefined();
    expect('label' in a).toBe(false);
    expect(Reflect.getOwnPropertyDescriptor(a, 'label')).toBeUndefined();
    expect(Object.keys(a)).toStrictEqual([]);
  });

  test('a Dot has no attributes to read, list or delete', () => {
    const dot = dsl(new Dot());
    const any = dot as unknown as Record<string, unknown>;
    expect(any.label).toBeUndefined();
    expect('label' in dot).toBe(false);
    expect(Reflect.deleteProperty(dot, 'label')).toBe(true);
    expect(Object.keys(dot)).toStrictEqual([]);
    expect(Reflect.getOwnPropertyDescriptor(dot, 'label')).toBeUndefined();
  });
});

describe('models that cannot be extended', () => {
  test('a frozen or sealed model has a DSL that works', () => {
    const node = Object.freeze(new Node('a'));
    const a = dsl(node);
    a.label = 'A';
    expect(a.id).toBeUndefined();
    expect(modelOf(a).id).toBe('a');
    expect(Object.keys(a)).toStrictEqual(['label']);
    expect({ ...a }).toStrictEqual({ label: 'A' });
    expect(a).toBeInstanceOf(Node);
    const g = dsl(Object.seal(new Digraph('G')));
    g.rankdir = 'LR';
    expect(Object.keys(g)).toStrictEqual(['rankdir']);
    expect(modelOf(g.node('b')).id).toBe('b');
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
    const a = graph().node('a');
    expect(() => a.addComment('note')).not.toThrow();
    expect(modelOf(a).comments).toHaveLength(1);
    expect(a.port('p')).toStrictEqual({ id: 'a', port: 'p' });
  });

  test('2. a model holds models, never DSLs', () => {
    const g = digraph('G', (g) => {
      const a = g.node('a');
      const b = g.node('b');
      const s = g.subgraph('s', (s) => s.node('c'));
      g.edge([a, [b, s.node('c').port('p')], 'd']);
    });
    for (const model of modelsIn(modelOf(g))) {
      expect(model[MODEL as never]).toBeUndefined();
      expect(modelOf(model)).toBe(model);
    }
    expect(modelOf(g).subgraphs).toHaveLength(1);
  });

  test('2. the kit and the model receive models, arrays included', () => {
    // A kit or a model class of your own may not unwrap what it is given.
    const received: unknown[] = [];
    const kit: ModelKit = {
      ...defaultModelKit,
      createEdge: (targets, attributes) => {
        received.push(targets);
        return defaultModelKit.createEdge(targets, attributes);
      },
    };
    const g = dsl(new Digraph(), kit);
    const a = g.node('a');
    const b = g.node('b');
    g.edge([a, [b, 'c']]);
    expect(received).toStrictEqual([[modelOf(a), [modelOf(b), 'c']]]);
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

  test('3. what a statement gives is a DSL', () => {
    const g = graph();
    const a = g.node('a');
    const s = g.subgraph('s');
    const e = g.edge([a, 'b']);
    const list = g.node({ color: 'red' });
    for (const view of [a, s, e, list]) {
      expect(modelOf(view)).not.toBe(view);
      expect(dsl(modelOf(view))).toBe(view);
    }
  });

  test('4. a model and a kit have one DSL', () => {
    const model = new Digraph();
    const g = dsl(model);
    expect(dsl(model)).toBe(g);
    expect(dsl(g)).toBe(g);
    expect(dsl(model, defaultModelKit)).toBe(g);
    expect(dsl(model, createModelKit())).toBe(g);
    expect(g.node).toBe(g.node);
    expect(g.addComment).toBe(g.addComment);
    expect(modelOf(g)).toBe(model);

    class MyNode extends Node {}
    const kit = createModelKit({ Node: MyNode });
    const k = dsl(model, kit);
    expect(k).not.toBe(g);
    expect(dsl(model, kit)).toBe(k);
    expect(modelOf(k)).toBe(model);
    // A DSL as it is; with a kit, the DSL of its model with that kit.
    expect(dsl(k)).toBe(k);
    expect(dsl(g, kit)).toBe(k);
    expect(dsl(k, defaultModelKit)).toBe(g);
    // What a DSL gives is a DSL of the same kit.
    const a = k.node('a');
    expect(a).toBe(dsl(modelOf(a), kit));
    expect(dsl(modelOf(a))).not.toBe(a);
  });

  test('dsl takes only a kit as its second argument', () => {
    const model = new Digraph();
    for (const value of [
      null,
      1,
      'kit',
      {},
      [],
      { Node, Edge, Subgraph },
      { createNode() {}, createEdge() {} },
      { createNode() {}, createEdge() {}, createSubgraph() {} },
    ]) {
      expect(() => dsl(model, value as never)).toThrow(
        expect.objectContaining({
          name: 'TypeError',
          code: 'TSG_ERR_NOT_A_MODEL_KIT',
        }),
      );
    }
  });

  test('the kit only creates; the statements add', () => {
    const g = digraph((g, kit) => {
      const d = kit.createNode('d');
      kit.createEdge(['d', 'e']);
      kit.createSubgraph('s');
      expect(modelOf(g).statements).toStrictEqual([]);
      modelOf(g).addNode(d);
    });
    expect(modelOf(g).nodes.map((node) => node.id)).toStrictEqual(['d']);
  });

  test('dsl takes only models', () => {
    const tagOnly = [
      { $$type: 'Node' },
      { $$type: 'Edge' },
      { $$type: 'Graph' },
    ];
    for (const value of [
      null,
      1,
      'a',
      {},
      { $$type: 'Other' },
      [],
      ...tagOnly,
    ]) {
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

describe('the readers take a DSL', () => {
  const g = digraph('G', { label: 'root' }, (g) => {
    g.node('a', { label: 'A' });
    g.edge(['a', 'b']);
    g.subgraph('cluster_s', (s) => s.node('c'));
  });

  test('toDot and fromModel', () => {
    expect(toDot(g)).toBe(toDot(modelOf(g)));
    expect(fromModel(g)).toStrictEqual(fromModel(modelOf(g)));
    const [a] = modelOf(g).nodes;
    expect(toDot(dsl(a))).toBe(toDot(a));
  });

  test('the guards take the model, not the DSL', () => {
    // A DSL is not a model (its `id` is an attribute): use modelOf.
    const a = g.node('a');
    const e = dsl(modelOf(g).edges[0]);
    const s = g.subgraph('cluster_s');
    expect(isRootGraphModel(g)).toBe(false);
    expect(isNodeModel(a)).toBe(false);
    expect(isEdgeModel(e)).toBe(false);
    expect(isSubgraphModel(s)).toBe(false);
    expect(isRootGraphModel(modelOf(g))).toBe(true);
    expect(isNodeModel(modelOf(a))).toBe(true);
    expect(isEdgeModel(modelOf(e))).toBe(true);
    expect(isSubgraphModel(modelOf(s))).toBe(true);
    a.id = 'svg-a';
    expect(isNodeModel(a)).toBe(false);
  });
});

describe('custom models', () => {
  test('the statements use the classes of the model kit', () => {
    class MyNode extends Node {
      public mine = true;
    }
    const kit = createModelKit({ Node: MyNode });
    const model = new Digraph();
    const g = dsl(model, kit);
    const a = g.node('a');
    expect(modelOf(a)).toBeInstanceOf(MyNode);
    // Without a kit, the default one: a model does not remember its kit.
    expect(modelOf(dsl(model).node('b'))).not.toBeInstanceOf(MyNode);
    // The class's own members are on the model.
    expect((modelOf(a) as MyNode).mine).toBe(true);
    expect((a as unknown as { mine?: unknown }).mine).toBeUndefined();
  });

  test('a new model gets the attributes of its statement in the constructor', () => {
    const seen: unknown[][] = [];
    class MyNode extends Node {
      constructor(...args: ConstructorParameters<typeof Node>) {
        super(...args);
        seen.push(args);
      }
    }
    class MySubgraph extends Subgraph {
      constructor(...args: (string | SubgraphAttributesObject | undefined)[]) {
        super(...(args as [string?, NonClusterSubgraphAttributesObject?]));
        seen.push(args);
      }
    }
    const g = dsl(
      new Digraph(),
      createModelKit({ Node: MyNode, Subgraph: MySubgraph }),
    );
    g.node('a', { label: 'A' });
    g.subgraph('s', { rank: 'same' });
    g.subgraph({ rank: 'min' });
    g.subgraph();
    expect(seen).toEqual([
      ['a', { label: 'A' }],
      ['s', { rank: 'same' }],
      [{ rank: 'min' }],
      [],
    ]);
    // A statement written again is a new model too.
    g.node('a', { color: 'red' });
    g.subgraph('s', { rank: 'max' });
    expect(seen.slice(4)).toEqual([
      ['a', { color: 'red' }],
      ['s', { rank: 'max' }],
    ]);
  });

  test('default attribute statements keep their place, as in DOT', () => {
    const g = dsl(new Digraph('G'));
    g.node({ color: 'red' });
    g.node('a');
    g.node({ color: 'blue' });
    g.edge(['a', 'b']);
    g.edge({ color: 'green' });
    g.edge(['b', 'c']);
    g.subgraph('s', (s) => {
      s.node('d');
      s.graph({ label: 'S' });
    });
    expect(toDot(g)).toMatchInlineSnapshot(`
      "digraph "G" {
        node [
          color = "red";
        ];
        "a";
        node [
          color = "blue";
        ];
        "a" -> "b";
        edge [
          color = "green";
        ];
        "b" -> "c";
        subgraph "s" {
          "d";
          graph [
            label = "S";
          ];
        }
      }"
    `);
  });

  test('default attribute statements go through addAttributeList', () => {
    const added = vi.fn();
    class MyDigraph extends Digraph {
      // An override declares the overloads of every kind.
      override addAttributeList(
        kind: 'Graph',
        attributes: AttributeListAttributes<EmptySchema, 'Graph'>,
      ): GraphCommonAttributes['graph'];
      override addAttributeList(
        kind: 'Node',
        attributes: AttributeListAttributes<EmptySchema, 'Node'>,
      ): GraphCommonAttributes['node'];
      override addAttributeList(
        kind: 'Edge',
        attributes: AttributeListAttributes<EmptySchema, 'Edge'>,
      ): GraphCommonAttributes['edge'];
      override addAttributeList(
        kind: AttributeListKind,
        attributes: AttributeListAttributes,
      ): StatementAttributeListModel;
      override addAttributeList(
        kind: AttributeListKind,
        attributes: AttributeListAttributes,
      ): unknown {
        added(kind, attributes);
        return super.addAttributeList(kind, attributes);
      }
    }
    const g = dsl(new MyDigraph());
    g.node('a');
    g.node({ color: 'red' });
    g.edge({ color: 'green' });
    g.graph({ label: 'G' });
    expect(added.mock.calls).toEqual([
      ['Node', { color: 'red' }],
      ['Edge', { color: 'green' }],
      ['Graph', { label: 'G' }],
    ]);
    // After the node, each keeps its place.
    expect(modelOf(g).statements.map((s) => s.$$type)).toEqual([
      'Node',
      'AttributeList',
      'AttributeList',
      'AttributeList',
    ]);
  });

  test('a class’s own node() is reached on the model', () => {
    class Custom extends Digraph {
      node(id: string) {
        const node = new Node(`custom-${id}`);
        this.addNode(node);
        return node;
      }
    }
    const g = dsl(new Custom());
    expect(modelOf(g.node('a')).id).toBe('a');
    expect((modelOf(g) as Custom).node('b').id).toBe('custom-b');
  });
});

describe('node references', () => {
  test('a DSL is not a NodeRef, but is taken where node references are', () => {
    const g = graph();
    const a = g.node('a');
    expect(isNodeRef(a)).toBe(false);
    expect(isNodeRef(modelOf(a))).toBe(true);
    expect(toNodeRef(a as never)).toBe(modelOf(a));
    expect(toNodeRefGroup([a, 'b'] as never)[0]).toBe(modelOf(a));
    const raw = defaultModelKit.createEdge([[a, 'b'], a] as never);
    expect(raw.targets).toStrictEqual([
      [modelOf(a), { id: 'b', port: undefined }],
      modelOf(a),
    ]);
    expect(new Edge([a, a] as never).targets[0]).toBe(modelOf(a));
  });
});
