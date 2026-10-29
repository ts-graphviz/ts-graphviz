/**
 * Edge endpoints as Graphviz has them (#1708): node lists that keep ports,
 * and subgraphs with any statements. Each source is converted to a model
 * and back, and Graphviz must read the result as the same graph as the
 * source (`dot -Tcanon`). Skipped when `dot` is not installed.
 */
import { spawnSync } from 'node:child_process';
import { fromDot, toDot } from 'ts-graphviz';
import { beforeEach, describe, expect, it } from 'vitest';

let dotInstalled: boolean | undefined;
/** Whether `dot` runs, asked by the first test that needs it. */
const hasDot = () =>
  (dotInstalled ??= spawnSync('dot', ['-V'], { timeout: 10_000 }).status === 0);

const canon = (dot: string) => {
  const r = spawnSync('dot', ['-Tcanon'], {
    input: dot,
    encoding: 'utf8',
    timeout: 30_000,
  });
  expect(r.status, `${dot}\n${r.stderr}`).toBe(0);
  return r.stdout;
};

describe('edge endpoints through the model', { tags: ['process'] }, () => {
  beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));
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
