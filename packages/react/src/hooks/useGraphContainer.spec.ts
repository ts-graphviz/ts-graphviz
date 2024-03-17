// @vitest-environment jsdom

// Note: In order to suppress warnings during test execution, pure.js is imported.
import { renderHook } from '@testing-library/react/pure.js';
import { Digraph, Graph } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import {
  digraph,
  digraphInSubgraph,
  graph,
  graphInSubgraph,
} from './__tests__/wrapper.js';
import { useGraphContainer } from './useGraphContainer.js';

describe('useGraphContainer', () => {
  describe('get root cluster', () => {
    test('returns Diagram instance in digraph wrapper', () => {
      const { result } = renderHook(() => useGraphContainer(), {
        wrapper: digraph(),
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });

    test('returns Graph instance in graph wrapper', () => {
      const { result } = renderHook(() => useGraphContainer(), {
        wrapper: graph(),
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Graph instance in graphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useGraphContainer(), {
        wrapper: graphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Graph);
    });

    test('returns Digraph instance in digraphInSubgraph wrapper', () => {
      const { result } = renderHook(() => useGraphContainer(), {
        wrapper: digraphInSubgraph(),
      });
      expect(result.current).toBeInstanceOf(Digraph);
    });
  });
});
