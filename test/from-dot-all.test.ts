import { isTsGraphvizError } from '@ts-graphviz/common';
import { fromDot, fromDotAll } from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';

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

  it('fromDot still reads one graph, and fragments without a deprecation report', () => {
    const emit = vi
      .spyOn(process, 'emitWarning')
      .mockImplementation(() => undefined);
    try {
      expect(fromDot('digraph G { a }').id).toBe('G');
      expect(
        fromDot('a [color=red]', { parse: { startRule: 'Node' } }).id,
      ).toBe('a');
      expect(emit).not.toHaveBeenCalled();
    } finally {
      emit.mockRestore();
    }
  });
});
