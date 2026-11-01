import {
  type AnyDotObjectModel,
  type Attribute,
  type AttributeListDSL,
  type AttributeListModel,
  type AttributesGroupModel,
  createModelsContext,
  Digraph,
  Dot,
  type DotDSL,
  type DotModel,
  type DSL,
  digraph,
  dsl,
  Edge,
  type EdgeDSL,
  type EdgeModel,
  type ForwardRefNode,
  isNodeModel,
  MODEL,
  type ModelOf,
  type ModelView,
  modelOf,
  type NarrowedModel,
  Node,
  type NodeAttributeKey,
  type NodeDSL,
  type NodeModel,
  type ReadonlyAttributes,
  type ReadonlyNodeDSL,
  type RootGraphDSL,
  type RootGraphModel,
  Subgraph,
  type SubgraphDSL,
  type SubgraphModel,
  withContext,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The types of the DOT DSL (packages/ts-graphviz/src/dsl.ts), by the rules
// of its design: what DSL<T> is for each model, how keys are routed
// ($ members, statements, attributes), what goes in and out (models in,
// DSLs out), and the members of custom classes. The run-time side of each
// rule is in packages/ts-graphviz/src/dsl.test.ts.

const g = dsl(new Digraph('G'));
const n = g.node('a');
const e = g.edge(['a', 'b']);
const s = g.subgraph('s');
const d = dsl(new Dot());

describe('DSL<T>', () => {
  it('picks the DSL of each kind of model', () => {
    expectTypeOf<DSL<NodeModel>>().toEqualTypeOf<NodeDSL<NodeModel>>();
    expectTypeOf<DSL<EdgeModel>>().toEqualTypeOf<EdgeDSL<EdgeModel>>();
    expectTypeOf<DSL<SubgraphModel>>().toEqualTypeOf<
      SubgraphDSL<SubgraphModel>
    >();
    expectTypeOf<DSL<RootGraphModel>>().toEqualTypeOf<
      RootGraphDSL<RootGraphModel>
    >();
    expectTypeOf<DSL<DotModel>>().toEqualTypeOf<DotDSL<DotModel>>();
    type NodeList = AttributeListModel<'Node', NodeAttributeKey>;
    expectTypeOf<DSL<NodeList>>().toEqualTypeOf<
      AttributeListDSL<NodeList, 'Node', NodeAttributeKey>
    >();
  });

  it('is a union for a union of models', () => {
    expectTypeOf<DSL<NodeModel | EdgeModel>>().toEqualTypeOf<
      DSL<NodeModel> | DSL<EdgeModel>
    >();
    expectTypeOf<DSL<AnyDotObjectModel>['$$type']>().toEqualTypeOf<
      AnyDotObjectModel['$$type']
    >();
  });

  it('stands for its model', () => {
    expectTypeOf<DSL<NodeModel>>().toExtend<ModelView<NodeModel>>();
    expectTypeOf(n[MODEL]).toEqualTypeOf<NodeModel>();
    expectTypeOf(modelOf(n)).toEqualTypeOf<NodeModel>();
    expectTypeOf<ModelOf<DSL<SubgraphModel>>>().toEqualTypeOf<SubgraphModel>();
    expectTypeOf<ModelOf<NodeModel>>().toEqualTypeOf<NodeModel>();
    expectTypeOf<ModelOf<string>>().toEqualTypeOf<string>();
  });

  it('is not a model', () => {
    // @ts-expect-error a DSL is not a model: modelOf(n)
    const model: NodeModel = n;
    void model;
    expectTypeOf<NarrowedModel<DSL<NodeModel>, 'Node'>>().toBeNever();
    const value = n as DSL<NodeModel> | NodeModel;
    if (isNodeModel(value)) expectTypeOf(value).toEqualTypeOf<NodeModel>();
  });
});

describe('dsl()', () => {
  it('takes a model or its DSL', () => {
    expectTypeOf(dsl(new Node('a'))).toEqualTypeOf<DSL<Node>>();
    expectTypeOf(dsl(modelOf(n))).toEqualTypeOf<DSL<NodeModel>>();
    expectTypeOf(dsl(n)).toEqualTypeOf<DSL<NodeModel>>();
    expectTypeOf(dsl(dsl(g))).toEqualTypeOf<DSL<Digraph>>();
    expectTypeOf(dsl(modelOf(g).attributes.edge)).toEqualTypeOf<
      DSL<Digraph['attributes']['edge']>
    >();
  });

  it('takes nothing else', () => {
    // @ts-expect-error not a model
    dsl({ $$type: 'Node', id: 'a' });
    // @ts-expect-error not a model
    dsl('a');
  });
});

describe('keys', () => {
  it('reach the model’s members with a $', () => {
    expectTypeOf(n.$id).toEqualTypeOf<string>();
    expectTypeOf(n.$comment).toEqualTypeOf<string | undefined>();
    expectTypeOf(g.$directed).toEqualTypeOf<boolean>();
    expectTypeOf(s.$isSubgraphCluster()).toEqualTypeOf<boolean>();
    expectTypeOf(g.$size).toEqualTypeOf<number>();
    expectTypeOf(e.$attributes).toEqualTypeOf<
      AttributesGroupModel<Parameters<EdgeModel['attributes']['get']>[0]>
    >();
    // @ts-expect-error a model member: n.$attributes
    n.attributes;
    // @ts-expect-error a model member: g.$getNode
    g.getNode;
  });

  it('keep the name of members that start with $$', () => {
    expectTypeOf(n.$$type).toEqualTypeOf<'Node'>();
    expectTypeOf(e.$$type).toEqualTypeOf<'Edge'>();
    expectTypeOf(s.$$type).toEqualTypeOf<'Subgraph'>();
    expectTypeOf(g.$$type).toEqualTypeOf<'Graph'>();
    expectTypeOf(d.$$type).toEqualTypeOf<'Dot'>();
    expectTypeOf(g.$attributes.graph.$$kind).toEqualTypeOf<'Graph'>();
    // @ts-expect-error no member $type
    n.$type;
  });

  it('keep the members read-only that are', () => {
    // @ts-expect-error the node's name cannot change
    n.$id = 'b';
    // @ts-expect-error
    n.$$type = 'Node';
    // @ts-expect-error
    g.$nodes = [];
    n.$comment = 'c';
    g.$strict = true;
  });

  it('give the statements on graphs only', () => {
    expectTypeOf(g.node).toBeFunction();
    expectTypeOf(s.edge).toBeFunction();
    // @ts-expect-error a node has no statements
    n.node;
    // @ts-expect-error an edge has no statements
    e.subgraph;
    // @ts-expect-error a Dot has no statements
    d.graph;
  });

  it('give the attributes under their own names', () => {
    expectTypeOf(n.label).toEqualTypeOf<Attribute<'label'> | undefined>();
    expectTypeOf(n.id).toEqualTypeOf<Attribute<'id'> | undefined>();
    expectTypeOf(n.comment).toEqualTypeOf<Attribute<'comment'> | undefined>();
    expectTypeOf(g.size).toEqualTypeOf<Attribute<'size'> | undefined>();
    // (not arrowhead: its type pairs every arrow name, too many to compare)
    expectTypeOf(e.weight).toEqualTypeOf<Attribute<'weight'> | undefined>();
    expectTypeOf(s.rank).toEqualTypeOf<Attribute<'rank'> | undefined>();
    n.label = 'A';
    n.label = undefined;
    delete n.label;
    // @ts-expect-error not an attribute of nodes
    n.rankdir = 'LR';
    // @ts-expect-error not an attribute of edges
    e.shape = 'box';
    // @ts-expect-error not an attribute at all
    n.foo = 'x';
  });

  it('give the attributes of each default list by its kind', () => {
    g.$attributes.node.shape = 'box';
    g.$attributes.edge.arrowhead = 'dot';
    g.$attributes.graph.label = 'G';
    // @ts-expect-error graph [...] takes the attributes of subgraphs
    g.$attributes.graph.rankdir = 'LR';
    // @ts-expect-error not an attribute of nodes
    g.$attributes.node.arrowhead = 'dot';
    // @ts-expect-error not an attribute of edges
    g.$attributes.edge.shape = 'box';
    expectTypeOf(g.$attributes.node.$get('shape')).toEqualTypeOf<
      Attribute<'shape'> | undefined
    >();
  });

  it('give a Dot no attributes', () => {
    // @ts-expect-error a Dot has no attributes
    d.label = 'x';
    expectTypeOf(d.$graphs).toEqualTypeOf<ReadonlyArray<DSL<RootGraphModel>>>();
  });
});

describe('what goes in is a model, what comes out a DSL', () => {
  it('takes models and DSLs', () => {
    const model = modelOf(n);
    g.$addNode(n);
    g.$addNode(model);
    g.$removeNode('a');
    g.$addSubgraph(s);
    g.$addEdge(e);
    expectTypeOf(g.$existEdge(modelOf(e))).toEqualTypeOf<boolean>();
    d.$addGraph(g);
    d.$addGraph(modelOf(g));
    // @ts-expect-error not a node
    g.$addNode(e);
    // @ts-expect-error not a node's DSL
    g.$addNode(modelOf(e));
  });

  it('gives models as DSLs, in arrays too', () => {
    expectTypeOf(g.$createNode('a')).toEqualTypeOf<DSL<NodeModel>>();
    expectTypeOf(g.$getSubgraph('s')).toEqualTypeOf<
      DSL<SubgraphModel> | undefined
    >();
    expectTypeOf(g.$edges).toEqualTypeOf<ReadonlyArray<DSL<EdgeModel>>>();
    expectTypeOf(g.$subgraphs).toEqualTypeOf<
      ReadonlyArray<DSL<SubgraphModel>>
    >();
    expectTypeOf(g.$statements).toEqualTypeOf<
      ReadonlyArray<
        | DSL<NodeModel>
        | DSL<EdgeModel>
        | DSL<SubgraphModel>
        | DSL<AttributeListModel>
      >
    >();
    expectTypeOf(g.$attributes.node).toEqualTypeOf<
      DSL<RootGraphModel['attributes']['node']>
    >();
  });

  it('gives a node’s and an edge’s attribute group as it is', () => {
    expectTypeOf(n.$attributes).toEqualTypeOf<NodeModel['attributes']>();
    n.$attributes.set('shape', 'box');
  });

  it('gives an edge’s targets as read-only node DSLs or references', () => {
    type Target = ReadonlyNodeDSL | ForwardRefNode;
    expectTypeOf(e.$targets[0]).toEqualTypeOf<Target | readonly Target[]>();
    expectTypeOf(e.$targets[2]).toEqualTypeOf<Target | readonly Target[]>();
    const [from] = e.$targets;
    if (!Array.isArray(from) && '$$type' in from) {
      expectTypeOf(from.$id).toEqualTypeOf<string>();
      expectTypeOf(from.$attributes).toEqualTypeOf<ReadonlyAttributes>();
      // @ts-expect-error read-only: a target may be any node that can be read
      from.label = 'x';
      expectTypeOf(modelOf(from)).not.toEqualTypeOf<NodeModel>();
    }
    // @ts-expect-error the targets are read-only
    e.$targets[0] = n;
  });

  it('takes edge targets as DSLs, models, ids, references and groups', () => {
    const m = modelOf(n);
    g.edge([n, m]);
    g.edge([n, 'b:p:n', { id: 'c', port: 'p' }, [n, 'd'], n.$port('p')]);
    g.$createEdge([[n, m], 'b']);
    const [from, to] = e.$targets;
    g.edge([from, to]);
    // @ts-expect-error an edge needs two targets
    g.edge([n]);
    // @ts-expect-error a subgraph is not a target
    g.edge([n, s]);
  });
});

describe('the statements', () => {
  it('type their overloads and callbacks', () => {
    expectTypeOf(g.node('a', { shape: 'box' })).toEqualTypeOf<DSL<NodeModel>>();
    expectTypeOf(g.node({ shape: 'box' })).toEqualTypeOf<void>();
    expectTypeOf(g.edge({ color: 'red' })).toEqualTypeOf<void>();
    expectTypeOf(g.graph({ label: 'G' })).toEqualTypeOf<void>();
    g.edge(['a', 'b'], { color: 'red' }, (edge) =>
      expectTypeOf(edge).toEqualTypeOf<DSL<EdgeModel>>(),
    );
    g.subgraph('cluster_a', { color: 'red' }, (sub) =>
      expectTypeOf(sub).toEqualTypeOf<DSL<SubgraphModel>>(),
    );
    s.subgraph((sub) => expectTypeOf(sub).toEqualTypeOf<DSL<SubgraphModel>>());
    // @ts-expect-error not an attribute of nodes
    g.node('a', { arrowhead: 'dot' });
    // @ts-expect-error not an attribute of nodes
    g.node({ arrowhead: 'dot' });
  });
});

describe('custom classes', () => {
  class MyNode extends Node {
    extra(): string {
      return this.id;
    }
    // A member that is a statement name or a DSL member of its own.
    node(): string {
      return 'mine';
    }
    $foo(): number {
      return 1;
    }
    $$tag = 'mine';
  }
  class MyEdge extends Edge {}
  class MySubgraph extends Subgraph {}

  class MyGraph extends Digraph {
    find(id: string): NodeModel | undefined {
      return this.getNode(id);
    }
    all(): NodeModel[] {
      return [...this.nodes];
    }
    pair(): [NodeModel, EdgeModel] {
      return [this.createNode('a'), this.createEdge(['a', 'b'])];
    }
    take(node: NodeModel, nodes: readonly NodeModel[]): number {
      return nodes.length + (node ? 1 : 0);
    }
    pick(id: string): NodeModel;
    pick(id: string, create: false): NodeModel | undefined;
    pick(id: string, create?: false): NodeModel | undefined {
      return create === false ? this.getNode(id) : this.createNode(id);
    }
    plain(x: number): string {
      return String(x);
    }
    count = 0;
  }

  it('reach the members a class adds with a $', () => {
    const v = dsl(new MyNode('a'));
    expectTypeOf(v.$extra()).toEqualTypeOf<string>();
    expectTypeOf(v.$node()).toEqualTypeOf<string>();
    expectTypeOf(v.$$foo()).toEqualTypeOf<number>();
    expectTypeOf(v.$$tag).toEqualTypeOf<string>();
    // @ts-expect-error a member that starts with $$ keeps its name
    v.$$$tag;
    const graph = dsl(new MyGraph());
    expectTypeOf(graph.$count).toEqualTypeOf<number>();
    expectTypeOf(graph.$plain).toEqualTypeOf<(x: number) => string>();
  });

  it('give models as DSLs and take DSLs', () => {
    const graph = dsl(new MyGraph());
    const a = graph.node('a');
    expectTypeOf(graph.$find('a')).toEqualTypeOf<DSL<NodeModel> | undefined>();
    expectTypeOf(graph.$all()).toEqualTypeOf<DSL<NodeModel>[]>();
    expectTypeOf(graph.$pair()).toEqualTypeOf<
      [DSL<NodeModel>, DSL<EdgeModel>]
    >();
    expectTypeOf(graph.$take(a, [a, modelOf(a)])).toEqualTypeOf<number>();
    // The last overload of a method with models.
    expectTypeOf(graph.$pick('a', false)).toEqualTypeOf<
      DSL<NodeModel> | undefined
    >();
    expectTypeOf(modelOf(graph).pick('a')).toEqualTypeOf<NodeModel>();
  });

  it('flow through a models context', () => {
    const { digraph: myDigraph } = withContext({
      Node: MyNode,
      Edge: MyEdge,
      Subgraph: MySubgraph,
    });
    myDigraph((G) => {
      expectTypeOf(G.node('a')).toEqualTypeOf<DSL<MyNode>>();
      expectTypeOf(G.$createNode('a')).toEqualTypeOf<DSL<MyNode>>();
      expectTypeOf(G.$getNode('a')).toEqualTypeOf<DSL<MyNode> | undefined>();
      expectTypeOf(G.edge(['a', 'b'])).toEqualTypeOf<DSL<MyEdge>>();
      expectTypeOf(G.subgraph('s')).toEqualTypeOf<DSL<MySubgraph>>();
      expectTypeOf(G.$statements[0]).toEqualTypeOf<
        DSL<MyNode> | DSL<MyEdge> | DSL<MySubgraph> | DSL<AttributeListModel>
      >();
      // A subgraph's models are what its class creates: MySubgraph's
      // createNode is typed NodeModel, as on the model.
      G.subgraph((sub) => {
        expectTypeOf(sub.node('b')).toEqualTypeOf<DSL<NodeModel>>();
        expectTypeOf(modelOf(sub).createNode('b')).toEqualTypeOf<NodeModel>();
      });
    });
    withContext({ Node: MyNode }).digraph((G) => {
      G.subgraph((sub) => {
        expectTypeOf(sub.node('b')).toEqualTypeOf<DSL<MyNode>>();
        expectTypeOf(sub.node('b').$extra()).toEqualTypeOf<string>();
      });
    });
    const context = createModelsContext({ Node: MyNode });
    expectTypeOf(dsl(new context.Node('a'))).toEqualTypeOf<DSL<MyNode>>();
  });
});

describe('narrowing', () => {
  it('narrows DSLs by $$type', () => {
    for (const statement of g.$statements) {
      switch (statement.$$type) {
        case 'Node':
          expectTypeOf(statement).toEqualTypeOf<DSL<NodeModel>>();
          break;
        case 'Edge':
          expectTypeOf(statement).toEqualTypeOf<DSL<EdgeModel>>();
          break;
        case 'Subgraph':
          expectTypeOf(statement).toEqualTypeOf<DSL<SubgraphModel>>();
          break;
        default:
          expectTypeOf(statement).toEqualTypeOf<DSL<AttributeListModel>>();
      }
    }
  });

  it('narrows the model of a DSL with the guards', () => {
    const statement = g.$statements[0];
    if (statement) {
      // The guards are false for a DSL.
      if (isNodeModel(statement)) expectTypeOf(statement).toBeNever();
      const model = modelOf(statement);
      if (isNodeModel(model)) expectTypeOf(model).toEqualTypeOf<NodeModel>();
    }
  });

  it('keeps the factories’ graph a DSL', () => {
    expectTypeOf(digraph('G')).toEqualTypeOf<DSL<RootGraphModel>>();
    expectTypeOf(digraph('G').$attributes.node.$$kind).toEqualTypeOf<'Node'>();
  });
});
