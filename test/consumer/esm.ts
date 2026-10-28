// Type-checked by `pnpm check:consumer-types` against the packed packages, as
// a user installs them (scripts/check-consumer-types.ts). It imports every
// entry point and uses representative API through the declarations.
import * as adapter from '@ts-graphviz/adapter';
import * as astPackage from '@ts-graphviz/ast';
import {
  htmlLike,
  isTsGraphvizError,
  type ModelTypes,
  type Schema,
  type SchemaEntry,
} from '@ts-graphviz/common';
import { createModelsContext, Digraph, Node } from '@ts-graphviz/core';
import {
  attribute as _,
  type Attribute,
  digraph,
  type EdgeModel,
  fromDot,
  type graph,
  isNodeModel,
  type NodeModel,
  type ReadonlyNodeModel,
  type RootGraphModel,
  type SubgraphModel,
  strict,
  toDot,
  withContext,
} from 'ts-graphviz';
import { toBlob } from 'ts-graphviz/adapter';
import {
  type DotASTNode,
  type NodeASTNode,
  parse,
  parseFragment,
  sanitize,
  stringify,
} from 'ts-graphviz/ast';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
declare function assertType<T extends true>(): void;

// factories and callbacks
const g = digraph('G', { rankdir: 'LR' }, (g) => {
  const a = g.node('a', { shape: 'box', label: htmlLike('<b>a</b>') });
  g.edge([a, 'b:p:n', { id: 'c', port: 'p' }, ['d', 'e']], { color: 'red' });
  g.subgraph('cluster_0', { label: 'c' }, (s) => {
    assertType<Equal<typeof s, SubgraphModel>>();
    s.node('c');
  });
  // @ts-expect-error an edge needs at least two targets
  g.edge(['a']);
});
assertType<Equal<typeof g, RootGraphModel>>();
assertType<Equal<ReturnType<typeof graph>, RootGraphModel>>();
strict.graph((g) => g.set(_.label, 'strict'));

// attribute typing
g.set('rankdir', 'TB');
const rankdir = g.get('rankdir');
assertType<Equal<typeof rankdir, Attribute<'rankdir'> | undefined>>();
// @ts-expect-error not an attribute of graphs
g.set('shape', 'box');
// @ts-expect-error not a value of rankdir
g.set('rankdir', 'XX');
g.node('a').attributes.set('shape', 'box');

// fromDot / toDot
const text: string = toDot(g);
const node = fromDot('a', { parse: { startRule: 'Node' } });
assertType<Equal<typeof node, NodeModel>>();
const edge = fromDot('a -> b', { parse: { startRule: 'Edge' } });
assertType<Equal<typeof edge, EdgeModel>>();

// custom models through the core package
class MyNode extends Node {
  extra(): string {
    return this.id;
  }
}
withContext({ Node: MyNode }).digraph((g) => g.node('a').extra());
createModelsContext({ Node: MyNode });

// parse / parseFragment / stringify / sanitize
const dot: DotASTNode = parse(sanitize(text));
const nodeAST = parseFragment('a [color=red]', 'Node');
assertType<Equal<typeof nodeAST, NodeASTNode>>();
// @ts-expect-error not a rule
parseFragment('a', 'Statement');
const printed: string = stringify(dot) + astPackage.stringify(nodeAST);

// adapter options
const blob: Blob = await toBlob(g, {
  format: 'svg',
  layout: 'neato',
  noop: 1,
});
await blob.text();
await adapter.toBlob(printed, {
  layout: 'fdp',
  grid: true,
  sanitize: false,
  signal: AbortSignal.timeout(1000),
  attributes: { node: { shape: 'box' } },
});
// @ts-expect-error neato's option on another layout
await adapter.toBlob(printed, { layout: 'dot', noop: 1 });
// @ts-expect-error not an output format
await adapter.toBlob(printed, { format: 'docx' });

// read-only model types: every model fits, the readers take them, guards
// on unknown narrow to them and keep the caller's type given a model
const describeNode = (n: ReadonlyNodeModel): string =>
  `${n.id}: ${String(n.attributes.get('label'))}`;
describeNode(new MyNode('m'));
const unknownValue: unknown = g;
if (isNodeModel(unknownValue)) {
  assertType<Equal<typeof unknownValue, ReadonlyNodeModel>>();
  toDot(unknownValue);
}
const nodes = g.statements.filter(isNodeModel);
assertType<Equal<typeof nodes, NodeModel[]>>();
const readNodes = [unknownValue].filter(isNodeModel);
assertType<Equal<typeof readNodes, ReadonlyNodeModel[]>>();
// @ts-expect-error not a node
toDot({ $$type: 'Node' });

// schema type parameters: a graph of a schema types its attributes with it,
// and its models fit the read-only types, also in generic code
type ConsumerSchema = {
  node: {
    'data-id': SchemaEntry<number, 'add'>;
    label: SchemaEntry<number, 'override'>;
  };
};
const schemaGraph = new Digraph<ModelTypes<ConsumerSchema>>();
const schemaNode = schemaGraph.node('a', { 'data-id': 1, label: 2 });
assertType<Equal<typeof schemaNode, NodeModel<ConsumerSchema>>>();
const schemaLabel = schemaNode.attributes.get('label');
assertType<Equal<typeof schemaLabel, number | undefined>>();
// @ts-expect-error a number in this schema
schemaGraph.node('b', { label: 'x' });
// @ts-expect-error a node of no schema
schemaGraph.addNode(g.node('c'));
describeNode(schemaNode);
const printAny = <S extends Schema>(graph: RootGraphModel<ModelTypes<S>>) =>
  toDot(graph);
printAny(schemaGraph);

try {
  parse('{');
} catch (error) {
  if (isTsGraphvizError(error)) error.code satisfies string;
}
