import { renderHook } from '@testing-library/react-hooks';
import { Graph } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { useGraph } from '../use-graph.js';
import { context } from './utils/wrapper.js';

describe('useGraph', () => {
  it('returns Graph instance', () => {
    const { result } = renderHook(() => useGraph(), {
      wrapper: context(),
    });
    expect(result.current).toBeInstanceOf(Graph);
  });
});
