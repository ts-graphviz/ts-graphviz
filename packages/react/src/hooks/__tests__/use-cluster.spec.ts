import { Digraph, Graph, Subgraph } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';
import { useCluster } from '../use-cluster';
import { digraph, graph, graphInSubgraph, digraphInSubgraph } from './utils/wrapper';

describe('useCluster', () => {
  describe('get parent cluster', () => {
    test('returns Diagram instance in digraph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: digraph,
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });

    test('returns Graph instance in graph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: graph,
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Subgraph instance in graphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: graphInSubgraph,
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });

    test('returns Subgraph instance in digraphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: digraphInSubgraph,
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });
  });
});
