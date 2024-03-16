import { renderHook } from '@testing-library/react-hooks';
import { Node } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

import { digraph } from './__tests__/wrapper.js';
import { useNode } from './use-node.js';

describe('useNode', () => {
  it('returns Node instance', () => {
    const { result } = renderHook(() => useNode('hoge'), {
      wrapper: digraph(),
    });
    expect(result.current).toBeInstanceOf(Node);
  });
});
