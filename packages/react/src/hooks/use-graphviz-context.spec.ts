import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, test } from 'vitest';
import { context } from './__tests__/wrapper.js';
import { useGraphvizContext } from './use-graphviz-context.js';

describe('useGraphvizContext', () => {
  test('returns {}', () => {
    const { result } = renderHook(() => useGraphvizContext(), {
      wrapper: context(),
    });
    expect(result.current).toStrictEqual({});
  });

  test('An error occurs when called outside the GraphvizContext', () => {
    const { result } = renderHook(() => useGraphvizContext());
    expect(result.error).toMatchInlineSnapshot(`
      [Error: Cannot call useGraphvizContext outside GraphvizContext.
      Basically, you need to use the render function provided by @ts-graphviz/react.]
    `);
  });
});
