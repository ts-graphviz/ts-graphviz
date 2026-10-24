import type {
  Compass,
  EdgeTargetLike,
  EdgeTargetLikeTuple,
  ForwardRefNode,
  GraphBaseModel,
  RootGraphModel,
} from '@ts-graphviz/common';
import fc from 'fast-check';
import { digraph, graph, strict } from 'ts-graphviz';

/**
 * Strings that stress the DOT printer and parser: quotes, backslashes, DOT
 * keywords, numerals, whitespace, Unicode, HTML-like fragments.
 *
 * Null bytes are excluded: Graphviz treats them as string terminators, so the
 * printer removes them on purpose.
 */
const specialStrings = fc.constantFrom(
  '',
  ' ',
  '"',
  '\\',
  '\\\\',
  '\\"',
  'a\\',
  'a"b',
  '<b>',
  '<',
  '>',
  '<<x>>',
  'graph',
  'digraph',
  'strict',
  'node',
  'edge',
  'subgraph',
  '->',
  '--',
  '-1.5',
  '007',
  '.5',
  '\t',
  '日本語',
  '😀',
  '/* c */',
  '// c',
  '#',
  '[',
  ']',
  '{',
  '}',
  ';',
  '=',
  ':',
  ':n',
);

/** Short mixes of the characters that matter to quoting and escaping. */
const tokenMix = (extra: string[] = []) =>
  fc
    .array(
      fc.constantFrom('a', 'b', '"', '\\', ' ', '<', '>', '\\"', 'n', ...extra),
      { minLength: 1, maxLength: 8 },
    )
    .map((parts) => parts.join(''));

/** Strings that contain raw line endings: LF, CR, CRLF, leading/trailing, repeated. */
const newlineStrings = fc
  .tuple(
    fc.constantFrom('', 'a', ' ', '"', '\\'),
    fc.constantFrom('\n', '\r', '\r\n', '\n\n', '\\\n'),
    fc.constantFrom('', 'b', ' ', '>', '\n'),
  )
  .map((parts) => parts.join(''));

/** Things the printer must quote: numerals (which DOT accepts bare), keywords, HTML-like shapes. */
const quotingEdgeCases = fc.oneof(
  fc
    .tuple(
      fc.constantFrom('', '-'),
      fc.constantFrom('0', '1', '007', '12'),
      fc.constantFrom('', '.', '.5', '.50'),
    )
    .map((parts) => parts.join('')),
  fc.constantFrom('graph', 'digraph', 'strict', 'node', 'edge', 'subgraph'),
  fc
    .tuple(
      fc.constantFrom('', ' '),
      fc.constantFrom('<b>', '<<x>>', '<>', '<a', '<>>', '<<', '< x >'),
      fc.constantFrom('', ' ', '>'),
    )
    .map((parts) => parts.join('')),
);

export const dotString = (options: { newlines?: boolean } = {}) =>
  fc
    .oneof(
      { arbitrary: fc.string({ unit: 'grapheme', maxLength: 12 }), weight: 3 },
      { arbitrary: specialStrings, weight: 2 },
      { arbitrary: tokenMix(), weight: 2 },
      { arbitrary: quotingEdgeCases, weight: 1 },
      ...(options.newlines
        ? [
            { arbitrary: newlineStrings, weight: 3 },
            { arbitrary: tokenMix(['\n', '\r\n']), weight: 1 },
          ]
        : []),
    )
    .filter((s) => options.newlines === true || !/[\r\n]/.test(s));

/**
 * Mirrors the printer's HTML-like detection (`convert-attribute.ts`): note the
 * `m` flag, which makes any value with a line starting in `<` and a later line
 * ending in `>` count as HTML-like. Settled by #1587.
 */
export const looksHtmlLikeToPrinter = (s: string) => /^<.+>$/ms.test(s.trim());

/** Attribute keys whose values are plain strings on every object kind. */
const stringAttributeKey = fc.constantFrom(
  'label',
  'tooltip',
  'fontname',
  'URL',
);

