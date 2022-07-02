import { Digraph, Graph, Subgraph } from '@ts-graphviz/model';
import { renderHook } from '@testing-library/react-hooks';
import { useCluster } from '../use-cluster';
import { digraph, graph, graphInSubgraph, digraphInSubgraph } from './utils/wrapper';
import { NoClusterErrorMessage } from '../../utils/errors';

describe('useCluster', () => {
  describe('get parent cluster', () => {
    test('returns Diagram instance in digraph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: digraph(),
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });

    test('returns Graph instance in graph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: graph(),
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Subgraph instance in graphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: graphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });

    test('returns Subgraph instance in digraphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useCluster(), {
        wrapper: digraphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Subgraph);
    });
  });

  test('An error occurs when called outside the cluster', () => {
    const { result } = renderHook(() => useCluster());
    expect(result.error).toStrictEqual(Error(NoClusterErrorMessage));
  });
});
