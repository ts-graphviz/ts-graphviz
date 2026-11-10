import {
  type AnyDotObjectModel,
  type Attribute,
  type AttributeListDSL,
  type AttributeListModel,
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
  type GraphCommonAttributes,
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
  type RootGraphDSL,
  type RootGraphModel,
  Subgraph,
  type SubgraphDSL,
  type SubgraphModel,
  withContext,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The types of the DOT DSL (packages/ts-graphviz/src/dsl.ts), by the rules
// of its design: what DSL<T> is for each model, how keys are routed (DOT's
// words: statements, a few members, attributes), what goes in (models or
// DSLs) and comes out of the statements (DSLs), and where the members of
// custom classes are (on the model). The run-time side of each rule is in
// packages/ts-graphviz/src/dsl.test.ts.

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
  it('give only DOT’s words as members', () => {
    expectTypeOf(n.port('p')).toEqualTypeOf<ForwardRefNode>();
    expectTypeOf(n.addComment).toEqualTypeOf<
      OmitThisParameter<NodeModel['addComment']>
    >();
    expectTypeOf(d.addComment).toEqualTypeOf<
      OmitThisParameter<DotModel['addComment']>
    >();
    // The members are bound to the model: they can be taken off the DSL,
    // also when a class types `this`.
    class ThisTyped extends Node {
      override addComment(
        this: ThisTyped,
        ...args: Parameters<Node['addComment']>
      ): ReturnType<Node['addComment']> {
        return super.addComment(...args);
      }
    }
    const { addComment } = dsl(new ThisTyped('t'));
    addComment('note');
    // The rest of the model is on modelOf(x).
    // @ts-expect-error on the model: modelOf(g).createNode
    g.createNode;
    // @ts-expect-error on the model: modelOf(g).nodes
    g.nodes;
    // @ts-expect-error on the model: modelOf(n).getAttribute
    n.getAttribute;
    // @ts-expect-error on the model: modelOf(n).comments
    n.comments;
    // @ts-expect-error on the model: modelOf(e).targets
    e.targets;
    // @ts-expect-error on the model: modelOf(s).isSubgraphCluster
    s.isSubgraphCluster;
    // @ts-expect-error a port is a node's
    e.port;
    expectTypeOf(modelOf(n).id).toEqualTypeOf<string>();
  });

  it('have $$type, and $$kind on attribute lists', () => {
    expectTypeOf(n.$$type).toEqualTypeOf<'Node'>();
    expectTypeOf(e.$$type).toEqualTypeOf<'Edge'>();
    expectTypeOf(s.$$type).toEqualTypeOf<'Subgraph'>();
    expectTypeOf(g.$$type).toEqualTypeOf<'Graph'>();
    expectTypeOf(d.$$type).toEqualTypeOf<'Dot'>();
    expectTypeOf(g.graph({}).$$kind).toEqualTypeOf<'Graph'>();
  });

  it('keep the members read-only', () => {
    // @ts-expect-error
    n.$$type = 'Node';
    // @ts-expect-error
    n.addComment = modelOf(n).addComment;
    // @ts-expect-error
    n.port = modelOf(n).port;
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
    expectTypeOf(e.weight).toEqualTypeOf<Attribute<'weight'> | undefined>();
    // arrowhead is a union of 1,764 names: compared by toExtend both ways,
    // as toEqualTypeOf's deep comparison takes seconds on it
    expectTypeOf(e.arrowhead).toExtend<Attribute<'arrowhead'> | undefined>();
    expectTypeOf<Attribute<'arrowhead'> | undefined>().toExtend<
      typeof e.arrowhead
    >();
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
    const lists = modelOf(g).attributes;
    dsl(lists.node).shape = 'box';
    dsl(lists.edge).arrowhead = 'dot';
    dsl(lists.graph).label = 'G';
    // @ts-expect-error graph [...] takes the attributes of subgraphs
    dsl(lists.graph).rankdir = 'LR';
    // @ts-expect-error not an attribute of nodes
    dsl(lists.node).arrowhead = 'dot';
    // @ts-expect-error not an attribute of edges
    dsl(lists.edge).shape = 'box';
    expectTypeOf(g.node({}).shape).toEqualTypeOf<
      Attribute<'shape'> | undefined
    >();
  });

  it('give a Dot no attributes', () => {
    // @ts-expect-error a Dot has no attributes
    d.label = 'x';
    // @ts-expect-error on the model: modelOf(d).graphs
    d.graphs;
  });
});

