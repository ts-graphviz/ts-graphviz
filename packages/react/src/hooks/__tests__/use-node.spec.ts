import { renderHook } from '@testing-library/react-hooks';
import { Node } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

import { useNode } from '../use-node.js';
import { digraph } from './utils/wrapper.js';

describe('useNode', () => {
  it('returns Node instance', () => {
    const { result } = renderHook(() => useNode('hoge'), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Node);
  });
});
