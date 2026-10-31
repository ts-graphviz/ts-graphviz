import {
  type ConvertFromModelPlugin,
  FromModelConverter,
  fromModel,
  type ModelToAST,
  type NodeASTNode,
} from '@ts-graphviz/ast';
import {
  type AnyDotObjectModel,
  type AnyReadonlyDotObjectModel,
  type Attribute,
  type AttributeKey,
  type AttributeList,
  type AttributeListModel,
  type Attributes,
  type Digraph,
  Dot,
  type DotModel,
  type DotObjectModel,
  type DotValue,
  digraph,
  Edge,
  type EdgeModel,
  type EdgeTarget,
  type ForwardRefNode,
  type Graph,
  type GraphStatementModel,
  isAttributeListModel,
  isDotModel,
  isEdgeModel,
  isNodeModel,
  isNodeRef,
  isRootGraphModel,
  isSubgraphModel,
  Node,
  type NodeAttributeKey,
  type NodeModel,
  type NodeRef,
  OrderedDigraph,
  type OrderedGraph,
  type OrderedSubgraph,
  type ReadonlyAttributeListModel,
  type ReadonlyAttributes,
  type ReadonlyDotModel,
  type ReadonlyEdgeModel,
  type ReadonlyGraphBaseModel,
  type ReadonlyGraphStatementModel,
  type ReadonlyNodeModel,
  type ReadonlyRootGraphModel,
  type ReadonlySubgraphModel,
  type RootGraphModel,
  type Subgraph,
  type SubgraphModel,
  toDot,
} from 'ts-graphviz';
import { type DotInput, toFile, toStream } from 'ts-graphviz/adapter';
import { describe, expectTypeOf, it } from 'vitest';

// The read-only model types (#1841, option B): every model fits them, a
// read-only one is not a writable one, and the code that only reads models
// takes them.

/** A model class of the user's own. */
class MyNode extends Node {
  public get kind(): string {
    return 'mine';
  }
}

/**
 * Models whose attributes are typed differently from the built-in ones (a
 * numeric `label`), as a schema will type them: the read-only types must
 * not mention the built-in attribute types or take a model, or these would
 * not fit.
 */
interface NumAttributes {
  readonly size: number;
  readonly values: ReadonlyArray<['label', number]>;
  get(key: 'label'): number | undefined;
  set(key: 'label', value: number): void;
}
interface NumNode extends Omit<NodeModel, 'attributes'> {
  readonly attributes: NumAttributes;
}
interface NumEdge extends Omit<EdgeModel, 'attributes'> {
  readonly attributes: NumAttributes;
}
interface NumAttributeList extends NumAttributes {
  readonly $$type: 'AttributeList';
  readonly $$kind: 'Node';
  comment?: string;
}
interface NumGraphBase<T extends 'Graph' | 'Subgraph'> extends NumAttributes {
  readonly $$type: T;
  readonly id?: string;
  comment?: string;
  readonly attributes: {
    readonly graph: RootGraphModel['attributes']['graph'];
    readonly edge: RootGraphModel['attributes']['edge'];
    readonly node: NumAttributeList & { readonly $$kind: 'Node' };
  };
  readonly nodes: ReadonlyArray<NumNode>;
  readonly edges: ReadonlyArray<NumEdge>;
  readonly subgraphs: ReadonlyArray<NumSubgraph>;
  readonly statements: ReadonlyArray<NumNode | NumEdge | NumSubgraph>;
  addNode(node: NumNode): void;
  addEdge(edge: NumEdge): void;
  removeNode(node: NumNode | string): void;
  existNode(nodeId: string): boolean;
  getNode(id: string): NumNode | undefined;
  getSubgraph(id: string): NumSubgraph | undefined;
  node(id: string, attributes?: { label?: number }): NumNode;
}
interface NumSubgraph extends NumGraphBase<'Subgraph'> {
  isSubgraphCluster(): boolean;
}
interface NumGraph extends NumGraphBase<'Graph'> {
  directed: boolean;
  strict: boolean;
}
interface NumDot {
  readonly $$type: 'Dot';
  comment?: string;
  readonly graphs: ReadonlyArray<NumGraph>;
  addGraph(graph: NumGraph): void;
}

