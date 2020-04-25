import { Digraph } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';
import { context as wrapper } from './utils/wrapper';
import { useDigraph } from '../use-digraph';

describe('useDigraph', () => {
  it('returns Digraph instance', () => {
    const { result } = renderHook(() => useDigraph(), {
      wrapper,
    });
    expect(result.current).toBeInstanceOf(Digraph);
  });
});
