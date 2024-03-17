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
    test('returns Diagram instance in digraph wrapper', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: digraph(),
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });

    test('returns Graph instance in graph wrapper', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: graph(),
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Subgraph instance in graphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: graphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });

    test('returns Subgraph instance in digraphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCurrentGraph(), {
        wrapper: digraphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });
  });

  test('An error occurs when called outside the cluster', () => {
    try {
      expect(() => {
        renderHook(() => useCurrentGraph());
      }).toThrowErrorMatchingInlineSnapshot(
        `[Error: useCluster must be called within a cluster such as Digraph, Graph, Subgraph.]`,
      );
    } catch (e) {
      console.error(e);
    }
  });
});