describe('every model fits its read-only type', () => {
  it('the model interfaces', () => {
    expectTypeOf<Attributes<NodeAttributeKey>>().toExtend<ReadonlyAttributes>();
    expectTypeOf<Attributes<AttributeKey>>().toExtend<ReadonlyAttributes>();
    expectTypeOf<AttributeListModel>().toExtend<ReadonlyAttributeListModel>();
    expectTypeOf<AttributeListModel<'Node', NodeAttributeKey>>().toExtend<
      ReadonlyAttributeListModel<'Node'>
    >();
    expectTypeOf<NodeModel>().toExtend<ReadonlyNodeModel>();
    expectTypeOf<EdgeModel>().toExtend<ReadonlyEdgeModel>();
    expectTypeOf<SubgraphModel>().toExtend<ReadonlySubgraphModel>();
    expectTypeOf<SubgraphModel>().toExtend<
      ReadonlyGraphBaseModel<'Subgraph'>
    >();
    expectTypeOf<RootGraphModel>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<RootGraphModel>().toExtend<ReadonlyGraphBaseModel<'Graph'>>();
    expectTypeOf<DotModel>().toExtend<ReadonlyDotModel>();
    expectTypeOf<GraphStatementModel>().toExtend<ReadonlyGraphStatementModel>();
    expectTypeOf<AnyDotObjectModel>().toExtend<AnyReadonlyDotObjectModel>();
  });

  it('the classes of @ts-graphviz/core, ordered ones and subclasses', () => {
    expectTypeOf<AttributeList<'Edge'>>().toExtend<
      ReadonlyAttributeListModel<'Edge'>
    >();
    expectTypeOf<Node>().toExtend<ReadonlyNodeModel>();
    expectTypeOf<MyNode>().toExtend<ReadonlyNodeModel>();
    expectTypeOf<Edge>().toExtend<ReadonlyEdgeModel>();
    expectTypeOf<Subgraph>().toExtend<ReadonlySubgraphModel>();
    expectTypeOf<OrderedSubgraph>().toExtend<ReadonlySubgraphModel>();
    expectTypeOf<Digraph>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<Graph>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<OrderedDigraph>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<OrderedGraph>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<Dot>().toExtend<ReadonlyDotModel>();
  });

  it('models whose attributes are typed differently', () => {
    expectTypeOf<NumAttributes>().toExtend<ReadonlyAttributes>();
    expectTypeOf<NumAttributeList>().toExtend<ReadonlyAttributeListModel>();
    expectTypeOf<NumNode>().toExtend<ReadonlyNodeModel>();
    expectTypeOf<NumEdge>().toExtend<ReadonlyEdgeModel>();
    expectTypeOf<NumSubgraph>().toExtend<ReadonlySubgraphModel>();
    expectTypeOf<NumGraph>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<NumDot>().toExtend<ReadonlyDotModel>();
    // ...but they are not the built-in models.
    expectTypeOf<NumNode>().not.toExtend<NodeModel>();
    expectTypeOf<NumGraph>().not.toExtend<RootGraphModel>();
  });

  it('every attribute value is a DotValue', () => {
    expectTypeOf<Attribute<AttributeKey>>().toExtend<DotValue>();
  });
});

describe('a read-only model is not a writable one', () => {
  it('in any direction that would allow writing', () => {
    expectTypeOf<ReadonlyAttributes>().not.toExtend<Attributes<AttributeKey>>();
    expectTypeOf<ReadonlyAttributeListModel>().not.toExtend<AttributeListModel>();
    expectTypeOf<ReadonlyNodeModel>().not.toExtend<NodeModel>();
    expectTypeOf<ReadonlyEdgeModel>().not.toExtend<EdgeModel>();
    expectTypeOf<ReadonlySubgraphModel>().not.toExtend<SubgraphModel>();
    expectTypeOf<ReadonlyRootGraphModel>().not.toExtend<RootGraphModel>();
    expectTypeOf<ReadonlyDotModel>().not.toExtend<DotModel>();
    expectTypeOf<AnyReadonlyDotObjectModel>().not.toExtend<AnyDotObjectModel>();
  });

  it('has no member to write with', () => {
    const node = {} as ReadonlyNodeModel;
    // @ts-expect-error read-only
    node.attributes.set('label', 'x');
    // @ts-expect-error read-only
    node.comment = 'x';
    const g = {} as ReadonlyRootGraphModel;
    // @ts-expect-error read-only
    g.addNode(new Node('a'));
    // @ts-expect-error read-only
    g.directed = false;
  });
});

