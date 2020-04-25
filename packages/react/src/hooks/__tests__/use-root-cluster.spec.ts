import { Digraph, Graph } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';
import { digraph, graph, graphInSubgraph, digraphInSubgraph } from './utils/wrapper';
import { useRootCluster } from '../use-root-cluster';

describe('useRootCluster', () => {
  describe('get root cluster', () => {
    test('returns Diagram instance in digraph wrapper', () => {
      const { result } = renderHook(() => useRootCluster(), {
        wrapper: digraph,
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });

    test('returns Graph instance in graph wrapper', () => {
      const { result } = renderHook(() => useRootCluster(), {
        wrapper: graph,
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Graph instance in graphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useRootCluster(), {
        wrapper: graphInSubgraph,
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Digraph instance in digraphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useRootCluster(), {
        wrapper: digraphInSubgraph,
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });
  });
});
