import { describe, expect, it } from 'vitest';
import { checkReferences } from './references.js';

describe('checkReferences', { tags: ['SM-2'] }, () => {
  it('walks an AST deeper than the call stack', () => {
    let inner: object = {
      type: 'Node',
      id: { type: 'Literal', value: 'a', kind: 'bare' },
      children: [],
    };
    for (let i = 0; i < 100_000; i++) {
      inner = { type: 'Subgraph', children: [inner] };
    }
    expect(() => checkReferences(inner)).not.toThrow();
  });

  it('finds a node that contains itself deep down', () => {
    const top: { type: string; children: object[] } = {
      type: 'Subgraph',
      children: [],
    };
    let inner = top;
    for (let i = 0; i < 100_000; i++) {
      const next = { type: 'Subgraph', children: [] };
      inner.children.push(next);
      inner = next;
    }
    inner.children.push(top);
    expect(() => checkReferences(top)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_CYCLIC_STRUCTURE' }),
    );
  });

  it('stops at the first value in a list that is not a node', () => {
    // A sparse list of a billion would take seconds to walk; the
    // conversion fails at its first hole anyway.
    const children: unknown[] = [];
    children.length = 1_000_000_000;
    const start = performance.now();
    checkReferences({ type: 'Subgraph', children });
    expect(performance.now() - start).toBeLessThan(100);
  });
});
