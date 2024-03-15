import { renderHook } from '@testing-library/react-hooks';
import { Digraph } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { useDigraph } from '../use-digraph.js';
import { context } from './utils/wrapper.js';

describe('useDigraph', () => {
  it('returns Digraph instance', () => {
    const { result } = renderHook(() => useDigraph(), {
      wrapper: context(),
    });
    expect(result.current).toBeInstanceOf(Digraph);
  });
});
