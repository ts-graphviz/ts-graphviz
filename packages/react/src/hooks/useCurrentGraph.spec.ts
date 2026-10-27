// @vitest-environment jsdom
// Note: In order to suppress warnings during test execution, pure.js is imported.
import { renderHook } from '@testing-library/react/pure.js';
import { Digraph, Graph, Subgraph } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import {
  digraph,
  digraphInSubgraph,
  graph,
  graphInSubgraph,
} from './__tests__/wrapper.js';
import { useCurrentGraph } from './useCurrentGraph.js';

describe('useCurrentGraph', () => {
  describe('get parent cluster', () => {
    test('should return Digraph instance when inside digraph wrapper', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: digraph(),
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });

    test('should return Graph instance when inside graph wrapper', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: graph(),
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('should return Subgraph instance when inside nested graph subgraph', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: graphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });

    test('should return Subgraph instance when inside nested digraph subgraph', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: digraphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });
  });

  test('should throw error when called outside any graph context', () => {
    // The hook throws a plain Error (no code): its message names the hook.
    expect(() => {
      renderHook(() => useCurrentGraph());
    }).toThrow(/useCurrentGraph must be called within a cluster/);
  });
});
