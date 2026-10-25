/**
 * Differential testing against the Graphviz `dot` binary (#1504).
 *
 * `toDot` output of generated graphs is fed to Graphviz twice:
 * - `dot -Tcanon` must accept it (Graphviz parses everything we write);
 * - `gvpr` with `dump.gvpr` reports the graph Graphviz actually built, with
 *   the attribute values Graphviz resolved, and that must match what the
 *   model means under Graphviz's own rules, computed here from the model:
 *   - `a -> b -> c` and `{a b} -> c` are binary edges; a group without
 *     ports is written `{a b}`, a set of nodes, and a group with a port or
 *     compass point `a:p, b`, a list whose ports count (#1708);
 *   - ports become the `tailport` / `headport` attributes (`p:n`);
 *   - `node [...]` / `edge [...]` defaults apply when an object is created
 *     (in statement order: attributes, defaults, nodes, subgraphs, edges);
 *     a later mention only adds its explicit attributes;
 *   - a strict graph keeps one edge per node pair (unordered when the
 *     graph is undirected);
 *   - `label=a;` and `graph [label=a];` both set the graph's attributes;
 *   - Graphviz keeps escape sequences in values and ids as written (only
 *     `\"` is resolved), so text is compared in that form; an empty value
 *     is "unset".
 *
 * Skipped when `dot` is not installed. `FC_NUM_RUNS` raises the run count.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import fc from 'fast-check';
import { toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import {
  buildGraph,
  type GraphSpec,
  graphSpec,
} from '../properties/arbitraries.js';
import { type RootGraphSummary, summarize } from '../properties/summarize.js';

const dotVersion = (() => {
  const r = spawnSync('dot', ['-V'], { encoding: 'utf8' });
  return r.status === 0 ? r.stderr.trim() : undefined;
})();

const DUMP = join(import.meta.dirname, 'dump.gvpr');
const SEP = '\x1f';
const REC = '\x1e';

function graphviz(args: string[], input: string) {
  return spawnSync(args[0], args.slice(1), {
    input,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

// ---------------------------------------------------------------------------
// What Graphviz built, from the gvpr dump.

type Attrs = Map<string, string>;
interface Dump {
  name: string;
  directed: boolean;
  strict: boolean;
  attributes: Attrs;
  nodes: Map<string, Attrs>;
  edges: { tail: string; head: string; attributes: Attrs }[];
}

/** Attribute pairs from a record's fields; empty values are "unset". */
function pairs(fields: string[]): Attrs {
  const m: Attrs = new Map();
  for (let i = 0; i + 1 < fields.length; i += 2) {
    if (fields[i + 1] !== '') m.set(fields[i], fields[i + 1]);
  }
  return m;
}

function parseDump(text: string): Dump {
  const dump: Dump = {
    name: '',
    directed: false,
    strict: false,
    attributes: new Map(),
    nodes: new Map(),
    edges: [],
  };
  for (const record of text.split(REC)) {
    if (record === '') continue;
    const [kind, ...fields] = record.split(SEP);
    switch (kind) {
      case 'G':
        dump.name = fields[0];
        dump.directed = fields[1] === 'directed';
        dump.strict = fields[2] === 'strict';
        dump.attributes = pairs(fields.slice(3));
        break;
      case 'N':
        dump.nodes.set(fields[0], pairs(fields.slice(1)));
        break;
      case 'E':
        dump.edges.push({
          tail: fields[0],
          head: fields[1],
          attributes: pairs(fields.slice(2)),
        });
        break;
    }
  }
  return dump;
}

// ---------------------------------------------------------------------------
// What the model means, under Graphviz's rules.

/**
 * The text Graphviz stores for literal text (a plain string id or value)
 * written by toDot. Spelled out here on purpose, independently of the
 * library's escaping helpers, so that a regression in those helpers shows
 * up as a difference: Graphviz keeps a backslash sequence as written and
 * resolves only `\"`, so a backslash must reach it doubled, a quote may
 * reach it as `\"` (stored as `"`), and a raw line break is written as the
 * `\n` / `\r` sequence (stored as those two characters).
 */
function gvText(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error(`the generator only produces string values: ${value}`);
  }
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}
const gvId = gvText;

