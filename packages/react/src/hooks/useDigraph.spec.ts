// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { Digraph } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { context } from './__tests__/wrapper.js';
import { useDigraph } from './useDigraph.js';

describe('useDigraph', () => {
  it('returns Digraph instance', () => {
    const { result } = renderHook(() => useDigraph(), {
      wrapper: context(),
    });
    expect(result.current).toBeInstanceOf(Digraph);
  });

  it('reads own options, enumerable or not, and nothing inherited', () => {
    const proto = Object.prototype as Record<string, unknown>;
    proto.comment = 'extra';
    try {
      const options = Object.defineProperty({}, 'id', { value: 'G' });
      const { result } = renderHook(() => useDigraph(options), {
        wrapper: context(),
      });
      expect(result.current.id).toBe('G');
      expect(result.current.comment).toBeUndefined();
    } finally {
      delete proto.comment;
    }
  });
});
