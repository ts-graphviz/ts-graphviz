import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { renderToDot } from './renderToDot.js';

/** Runs `fn` with `Object.prototype[key]` set to `value`. */
async function withInherited<T>(
  key: string,
  value: unknown,
  fn: () => Promise<T>,
): Promise<T> {
  const proto = Object.prototype as Record<string, unknown>;
  proto[key] = value;
  try {
    return await fn();
  } finally {
    delete proto[key];
  }
}

const element = (
  <Digraph id="G">
    <Node id="a" />
    <Edge targets={['a', 'b']} />
    <Subgraph id="cluster_s">
      <Node id="c" />
    </Subgraph>
  </Digraph>
);

describe('[SM-8] components read only the props they are given', () => {
  it.each([
    ['comment', 'extra'],
    ['label', 'extra'],
    ['xlabel', 'extra'],
    ['strict', true],
    ['node', { color: 'extra' }],
    ['edge', { color: 'extra' }],
    ['graph', { color: 'extra' }],
    ['port', 'extra'],
  ])('ignores an inherited %s', async (key, value) => {
    const clean = await renderToDot(element);
    const dot = await withInherited(key, value, () => renderToDot(element));
    expect(dot).toBe(clean);
  });
});
