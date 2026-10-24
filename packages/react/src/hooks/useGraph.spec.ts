// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { Graph } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { context } from './__tests__/wrapper.js';
import { useGraph } from './useGraph.js';

describe('useGraph', () => {
  it('returns Graph instance', () => {
    const { result } = renderHook(() => useGraph(), {
      wrapper: context(),
    });
    expect(result.current).toBeInstanceOf(Graph);
    expect(result.current.strict).toBe(false);
  });

  it('passes id and strict to the model', () => {
    const { result } = renderHook(() => useGraph({ id: 'G', strict: true }), {
      wrapper: context(),
    });
    expect(result.current.id).toBe('G');
    expect(result.current.strict).toBe(true);
  });

  it('creates the graph with the Graph class of the GraphvizContext', () => {
    class MyGraph extends Graph {}
    const { result } = renderHook(() => useGraph(), {
      wrapper: context({ models: { Graph: MyGraph } }),
    });
    expect(result.current).toBeInstanceOf(MyGraph);
  });
});
