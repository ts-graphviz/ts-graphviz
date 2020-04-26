import { Edge } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';
import { useEdge } from '../use-edge';
import { digraph, graph } from './utils/wrapper';
import { EdgeTargetLengthErrorMessage } from '../../utils/errors';

describe('useEdge', () => {
  it('returns Edge instance in digraph wrapper', () => {
    const { result } = renderHook(() => useEdge({ targets: ['a', 'b'] }), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  it('returns Edge instance in graph wrapper', () => {
    const { result } = renderHook(() => useEdge({ targets: ['a', 'b'] }), {
      wrapper: graph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  test('throw error if the target is less than 2', () => {
    const { result } = renderHook(() => useEdge({ targets: ['a'] }), {
      wrapper: graph(),
    });
    expect(result.error).toStrictEqual(Error(EdgeTargetLengthErrorMessage));
  });
});