type Graph = RootGraphSummary | RootGraphSummary['subgraphs'][number];
type Entries = [string, unknown][];

// An empty value is kept here (it overrides an inherited default, i.e.
// unsets it) and dropped only when the attributes are compared.
const textAttrs = (entries: Iterable<[string, unknown]>): Attrs => {
  const m: Attrs = new Map();
  for (const [k, v] of entries) m.set(gvId(k), gvText(v));
  return m;
};

/** An object: defaults at creation, explicit attributes on every mention. */
class Effective {
  readonly attributes: Attrs;
  constructor(defaults: Attrs) {
    this.attributes = new Map(defaults);
  }
  mention(explicit: Entries): this {
    for (const [k, v] of textAttrs(explicit)) this.attributes.set(k, v);
    return this;
  }
}

interface Expected {
  attributes: Attrs;
  nodes: Map<string, Effective>;
  edges: { tail: string; head: string; attributes: Attrs }[];
}

const portText = (t: { port?: string; compass?: string }) =>
  [t.port, t.compass]
    .filter((p): p is string => p !== undefined)
    .map(gvId)
    .join(':');

function expected(root: RootGraphSummary): Expected {
  const nodes = new Map<string, Effective>();
  const strictEdges = new Map<string, Effective>();
  const edges: Expected['edges'] = [];
  const node = (id: string, defaults: Attrs) => {
    const n = nodes.get(id) ?? new Effective(defaults);
    nodes.set(id, n);
    return n;
  };
  const walk = (g: Graph, nodeDefaults: Attrs, edgeDefaults: Attrs) => {
    const nd = new Map([...nodeDefaults, ...textAttrs(g.defaults.node)]);
    const ed = new Map([...edgeDefaults, ...textAttrs(g.defaults.edge)]);
    for (const n of g.nodes) node(gvId(n.id), nd).mention(n.attributes);
    for (const sub of g.subgraphs) walk(sub, nd, ed);
    for (const e of g.edges) {
      // A group without ports is a set of nodes (`{a b}`); with one, a list
      // that keeps every port (`a:p, b`). A chain is binary edges.
      const ends = e.targets.map((t) =>
        !Array.isArray(t)
          ? [{ id: gvId(t.id), port: portText(t) }]
          : t.some((r) => r.port !== undefined || r.compass !== undefined)
            ? t.map((r) => ({ id: gvId(r.id), port: portText(r) }))
            : [...new Set(t.map((r) => gvId(r.id)))].map((id) => ({ id })),
      );
      for (const end of ends) for (const r of end) node(r.id, nd);
      for (let i = 0; i + 1 < ends.length; i++) {
        for (const from of ends[i]) {
          for (const to of ends[i + 1]) {
            let [tail, head] = [from, to];
            if (root.strict && !root.directed && head.id < tail.id) {
              [tail, head] = [to, from];
            }
            // Ports are already Graphviz text; they are set after the
            // explicit attributes without going through gvText again.
            const withPorts = (edge: Effective) => {
              edge.mention(e.attributes);
              if ('port' in tail && tail.port) {
                edge.attributes.set('tailport', tail.port);
              }
              if ('port' in head && head.port) {
                edge.attributes.set('headport', head.port);
              }
              return edge;
            };
            if (root.strict) {
              const key = `${tail.id}${SEP}${head.id}`;
              strictEdges.set(
                key,
                withPorts(strictEdges.get(key) ?? new Effective(ed)),
              );
            } else {
              edges.push({
                tail: tail.id,
                head: head.id,
                attributes: withPorts(new Effective(ed)).attributes,
              });
            }
          }
        }
      }
    }
  };
  walk(root, new Map(), new Map());
  for (const [key, e] of strictEdges) {
    const [tail, head] = key.split(SEP);
    edges.push({ tail, head, attributes: e.attributes });
  }
  return {
    // `label=a;` is written before `graph [...]`, so the list wins.
    attributes: textAttrs([...root.attributes, ...root.defaults.graph]),
    nodes,
    edges,
  };
}

// ---------------------------------------------------------------------------

/** Attributes as a sorted list, without the unset (empty) ones. */
const sortedMap = (m: Attrs) =>
  [...m].filter(([, v]) => v !== '').sort(([a], [b]) => a.localeCompare(b));
