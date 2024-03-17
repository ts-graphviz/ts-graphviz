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
  });
});
