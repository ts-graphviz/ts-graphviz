// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { Digraph } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { context } from './__tests__/wrapper.js';
import { useDigraph } from './useDigraph.js';

describe('useDigraph', () => {
  it('returns Digraph instance', () => {
    const { result } = renderHook(() => useDigraph(), {
      wrapper: context(),
    });
    expect(result.current).toBeInstanceOf(Digraph);
    expect(result.current.strict).toBe(false);
  });

  it('passes id and strict to the model', () => {
    const { result } = renderHook(() => useDigraph({ id: 'G', strict: true }), {
      wrapper: context(),
    });
    expect(result.current.id).toBe('G');
    expect(result.current.strict).toBe(true);
  });

  it('creates the graph with the Digraph class of the GraphvizContext', () => {
    class MyDigraph extends Digraph {}
    const { result } = renderHook(() => useDigraph(), {
      wrapper: context({ models: { Digraph: MyDigraph } }),
    });
    expect(result.current).toBeInstanceOf(MyDigraph);
  });
});
