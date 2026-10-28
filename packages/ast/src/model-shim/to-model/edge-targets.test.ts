import { isTsGraphvizError } from '@ts-graphviz/common';
import { defaultModelsContext } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { parse } from '../../dot-shim/parser/parse.js';
import type { DotASTNode } from '../../types.js';
import { toModel } from './to-model.js';

/** `subgraph s { nI } -> x` repeated: each edge reaches all nodes so far. */
const reopened = (edges: number) =>
  parse(
    `digraph { ${Array.from({ length: edges }, (_, i) => `subgraph s { n${i} } -> x;`).join(' ')} }`,
    { maxASTNodes: 0 },
  ) as DotASTNode;

const convert = (ast: DotASTNode, maxEdgeTargets?: number) =>
  toModel(ast, { models: defaultModelsContext(), maxEdgeTargets });

describe('maxEdgeTargets', { tags: ['SM-1'] }, () => {
  it('stops edges to a reopened subgraph from growing without bound', () => {
    // 2000 edges reach 2 001 000 nodes in all (90 MB before; 4000 took 300 MB).
    let error: unknown;
    try {
      convert(reopened(2000));
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(RangeError);
    expect(isTsGraphvizError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED' });
  });

  it('counts the node references of all edges to subgraphs', () => {
    // 1 + 2 + … + 10 = 55
    expect(() => convert(reopened(10), 55)).not.toThrow();
    expect(() => convert(reopened(10), 54)).toThrow(RangeError);
    expect(() => convert(reopened(10), 0)).not.toThrow();
  });

  it('still reaches every node of a reopened subgraph', () => {
    const dot = convert(reopened(3));
    const edges = dot.graphs[0].edges;
    expect(edges.map((e) => e.targets[0])).toStrictEqual([
      [{ id: 'n0' }],
      [{ id: 'n0' }, { id: 'n1' }],
      [{ id: 'n0' }, { id: 'n1' }, { id: 'n2' }],
    ]);
  });

  it.each([Number.NaN, -1, '5' as never])(
    'keeps the default limit for maxEdgeTargets %s',
    (maxEdgeTargets) => {
      expect(() => convert(reopened(2000), maxEdgeTargets)).toThrow(RangeError);
    },
  );
});
