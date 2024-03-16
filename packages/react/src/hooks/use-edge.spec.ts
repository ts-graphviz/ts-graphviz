import { renderHook } from '@testing-library/react-hooks';
import { Edge, EdgeTargetLikeTuple } from 'ts-graphviz';
import { describe, expect, it, test } from 'vitest';
import { digraph, graph } from './__tests__/wrapper.js';
import { useEdge } from './use-edge.js';

describe('useEdge', () => {
  it('returns Edge instance in digraph wrapper', () => {
    const { result } = renderHook(() => useEdge(['a', 'b']), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('returns an Edge instance in a digraph wrapper for grouped edge targets', () => {
    const { result } = renderHook(() => useEdge(['a', ['b1', 'b2'], 'c']), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('returns Edge instance in graph wrapper', () => {
    const { result } = renderHook(() => useEdge(['a', 'b']), {
      wrapper: graph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('returns an Edge instance in a graph wrapper for grouped edge targets', () => {
    const { result } = renderHook(() => useEdge(['a', ['b1', 'b2'], 'c']), {
      wrapper: graph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  test('throw error if the target is less than 2', () => {
    const { result } = renderHook(
      () => useEdge(['a'] as any as EdgeTargetLikeTuple),
      {
        wrapper: graph(),
      },
    );
    expect(result.error).toMatchInlineSnapshot(
      `[Error: Edges must have at least 2 targets.]`,
    );
  });
});
