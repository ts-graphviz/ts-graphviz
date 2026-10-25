import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { beforeAll, describe, expect, it } from 'vitest';
import { layout } from './layout';

// The real Graphviz WASM, as the worker loads it.
let graphviz: Graphviz;
beforeAll(async () => {
  graphviz = await Graphviz.load();
});

describe('layout', () => {
  it('lays out DOT as SVG', () => {
    const result = layout(graphviz, 'digraph { a -> b }', 'dot');
    expect(result).toMatchObject({ ok: true, version: graphviz.version() });
    expect(result.ok && result.svg).toMatch(
      /<svg[\s\S]*<title>a&#45;&gt;b<\/title>/,
    );
  });

  it.each([
    'dot',
    'neato',
    'fdp',
    'sfdp',
    'circo',
    'twopi',
    'osage',
    'patchwork',
  ] as const)('supports the %s engine offered in the Playground', (engine) => {
    expect(
      layout(graphviz, 'graph { a -- b -- c -- a }', engine),
    ).toMatchObject({ ok: true });
  });

  it('reports invalid DOT', () => {
    expect(layout(graphviz, 'digraph { a -> }', 'dot')).toMatchObject({
      ok: false,
      error: { message: expect.stringContaining('syntax error') },
    });
  });
});
