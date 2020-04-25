import { Node } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';

import { useNode } from '../use-node';
import { digraph as wrapper } from './utils/wrapper';

describe('useNode', () => {
  it('returns Node instance', () => {
    const { result } = renderHook(() => useNode({ id: 'hoge' }), {
      wrapper,
    });
    expect(result.current).toBeInstanceOf(Node);
  });
});
