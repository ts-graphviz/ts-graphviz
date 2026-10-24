import fc from 'fast-check';
import type { ASTNode } from 'ts-graphviz/ast';
import { describe, expect, it } from 'vitest';
import {
  type DefaultsSpec,
  dotString,
  edgeRefs,
  type GraphSpec,
  graphSpec,
  looksHtmlLikeToPrinter,
  type SubgraphSpec,
  type TargetSpec,
} from './arbitraries.js';
import { dot } from './ast-arbitraries.js';

// Guards the *distribution* of generated data. A property is only as good as
// the cases its generator actually produces, so each input class that matters
// to the printer/parser must keep a minimum share of the samples. Run with
// FC_STATS=1 to print the full distribution.

const SAMPLES = 2000;

/** Share of samples (0..1) per label; a sample may carry several labels. */
function distribution<T>(
  arbitrary: fc.Arbitrary<T>,
  classify: (value: T) => string[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of fc.sample(arbitrary, { numRuns: SAMPLES })) {
    for (const label of classify(value)) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  const shares = new Map(
    [...counts].map(([label, n]) => [label, n / SAMPLES] as const),
  );
  if (process.env.FC_STATS) {
    const rows = [...shares]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([label, share]) => `${label.padEnd(22)} ${(share * 100).toFixed(1)}%`,
      );
    console.log(rows.join('\n'));
  }
  return shares;
}

function expectMinimumShares(
  shares: Map<string, number>,
  minimums: Record<string, number>,
) {
  const tooRare = Object.entries(minimums)
    .filter(([label, min]) => (shares.get(label) ?? 0) < min)
    .map(
      ([label, min]) =>
        `${label}: ${((shares.get(label) ?? 0) * 100).toFixed(1)}% < ${min * 100}%`,
    );
  expect(tooRare, 'input classes generated too rarely').toStrictEqual([]);
}

const DOT_KEYWORDS = /^(graph|digraph|strict|node|edge|subgraph)$/i;

function classifyString(s: string): string[] {
  const labels: string[] = [];
  if (s === '') labels.push('empty');
  else if (s.trim() === '') labels.push('whitespace only');
  if (s.includes('"')) labels.push('has quote');
  if (s.includes('\\')) labels.push('has backslash');
  if (/\\$/.test(s)) labels.push('ends with backslash');
  if (s.includes('\\"')) labels.push('has escaped quote');
  if (looksHtmlLikeToPrinter(s)) labels.push('html-like shape');
  if (/[<>]/.test(s)) labels.push('has angle bracket');
  if (DOT_KEYWORDS.test(s)) labels.push('dot keyword');
  if (/^-?(\.\d+|\d+(\.\d*)?)$/.test(s)) labels.push('numeral');
  // biome-ignore lint/suspicious/noControlCharactersInRegex: the range is the ASCII block
  if (/[^\x00-\x7f]/.test(s)) labels.push('non-ascii');
  if (/[\r\n]/.test(s)) labels.push('has newline');
  if (s.includes('\r\n')) labels.push('has crlf');
  if (/^[\r\n]|[\r\n]$/.test(s)) labels.push('newline at edge');
  if (s.length > 8) labels.push('long (>8)');
  if (/[\s]/.test(s) && s.trim() !== '') labels.push('has whitespace');
  return labels;
}

function classifyDefaults(defaults: DefaultsSpec): boolean {
  return (
    defaults.graph.length + defaults.node.length + defaults.edge.length > 0
  );
}

function classifySubgraphs(subgraphs: SubgraphSpec[], depth: number): string[] {
  const labels: string[] = [];
  for (const sub of subgraphs) {
    if (sub.nodes.length > 0) labels.push('subgraph with nodes');
    if (sub.id !== undefined) labels.push('subgraph id');
    if (sub.attributes.length > 0) labels.push('subgraph attributes');
    if (classifyDefaults(sub.defaults)) labels.push('subgraph defaults');
    if (sub.subgraphs.length > 0)
      labels.push(`nested subgraph (depth ${depth + 1})`);
    labels.push(...classifySubgraphs(sub.subgraphs, depth + 1));
  }
  return labels;
}

