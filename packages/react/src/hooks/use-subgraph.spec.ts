import { renderHook } from '@testing-library/react-hooks';
import { Subgraph } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import {
  digraph,
  digraphInSubgraph,
  graph,
  graphInSubgraph,
} from './__tests__/wrapper.js';
import { useSubgraph } from './use-subgraph.js';

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
