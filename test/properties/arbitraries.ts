import type {
  AttributeListKind,
  Compass,
  EdgeTargetLike,
  EdgeTargetLikeTuple,
  ForwardRefNode,
  GraphBaseModel,
  RootGraphModel,
} from '@ts-graphviz/common';
import fc from 'fast-check';
import { Digraph, Graph, OrderedDigraph, OrderedGraph } from 'ts-graphviz';

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

type DefaultsKind = keyof DefaultsSpec;

/**
 * One step of building a graph. A graph is built by taking its steps in
 * order, and keeps its statements in that order (#1732), so statements of
 * every kind come in any order:
 * - `attribute`: `g.set(...)` with `attributes[index]`;
 * - `defaults`: `defaults[kind]` as a default statement;
 * - `more defaults`: another default statement of that kind (kept in place
 *   by the classes of `orderedModels`, merged by the default classes);
 * - `node`: `g.node(id)` with the node's attributes (a node already
 *   mentioned is mentioned again);
 * - `mention`: `g.node(id)` again for a node of the graph, with more
 *   attributes, before or after its own `node` step;
 * - `subgraph` / `edge`: `subgraphs[index]` / `edges[index]`.
 */
export type GraphOp =
  | { op: 'attribute'; index: number }
  | { op: 'defaults'; kind: DefaultsKind }
  | { op: 'more defaults'; kind: DefaultsKind; attributes: Attributes }
  | { op: 'node'; index: number }
  | { op: 'mention'; node: number; attributes: Attributes }
  | { op: 'subgraph'; index: number }
  | { op: 'edge'; index: number };

/** The steps a subgraph is built with: no edges, no mentions. */
export type SubgraphOp = Exclude<GraphOp, { op: 'mention' | 'edge' }>;

export interface SubgraphSpec {
  id?: string;
  attributes: Attributes;
  defaults: DefaultsSpec;
  nodes: string[];
  subgraphs: SubgraphSpec[];
  /** The build steps; without them, {@link fixedOps}. */
  ops?: SubgraphOp[];
}

export interface GraphSpec {
  directed: boolean;
  strict: boolean;
  /** Built with the classes of `orderedModels` (default statements in place). */
  ordered?: boolean;
  id?: string;
  comment?: string;
  attributes: Attributes;
  defaults: DefaultsSpec;
  nodes: { id: string; attributes: Attributes }[];
  edges: { targets: TargetSpec[]; attributes: Attributes }[];
  subgraphs: SubgraphSpec[];
  /** The build steps; without them, {@link fixedOps}. */
  ops?: GraphOp[];
}

const attributes = fc.uniqueArray(fc.tuple(stringAttributeKey, dotString()), {
  maxLength: 3,
  selector: ([key]) => key,
});

const DEFAULTS_KINDS = ['graph', 'node', 'edge'] as const;

/**
 * The steps that build a spec in the order statements had before they kept
 * their place: attributes, defaults, nodes, subgraphs, edges.
 */
function fixedOps(spec: GraphSpec): GraphOp[];
function fixedOps(spec: SubgraphSpec): SubgraphOp[];
function fixedOps(spec: GraphSpec | SubgraphSpec): GraphOp[] {
  const indexes = (items: readonly unknown[]) => items.map((_, i) => i);
  return [
    ...indexes(spec.attributes).map((index) => ({
      op: 'attribute' as const,
      index,
    })),
    ...DEFAULTS_KINDS.filter((kind) => spec.defaults[kind].length > 0).map(
      (kind) => ({ op: 'defaults' as const, kind }),
    ),
    ...indexes(spec.nodes).map((index) => ({ op: 'node' as const, index })),
    ...indexes(spec.subgraphs).map((index) => ({
      op: 'subgraph' as const,
      index,
    })),
    ...('edges' in spec ? indexes(spec.edges) : []).map((index) => ({
      op: 'edge' as const,
      index,
    })),
  ];
}

/** The steps in any order: mostly shuffled, sometimes as given. */
const interleaved = <T>(steps: T[]): fc.Arbitrary<T[]> =>
  fc.oneof(
    { arbitrary: fc.constant(null).map(() => [...steps]), weight: 1 },
    {
      arbitrary: fc.shuffledSubarray(steps, {
        minLength: steps.length,
        maxLength: steps.length,
      }),
      weight: 4,
    },
  );

/** Another default statement; never empty. */
const moreDefaults = fc.record({
  op: fc.constant('more defaults' as const),
  kind: fc.constantFrom(...DEFAULTS_KINDS),
  attributes: attributes.filter((a) => a.length > 0),
});

/** No attributes; a new array each time, typed as mutable. */
const noAttributes: fc.Arbitrary<Attributes> = fc
  .constant(null)
  .map((): Attributes => []);

/** Mostly empty, so that graphs without default statements stay common. */
const defaults: fc.Arbitrary<DefaultsSpec> = fc.record({
  graph: fc.oneof({ arbitrary: noAttributes, weight: 2 }, attributes),
  node: fc.oneof({ arbitrary: noAttributes, weight: 2 }, attributes),
  edge: fc.oneof({ arbitrary: noAttributes, weight: 2 }, attributes),
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
  subgraph: fc
    .record({
      id: fc.option(dotString(), { nil: undefined }),
      attributes: fc.oneof({ arbitrary: noAttributes, weight: 2 }, attributes),
      defaults,
      nodes: fc.array(dotString(), { maxLength: 3 }),
      subgraphs: fc.oneof(
        { depthSize: 'small', maxDepth: 2 },
        {
          arbitrary: fc.constant(null).map((): SubgraphSpec[] => []),
          weight: 3,
        },
        { arbitrary: fc.array(tie('subgraph'), { maxLength: 2 }), weight: 1 },
      ),
      more: fc.array(moreDefaults, { maxLength: 1 }),
    })
    .chain(({ more, ...spec }) =>
      interleaved<SubgraphOp>([...fixedOps(spec), ...more]).map(
        (ops): SubgraphSpec => ({ ...spec, ops }),
      ),
    ),
})).subgraph;

