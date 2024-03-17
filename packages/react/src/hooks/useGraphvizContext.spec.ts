// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { context } from './__tests__/wrapper.js';
import { useGraphvizContext } from './useGraphvizContext.js';

describe('useGraphvizContext', () => {
  test('returns {}', () => {
    const { result } = renderHook(() => useGraphvizContext(), {
      wrapper: context(),
    });
    expect(result.current).toStrictEqual({});
  });

  test('An error occurs when called outside the GraphvizContext', () => {
    expect(() => {
      renderHook(() => useGraphvizContext(), {
        // Don't use context() here
        // wrapper: context(),
      });
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cannot call useGraphvizContext outside GraphvizContext.
      Basically, you need to use the render function provided by @ts-graphviz/react.]
    `);
  });
});
