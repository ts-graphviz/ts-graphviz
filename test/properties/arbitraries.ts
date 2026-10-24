import type { EdgeTargetLikeTuple, RootGraphModel } from '@ts-graphviz/common';
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

export interface GraphSpec {
  directed: boolean;
  strict: boolean;
  id?: string;
  comment?: string;
  attributes: [string, string][];
  nodes: { id: string; attributes: [string, string][] }[];
  edges: { from: number; to: number; attributes: [string, string][] }[];
  subgraphs: { id?: string; nodes: string[] }[];
}

const attributes = fc.uniqueArray(fc.tuple(stringAttributeKey, dotString()), {
  maxLength: 3,
  selector: ([key]) => key,
});

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
    nodes: fc.uniqueArray(fc.record({ id: dotString(), attributes }), {
      minLength: 1,
      maxLength: 6,
      selector: (n) => n.id,
    }),
    edgeCount: fc.nat({ max: 5 }),
    subgraphs: fc.array(
      fc.record({
        id: fc.option(dotString(), { nil: undefined }),
        nodes: fc.array(dotString(), { maxLength: 3 }),
      }),
      { maxLength: 2 },
    ),
  })
  .chain((spec) =>
    fc
      .array(
        fc.record({
          from: fc.nat({ max: spec.nodes.length - 1 }),
          to: fc.nat({ max: spec.nodes.length - 1 }),
          attributes,
        }),
        { minLength: spec.edgeCount, maxLength: spec.edgeCount },
      )
      .map((edges) => ({ ...spec, edges })),
  );

/** Build a model from a {@link GraphSpec} through the public factory API. */
export function buildGraph(spec: GraphSpec): RootGraphModel {
  const factories = spec.strict ? strict : { digraph, graph };
  const factory = spec.directed ? factories.digraph : factories.graph;
  return factory(spec.id, (g) => {
    g.comment = spec.comment;
    for (const [key, value] of spec.attributes) {
      g.set(key as 'label', value);
    }
    for (const node of spec.nodes) {
      const n = g.node(node.id);
      for (const [key, value] of node.attributes) {
        n.attributes.set(key as 'label', value);
      }
    }
    for (const sub of spec.subgraphs) {
      const s = g.subgraph(sub.id as string);
      for (const id of sub.nodes) {
        s.node(id);
      }
    }
    for (const edge of spec.edges) {
      const targets: EdgeTargetLikeTuple = [
        spec.nodes[edge.from].id,
        spec.nodes[edge.to].id,
      ];
      const e = g.edge(targets);
      for (const [key, value] of edge.attributes) {
        e.attributes.set(key as 'label', value);
      }
    }
  });
}