type Attributes = [string, string][];

/** One end of an edge: a node by index, optionally with a port and compass point. */
export interface NodeRefSpec {
  node: number;
  port?: string;
  compass?: Compass;
}

/** An edge target: a single node reference or a group `{a b}`. */
export type TargetSpec = NodeRefSpec | { group: NodeRefSpec[] };

/** Default attribute statements (`graph [...]`, `node [...]`, `edge [...]`). */
export interface DefaultsSpec {
  graph: Attributes;
  node: Attributes;
  edge: Attributes;
}

export interface SubgraphSpec {
  id?: string;
  attributes: Attributes;
  defaults: DefaultsSpec;
  nodes: string[];
  subgraphs: SubgraphSpec[];
}

export interface GraphSpec {
  directed: boolean;
  strict: boolean;
  id?: string;
  comment?: string;
  attributes: Attributes;
  defaults: DefaultsSpec;
  nodes: { id: string; attributes: Attributes }[];
  edges: { targets: TargetSpec[]; attributes: Attributes }[];
  subgraphs: SubgraphSpec[];
}

const attributes = fc.uniqueArray(fc.tuple(stringAttributeKey, dotString()), {
  maxLength: 3,
  selector: ([key]) => key,
});

/** Mostly empty, so that graphs without default statements stay common. */
const defaults: fc.Arbitrary<DefaultsSpec> = fc.record({
  graph: fc.oneof({ arbitrary: fc.constant([]), weight: 2 }, attributes),
  node: fc.oneof({ arbitrary: fc.constant([]), weight: 2 }, attributes),
  edge: fc.oneof({ arbitrary: fc.constant([]), weight: 2 }, attributes),
});

const COMPASS_POINTS = [
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
  'c',
  '_',
] as const satisfies readonly Compass[];

const compass = fc.constantFrom<Compass>(...COMPASS_POINTS);

/**
 * A port name. Compass points are excluded because `a:n` means a compass
 * point; the empty string is excluded because the model treats it as "no port";
 * ':' is excluded because toDot rejects it (Graphviz reads `p:q` as
 * port:compass, #1641).
 */
const port = dotString().filter(
  (s) =>
    s !== '' &&
    !s.includes(':') &&
    !(COMPASS_POINTS as readonly string[]).includes(s),
);

const nodeRefSpec = (nodeCount: number): fc.Arbitrary<NodeRefSpec> =>
  fc
    .record({
      node: fc.nat({ max: nodeCount - 1 }),
      port: fc.option(port, { nil: undefined, freq: 4 }),
      compass: fc.option(compass, { nil: undefined, freq: 4 }),
    })
    .map((ref) => ({
      node: ref.node,
      ...(ref.port !== undefined ? { port: ref.port } : {}),
      ...(ref.compass !== undefined ? { compass: ref.compass } : {}),
    }));

const targetSpec = (nodeCount: number): fc.Arbitrary<TargetSpec> =>
  fc.oneof(
    { arbitrary: nodeRefSpec(nodeCount), weight: 5 },
    {
      arbitrary: fc
        .array(nodeRefSpec(nodeCount), { minLength: 1, maxLength: 3 })
        .map((group) => ({ group })),
      weight: 1,
    },
  );

const subgraphSpec: fc.Arbitrary<SubgraphSpec> = fc.letrec<{
  subgraph: SubgraphSpec;
}>((tie) => ({
  subgraph: fc.record({
    id: fc.option(dotString(), { nil: undefined }),
    attributes: fc.oneof({ arbitrary: fc.constant([]), weight: 2 }, attributes),
    defaults,
    nodes: fc.array(dotString(), { maxLength: 3 }),
    subgraphs: fc.oneof(
      { depthSize: 'small', maxDepth: 2 },
      { arbitrary: fc.constant([]), weight: 3 },
      { arbitrary: fc.array(tie('subgraph'), { maxLength: 2 }), weight: 1 },
    ),
  }),
})).subgraph;