describe('the readers take every model', () => {
  const g = digraph();
  const node = g.node('a');
  const models = [
    g,
    node,
    g.edge(['a', 'b']),
    g.subgraph('s'),
    g.attributes.node,
    new Dot([g]),
    new MyNode('m'),
    new OrderedDigraph(),
    {} as AnyDotObjectModel,
    {} as AnyReadonlyDotObjectModel,
    {} as NumNode,
    {} as NumGraph,
    {} as NumDot,
  ] as const;

  it('toDot, fromModel, FromModelConverter and the adapter', () => {
    for (const model of models) {
      expectTypeOf(toDot(model)).toEqualTypeOf<string>();
      fromModel(model);
      new FromModelConverter().convert(model);
      expectTypeOf(model).toExtend<DotInput>();
      void toFile(model, 'out.svg');
      void toStream(model);
    }
    expectTypeOf(fromModel(node)).toEqualTypeOf<NodeASTNode>();
    expectTypeOf(
      fromModel({} as ReadonlyNodeModel),
    ).toEqualTypeOf<NodeASTNode>();
    expectTypeOf<ModelToAST<ReadonlyNodeModel>>().toEqualTypeOf<NodeASTNode>();
  });

  it('in generic code', () => {
    const write = <T extends AnyReadonlyDotObjectModel>(model: T) =>
      toDot(model);
    const writeNode = <N extends NodeModel | NumNode>(n: N) => toDot(n);
    void write;
    void writeNode;
  });

  it('a plugin is typed by a read-only model', () => {
    expectTypeOf<ConvertFromModelPlugin<ReadonlyNodeModel>['match']>()
      .parameter(0)
      .toEqualTypeOf<ReadonlyNodeModel>();
  });

  it('a malformed object is not a model', () => {
    // @ts-expect-error not a node: no id and no attributes
    toDot({ $$type: 'Node' });
    // @ts-expect-error not a node
    fromModel({ $$type: 'Node' });
    // @ts-expect-error not a node
    void toFile({ $$type: 'Node' }, 'out.svg');
  });
});