describe('edge targets', () => {
  it('take DSLs, models, ids, references and groups', () => {
    const m = modelOf(n);
    g.edge([n, m]);
    g.edge([n, 'b:p:n', { id: 'c', port: 'p' }, [n, 'd'], n.port('p')]);
    const [from, to] = modelOf(e).targets;
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
    expectTypeOf(g.node({ shape: 'box' })).toEqualTypeOf<
      DSL<GraphCommonAttributes['node']>
    >();
    expectTypeOf(g.edge({ color: 'red' })).toEqualTypeOf<
      DSL<GraphCommonAttributes['edge']>
    >();
    expectTypeOf(g.graph({ label: 'G' })).toEqualTypeOf<
      DSL<GraphCommonAttributes['graph']>
    >();
    g.edge(['a', 'b'], { color: 'red' }, (edge) =>
      expectTypeOf(edge).toEqualTypeOf<DSL<EdgeModel>>(),
    );
    g.subgraph('cluster_a', { color: 'red' }, (sub) =>
      expectTypeOf(sub).toEqualTypeOf<DSL<SubgraphModel>>(),
    );
    s.subgraph((sub) => expectTypeOf(sub).toEqualTypeOf<DSL<SubgraphModel>>());
  });

  it('take the cluster attributes for a cluster only', () => {
    g.subgraph('cluster_a', { color: 'red' });
    g.subgraph({ cluster: true, color: 'red' });
    g.subgraph('a', { rank: 'same' });
    // @ts-expect-error color is a cluster attribute
    g.subgraph('a', { color: 'red' });
    // @ts-expect-error color is a cluster attribute
    g.subgraph({ color: 'red' });
  });

  it('take the attributes of each kind', () => {
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
  }
  class MyEdge extends Edge {
    weight(): number {
      return 1;
    }
  }
  class MySubgraph extends Subgraph {
    tag(): string {
      return 's';
    }
  }

  it('keep the members a class adds on the model', () => {
    const v = dsl(new MyNode('a'));
    // @ts-expect-error on the model: modelOf(v).extra
    v.extra;
    expectTypeOf(modelOf(v).extra()).toEqualTypeOf<string>();
  });

  it('flow through a models context', () => {
    const { digraph: myDigraph } = withContext({
      Node: MyNode,
      Edge: MyEdge,
      Subgraph: MySubgraph,
    });
    myDigraph((G) => {
      expectTypeOf(G.node('a')).toEqualTypeOf<DSL<MyNode>>();
      expectTypeOf(modelOf(G).createNode('a')).toEqualTypeOf<MyNode>();
      expectTypeOf(G.edge(['a', 'b'])).toEqualTypeOf<DSL<MyEdge>>();
      expectTypeOf(
        modelOf(G.edge(['a', 'b'])).weight(),
      ).toEqualTypeOf<number>();
      expectTypeOf(G.subgraph('s')).toEqualTypeOf<DSL<MySubgraph>>();
      expectTypeOf(modelOf(G.subgraph('s')).tag()).toEqualTypeOf<string>();
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
        expectTypeOf(modelOf(sub.node('b')).extra()).toEqualTypeOf<string>();
      });
    });
    const context = createModelsContext({ Node: MyNode });
    expectTypeOf(dsl(new context.Node('a'))).toEqualTypeOf<DSL<MyNode>>();
  });
});

describe('narrowing', () => {
  type Statement =
    | DSL<NodeModel>
    | DSL<EdgeModel>
    | DSL<SubgraphModel>
    | DSL<AttributeListModel>;
  const statement = n as Statement;

  it('narrows DSLs by $$type', () => {
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
  });

  it('narrows the model of a DSL with the guards', () => {
    // The guards are false for a DSL.
    if (isNodeModel(statement)) expectTypeOf(statement).toBeNever();
    const model = modelOf(statement);
    if (isNodeModel(model)) expectTypeOf(model).toEqualTypeOf<NodeModel>();
  });

  it('keeps the factories’ graph a DSL', () => {
    expectTypeOf(digraph('G')).toEqualTypeOf<DSL<RootGraphModel>>();
    expectTypeOf(digraph('G').node({}).$$kind).toEqualTypeOf<'Node'>();
  });
});
