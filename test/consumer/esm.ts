// Type-checked by `pnpm check:consumer-types` against the packed packages, as
// a user installs them (scripts/check-consumer-types.ts). It imports every
// entry point and uses representative API through the declarations.
import * as adapter from '@ts-graphviz/adapter';
import * as astPackage from '@ts-graphviz/ast';
import { htmlLike, isTsGraphvizError } from '@ts-graphviz/common';
import { createModelsContext, Node } from '@ts-graphviz/core';
import {
  attribute as _,
  type Attribute,
  type DSL,
  digraph,
  dsl,
  type EdgeModel,
  fromDot,
  type graph,
  isNodeModel,
  type ModelOf,
  modelOf,
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
import * as ordered from 'ts-graphviz/ordered';

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
    assertType<Equal<typeof s, DSL<SubgraphModel>>>();
    s.node('c');
  });
  // @ts-expect-error an edge needs at least two targets
  g.edge(['a']);
});
assertType<Equal<typeof g, DSL<RootGraphModel>>>();
assertType<Equal<ReturnType<typeof graph>, DSL<RootGraphModel>>>();
assertType<Equal<ModelOf<typeof g>, RootGraphModel>>();
strict.graph((g) => {
  g[_.label] = 'strict';
});

// attributes by name, the model's members with $
const rankdir = g.rankdir;
assertType<Equal<typeof rankdir, Attribute<'rankdir'> | undefined>>();
g.rankdir = 'TB';
// @ts-expect-error not an attribute of graphs
g.shape = 'box';
// @ts-expect-error not a value of rankdir
g.rankdir = 'XX';
g.node('a').shape = 'box';
g.$set('rankdir', 'TB');
g.node('a').$id satisfies string;
const model: RootGraphModel = modelOf(g);
dsl(model).node('b');

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
withContext({ Node: MyNode }).digraph((g) => g.node('a').$extra());
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
const nodes = modelOf(g).statements.filter(isNodeModel);
assertType<Equal<typeof nodes, NodeModel[]>>();
const nodeViews = g.$statements.filter(
  (s): s is DSL<NodeModel> => s.$$type === 'Node',
);
assertType<Equal<typeof nodeViews, DSL<NodeModel>[]>>();
const readNodes = [unknownValue].filter(isNodeModel);
assertType<Equal<typeof readNodes, ReadonlyNodeModel[]>>();
// @ts-expect-error not a node
toDot({ $$type: 'Node' });

// ts-graphviz/ordered: the same names, with orderedModels
const orderedGraph = ordered.digraph((g) => {
  g.node({ color: 'red' });
  g.node('a');
});
assertType<Equal<typeof orderedGraph, DSL<RootGraphModel>>>();
assertType<Equal<typeof ordered.toDot, typeof toDot>>();
const orderedModel = ordered.fromDot('digraph { a }');
assertType<Equal<typeof orderedModel, RootGraphModel>>();
const orderedNode = ordered.fromDot('a', {
  parse: { startRule: 'Node' },
  convert: { models: { Node: MyNode } },
});
assertType<Equal<typeof orderedNode, MyNode>>();
const orderedGraphs = ordered.fromDotAll('digraph { a }');
assertType<Equal<typeof orderedGraphs, RootGraphModel[]>>();
ordered.withContext({ Node }).strict.graph();

try {
  parse('{');
} catch (error) {
  if (isTsGraphvizError(error)) error.code satisfies string;
}
