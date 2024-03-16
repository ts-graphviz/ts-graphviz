import { renderHook } from '@testing-library/react-hooks';
import { Digraph, Graph, Subgraph } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import {
  digraph,
  digraphInSubgraph,
  graph,
  graphInSubgraph,
} from './__tests__/wrapper.js';
import { useCurrentCluster } from './use-current-cluster.js';

describe('useCurrentCluster', () => {
  describe('get parent cluster', () => {
    test('returns Diagram instance in digraph wrapper', () => {
      const { result } = renderHook(() => useCurrentCluster(), {
        wrapper: digraph(),
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });

    test('returns Graph instance in graph wrapper', () => {
      const { result } = renderHook(() => useCurrentCluster(), {
        wrapper: graph(),
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Subgraph instance in graphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCurrentCluster(), {
        wrapper: graphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });

    test('returns Subgraph instance in digraphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCurrentCluster(), {
        wrapper: digraphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });
  });

  test('An error occurs when called outside the cluster', () => {
    const { result } = renderHook(() => useCurrentCluster());
    expect(result.error).toMatchInlineSnapshot(
      `[Error: useCluster must be called within a cluster such as Digraph, Graph, Subgraph.]`,
    );
  });
});