/** A random graph description with between one and six nodes. */
export const graphSpec: fc.Arbitrary<GraphSpec> = fc
  .record({
    directed: fc.boolean(),
    strict: fc.boolean(),
    id: fc.option(dotString(), { nil: undefined }),
    // An empty comment means "no comment", and the parser trims the text of
    // `//` comments, so only trimmed, non-empty comments round-trip exactly.
    comment: fc.option(
      dotString().filter((s) => s.trim() !== '' && s === s.trim()),
      { nil: undefined },
    ),
    attributes,
    defaults,
    nodes: fc.uniqueArray(fc.record({ id: dotString(), attributes }), {
      minLength: 1,
      maxLength: 6,
      selector: (n) => n.id,
    }),
    edgeCount: fc.nat({ max: 5 }),
    subgraphs: fc.array(subgraphSpec, { maxLength: 2 }),
  })
  .chain((spec) =>
    fc
      .array(
        fc.record({
          targets: fc
            .tuple(
              targetSpec(spec.nodes.length),
              targetSpec(spec.nodes.length),
              fc.array(targetSpec(spec.nodes.length), { maxLength: 2 }),
            )
            .map(([from, to, rest]) => [from, to, ...rest]),
          attributes,
        }),
        { minLength: spec.edgeCount, maxLength: spec.edgeCount },
      )
      .map((edges) => ({ ...spec, edges })),
  );

/** Every node reference of an edge, groups flattened. */
export function edgeRefs(edge: GraphSpec['edges'][number]): NodeRefSpec[] {
  return edge.targets.flatMap((t) => ('group' in t ? t.group : [t]));
}

function applyDefaults(g: GraphBaseModel, spec: DefaultsSpec): void {
  const asObject = (attrs: Attributes) =>
    Object.fromEntries(attrs) as Record<'label', string>;
  if (spec.graph.length > 0) g.graph(asObject(spec.graph));
  if (spec.node.length > 0) g.node(asObject(spec.node));
  if (spec.edge.length > 0) g.edge(asObject(spec.edge));
}

function applySubgraph(parent: GraphBaseModel, spec: SubgraphSpec): void {
  const s = parent.subgraph(spec.id as string);
  for (const [key, value] of spec.attributes) {
    s.set(key as 'label', value);
  }
  applyDefaults(s, spec.defaults);
  for (const id of spec.nodes) {
    s.node(id);
  }
  for (const sub of spec.subgraphs) {
    applySubgraph(s, sub);
  }
}

/** Build a model from a {@link GraphSpec} through the public factory API. */
export function buildGraph(spec: GraphSpec): RootGraphModel {
  const factories = spec.strict ? strict : { digraph, graph };
  const factory = spec.directed ? factories.digraph : factories.graph;
  // A plain string target is split on `:` by the model API, so references are
  // passed as objects to keep ids that contain a colon intact.
  const ref = (t: NodeRefSpec): ForwardRefNode => ({
    id: spec.nodes[t.node].id,
    ...(t.port !== undefined ? { port: t.port } : {}),
    ...(t.compass !== undefined ? { compass: t.compass } : {}),
  });
  const target = (t: TargetSpec): EdgeTargetLike =>
    'group' in t ? t.group.map(ref) : ref(t);
  return factory(spec.id, (g) => {
    g.comment = spec.comment;
    for (const [key, value] of spec.attributes) {
      g.set(key as 'label', value);
    }
    applyDefaults(g, spec.defaults);
    for (const node of spec.nodes) {
      const n = g.node(node.id);
      for (const [key, value] of node.attributes) {
        n.attributes.set(key as 'label', value);
      }
    }
    for (const sub of spec.subgraphs) {
      applySubgraph(g, sub);
    }
    for (const edge of spec.edges) {
      const e = g.edge(edge.targets.map(target) as EdgeTargetLikeTuple);
      for (const [key, value] of edge.attributes) {
        e.attributes.set(key as 'label', value);
      }
    }
  });
}
