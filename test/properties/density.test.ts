import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  dotString,
  type GraphSpec,
  graphSpec,
  looksHtmlLikeToPrinter,
} from './arbitraries.js';

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

function classifySpec(spec: GraphSpec): string[] {
  const labels: string[] = [];
  labels.push(spec.directed ? 'directed' : 'undirected');
  if (spec.strict) labels.push('strict');
  if (spec.id !== undefined) labels.push('graph id');
  if (spec.comment !== undefined) labels.push('graph comment');
  if (spec.attributes.length > 0) labels.push('graph attributes');
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
  if (spec.edges.some((e) => e.from === e.to)) labels.push('self loop');
  if (spec.edges.some((e) => e.attributes.length > 0)) {
    labels.push('edge attributes');
  }
  const seen = new Set<string>();
  if (
    spec.edges.some((e) => {
      const key = `${e.from}>${e.to}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    })
  ) {
    labels.push('duplicate edge');
  }
  labels.push(
    spec.subgraphs.length === 0
      ? 'subgraphs: 0'
      : spec.subgraphs.length === 1
        ? 'subgraphs: 1'
        : 'subgraphs: 2',
  );
  if (spec.subgraphs.some((s) => s.nodes.length > 0)) {
    labels.push('subgraph with nodes');
  }
  if (spec.subgraphs.some((s) => s.id !== undefined))
    labels.push('subgraph id');
  return labels;
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
      'duplicate edge': 0.05,
      'subgraphs: 1': 0.2,
      'subgraphs: 2': 0.1,
      'subgraph with nodes': 0.2,
      'subgraph id': 0.2,
    });
  });
});
