import { registerDefault } from '@ts-graphviz/core';
import { beforeAll, describe, expect, it } from 'vitest';
import { ASTNodeCountExceededError } from '../../builder/errors.js';
import { fromModel } from './from-model.js';

beforeAll(() => {
  registerDefault();
});

describe('fromModel', () => {
  it('should not accumulate node count across repeated calls', async () => {
    const { Digraph } = await import('@ts-graphviz/core');

    // Each call creates a small graph with ~10 AST nodes.
    // 200 calls * ~10 nodes = ~2000 total, but the default limit is 100,000 per call.
    // Without the fix, the singleton builder would accumulate to > 100,000 eventually.
    for (let i = 0; i < 200; i++) {
      const g = new Digraph();
      g.createNode(`n${i}`);
      fromModel(g);
    }
  });

  it('should throw when a single conversion exceeds maxASTNodes', async () => {
    const { Digraph } = await import('@ts-graphviz/core');
    const g = new Digraph();
    // Each node creates ~3 AST nodes (Node + Literal for id + children)
    for (let i = 0; i < 10; i++) {
      g.createNode(`node${i}`);
    }

    // With a very small limit, a single conversion should throw
    expect(() => fromModel(g, { maxASTNodes: 5 })).toThrow(
      ASTNodeCountExceededError,
    );
  });

  it('should respect maxASTNodes option', async () => {
    const { Digraph } = await import('@ts-graphviz/core');
    const g = new Digraph();
    g.createNode('a');

    // Large enough limit should work
    expect(() => fromModel(g, { maxASTNodes: 1000 })).not.toThrow();
  });
});
