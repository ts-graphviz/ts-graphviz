import { Node } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';

import { useNode } from '../use-node';
import { digraph } from './utils/wrapper';

describe('useNode', () => {
  it('returns Node instance', () => {
    const { result } = renderHook(() => useNode('hoge'), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Node);
  });
});
