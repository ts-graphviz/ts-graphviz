import { filter, map, pipe } from './functional.js';

describe('pipe', () => {
  const double = (n: number): number => n * 2;
  const addFive = (n: number): number => n + 5;
  const substractOne = (n: number): number => n - 1;

  it('should pipe functions', () => {
    expect(pipe(double, addFive, substractOne)(2)).toEqual(8);
  });
});

describe('map', () => {
  it('should map a list of values', () => {
    expect(map((n: number) => n * 2)([1, 2, 3])).toEqual([2, 4, 6]);
  });
});

describe('filter', () => {
  it('should filter a list of values', () => {
    expect(filter((n: number) => n % 2 === 0)([1, 2, 3])).toEqual([2]);
  });
});
