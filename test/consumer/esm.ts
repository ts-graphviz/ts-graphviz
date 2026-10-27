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
  digraph,
  type EdgeModel,
  fromDot,
  type graph,
  type ModelsContext,
  type NodeModel,
  type RootGraphModel,
  type SchemaEntry,
  type SchemaModelTypes,
  type SubgraphModel,
  strict,
  toDot,
  withContext,
} from 'ts-graphviz';
import { toStream } from 'ts-graphviz/adapter';
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

// models typed with a schema (#1841); written by hand until defineSchema
type MySchema = {
  types: { color: SchemaEntry<'brand-blue', 'extend'> };
  cluster: { team: SchemaEntry<'core' | 'infra', 'add'> };
  node: {
    'data-id': SchemaEntry<number, 'add'>;
    label: SchemaEntry<number, 'override'>;
  };
};
declare const schemaModels: ModelsContext<SchemaModelTypes<MySchema>>;
withContext(schemaModels).digraph((g) => {
  const a = g.node('a', { 'data-id': 1, label: 2, color: 'brand-blue' });
  const label = a.attributes.get('label');
  assertType<Equal<typeof label, number | undefined>>();
  // @ts-expect-error overridden: a number
  a.attributes.set('label', 'x');
  g.subgraph('cluster_a', { team: 'core' });
  // @ts-expect-error a cluster attribute
  g.subgraph('row', { team: 'core' });
  g.edge([a, 'b'], { color: 'brand-blue' });
  // A model with a schema is still a model.
  const plain: RootGraphModel = g;
  toDot(plain);
});

// parse / parseFragment / stringify / sanitize
const dot: DotASTNode = parse(sanitize(text));
const nodeAST = parseFragment('a [color=red]', 'Node');
assertType<Equal<typeof nodeAST, NodeASTNode>>();
// @ts-expect-error not a rule
parseFragment('a', 'Statement');
const printed: string = stringify(dot) + astPackage.stringify(nodeAST);

// adapter options
await toStream(g, { format: 'svg', layout: 'neato', noop: 1 });
await adapter.toStream(printed, {
  layout: 'fdp',
  grid: true,
  sanitize: false,
  signal: AbortSignal.timeout(1000),
  attributes: { node: { shape: 'box' } },
});
// @ts-expect-error neato's option on another layout
await adapter.toFile(printed, 'out.svg', { layout: 'dot', noop: 1 });
// @ts-expect-error not an output format
await adapter.toStream(printed, { format: 'docx' });

try {
  parse('{');
} catch (error) {
  if (isTsGraphvizError(error)) error.code satisfies string;
}
