import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type {
  ClusterStatementASTNode,
  DotASTNode,
  EdgeASTNode,
  NodeASTNode,
} from '../../types.js';
import { DotSyntaxError, parse, parseLegacy, type Rule } from './parse.js';

const fragments: [Rule, string][] = [
  ['Dot', 'digraph { a }'],
  ['Graph', 'graph G { a -- b }'],
  ['Subgraph', 'subgraph cluster_a { a }'],
  ['Node', 'a [color=red]'],
  ['Edge', 'a -> b [color=red]'],
  ['AttributeList', 'node [shape=box]'],
  ['Attribute', 'rankdir=LR'],
  ['ClusterStatements', 'a; b -> c; rank=same'],
];

describe('parse with a rule', () => {
  it.each(fragments)(
    'reads a %s as the deprecated parseLegacy does',
    (rule, dot) => {
      expect(parse(dot, rule)).toStrictEqual(
        parseLegacy(dot, { startRule: rule }),
      );
    },
  );

  it('reads a whole DOT source without a rule', () => {
    expect(parse('digraph { a }')).toStrictEqual(parse('digraph { a }', 'Dot'));
  });

  it('types the result by rule', () => {
    expectTypeOf(parse('digraph {}')).toEqualTypeOf<DotASTNode>();
    expectTypeOf(
      parse('digraph {}', { maxASTNodes: 10 }),
    ).toEqualTypeOf<DotASTNode>();
    // A type error only (it would throw at run time): 3.x's startRule is
    // parseLegacy's.
    // @ts-expect-error not an option of parse
    void (() => parse('a', { startRule: 'Node' }));
    expectTypeOf(parse('a', 'Node')).toEqualTypeOf<NodeASTNode>();
    expectTypeOf(parse('a -> b', 'Edge')).toEqualTypeOf<EdgeASTNode>();
    expectTypeOf(parse('a', 'ClusterStatements')).toEqualTypeOf<
      ClusterStatementASTNode[]
    >();
    expectTypeOf(
      parseLegacy('a', { startRule: 'Node' }),
    ).toEqualTypeOf<NodeASTNode>();
  });

  it('applies the parser limits', () => {
    expect(() =>
      parse('a; b; c', 'ClusterStatements', { maxASTNodes: 2 }),
    ).toThrow(DotSyntaxError);
  });

  it('rejects input that is not the fragment', () => {
    expect(() => parse('digraph { a }', 'Edge')).toThrow(DotSyntaxError);
  });

  it('reads a whole DOT source with the options as the second argument', () => {
    expect(parse('digraph { a }', { maxASTNodes: 100 })).toStrictEqual(
      parse('digraph { a }'),
    );
    expect(() => parse('digraph { a; b; c }', { maxASTNodes: 2 })).toThrow(
      DotSyntaxError,
    );
  });

  it.each([
    ['3.x options', [{ startRule: 'Node' }]],
    ['null', [null]],
    ['a number', [1]],
    ['options twice', [{}, {}]],
    ['a rule that is not a grammar rule', ['Statement']],
    ['3.x options with startRule undefined', [{ startRule: undefined }]],
    ['startRule among the third argument', ['Dot', { startRule: 'Edge' }]],
    [
      'prototype-less 3.x options',
      [Object.assign(Object.create(null), { startRule: 'Node' })],
    ],
  ])('rejects %s, pointing to parseLegacy', (_, args) => {
    expect(() =>
      (parse as (input: string, ...rest: unknown[]) => unknown)('a', ...args),
    ).toThrow(
      expect.objectContaining({
        name: 'TypeError',
        code: 'TSG_ERR_INVALID_PARSE_ARGUMENTS',
        message: expect.stringContaining('parseLegacy'),
      }),
    );
  });

  it('ignores a startRule or limits inherited by the options', () => {
    const inherited = Object.create({ startRule: 'Node', maxASTNodes: 1 });
    expect(parse('digraph { a; b }', inherited)).toStrictEqual(
      parse('digraph { a; b }'),
    );
    expect(parse('a', 'Node', inherited)).toStrictEqual(parse('a', 'Node'));
  });

  it('takes prototype-less options', () => {
    const options = Object.assign(Object.create(null), { maxASTNodes: 2 });
    expect(() => parse('digraph { a; b; c }', options)).toThrow(DotSyntaxError);
  });

  it('types a union of rules as the union of their results', () => {
    const rule = 'Node' as 'Node' | 'Edge';
    expectTypeOf(parse('a', rule)).toEqualTypeOf<NodeASTNode | EdgeASTNode>();
    expectTypeOf(parseLegacy('digraph {}')).toEqualTypeOf<DotASTNode>();
    expectTypeOf(parseLegacy('digraph {}', {})).toEqualTypeOf<DotASTNode>();
    expectTypeOf(
      parseLegacy('a -> b', { startRule: 'Edge' }),
    ).toEqualTypeOf<EdgeASTNode>();
  });

  it('reports parseLegacy once, and parse never', async () => {
    vi.resetModules();
    const fresh = await import('./parse.js');
    const emit = vi
      .spyOn(process, 'emitWarning')
      .mockImplementation(() => undefined);
    try {
      fresh.parse('a -> b', 'Edge');
      fresh.parse('digraph { a }');
      expect(emit).not.toHaveBeenCalled();
      fresh.parseLegacy('a -> b', { startRule: 'Edge' });
      fresh.parseLegacy('digraph { a }');
      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0][1]).toStrictEqual({
        type: 'DeprecationWarning',
        code: 'TSG_DEP_PARSE_LEGACY',
      });
    } finally {
      emit.mockRestore();
    }
  });
});