/**
 * A random graph description with between one and six nodes, built by its
 * steps in an interleaved order.
 */
export const graphSpec: fc.Arbitrary<GraphSpec> = fc
  .record({
    directed: fc.boolean(),
    strict: fc.boolean(),
    ordered: fc.boolean(),
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
  .chain(({ edgeCount, ...spec }) =>
    fc
      .record({
        edges: fc.array(
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
          { minLength: edgeCount, maxLength: edgeCount },
        ),
        mentions: fc.array(
          fc.record({
            op: fc.constant('mention' as const),
            node: fc.nat({ max: spec.nodes.length - 1 }),
            attributes: fc.oneof(noAttributes, attributes),
          }),
          { maxLength: 2 },
        ),
        more: fc.array(moreDefaults, { maxLength: 2 }),
      })
      .chain(({ edges, mentions, more }) => {
        const built: GraphSpec = { ...spec, edges };
        return interleaved<GraphOp>([
          ...fixedOps(built),
          ...mentions,
          ...more,
        ]).map((ops): GraphSpec => ({ ...built, ops }));
      }),
  );

/** Every node reference of an edge, groups flattened. */
export function edgeRefs(edge: GraphSpec['edges'][number]): NodeRefSpec[] {
  return edge.targets.flatMap((t) => ('group' in t ? t.group : [t]));
}

const LIST_KIND: Record<DefaultsKind, AttributeListKind> = {
  graph: 'Graph',
  node: 'Node',
  edge: 'Edge',
};

/** A default statement: merged into the defaults, or kept in place. */
function addDefaults(
  g: GraphBaseModel,
  kind: DefaultsKind,
  attrs: Attributes,
): void {
  if (attrs.length > 0) {
    g.addAttributeList(
      LIST_KIND[kind],
      Object.fromEntries(attrs) as Record<'label', string>,
    );
  }
}

/** `g.node(id)`, then the given attributes set on the node. */
function mentionNode(g: GraphBaseModel, id: string, attrs: Attributes): void {
  const n = g.node(id);
  for (const [key, value] of attrs) {
    n.attributes.set(key as 'label', value);
  }
}

/** The steps graphs and subgraphs have in common. */
function applyCommonOp(
  g: GraphBaseModel,
  spec: GraphSpec | SubgraphSpec,
  op: SubgraphOp,
): void {
  switch (op.op) {
    case 'attribute': {
      const [key, value] = spec.attributes[op.index];
      g.set(key as 'label', value);
      break;
    }
    case 'defaults':
      addDefaults(g, op.kind, spec.defaults[op.kind]);
      break;
    case 'more defaults':
      addDefaults(g, op.kind, op.attributes);
      break;
    case 'node': {
      const node = spec.nodes[op.index];
      if (typeof node === 'string') mentionNode(g, node, []);
      else mentionNode(g, node.id, node.attributes);
      break;
    }
    case 'subgraph':
      applySubgraph(g, spec.subgraphs[op.index]);
      break;
  }
}

function applySubgraph(parent: GraphBaseModel, spec: SubgraphSpec): void {
  const s = parent.subgraph(spec.id as string);
  for (const op of spec.ops ?? fixedOps(spec)) {
    applyCommonOp(s, spec, op);
  }
}

/**
 * Build a model from a {@link GraphSpec} through the public model API,
 * taking its steps in order.
 */
export function buildGraph(spec: GraphSpec): RootGraphModel {
  const Class = spec.ordered
    ? spec.directed
      ? OrderedDigraph
      : OrderedGraph
    : spec.directed
      ? Digraph
      : Graph;
  const g: RootGraphModel = new Class(spec.id, spec.strict);
  // A plain string target is split on `:` by the model API, so references are
  // passed as objects to keep ids that contain a colon intact.
  const ref = (t: NodeRefSpec): ForwardRefNode => ({
    id: spec.nodes[t.node].id,
    ...(t.port !== undefined ? { port: t.port } : {}),
    ...(t.compass !== undefined ? { compass: t.compass } : {}),
  });
  const target = (t: TargetSpec): EdgeTargetLike =>
    'group' in t ? t.group.map(ref) : ref(t);
  g.comment = spec.comment;
  for (const op of spec.ops ?? fixedOps(spec)) {
    switch (op.op) {
      case 'mention':
        mentionNode(g, spec.nodes[op.node].id, op.attributes);
        break;
      case 'edge': {
        const edge = spec.edges[op.index];
        const e = g.edge(edge.targets.map(target) as EdgeTargetLikeTuple);
        for (const [key, value] of edge.attributes) {
          e.attributes.set(key as 'label', value);
        }
        break;
      }
      default:
        applyCommonOp(g, spec, op);
    }
  }
  return g;
}

/**
 * Where each statement of a graph stands, subgraphs included: the kind of
 * each, a node's id, a kept default statement's kind and attributes. What
 * the statements hold is compared by `summarize`.
 */
export function statementOrder(g: GraphBaseModel): unknown[] {
  return g.statements.map((s) => {
    switch (s.$$type) {
      case 'Node':
        return ['node', s.id];
      case 'Edge':
        return ['edge'];
      case 'Subgraph':
        return ['subgraph', s.id, statementOrder(s)];
      default:
        return [
          'defaults',
          s.$$kind,
          [...s.values].sort(([a], [b]) => a.localeCompare(b)),
        ];
    }
  });
}