const edgeKey = (e: { tail: string; head: string; attributes: Attrs }) =>
  JSON.stringify([e.tail, e.head, sortedMap(e.attributes)]);

/** Every graph, subgraph and node name in a spec (subgraph nodes are bare ids). */
function names(spec: GraphSpec): string[] {
  type Sub = GraphSpec['subgraphs'][number];
  const fromSub = (s: Sub): string[] => [
    ...(s.id !== undefined ? [s.id] : []),
    ...s.nodes,
    ...s.subgraphs.flatMap(fromSub),
  ];
  return [
    ...(spec.id !== undefined ? [spec.id] : []),
    ...spec.nodes.map((n) => n.id),
    ...spec.subgraphs.flatMap(fromSub),
  ];
}

describe.skipIf(!dotVersion)(
  `[SM-2] differential against ${dotVersion}`,
  () => {
    it(
      'Graphviz accepts every generated graph and builds the graph the model means',
      () => {
        fc.assert(
          fc.property(graphSpec, (spec) => {
            // The dump format uses two control characters as separators.
            // (Ports never contain ':' — toDot rejects them, #1641.)
            const text = JSON.stringify(spec);
            fc.pre(!text.includes('\\u001e') && !text.includes('\\u001f'));
            // cgraph reserves names starting with '%' for anonymous objects
            // and renames a graph or node called that (`"%"` becomes `%1`).
            fc.pre(!names(spec).some((name) => name.startsWith('%')));

            const model = buildGraph(spec);
            const source = toDot(model);

            const canon = graphviz(['dot', '-Tcanon'], source);
            expect(
              canon.status,
              `dot rejected:\n${source}\n${canon.stderr}`,
            ).toBe(0);

            const dumped = graphviz(['gvpr', '-f', DUMP], source);
            expect(
              dumped.status,
              `gvpr failed:\n${source}\n${dumped.stderr}`,
            ).toBe(0);
            const theirs = parseDump(dumped.stdout);
            const ours = expected(summarize(model));

            expect(theirs.directed).toBe(spec.directed);
            expect(theirs.strict).toBe(spec.strict);
            if (spec.id !== undefined) expect(theirs.name).toBe(gvId(spec.id));
            expect(sortedMap(theirs.attributes)).toStrictEqual(
              sortedMap(ours.attributes),
            );
            expect([...theirs.nodes.keys()].sort()).toStrictEqual(
              [...ours.nodes.keys()].sort(),
            );
            for (const [id, n] of ours.nodes) {
              expect(
                sortedMap(theirs.nodes.get(id) ?? new Map()),
                id,
              ).toStrictEqual(sortedMap(n.attributes));
            }
            const theirEdges = theirs.edges.map((e) =>
              spec.strict && !spec.directed && e.head < e.tail
                ? edgeKey({
                    tail: e.head,
                    head: e.tail,
                    attributes: swapPorts(e.attributes),
                  })
                : edgeKey(e),
            );
            const ourEdges = ours.edges.map(edgeKey).sort();
            expect(
              theirEdges.sort(),
              `edges differ (percent-encoded)\ntheirs: ${theirEdges.map(encodeURIComponent).join('\n')}\nours:   ${ourEdges.map(encodeURIComponent).join('\n')}\nsource:\n${source}`,
            ).toStrictEqual(ourEdges);
          }),
          // Each case spawns dot and gvpr, so the default is lower than the
          // other properties'; FC_NUM_RUNS raises it (the nightly run does),
          // and the time limit is wider than the shared 60 s for that reason.
          {
            numRuns: process.env.FC_NUM_RUNS
              ? Number(process.env.FC_NUM_RUNS)
              : 60,
            interruptAfterTimeLimit: 20 * 60_000,
          },
        );
      },
      25 * 60_000,
    );
  },
);

function swapPorts(attributes: Attrs): Attrs {
  const m = new Map(attributes);
  const tail = m.get('tailport');
  const head = m.get('headport');
  m.delete('tailport');
  m.delete('headport');
  if (tail !== undefined) m.set('headport', tail);
  if (head !== undefined) m.set('tailport', head);
  return m;
}
