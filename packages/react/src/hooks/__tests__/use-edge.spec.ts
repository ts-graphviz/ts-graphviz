import { Edge, EdgeTargetTuple } from '@ts-graphviz/model';
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

  it('returns an Edge instance in a digraph wrapper for grouped edge targets', () => {
    const { result } = renderHook(() => useEdge({ targets: ['a', ['b1', 'b2'], 'c'] }), {
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

  it('returns an Edge instance in a graph wrapper for grouped edge targets', () => {
    const { result } = renderHook(() => useEdge({ targets: ['a', ['b1', 'b2'], 'c'] }), {
      wrapper: graph(),
    });
    expect(result.current).toBeInstanceOf(Edge);
  });

  test('throw error if the target is less than 2', () => {
    const { result } = renderHook(() => useEdge({ targets: ['a'] as unknown as EdgeTargetTuple }), {
      wrapper: graph(),
    });
    expect(result.error).toStrictEqual(Error(EdgeTargetLengthErrorMessage));
  });
});
