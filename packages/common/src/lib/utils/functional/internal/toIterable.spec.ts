import { describe, expect, it } from 'vitest';
import { toIterable } from './toIterable.js';

describe('toIterable', () => {
  it('should return an object with Symbol.iterator property set to the provided function', () => {
    const iteratorFn = function* () {
      yield 1;
      yield 2;
      yield 3;
    };

    const iterable = toIterable(iteratorFn);

    expect(typeof iterable).toBe('object');
    expect(typeof iterable[Symbol.iterator]).toBe('function');
    expect([...iterable]).toEqual([1, 2, 3]);
  });
});
