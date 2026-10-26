import { defaultModelsContext } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { DotSyntaxError, parse } from './dot-shim/parser/parse.js';
import { toModel } from './model-shim/to-model/to-model.js';
import type { DotASTNode } from './types.js';

// Values a limit option cannot use: each keeps the default limit.
const unusable = [Number.NaN, -1, '5' as never];

const nested = (depth: number) =>
  `digraph { ${'subgraph { a; '.repeat(depth - 1)}${'}'.repeat(depth - 1)} }`;
// The HTML limit counts nested angle brackets.
const html = (depth: number) =>
  `digraph { a [label=${'<'.repeat(depth)}x${'>'.repeat(depth)}] }`;
const chain = (length: number) =>
  `digraph { ${Array.from({ length }, (_, i) => `n${i}`).join(' -> ')} }`;
const reopened = (edges: number) =>
  parse(
    `digraph { ${Array.from({ length: edges }, (_, i) => `subgraph s { n${i} } -> x;`).join(' ')} }`,
    { maxASTNodes: 0 },
  ) as DotASTNode;

describe('[SM-1] limit options that cannot be used keep the default', () => {
  describe.each([
    [
      'maxNestingDepth',
      nested(101),
      nested(5),
      [...unusable, Number.POSITIVE_INFINITY],
    ],
    [
      'maxHtmlNestingDepth',
      html(101),
      html(5),
      [...unusable, Number.POSITIVE_INFINITY],
    ],
    [
      'maxEdgeChainDepth',
      chain(1002),
      chain(5),
      [...unusable, Number.POSITIVE_INFINITY],
    ],
  ] as const)('%s', (option, tooDeep, small, values) => {
    it.each(values)('%s', (value) => {
      expect(() => parse(tooDeep, { [option]: value })).toThrow(DotSyntaxError);
      expect(() => parse(small, { [option]: value })).not.toThrow();
    });
  });

  it.each(unusable)('maxASTNodes %s', (value) => {
    // 100 001 nodes are over the default; a few are not.
    const many = `digraph { ${'a;'.repeat(100_001)} }`;
    expect(() => parse(many, { maxASTNodes: value })).toThrow(DotSyntaxError);
    expect(() => parse('digraph { a }', { maxASTNodes: value })).not.toThrow();
  });

  it.each(unusable)('maxInputSize %s', (value) => {
    const large = `digraph { a [label="${'x'.repeat(10 * 1024 * 1024)}"] }`;
    expect(() => parse(large, { maxInputSize: value })).toThrow(DotSyntaxError);
    expect(() => parse('digraph { a }', { maxInputSize: value })).not.toThrow();
  });

  it.each(unusable)('maxEdgeTargets %s', (value) => {
    const convert = (ast: DotASTNode) =>
      toModel(ast, { models: defaultModelsContext(), maxEdgeTargets: value });
    expect(() => convert(reopened(2000))).toThrow(RangeError);
    expect(() => convert(reopened(10))).not.toThrow();
  });

  it('maxEdgeTargets 0 or Infinity disables that limit', () => {
    for (const maxEdgeTargets of [0, Number.POSITIVE_INFINITY]) {
      expect(() =>
        toModel(reopened(2000), {
          models: defaultModelsContext(),
          maxEdgeTargets,
        }),
      ).not.toThrow();
    }
  });
});
