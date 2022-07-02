import { Graph } from '@ts-graphviz/model';
import { renderHook } from '@testing-library/react-hooks';
import { context } from './utils/wrapper';
import { useGraph } from '../use-graph';

describe('useGraph', () => {
  it('returns Graph instance', () => {
    const { result } = renderHook(() => useGraph(), {
      wrapper: context(),
    });
    expect(result.current).toBeInstanceOf(Graph);
  });
});
