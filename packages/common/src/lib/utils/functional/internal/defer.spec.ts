import { describe, expect, it, vi } from 'vitest';
import { defer } from './defer.js';

describe('defer', () => {
  it('should return a function that defers the execution of the original function', () => {
    const originalFn = vi.fn((arg1: string, arg2: number) => {
      return `${arg1} ${arg2}`;
    });

    const deferredFn = defer(originalFn);
    const result = deferredFn(1)('Hello');
    expect(result).toBe('Hello 1');
  });
});
