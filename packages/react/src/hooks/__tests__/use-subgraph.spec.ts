import { Subgraph } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';
import { digraph, graph, graphInSubgraph, digraphInSubgraph } from './utils/wrapper';
import { useSubgraph } from '../use-subgraph';

describe('useSubgraph', () => {
  it('returns Subgraph instance in digraph warper', () => {
    const { result } = renderHook(() => useSubgraph(), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Subgraph);
  });

  it('returns Subgraph instance in graph warper', () => {
    const { result } = renderHook(() => useSubgraph(), {
      wrapper: graph(),
    });
    expect(result.current).toBeInstanceOf(Subgraph);
  });

  it('returns Subgraph instance in graphInSubgraph warper', () => {
    const { result } = renderHook(() => useSubgraph(), {
      wrapper: graphInSubgraph(),
    });
    expect(result.current).toBeInstanceOf(Subgraph);
  });

  it('returns Subgraph instance in digraphInSubgraph warper', () => {
    const { result } = renderHook(() => useSubgraph(), {
      wrapper: digraphInSubgraph(),
    });
    expect(result.current).toBeInstanceOf(Subgraph);
  });
});
