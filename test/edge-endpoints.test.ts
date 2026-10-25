/**
 * Edge endpoints as Graphviz has them (#1708): node lists that keep ports,
 * and subgraphs with any statements. Each source is converted to a model
 * and back, and Graphviz must read the result as the same graph as the
 * source (`dot -Tcanon`). Skipped when `dot` is not installed.
 */
import { spawnSync } from 'node:child_process';
import { fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

const hasDot = spawnSync('dot', ['-V']).status === 0;

const canon = (dot: string) => {
  const r = spawnSync('dot', ['-Tcanon'], { input: dot, encoding: 'utf8' });
  expect(r.status, `${dot}\n${r.stderr}`).toBe(0);
  return r.stdout;
};

describe.skipIf(!hasDot)('edge endpoints through the model', () => {
  it.each([
    'digraph { {a:p b:q:n} -> c }',
    'digraph { a:p, b:q:n -> c }',
    'digraph { c -> a:p, b }',
    'digraph { a, b; c, d [shape=box] }',
    'digraph { subgraph s { a [color=red]; b; a -> b } -> c [style=bold] }',
    'digraph { { node [shape=box]; x } -> y }',
    'digraph { { rank=same; a b } -> { c d } }',
    'digraph { a -> b, c -> d }',
    'digraph { { a -> { b c } } -> d }',
    'digraph { subgraph s { a } -> subgraph s { b } }',
    'digraph { subgraph cluster_x { label=X; a } -> subgraph cluster_y { b } }',
    'digraph { {} -> a }',
    'graph { { a b } -- { b c } }',
  ])('%s', (dot) => {
    expect(canon(toDot(fromDot(dot)))).toBe(canon(dot));
  });
});
