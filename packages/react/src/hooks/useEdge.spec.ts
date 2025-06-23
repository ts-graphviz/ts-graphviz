// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { Edge, type EdgeTargetLikeTuple } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { digraph, graph } from './__tests__/wrapper.js';
import { useEdge } from './useEdge.js';

describe('useEdge', () => {
  it('should create Edge instance with simple targets in digraph', () => {
    const { result } = renderHook(() => useEdge(['a', 'b']), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('should create Edge instance with grouped targets in digraph', () => {
    const { result } = renderHook(() => useEdge(['a', ['b1', 'b2'], 'c']), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('should create Edge instance with simple targets in graph', () => {
    const { result } = renderHook(() => useEdge(['a', 'b']), {
      wrapper: graph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('should create Edge instance with grouped targets in graph', () => {
    const { result } = renderHook(() => useEdge(['a', ['b1', 'b2'], 'c']), {
      wrapper: graph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('should throw error when edge has fewer than 2 targets', () => {
    expect(() => {
      renderHook(() => useEdge(['a'] as any as EdgeTargetLikeTuple), {
        wrapper: graph(),
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Edges must have at least 2 targets.]`,
    );
  });
});
