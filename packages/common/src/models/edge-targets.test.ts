import { describe, expect, it } from 'vitest';
import {
  isCompass,
  isNodeRef,
  isNodeRefGroupLike,
  isNodeRefLike,
  toNodeRef,
  toNodeRefGroup,
} from './edge-targets.js';

describe('isCompass', () => {
  it.each(['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c', '_'])(
    '%s is a compass point',
    (c) => {
      expect(isCompass(c)).toBe(true);
    },
  );

  it.each(['', 'N', 'north', 'x', 'nx'])('%j is not', (c) => {
    expect(isCompass(c)).toBe(false);
  });
});

describe('toNodeRef with a string (#1688)', () => {
  it('reads id, port and compass point like DOT', () => {
    expect(toNodeRef('a')).toStrictEqual({ id: 'a', port: undefined });
    expect(toNodeRef('a:p')).toStrictEqual({ id: 'a', port: 'p' });
    expect(toNodeRef('a:p:ne')).toStrictEqual({
      id: 'a',
      port: 'p',
      compass: 'ne',
    });
  });

  it('drops a third part that is not a compass point', () => {
    expect(toNodeRef('a:p:north')).toStrictEqual({ id: 'a', port: 'p' });
  });

  it('keeps an empty port', () => {
    expect(toNodeRef('a::')).toStrictEqual({ id: 'a', port: '' });
    expect(toNodeRef('a::n')).toStrictEqual({
      id: 'a',
      port: '',
      compass: 'n',
    });
  });

  it('keeps the compass point _', () => {
    expect(toNodeRef('a:p:_')).toStrictEqual({
      id: 'a',
      port: 'p',
      compass: '_',
    });
  });

  it('reads a lone compass point after the id as the compass point', () => {
    expect(toNodeRef('a:n')).toStrictEqual({ id: 'a', compass: 'n' });
    expect(toNodeRef('a:_')).toStrictEqual({ id: 'a', compass: '_' });
    expect(toNodeRef('a:north')).toStrictEqual({ id: 'a', port: 'north' });
  });

  it('returns an object target unchanged', () => {
    const ref = { id: 'a', port: 'n' };
    expect(toNodeRef(ref)).toBe(ref);
  });
});

describe('isNodeRef and isNodeRefLike', () => {
  it('accept a node model and an object with a string id', () => {
    expect(isNodeRef({ $$type: 'Node', id: 'a' })).toBe(true);
    expect(isNodeRef({ id: 'a' })).toBe(true);
    expect(isNodeRefLike({ id: 'a' })).toBe(true);
  });

  it('isNodeRefLike also accepts any string', () => {
    expect(isNodeRefLike('a:p')).toBe(true);
    expect(isNodeRefLike('')).toBe(true);
    expect(isNodeRef('a')).toBe(false);
  });

  it.each([
    ['an object without id', {}],
    ['an object with a number id', { id: 123 }],
    ['an object with an object id', { id: {} }],
    ['a number', 123],
    ['null', null],
    ['undefined', undefined],
  ])('reject %s', (_, value) => {
    expect(isNodeRef(value)).toBe(false);
    expect(isNodeRefLike(value)).toBe(false);
  });
});

describe('isNodeRefGroupLike', () => {
  it('accepts an array of references, empty or mixed', () => {
    expect(isNodeRefGroupLike(['a', 'b:p:n'])).toBe(true);
    expect(isNodeRefGroupLike([{ id: 'a' }, 'b'])).toBe(true);
    expect(isNodeRefGroupLike([])).toBe(true);
  });

  it('rejects an array with an element that is not a reference', () => {
    expect(isNodeRefGroupLike(['a', 123] as never)).toBe(false);
    expect(isNodeRefGroupLike([{}, 'b'] as never)).toBe(false);
  });

  it('rejects a value that is not an array', () => {
    expect(isNodeRefGroupLike('a')).toBe(false);
    expect(isNodeRefGroupLike({ id: 'a' })).toBe(false);
  });
});

describe('toNodeRefGroup', () => {
  it('converts each target, keeping objects as given', () => {
    const ref = { id: 'x' };
    const group = toNodeRefGroup([ref, 'a', 'b:p', 'c:p:se', 'd::nw']);
    expect(group).toStrictEqual([
      ref,
      { id: 'a', port: undefined },
      { id: 'b', port: 'p' },
      { id: 'c', port: 'p', compass: 'se' },
      { id: 'd', port: '', compass: 'nw' },
    ]);
    expect(group[0]).toBe(ref);
  });

  it.each([
    ['no targets', []],
    ['a target that is not a reference', [123]],
  ])('rejects %s', (_, targets) => {
    expect(() => toNodeRefGroup(targets as never)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_EDGE_TARGETS' }),
    );
  });
});