function classifySpec(spec: GraphSpec): string[] {
  const labels: string[] = [];
  labels.push(spec.directed ? 'directed' : 'undirected');
  if (spec.strict) labels.push('strict');
  if (spec.id !== undefined) labels.push('graph id');
  if (spec.comment !== undefined) labels.push('graph comment');
  if (spec.attributes.length > 0) labels.push('graph attributes');
  if (classifyDefaults(spec.defaults)) labels.push('graph defaults');
  labels.push(
    spec.nodes.length === 1
      ? 'nodes: 1'
      : spec.nodes.length <= 3
        ? 'nodes: 2-3'
        : 'nodes: 4-6',
  );
  if (spec.nodes.some((n) => n.attributes.length > 0)) {
    labels.push('node attributes');
  }
  labels.push(
    spec.edges.length === 0
      ? 'edges: 0'
      : spec.edges.length <= 2
        ? 'edges: 1-2'
        : 'edges: 3-5',
  );
  const refs = spec.edges.flatMap(edgeRefs);
  if (refs.some((r) => r.port !== undefined)) labels.push('edge with port');
  if (refs.some((r) => r.compass !== undefined)) {
    labels.push('edge with compass');
  }
  if (spec.edges.some((e) => e.targets.some((t) => 'group' in t))) {
    labels.push('edge with group target');
  }
  if (spec.edges.some((e) => e.targets.length > 2)) {
    labels.push('edge with 3+ targets');
  }
  // Two edges with the same nodes in the same positions (ports and compass
  // points aside) exercise edge de-duplication in strict graphs.
  const targetKey = (t: TargetSpec) =>
    'group' in t ? `{${t.group.map((r) => r.node).join(' ')}}` : `${t.node}`;
  const edgeKey = (e: GraphSpec['edges'][number]) =>
    e.targets.map(targetKey).join('>');
  if (
    spec.edges.some(
      (e) =>
        !('group' in e.targets[0]) &&
        !('group' in e.targets[1]) &&
        e.targets[0].node === e.targets[1].node,
    )
  ) {
    labels.push('self loop');
  }
  if (spec.edges.some((e) => e.attributes.length > 0)) {
    labels.push('edge attributes');
  }
  const seen = new Set<string>();
  if (
    spec.edges.some((e) => {
      const key = edgeKey(e);
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    })
  ) {
    labels.push('duplicate endpoints');
  }
  labels.push(
    spec.subgraphs.length === 0
      ? 'subgraphs: 0'
      : spec.subgraphs.length === 1
        ? 'subgraphs: 1'
        : 'subgraphs: 2',
  );
  labels.push(...new Set(classifySubgraphs(spec.subgraphs, 0)));
  return labels;
}

/** Labels for the shapes an AST generator produces, found by walking the tree. */
function classifyAST(root: ASTNode): string[] {
  const labels = new Set<string>();
  const visit = (node: ASTNode, depth: number) => {
    switch (node.type) {
      case 'Literal':
        labels.add(
          node.quoted === 'html'
            ? 'html literal'
            : node.quoted
              ? 'quoted literal'
              : /^-?[.\d]/.test(node.value)
                ? 'numeral literal'
                : 'bare literal',
        );
        if (node.quoted === true && node.value.includes('\\')) {
          labels.add('quoted literal with escape');
        }
        break;
      case 'Comment':
        labels.add(`comment: ${node.kind}`);
        if (node.value.includes('\n')) labels.add('multi-line comment');
        break;
      case 'NodeRef':
        if (node.port) labels.add('port');
        if (node.compass) labels.add('compass');
        break;
      case 'NodeRefGroup':
        labels.add('edge group target');
        break;
      case 'Edge':
        if (node.targets.length > 2) labels.add('edge with 3+ targets');
        if (node.children.length > 0) labels.add('edge attributes');
        break;
      case 'AttributeList':
        labels.add(`attribute list: ${node.kind}`);
        break;
      case 'Subgraph':
        labels.add(depth > 2 ? 'nested subgraph' : 'subgraph');
        break;
      case 'Graph':
        labels.add(node.strict ? 'strict' : 'not strict');
        labels.add(node.directed ? 'directed' : 'undirected');
        if (node.id) labels.add('graph id');
        break;
      case 'Dot':
        if (node.children.filter((c) => c.type === 'Graph').length > 1) {
          labels.add('two graphs');
        }
        break;
    }
    for (const value of Object.values(node)) {
      for (const child of Array.isArray(value) ? value : [value]) {
        if (child && typeof child === 'object' && 'type' in child) {
          visit(child as ASTNode, depth + 1);
        }
      }
    }
  };
  visit(root, 0);
  return [...labels];
}

