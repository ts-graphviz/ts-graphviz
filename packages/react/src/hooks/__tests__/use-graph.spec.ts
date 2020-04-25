import { Graph } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';
import { context as wrapper } from './utils/wrapper';
import { useGraph } from '../use-graph';

describe('useGraph', () => {
  it('returns Graph instance', () => {
    const { result } = renderHook(() => useGraph(), {
      wrapper,
    });
    expect(result.current).toBeInstanceOf(Graph);
  });
});
