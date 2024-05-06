import { describe, expect, it } from 'vitest';
import { pipe } from './pipe.js';

describe('pipe', () => {
  const double = (n: number): number => n * 2;
  const addFive = (n: number): number => n + 5;
  const substractOne = (n: number): number => n - 1;

  it('should pipe functions', () => {
    expect(pipe(double, addFive, substractOne)(2)).toEqual(8);
  });
});