describe('generator density', () => {
  it('dotString covers the cases that matter to quoting and escaping', () => {
    const shares = distribution(dotString(), classifyString);
    expectMinimumShares(shares, {
      empty: 0.03,
      'has quote': 0.1,
      'has backslash': 0.1,
      'ends with backslash': 0.02,
      'has escaped quote': 0.03,
      'html-like shape': 0.02,
      'has angle bracket': 0.1,
      'dot keyword': 0.02,
      numeral: 0.01,
      'non-ascii': 0.05,
      'long (>8)': 0.1,
      'has whitespace': 0.1,
    });
  });

  it('dotString({ newlines: true }) actually contains line endings', () => {
    const shares = distribution(dotString({ newlines: true }), classifyString);
    expectMinimumShares(shares, {
      'has newline': 0.25,
      'has crlf': 0.05,
      'newline at edge': 0.08,
    });
  });

  it('graphSpec covers graph shapes evenly enough', () => {
    const shares = distribution(graphSpec, classifySpec);
    expectMinimumShares(shares, {
      directed: 0.35,
      undirected: 0.35,
      strict: 0.35,
      'graph id': 0.3,
      'graph comment': 0.3,
      'graph attributes': 0.3,
      'nodes: 1': 0.1,
      'nodes: 2-3': 0.2,
      'nodes: 4-6': 0.2,
      'node attributes': 0.3,
      'edges: 0': 0.1,
      'edges: 1-2': 0.2,
      'edges: 3-5': 0.2,
      'self loop': 0.1,
      'edge attributes': 0.2,
      'duplicate endpoints': 0.05,
      'subgraphs: 1': 0.2,
      'subgraphs: 2': 0.1,
      'subgraph with nodes': 0.2,
      'subgraph id': 0.2,
      'subgraph attributes': 0.1,
      'subgraph defaults': 0.1,
      'nested subgraph (depth 1)': 0.08,
      'graph defaults': 0.3,
      'edge with port': 0.2,
      'edge with compass': 0.15,
      'edge with group target': 0.2,
      'edge with 3+ targets': 0.25,
    });
  });

  it('the AST generator covers every node kind and literal form', () => {
    const shares = distribution(dot, classifyAST);
    expectMinimumShares(shares, {
      'two graphs': 0.3,
      strict: 0.3,
      undirected: 0.3,
      'graph id': 0.3,
      'comment: Block': 0.1,
      'comment: Slash': 0.1,
      'comment: Macro': 0.1,
      'multi-line comment': 0.1,
      'bare literal': 0.6,
      'numeral literal': 0.3,
      'quoted literal': 0.6,
      'quoted literal with escape': 0.3,
      'html literal': 0.2,
      port: 0.3,
      compass: 0.2,
      'edge group target': 0.3,
      'edge with 3+ targets': 0.3,
      'edge attributes': 0.3,
      'attribute list: Graph': 0.15,
      'attribute list: Node': 0.15,
      'attribute list: Edge': 0.15,
      subgraph: 0.2,
      'nested subgraph': 0.05,
    });
  });
});
