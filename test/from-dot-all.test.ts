import { isTsGraphvizError } from '@ts-graphviz/common';
import { type FromDotOptions, fromDot, fromDotAll } from 'ts-graphviz';
import * as legacy from 'ts-graphviz/legacy';
import { describe, expect, it } from 'vitest';

describe('fromDot and fromDotAll with several graphs', () => {
  const two = 'digraph a { x } graph b { y }';

  it('fromDot refuses a source with more than one graph instead of dropping the rest', () => {
    let error: unknown;
    try {
      fromDot(two);
    } catch (e) {
      error = e;
    }
    expect(isTsGraphvizError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'TSG_ERR_MULTIPLE_GRAPHS' });
    expect((error as Error).message).toContain('fromDotAll');
  });

  it('fromDotAll returns every graph, in order', () => {
    const graphs = fromDotAll(two);
    expect(graphs.map((g) => [g.id, g.directed])).toEqual([
      ['a', true],
      ['b', false],
    ]);
    expect(graphs[1].getNode('y')).toBeDefined();
    expect(fromDotAll('// nothing')).toEqual([]);
  });

  it('fromDot still reads one graph, and fragments', () => {
    expect(fromDot('digraph G { a }').id).toBe('G');
    expect(fromDot('a [color=red]', { parse: { startRule: 'Node' } }).id).toBe(
      'a',
    );
  });

  it('fromDotAll ignores a startRule that options shared with fromDot carry', () => {
    const options: FromDotOptions<'Dot'> = {
      parse: { startRule: 'Dot', maxASTNodes: 100 },
    };
    expect(fromDotAll('digraph A {} digraph B {}', options)).toHaveLength(2);
    expect(
      legacy.fromDotAll('digraph A {} digraph B {}', options),
    ).toHaveLength(2);
    expect(() =>
      fromDotAll('digraph { a; b; c }', {
        parse: {
          startRule: 'Dot',
          maxASTNodes: 2,
        } as FromDotOptions<'Dot'>['parse'],
      }),
    ).toThrow(expect.objectContaining({ code: 'TSG_ERR_DOT_SYNTAX' }));
  });
});
