import fc from 'fast-check';
import {
  createModelKit,
  Digraph,
  Dot,
  defaultModelKit,
  digraph,
  dsl,
  Edge,
  Graph,
  graph,
  LegacyDigraph,
  modelOf,
  Node,
  type NodeModel,
  type RootGraphConstructor,
  type RootGraphModel,
  Subgraph,
  type SubgraphModel,
  strict,
  toNodeRef,
  withModelKit,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { dotString } from './arbitraries.js';

// Property-based tests for the core models (#1613, #1504): what the model API
// promises on its own, independent of DOT text. A failing run prints its
// seed; reproduce it with FC_SEED=<seed>.
//

const COMPASS_POINTS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c', '_'];

/** Node ids, including the empty string and ids that look like DOT syntax. */
const nodeId = dotString({ newlines: true });

/** Ids that `toNodeRef` reads back unchanged: no `:` (port separator). */
const plainId = nodeId.filter((s) => !s.includes(':'));

// ---------------------------------------------------------------------------
// Model-based test: a sequence of operations on a graph is checked against a
// plain reference model after every step.

interface Reference {
  /** The ids of the node declarations, in the order they were added. */
  nodes: string[];
  edges: number;
  subgraphs: (string | undefined)[];
}

type Command = fc.Command<Reference, RootGraphModel>;

/** Everything a graph says about its contents agrees with the reference. */
function expectConsistent(model: Reference, real: RootGraphModel): void {
  expect(real.nodes.map((n) => n.id)).toStrictEqual(model.nodes);
  for (const id of new Set(model.nodes)) {
    expect(real.existNode(id)).toBe(true);
    // getNodes gives the declarations of the id, in the order of nodes
    expect(real.getNodes(id)).toStrictEqual(
      real.nodes.filter((n) => n.id === id),
    );
  }
  expect(real.edges).toHaveLength(model.edges);
  expect(real.subgraphs.map((s) => s.id)).toStrictEqual(model.subgraphs);
  for (const subgraph of real.subgraphs) {
    expect(real.existSubgraph(subgraph)).toBe(true);
  }
}

class NodeCommand implements Command {
  constructor(readonly id: string) {}
  check = () => true;
  run(model: Reference, real: RootGraphModel): void {
    // the graph's lookup agrees with the reference before the call
    expect(real.existNode(this.id)).toBe(model.nodes.includes(this.id));
    const before = real.getNodes(this.id);
    const node = modelOf(dsl(real).node(this.id));
    // node(id) always declares a new node, after those with the id
    expect(before).not.toContain(node);
    expect(real.getNodes(this.id)).toStrictEqual([...before, node]);
    model.nodes.push(this.id);
    expectConsistent(model, real);
  }
  toString = () => `node(${JSON.stringify(this.id)})`;
}

class CreateNodeCommand implements Command {
  constructor(readonly id: string) {}
  check = () => true;
  run(model: Reference, real: RootGraphModel): void {
    const before = real.getNodes(this.id);
    const node = defaultModelKit.createNode(this.id);
    real.addNode(node);
    // a node with the id of another is another declaration, at the end
    expect(real.getNodes(this.id)).toStrictEqual([...before, node]);
    model.nodes.push(this.id);
    // adding it again changes nothing
    real.addNode(node);
    expectConsistent(model, real);
  }
  toString = () => `createNode(${JSON.stringify(this.id)})`;
}

/** How removeNode is called: with the id, the first declaration, or a node with the id that is not in the graph. */
type RemoveBy = 'id' | 'current' | 'other';

class RemoveNodeCommand implements Command {
  constructor(
    readonly id: string,
    readonly by: RemoveBy,
  ) {}
  check = () => true;
  run(model: Reference, real: RootGraphModel): void {
    const current = real.getNodes(this.id)[0];
    const target =
      this.by === 'id'
        ? this.id
        : this.by === 'current' && current
          ? current
          : new Node(this.id);
    real.removeNode(target);
    if (this.by === 'id') {
      // an id removes every declaration with it
      model.nodes = model.nodes.filter((id) => id !== this.id);
      expect(real.existNode(this.id)).toBe(false);
      expect(real.getNodes(this.id)).toStrictEqual([]);
    } else if (this.by === 'current' && current) {
      // a node removes that declaration only
      model.nodes.splice(model.nodes.indexOf(this.id), 1);
      expect(real.nodes).not.toContain(current);
    }
    // a node that is not in the graph removes nothing
    expectConsistent(model, real);
  }
  toString = () => `removeNode(${JSON.stringify(this.id)} by ${this.by})`;
}

class EdgeCommand implements Command {
  constructor(readonly ids: [string, string, ...string[]]) {}
  check = () => true;
  run(model: Reference, real: RootGraphModel): void {
    // objects, so that ids containing ':' are not split into ports
    const edge = modelOf(
      dsl(real).edge(
        this.ids.map((id) => ({ id })) as [{ id: string }, { id: string }],
      ),
    );
    model.edges++;
    expect(real.existEdge(edge)).toBe(true);
    expect(
      edge.targets.map((t) => (Array.isArray(t) ? null : t.id)),
    ).toStrictEqual(this.ids);
    // an edge does not add nodes: DOT creates them implicitly when rendering
    expectConsistent(model, real);
  }
  toString = () => `edge(${JSON.stringify(this.ids)})`;
}

class RemoveEdgeCommand implements Command {
  constructor(readonly index: number) {}
  check = (model: Readonly<Reference>) => model.edges > 0;
  run(model: Reference, real: RootGraphModel): void {
    const edge = real.edges[this.index % real.edges.length];
    real.removeEdge(edge);
    model.edges--;
    expect(real.existEdge(edge)).toBe(false);
    expectConsistent(model, real);
  }
  toString = () => `removeEdge(#${this.index})`;
}

class SubgraphCommand implements Command {
  constructor(readonly id: string | undefined) {}
  check = () => true;
  run(model: Reference, real: RootGraphModel): void {
    // decided from the reference, not from the graph's own lookup
    const known = this.id !== undefined && model.subgraphs.includes(this.id);
    const before = this.id === undefined ? [] : real.getSubgraphs(this.id);
    expect(before.length > 0).toBe(known);
    const subgraph = modelOf(
      this.id === undefined
        ? dsl(real).subgraph()
        : dsl(real).subgraph(this.id),
    );
    // subgraph(id) always declares a new subgraph, as subgraph() does
    expect(before).not.toContain(subgraph);
    if (this.id !== undefined) {
      expect(real.getSubgraphs(this.id)).toStrictEqual([...before, subgraph]);
    }
    model.subgraphs.push(this.id);
    expect(subgraph.id).toBe(this.id);
    expectConsistent(model, real);
  }
  toString = () =>
    `subgraph(${this.id === undefined ? '' : JSON.stringify(this.id)})`;
}

class RemoveSubgraphCommand implements Command {
  constructor(readonly index: number) {}
  check = (model: Readonly<Reference>) => model.subgraphs.length > 0;
  run(model: Reference, real: RootGraphModel): void {
    const index = this.index % real.subgraphs.length;
    const subgraph = real.subgraphs[index];
    real.removeSubgraph(subgraph);
    model.subgraphs.splice(index, 1);
    expect(real.existSubgraph(subgraph)).toBe(false);
    expectConsistent(model, real);
  }
  toString = () => `removeSubgraph(#${this.index})`;
}

describe('graph contents', { tags: ['SM-5'] }, () => {
  // a small pool of ids, so that operations hit the same node often
  const ids = fc.array(nodeId, { minLength: 1, maxLength: 5 });

  it('node, edge and subgraph operations keep the graph consistent with a reference model', () => {
    fc.assert(
      fc.property(
        ids.chain((pool) =>
          fc.tuple(
            fc.constant(pool),
            fc.commands(
              [
                fc.constantFrom(...pool).map((id) => new NodeCommand(id)),
                fc.constantFrom(...pool).map((id) => new CreateNodeCommand(id)),
                fc
                  .tuple(
                    fc.constantFrom(...pool),
                    fc.constantFrom<RemoveBy>('id', 'current', 'other'),
                  )
                  .map(([id, by]) => new RemoveNodeCommand(id, by)),
                fc
                  .array(fc.constantFrom(...pool), {
                    minLength: 2,
                    maxLength: 4,
                  })
                  .map((t) => new EdgeCommand(t as [string, string])),
                fc.nat().map((i) => new RemoveEdgeCommand(i)),
                fc
                  .option(fc.constantFrom(...pool), { nil: undefined })
                  .map((id) => new SubgraphCommand(id)),
                fc.nat().map((i) => new RemoveSubgraphCommand(i)),
              ],
              { maxCommands: 30 },
            ),
          ),
        ),
        fc.boolean(),
        ([, commands], directed) => {
          const real = directed ? new Digraph() : new Graph();
          fc.modelRun(
            () => ({
              model: { nodes: [], edges: 0, subgraphs: [] },
              real,
            }),
            commands,
          );
        },
      ),
    );
  });

  it('addNode and node() declare a node again; the legacy models replace it', () => {
    fc.assert(
      fc.property(nodeId, (id) => {
        const g = dsl(new Digraph());
        const first = modelOf(g.node(id));
        const second = new Node(id);
        modelOf(g).addNode(second);
        const third = modelOf(g.node(id));
        expect(modelOf(g).nodes).toStrictEqual([first, second, third]);

        const legacy = dsl(new LegacyDigraph());
        const kept = modelOf(legacy.node(id));
        const replacement = new Node(id);
        modelOf(legacy).addNode(replacement);
        expect(modelOf(legacy).nodes).toStrictEqual([replacement]);
        expect(kept).not.toBe(replacement);
        expect(modelOf(legacy.node(id))).toBe(replacement);
      }),
    );
  });

  it('subgraph("") finds the subgraph with the empty id like any other id (#1593)', () => {
    const g = dsl(new Digraph());
    const sub = g.subgraph('');
    expect(modelOf(sub).id).toBe('');
    expect(modelOf(g).getSubgraphs('')).toStrictEqual([modelOf(sub)]);
    expect(modelOf(g).subgraphs).toHaveLength(1);
  });

  it('edge(targets, null) ignores the null instead of failing (#1593)', () => {
    fc.assert(
      fc.property(plainId, plainId, (a, b) => {
        const edge = dsl(new Digraph()).edge([a, b], null as never);
        expect(modelOf(edge).getAttributeNames()).toHaveLength(0);
      }),
    );
  });

  it('removing a node leaves the edges that refer to it', () => {
    // Edges hold their own references; DOT would recreate the node from the
    // edge when rendering. Pinned here so that a change is deliberate (#1504
    // proposed cascading removal).
    fc.assert(
      fc.property(plainId, plainId, (a, b) => {
        const g = digraph((g) => {
          g.node(a);
          g.edge([a, b]);
        });
        modelOf(g).removeNode(a);
        expect(modelOf(g).edges).toHaveLength(1);
      }),
    );
  });
});

describe('subgraph nesting', { tags: ['SM-5'] }, () => {
  const path = fc.array(nodeId, { minLength: 1, maxLength: 5 });

  it('subgraphs nested along any path are found again at every depth', () => {
    fc.assert(
      fc.property(path, nodeId, fc.boolean(), (ids, leaf, directed) => {
        const root = directed ? new Digraph() : new Graph();
        const chain: SubgraphModel[] = [];
        let parent: RootGraphModel | SubgraphModel = root;
        for (const id of ids) {
          const sub: SubgraphModel = modelOf(dsl(parent).subgraph(id));
          chain.push(sub);
          parent = sub;
        }
        dsl(parent).node(leaf);

        // walk down again by id: the same instances, and the leaf only at the bottom
        let current: RootGraphModel | SubgraphModel = root;
        for (const [depth, id] of ids.entries()) {
          const found: SubgraphModel | undefined = current.getSubgraphs(id)[0];
          expect(found).toBe(chain[depth]);
          expect(current.getSubgraphs(id)).toStrictEqual([found]);
          if (depth < ids.length - 1)
            expect(found?.existNode(leaf)).toBe(false);
          current = found as SubgraphModel;
        }
        expect(current.getNodes(leaf)[0]?.id).toBe(leaf);
        expect(root.existNode(leaf)).toBe(false);
      }),
    );
  });

  it('a subgraph is a cluster exactly when its id starts with "cluster"', () => {
    fc.assert(
      fc.property(
        fc.option(
          fc.oneof(
            nodeId,
            nodeId.map((s) => `cluster${s}`),
          ),
          { nil: undefined },
        ),
        (id) => {
          const sub = new Subgraph(id);
          expect(sub.isSubgraphCluster()).toBe(
            id?.startsWith('cluster') ?? false,
          );
        },
      ),
    );
  });
});

describe('edge targets', { tags: ['SM-5'] }, () => {
  it('object targets keep their id, port and compass point as given', () => {
    fc.assert(
      fc.property(
        nodeId,
        fc.option(nodeId, { nil: undefined }),
        fc.option(fc.constantFrom(...COMPASS_POINTS), { nil: undefined }),
        (id, port, compass) => {
          const target = {
            id,
            ...(port !== undefined ? { port } : {}),
            ...(compass !== undefined ? { compass } : {}),
          } as { id: string };
          const edge = defaultModelKit.createEdge([target, { id: 'b' }]);
          expect(edge.targets[0]).toStrictEqual(target);
        },
      ),
    );
  });

  it('string targets are split into id, port and compass point', () => {
    fc.assert(
      fc.property(
        plainId,
        // a compass point alone after the id is ambiguous with a port (#1688)
        plainId.filter((s) => s !== '' && !COMPASS_POINTS.includes(s)),
        fc.constantFrom(...COMPASS_POINTS.filter((c) => c !== '_')),
        (id, port, compass) => {
          expect(toNodeRef(id)).toStrictEqual({ id, port: undefined });
          expect(toNodeRef(`${id}:${port}`)).toStrictEqual({ id, port });
          expect(toNodeRef(`${id}:${port}:${compass}`)).toStrictEqual({
            id,
            port,
            compass,
          });
        },
      ),
    );
  });

  it('the compass point `_` survives a string target (#1688)', () => {
    // isCompass() lists every point except `_`, so the compass is dropped
    expect(toNodeRef('a:p:_')).toStrictEqual({
      id: 'a',
      port: 'p',
      compass: '_',
    });
  });

  it('a node model as a target is kept as that instance', () => {
    fc.assert(
      fc.property(nodeId, nodeId, (a, b) => {
        const g = new Digraph();
        const na = defaultModelKit.createNode(a);
        g.addNode(na);
        const nb = new Node(b);
        const edge = defaultModelKit.createEdge([na, [nb, { id: 'c' }]]);
        g.addEdge(edge);
        expect(edge.targets[0]).toBe(na);
        expect((edge.targets[1] as NodeModel[])[0]).toBe(nb);
      }),
    );
  });

  it('an edge needs at least two targets', () => {
    fc.assert(
      fc.property(nodeId, (id) => {
        expect(() => new Edge([{ id }] as never)).toThrow(
          expect.objectContaining({ code: 'TSG_ERR_INVALID_EDGE_TARGETS' }),
        );
      }),
    );
  });
});

describe('root graphs', { tags: ['SM-5'] }, () => {
  it('every way of creating a root graph sets directed and strict as asked', () => {
    fc.assert(
      fc.property(
        fc.option(nodeId, { nil: undefined }),
        fc.boolean(),
        fc.boolean(),
        (id, directed, isStrict) => {
          const factories = isStrict ? strict : { digraph, graph };
          const fromFactory = (directed ? factories.digraph : factories.graph)(
            id,
          );
          // The classes are generic, so a union of them is not
          // constructable.
          const Class: RootGraphConstructor = directed ? Digraph : Graph;
          const fromClass =
            id === undefined ? new Class(isStrict) : new Class(id, isStrict);
          for (const g of [modelOf(fromFactory), fromClass]) {
            expect([g.id, g.directed, g.strict]).toStrictEqual([
              id,
              directed,
              isStrict,
            ]);
          }
        },
      ),
    );
  });

  it('a Dot model keeps its graphs in order, each once', () => {
    fc.assert(
      fc.property(
        fc.array(fc.nat({ max: 4 }), { maxLength: 12 }),
        fc.array(fc.nat({ max: 4 }), { maxLength: 4 }),
        (adds, removes) => {
          const pool = Array.from({ length: 5 }, (_, i) =>
            i % 2 ? new Digraph(`g${i}`) : new Graph(`g${i}`),
          );
          const dot = new Dot();
          const expected: RootGraphModel[] = [];
          for (const i of adds) {
            dot.addGraph(pool[i]);
            if (!expected.includes(pool[i])) expected.push(pool[i]);
          }
          for (const i of removes) {
            dot.removeGraph(pool[i]);
            const at = expected.indexOf(pool[i]);
            if (at !== -1) expected.splice(at, 1);
          }
          expect(dot.graphs).toStrictEqual(expected);
          for (const g of pool) {
            expect(dot.existGraph(g)).toBe(expected.includes(g));
          }
        },
      ),
    );
  });
});

describe('model kit', { tags: ['SM-5'] }, () => {
  class MyNode extends Node {}
  class MyEdge extends Edge {}
  class MySubgraph extends Subgraph {}

  it('custom model classes are used at every depth of the graph', () => {
    fc.assert(
      fc.property(
        fc.array(nodeId, { minLength: 1, maxLength: 4 }),
        fc.boolean(),
        (path, directed) => {
          const models = createModelKit({
            Node: MyNode,
            Edge: MyEdge,
            Subgraph: MySubgraph,
          });
          const factories = withModelKit(models);
          const root = (directed ? factories.digraph : factories.graph)();
          let current: RootGraphModel | SubgraphModel = modelOf(root);
          for (const id of path) {
            const g = dsl(current, models);
            expect(modelOf(g.node(`${id}-n`))).toBeInstanceOf(MyNode);
            expect(modelOf(g.edge([{ id: 'a' }, { id: 'b' }]))).toBeInstanceOf(
              MyEdge,
            );
            const sub: SubgraphModel = modelOf(g.subgraph(id));
            expect(sub).toBeInstanceOf(MySubgraph);
            current = sub;
          }
          expect(modelOf(dsl(current, models).node('leaf'))).toBeInstanceOf(
            MyNode,
          );
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Attributes: every attribute holder (graph, subgraph, node, edge, and the
// graph/node/edge default lists) behaves like an insertion-ordered map.

type AttrRef = Map<string, unknown>;
type Holder = {
  values: ReadonlyArray<[string, unknown]>;
  size: number;
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  delete(key: string): void;
  apply(attributes: Record<string, unknown> | [string, unknown][]): void;
  clear(): void;
};
type AttrCommand = fc.Command<AttrRef, Holder>;

function expectSameAttributes(model: AttrRef, real: Holder): void {
  expect(real.values).toStrictEqual([...model.entries()]);
  expect(real.size).toBe(model.size);
  for (const [key, value] of model) expect(real.get(key)).toBe(value);
}

const attrKey = fc.constantFrom('label', 'color', 'shape', 'fontsize', 'URL');
const attrValue = fc.oneof(
  dotString(),
  fc.integer(),
  fc.boolean(),
  fc.constantFrom(null, undefined),
);

const attrCommands = [
  fc.tuple(attrKey, attrValue).map(
    ([key, value]): AttrCommand => ({
      check: () => true,
      run(model, real) {
        real.set(key, value);
        // null and undefined are ignored rather than deleting the key
        if (value !== null && value !== undefined) model.set(key, value);
        expectSameAttributes(model, real);
      },
      toString: () => `set(${key}, ${JSON.stringify(value)})`,
    }),
  ),
  attrKey.map(
    (key): AttrCommand => ({
      check: () => true,
      run(model, real) {
        real.delete(key);
        model.delete(key);
        expect(real.get(key)).toBeUndefined();
        expectSameAttributes(model, real);
      },
      toString: () => `delete(${key})`,
    }),
  ),
  fc
    .tuple(
      fc.array(fc.tuple(attrKey, attrValue), { maxLength: 4 }),
      fc.boolean(),
    )
    .map(
      ([entries, asObject]): AttrCommand => ({
        check: () => true,
        run(model, real) {
          // apply() is set() for each entry, in order
          real.apply(asObject ? Object.fromEntries(entries) : entries);
          const effective = asObject
            ? Object.entries(Object.fromEntries(entries))
            : entries;
          for (const [key, value] of effective) {
            if (value !== null && value !== undefined) model.set(key, value);
          }
          expectSameAttributes(model, real);
        },
        toString: () =>
          `apply(${asObject ? 'object' : 'entries'} ${JSON.stringify(entries)})`,
      }),
    ),
  fc.constant<AttrCommand>({
    check: () => true,
    run(model, real) {
      real.clear();
      model.clear();
      expectSameAttributes(model, real);
    },
    toString: () => 'clear()',
  }),
];

describe('attributes', { tags: ['SM-5'] }, () => {
  const holders: [string, () => Holder][] = [
    ['root graph', () => new Digraph() as unknown as Holder],
    ['subgraph', () => new Subgraph('s') as unknown as Holder],
    ['node', () => new Node('n').attributes as unknown as Holder],
    [
      'edge',
      () =>
        new Edge([{ id: 'a' }, { id: 'b' }]).attributes as unknown as Holder,
    ],
    [
      'graph defaults',
      () => new Digraph().attributes.graph as unknown as Holder,
    ],
    ['node defaults', () => new Digraph().attributes.node as unknown as Holder],
    ['edge defaults', () => new Digraph().attributes.edge as unknown as Holder],
  ];

  it.each(holders)(
    '%s: set, delete, apply and clear behave like an insertion-ordered map',
    (_, create) => {
      fc.assert(
        fc.property(
          fc.commands(attrCommands, { maxCommands: 25 }),
          (commands) => {
            fc.modelRun(() => ({ model: new Map(), real: create() }), commands);
          },
        ),
      );
    },
  );
});
