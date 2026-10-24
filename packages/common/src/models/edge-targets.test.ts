import { describe, expect, it } from 'vitest';
import { isCompass, toNodeRef } from './edge-targets.js';

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
