import { describe, expect, it } from 'vitest';
import { map } from './map.js';

describe('map', () => {
  it('should map a list of values', () => {
    expect(map((n: number) => n * 2)([1, 2, 3])).toEqual([2, 4, 6]);
  });
});
