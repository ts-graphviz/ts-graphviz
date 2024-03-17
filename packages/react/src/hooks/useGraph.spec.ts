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
  });
});