describe('the guards', () => {
  it('narrow unknown to the read-only types', () => {
    const value: unknown = null;
    if (isNodeModel(value))
      expectTypeOf(value).toEqualTypeOf<ReadonlyNodeModel>();
    if (isEdgeModel(value))
      expectTypeOf(value).toEqualTypeOf<ReadonlyEdgeModel>();
    if (isSubgraphModel(value)) {
      expectTypeOf(value).toEqualTypeOf<ReadonlySubgraphModel>();
    }
    if (isRootGraphModel(value)) {
      expectTypeOf(value).toEqualTypeOf<ReadonlyRootGraphModel>();
    }
    if (isDotModel(value))
      expectTypeOf(value).toEqualTypeOf<ReadonlyDotModel>();
    if (isAttributeListModel(value)) {
      expectTypeOf(value).toEqualTypeOf<ReadonlyAttributeListModel>();
    }
    if (isNodeRef(value)) expectTypeOf(value).toEqualTypeOf<NodeRef>();
  });

  it("keep the caller's type given a model", () => {
    const model = {} as AnyDotObjectModel;
    if (isNodeModel(model)) expectTypeOf(model).toEqualTypeOf<NodeModel>();
    if (isEdgeModel(model)) expectTypeOf(model).toEqualTypeOf<EdgeModel>();
    if (isSubgraphModel(model)) {
      expectTypeOf(model).toEqualTypeOf<SubgraphModel>();
    }
    if (isRootGraphModel(model)) {
      expectTypeOf(model).toEqualTypeOf<RootGraphModel>();
    }
    if (isDotModel(model)) expectTypeOf(model).toEqualTypeOf<DotModel>();
    if (isAttributeListModel(model)) {
      expectTypeOf(model).toEqualTypeOf<AttributeListModel>();
    }
    const mine = {} as MyNode | Edge | OrderedDigraph;
    if (isNodeModel(mine)) expectTypeOf(mine).toEqualTypeOf<MyNode>();
    if (isRootGraphModel(mine)) {
      expectTypeOf(mine).toEqualTypeOf<OrderedDigraph>();
    }
    const read = {} as AnyReadonlyDotObjectModel;
    if (isEdgeModel(read))
      expectTypeOf(read).toEqualTypeOf<ReadonlyEdgeModel>();
  });

  it('filter arrays of models by their type', () => {
    const models = [] as AnyDotObjectModel[];
    expectTypeOf(models.filter(isNodeModel)).toEqualTypeOf<NodeModel[]>();
    expectTypeOf(models.filter(isSubgraphModel)).toEqualTypeOf<
      SubgraphModel[]
    >();
    expectTypeOf(models.filter(isRootGraphModel)).toEqualTypeOf<
      RootGraphModel[]
    >();
    expectTypeOf(models.filter(isAttributeListModel)).toEqualTypeOf<
      AttributeListModel[]
    >();
    expectTypeOf(models.filter(isDotModel)).toEqualTypeOf<DotModel[]>();
    expectTypeOf(digraph().statements.filter(isEdgeModel)).toEqualTypeOf<
      EdgeModel[]
    >();
    const mine = [] as (MyNode | Edge)[];
    expectTypeOf(mine.filter(isNodeModel)).toEqualTypeOf<MyNode[]>();
  });

  it('filter arrays of unknown values or read-only models', () => {
    const values = [] as unknown[];
    expectTypeOf(values.filter(isNodeModel)).toEqualTypeOf<
      ReadonlyNodeModel[]
    >();
    expectTypeOf(values.filter(isRootGraphModel)).toEqualTypeOf<
      ReadonlyRootGraphModel[]
    >();
    const read = [] as AnyReadonlyDotObjectModel[];
    expectTypeOf(read.filter(isEdgeModel)).toEqualTypeOf<ReadonlyEdgeModel[]>();
    expectTypeOf(read.filter(isDotModel)).toEqualTypeOf<ReadonlyDotModel[]>();
  });

  it('narrow a wider type to the read-only type, and leave out the rest', () => {
    const object = {} as DotObjectModel;
    if (isNodeModel(object)) {
      expectTypeOf(object).toExtend<ReadonlyNodeModel>();
      expectTypeOf(object).not.toExtend<NodeModel>();
    }
    // A type of your own that a model can also be.
    const tagged = {} as { id: string; source: string };
    if (isNodeModel(tagged)) {
      expectTypeOf(tagged).toEqualTypeOf<
        { id: string; source: string } & ReadonlyNodeModel
      >();
    }
    expectTypeOf([tagged].filter(isNodeModel)).toEqualTypeOf<
      ({ id: string; source: string } & ReadonlyNodeModel)[]
    >();
    const nodeOrId = {} as NodeModel | string;
    if (isNodeModel(nodeOrId))
      expectTypeOf(nodeOrId).toEqualTypeOf<NodeModel>();
  });
});

describe('edge targets are read-only references', () => {
  it('hold read-only nodes', () => {
    expectTypeOf<NodeRef>().toEqualTypeOf<ReadonlyNodeModel | ForwardRefNode>();
    const [from] = new Edge(['a', 'b'] as unknown as [NodeRef, NodeRef])
      .targets;
    expectTypeOf(from).toEqualTypeOf<EdgeTarget>();
    if (isNodeModel(from)) {
      expectTypeOf(from).toExtend<ReadonlyNodeModel>();
      expectTypeOf(from).not.toExtend<NodeModel>();
      expectTypeOf(from.id).toEqualTypeOf<string>();
    }
  });

  it('take any node model', () => {
    const g = digraph();
    const node = {} as ReadonlyNodeModel;
    g.edge([node, new MyNode('m'), {} as NumNode]);
    g.createEdge([node, [node, 'b']]);
    new Edge([node, g.node('a')]);
  });
});
