import { describe, expect, it } from 'vitest';
import { filter } from './filter.js';

describe('filter', () => {
  it('should filter a list of values', () => {
    expect(filter((n: number) => n % 2 === 0)([1, 2, 3])).toEqual([2]);
  });
});
