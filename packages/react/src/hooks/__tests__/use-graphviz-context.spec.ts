import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, test } from 'vitest';
import { NoGraphvizContextErrorMessage } from '../../errors.js';
import { useGraphvizContext } from '../use-graphviz-context.js';
import { context } from './utils/wrapper.js';

describe('useGraphvizContext', () => {
  test('returns {}', () => {
    const { result } = renderHook(() => useGraphvizContext(), {
      wrapper: context(),
    });
    expect(result.current).toStrictEqual({});
  });

  test('An error occurs when called outside the GraphvizContext', () => {
    const { result } = renderHook(() => useGraphvizContext());
    expect(result.error).toStrictEqual(Error(NoGraphvizContextErrorMessage));
  });
});
