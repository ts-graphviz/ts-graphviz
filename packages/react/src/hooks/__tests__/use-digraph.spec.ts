import { Digraph } from '@ts-graphviz/model';
import { renderHook } from '@testing-library/react-hooks';
import { context } from './utils/wrapper';
import { useDigraph } from '../use-digraph';

describe('useDigraph', () => {
  it('returns Digraph instance', () => {
    const { result } = renderHook(() => useDigraph(), {
      wrapper: context(),
    });
    expect(result.current).toBeInstanceOf(Digraph);
  });
});
